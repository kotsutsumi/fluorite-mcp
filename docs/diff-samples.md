# Minimal Diff Samples (by alias)

Illustrative diffs for common spikes. Use to communicate expected changes before applying.

## Next.js Middleware (typed) — `next-mw-ts`
```diff
+ // middleware.ts
+ import { NextResponse } from 'next/server'
+ export function middleware() {
+   return NextResponse.next()
+ }
```

## Prisma Schema (typed) — `prisma-schema-ts`
```diff
  // prisma/schema.prisma
  datasource db {
    provider = "postgres"
    url      = env("DATABASE_URL")
  }
+ model User {
+   id    String  @id @default(cuid())
+   email String  @unique
+   name  String?
+ }
```

## BullMQ Service (typed) — `bullmq-service-ts`
```diff
+ // src/queues/emails/worker.ts
+ import { Worker } from 'bullmq'
+ export const worker = new Worker('emails', async (job) => {
+   // send email
+ })
```

## Stripe Service (typed) — `stripe-service-ts`
```diff
+ // src/services/stripe/webhook.ts
+ import Stripe from 'stripe'
+ export function handle(req: Request) {
+   // verify signature and dispatch event
+ }
```

## S3 Adapter (typed) — `s3-adapter-ts`
```diff
+ // src/storage/s3/adapter.ts
+ import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
+ export async function put(...) {
+   // upload object
+ }
```

## Meilisearch Client (typed) — `meilisearch-client-ts`
```diff
+ // src/search/meili/client.ts
+ import { MeiliSearch } from 'meilisearch'
+ export const meili = new MeiliSearch({ host: process.env.MEILI_URL! })
```

Notes: these are intentionally minimal; your variant may include auth/validation/typing and different paths.

