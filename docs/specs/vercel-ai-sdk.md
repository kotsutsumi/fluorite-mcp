# Vercel AI SDK

Type-safe, provider-agnostic SDK for LLM apps. Unifies text generation, streaming, structured output, tools, and embeddings behind a simple API that runs great on Next.js (Route Handlers, Edge Runtime) and Node.js.

- Docs: https://ai-sdk.dev/docs/introduction
- Providers: OpenAI, Anthropic, Google (Gemini), Groq, Cohere, and more

## Installation

```bash
npm i ai @ai-sdk/openai     # pick providers you need
# npm i @ai-sdk/anthropic @ai-sdk/google @ai-sdk/groq @ai-sdk/cohere
```

## Core APIs

- `generateText`: Single-turn generation; returns the full response and optional tool results
- `streamText`: Server-side streaming; yields tokens/parts progressively and supports `toAIStreamResponse()`
- `embed`: Create embeddings for search/RAG
- Tools & Structured Output: Define Zod schemas to receive typed JSON-like results

## Quick Starts

### Node.js (streaming)

```ts
// index.mjs
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const result = await streamText({
  model: openai('gpt-4o-mini'),
  prompt: 'Stream a short greeting in 3 words.'
})

for await (const part of result.textStream) process.stdout.write(part)
console.log()
```

### Next.js Route Handler (Edge + streaming)

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

### Structured Output with Zod

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

// Access typed results
// const data = toolResults[0].args as { title: string; tags: string[] }
```

### Embeddings

```ts
import { embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const { embeddings } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  values: ['hello world', 'another text']
})
```

## Provider Setup

- OpenAI: `@ai-sdk/openai` with `OPENAI_API_KEY`
- Anthropic: `@ai-sdk/anthropic` with `ANTHROPIC_API_KEY`
- Google (Gemini): `@ai-sdk/google` with `GOOGLE_GENERATIVE_AI_API_KEY`

Only import the providers you need. Each provider module exposes model helpers, e.g. `openai('gpt-4o-mini')` or `openai.embedding('text-embedding-3-small')`.

## Best Practices

- Server-only keys: Never expose API keys to the client. Use Route Handlers, Server Actions, or API routes.
- Edge-friendly: When targeting `runtime = 'edge'`, avoid Node-specific APIs.
- Streaming-first UX: Prefer `streamText` + `toAIStreamResponse()` for fast, responsive UIs.
- Typed outputs: Use Zod to validate and bound outputs; enforce limits (items, lengths) in the schema.
- Model selection: Choose models per task (chat vs tools vs embeddings) and price/latency constraints.

## References

- Introduction: https://ai-sdk.dev/docs/introduction
- OpenAI Provider: https://ai-sdk.dev/docs/providers/openai
- Anthropic Provider: https://ai-sdk.dev/docs/providers/anthropic
- Google Provider: https://ai-sdk.dev/docs/providers/google-genai

## Provider Examples

### Anthropic (Claude) — streaming

```ts
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const result = await streamText({
  model: anthropic('claude-3-5-sonnet-latest'),
  prompt: 'Summarize this repo in one sentence.'
})
for await (const part of result.textStream) process.stdout.write(part)
```

### Google (Gemini) — simple generate

```ts
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
const { text } = await generateText({ model: google('gemini-1.5-flash'), prompt: 'Give three emoji-only snacks.' })
console.log(text)
```

### Groq — streaming (Llama family)

```ts
import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
const result = await streamText({ model: groq('llama-3.1-8b-instant'), prompt: 'List 5 HTTP verbs.' })
for await (const part of result.textStream) process.stdout.write(part)
```

### Cohere — embeddings

```ts
import { createCohere } from '@ai-sdk/cohere'
import { embed } from 'ai'

const cohere = createCohere({ apiKey: process.env.COHERE_API_KEY })
const { embeddings } = await embed({ model: cohere.embedding('embed-english-v3.0'), values: ['a', 'b', 'c'] })
console.log(embeddings.length)
```
