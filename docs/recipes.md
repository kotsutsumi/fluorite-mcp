# Integrated Recipes (Prompt → Files → Diff → Verify)

End-to-end mini playbooks for representative aliases. Copy, adapt params, and follow verification.

## Next.js Middleware (typed) — `next-mw-ts`
- Prompt: `/fl:implement "Next.js に typed middleware を追加 [alias: next-mw-ts]" basePath=/admin`
- Files (see details in docs/file-structure-samples.md):
  - `middleware.ts`, optionally `src/middleware/auth.ts`
- Minimal diff (see docs/diff-samples.md): middleware skeleton
- Verify (see docs/verification-examples.md): run app and test protected routes
- Post-Apply (see docs/post-apply-checklists.md): confirm route protection and env config

## Prisma Schema (typed) — `prisma-schema-ts`
- Prompt: `/fl:implement "[alias: prisma-schema-ts]" model=User`
- Files: `prisma/schema.prisma`, migrations, `src/db/client.ts`
- Minimal diff: add `model User { id email name? }`
- Verify: run migration, generate client, simple CRUD
- Post-Apply: add tests; document env vars

## BullMQ Service (typed) — `bullmq-service-ts`
- Prompt: `/fl:implement "ジョブ処理を追加 [alias: bullmq-service-ts]" queue=emails`
- Files: `src/queues/emails/{worker.ts,processor.ts,index.ts}`
- Minimal diff: worker skeleton
- Verify: enqueue test job; observe processing
- Post-Apply: configure retry/backoff/DLQ (docs/queue-snippets.md)

## Stripe Service (typed) — `stripe-service-ts`
- Prompt: `/fl:implement "決済のイベント処理を追加 [alias: stripe-service-ts]" event=checkout.session.completed`
- Files: `src/services/stripe/{client.ts,webhook.ts,events/...}`
- Minimal diff: webhook handler skeleton
- Verify: Stripe CLI webhook forward + trigger event (docs/verification-examples.md)
- Post-Apply: set webhook secret; add tests

---

Tuning (ENV):
- `FLUORITE_ALIAS_ENABLE` (default true)
- `FLUORITE_ALIAS_BOOST` (default 2.0)

