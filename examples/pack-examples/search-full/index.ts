// HTTP Search service with MeiliSearch optional backend
// Run: PORT=3002 npx tsx examples/pack-examples/search-full/index.ts
import http from 'node:http';

type Doc = { id: string; title?: string; content?: string };
const USE_MEILI = !!process.env.MEILI_HOST;
const USE_TYPESENSE = !!(process.env.TS_HOST || process.env.TYPESENSE_HOST);
const USE_ELASTIC = !!(process.env.ELASTIC_NODE || process.env.ELASTICSEARCH_NODE);

class InMemoryIndex {
  private docs: Doc[] = [];
  async index(doc: Doc){
    const i = this.docs.findIndex(d=>d.id===doc.id);
    if (i>=0) this.docs[i] = doc; else this.docs.push(doc);
  }
  async search(q: string){
    const qq = (q||'').toLowerCase();
    return this.docs.filter(d=> (d.title||'').toLowerCase().includes(qq) || (d.content||'').toLowerCase().includes(qq));
  }
  async seed(docs: Doc[]){ for (const d of docs) await this.index(d); }
  async reset(){ this.docs = []; }
}

async function createBackend(){
  // Preference order: Meili > Typesense > Elasticsearch > Memory
  if (USE_MEILI) {
    try {
      const { MeiliSearch } = await import('meilisearch');
      const client = new MeiliSearch({ host: process.env.MEILI_HOST!, apiKey: process.env.MEILI_API_KEY });
      const index = client.index('samples');
      return {
        async index(doc: Doc){ await index.addDocuments([doc]); },
        async search(q: string){ const r = await index.search(q||''); return r.hits as Doc[]; }
      };
    } catch {}
  }
  if (USE_TYPESENSE) {
    try {
      const TS: any = await import('typesense');
      const client = new (TS.default || TS)({
        nodes: [{ host: process.env.TS_HOST || process.env.TYPESENSE_HOST, port: parseInt(process.env.TS_PORT||'8108',10), protocol: process.env.TS_PROTOCOL || 'http' }],
        apiKey: process.env.TS_API_KEY || 'xyz'
      });
      const coll = () => client.collections('samples');
      return {
        async index(doc: Doc){ await coll().documents().upsert(doc); },
        async search(q: string){ const r = await coll().documents().search({ q: q||'', query_by: 'title,content' }); return r.hits?.map((h:any)=>h.document) || []; }
      };
    } catch {}
  }
  if (USE_ELASTIC) {
    try {
      const ES: any = await import('@elastic/elasticsearch');
      const client = new (ES.Client || ES.default)({ node: process.env.ELASTIC_NODE || process.env.ELASTICSEARCH_NODE });
      const indexName = 'samples';
      return {
        async index(doc: Doc){ await client.index({ index: indexName, id: doc.id, document: doc }); await client.indices.refresh({ index: indexName }); },
        async search(q: string){ const r = await client.search({ index: indexName, query: { multi_match: { query: q||'', fields: ['title','content'] } } }); return (r.hits.hits as any[]).map(h=>h._source) as Doc[]; }
      };
    } catch {}
  }
  return new InMemoryIndex();
}

function json(res: http.ServerResponse, code: number, body: unknown){
  res.statusCode = code; res.setHeader('content-type','application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function main(){
  const backend = await createBackend();
  const port = parseInt(process.env.PORT || '3002', 10);
  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url?.startsWith('/health')) return json(res, 200, { ok: true, backend: USE_MEILI ? 'meili' : 'memory' });
      if (req.method === 'GET' && req.url?.startsWith('/search')){
        const url = new URL(req.url, 'http://localhost');
        const q = url.searchParams.get('q') || '';
        const hits = await backend.search(q);
        return json(res, 200, { hits });
      }
      if (req.method === 'POST' && req.url === '/_seed'){
        const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer);
        const docs = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Doc[];
        const hasSeed = typeof (backend as any).seed === 'function';
        if (!hasSeed) return json(res, 501, { error: 'seed-not-supported-for-external-backend' });
        await (backend as any).seed(docs);
        return json(res, 200, { ok: true, count: Array.isArray(docs)? docs.length : 0 });
      }
      if (req.method === 'POST' && req.url === '/_reset'){
        const hasReset = typeof (backend as any).reset === 'function';
        if (!hasReset) return json(res, 501, { error: 'reset-not-supported-for-external-backend' });
        await (backend as any).reset();
        return json(res, 200, { ok: true });
      }
      if (req.method === 'POST' && req.url === '/index'){
        const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer);
        const doc = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Doc;
        if (!doc?.id) return json(res, 400, { error: 'id required' });
        await backend.index(doc);
        return json(res, 200, { ok: true });
      }
      res.statusCode = 404; res.end('not found');
    } catch (e) {
      json(res, 500, { error: String(e) });
    }
  });
  const backendName = USE_MEILI ? 'meili' : (USE_TYPESENSE ? 'typesense' : (USE_ELASTIC ? 'elastic' : 'memory'));
  server.listen(port, ()=>{ console.log(`search-full example on :${port} (backend=${backendName})`); });
}

main().catch((e)=>{ console.error(e); process.exit(1); });
