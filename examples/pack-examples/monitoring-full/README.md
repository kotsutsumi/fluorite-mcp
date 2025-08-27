# Monitoring Full Example (Minimal HTTP + Metrics)

A tiny runnable example showing a minimal HTTP server exposing health and Prometheus-style metrics, with optional structured logging.

- No external deps required (optional Pino if installed)
- Port: `PORT` (default 3001)

Run:
```bash
npx tsx examples/pack-examples/monitoring-full/index.ts
# Health
curl -s localhost:3001/health | jq
# Metrics (Prometheus format)
curl -s localhost:3001/metrics
```

Notes:
- If `pino` is installed, the example will use it automatically; otherwise it falls back to console logging.
- For Sentry/PostHog/Datadog/NewRelic, wire in their SDK init where indicated in the source.
- See also: docs/ja/pack-checklists.md (validation points) and docs/ja/pack-samples.md.
