// Local replicas of types to avoid circular imports
export interface SpikeMetadata {
  id: string;
  name: string;
  description?: string;
  stack?: string[];
  tags?: string[];
  version?: string;
  fileCount?: number;
  patchCount?: number;
}

export interface SpikeFileTemplate {
  path: string;
  content?: string;
  template?: string;
}

export interface SpikePatch { path: string; diff: string }

export interface SpikeSpec {
  id: string;
  name: string;
  version?: string;
  stack?: string[];
  tags?: string[];
  description?: string;
  params?: Array<{ name: string; required?: boolean; description?: string; default?: string }>;
  files?: SpikeFileTemplate[];
  patches?: SpikePatch[];
}

// Prefix for generated spike IDs
const GEN_PREFIX = 'gen-';
// Also support Strike-branded generated IDs
const STRIKE_PREFIX = 'strike-';

// Dimensions to combine into many spikes
const LIBRARIES = [
  'react','vue','svelte','angular','solid','qwik','nextjs','nuxt','remix','astro',
  'express','fastify','koa','hapi','nestjs','deno-fresh','bun-elysia','sails','adonis','feathers',
  'graphql','apollo','urql','relay','graphql-yoga','openapi','swagger','trpc','hono','elysia',
  'prisma','mongoose','sequelize','typeorm','drizzle','knex','postgres','mysql','sqlite','neo4j',
  'redis','bullmq','kafka','rabbitmq','nats','sqs','sns','pubsub','kinesis','activemq',
  'jest','vitest','playwright','cypress','eslint','prettier','rollup','vite','webpack','tsup',
  'docker','kubernetes','helm','terraform','pulumi','ansible','serverless','aws-lambda','gcp-cloud-functions','azure-functions',
  'auth0','passport','next-auth','keycloak','firebase-auth','cognito','supabase-auth','clerk','lucia','ory',
  'openai','anthropic','langchain','llamaindex','transformers','whisper','weaviate','pinecone','milvus','qdrant',
  'github-actions',
  // newly specialized libraries
  'sentry','stripe','posthog','shadcn','supabase',
  // auth providers
  'auth0','clerk','lucia','keycloak','firebase-auth','cognito','supabase-auth','ory',
  // storage, logging, metrics
  's3','gcs','azure-blob','pino','winston','prometheus',
  // email providers
  'resend','sendgrid','postmark','nodemailer',
  // search/index providers
  'algolia','meilisearch','typesense',
  // realtime, apm, flags, secrets, extra storage/search
  'socket.io','pusher','ably','datadog','newrelic','launchdarkly','unleash','vault','doppler','minio','elasticsearch','opensearch','mqtt','memcached','cloudflare-workers'
  ,
  // i18n, CMS, AI, analytics, bug tracking, config, uploads
  'i18next','next-intl','strapi','contentful','sanity','ghost',
  'groq','mistral','cohere',
  'segment','amplitude','mixpanel',
  'bugsnag','honeybadger',
  'dotenv','cloudinary','uploadthing','mailgun','lru-cache','paddle',
  // frontend state/forms/utilities (new)
  'zod','react-hook-form','zustand','redux','swr','radix-ui','tailwindcss','storybook','nx','turborepo'
];

const PATTERNS = [
  'minimal','init','config','route','controller','service','client','crud','webhook','job',
  // additional common patterns
  'middleware','schema','component','hook','provider','adapter','plugin','worker','listener','migration','seed'
];

const STYLES = ['basic','typed','advanced','secure','testing'];
const LANGS = ['ts','js','py','go','rs','kt'];

// Optionally cap generated spikes for performance
function getLimit(): number | undefined {
  const env = process.env.FLUORITE_GENERATED_SPIKES_LIMIT;
  if (!env) return undefined;
  const n = parseInt(env, 10);
  return Number.isNaN(n) || n <= 0 ? undefined : n;
}

export function isGeneratedId(id: string): boolean {
  // Treat both prefixes as generated (virtual) spikes
  return id.startsWith(GEN_PREFIX) || id.startsWith(STRIKE_PREFIX);
}

export function listGeneratedSpikeIds(): string[] {
  const ids: string[] = [];
  const limit = getLimit();
  // Helper to push with optional cap
  const pushWithCap = (id: string) => {
    ids.push(id);
    return limit !== undefined && ids.length >= limit;
  };

  outer: for (const lib of LIBRARIES) {
    for (const pat of PATTERNS) {
      for (const style of STYLES) {
        for (const lang of LANGS) {
          // Standard generated id
          if (pushWithCap(`${GEN_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
          // Strike-branded generated id (same content, different id and extra tag)
          if (pushWithCap(`${STRIKE_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
        }
      }
    }
  }
  return ids;
}

function codeSnippet(lib: string, pattern: string, lang: string, style: string): string {
  const header = `# Spike: ${lib} ${pattern} (${lang})\n`;
  // Specialized snippets for popular stacks
  if (lib === 'express' && pattern === 'route') {
    if (lang === 'ts') {
      return header + `import express, { Request, Response } from 'express';\nconst app = express();\napp.get('/health', (req: Request, res: Response) => { res.json({ ok: true }); });\napp.listen(3000);\n`;}
    if (lang === 'js') {
      return header + `const express = require('express');\nconst app = express();\napp.get('/health', (req, res) => res.json({ ok: true }));\napp.listen(3000);\n`;}
  }
  if (lib === 'fastapi' && pattern === 'route' && lang === 'py') {
    return header + `from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\nasync def health():\n    return { 'ok': True }\n`;
  }
  switch (lang) {
    case 'ts':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nexport function demo() {\n  console.log('use ${lib} - ${pattern} (${style})');\n}\n`;
    case 'js':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nmodule.exports = function demo(){\n  console.log('use ${lib} - ${pattern} (${style})');\n};\n`;
    case 'py':
      return header + `# Auto-generated spike stub for ${lib} (${pattern})\ndef demo():\n    print('use ${lib} - ${pattern} (${style})')\n`;
    case 'go':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\npackage main\nimport \"fmt\"\nfunc demo(){ fmt.Println(\"use ${lib} - ${pattern} (${style})\") }\n`;
    case 'rs':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\npub fn demo(){ println!(\"use ${lib} - ${pattern} (${style})\"); }\n`;
    case 'kt':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nfun demo(){ println(\"use ${lib} - ${pattern} (${style})\") }\n`;
    default:
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\n`;
  }
}

function makeFiles(id: string, lib: string, pattern: string, style: string, lang: string): SpikeFileTemplate[] {
  const ext = lang;
  const files: SpikeFileTemplate[] = [];

  // Next.js
  if (lib === 'nextjs' && pattern === 'route') {
    files.push({ path: `app/api/health/route.ts`, template: `import { NextResponse } from 'next/server';\nexport async function GET(){ return NextResponse.json({ ok: true }); }\n` });
    files.push({ path: `app/api/echo/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { z } from 'zod';\nconst Body = z.object({ message: z.string().min(1) });\nexport async function POST(req: Request){ const json = await req.json(); const parsed = Body.safeParse(json); if(!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 }); return NextResponse.json({ echo: parsed.data.message }); }\n` });
    if (style === 'advanced') {
      files.push({
        path: `app/api/items/route.ts`,
        template: `import { NextResponse } from 'next/server';\nimport { z } from 'zod';\nconst Query = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });\nexport async function GET(req: Request){ const url = new URL(req.url); const parsed = Query.safeParse(Object.fromEntries(url.searchParams)); if(!parsed.success){ return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }); } const { page, limit } = parsed.data; return NextResponse.json({ items: [], page, limit }); }\n`
      });
    }
  }
  if (lib === 'nextjs' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `middleware.ts`, template: `import { NextResponse } from 'next/server';\nexport function middleware(){ return NextResponse.next(); }\n` });
  }
  if (lib === 'nextjs' && pattern === 'service') {
    files.push({ path: `app/actions/demo.ts`, template: `'use server';\nexport async function demoAction(){ return { ok: true }; }\n` });
    if (style === 'advanced') {
      files.push({ path: `src/next/response.ts`, template: `import { NextResponse } from 'next/server';\nexport type Ok<T> = { ok: true; data: T };\nexport type Err = { ok: false; error: unknown };\nexport function ok<T>(data: T){ return NextResponse.json({ ok: true, data } as Ok<T>); }\nexport function err(e: unknown, status=400){ return NextResponse.json({ ok: false, error: String(e) } as Err, { status }); }\n` });
    }
  }
  if (lib === 'nextjs' && pattern === 'client') {
    files.push({ path: `app/client-demo/page.tsx`, template: `'use client';\nexport default function Page(){ return <div>Client Component</div>; }\n` });
  }
  if (lib === 'nextjs' && style === 'advanced') {
    files.push({ path: `app/rsc/page.tsx`, template: `export default function Page(){ return <div>Server Component (RSC)</div>; }\n` });
    files.push({ path: `app/csr/page.tsx`, template: `'use client';\nexport default function Page(){ return <div>Client Component (CSR)</div>; }\n` });
    files.push({ path: `app/api/typed/route.ts`, template: `import { z } from 'zod';\nimport { ok, err } from '@/src/next/response';\nconst Payload = z.object({ name: z.string().min(1) });\nexport async function POST(req: Request){ try { const json = await req.json(); const parsed = Payload.parse(json); return ok({ message: 'Hello ' + parsed.name }); } catch(e){ return err(e, 400); } }\n` });
    files.push({ path: `src/next/withRole.ts`, template: `import type { NextRequest } from 'next/server';\nexport function withRole(required: 'user'|'admin', handler: (req: NextRequest)=>Promise<Response>|Response){\n  return async (req: NextRequest) => {\n    const role = (req.headers.get('x-role') as 'user'|'admin') || 'user';\n    if (required === 'admin' && role !== 'admin') {\n      return new Response('Forbidden', { status: 403 });\n    }\n    return handler(req);\n  };\n}\n` });
  }

  // Prisma
  if (lib === 'prisma' && (pattern === 'crud' || pattern === 'service')) {
    files.push({ path: `src/prisma.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
    const advancedSchema = `datasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\ngenerator client { provider = \"prisma-client-js\" }\nmodel User { id Int @id @default(autoincrement()) email String @unique name String? posts Post[] createdAt DateTime @default(now()) deletedAt DateTime? }\nmodel Post { id Int @id @default(autoincrement()) slug String title String content String? author   User @relation(fields: [authorId], references: [id]) authorId Int tags Tag[] deletedAt DateTime? @@unique([authorId, slug]) }\nmodel Tag { id Int @id @default(autoincrement()) name String @unique posts Post[] }\n`;
    const basicSchema = `datasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\ngenerator client { provider = \"prisma-client-js\" }\nmodel User { id Int @id @default(autoincrement()) email String @unique name String? createdAt DateTime @default(now()) }\n`;
    files.push({ path: `prisma/schema.prisma`, template: (style === 'advanced' && pattern === 'crud') ? advancedSchema : basicSchema });
    if (pattern === 'service') {
      files.push({ path: `src/user.service.ts`, template: `import { prisma } from './prisma';\nexport async function createUserWithTx(email: string){\n  return await prisma.$transaction(async (tx)=>{\n    const user = await tx.user.create({ data: { email } });\n    return user;\n  });\n}\n` });
      if (style === 'advanced') {
        files.push({ path: `src/prisma.pagination.ts`, template: `import { prisma } from './prisma';\nexport async function listUsersPage(limit: number, cursor?: number){\n  const items = await prisma.user.findMany({ take: limit, skip: cursor ? 1 : 0, ...(cursor ? { cursor: { id: cursor } } : {}) });\n  const nextCursor = items.length === limit ? items[items.length-1].id : undefined;\n  return { items, nextCursor };\n}\nexport async function withRetry<T>(fn: ()=>Promise<T>, retries=3){\n  let lastErr: unknown;\n  for(let i=0;i<retries;i++){ try{ return await fn(); } catch(e){ lastErr = e; } }\n  throw lastErr;\n}\n` });
        files.push({ path: `src/prisma.dto.ts`, template: `export interface PageDTO<T> { items: T[]; nextCursor?: number }\nexport interface FilterDTO { term?: string; from?: string; to?: string }\n` });
        files.push({ path: `src/prisma.sort.ts`, template: `export type SortBy = 'id'|'createdAt'|'updatedAt';\nexport type SortOrder = 'asc'|'desc';\nexport function sortArg(sortBy?: SortBy, order: SortOrder='desc'){ return sortBy ? { [sortBy]: order } as any : undefined as any; }\n` });
        files.push({ path: `src/prisma.filters.ts`, template: `export type SortOrder = 'asc'|'desc';\nexport interface PageOpts { limit: number; cursor?: number; sortBy?: 'id'|'createdAt'; order?: SortOrder }\nexport function pageArgs<T extends { id: number }>(o: PageOpts){ const orderBy = o.sortBy ? { [o.sortBy]: o.order||'desc' } : undefined as any; return { take: o.limit, skip: o.cursor ? 1 : 0, ...(o.cursor ? { cursor: { id: o.cursor } } : {}), ...(orderBy ? { orderBy } : {}) }; }\n` });
      }
    }
    if (style === 'advanced' && pattern === 'crud') {
      files.push({ path: `src/post.service.ts`, template: `import { prisma } from './prisma';\nexport async function createPost(userId: number, slug: string, title: string){ return prisma.post.create({ data: { authorId: userId, slug, title } }); }\nexport async function listPosts(userId: number){ return prisma.post.findMany({ where: { authorId: userId, deletedAt: null } }); }\nexport async function softDeletePost(id: number){ return prisma.post.update({ where: { id }, data: { deletedAt: new Date() } }); }\nexport async function addTagToPost(postId: number, tagName: string){ return prisma.post.update({ where: { id: postId }, data: { tags: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } } } }); }\n` });
    }
  }

  // GraphQL and Apollo
  if (lib === 'graphql' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `schema.graphql`, template: `type Query { hello: String! }\n` });
    files.push({ path: `src/graphql/resolvers.ts`, template: `export const resolvers = { Query: { hello: () => 'world' } };\n` });
    if (style === 'advanced') {
      files.push({ path: `codegen.yml`, template: `schema: schema.graphql\ngenerates:\n  src/graphql/types.ts:\n    plugins:\n      - typescript\n` });
    }
  }
  if (lib === 'graphql' && pattern === 'client' && style === 'advanced') {
    files.push({ path: `src/graphql/useUpdateTitle.tsx`, template: `import { gql, useMutation } from '@apollo/client';\nconst UPDATE = gql\`mutation($id: ID!, $title: String!){ updateTitle(id:$id, title:$title){ id title } }\`;\nexport function useUpdateTitle(){\n  return useMutation(UPDATE, {\n    optimisticResponse: (vars)=>({ updateTitle: { __typename: 'Post', id: vars.id, title: vars.title } })\n  });\n}\n` });
    files.push({ path: `src/graphql/cache.ts`, template: `import type { ApolloCache, DefaultContext, MutationUpdaterFunction } from '@apollo/client';\nexport const noopUpdate: MutationUpdaterFunction<any, any, DefaultContext, ApolloCache<any>> = () => {};\n` });
    files.push({ path: `src/graphql/updateCache.ts`, template: `import type { ApolloCache } from '@apollo/client';\nexport function writePostTitle(cache: ApolloCache<any>, id: string, title: string){\n  cache.modify({ id: cache.identify({ __typename: 'Post', id }), fields: { title: () => title } });\n}\n` });
    files.push({ path: `src/graphql/fragments.ts`, template: `import { gql } from '@apollo/client';\nexport const POST_FIELDS = gql\`fragment PostFields on Post { id title }\`;\n` });
    files.push({ path: `src/graphql/cachePolicies.ts`, template: `import { InMemoryCache } from '@apollo/client';\nexport const cache = new InMemoryCache({ typePolicies: { Query: { fields: { posts: { merge: false } } } } });\n` });
  }
  if (lib === 'graphql' && pattern === 'client') {
    files.push({ path: `src/graphql/useHello.tsx`, template: `import { gql, useQuery } from '@apollo/client';\nconst HELLO = gql\`query { hello }\`;\nexport function useHello(){ return useQuery(HELLO); }\n` });
  }
  if (lib === 'apollo' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/apollo/server.ts`, template: `import { ApolloServer } from '@apollo/server';\nimport { startStandaloneServer } from '@apollo/server/standalone';\nconst typeDefs = \`type Query { hello: String! }\`;\nconst resolvers = { Query: { hello: () => 'world' } };\nconst server = new ApolloServer({ typeDefs, resolvers });\nstartStandaloneServer(server, { listen: { port: 4000 } });\n` });
    if (style === 'advanced') {
      files.push({ path: `src/apollo/federation.ts`, template: `// Apollo Federation setup placeholder\nexport const federated = true;\n` });
      files.push({ path: `src/apollo/subscriptions.ts`, template: `// GraphQL subscriptions (placeholder)\nexport const subscriptionsEnabled = true;\n` });
    }
  }
  if (lib === 'apollo' && pattern === 'client') {
    files.push({ path: `src/apollo/client.ts`, template: `import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';\nexport const client = new ApolloClient({ link: new HttpLink({ uri: '/api/graphql' }), cache: new InMemoryCache() });\n` });
  }

  // OpenAI
  if (lib === 'openai' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/openai/chat.ts`, template: `import OpenAI from 'openai';\nconst apiKey = process.env.OPENAI_API_KEY!;\nconst client = new OpenAI({ apiKey });\nexport async function chat(prompt: string){\n  const res = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });\n  return res.choices[0]?.message?.content || '';\n}\n` });
  }

  // LangChain
  if (lib === 'langchain' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/langchain/basic.ts`, template: `import { ChatOpenAI } from '@langchain/openai';\nimport { ChatPromptTemplate } from '@langchain/core/prompts';\nexport async function run(prompt: string){\n  const llm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: process.env.OPENAI_API_KEY });\n  const tpl = ChatPromptTemplate.fromMessages([['system','You are helpful.'],['human','{input}']]);\n  const chain = tpl.pipe(llm);\n  const res = await chain.invoke({ input: prompt });\n  return res?.content?.toString?.() || String(res);\n}\n` });
  }

  // BullMQ
  if (lib === 'bullmq' && (pattern === 'service' || pattern === 'job')) {
    files.push({ path: `src/queue/queue.ts`, template: `import { Queue } from 'bullmq';\nexport const queue = new Queue('jobs', { connection: { host: '127.0.0.1', port: 6379 } });\nexport async function enqueue(name: string, data: any){ return queue.add(name, data); }\n` });
    files.push({ path: `src/queue/worker.ts`, template: `import { Worker } from 'bullmq';\nexport const worker = new Worker('jobs', async (job)=>{ console.log('job', job.name, job.data); }, { connection: { host: '127.0.0.1', port: 6379 } });\n` });
  }

  // AWS Lambda
  if (lib === 'aws-lambda' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/lambda/handler.ts`, template: `import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';\nexport async function handler(_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>{\n  return { statusCode: 200, body: JSON.stringify({ ok: true }) };\n}\n` });
  }

  // Cypress
  if (lib === 'cypress' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `cypress.config.ts`, template: `import { defineConfig } from 'cypress';\nexport default defineConfig({ e2e: { baseUrl: 'http://localhost:3000' } });\n` });
    files.push({ path: `cypress/e2e/spec.cy.ts`, template: `describe('home', () => { it('loads', () => { cy.visit('/'); cy.contains('html'); }); });\n` });
  }

  // tRPC
  if (lib === 'trpc' && (pattern === 'service' || pattern === 'server')) {
    files.push({ path: `src/trpc/context.ts`, template: `export type Context = {};\nexport async function createContext(): Promise<Context> { return {}; }\n` });
    files.push({ path: `src/trpc/router.ts`, template: `import { initTRPC } from '@trpc/server';\nconst t = initTRPC.context<{}>().create();\nexport const appRouter = t.router({ hello: t.procedure.query(()=> 'world') });\nexport type AppRouter = typeof appRouter;\n` });
    files.push({ path: `src/trpc/server.ts`, template: `import { createHTTPServer } from '@trpc/server/adapters/standalone';\nimport { appRouter } from './router';\nconst server = createHTTPServer({ router: appRouter });\nserver.listen(20222);\n` });
  }
  if (lib === 'trpc' && pattern === 'client') {
    files.push({ path: `src/trpc/client.ts`, template: `import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';\nimport type { AppRouter } from './router';\nexport const client = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url: '/trpc' })] });\n` });
  }

  // Drizzle ORM
  if (lib === 'drizzle' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `drizzle.config.ts`, template: `import type { Config } from 'drizzle-kit';\nexport default { schema: './src/db/schema.ts', out: './drizzle', driver: 'pg', dbCredentials: { connectionString: process.env.DATABASE_URL! } } satisfies Config;\n` });
    files.push({ path: `src/db/schema.ts`, template: `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';\nexport const posts = pgTable('posts', { id: serial('id').primaryKey(), title: text('title').notNull(), createdAt: timestamp('created_at').defaultNow() });\n` });
    files.push({ path: `src/db/client.ts`, template: `import { drizzle } from 'drizzle-orm/node-postgres';\nimport { Pool } from 'pg';\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\nexport const db = drizzle(pool);\n` });
    files.push({ path: `src/db/migrate.ts`, template: `import { migrate } from 'drizzle-orm/node-postgres/migrator';\nimport { db } from './client';\nimport { Client } from 'pg';\n(async()=>{ const client = new Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); await migrate(db, { migrationsFolder: 'drizzle' }); await client.end(); })().catch(e=>{ console.error(e); process.exit(1); });\n` });
  }

  // Prisma (schema/client)
  if (lib === 'prisma' && pattern === 'schema') {
    files.push({ path: `prisma/schema.prisma`, template: `generator client { provider = \"prisma-client-js\" }\ndatasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\n\nmodel {{model}} {\n  id    Int     @id @default(autoincrement())\n  name  String\n  createdAt DateTime @default(now())\n}\n` });
    files.push({ path: `src/db/client.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
  }
  if (lib === 'prisma' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/db/client.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
  }

  // Redis
  if (lib === 'redis' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/cache/redis.ts`, template: `import { createClient } from 'redis';\nconst url = process.env.REDIS_URL || 'redis://localhost:6379';\nexport const redis = createClient({ url });\nredis.on('error', (e)=> console.error('Redis error', e));\nexport async function connect(){ if(!redis.isOpen) await redis.connect(); }\nexport async function get(key: string){ await connect(); return redis.get(key); }\nexport async function set(key: string, val: string, ttl?: number){ await connect(); if (ttl) return redis.set(key, val, { EX: ttl }); return redis.set(key, val); }\n` });
  }

  // Stripe
  if (lib === 'stripe' && (pattern === 'service' || pattern === 'webhook' || pattern === 'route')) {
    files.push({ path: `src/payments/stripe.ts`, template: `import Stripe from 'stripe';\nconst apiKey = process.env.STRIPE_API_KEY || '';\nexport const stripe = new Stripe(apiKey, { apiVersion: '2024-06-20' as any });\nexport async function createCheckoutSession(priceId: string){\n  return stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }], success_url: 'https://example.com/success', cancel_url: 'https://example.com/cancel' });\n}\n` });
    if (pattern === 'webhook' || pattern === 'route') {
      files.push({ path: `app/api/stripe/webhook/route.ts`, template: `import { NextResponse } from 'next/server';\nimport Stripe from 'stripe';\nconst stripe = new Stripe(process.env.STRIPE_API_KEY || '', { apiVersion: '2024-06-20' as any });\nconst endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';\nexport async function POST(req: Request){\n  const sig = req.headers.get('stripe-signature') || '';\n  const body = await req.text();\n  let event: Stripe.Event;\n  try { event = stripe.webhooks.constructEvent(body, sig, endpointSecret); }\n  catch (err){ return new NextResponse('invalid signature', { status: 400 }); }\n  switch(event.type){ case 'checkout.session.completed': break; default: break; }\n  return NextResponse.json({ received: true });\n}\n` });
    }
  }

  // Object storage adapters
  if (lib === 's3' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/s3.ts`, template: `import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';\nconst region = process.env.AWS_REGION || '{{region}}';\nexport const s3 = new S3Client({ region });\nexport async function putObject(bucket: string, key: string, body: Uint8Array){ await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body })); }\nexport async function getObject(bucket: string, key: string){ return s3.send(new GetObjectCommand({ Bucket: bucket, Key: key })); }\n` });
  }
  if (lib === 'gcs' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/gcs.ts`, template: `import { Storage } from '@google-cloud/storage';\nexport const gcs = new Storage();\nexport async function upload(bucket: string, filename: string, buffer: Buffer){ const b = gcs.bucket(bucket); const file = b.file(filename); await file.save(buffer); return file.publicUrl(); }\n` });
  }
  if (lib === 'azure-blob' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/azureBlob.ts`, template: `import { BlobServiceClient } from '@azure/storage-blob';\nconst conn = process.env.AZURE_STORAGE_CONNECTION_STRING || '';\nexport const blob = BlobServiceClient.fromConnectionString(conn);\nexport async function put(container: string, name: string, data: Uint8Array){ const c = blob.getContainerClient(container); const block = c.getBlockBlobClient(name); await block.uploadData(data); }\n` });
  }
  if (lib === 'minio' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/minio.ts`, template: `import * as Minio from 'minio';\nexport const minio = new Minio.Client({ endPoint: process.env.MINIO_ENDPOINT || 'localhost', port: parseInt(process.env.MINIO_PORT||'9000',10), useSSL: false, accessKey: process.env.MINIO_ACCESS_KEY||'', secretKey: process.env.MINIO_SECRET_KEY||'' });\nexport async function put(bucket: string, name: string, data: Buffer){ await minio.putObject(bucket, name, data); }\n` });
  }

  // Search clients
  if (lib === 'meilisearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/meilisearch.ts`, template: `import { MeiliSearch } from 'meilisearch';\nexport const meili = new MeiliSearch({ host: process.env.MEILI_HOST || 'http://127.0.0.1:7700', apiKey: process.env.MEILI_API_KEY });\nexport async function indexDoc(index: string, doc: any){ const i = meili.index(index); return i.addDocuments([doc]); }\n` });
  }
  if (lib === 'typesense' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/typesense.ts`, template: `import Typesense from 'typesense';\nexport const typesense = new (Typesense as any)({ nodes: [{ host: process.env.TS_HOST || 'localhost', port: parseInt(process.env.TS_PORT||'8108',10), protocol: 'http' }], apiKey: process.env.TS_API_KEY || 'xyz' });\nexport async function indexDoc(collection: string, doc: any){ return typesense.collections(collection).documents().upsert(doc); }\n` });
  }

  // Docker
  if (lib === 'docker' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `Dockerfile`, template: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD [\"npm\", \"start\"]\n` });
    files.push({ path: `docker-compose.yml`, template: `version: '3.9'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      - NODE_ENV=production\n` });
    if (style === 'advanced') {
      files.push({ path: `cloudrun.yaml`, template: `apiVersion: serving.knative.dev/v1\nkind: Service\nmetadata: { name: app }\nspec: { template: { spec: { containers: [{ image: gcr.io/PROJECT/IMAGE:TAG }], containerConcurrency: 80 } } }\n` });
      files.push({ path: `render.yaml`, template: `services:\n  - type: web\n    name: app\n    env: node\n    plan: starter\n    buildCommand: npm ci && npm run build\n    startCommand: npm start\n` });
      files.push({ path: `fly.toml`, template: `app = \"app\"\n[[services]]\n  internal_port = 3000\n  processes = [\"app\"]\n` });
    }
  }

  // Kafka
  if (lib === 'kafka' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/kafka/producer.ts`, template: `import { Kafka } from 'kafkajs';\nconst kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });\nexport async function produce(topic: string, message: string){ const p = kafka.producer(); await p.connect(); await p.send({ topic, messages: [{ value: message }] }); await p.disconnect(); }\n` });
    files.push({ path: `src/kafka/consumer.ts`, template: `import { Kafka } from 'kafkajs';\nconst kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });\nexport async function consume(topic: string){ const c = kafka.consumer({ groupId: 'group' }); await c.connect(); await c.subscribe({ topic, fromBeginning: true }); await c.run({ eachMessage: async ({ message }) => console.log(message.value?.toString()) }); }\n` });
  }

  // Playwright
  if (lib === 'playwright' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `playwright.config.ts`, template: `import { defineConfig } from '@playwright/test';\nexport default defineConfig({ use: { headless: true } });\n` });
    files.push({ path: `tests/example.spec.ts`, template: `import { test, expect } from '@playwright/test';\ntest('homepage', async ({ page }) => { await page.goto('https://example.com'); await expect(page).toHaveTitle(/Example/); });\n` });
  }

  // Fastify
  if (lib === 'fastify' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/fastify/server.ts`, template: `import Fastify from 'fastify';\nconst app = Fastify();\napp.get('/', async ()=> ({ ok: true }));\napp.listen({ port: 3000 });\n` });
  }

  // Hono
  if (lib === 'hono' && (pattern === 'route' || pattern === 'service')) {
    files.push({ path: `src/hono/server.ts`, template: `import { Hono } from 'hono';\nconst app = new Hono();\napp.get('/hello', (c)=> c.json({ ok: true }));\nexport default app;\n` });
  }

  // RabbitMQ
  if (lib === 'rabbitmq' && (pattern === 'service' || pattern === 'job')) {
    files.push({ path: `src/rabbitmq/publisher.ts`, template: `import amqplib from 'amqplib';\nexport async function publish(queue: string, msg: string){ const conn = await amqplib.connect('amqp://localhost'); const ch = await conn.createChannel(); await ch.assertQueue(queue); ch.sendToQueue(queue, Buffer.from(msg)); await ch.close(); await conn.close(); }\n` });
    files.push({ path: `src/rabbitmq/consumer.ts`, template: `import amqplib from 'amqplib';\nexport async function consume(queue: string){ const conn = await amqplib.connect('amqp://localhost'); const ch = await conn.createChannel(); await ch.assertQueue(queue); await ch.consume(queue, (msg)=>{ if(msg){ console.log(msg.content.toString()); ch.ack(msg); } }); }\n` });
  }

  // NATS
  if (lib === 'nats' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/nats/pub.ts`, template: `import { connect, StringCodec } from 'nats';\nexport async function pub(subject: string, message: string){ const nc = await connect({ servers: 'localhost:4222' }); const sc = StringCodec(); nc.publish(subject, sc.encode(message)); await nc.drain(); }\n` });
    files.push({ path: `src/nats/sub.ts`, template: `import { connect, StringCodec } from 'nats';\nexport async function sub(subject: string){ const nc = await connect({ servers: 'localhost:4222' }); const sc = StringCodec(); const sub = nc.subscribe(subject); for await (const m of sub){ console.log(sc.decode(m.data)); } }\n` });
  }

  // AWS SQS
  if (lib === 'sqs' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/sqs.ts`, template: `import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';\nconst client = new SQSClient({});\nexport async function send(queueUrl: string, body: string){ await client.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: body })); }\nexport async function receive(queueUrl: string){ const out = await client.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1 })); const msg = out.Messages?.[0]; if(msg){ await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle! })); return msg.Body; } return undefined; }\n` });
  }

  // AWS SNS
  if (lib === 'sns' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/sns.ts`, template: `import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';\nconst client = new SNSClient({});\nexport async function publish(topicArn: string, message: string){ await client.send(new PublishCommand({ TopicArn: topicArn, Message: message })); }\n` });
  }

  // AWS Kinesis
  if (lib === 'kinesis' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/kinesis.ts`, template: `import { KinesisClient, PutRecordCommand } from '@aws-sdk/client-kinesis';\nconst client = new KinesisClient({});\nexport async function put(streamName: string, data: string, partitionKey='pk'){ await client.send(new PutRecordCommand({ StreamName: streamName, Data: new TextEncoder().encode(data), PartitionKey: partitionKey })); }\n` });
  }

  // Koa
  if (lib === 'koa' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/koa/server.ts`, template: `import Koa from 'koa';\nconst app = new Koa();\napp.use(async (ctx)=>{ ctx.body = { ok: true }; });\napp.listen(3000);\n` });
  }

  // NestJS
  if (lib === 'nestjs' && (pattern === 'service' || pattern === 'init')) {
    files.push({ path: `src/nest/main.ts`, template: `import { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module';\nasync function bootstrap(){ const app = await NestFactory.create(AppModule); await app.listen(3000); }\nbootstrap();\n` });
    files.push({ path: `src/nest/app.module.ts`, template: `import { Module } from '@nestjs/common';\nimport { AppController } from './app.controller';\n@Module({ controllers: [AppController] })\nexport class AppModule {}\n` });
    files.push({ path: `src/nest/app.controller.ts`, template: `import { Controller, Get } from '@nestjs/common';\n@Controller()\nexport class AppController { @Get() hello(){ return { ok: true }; } }\n` });
  }

  // Hapi
  if (lib === 'hapi' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/hapi/server.ts`, template: `import Hapi from '@hapi/hapi';\nasync function start(){ const server = Hapi.server({ port:3000, host:'localhost' }); server.route({ method: 'GET', path: '/', handler: ()=> ({ ok: true }) }); await server.start(); }\nstart();\n` });
  }

  // Mongoose
  if (lib === 'mongoose' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/mongoose/conn.ts`, template: `import mongoose from 'mongoose';\nexport async function connect(uri: string){ await mongoose.connect(uri); }\n` });
    files.push({ path: `src/mongoose/user.model.ts`, template: `import { Schema, model } from 'mongoose';\nconst schema = new Schema({ email: { type: String, unique: true }, name: String });\nexport const User = model('User', schema);\n` });
  }

  // Sequelize
  if (lib === 'sequelize' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/sequelize/index.ts`, template: `import { Sequelize, DataTypes } from 'sequelize';\nexport const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:');\nexport const User = sequelize.define('User', { email: { type: DataTypes.STRING, unique: true }, name: DataTypes.STRING });\n` });
  }

  // TypeORM
  if (lib === 'typeorm' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/typeorm/data-source.ts`, template: `import 'reflect-metadata';\nimport { DataSource } from 'typeorm';\nexport const AppDataSource = new DataSource({ type: 'sqlite', database: ':memory:', entities: [__dirname + '/**/*.ts'], synchronize: true });\n` });
    files.push({ path: `src/typeorm/User.ts`, template: `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';\n@Entity() export class User { @PrimaryGeneratedColumn() id!: number; @Column({ unique: true }) email!: string; @Column({ nullable: true }) name?: string; }\n` });
  }

  // Neo4j
  if (lib === 'neo4j' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/neo4j/driver.ts`, template: `import neo4j from 'neo4j-driver';\nexport const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j','password'));\n` });
  }

  // OpenAPI / Swagger
  if (lib === 'openapi' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `openapi.yaml`, template: `openapi: 3.0.0\ninfo: { title: API, version: 1.0.0 }\npaths:\n  /hello:\n    get:\n      responses:\n        '200': { description: ok }\n` });
    if (pattern === 'service') {
      files.push({ path: `src/openapi/server.ts`, template: `import express from 'express';\nimport swaggerUi from 'swagger-ui-express';\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport YAML from 'yaml';\nconst app = express();\nconst spec = YAML.parse(fs.readFileSync(path.resolve('openapi.yaml'), 'utf-8'));\napp.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));\napp.listen(3000);\n` });
    }
  }
  if (lib === 'swagger' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/swagger/server.ts`, template: `import express from 'express';\nimport swaggerUi from 'swagger-ui-express';\nimport YAML from 'yamljs';\nconst app = express();\nconst doc = YAML.parse('openapi: 3.0.0\\ninfo: { title: API, version: 1.0.0 }');\napp.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));\napp.listen(3000);\n` });
  }

  // Express Security and OpenTelemetry
  if (lib === 'express' && pattern === 'config') {
    files.push({ path: `src/express/security.ts`, template: `import express from 'express';\nimport helmet from 'helmet';\nimport cors from 'cors';\nexport function createApp(){ const app = express(); app.use(helmet()); app.use(cors()); return app; }\n` });
    if (style === 'advanced') {
      files.push({ path: `src/otel/tracer.ts`, template: `import { NodeSDK } from '@opentelemetry/sdk-node';\nimport { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';\nimport { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';\nexport function setupOtel(){ const sdk = new NodeSDK(); (sdk as any)._tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); sdk.start(); return sdk; }\n` });
      files.push({ path: `src/otel/instrument.ts`, template: `import { setupOtel } from './tracer';\nconst sdk = setupOtel();\nprocess.on('SIGTERM', ()=> sdk.shutdown().finally(()=> process.exit(0)));\n` });
    }
  }

  // Fastify OpenTelemetry stub (advanced)
  if (lib === 'fastify' && style === 'advanced') {
    files.push({ path: `src/otel/fastify.ts`, template: `// Fastify OpenTelemetry setup (stub)\nexport function setupFastifyOtel(){ /* integrate @opentelemetry/instrumentation-fastify here */ }\n` });
  }

  // Next.js security headers helper (advanced)
  if (lib === 'nextjs' && style === 'advanced') {
    files.push({ path: `src/next/security-headers.ts`, template: `export const securityHeaders = [\n  { key: 'X-Frame-Options', value: 'DENY' },\n  { key: 'X-Content-Type-Options', value: 'nosniff' },\n  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }\n];\n` });
  }

  // CI workflows for migrations/deploy (advanced)
  if (lib === 'drizzle' && style === 'advanced') {
    files.push({ path: `.github/workflows/drizzle-migrate.yml`, template: `name: Drizzle Migrate\non: [push]\njobs:\n  migrate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: node src/db/migrate.ts\n` });
  }
  if (lib === 'knex' && style === 'advanced') {
    files.push({ path: `.github/workflows/knex-migrate.yml`, template: `name: Knex Migrate\non: [push]\njobs:\n  migrate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npx knex migrate:latest --knexfile knexfile.ts\n` });
  }
  if (lib === 'docker' && style === 'advanced') {
    files.push({ path: `.github/workflows/cloudrun-deploy.yml`, template: `name: Deploy Cloud Run\non: [workflow_dispatch]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo 'stub deploy to Cloud Run'\n` });
  }

  // Relay
  if (lib === 'relay' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/relay/environment.ts`, template: `import { Environment, Network, RecordSource, Store } from 'relay-runtime';\nfunction fetchQuery(_operation: any, _variables: any){ return Promise.resolve({ data: {} }); }\nexport const relayEnv = new Environment({ network: Network.create(fetchQuery), store: new Store(new RecordSource()) });\n` });
  }

  // URQL
  if (lib === 'urql' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/urql/client.ts`, template: `import { createClient } from 'urql';\nexport const client = createClient({ url: '/graphql' });\n` });
  }

  // GraphQL Yoga
  if (lib === 'graphql-yoga' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/graphql/yoga.ts`, template: `import { createYoga, createSchema } from 'graphql-yoga';\nimport http from 'node:http';\nconst yoga = createYoga({ schema: createSchema({ typeDefs: 'type Query { hello: String! }', resolvers: { Query: { hello: ()=> 'world' } } }) });\nhttp.createServer(yoga).listen(4000);\n` });
  }

  // Sentry
  if (lib === 'sentry' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/sentry/init.ts`, template: `import * as Sentry from '@sentry/node';\nexport function initSentry(){\n  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });\n}\n` });
  }

  // Stripe
  if (lib === 'stripe' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/stripe/client.ts`, template: `import Stripe from 'stripe';\nexport const stripe = new Stripe(process.env.STRIPE_API_KEY || '', { apiVersion: '2024-06-20' as any });\n` });
  }

  // PostHog
  if (lib === 'posthog' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/analytics/posthog.ts`, template: `import { PostHog } from 'posthog-node';\nexport const posthog = new PostHog(process.env.POSTHOG_KEY || '', { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' });\n` });
  }

  // shadcn/ui (very light stub)
  if (lib === 'shadcn' && (pattern === 'init' || pattern === 'config')) {
    files.push({ path: `components/ui/button.tsx`, template: `import * as React from 'react';\nexport function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>){ return <button {...props} className={(props.className||'') + ' inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium'} /> }\n` });
  }

  // Supabase
  if (lib === 'supabase' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/supabase/client.ts`, template: `import { createClient } from '@supabase/supabase-js';\nexport const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');\n` });
    if (style === 'advanced' && pattern === 'service') {
      files.push({ path: `src/supabase/auth.ts`, template: `import { supabase } from './client';\nexport async function getUser(){ const { data } = await supabase.auth.getUser(); return data.user; }\n` });
    }
  }

  // Auth providers: basic init stubs
  if (lib === 'auth0' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/auth0/client.ts`, template: `export function createAuth0(){ return { domain: process.env.AUTH0_DOMAIN, clientId: process.env.AUTH0_CLIENT_ID }; }\n` });
  }
  if (lib === 'clerk' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/clerk/client.ts`, template: `export function createClerk(){ return { publishableKey: process.env.CLERK_PUBLISHABLE_KEY }; }\n` });
  }
  if (lib === 'lucia' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/lucia/auth.ts`, template: `export function lucia(){ /* configure lucia here */ return {}; }\n` });
  }
  if (lib === 'keycloak' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/keycloak/client.ts`, template: `export function keycloak(){ return { serverUrl: process.env.KEYCLOAK_URL, realm: process.env.KEYCLOAK_REALM }; }\n` });
  }
  if (lib === 'firebase-auth' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/firebase/auth.ts`, template: `export function initFirebaseAuth(){ return { projectId: process.env.FIREBASE_PROJECT_ID }; }\n` });
  }
  if (lib === 'cognito' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/cognito/client.ts`, template: `export function createCognito(){ return { userPoolId: process.env.COGNITO_USER_POOL_ID, clientId: process.env.COGNITO_CLIENT_ID }; }\n` });
  }
  if (lib === 'supabase-auth' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/supabase/auth-server.ts`, template: `export function supabaseAuth(){ return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_KEY }; }\n` });
  }
  if (lib === 'ory' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/ory/client.ts`, template: `export function createOry(){ return { project: process.env.ORY_PROJECT_ID }; }\n` });
  }

  // Storage clients
  if (lib === 's3' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/aws/s3.ts`, template: `export function s3(){ return { bucket: process.env.S3_BUCKET }; }\n` });
  }
  if (lib === 'gcs' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/gcp/storage.ts`, template: `export function gcs(){ return { bucket: process.env.GCS_BUCKET }; }\n` });
  }
  if (lib === 'azure-blob' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/azure/blob.ts`, template: `export function azureBlob(){ return { container: process.env.AZURE_BLOB_CONTAINER }; }\n` });
  }

  // Logging/metrics
  if (lib === 'pino' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/logging/pino.ts`, template: `export function logger(){ return { info: console.log, error: console.error }; }\n` });
  }
  if (lib === 'winston' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/logging/winston.ts`, template: `export function logger(){ return { info: console.log, error: console.error }; }\n` });
  }
  if (lib === 'prometheus' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/metrics/prometheus.ts`, template: `export function metrics(){ return { register: {} as any }; }\n` });
  }

  // AWS/GCP messaging clients specializations
  if (lib === 'sns' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/aws/sns.ts`, template: `export async function publishSNS(topicArn: string, message: string){ /* stub */ return { topicArn, message }; }\n` });
  }
  if (lib === 'kinesis' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/aws/kinesis.ts`, template: `export async function putRecord(stream: string, data: string){ /* stub */ return { stream, data }; }\n` });
  }
  if (lib === 'pubsub' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/gcp/pubsub.ts`, template: `export async function publish(topic: string, msg: string){ /* stub */ return { topic, msg }; }\n` });
  }

  // Redis
  if (lib === 'redis' && (pattern === 'config' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/redis/client.ts`, template: `export function redis(){ return { url: process.env.REDIS_URL || 'redis://localhost:6379' }; }\n` });
  }

  // Vector DB clients
  if (lib === 'pinecone' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/pinecone.ts`, template: `export function pinecone(){ return { apiKey: process.env.PINECONE_API_KEY, index: process.env.PINECONE_INDEX }; }\n` });
  }
  if (lib === 'weaviate' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/weaviate.ts`, template: `export function weaviate(){ return { url: process.env.WEAVIATE_URL, apiKey: process.env.WEAVIATE_API_KEY }; }\n` });
  }
  if (lib === 'milvus' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/milvus.ts`, template: `export function milvus(){ return { address: process.env.MILVUS_ADDR || 'localhost:19530' }; }\n` });
  }
  if (lib === 'qdrant' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/qdrant.ts`, template: `export function qdrant(){ return { url: process.env.QDRANT_URL || 'http://localhost:6333' }; }\n` });
  }

  // Email providers
  if (lib === 'resend' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/resend.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'resend' && pattern === 'route') {
    files.push({ path: `app/api/email/send/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { sendEmail } from '@/src/email/resend';\nexport async function POST(req: Request){ const json = await req.json(); await sendEmail(json.to, json.subject); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'sendgrid' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/sendgrid.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'sendgrid' && pattern === 'route') {
    files.push({ path: `app/api/email/send/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { sendEmail } from '@/src/email/sendgrid';\nexport async function POST(req: Request){ const json = await req.json(); await sendEmail(json.to, json.subject); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'postmark' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/postmark.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'nodemailer' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/nodemailer.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }

  // Search/index providers
  if (lib === 'algolia' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/algolia.ts`, template: `export function algolia(){ return { appId: process.env.ALGOLIA_APP_ID, apiKey: process.env.ALGOLIA_API_KEY, index: process.env.ALGOLIA_INDEX }; }\n` });
  }
  if (lib === 'meilisearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/meilisearch.ts`, template: `export function meilisearch(){ return { host: process.env.MEILI_HOST || 'http://localhost:7700', apiKey: process.env.MEILI_API_KEY }; }\n` });
  }
  if (lib === 'typesense' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/typesense.ts`, template: `export function typesense(){ return { host: process.env.TYPESENSE_HOST || 'localhost', apiKey: process.env.TYPESENSE_API_KEY }; }\n` });
  }

  // Realtime
  if (lib === 'socket.io' && (pattern === 'service' || pattern === 'server' || pattern === 'config')) {
    files.push({ path: `src/realtime/socketio.ts`, template: `export function socketio(){ return { server: 'stub' }; }\n` });
  }
  if (lib === 'pusher' && pattern === 'route') {
    files.push({ path: `app/api/realtime/publish/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { pusher } from '@/src/realtime/pusher';\nexport async function POST(req: Request){ const json = await req.json(); const client = pusher(); return NextResponse.json({ ok: true, channel: json.channel }); }\n` });
  }
  if (lib === 'pusher' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/realtime/pusher.ts`, template: `export function pusher(){ return { appId: process.env.PUSHER_APP_ID }; }\n` });
  }
  if (lib === 'ably' && pattern === 'route') {
    files.push({ path: `app/api/realtime/publish/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { ably } from '@/src/realtime/ably';\nexport async function POST(req: Request){ const json = await req.json(); const client = ably(); return NextResponse.json({ ok: true, channel: json.channel }); }\n` });
  }
  if (lib === 'ably' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/realtime/ably.ts`, template: `export function ably(){ return { apiKey: process.env.ABLY_API_KEY }; }\n` });
  }

  // APM/Monitoring
  if (lib === 'datadog' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/apm/datadog.ts`, template: `export function datadog(){ return { enabled: true }; }\n` });
  }
  if (lib === 'newrelic' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/apm/newrelic.ts`, template: `export function newrelic(){ return { enabled: true }; }\n` });
  }

  // Feature flags
  if (lib === 'launchdarkly' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/flags/launchdarkly.ts`, template: `export function ld(){ return { sdkKey: process.env.LD_SDK_KEY }; }\n` });
  }
  if (lib === 'launchdarkly' && pattern === 'route') {
    files.push({ path: `app/api/flags/get/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { ld } from '@/src/flags/launchdarkly';\nexport async function GET(){ const client = ld(); return NextResponse.json({ ok: true, flag: 'example', value: true }); }\n` });
  }
  if (lib === 'unleash' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/flags/unleash.ts`, template: `export function unleash(){ return { url: process.env.UNLEASH_URL }; }\n` });
  }

  // Secrets
  if (lib === 'vault' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/secrets/vault.ts`, template: `export function vault(){ return { addr: process.env.VAULT_ADDR || 'http://127.0.0.1:8200' }; }\n` });
  }
  if (lib === 'vault' && pattern === 'route') {
    files.push({ path: `app/api/secrets/get/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { vault } from '@/src/secrets/vault';\nexport async function GET(){ const v = vault(); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'doppler' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/secrets/doppler.ts`, template: `export function doppler(){ return { project: process.env.DOPPLER_PROJECT }; }\n` });
  }

  // Extra storage/search
  if (lib === 'minio' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/storage/minio.ts`, template: `export function minio(){ return { endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000' }; }\n` });
  }
  if (lib === 'elasticsearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/elasticsearch.ts`, template: `export function elastic(){ return { node: process.env.ELASTIC_NODE || 'http://localhost:9200' }; }\n` });
  }
  if (lib === 'opensearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/opensearch.ts`, template: `export function opensearch(){ return { node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' }; }\n` });
  }

  // IoT/Cache/CDN
  if (lib === 'mqtt' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/iot/mqtt.ts`, template: `export function mqtt(){ return { url: process.env.MQTT_URL || 'mqtt://localhost:1883' }; }\n` });
  }
  if (lib === 'memcached' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/cache/memcached.ts`, template: `export function memcached(){ return { server: process.env.MEMCACHED_SERVER || '127.0.0.1:11211' }; }\n` });
  }
  if (lib === 'cloudflare-workers' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/cloudflare/worker.ts`, template: `export default { fetch(){ return new Response('ok'); } };\n` });
  }

  // i18n
  if (lib === 'i18next' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/i18n/i18next.ts`, template: `export const i18n = { lng: 'en', resources: { en: { translation: { hello: 'Hello' } } } };\n` });
  }
  if (lib === 'next-intl' && (pattern === 'config' || pattern === 'init' || pattern === 'route')) {
    files.push({ path: `src/i18n/next-intl.ts`, template: `export const messages = { en: { hello: 'Hello' }, ja: { hello: 'こんにちは' } };\n` });
    if (pattern === 'route') {
      files.push({ path: `app/api/i18n/hello/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { messages } from '@/src/i18n/next-intl';\nexport async function GET(){ return NextResponse.json({ msg: messages.en.hello }); }\n` });
    }
  }

  // CMS
  if (lib === 'strapi' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/strapi.ts`, template: `export function strapi(){ return { url: process.env.STRAPI_URL || 'http://localhost:1337' }; }\n` });
  }
  if (lib === 'contentful' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/contentful.ts`, template: `export function contentful(){ return { space: process.env.CONTENTFUL_SPACE_ID }; }\n` });
  }
  if (lib === 'sanity' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/sanity.ts`, template: `export function sanity(){ return { projectId: process.env.SANITY_PROJECT_ID }; }\n` });
  }
  if (lib === 'ghost' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/ghost.ts`, template: `export function ghost(){ return { url: process.env.GHOST_URL }; }\n` });
  }

  // Additional AI providers
  if (lib === 'groq' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/groq.ts`, template: `export function groq(){ return { apiKey: process.env.GROQ_API_KEY }; }\n` });
  }
  if (lib === 'mistral' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/mistral.ts`, template: `export function mistral(){ return { apiKey: process.env.MISTRAL_API_KEY }; }\n` });
  }
  if (lib === 'cohere' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/cohere.ts`, template: `export function cohere(){ return { apiKey: process.env.COHERE_API_KEY }; }\n` });
  }

  // Analytics
  if (lib === 'segment' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/segment.ts`, template: `export function segment(){ return { writeKey: process.env.SEGMENT_WRITE_KEY }; }\n` });
  }
  if (lib === 'amplitude' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/amplitude.ts`, template: `export function amplitude(){ return { apiKey: process.env.AMPLITUDE_API_KEY }; }\n` });
  }
  if (lib === 'mixpanel' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/mixpanel.ts`, template: `export function mixpanel(){ return { token: process.env.MIXPANEL_TOKEN }; }\n` });
  }

  // Bug tracking
  if (lib === 'bugsnag' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/bugsnag.ts`, template: `export function bugsnag(){ return { apiKey: process.env.BUGSNAG_API_KEY }; }\n` });
  }
  if (lib === 'honeybadger' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/honeybadger.ts`, template: `export function honeybadger(){ return { apiKey: process.env.HONEYBADGER_API_KEY }; }\n` });
  }

  // Config/util
  if (lib === 'dotenv' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/config/dotenv.ts`, template: `export function loadEnv(){ return { NODE_ENV: process.env.NODE_ENV || 'development' }; }\n` });
  }
  if (lib === 'lru-cache' && (pattern === 'config' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/cache/lru.ts`, template: `export function lru(){ return new Map<string, any>(); }\n` });
  }

  // Uploads/storage extras
  if (lib === 'cloudinary' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/uploads/cloudinary.ts`, template: `export function cloudinary(){ return { cloudName: process.env.CLOUDINARY_CLOUD_NAME }; }\n` });
  }
  if (lib === 'uploadthing' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/uploads/uploadthing.ts`, template: `export function uploadthing(){ return { token: process.env.UPLOADTHING_TOKEN }; }\n` });
  }
  if (lib === 'mailgun' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/mailgun.ts`, template: `export async function sendEmail(to: string, subject: string){ return { to, subject }; }\n` });
  }
  if (lib === 'paddle' && (pattern === 'client' || pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/payments/paddle.ts`, template: `export function paddle(){ return { vendorId: process.env.PADDLE_VENDOR_ID }; }\n` });
  }

  // Payments
  if (lib === 'paypal' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/payments/paypal.ts`, template: `export function paypal(){ return { clientId: process.env.PAYPAL_CLIENT_ID }; }\n` });
  }
  if (lib === 'paypal' && pattern === 'route') {
    files.push({ path: `app/api/payments/create/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { paypal } from '@/src/payments/paypal';\nexport async function POST(){ const client = paypal(); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'braintree' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/payments/braintree.ts`, template: `export function braintree(){ return { merchantId: process.env.BRAINTREE_MERCHANT_ID }; }\n` });
  }

  // Error tracking
  if (lib === 'rollbar' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/rollbar.ts`, template: `export function rollbar(){ return { accessToken: process.env.ROLLBAR_ACCESS_TOKEN }; }\n` });
  }

  // Service discovery / KV
  if (lib === 'consul' && (pattern === 'config' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/config/consul.ts`, template: `export function consul(){ return { host: process.env.CONSUL_HOST || '127.0.0.1:8500' }; }\n` });
  }
  if (lib === 'etcd' && (pattern === 'config' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/config/etcd.ts`, template: `export function etcd(){ return { endpoints: (process.env.ETCD_ENDPOINTS||'http://127.0.0.1:2379').split(',') }; }\n` });
  }

  // Job scheduler
  if (lib === 'agenda' && (pattern === 'job' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/jobs/agenda.ts`, template: `export function agenda(){ return { mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1/agenda' }; }\n` });
  }

  // Terraform
  if (lib === 'terraform' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `main.tf`, template: `terraform { required_version = ">= 1.5.0" }\n` });
  }

  // Pulumi
  if (lib === 'pulumi' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `Pulumi.yaml`, template: `name: app\nruntime: nodejs\n` });
    files.push({ path: `index.ts`, template: `import * as aws from '@pulumi/aws';\nconst bucket = new aws.s3.Bucket('bucket');\nexport const bucketName = bucket.id;\n` });
  }

  // Knex
  if (lib === 'knex' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `knexfile.ts`, template: `import type { Knex } from 'knex';\nconst config: { [key: string]: Knex.Config } = { development: { client: 'sqlite3', connection: { filename: './dev.sqlite3' }, useNullAsDefault: true, migrations: { directory: './migrations' } } };\nexport default config;\n` });
    files.push({ path: `migrations/0001_init.ts`, template: `import { Knex } from 'knex';\nexport async function up(knex: Knex){ await knex.schema.createTable('users', (t)=>{ t.increments('id'); t.string('email').unique(); t.string('name'); }); }\nexport async function down(knex: Knex){ await knex.schema.dropTable('users'); }\n` });
  }

  // Postgres (pg)
  if (lib === 'postgres' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/pg/client.ts`, template: `import { Pool } from 'pg';\nexport const pg = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres' });\n` });
  }

  // MySQL (mysql2)
  if (lib === 'mysql' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/mysql/client.ts`, template: `import mysql from 'mysql2/promise';\nexport const mysqlPool = mysql.createPool({ uri: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/app' });\n` });
  }

  // SQLite (better-sqlite3)
  if (lib === 'sqlite' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/sqlite/db.ts`, template: `import Database from 'better-sqlite3';\nexport const db = new Database('app.sqlite');\n` });
  }

  // Kubernetes
  if (lib === 'kubernetes' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `k8s/deployment.yaml`, template: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: app }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: app } }\n  template:\n    metadata: { labels: { app: app } }\n    spec:\n      containers:\n        - name: app\n          image: node:20-alpine\n          args: ['node','index.js']\n` });
    files.push({ path: `k8s/service.yaml`, template: `apiVersion: v1\nkind: Service\nmetadata: { name: app }\nspec:\n  type: ClusterIP\n  selector: { app: app }\n  ports: [{ port: 80, targetPort: 3000 }]\n` });
  }

  // Helm
  if (lib === 'helm' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `chart/Chart.yaml`, template: `apiVersion: v2\nname: app\nversion: 0.1.0\n` });
    files.push({ path: `chart/templates/deployment.yaml`, template: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: app }\nspec: { replicas: 1, selector: { matchLabels: { app: app } }, template: { metadata: { labels: { app: app } }, spec: { containers: [{ name: app, image: node:20-alpine }] } } }\n` });
  }

  // Serverless Framework
  if (lib === 'serverless' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `serverless.yml`, template: `service: app\nframeworkVersion: '3'\nprovider: { name: aws, runtime: nodejs20.x }\nfunctions: { hello: { handler: src/lambda/handler.handler, events: [{ httpApi: { path: /hello, method: get } }] } }\n` });
  }

  // GCP Cloud Functions
  if (lib === 'gcp-cloud-functions' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/gcp/functions.ts`, template: `export async function helloHttp(req: any, res: any){ res.json({ ok: true }); }\n` });
  }

  // Azure Functions
  if (lib === 'azure-functions' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `AzureFunctions/HttpTrigger1/function.json`, template: `{ \"bindings\": [{ \"authLevel\": \"function\", \"type\": \"httpTrigger\", \"direction\": \"in\", \"name\": \"req\", \"methods\": [\"get\"] }, { \"type\": \"http\", \"direction\": \"out\", \"name\": \"res\" }] }\n` });
    files.push({ path: `AzureFunctions/HttpTrigger1/index.ts`, template: `import type { Context, HttpRequest } from '@azure/functions';\nexport default async function (context: Context, _req: HttpRequest){ context.res = { status: 200, body: { ok: true } }; }\n` });
  }

  // ESLint
  if (lib === 'eslint' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `.eslintrc.cjs`, template: `module.exports = { env: { es2022: true, node: true }, extends: ['eslint:recommended'], parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }, rules: {} };\n` });
  }

  // Prettier
  if (lib === 'prettier' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `.prettierrc.json`, template: `{ \"singleQuote\": true, \"semi\": true }\n` });
  }

  // Vite
  if (lib === 'vite' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `vite.config.ts`, template: `import { defineConfig } from 'vite';\nexport default defineConfig({});\n` });
  }

  // Webpack
  if (lib === 'webpack' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `webpack.config.js`, template: `module.exports = { mode: 'development', entry: './src/index.ts', module: { rules: [ { test: /\\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] }, resolve: { extensions: ['.ts','.js'] } };\n` });
  }

  // tsup
  if (lib === 'tsup' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `tsup.config.ts`, template: `import { defineConfig } from 'tsup';\nexport default defineConfig({ entry: ['src/index.ts'], format: ['esm'], dts: false, clean: true });\n` });
  }

  // Ansible
  if (lib === 'ansible' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `ansible/playbook.yml`, template: `- hosts: all\n  tasks:\n    - name: Ping\n      ping:\n` });
  }

  // NextAuth
  if (lib === 'next-auth' && (pattern === 'config' || pattern === 'route')) {
    files.push({ path: `app/api/auth/[...nextauth]/route.ts`, template: `import NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nconst handler = NextAuth({ providers: [Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })] });\nexport { handler as GET, handler as POST };\n` });
    files.push({ path: `middleware.ts`, template: `export { default } from 'next-auth/middleware';\nexport const config = { matcher: ['/dashboard/:path*'] };\n` });
    if (style === 'advanced') {
      files.push({ path: `env.example`, template: `NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=please-change-me\nGITHUB_ID=xxx\nGITHUB_SECRET=yyy\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.ts`, template: `import GitHub from 'next-auth/providers/github';\nimport Credentials from 'next-auth/providers/credentials';\nexport const providers = [\n  GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),\n  Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })\n];\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.google.example.ts`, template: `import Google from 'next-auth/providers/google';\nexport const google = Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! });\n` });
      files.push({ path: `app/(protected)/dashboard/page.tsx`, template: `export default function Page(){ return <div>Protected Dashboard</div>; }\n` });
      files.push({ path: `src/auth/withRole.tsx`, template: `import type { ReactNode } from 'react';\nexport function withRole<TProps>(Comp: (p:TProps)=>any, required: 'user'|'admin'){\n  return function Guarded(props: TProps & { role?: 'user'|'admin'; children?: ReactNode }){\n    const role = props.role || 'user';\n    if(required==='admin' && role!=='admin'){ return null; }\n    return Comp(props);\n  }\n}\n` });
      files.push({ path: `app/(protected)/admin/page.tsx`, template: `export default function Page(){ return <div>Admin Only</div>; }\n` });
    }
  }

  // GitHub Actions CI
  if (lib === 'github-actions' && (pattern === 'config' || pattern === 'init')) {
    const basic = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm test\n`;
    const advanced = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    strategy:\n      matrix:\n        node: [18, 20, 22]\n        os: [ubuntu-latest, macos-latest]\n    runs-on: \${{ matrix.os }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \${{ matrix.node }}\n          cache: npm\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm test -- --coverage\n`;
    files.push({ path: `.github/workflows/ci.yml`, template: style === 'advanced' ? advanced : basic });
    if (style === 'advanced') {
      files.push({ path: `.github/workflows/monorepo.yml`, template: `name: Monorepo CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        package: ['packages/app', 'packages/api']\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: cd \${{ matrix.package }} && npm ci && npm test --if-present\n` });
    }
  }
  if (lib === 'github-actions' && pattern === 'job' && style === 'advanced') {
    files.push({ path: `.github/workflows/e2e.yml`, template: `name: E2E\non: [push, pull_request]\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npm run test:e2e --if-present\n` });
    files.push({ path: `.github/workflows/lint.yml`, template: `name: Lint\non: [push, pull_request]\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm run format:check --if-present\n` });
    files.push({ path: `.github/workflows/affected-tests.yml`, template: `name: Affected Tests\non: [pull_request]\njobs:\n  affected:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: echo "Run only affected tests (stub)"\n` });
  }
  // Redux Toolkit
  if (lib === 'redux' && (pattern === 'init' || pattern === 'config' || pattern === 'service' || pattern === 'store' || pattern === 'slice')) {
    files.push({ path: `src/store/store.ts`, template: `import { configureStore } from '@reduxjs/toolkit';\nimport counter from './counterSlice';\nexport const store = configureStore({ reducer: { counter } });\nexport type RootState = ReturnType<typeof store.getState>;\nexport type AppDispatch = typeof store.dispatch;\n` });
    files.push({ path: `src/store/counterSlice.ts`, template: `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\ninterface State { value: number }\nconst initialState: State = { value: 0 };\nconst slice = createSlice({ name: 'counter', initialState, reducers: { inc: (s)=> { s.value += 1; }, add: (s, a: PayloadAction<number>)=> { s.value += a.payload; } } });\nexport const { inc, add } = slice.actions;\nexport default slice.reducer;\n` });
  }

  // SWR
  if (lib === 'swr' && (pattern === 'hook' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/hooks/useHello.ts`, template: `import useSWR from 'swr';\nconst fetcher = (url: string)=> fetch(url).then(r=> r.json());\nexport function useHello(){ return useSWR('/api/hello', fetcher); }\n` });
  }

  // Radix UI
  if (lib === 'radix-ui' && (pattern === 'component' || pattern === 'init')) {
    files.push({ path: `src/components/RadixDialog.tsx`, template: `import * as Dialog from '@radix-ui/react-dialog';\nexport function RadixDialog(){ return (<Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Overlay /><Dialog.Content><Dialog.Title>Title</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>); }\n` });
  }

  // TailwindCSS
  if (lib === 'tailwindcss' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `tailwind.config.ts`, template: `import type { Config } from 'tailwindcss';\nexport default { content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'], theme: { extend: {} }, plugins: [] } satisfies Config;\n` });
    files.push({ path: `postcss.config.js`, template: `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n` });
    files.push({ path: `src/index.css`, template: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n` });
  }
  // Zod schemas
  if (lib === 'zod' && (pattern === 'schema' || pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/validation/schemas.ts`, template: `import { z } from 'zod';
export const UserSchema = z.object({ id: z.number().int().positive(), email: z.string().email(), name: z.string().optional() });
export type User = z.infer<typeof UserSchema>;
` });
  }
  // React Hook Form
  if (lib === 'react-hook-form' && (pattern === 'component' || pattern === 'hook' || pattern === 'init')) {
    files.push({ path: `src/components/LoginForm.tsx`, template: `import { useForm } from 'react-hook-form';
type Inputs = { email: string; password: string };
export function LoginForm(){ const { register, handleSubmit, formState:{ errors } } = useForm<Inputs>(); const onSubmit = (data: Inputs)=> console.log(data); return (<form onSubmit={handleSubmit(onSubmit)}><input {...register('email',{ required:true })} /><input type='password' {...register('password',{ required:true })} /><button type='submit'>Sign in</button>{errors.email && 'email req'}</form>); }
` });
  }

  // Zustand
  if (lib === 'zustand' && (pattern === 'store' || pattern === 'init' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/stores/useCounter.ts`, template: `import { create } from 'zustand';
export const useCounter = create<{ count:number; inc:()=>void; }>((set)=>({ count:0, inc:()=> set((s)=> ({ count: s.count+1 })) }));
` });
  }



  // Always include the generic stub and README
  files.push({ path: `spikes/${id}.${ext}.txt`, template: codeSnippet(lib, pattern, lang, style) });
  files.push({ path: `spikes/${id}.md`, template: `# ${lib} ${pattern} (${style}, ${lang})\n\nThis is an auto-generated spike template.\n` });
  // Testing artifacts
  if (style === 'testing') {
    if (lang === 'ts' || lang === 'js') {
      files.push({ path: `spikes/${id}.test.${lang === 'ts' ? 'ts' : 'js'}`, template: `describe('demo', ()=>{ it('works', ()=>{ expect(true).toBe(true); }); });\n` });
    }
    if (lang === 'py') {
      files.push({ path: `spikes/${id}_test.py`, template: `def test_demo():\n    assert True\n` });
    }
  }
  return files;
}

function extraParams(lib: string, pattern: string): Array<{ name: string; required?: boolean; description?: string; default?: string }>{
  const params: Array<{ name: string; required?: boolean; description?: string; default?: string }> = [];
  if (lib === 'prisma' && pattern === 'schema') {
    params.push({ name: 'model', required: false, description: 'Prisma モデル名', default: 'Item' });
  }
  if (lib === 's3') {
    params.push({ name: 'region', required: false, description: 'AWS リージョン', default: 'us-east-1' });
    params.push({ name: 'bucket', required: false, description: 'S3 バケット名', default: 'my-bucket' });
  }
  if (lib === 'stripe' && (pattern === 'service' || pattern === 'webhook')) {
    params.push({ name: 'priceId', required: false, description: 'Stripe Price ID', default: 'price_123' });
  }
  if (lib === 'redis') {
    params.push({ name: 'redisUrl', required: false, description: 'Redis 接続URL', default: 'redis://localhost:6379' });
  }
  return params;
}

export function generateSpike(id: string): SpikeSpec {
  if (!isGeneratedId(id)) {
    throw new Error(`Not a generated spike id: ${id}`);
  }
  // Remove either prefix when parsing id components
  const without = id
    .replace(new RegExp(`^${GEN_PREFIX}`), '')
    .replace(new RegExp(`^${STRIKE_PREFIX}`), '');
  const parts = without.split('-');
  if (parts.length < 4) {
    throw new Error(`Invalid generated spike id: ${id}`);
  }
  const lang = parts.pop() as string;
  const style = parts.pop() as string;
  const pat = parts.pop() as string;
  const lib = parts.join('-');
  const name = `${lib} ${pat} ${style} ${lang}`;
  const spec: SpikeSpec = {
    id,
    name,
    version: '0.1.0',
    stack: [lib, lang],
    tags: [pat, style, 'generated'].concat(id.startsWith(STRIKE_PREFIX) ? ['strike'] : []),
    description: `Auto-generated spike for ${lib} ${pat} in ${lang} (${style}).`,
    params: [{ name: 'app_name', default: `${lib}-${pat}-app` }, ...extraParams(lib, pat)],
    files: makeFiles(id, lib, pat, style, lang),
    patches: [] as SpikePatch[]
  };
  return spec;
}

export function generateMetadata(id: string): SpikeMetadata {
  const spec = generateSpike(id);
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    stack: spec.stack,
    tags: spec.tags,
    version: spec.version,
    fileCount: spec.files?.length || 0,
    patchCount: spec.patches?.length || 0
  };
}
