# スパイクテンプレート - 完全ガイド

## 概要

スパイクテンプレートは、共通パターンの実証済み実装を提供することで開発を加速する本番対応のコードスキャフォールドです。認証、API、テスト、デプロイメントなどをカバーする750+のテンプレートで、アイデアから動作するコードまで数秒で実現できます。

## スパイクテンプレートとは？

スパイクテンプレートの特徴：
- **本番対応**: 全てのテンプレートはテスト済みでベストプラクティスに従います
- **パラメータ化可能**: プロジェクト固有の値でテンプレートをカスタマイズ
- **フレームワークネイティブ**: フレームワークの規約とパターンに従います
- **型安全**: TypeScript定義と適切な型付けを含みます
- **セキュア**: セキュリティベストプラクティスと脆弱性防止を内蔵

## テンプレート発見

### 自然言語検索
```bash
# 必要なものを平易な英語で説明
fluorite-mcp discover "JWT認証システム"
fluorite-mcp discover "バリデーション付きReactフォーム"
fluorite-mcp discover "PostgreSQLを使用したREST API"
```

### インテリジェント自動選択
```bash
# AIにタスクに最適なテンプレートを選択させる
fluorite-mcp auto-spike "Next.jsアプリ用のログインシステムを作成"
```

### カテゴリ別ブラウズ
```bash
# 全ての認証テンプレートをリスト
fluorite-mcp discover --category authentication

# 全てのテストテンプレートをリスト
fluorite-mcp discover --category testing

# 特定フレームワーク用テンプレートをリスト
fluorite-mcp discover --stack nextjs
```

## テンプレートカテゴリ

### 🔐 認証・認可 (58テンプレート)

#### JWT認証
- `fastapi-jwt-auth`: JWTトークンを使用したFastAPI
- `express-jwt-auth`: Express.js JWT実装
- `nextjs-jwt-custom`: Next.jsカスタムJWT認証
- `nestjs-jwt-passport`: Passport JWTを使用したNestJS

#### OAuthプロバイダー
- `nextauth-google`: NextAuth.jsを使用したGoogle OAuth
- `nextauth-github`: GitHub OAuth統合
- `clerk-complete`: Clerk認証セットアップ
- `supabase-auth`: Supabase認証

#### セッション管理
- `express-session-redis`: Redisベースのセッション
- `fastapi-session-cookies`: Cookieベースのセッション
- `nextjs-iron-session`: 暗号化セッションCookie

### 🌐 API開発 (89テンプレート)

#### REST API
- `express-rest-crud`: 完全なCRUD API
- `fastapi-async-postgres`: PostgreSQLを使用した非同期FastAPI
- `hono-cloudflare-workers`: HonoでのエッジAPI
- `nestjs-prisma-rest`: Prisma ORMを使用したNestJS

#### GraphQL
- `apollo-server-express`: Apollo Serverセットアップ
- `graphql-yoga-nextjs`: GraphQL Yoga統合
- `pothos-graphql-schema`: Pothosでの型安全GraphQL

#### リアルタイム
- `socketio-chat`: Socket.IOでのリアルタイムチャット
- `websocket-notifications`: WebSocket通知
- `server-sent-events`: SSE実装

### 🎨 フロントエンドコンポーネント (45テンプレート)

#### フォーム
- `react-hook-form-zod`: Zodバリデーション付きフォーム
- `formik-yup-validation`: Yupスキーマ付きFormik
- `vue-vee-validate`: Vue.jsフォームバリデーション

#### UIコンポーネント
- `shadcn-data-table`: 高度なデータテーブル
- `radix-ui-dialog`: アクセシブルなモーダルダイアログ
- `mantine-dashboard`: 完全なダッシュボードレイアウト

#### 状態管理
- `zustand-persist`: 永続化グローバル状態
- `jotai-atoms`: アトミック状態管理
- `tanstack-query-infinite`: React Queryでの無限スクロール

### 🧪 テスト (58テンプレート)

#### 単体テスト
- `vitest-react-testing`: Reactコンポーネントテスト
- `jest-express-api`: APIエンドポイントテスト
- `pytest-fastapi`: FastAPIテストスイート

#### E2Eテスト
- `playwright-auth-flow`: 認証E2Eテスト
- `cypress-component`: コンポーネントテストセットアップ
- `puppeteer-screenshot`: 視覚的回帰テスト

#### パフォーマンステスト
- `k6-load-testing`: 負荷テストスクリプト
- `lighthouse-ci`: パフォーマンスCIパイプライン
- `artillery-stress-test`: ストレステスト設定

### 🏗️ インフラストラクチャ (40テンプレート)

#### Docker
- `dockerfile-node-multi`: マルチステージNode.jsビルド
- `docker-compose-full-stack`: 完全スタックセットアップ
- `dockerfile-python-slim`: 最適化Pythonイメージ

#### CI/CD
- `github-actions-deploy`: デプロイメントワークフロー
- `gitlab-ci-pipeline`: GitLab CI設定
- `jenkins-pipeline`: Jenkinsfileセットアップ

#### Kubernetes
- `k8s-deployment`: 基本デプロイメント設定
- `helm-chart-app`: Helmチャートスキャフォールド
- `k8s-ingress-tls`: TLS付きIngress

### 📊 データベース (52テンプレート)

#### SQL
- `prisma-postgresql`: PostgreSQLを使用したPrisma
- `drizzle-mysql`: Drizzle ORMセットアップ
- `typeorm-migrations`: マイグレーション付きTypeORM

#### NoSQL
- `mongodb-mongoose`: Mongooseを使用したMongoDB
- `redis-cache-layer`: Redisキャッシング実装
- `dynamodb-crud`: DynamoDB操作

#### マイグレーション
- `knex-migrations`: Knexマイグレーションシステム
- `prisma-seed-data`: データベースシーディング
- `flyway-versioning`: データベースバージョニング

## テンプレート構造

### テンプレートの解剖

```json
{
  "id": "nextjs-auth-nextauth-credentials",
  "name": "NextAuth.jsを使用したNext.js認証",
  "version": "1.0.0",
  "description": "メール/パスワードでの完全認証システム",
  
  "stack": ["nextjs", "nextauth", "typescript", "prisma"],
  "tags": ["authentication", "jwt", "session", "security"],
  
  "params": [
    {
      "name": "app_name",
      "required": true,
      "description": "アプリケーション名",
      "default": "my-app"
    },
    {
      "name": "database_url",
      "required": false,
      "description": "PostgreSQL接続文字列",
      "default": "postgresql://localhost/mydb"
    }
  ],
  
  "files": [
    {
      "path": "{{app_name}}/app/api/auth/[...nextauth]/route.ts",
      "content": "// NextAuth.js設定..."
    },
    {
      "path": "{{app_name}}/lib/auth.ts",
      "content": "// 認証ユーティリティ..."
    }
  ],
  
  "patches": [
    {
      "path": "package.json",
      "diff": "+ \"next-auth\": \"^4.24.0\""
    }
  ],
  
  "commands": [
    "npm install",
    "npx prisma generate",
    "npx prisma db push"
  ],
  
  "documentation": "## セットアップ手順\n\n1. 環境変数を設定..."
}
```

### テンプレートパラメータ

パラメータによりテンプレートのカスタマイズが可能：

```typescript
interface TemplateParam {
  name: string;           // パラメータ名（テンプレート内で{{name}}として使用）
  required: boolean;      // 必須パラメータかどうか
  description: string;    // 人間が読める説明
  default?: string;       // 提供されない場合のデフォルト値
  type?: 'string' | 'number' | 'boolean' | 'array';
  enum?: string[];        // バリデーション用の許可値
  pattern?: string;       // バリデーション用正規表現パターン
}
```

### ファイルテンプレート

テンプレートは複数のファイルを作成可能：

```typescript
interface FileTemplate {
  path: string;           // ファイルパス（{{params}}をサポート）
  content?: string;       // ファイル内容（{{params}}をサポート）
  template?: string;      // contentの代替
  encoding?: string;      // ファイルエンコーディング（デフォルト：utf-8）
  mode?: string;         // ファイル権限（Unix）
}
```

### パッチ

パッチは既存ファイルを変更：

```typescript
interface PatchTemplate {
  path: string;           // パッチ対象ファイル
  diff: string;          // 統一diff形式
  strategy?: 'merge' | 'replace' | 'append';
}
```

## テンプレートの使用

### 基本的な使用法

```bash
# 1. 利用可能なテンプレートを発見
fluorite-mcp discover "authentication"

# 2. テンプレートをプレビュー
fluorite-mcp preview nextjs-auth-nextauth-credentials

# 3. テンプレートを適用
fluorite-mcp apply nextjs-auth-nextauth-credentials \
  --param app_name=my-app \
  --param database_url=postgresql://localhost/mydb
```

### 高度な使用法

#### カスタムパラメータ
```bash
# 複数パラメータを渡す
fluorite-mcp apply fastapi-jwt-auth \
  --param project_name=my-api \
  --param secret_key=$(openssl rand -hex 32) \
  --param algorithm=HS256 \
  --param token_expiry=3600
```

#### マージ戦略
```bash
# 三方向マージ（デフォルト） - インテリジェントな競合解決
fluorite-mcp apply template-id --strategy three_way_merge

# 上書き - 既存ファイルを置換
fluorite-mcp apply template-id --strategy overwrite

# 中止 - 競合時に停止
fluorite-mcp apply template-id --strategy abort
```

#### ドライラン
```bash
# 適用せずに変更をプレビュー
fluorite-mcp apply template-id --dry-run
```

## カスタムテンプレートの作成

### テンプレート開発ワークフロー

1. **テンプレート構造の作成**
```bash
# テンプレートスキャフォールドを生成
fluorite-mcp create-template my-custom-template
```

2. **テンプレートメタデータの定義**
```json
{
  "id": "my-custom-template",
  "name": "マイカスタムテンプレート",
  "version": "1.0.0",
  "description": "このテンプレートが行うことの説明",
  "stack": ["react", "typescript"],
  "tags": ["custom", "internal"]
}
```

3. **パラメータの追加**
```json
"params": [
  {
    "name": "component_name",
    "required": true,
    "description": "Reactコンポーネント名",
    "pattern": "^[A-Z][a-zA-Z0-9]*$"
  }
]
```

4. **ファイルテンプレートの作成**
```json
"files": [
  {
    "path": "src/components/{{component_name}}/{{component_name}}.tsx",
    "content": "import React from 'react';\n\nexport const {{component_name}}: React.FC = () => {\n  return <div>{{component_name}}</div>;\n};"
  }
]
```

5. **テンプレートのテスト**
```bash
# テンプレートを検証
fluorite-mcp validate-template my-custom-template

# 適用をテスト
fluorite-mcp apply my-custom-template --test
```

### テンプレートベストプラクティス

1. **セマンティックID使用**: 説明的で検索可能なIDを選択
2. **包括的メタデータ**: stack、tags、descriptionを含める
3. **パラメータバリデーション**: パターンと列挙値をバリデーションに使用
4. **ドキュメント化**: セットアップ手順と例を含める
5. **バージョン管理**: 後方互換性のためテンプレートをバージョン管理
6. **テストカバレッジ**: テンプレートにテストファイルを含める
7. **セキュリティファースト**: デフォルトでセキュリティベストプラクティスを含める

## テンプレート例

### 例1: Reactコンポーネントテンプレート

```json
{
  "id": "react-component-typescript",
  "name": "React TypeScriptコンポーネント",
  "files": [
    {
      "path": "{{component_name}}/{{component_name}}.tsx",
      "content": "import React from 'react';\nimport styles from './{{component_name}}.module.css';\n\ninterface {{component_name}}Props {\n  // ここにpropsを追加\n}\n\nexport const {{component_name}}: React.FC<{{component_name}}Props> = (props) => {\n  return (\n    <div className={styles.container}>\n      <h1>{{component_name}}</h1>\n    </div>\n  );\n};"
    },
    {
      "path": "{{component_name}}/{{component_name}}.module.css",
      "content": ".container {\n  /* ここにスタイルを追加 */\n}"
    },
    {
      "path": "{{component_name}}/{{component_name}}.test.tsx",
      "content": "import { render, screen } from '@testing-library/react';\nimport { {{component_name}} } from './{{component_name}}';\n\ndescribe('{{component_name}}', () => {\n  it('正しくレンダリングされる', () => {\n    render(<{{component_name}} />);\n    expect(screen.getByText('{{component_name}}')).toBeInTheDocument();\n  });\n});"
    },
    {
      "path": "{{component_name}}/index.ts",
      "content": "export { {{component_name}} } from './{{component_name}}';"
    }
  ]
}
```

### 例2: APIエンドポイントテンプレート

```json
{
  "id": "express-crud-endpoint",
  "name": "Express CRUDエンドポイント",
  "files": [
    {
      "path": "routes/{{resource_name}}.ts",
      "content": "import { Router } from 'express';\nimport { z } from 'zod';\n\nconst router = Router();\n\n// バリデーションスキーマ\nconst {{resource_name}}Schema = z.object({\n  // スキーマを定義\n});\n\n// GET /{{resource_name}}\nrouter.get('/', async (req, res) => {\n  // 実装\n});\n\n// GET /{{resource_name}}/:id\nrouter.get('/:id', async (req, res) => {\n  // 実装\n});\n\n// POST /{{resource_name}}\nrouter.post('/', async (req, res) => {\n  const data = {{resource_name}}Schema.parse(req.body);\n  // 実装\n});\n\n// PUT /{{resource_name}}/:id\nrouter.put('/:id', async (req, res) => {\n  const data = {{resource_name}}Schema.parse(req.body);\n  // 実装\n});\n\n// DELETE /{{resource_name}}/:id\nrouter.delete('/:id', async (req, res) => {\n  // 実装\n});\n\nexport default router;"
    }
  ]
}
```

## パフォーマンス最適化

### テンプレートキャッシング
テンプレートは高速アクセスのためメモリにキャッシュ：
- 50テンプレート制限のLRUキャッシュ
- キャッシュエントリの5分TTL
- 更新時の自動キャッシュ無効化

### 遅延読み込み
テンプレートはオンデマンドで読み込み：
- 発見用にメタデータを最初に読み込み
- 必要時のみ完全テンプレートを読み込み
- 大きなテンプレート用のストリーミング

### 並列処理
複数テンプレートの同時処理：
- 同時ファイル生成
- 並列依存関係インストール
- バッチパラメータバリデーション

## トラブルシューティング

### よくある問題

1. **テンプレートが見つからない**
```bash
# テンプレートキャッシュを更新
fluorite-mcp update-templates

# テンプレートの存在を確認
fluorite-mcp list-templates | grep template-id
```

2. **パラメータバリデーション失敗**
```bash
# パラメータ要件をチェック
fluorite-mcp info template-id

# パラメータを検証
fluorite-mcp validate-params template-id --param key=value
```

3. **マージ競合**
```bash
# 競合防止のため中止戦略を使用
fluorite-mcp apply template-id --strategy abort

# または手動で競合を解決
fluorite-mcp apply template-id --interactive
```

## 将来の拡張

- **テンプレートマーケットプレイス**: コミュニティ貢献テンプレート
- **テンプレート合成**: 複数テンプレートの組み合わせ
- **AI生成テンプレート**: 説明からテンプレートを作成
- **テンプレート解析**: 使用統計と推奨事項
- **バージョン管理**: テンプレートバージョニングと更新