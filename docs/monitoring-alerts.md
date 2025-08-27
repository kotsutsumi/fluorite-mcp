# Monitoring & Alerts (Minimum Viable)

Practical starting points for production monitoring. Adjust thresholds to your SLOs.

## Web/API Services
- Latency (p95): warn > 500ms, crit > 1000ms
- Error rate (5xx): warn > 1%, crit > 5%
- Saturation: CPU > 70%, memory > 80% sustained 5m

## Queue/Brokers
- Queue depth: warn when growing 5m; crit when growing 15m
- Processing lag: time-from-enqueue p95 > 60s
- Retry/Dead-letter rate: warn when > 1% of total; crit > 5%

## Storage (S3/GCS/Blob)
- Request errors (4xx/5xx): warn > baseline x2, crit x5
- Latency p95 > 300ms sustained 5m

## Search (Meilisearch/Typesense)
- Task backlog: warn > baseline x2, crit x5
- Query latency p95: warn > 200ms, crit > 500ms

## Alert Routing
- Page on critical sustained 10m events
- Create tickets on repeated warns; attach runbooks (verification-examples.md)
