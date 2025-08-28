# Payments Full Example (Stripe Webhook + Metrics)

Minimal HTTP server that verifies Stripe webhook signatures, tracks basic metrics, and prevents duplicate processing (idempotency) in memory.

- Env: `STRIPE_API_KEY` (optional, not required for webhook verification), `STRIPE_WEBHOOK_SECRET` (required for verification)
- Port: `PORT` (default 3003)

Run:
```bash
npx tsx examples/pack-examples/payments-full/index.ts
# Simulate webhook (replace with a real signature via Stripe CLI for full verify)
curl -s -X POST localhost:3003/webhook -H 'stripe-signature: invalid' -d '{"type":"checkout.session.completed","id":"evt_test_1"}'
# Health
curl -s localhost:3003/health | jq
# Metrics
curl -s localhost:3003/metrics

# List subscriptions (in-memory or persisted)
curl -s localhost:3003/subs | jq

# List audits (latest 50)
curl -s 'localhost:3003/audits?limit=50' | jq

# List customers (SQLite/JSON persister)
curl -s localhost:3003/customers | jq
```

Notes:
- Use Stripe CLI to generate valid signatures: `stripe listen --print-secret` then post events with `stripe trigger checkout.session.completed`
- This example keeps a simple in-memory set of processed event IDs to avoid double handling.
- For production: persist idempotency keys in durable storage and add retries/backoff/alerting.
- Slack notifications (optional): set `SLACK_WEBHOOK_URL` to receive alerts
  - Verify failures: warning
  - Processed within SLO: info
  - SLO exceeded (`SLO_MS`, default 500ms): warning

Email notifications (optional):
- Set `EMAIL_WEBHOOK_URL` to post a JSON payload `{ to, subject, body }`
- Handlers call this for cases like `invoice.payment_failed`

DLQ/Replay (developer utility):
- Inspect: `curl -s localhost:3003/dlq | jq`
- Replay by id: `curl -s -X POST 'localhost:3003/dlq/replay?id=evt_test_1'`

In-memory subscription status (demo only):
- Handlers update a tiny in-memory map keyed by subscription id
- Types handled: `invoice.payment_succeeded` (active), `invoice.payment_failed` (past_due), `customer.subscription.created/updated/deleted`, and basic checkout session
- Extend `handlers` in code to add more event types and side-effects (DB writes, email, etc.)

Persistence (optional):
- JSON file (default): `SUB_DB_FILE`（既定: examples/pack-examples/payments-full/subscriptions.json）
- SQLite（任意）: `SUB_DB_SQLITE=path/to/db.sqlite` を設定すると `better-sqlite3` が使えれば永続化に利用（未導入時は自動でJSONにフォールバック）
- Processed events と audit events も永続化対象（重複抑止と運用監査）
 - Transaction: upsert/markProcessed を transaction + 軽い再試行で保護
