# Vercel AI SDK

型安全でプロバイダ非依存のLLM統合SDKです。テキスト生成、ストリーミング、構造化出力（Zod）、ツール実行、埋め込み生成をシンプルなAPIで統一し、Next.js（Route Handlers / Edge Runtime）やNode.jsと相性が良いです。

- ドキュメント: https://ai-sdk.dev/docs/introduction
- 対応プロバイダ: OpenAI / Anthropic / Google (Gemini) / Groq / Cohere など

## インストール

```bash
npm i ai @ai-sdk/openai     # 必要なプロバイダだけ追加
# npm i @ai-sdk/anthropic @ai-sdk/google @ai-sdk/groq @ai-sdk/cohere
```

## コアAPI

- `generateText`: 単発生成。テキストとツール結果（構造化出力）を取得
- `streamText`: サーバーサイドのトークン/チャンクストリーミング (`toAIStreamResponse()` 対応)
- `embed`: 検索/RAG向けの埋め込み生成
- ツール/構造化出力: Zodスキーマで型安全にJSONライクな結果を受け取る

## クイックスタート

### Node.js（ストリーミング）

```ts
// index.mjs
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const result = await streamText({
  model: openai('gpt-4o-mini'),
  prompt: '3語で短く挨拶をストリーム表示'
})

for await (const part of result.textStream) process.stdout.write(part)
console.log()
```

### Next.js Route Handler（Edge + ストリーミング）

```ts
// app/api/chat/route.ts
import 'server-only'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const runtime = 'edge'
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const result = await streamText({ model: openai('gpt-4o-mini'), prompt })
  return result.toAIStreamResponse()
}
```

### Zod で構造化出力

```ts
import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const schema = z.object({
  title: z.string(),
  tags: z.array(z.string()).max(5)
})

const { text, toolResults } = await generateText({
  model: openai('gpt-4o-mini'),
  tools: { extract: { parameters: schema } },
  prompt: 'ブログのタイトルと最大5つのタグを返して'
})

// const data = toolResults[0].args as { title: string; tags: string[] }
```

### 埋め込み（Embeddings）

```ts
import { embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const { embeddings } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  values: ['hello world', 'another text']
})
```

## プロバイダ設定

- OpenAI: `@ai-sdk/openai` + `OPENAI_API_KEY`
- Anthropic: `@ai-sdk/anthropic` + `ANTHROPIC_API_KEY`
- Google (Gemini): `@ai-sdk/google` + `GOOGLE_GENERATIVE_AI_API_KEY`

必要なプロバイダのみインポートします。各プロバイダは `openai('gpt-4o-mini')` や `openai.embedding('text-embedding-3-small')` のようなモデルヘルパを提供します。

## ベストプラクティス

- サーバー専用キー: APIキーはクライアントに露出させない（Route Handlers / Server Actions / API Routes）
- Edge対応: `runtime = 'edge'` では Node 固有APIに依存しない
- UXはストリーミング優先: `streamText` + `toAIStreamResponse()` を基本に
- 型安全な出力: Zodで出力形・サイズ上限を明示
- モデル選定: 用途（会話/ツール/画像/埋め込み）、価格/レイテンシで選択

## 参考リンク

- Introduction: https://ai-sdk.dev/docs/introduction
- OpenAI Provider: https://ai-sdk.dev/docs/providers/openai
- Anthropic Provider: https://ai-sdk.dev/docs/providers/anthropic
- Google Provider: https://ai-sdk.dev/docs/providers/google-genai

## プロバイダ別サンプル

### Anthropic (Claude) — ストリーミング

```ts
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const result = await streamText({
  model: anthropic('claude-3-5-sonnet-latest'),
  prompt: 'このリポジトリを1文で要約'
})
for await (const part of result.textStream) process.stdout.write(part)
```

### Google (Gemini) — シンプル生成

```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
const { text } = await generateText({ model: google('gemini-1.5-flash'), prompt: '絵文字だけでおやつを3つ' })
console.log(text)
```

### Groq — ストリーミング（Llama系）

```ts
import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
const result = await streamText({ model: groq('llama-3.1-8b-instant'), prompt: 'HTTP動詞を5つ列挙' })
for await (const part of result.textStream) process.stdout.write(part)
```

### Cohere — 埋め込み

```ts
import { createCohere } from '@ai-sdk/cohere'
import { embed } from 'ai'

const cohere = createCohere({ apiKey: process.env.COHERE_API_KEY })
const { embeddings } = await embed({ model: cohere.embedding('embed-english-v3.0'), values: ['a', 'b', 'c'] })
console.log(embeddings.length)
```
