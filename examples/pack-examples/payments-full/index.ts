// Minimal Stripe webhook server with signature verification and metrics
// Run: PORT=3003 STRIPE_WEBHOOK_SECRET=whsec_xxx npx tsx examples/pack-examples/payments-full/index.ts
import http from 'node:http';
import Stripe from 'stripe';
import fs from 'node:fs/promises';
import path from 'node:path';

const port = parseInt(process.env.PORT || '3003', 10);
const stripe = new Stripe(process.env.STRIPE_API_KEY || '', { apiVersion: '2024-06-20' as any });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Metrics
let httpRequestsTotal = 0;
let webhookProcessedTotal = 0;
let webhookDuplicateTotal = 0;
let webhookVerifyFailedTotal = 0;
let webhookHandlerErrorsTotal = 0;
const typeCounts: Record<string, number> = {};
const dlq: Array<{ id: string; type: string; payload: any; error?: string }> = [];
const subStatusCounts: Record<string, number> = {};
function metricsText(){
  const lines = [
    '# HELP http_requests_total Total HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total ${httpRequestsTotal}`,
    '# HELP stripe_webhook_processed_total Total processed webhook events',
    '# TYPE stripe_webhook_processed_total counter',
    `stripe_webhook_processed_total ${webhookProcessedTotal}`,
    '# HELP stripe_webhook_duplicate_total Total duplicate webhook events ignored',
    '# TYPE stripe_webhook_duplicate_total counter',
    `stripe_webhook_duplicate_total ${webhookDuplicateTotal}`,
    '# HELP stripe_webhook_verify_failed_total Total webhook signature verification failures',
    '# TYPE stripe_webhook_verify_failed_total counter',
    `stripe_webhook_verify_failed_total ${webhookVerifyFailedTotal}`,
    '# HELP stripe_webhook_handler_errors_total Total webhook handler errors',
    '# TYPE stripe_webhook_handler_errors_total counter',
    `stripe_webhook_handler_errors_total ${webhookHandlerErrorsTotal}`,
  ];
  // Per-type event counters
  lines.push('# HELP stripe_webhook_events_total Total webhook events by type');
  lines.push('# TYPE stripe_webhook_events_total counter');
  for (const [t, v] of Object.entries(typeCounts)){
    lines.push(`stripe_webhook_events_total{type="${t}"} ${v}`);
  }
  // Subscription status counters
  lines.push('# HELP stripe_subscription_status_total Subscription status changes by status');
  lines.push('# TYPE stripe_subscription_status_total counter');
  for (const [s, v] of Object.entries(subStatusCounts)){
    lines.push(`stripe_subscription_status_total{status="${s}"} ${v}`);
  }
  return lines.join('\n') + '\n';
}

// Idempotency store (in-memory)
const handled = new Set<string>();

async function postSlack(text: string, retries = 2){
  const url = process.env.SLACK_WEBHOOK_URL; if (!url) return;
  let lastErr: any;
  for (let i=0;i<=retries;i++){
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
      if (r.ok) return; lastErr = new Error(`slack status ${r.status}`);
    } catch (e){ lastErr = e; }
    await new Promise(r=>setTimeout(r, 300*(i+1)));
  }
  // eslint-disable-next-line no-console
  console.warn('Slack notify failed', lastErr);
}

// Optional email notification via webhook (simple template)
async function notifyCustomerEmail(to: string|undefined, subject: string, body: string){
  const url = process.env.EMAIL_WEBHOOK_URL; if (!url) return;
  try {
    await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to, subject, body }) });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('email notify failed', e);
  }
}

// Basic handler registry (extend per event type)
// Minimal in-memory subscription store (as a stand-in for a DB)
type SubRec = { id: string; status: 'active'|'past_due'|'unpaid'|'canceled'|'trialing'|'incomplete'|'incomplete_expired'; updatedAt: number; customer?: string };
type CustomerRec = { id: string; updatedAt: number };

// Persistence (JSON fallback, optional sqlite if available)
interface SubPersister {
  upsert(rec: SubRec): Promise<void>;
  all(): Promise<SubRec[]>;
  isProcessed?(id: string): Promise<boolean>;
  markProcessed?(id: string, type: string): Promise<void>;
  addAudit?(rec: { type: string; subId?: string; status?: SubRec['status']; customer?: string; at: number }): Promise<void>;
  audits?(limit: number): Promise<Array<{ type: string; subId?: string; status?: SubRec['status']; customer?: string; at: number }>>;
  upsertCustomer?(rec: CustomerRec): Promise<void>;
  allCustomers?(): Promise<CustomerRec[]>;
  txUpsertSubAndCustomer?(sub: SubRec, cust: CustomerRec): Promise<void>;
  addOutbox?(rec: { type: string; payload: any; createdAt: number }): Promise<void>;
  outbox?(limit: number): Promise<Array<{ id?: number; type: string; payload: any; createdAt: number; publishedAt?: number }>>;
  markOutboxPublished?(id: number): Promise<void>;
}

class JsonPersister implements SubPersister {
  constructor(private file: string) {}
  async upsert(rec: SubRec): Promise<void> {
    const dir = path.dirname(this.file);
    await fs.mkdir(dir, { recursive: true });
    let arr: SubRec[] = [];
    try { const raw = await fs.readFile(this.file, 'utf8'); arr = JSON.parse(raw) as SubRec[]; } catch {}
    const idx = arr.findIndex(r=>r.id===rec.id);
    if (idx>=0) arr[idx] = rec; else arr.push(rec);
    await fs.writeFile(this.file, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  async all(): Promise<SubRec[]> {
    try { const raw = await fs.readFile(this.file, 'utf8'); return JSON.parse(raw) as SubRec[]; } catch { return []; }
  }
  private procFile(): string { return this.file.replace(/\.json$/, '.processed.json'); }
  async isProcessed(id: string): Promise<boolean> {
    try { const raw = await fs.readFile(this.procFile(), 'utf8'); const arr = JSON.parse(raw) as string[]; return arr.includes(id); } catch { return false; }
  }
  async markProcessed(id: string, _type: string): Promise<void> {
    const f = this.procFile(); const dir = path.dirname(f); await fs.mkdir(dir, { recursive: true });
    let arr: string[] = []; try { const raw = await fs.readFile(f, 'utf8'); arr = JSON.parse(raw) as string[]; } catch {}
    if (!arr.includes(id)) arr.push(id);
    await fs.writeFile(f, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  private auditFile(): string { return this.file.replace(/\.json$/, '.audits.json'); }
  async addAudit(rec: { type: string; subId?: string; status?: SubRec['status']; customer?: string; at: number }): Promise<void> {
    const f = this.auditFile(); const dir = path.dirname(f); await fs.mkdir(dir, { recursive: true });
    let arr: any[] = []; try { const raw = await fs.readFile(f, 'utf8'); arr = JSON.parse(raw) as any[]; } catch {}
    arr.push(rec);
    // keep last 1000
    if (arr.length > 1000) arr = arr.slice(arr.length - 1000);
    await fs.writeFile(f, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  async audits(limit: number): Promise<Array<{ type: string; subId?: string; status?: SubRec['status']; customer?: string; at: number }>> {
    const f = this.auditFile();
    try { const raw = await fs.readFile(f, 'utf8'); const arr = JSON.parse(raw) as any[]; return arr.slice(-limit).reverse(); } catch { return []; }
  }
  private custFile(): string { return this.file.replace(/subscriptions\.json$/, 'customers.json'); }
  async upsertCustomer(rec: CustomerRec): Promise<void> {
    const f = this.custFile(); const dir = path.dirname(f); await fs.mkdir(dir, { recursive: true });
    let arr: CustomerRec[] = []; try { const raw = await fs.readFile(f, 'utf8'); arr = JSON.parse(raw) as CustomerRec[]; } catch {}
    const idx = arr.findIndex(r=>r.id===rec.id);
    if (idx>=0) arr[idx] = rec; else arr.push(rec);
    await fs.writeFile(f, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  async allCustomers(): Promise<CustomerRec[]> {
    try { const raw = await fs.readFile(this.custFile(), 'utf8'); return JSON.parse(raw) as CustomerRec[]; } catch { return []; }
  }
  async txUpsertSubAndCustomer(sub: SubRec, cust: CustomerRec): Promise<void> { await this.upsertCustomer(cust); await this.upsert(sub); }
  private outboxFile(): string { return this.file.replace(/subscriptions\.json$/, 'outbox.json'); }
  async addOutbox(rec: { type: string; payload: any; createdAt: number }): Promise<void> {
    const f = this.outboxFile(); const dir = path.dirname(f); await fs.mkdir(dir, { recursive: true });
    let arr: any[] = []; try { arr = JSON.parse(await fs.readFile(f, 'utf8')); } catch {}
    arr.push({ id: Date.now(), ...rec }); if (arr.length > 1000) arr = arr.slice(arr.length - 1000);
    await fs.writeFile(f, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  }
  async outbox(limit: number){ try { const arr = JSON.parse(await fs.readFile(this.outboxFile(), 'utf8')); return (arr as any[]).slice(-limit).reverse(); } catch { return []; } }
  async markOutboxPublished(_id: number){ /* no-op for JSON demo */ }
}

// DB設計メモ（実運用拡張の指針）
// - subscriptions: id(primary), status, updatedAt, customer
// - customers: id(primary), updatedAt
// - processed_events: id(primary), type, receivedAt（idempotency）
// - audit_events: id(auto), type, subId, status, customer, at（監査）
// 推奨: トランザクションで複合更新（顧客/サブスク）→ processed_events 挿入 → 200応答
// 競合: 軽い再試行（100ms,200ms,400ms…）で短時間のロック/競合に耐性
async function createPersister(): Promise<SubPersister> {
  const sqlitePath = process.env.SUB_DB_SQLITE;
  if (sqlitePath) {
    try {
      // @ts-ignore dynamic import optional
      const Better = await import('better-sqlite3');
      // eslint-disable-next-line new-cap
      const db = new (Better as any)(sqlitePath);
      // SQLite schema（実運用では外部キーやユニーク制約の検討を推奨）
      db.exec('CREATE TABLE IF NOT EXISTS subscriptions (id TEXT PRIMARY KEY, status TEXT, updatedAt INTEGER, customer TEXT)');
      db.exec('CREATE TABLE IF NOT EXISTS processed_events (id TEXT PRIMARY KEY, type TEXT, receivedAt INTEGER)');
      db.exec('CREATE TABLE IF NOT EXISTS audit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, subId TEXT, status TEXT, customer TEXT, at INTEGER)');
      db.exec('CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, updatedAt INTEGER)');
      db.exec('CREATE TABLE IF NOT EXISTS outbox_events (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, payload TEXT, createdAt INTEGER, publishedAt INTEGER)');
      const txUpsert = db.transaction((rec: SubRec) => {
        db.prepare('INSERT INTO subscriptions(id,status,updatedAt,customer) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, updatedAt=excluded.updatedAt, customer=excluded.customer').run(rec.id, rec.status, rec.updatedAt, rec.customer||null);
      });
      const txMark = db.transaction((id: string, type: string) => {
        db.prepare('INSERT OR IGNORE INTO processed_events(id,type,receivedAt) VALUES(?,?,?)').run(id, type, Date.now());
      });
      const txUpsertBoth = db.transaction((sub: SubRec, cust: CustomerRec) => {
        db.prepare('INSERT INTO customers(id,updatedAt) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET updatedAt=excluded.updatedAt').run(cust.id, cust.updatedAt);
        db.prepare('INSERT INTO subscriptions(id,status,updatedAt,customer) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, updatedAt=excluded.updatedAt, customer=excluded.customer').run(sub.id, sub.status, sub.updatedAt, sub.customer||null);
      });
      async function withRetries<T>(fn: ()=>T, retry=2): Promise<T> {
        let last: any;
        for (let i=0;i<=retry;i++){
          try { return fn(); } catch(e){ last = e; await new Promise(r=>setTimeout(r, 100*(i+1))); }
        }
        throw last;
      }
      return {
        async upsert(rec: SubRec){ await withRetries(()=> txUpsert(rec)); },
        async all(){
          const rows = db.prepare('SELECT id,status,updatedAt,customer FROM subscriptions').all();
          return rows as SubRec[];
        },
        async isProcessed(id: string){ const row = db.prepare('SELECT id FROM processed_events WHERE id = ?').get(id); return !!row; },
        async markProcessed(id: string, type: string){ await withRetries(()=> txMark(id, type)); },
        async addAudit(rec){ db.prepare('INSERT INTO audit_events(type,subId,status,customer,at) VALUES(?,?,?,?,?)').run(rec.type, rec.subId||null, rec.status||null, rec.customer||null, rec.at); },
        async audits(limit: number){ const rows = db.prepare('SELECT type,subId,status,customer,at FROM audit_events ORDER BY at DESC LIMIT ?').all(limit); return rows as any[]; },
        async upsertCustomer(rec: CustomerRec){ db.prepare('INSERT INTO customers(id,updatedAt) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET updatedAt=excluded.updatedAt').run(rec.id, rec.updatedAt); },
        async allCustomers(){ const rows = db.prepare('SELECT id,updatedAt FROM customers ORDER BY updatedAt DESC LIMIT 100').all(); return rows as any[]; },
        async txUpsertSubAndCustomer(sub: SubRec, cust: CustomerRec){ await withRetries(()=> txUpsertBoth(sub, cust)); },
        async addOutbox(rec){ db.prepare('INSERT INTO outbox_events(type,payload,createdAt) VALUES(?,?,?)').run(rec.type, JSON.stringify(rec.payload), rec.createdAt); },
        async outbox(limit: number){ const rows = db.prepare('SELECT id,type,payload,createdAt,publishedAt FROM outbox_events ORDER BY createdAt DESC LIMIT ?').all(limit); return rows.map((r:any)=>({ ...r, payload: JSON.parse(r.payload) })); },
        async markOutboxPublished(id: number){ db.prepare('UPDATE outbox_events SET publishedAt = ? WHERE id = ?').run(Date.now(), id); }
      } as SubPersister;
    } catch (e) {
      console.warn('better-sqlite3 not available, falling back to JSON file', e);
    }
  }
  const jsonPath = process.env.SUB_DB_FILE || path.resolve('examples/pack-examples/payments-full/subscriptions.json');
  return new JsonPersister(jsonPath);
}

const subscriptionsMem: Record<string, SubRec> = {};
let persister: SubPersister; // assigned in main
async function upsertSubscriptionStatus(id: string, status: SubRec['status'], customer?: string){
  const now = Date.now();
  const rec: SubRec = { id, status, updatedAt: now, customer };
  subscriptionsMem[id] = rec;
  subStatusCounts[status] = (subStatusCounts[status] || 0) + 1;
  try { if (persister) await persister.upsert(rec); } catch (e) { console.warn('persist failed', e); }
}

function extractInvoiceInfo(ev: Stripe.Event): { subId?: string; customer?: string }{
  const obj: any = (ev as any).data?.object || {};
  // Stripe.Invoice shape: { subscription: string|undefined, customer: string|undefined }
  return { subId: obj.subscription || obj.lines?.data?.[0]?.subscription, customer: obj.customer };
}

function extractSubscriptionInfo(ev: Stripe.Event): { subId?: string; status?: SubRec['status']; customer?: string }{
  const obj: any = (ev as any).data?.object || {};
  return { subId: obj.id, status: obj.status, customer: obj.customer };
}

const handlers: Record<string, (ev: Stripe.Event) => Promise<void>> = {
  'checkout.session.completed': async (_ev) => { /* add side-effects here */ },
  'invoice.payment_succeeded': async (ev) => {
    const { subId, customer } = extractInvoiceInfo(ev);
    if (subId) await upsertSubscriptionStatus(subId, 'active', customer);
    await postSlack(`:moneybag: invoice.payment_succeeded (sub=${subId||'n/a'}, customer=${customer||'n/a'})`);
    try { await persister?.addAudit?.({ type: ev.type, subId, status: 'active', customer, at: Date.now() }); } catch {}
    try { await persister?.addOutbox?.({ type: 'invoice.payment_succeeded', payload: ev, createdAt: Date.now() }); } catch {}
  },
  'invoice.payment_failed': async (ev) => {
    const { subId, customer } = extractInvoiceInfo(ev);
    if (subId) await upsertSubscriptionStatus(subId, 'past_due', customer);
    await postSlack(`:warning: invoice.payment_failed (sub=${subId||'n/a'}, customer=${customer||'n/a'})`);
    await notifyCustomerEmail(customer, 'Payment failed', `Your payment for subscription ${subId||'n/a'} failed. Please update your payment method.`);
    try { await persister?.addAudit?.({ type: ev.type, subId, status: 'past_due', customer, at: Date.now() }); } catch {}
    try { await persister?.addOutbox?.({ type: 'invoice.payment_failed', payload: ev, createdAt: Date.now() }); } catch {}
  },
  'customer.subscription.created': async (ev) => {
    const { subId, status, customer } = extractSubscriptionInfo(ev);
    if (subId && status) {
      const custRec: CustomerRec | undefined = customer ? { id: customer, updatedAt: Date.now() } : undefined;
      if (persister?.txUpsertSubAndCustomer && custRec) {
        await persister.txUpsertSubAndCustomer({ id: subId, status, updatedAt: Date.now(), customer }, custRec);
      } else {
        if (custRec && persister?.upsertCustomer) await persister.upsertCustomer(custRec);
        await upsertSubscriptionStatus(subId, status, customer);
      }
    }
    await postSlack(`:new: customer.subscription.created (sub=${subId||'n/a'}, status=${status||'n/a'})`);
    try { await persister?.addAudit?.({ type: ev.type, subId, status, customer, at: Date.now() }); } catch {}
  },
  'customer.subscription.updated': async (ev) => {
    const { subId, status, customer } = extractSubscriptionInfo(ev);
    if (subId && status) {
      const custRec: CustomerRec | undefined = customer ? { id: customer, updatedAt: Date.now() } : undefined;
      if (persister?.txUpsertSubAndCustomer && custRec) {
        await persister.txUpsertSubAndCustomer({ id: subId, status, updatedAt: Date.now(), customer }, custRec);
      } else {
        if (custRec && persister?.upsertCustomer) await persister.upsertCustomer(custRec);
        await upsertSubscriptionStatus(subId, status, customer);
      }
    }
    await postSlack(`:arrows_clockwise: customer.subscription.updated (sub=${subId||'n/a'}, status=${status||'n/a'})`);
    try { await persister?.addAudit?.({ type: ev.type, subId, status, customer, at: Date.now() }); } catch {}
  },
  'customer.subscription.deleted': async (ev) => {
    const { subId, customer } = extractSubscriptionInfo(ev);
    if (subId) await upsertSubscriptionStatus(subId, 'canceled', customer);
    await postSlack(`:x: customer.subscription.deleted (sub=${subId||'n/a'})`);
    try { await persister?.addAudit?.({ type: ev.type, subId, status: 'canceled', customer, at: Date.now() }); } catch {}
  },
};

const server = http.createServer(async (req, res) => {
  httpRequestsTotal += 1;
  try {
    if (req.method === 'GET' && req.url === '/health') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.method === 'GET' && req.url === '/metrics') {
      res.setHeader('content-type', 'text/plain; version=0.0.4');
      res.end(metricsText());
      return;
    }
    if (req.method === 'GET' && req.url?.startsWith('/audits')) {
      const url = new URL(req.url, 'http://localhost');
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const list = persister?.audits ? await persister.audits(Math.max(1, Math.min(200, limit))) : [];
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ count: list.length, items: list }));
      return;
    }
    if (req.method === 'GET' && req.url === '/customers') {
      const list = persister?.allCustomers ? await persister.allCustomers() : [];
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ count: list.length, items: list }));
      return;
    }
    if (req.method === 'GET' && req.url === '/subs') {
      const list = persister ? await persister.all() : Object.values(subscriptionsMem);
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ count: list.length, items: list.slice(0, 100) }));
      return;
    }
    if (req.method === 'POST' && req.url === '/webhook') {
      const t0 = Date.now();
      const sig = req.headers['stripe-signature'] as string | undefined;
      const chunks: Buffer[] = [];
      for await (const ch of req) chunks.push(ch as Buffer);
      const rawBody = Buffer.concat(chunks).toString('utf8');
      let event: Stripe.Event;
      try {
        event = webhookSecret ? stripe.webhooks.constructEvent(rawBody, sig || '', webhookSecret) : (JSON.parse(rawBody) as any);
      } catch (e) {
        webhookVerifyFailedTotal += 1;
        res.statusCode = 400; res.end('invalid signature');
        postSlack(':warning: Stripe webhook verify failed');
        return;
      }
      const id = event.id || 'no-id';
      if (handled.has(id) || (persister?.isProcessed && await persister.isProcessed(id))) { webhookDuplicateTotal += 1; res.statusCode = 200; res.end('duplicate'); return; }
      handled.add(id);
      // Minimal handler with classification
      typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
      try {
        const h = handlers[event.type];
        if (h) { await h(event); }
      } catch (e) {
        webhookHandlerErrorsTotal += 1;
        postSlack(`:x: Stripe handler error for ${event.type}: ${String(e)}`);
        // Return 500 to allow Stripe retries
        res.statusCode = 500; res.end('handler error');
        dlq.push({ id, type: event.type, payload: event, error: String(e) });
        return;
      }
      webhookProcessedTotal += 1;
      // Persist idempotency before responding (reduce duplicate-window)
      try { if (persister?.markProcessed) await persister.markProcessed(id, event.type); } catch (e) { console.warn('markProcessed failed', e); }
      res.statusCode = 200; res.end('ok');
      const dt = Date.now() - t0;
      const slo = parseInt(process.env.SLO_MS || '500', 10);
      if (dt > slo) {
        postSlack(`:warning: Stripe processing slow (${dt}ms > ${slo}ms): ${event.type} (${id})`);
      } else {
        postSlack(`:white_check_mark: Stripe event processed: ${event.type} (${id}) in ${dt}ms`);
      }
      return;
    }
    res.statusCode = 404; res.end('not found');
  } catch (e) {
    res.statusCode = 500; res.end('error');
  }
});

async function main(){
  persister = await createPersister();
  server.listen(port, () => {
    console.log(`payments-full listening on :${port}`);
  });
}

main().catch((e)=>{ console.error(e); process.exit(1); });
