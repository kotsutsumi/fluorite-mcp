// Minimal HTTP server with health and Prometheus-style metrics
// Run: PORT=3001 npx tsx examples/pack-examples/monitoring-full/index.ts
import http from 'node:http';

type Counter = { name: string; help: string; value: number; labels?: Record<string,string> };
type Gauge = Counter;

const counters: Record<string, Counter> = {
  http_requests_total: { name: 'http_requests_total', help: 'Total number of HTTP requests', value: 0 },
};
const gauges: Record<string, Gauge> = {
  process_uptime_seconds: { name: 'process_uptime_seconds', help: 'Process uptime in seconds', value: 0 },
};
// Very small histogram implementation for request duration
type Histogram = { name: string; help: string; buckets: number[]; series: Record<string, { counts: number[]; sum: number; count: number; labels: Record<string,string> }> };
const histograms: Record<string, Histogram> = {
  http_request_duration_seconds: { name: 'http_request_duration_seconds', help: 'HTTP request duration seconds', buckets: [0.01,0.025,0.05,0.1,0.25,0.5,1,2,5], series: {} }
};
function labelKey(lbl: Record<string,string>): string { return Object.keys(lbl).sort().map(k=>`${k}=${lbl[k]}`).join(','); }
function observeHistogram(name: string, val: number, labels: Record<string,string>){
  const h = histograms[name]; if (!h) return; const key = labelKey(labels);
  const series = h.series[key] ??= { counts: Array(h.buckets.length).fill(0), sum: 0, count: 0, labels };
  series.sum += val; series.count += 1; for (let i=0;i<h.buckets.length;i++){ if (val <= h.buckets[i]) { series.counts[i] += 1; break; } }
}

function inc(name: string, delta = 1){ (counters[name] ??= { name, help: name, value: 0 }).value += delta; }
function setGauge(name: string, val: number){ (gauges[name] ??= { name, help: name, value: 0 }).value = val; }

function renderMetrics(): string {
  const lines: string[] = [];
  for (const c of Object.values(counters)) {
    lines.push(`# HELP ${c.name} ${c.help}`);
    lines.push(`# TYPE ${c.name} counter`);
    lines.push(`${c.name} ${c.value}`);
  }
  for (const g of Object.values(gauges)) {
    lines.push(`# HELP ${g.name} ${g.help}`);
    lines.push(`# TYPE ${g.name} gauge`);
    lines.push(`${g.name} ${g.value}`);
  }
  for (const h of Object.values(histograms)) {
    lines.push(`# HELP ${h.name} ${h.help}`);
    lines.push(`# TYPE ${h.name} histogram`);
    for (const s of Object.values(h.series)){
      let cumulative = 0;
      for (let i=0;i<h.buckets.length;i++){
        cumulative += s.counts[i];
        const labelStr = Object.entries({ ...s.labels, le: String(h.buckets[i]) }).map(([k,v])=>`${k}="${v}"`).join(',');
        lines.push(`${h.name}_bucket{${labelStr}} ${cumulative}`);
      }
      const infStr = Object.entries({ ...s.labels, le: '+Inf' }).map(([k,v])=>`${k}="${v}"`).join(',');
      lines.push(`${h.name}_bucket{${infStr}} ${s.count}`);
      const lstr = Object.entries(s.labels).map(([k,v])=>`${k}="${v}"`).join(',');
      lines.push(`${h.name}_sum{${lstr}} ${s.sum}`);
      lines.push(`${h.name}_count{${lstr}} ${s.count}`);
    }
  }
  return lines.join('\n') + '\n';
}

// Optional structured logger (if present)
let log: { info: Function; error: Function; warn: Function } = console as any;
(async ()=>{
  try {
    // Dynamically use pino if installed
    // @ts-ignore
    const p = await import('pino');
    log = (p as any).default();
  } catch {}
})();

// Optional: initialize external APM/monitoring providers here (Sentry, etc.)
// Example (pseudo): if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN })

const server = http.createServer(async (req, res) => {
  const started = process.hrtime.bigint();
  const route = (req.url || '').split('?')[0] || '/';
  inc('http_requests_total', 1);
  setGauge('process_uptime_seconds', Math.floor(process.uptime()));
  try {
    if (req.url === '/health') {
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.url === '/metrics') {
      res.setHeader('content-type', 'text/plain; version=0.0.4');
      res.end(renderMetrics());
      return;
    }
    res.statusCode = 404; res.end('not found');
  } catch (e) {
    log.error({ err: e }, 'request failed');
    res.statusCode = 500; res.end('error');
  } finally {
    const ended = process.hrtime.bigint();
    const dur = Number(ended - started) / 1e9; // seconds
    observeHistogram('http_request_duration_seconds', dur, { path: route, code: String(res.statusCode) });
  }
});

const port = parseInt(process.env.PORT || '3001', 10);
server.listen(port, () => {
  log.info({ port }, 'monitoring-full example started');
});
