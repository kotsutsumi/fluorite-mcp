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

## データベース統合

### Drizzle ORM with Type Safety
```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'

// スキーマ定義
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})

// 型安全クエリ
const db = drizzle(connection)

const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com'
}).returning()

const usersList = await db.select().from(users)
```

## アーキテクチャパターン

### エッジマイクロサービス
- **APIゲートウェイ**: Cloudflare Workersによるルーティング
- **サービス**: 個別のBun/Denoアプリケーション
- **データベース**: エッジキャッシング付き分散構成
- **認証**: エッジ検証付きJWT

### サーバーレスファースト設計
- **関数**: ステートレス、イベント駆動
- **ストレージ**: オブジェクトストレージ + マネージドデータベース
- **キャッシング**: 多層エッジキャッシング
- **監視**: 分散トレーシング

### 型安全フルスタック
- **フロントエンド**: Next.js/React with tRPCクライアント
- **バックエンド**: tRPCサーバー with Drizzle ORM
- **データベース**: PostgreSQL with 型生成
- **デプロイ**: Vercel + Neon/PlanetScale

## パフォーマンス最適化

### コールドスタート軽減
- **Bun**: 超高速起動時間
- **エッジワーカー**: 常時ウォーム実行
- **コネクションプーリング**: 共有データベース接続
- **モジュールバンドリング**: 最適化されたバンドルサイズ

### キャッシング戦略
- **エッジキャッシング**: CDN + エッジコンピュートキャッシング
- **データベースキャッシング**: Redis/Upstash統合
- **アプリケーションキャッシング**: インメモリキャッシング
- **静的アセット**: プリコンパイル・キャッシング

## セキュリティベストプラクティス

### 認証・認可
- **JWT**: ステートレストークンベース認証
- **OAuth**: ソーシャルログイン統合
- **RBAC**: ロールベースアクセス制御
- **APIキー**: サービス間認証

### データ保護
- **入力検証**: Zodスキーマ検証
- **SQLインジェクション**: ORM クエリビルディング
- **CORS**: 適切なクロスオリジンポリシー
- **レート制限**: エッジベースレート制限

## 監視・可観測性

### パフォーマンス監視
- **APM**: アプリケーションパフォーマンス監視
- **メトリクス**: リクエスト遅延、スループット
- **アラート**: 自動インシデント検出
- **ダッシュボード**: リアルタイムシステム洞察

### エラートラッキング
- **Sentry**: エラー収集・分析
- **ログ**: 構造化JSONログ
- **トレーシング**: 分散リクエストトレーシング
- **デバッグ**: リモートデバッグ機能

---

::: tip はじめに
最大パフォーマンスならBun + Hono、フルスタック型安全性ならNext.js + tRPCから始めましょう。
:::

::: warning 本番考慮事項
本番サーバーレスアプリケーションでは、適切なエラーハンドリング、監視、レート制限を必ず実装してください。
:::