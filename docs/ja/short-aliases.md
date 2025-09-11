# ショートエイリアス（人気スパイクの短縮トークン）

プロンプトに短縮トークン（`[alias: <token>]` 形式も可）を含めると、該当スパイクを素早く指定できます。`preview-spike` の `params` に追加パラメータが引き継がれます。

## 使い方

- 自然言語に埋め込む:
  - `/fl:implement "Next.js に typed middleware を追加 [alias: next-mw-ts]"`
- パラメータ付き:
  - `/fl:implement "[alias: prisma-schema-ts]" model=User`

## 代表エイリアス

- Next.js
  - `next-route-ts` → `strike-nextjs-route-typed-ts`
  - `next-mw-ts` → `strike-nextjs-middleware-typed-ts`
  - `next-service-ts` → `strike-nextjs-service-typed-ts`
- React
  - `react-component-ts` → `strike-react-component-typed-ts`
  - `react-hook-ts` → `strike-react-hook-typed-ts`
  - `react-provider-ts` → `strike-react-provider-typed-ts`
  - `react-adapter-ts` → `strike-react-adapter-typed-ts`
- ORM/Schema
  - `prisma-schema-ts` → `strike-prisma-schema-typed-ts`
  - `drizzle-schema-ts` → `strike-drizzle-schema-typed-ts`
- 認証
  - `next-auth-ts` → `strike-next-auth-provider-typed-ts`
  - `clerk-ts` → `strike-clerk-provider-typed-ts`
  - `lucia-ts` → `strike-lucia-provider-typed-ts`
- ストレージ
  - `s3-adapter-ts` → `strike-s3-adapter-typed-ts`
  - `gcs-adapter-ts` → `strike-gcs-adapter-typed-ts`
  - `azure-blob-adapter-ts` → `strike-azure-blob-adapter-typed-ts`
- キュー/ブローカ
  - `redis-service-ts` → `strike-redis-service-typed-ts`
  - `bullmq-service-ts` → `strike-bullmq-service-typed-ts`
  - `kafka-service-ts` → `strike-kafka-service-typed-ts`
  - `rabbitmq-service-ts` → `strike-rabbitmq-service-typed-ts`
  - `nats-service-ts` → `strike-nats-service-typed-ts`
  - `sqs-service-ts` → `strike-sqs-service-typed-ts`

- Vercel AI SDK（AISDK）
  - `vercel-ai-openai-stream` → `vercel-ai-openai-stream-minimal`
  - `vercel-ai-openai-tools` → `vercel-ai-openai-tools-minimal`
  - `vercel-ai-openai-zod` → `vercel-ai-openai-zod-structured-minimal`
  - `vercel-ai-anthropic-stream` → `vercel-ai-anthropic-stream-minimal`
  - `vercel-ai-anthropic-tools` → `vercel-ai-anthropic-tools-minimal`
  - `vercel-ai-gemini-stream` → `vercel-ai-gemini-stream-minimal`
  - `vercel-ai-gemini-zod` → `vercel-ai-gemini-zod-structured-minimal`
  - `vercel-ai-groq-stream` → `vercel-ai-groq-stream-minimal`
  - `vercel-ai-groq-zod` → `vercel-ai-groq-zod-structured-minimal`
  - `vercel-ai-cohere-stream` → `vercel-ai-cohere-stream-minimal`

## チューニング（環境変数）

- `FLUORITE_ALIAS_ENABLE`（既定 true）: エイリアス推論の有効/無効
- `FLUORITE_ALIAS_BOOST`（既定 2.0）: エイリアス候補の優先度（0.0–5.0）
- `FLUORITE_AUTO_SPIKE_THRESHOLD`, `FLUORITE_AUTO_SPIKE_TOP`, `FLUORITE_AUTO_SPIKE_BATCH`: 自動選定/探索の挙動調整（詳細は `docs/ja/strike-scale.md`）

