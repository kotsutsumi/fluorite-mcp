# Short Aliases for Popular Spikes

Short aliases are compact tokens you can include in your prompt to directly reference popular spikes. They also work as `[alias: <token>]` embedded in the text.

## Usage

- Natural language: 
  - `/fl:implement "Next.js に typed middleware を追加 [alias: next-mw-ts]"`
- With parameters: 
  - `/fl:implement "[alias: prisma-schema-ts]" model=User`

In both cases, the server selects the corresponding spike and passes parameters to `preview-spike` as `params`.

## Alias Catalog (selected)

- Elysia
  - `elysia-worker-ts` → `strike-bun-elysia-worker-typed-ts`
  - `elysia-plugin-secure-ts` → `strike-bun-elysia-plugin-secure-ts`
- Next.js
  - `next-route-ts` → `strike-nextjs-route-typed-ts`
  - `next-mw-ts` → `strike-nextjs-middleware-typed-ts`
  - `next-service-ts` → `strike-nextjs-service-typed-ts`
- FastAPI
  - `fastapi-secure-py` → `strike-fastapi-route-secure-py`
- React
  - `react-component-ts` → `strike-react-component-typed-ts`
  - `react-hook-ts` → `strike-react-hook-typed-ts`
  - `react-provider-ts` → `strike-react-provider-typed-ts`
  - `react-adapter-ts` → `strike-react-adapter-typed-ts`
- ORM/Schema
  - `prisma-schema-ts` → `strike-prisma-schema-typed-ts`
  - `drizzle-schema-ts` → `strike-drizzle-schema-typed-ts`
- Auth Providers
  - `next-auth-ts` → `strike-next-auth-provider-typed-ts`
  - `auth0-ts` → `strike-auth0-provider-typed-ts`
  - `clerk-ts` → `strike-clerk-provider-typed-ts`
  - `lucia-ts` → `strike-lucia-provider-typed-ts`
- Payments
  - `stripe-service-ts` → `strike-stripe-service-typed-ts`
- Storage
  - `s3-adapter-ts` → `strike-s3-adapter-typed-ts`
  - `gcs-adapter-ts` → `strike-gcs-adapter-typed-ts`
  - `azure-blob-adapter-ts` → `strike-azure-blob-adapter-typed-ts`
  - `minio-adapter-ts` → `strike-minio-adapter-typed-ts`
- Monitoring/APM
  - `sentry-middleware-ts` → `strike-sentry-middleware-typed-ts`
  - `posthog-middleware-ts` → `strike-posthog-middleware-typed-ts`
  - `datadog-middleware-ts` → `strike-datadog-middleware-typed-ts`
  - `newrelic-middleware-ts` → `strike-newrelic-middleware-typed-ts`
- Search
  - `es-client-ts` → `strike-elasticsearch-client-typed-ts`
  - `opensearch-client-ts` → `strike-opensearch-client-typed-ts`
  - `meilisearch-client-ts` → `strike-meilisearch-client-typed-ts`
  - `typesense-client-ts` → `strike-typesense-client-typed-ts`
- Cache/Queue
  - `redis-service-ts` → `strike-redis-service-typed-ts`
  - `bullmq-service-ts` → `strike-bullmq-service-typed-ts`
  - `kafka-service-ts` → `strike-kafka-service-typed-ts`
  - `rabbitmq-service-ts` → `strike-rabbitmq-service-typed-ts`
  - `nats-service-ts` → `strike-nats-service-typed-ts`
  - `sqs-service-ts` → `strike-sqs-service-typed-ts`

## Tuning

- `FLUORITE_AUTO_SPIKE_THRESHOLD` (default 0.4): when the best match is below this, the server suggests `discover-spikes` and clarifying questions.
- `FLUORITE_AUTO_SPIKE_TOP` (default 5): number of candidates evaluated in the second pass.
- `FLUORITE_AUTO_SPIKE_BATCH` (default 50): metadata batch size.
- `FLUORITE_SPIKE_METADATA_MULTIPLIER` (default 2): discovery breadth multiplier.
- `FLUORITE_SPIKE_LIST_LIMIT`: cap how many spikes are exposed (perf control).
- `FLUORITE_ALIAS_ENABLE` (default true): enable/disable short alias inference (`0|false|no|off` to disable).
- `FLUORITE_ALIAS_BOOST` (default 2.0): priority weight for alias candidates (0.0–5.0).

## Recipes

- Next.js Middleware (typed) with path param
  - Prompt: `/fl:implement "App に認可ミドルウェアを追加 [alias: next-mw-ts]" basePath=/admin`
  - Notes: pass `basePath` and confirm middleware execution order.

- Prisma Schema with model name
  - Prompt: `/fl:implement "[alias: prisma-schema-ts]" model=User`
  - Notes: preview migration/ddl impact and naming conventions.

- Stripe Service with event type
  - Prompt: `/fl:implement "決済のイベント処理を追加 [alias: stripe-service-ts]" event=checkout.session.completed`
  - Notes: configure webhook secret, idempotency keys, and retry policy.

- S3 Adapter with bucket name
  - Prompt: `/fl:implement "ストレージをS3で [alias: s3-adapter-ts]" bucket=my-app-bucket region=ap-northeast-1`
  - Notes: ensure credentials source (env/secret manager) and ACL policy.

- Queue (BullMQ) worker service
  - Prompt: `/fl:implement "ジョブ処理を追加 [alias: bullmq-service-ts]" queue=emails`
  - Notes: verify Redis connection, concurrency, backoff/retry settings, and graceful shutdown.

- Kafka consumer service
  - Prompt: `/fl:implement "Kafka コンシューマを追加 [alias: kafka-service-ts]" topic=orders`
  - Notes: set groupId, partitions, offset/commit strategy, and retry/DLQ plan.

- RabbitMQ worker service
  - Prompt: `/fl:implement "RabbitMQ ワーカーを追加 [alias: rabbitmq-service-ts]" queue=notifications`
  - Notes: exchange/binding, prefetch/QoS, ack/nack/requeue rules, dead-letter exchange.

- SQS worker service
  - Prompt: `/fl:implement "SQS ワーカーを追加 [alias: sqs-service-ts]" queueUrl=https://sqs.ap-northeast-1.amazonaws.com/xxxx/my-queue`
  - Notes: visibility timeout, long polling, redrive policy (DLQ), idempotency keys.
