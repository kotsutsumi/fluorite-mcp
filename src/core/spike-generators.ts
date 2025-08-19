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
  'github-actions'
];

const PATTERNS = [
  'minimal','init','config','route','controller','service','client','crud','webhook','job'
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
  return id.startsWith(GEN_PREFIX);
}

export function listGeneratedSpikeIds(): string[] {
  const ids: string[] = [];
  const limit = getLimit();
  outer: for (const lib of LIBRARIES) {
    for (const pat of PATTERNS) {
      for (const style of STYLES) {
        for (const lang of LANGS) {
          const id = `${GEN_PREFIX}${lib}-${pat}-${style}-${lang}`;
          ids.push(id);
          if (limit !== undefined && ids.length >= limit) break outer;
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
    files.push({
      path: `src/graphql/useUpdateTitle.tsx`,
      template: `import { gql, useMutation } from '@apollo/client';\nconst UPDATE = gql\`mutation($id: ID!, $title: String!){ updateTitle(id:$id, title:$title){ id title } }\`;\nexport function useUpdateTitle(){\n  return useMutation(UPDATE, {\n    optimisticResponse: (vars)=>({ updateTitle: { __typename: 'Post', id: vars.id, title: vars.title } })\n  });\n}\n`
    });
    files.push({ path: `src/graphql/cache.ts`, template: `import type { ApolloCache, DefaultContext, MutationUpdaterFunction } from '@apollo/client';\nexport const noopUpdate: MutationUpdaterFunction<any, any, DefaultContext, ApolloCache<any>> = () => {};\n` });
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

  // NextAuth
  if (lib === 'next-auth' && (pattern === 'config' || pattern === 'route')) {
    files.push({ path: `app/api/auth/[...nextauth]/route.ts`, template: `import NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nconst handler = NextAuth({ providers: [Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })] });\nexport { handler as GET, handler as POST };\n` });
    files.push({ path: `middleware.ts`, template: `export { default } from 'next-auth/middleware';\nexport const config = { matcher: ['/dashboard/:path*'] };\n` });
    if (style === 'advanced') {
      files.push({ path: `env.example`, template: `NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=please-change-me\nGITHUB_ID=xxx\nGITHUB_SECRET=yyy\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.ts`, template: `import GitHub from 'next-auth/providers/github';\nimport Credentials from 'next-auth/providers/credentials';\nexport const providers = [\n  GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),\n  Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })\n];\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.google.example.ts`, template: `import Google from 'next-auth/providers/google';\nexport const google = Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! });\n` });
      files.push({ path: `app/(protected)/dashboard/page.tsx`, template: `export default function Page(){ return <div>Protected Dashboard</div>; }\n` });
    }
  }

  // GitHub Actions CI
  if (lib === 'github-actions' && (pattern === 'config' || pattern === 'init')) {
    const basic = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm test\n`;
    const advanced = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    strategy:\n      matrix:\n        node: [18, 20, 22]\n        os: [ubuntu-latest, macos-latest]\n    runs-on: \${{ matrix.os }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \${{ matrix.node }}\n          cache: npm\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm test -- --coverage\n`;
    files.push({ path: `.github/workflows/ci.yml`, template: style === 'advanced' ? advanced : basic });
  }
  if (lib === 'github-actions' && pattern === 'job' && style === 'advanced') {
    files.push({ path: `.github/workflows/e2e.yml`, template: `name: E2E\non: [push, pull_request]\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npm run test:e2e --if-present\n` });
    files.push({ path: `.github/workflows/lint.yml`, template: `name: Lint\non: [push, pull_request]\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm run format:check --if-present\n` });
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

export function generateSpike(id: string): SpikeSpec {
  if (!isGeneratedId(id)) {
    throw new Error(`Not a generated spike id: ${id}`);
  }
  const without = id.replace(new RegExp(`^${GEN_PREFIX}`), '');
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
    tags: [pat, style, 'generated'],
    description: `Auto-generated spike for ${lib} ${pat} in ${lang} (${style}).`,
    params: [{ name: 'app_name', default: `${lib}-${pat}-app` }],
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
