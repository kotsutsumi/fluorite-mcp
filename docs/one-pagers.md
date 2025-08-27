# One-Pagers (Representative Aliases)

Concise, end-to-end views for common flows. Use as single-page guides.

## Next.js Middleware (typed) — `next-mw-ts`
- Prompt
  - `/fl:implement "Next.js に typed middleware を追加 [alias: next-mw-ts]" basePath=/admin`
- Files (typical)
  - `middleware.ts`
  - `src/middleware/auth.ts` (advanced variants)
- Minimal Diff (example)
  - See docs/diff-samples.md (middleware skeleton)
- Verify
  - Protect `/admin/*`; run app; check 401/redirect as expected
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Confirm route protection pattern; env vars; role/permission mapping
  - See docs/post-apply-checklists.md

## Prisma Schema (typed) — `prisma-schema-ts`
- Prompt
  - `/fl:implement "[alias: prisma-schema-ts]" model=User`
- Files (typical)
  - `prisma/schema.prisma` (+ migrations)
  - `src/db/client.ts`
- Minimal Diff (example)
  - See docs/diff-samples.md (add `model User`)
- Verify
  - Run migration; generate client; CRUD smoke test
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Env vars updated; tests added; README notes
  - See docs/post-apply-checklists.md

## Next.js Route (typed) — `next-route-ts`
- Prompt
  - `/fl:implement "Next.js に typed API ルートを追加 [alias: next-route-ts]" path=/api/hello`
- Files (typical)
  - `app/api/hello/route.ts`
- Minimal Diff (example)
  - See docs/diff-samples.md (typed route handler)
- Verify
  - Run app; `curl http://localhost:3000/api/hello` returns expected JSON
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Confirm request validation/response typing; error handling
  - See docs/post-apply-checklists.md

## Elysia Worker (typed) — `elysia-worker-typed-ts`
- Prompt
  - `/fl:implement "Bun Elysia の typed worker を TS で作成 [alias: elysia-worker-typed-ts]"`
- Files (typical)
  - `src/worker/index.ts`
  - `src/worker/types.ts`
- Minimal Diff (example)
  - See docs/diff-samples.md (worker skeleton)
- Verify
  - Run worker locally; send test job/message; observe logs
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Type-safety, error handling, graceful shutdown
  - See docs/post-apply-checklists.md



## BullMQ Service (typed) — `bullmq-service-ts`
- Prompt
  - `/fl:implement "ジョブ処理を追加 [alias: bullmq-service-ts]" queue=emails`
- Files (typical)
  - `src/queues/emails/{worker.ts,processor.ts,index.ts}`
- Minimal Diff (example)
  - See docs/diff-samples.md (worker skeleton)
- Verify
  - Enqueue test job; watch worker logs; check retry/backoff
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Configure retry/backoff/DLQ; graceful shutdown; idempotency
  - See docs/queue-snippets.md and docs/post-apply-checklists.md

## Stripe Service (typed) — `stripe-service-ts`
- Prompt
  - `/fl:implement "決済のイベント処理を追加 [alias: stripe-service-ts]" event=checkout.session.completed`
- Files (typical)
  - `src/services/stripe/{client.ts,webhook.ts,events/...}`
- Minimal Diff (example)
  - See docs/diff-samples.md (webhook handler skeleton)
- Verify
  - Stripe CLI: listen + trigger; confirm event handled
  - See docs/verification-examples.md
- Post-Apply Checklist
  - Set webhook secret; idempotency keys; error paths tested
  - See docs/post-apply-checklists.md and docs/monitoring-alerts.md
