# モダンバックエンド・サーバーレスエコシステム

`spec://modern-backend-serverless-ecosystem`

## 概要

最新のバックエンド技術とサーバーレスアーキテクチャのための包括的エコシステム仕様です。Bun、Deno、エッジコンピューティング、型安全API開発を網羅しています。

## 主要コンポーネント

### ランタイム
- **Bun** - 高速JavaScript/TypeScriptランタイム
- **Deno** - セキュアなTypeScriptランタイム
- **Node.js** - 実績のあるJavaScriptランタイム

### Webフレームワーク
- **Hono** - 超高速Webフレームワーク
- **Fastify** - 高性能Node.jsフレームワーク
- **Elysia** - Bun用型安全フレームワーク

### API開発
- **tRPC** - エンドツーエンド型安全API
- **GraphQL Yoga** - フル機能GraphQLサーバー
- **Drizzle ORM** - TypeScript SQLクエリビルダー

### エッジコンピューティング
- **Cloudflare Workers** - エッジランタイム
- **Vercel Edge Functions** - エッジ関数
- **Deno Deploy** - グローバルエッジプラットフォーム

## 実装例

### Bun + Hono 高速API
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { jwt } from 'hono/jwt'

const app = new Hono()

// ミドルウェア
app.use('*', cors())
app.use('*', logger())

// JWT認証
app.use('/api/*', jwt({
  secret: process.env.JWT_SECRET!
}))

// ルート定義
app.get('/api/users', async (c) => {
  const users = await db.select().from(usersTable)
  return c.json(users)
})

app.post('/api/users', async (c) => {
  const body = await c.req.json()
  const user = await db.insert(usersTable).values(body).returning()
  return c.json(user[0], 201)
})

// Bunサーバー起動
export default {
  port: 3000,
  fetch: app.fetch,
}
```

### tRPC 型安全API
```typescript
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

// 入力バリデーション
const createUserInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0)
})

// ルーター定義
export const appRouter = t.router({
  users: t.router({
    list: t.procedure.query(async () => {
      return await db.user.findMany()
    }),
    
    create: t.procedure
      .input(createUserInput)
      .mutation(async ({ input }) => {
        return await db.user.create({ data: input })
      }),
    
    getById: t.procedure
      .input(z.string())
      .query(async ({ input }) => {
        return await db.user.findUnique({
          where: { id: input }
        })
      })
  })
})

// 型エクスポート
export type AppRouter = typeof appRouter
```

### Deno エッジ関数
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface RequestBody {
  message: string
}

serve(async (req: Request) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  try {
    const body: RequestBody = await req.json()
    
    // ビジネスロジック
    const result = await processMessage(body.message)
    
    return new Response(JSON.stringify({ result }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

### GraphQL Yoga サーバー
```typescript
import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'node:http'

const schema = createSchema({
  typeDefs: `
    type User {
      id: ID!
      name: String!
      email: String!
      posts: [Post!]!
    }
    
    type Post {
      id: ID!
      title: String!
      content: String!
      author: User!
    }
    
    type Query {
      users: [User!]!
      user(id: ID!): User
      posts: [Post!]!
    }
    
    type Mutation {
      createUser(name: String!, email: String!): User!
      createPost(title: String!, content: String!, authorId: ID!): Post!
    }
  `,
  resolvers: {
    Query: {
      users: () => db.user.findMany(),
      user: (_, { id }) => db.user.findUnique({ where: { id } }),
      posts: () => db.post.findMany()
    },
    Mutation: {
      createUser: (_, args) => db.user.create({ data: args }),
      createPost: (_, args) => db.post.create({ data: args })
    }
  }
})

const yoga = createYoga({ schema })
const server = createServer(yoga)

server.listen(4000, () => {
  console.log('GraphQL server running on http://localhost:4000/graphql')
})
```

## ベストプラクティス

- 型安全性の確保
- エラーハンドリングの実装
- 認証・認可の適切な実装
- レート制限の設定
- キャッシング戦略の実装

## リソース

- [Bun ドキュメント](https://bun.sh/docs)
- [Deno ドキュメント](https://deno.land/manual)
- [Hono ドキュメント](https://hono.dev)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/modern-backend-serverless-ecosystem.yaml)