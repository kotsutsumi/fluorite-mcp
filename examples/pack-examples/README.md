# Pack Examples (Runnable Minis)

These are tiny, runnable examples to validate pack templates quickly. Use `npx tsx` to run TypeScript files without a full build.

Prerequisites:
- Node.js >= 18
- For cloud SDKs, set environment variables accordingly (see each example header)

Run:
- MeiliSearch: `npx tsx examples/pack-examples/meili/index.ts`
- S3: `npx tsx examples/pack-examples/s3/index.ts`
- Pino: `npx tsx examples/pack-examples/pino/index.ts`
- Stripe (webhook verify demo): `npx tsx examples/pack-examples/stripe/index.ts`

Notes:
- These scripts are intentionally minimal. For production usage, follow docs/ja/pack-checklists.md and docs/ja/strike-recipes.md.
