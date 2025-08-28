// Minimal storage signer (S3) with CORS, rate limit, and metrics
// Run: PORT=3004 AWS_REGION=us-east-1 npx tsx examples/pack-examples/storage-full/index.ts
import http from 'node:http';
import path from 'node:path';

const port = parseInt(process.env.PORT || '3004', 10);

// Metrics
let httpRequestsTotal = 0;
let signRequestsTotal = 0;
let signUnsupportedTotal = 0;
let uploadsReportedTotal = 0;
let verifySuccessTotal = 0;
let verifyFailedTotal = 0;
function metricsText(){
  return [
    '# HELP http_requests_total Total HTTP requests',
    '# TYPE http_requests_total counter',
    `http_requests_total ${httpRequestsTotal}`,
    '# HELP storage_sign_requests_total Total sign requests',
    '# TYPE storage_sign_requests_total counter',
    `storage_sign_requests_total ${signRequestsTotal}`,
    '# HELP storage_sign_unsupported_total Total unsupported provider sign requests',
    '# TYPE storage_sign_unsupported_total counter',
    `storage_sign_unsupported_total ${signUnsupportedTotal}`,
    '# HELP storage_uploads_reported_total Total uploads reported via callback',
    '# TYPE storage_uploads_reported_total counter',
    `storage_uploads_reported_total ${uploadsReportedTotal}`,
    '# HELP storage_verify_success_total Total successful object verifications',
    '# TYPE storage_verify_success_total counter',
    `storage_verify_success_total ${verifySuccessTotal}`,
    '# HELP storage_verify_failed_total Total failed object verifications',
    '# TYPE storage_verify_failed_total counter',
    `storage_verify_failed_total ${verifyFailedTotal}`,
  ].join('\n') + '\n';
}

// Simple rate limiter (per-IP, per-window) and CORS
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '60', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const buckets = new Map<string, { count: number; start: number }>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) || { count: 0, start: now };
  if (now - b.start > RATE_LIMIT_WINDOW_MS) { b.count = 0; b.start = now; }
  b.count += 1; buckets.set(ip, b);
  return b.count <= RATE_LIMIT_MAX;
}
function setCors(res: http.ServerResponse){
  const origin = process.env.ORIGIN || process.env.CORS_ORIGIN || '*';
  res.setHeader('access-control-allow-origin', origin);
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
}

function parseAllowlist(name: string): string[] {
  const v = process.env[name];
  if (!v) return [];
  return v.split(',').map(s=>s.trim()).filter(Boolean);
}

function isAllowed(bucket: string, key: string): boolean {
  const buckets = parseAllowlist('ALLOW_BUCKETS');
  const prefixes = parseAllowlist('ALLOW_KEY_PREFIXES');
  if (buckets.length && !buckets.includes(bucket)) return false;
  if (prefixes.length && !prefixes.some(p=> key.startsWith(p))) return false;
  return true;
}

function sanitizeFilename(name: string): string {
  const maxLen = parseInt(process.env.FILENAME_MAXLEN || '128', 10);
  // allow alnum, dot, dash, underscore; replace others with '_'
  let safe = name.replace(/[^a-zA-Z0-9._-]+/g, '_');
  if (!safe.length) safe = 'file';
  if (safe.length > maxLen) safe = safe.slice(0, maxLen);
  return safe;
}

async function signS3Put(bucket: string, key: string, expires: number = 300, opts?: { contentType?: string; cacheControl?: string; acl?: string; contentMD5?: string; contentDisposition?: string }){
  try {
    // Dynamic import to avoid hard dependency
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: opts?.contentType, CacheControl: opts?.cacheControl, ACL: opts?.acl as any, ContentMD5: opts?.contentMD5, ContentDisposition: opts?.contentDisposition });
    const url = await getSignedUrl(client, cmd, { expiresIn: Math.max(60, Math.min(3600, expires)) });
    return { url };
  } catch (e) {
    return { error: 'aws-sdk-v3-not-installed-or-misconfigured' } as const;
  }
}

async function headS3Object(bucket: string, key: string){
  try {
    const { S3Client, HeadObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
    const out = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    const etag = (out.ETag || '').replace(/"/g, '');
    const size = out.ContentLength || 0;
    const contentType = out.ContentType || '';
    return { etag, size, contentType };
  } catch (e) {
    return { error: 'head-failed' } as const;
  }
}

const server = http.createServer(async (req, res) => {
  setCors(res);
  if ((req.method || '').toUpperCase() === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  httpRequestsTotal += 1;
  const ip = req.socket.remoteAddress || 'unknown';
  if (!rateLimit(ip)) { res.statusCode = 429; res.end(JSON.stringify({ error: 'rate_limited' })); return; }
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
    if (req.method === 'POST' && req.url === '/sign-put') {
      signRequestsTotal += 1;
      const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { provider: string; bucket: string; key: string; expires?: number; contentType?: string; cacheControl?: string; acl?: string; contentMD5?: string; size?: number; contentDisposition?: string };
      if (!body?.provider || !body?.bucket || !body?.key) { res.statusCode = 400; res.end(JSON.stringify({ error: 'provider/bucket/key required' })); return; }
      if (body.provider !== 's3') { signUnsupportedTotal += 1; res.statusCode = 501; res.end(JSON.stringify({ error: 'provider-not-supported' })); return; }
      if (!isAllowed(body.bucket, body.key)) { res.statusCode = 403; res.end(JSON.stringify({ error: 'not-allowed' })); return; }
      // Enforce optional constraints: max size and allowed content types
      const maxSize = parseInt(process.env.MAX_SIZE_BYTES || '0', 10);
      if (maxSize > 0 && typeof body.size === 'number' && body.size > maxSize) { res.statusCode = 413; res.end(JSON.stringify({ error: 'too-large', max: maxSize })); return; }
      const allowedTypes = parseAllowlist('ALLOW_CONTENT_TYPES');
      if (allowedTypes.length && body.contentType && !allowedTypes.includes(body.contentType)) { res.statusCode = 415; res.end(JSON.stringify({ error: 'unsupported-content-type' })); return; }
      let contentDisposition = body.contentDisposition;
      const sanitize = String(process.env.SANITIZE_FILENAME || 'true').toLowerCase();
      if (!contentDisposition && String(process.env.DEFAULT_ATTACHMENT || 'false').toLowerCase() === 'true') {
        const base = sanitizeFilename(path.basename(body.key));
        contentDisposition = `attachment; filename="${base}"`;
      } else if (contentDisposition && (sanitize === 'true' || sanitize === '1')) {
        // try to extract filename="..." and sanitize it
        const m = contentDisposition.match(/filename\s*=\s*"([^"]+)"/i);
        if (m) {
          const safe = sanitizeFilename(m[1]);
          contentDisposition = contentDisposition.replace(m[0], `filename="${safe}"`);
        }
      }
      const out = await signS3Put(body.bucket, body.key, body.expires || 300, { contentType: body.contentType, cacheControl: body.cacheControl, acl: body.acl, contentMD5: body.contentMD5, contentDisposition });
      if ((out as any).error) { res.statusCode = 501; res.end(JSON.stringify(out)); return; }
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(out));
      return;
    }
    if (req.method === 'POST' && req.url === '/verify') {
      const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { provider: string; bucket: string; key: string; md5?: string; size?: number };
      if (!body?.provider || !body?.bucket || !body?.key) { res.statusCode = 400; res.end(JSON.stringify({ error: 'provider/bucket/key required' })); return; }
      if (body.provider !== 's3') { res.statusCode = 501; res.end(JSON.stringify({ error: 'provider-not-supported' })); return; }
      const meta = await headS3Object(body.bucket, body.key);
      if ((meta as any).error) { verifyFailedTotal += 1; res.statusCode = 502; res.end(JSON.stringify(meta)); return; }
      const okMd5 = body.md5 ? (meta as any).etag === body.md5 : true;
      const okSize = typeof body.size === 'number' ? (meta as any).size === body.size : true;
      const ok = okMd5 && okSize;
      if (ok) verifySuccessTotal += 1; else verifyFailedTotal += 1;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok, etag: (meta as any).etag, size: (meta as any).size, contentType: (meta as any).contentType }));
      return;
    }
    if (req.method === 'POST' && req.url === '/uploaded') {
      // Callback after client finished upload successfully (best effort audit)
      const chunks: Buffer[] = []; for await (const c of req) chunks.push(c as Buffer);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as { provider: string; bucket: string; key: string; size?: number; md5?: string };
      if (!body?.provider || !body?.bucket || !body?.key) { res.statusCode = 400; res.end(JSON.stringify({ error: 'provider/bucket/key required' })); return; }
      uploadsReportedTotal += 1;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    res.statusCode = 404; res.end('not found');
  } catch (e) {
    res.statusCode = 500; res.end('error');
  }
});

server.listen(port, () => { console.log(`storage-full listening on :${port}`); });
