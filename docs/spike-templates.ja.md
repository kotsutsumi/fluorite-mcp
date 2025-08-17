# Fluorite MCPによるスパイク駆動開発

スパイク駆動開発は、アジャイルおよびエクストリームプログラミング（XP）から生まれたプラクティスで、プロジェクトにおけるリスクと不確実性を軽減することを目的としています。このページでは、この概念と、Fluorite MCPの豊富なテンプレートライブラリを活用して効果的な「スパイク」を実施する方法について説明します。

## スパイクとは？

**スパイク**は、特定の質問に答えたり技術的な不確実性を解決したりするために設計された、時間制限のある実験（通常1〜3日）です。その目標は本番品質のコードを作成することではなく、知識を得てアプローチを検証することです。

以下のような不確実性に直面した際にスパイクを使用すべきです：

- **新技術の評価**: 「複雑なツリービューに`react-dnd`を使用できるか？」
- **技術的実現可能性の検証**: 「1,000人の同時ユーザーに対してWebSocketでリアルタイム更新を実現できるか？」
- **複雑なロジックの探索**: 「このカスタム検証アルゴリズムを実装する最良の方法は何か？」
- **ユーザーエクスペリエンスの検証**: 「この新しいドラッグ&ドロップインタラクションはユーザーにとって直感的に感じられるか？」

## Fluorite MCPがスパイク開発を加速する方法

典型的なスパイク開発サイクルには、計画、環境セットアップ、実装、検証、最終決定が含まれます。Fluorite MCPは、**環境セットアップ**と**実装**フェーズを劇的に加速します。

新しいプロジェクトの下準備、依存関係のインストール、ボイラープレートコードの記述に何時間も費やす代わりに、スパイクテンプレートを使用して数秒で動作する独立したプロトタイプを作成できます。

- **インスタント環境**: 新しいViteやNext.jsプロジェクトを即座に開始
- **ベストプラクティス込み**: テンプレートには認証、データベース統合、テストなどの本番レディなパターンが含まれています
- **実験に集中**: セットアップではなく、解決しようとしている中核的な不確実性に貴重な時間を費やす

---

# スパイクテンプレート - 包括的な開発スキャフォールド

注意: スパイクカタログは継続的に拡張されています。サーバーツールを使用して最新のテンプレートを発見およびプレビューしてください：

- 発見: `discover-spikes { query?: string, limit?: number }`
- プレビュー: `preview-spike { id, params? }`
- 適用: `apply-spike { id, params?, strategy? }`

ヒント: 「s3」、「openapi」、「nestjs」、「kafka」、「prometheus」、「redis」などのキーワードでフィルタリングして、関連するテンプレートを素早く見つけます。現在のリポジトリには、サーバーレス、Webフレームワーク、ストレージ、メッセージング、可観測性、CI/CD、セキュリティにわたる数百のテンプレートが含まれています。

## 概要

スパイクテンプレートは、スパイク開発方法論を実装する本番レディのスキャフォールドです：**最小アプリ作成 → 検証 → 統合**。各テンプレートは、ベストプラクティスが組み込まれた動作するコードを提供します。

## テンプレートカテゴリ

### 🌐 フロントエンドフレームワーク（180+テンプレート）

#### Next.jsエコシステム（150+テンプレート）
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `nextjs-minimal` | TypeScript付きの基本SSR Next.jsアプリ | あらゆるNext.jsプロジェクトの開始点 |
| `nextjs-app-router-rsc-fetch` | サーバーコンポーネント付きApp Router | モダンNext.js開発 |
| `nextjs-api-hello` | シンプルなAPIルートハンドラー | バックエンドAPI開発 |
| `nextjs-api-edge` | Edge APIランタイム最適化 | 高性能API |
| `nextjs-api-zod-router` | Zod検証付きタイプセーフAPI | 堅牢なAPI開発 |
| `nextjs-auth-nextauth-credentials` | 完全な認証フロー | ユーザー管理システム |
| `nextjs-auth0-minimal` | Auth0統合 | エンタープライズ認証 |
| `nextauth-github-provider` | GitHub OAuth認証 | ソーシャルログイン |
| `nextauth-google-provider` | Google OAuth認証 | ソーシャルログイン |
| `clerk-nextjs-minimal` | Clerk認証 | モダン認証プラットフォーム |
| `nextjs-supabase-auth` | Supabase認証 | BaaS認証 |
| `nextjs-edge-middleware` | Edgeミドルウェアパターン | リクエスト処理 |
| `nextjs-env-zod-validate` | 環境変数検証 | 設定管理 |
| `nextjs-file-upload-route` | ファイルアップロード処理 | ファイル管理機能 |
| `nextjs-form-server-action` | フォーム用Server Actions | モダンフォーム処理 |
| `nextjs-i18n-minimal` | 国際化セットアップ | 多言語アプリケーション |
| `nextjs-image-optimization` | Next.js画像最適化 | パフォーマンス最適化 |
| `nextjs-isr-page` | 増分静的再生成 | 動的静的サイト |
| `nextjs-middleware-basic-auth` | 認証ミドルウェア | セキュリティ実装 |
| `nextjs-prisma-sqlite-crud` | PrismaによるフルスタックCRUD | データベース駆動アプリケーション |
| `nextjs-ratelimit-middleware` | レート制限実装 | API保護 |
| `nextjs-route-params` | 動的ルート処理 | URLパラメータ処理 |
| `nextjs-s3-presigned-upload` | AWS S3ファイルアップロード | クラウドファイルストレージ |
| `nextjs-gcs-signed-url` | Google Cloud Storageアップロード | GCS統合 |
| `nextjs-route-headers-cookies` | ヘッダーとCookie処理 | APIユーティリティ |
| `nextjs-route-streaming` | ストリーミングAPI応答 | リアルタイムデータ |
| `nextjs-edge-fetch-cache` | Edgeフェッチキャッシュ制御 | パフォーマンス最適化 |
| `nextjs-route-error-retry` | リトライ付きエラー処理 | 回復力パターン |
| `nextjs-middleware-ab-test` | A/Bテストミドルウェア | 実験機能 |
| `nextjs-safe-action` | タイプセーフサーバーアクション | セキュアアクション処理 |
| `nextjs-supabase-client` | Supabase統合 | フルスタック開発 |
| `nextjs-upstash-ratelimit` | Upstashレート制限 | 分散レート制限 |
| `nextauth-prisma-adapter` | NextAuth Prismaアダプター | 認証データベース統合 |
| `nextjs-isr-on-demand` | オンデマンドISR再検証 | 動的静的再生成 |
| `nextjs-middleware-geo-target` | ジオターゲティングミドルウェア | 位置ベースルーティング |
| `nextjs-prom-client-metrics` | Prometheusメトリクスエンドポイント | 監視統合 |
| `nextjs-route-formdata-upload` | FormDataファイルアップロード | ファイル処理 |

#### Reactエコシステム（17テンプレート）
| テンプレート | 説明 | スタック |
|----------|-------------|-------|
| `react-vite-minimal` | React + Vite TypeScriptスターター | React, Vite, TypeScript |
| `react-hook-form-zod-login` | Zodによるフォーム検証 | React Hook Form, Zod |
| `react-hook-form-yup-login` | Yupによるフォーム検証 | React Hook Form, Yup |
| `react-hook-form-valibot-login` | Valibotによるフォーム検証 | React Hook Form, Valibot |
| `react-i18next-minimal` | 国際化 | i18next |
| `react-intl-minimal` | React Intl国際化 | React Intl |
| `react-jotai-minimal` | アトミック状態管理 | Jotai |
| `react-redux-toolkit-counter` | Redux状態管理 | Redux Toolkit |
| `react-tanstack-query-fetch` | データ取得とキャッシュ | TanStack Query |
| `react-zustand-counter` | 軽量状態管理 | Zustand |
| `react-tailwind-vite` | React + Tailwind CSS + Vite | Tailwind CSS |

### 🚀 バックエンド開発（200+テンプレート）

#### Node.js/TypeScript（120+テンプレート）
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `express-minimal` | 基本的なExpressサーバー | APIバックエンド |
| `express-mongoose-crud` | MongoDB CRUD API | データベースAPI |
| `express-prisma-crud` | Prisma ORM CRUD | 型安全なデータベース操作 |
| `express-jwt-auth` | JWT認証 | API認証 |
| `express-oauth2-google` | Google OAuth2統合 | ソーシャル認証 |
| `express-rate-limiting` | レート制限 | API保護 |
| `express-file-upload` | ファイルアップロード | ファイル管理 |
| `express-websocket-chat` | WebSocketチャット | リアルタイム通信 |
| `express-graphql-minimal` | GraphQL API | GraphQLバックエンド |
| `hono-minimal` | 基本的なHonoサーバー | エッジランタイムAPI |
| `hono-cloudflare-workers` | Cloudflare Workers統合 | サーバーレスAPI |
| `hono-jwt-middleware` | JWT認証ミドルウェア | API認証 |
| `hono-cors-middleware` | CORS設定 | API設定 |
| `nestjs-minimal` | NestJSアプリケーション | エンタープライズAPI |
| `nestjs-typeorm-crud` | TypeORM CRUD | データベース統合 |
| `nestjs-passport-jwt` | Passport JWT認証 | 認証システム |
| `nestjs-graphql-schema-first` | GraphQLスキーマファースト | GraphQL開発 |

#### Python/FastAPI（35+テンプレート）
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `fastapi-minimal` | 基本的なFastAPIアプリ | Python API |
| `fastapi-sqlalchemy-crud` | SQLAlchemy CRUD | データベースAPI |
| `fastapi-auth-jwt` | JWT認証 | API認証 |
| `fastapi-oauth2-google` | Google OAuth2 | ソーシャル認証 |
| `fastapi-websocket-chat` | WebSocketチャット | リアルタイム通信 |
| `fastapi-graphql-strawberry` | Strawberry GraphQL | GraphQL API |
| `fastapi-celery-redis` | Celeryタスクキュー | 非同期処理 |
| `fastapi-middleware-cors` | CORS設定 | API設定 |

#### Laravel/PHP（25+テンプレート）
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `laravel-minimal` | 基本的なLaravelアプリ | PHP Webアプリ |
| `laravel-api-crud` | API CRUD | RESTful API |
| `laravel-auth-sanctum` | Sanctum認証 | API認証 |
| `laravel-passport-oauth` | Passport OAuth | OAuth認証 |
| `laravel-queue-redis` | Redisキュー | 非同期処理 |
| `laravel-websocket-pusher` | Pusher WebSocket | リアルタイム機能 |

#### Rust（20+テンプレート）
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `rust-axum-minimal` | Axum Webフレームワーク | 高性能API |
| `rust-warp-api` | Warp Webフレームワーク | 軽量API |
| `rust-tokio-chat` | Tokio WebSocketチャット | 非同期通信 |
| `rust-diesel-crud` | Diesel ORM CRUD | データベース操作 |
| `rust-tauri-minimal` | Tauriデスクトップアプリ | クロスプラットフォームアプリ |

### 📊 データベース・ストレージ（80+テンプレート）

#### データベース統合
| テンプレート | 説明 | データベース |
|----------|-------------|----------|
| `prisma-sqlite-minimal` | SQLite Prismaセットアップ | SQLite |
| `prisma-postgresql-crud` | PostgreSQL CRUD | PostgreSQL |
| `prisma-mysql-crud` | MySQL CRUD | MySQL |
| `mongoose-mongodb-crud` | MongoDB操作 | MongoDB |
| `typeorm-postgresql-crud` | TypeORM PostgreSQL | PostgreSQL |
| `sequelize-mysql-crud` | Sequelize MySQL | MySQL |
| `drizzle-sqlite-crud` | Drizzle SQLite | SQLite |
| `kysely-postgresql-crud` | Kysely PostgreSQL | PostgreSQL |

#### ストレージソリューション
| テンプレート | 説明 | ストレージ |
|----------|-------------|----------|
| `aws-s3-upload` | S3ファイルアップロード | AWS S3 |
| `gcp-storage-upload` | GCS ファイルアップロード | Google Cloud Storage |
| `azure-blob-upload` | Azure Blobアップロード | Azure Storage |
| `cloudinary-upload` | Cloudinary画像アップロード | Cloudinary |
| `uploadthing-nextjs` | UploadThing統合 | UploadThing |

### 🔐 認証・セキュリティ（60+テンプレート）

#### 認証システム
| テンプレート | 説明 | 認証方式 |
|----------|-------------|----------|
| `nextauth-credentials` | 認証情報ログイン | NextAuth |
| `nextauth-oauth-github` | GitHub OAuth | NextAuth + GitHub |
| `nextauth-oauth-google` | Google OAuth | NextAuth + Google |
| `auth0-nextjs` | Auth0統合 | Auth0 |
| `clerk-nextjs` | Clerk認証 | Clerk |
| `supabase-auth` | Supabase認証 | Supabase |
| `firebase-auth` | Firebase認証 | Firebase |

#### セキュリティ機能
| テンプレート | 説明 | セキュリティ |
|----------|-------------|----------|
| `jwt-token-auth` | JWT認証 | JWT |
| `oauth2-implementation` | OAuth2サーバー | OAuth2 |
| `rate-limiting-redis` | Redisレート制限 | レート制限 |
| `csrf-protection` | CSRF保護 | CSRF |
| `helmet-security` | Helmetセキュリティ | セキュリティヘッダー |

### ☁️ クラウド・デプロイメント（70+テンプレート）

#### Vercel
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `vercel-nextjs-deploy` | Next.js Vercelデプロイ | Webアプリデプロイ |
| `vercel-edge-functions` | Vercel Edge Functions | エッジコンピューティング |
| `vercel-serverless-api` | サーバーレスAPI | API デプロイ |

#### AWS
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `aws-lambda-nodejs` | Node.js Lambda関数 | サーバーレス |
| `aws-lambda-python` | Python Lambda関数 | サーバーレス |
| `aws-api-gateway` | API Gateway統合 | APIデプロイ |
| `aws-dynamodb-crud` | DynamoDB操作 | NoSQLデータベース |
| `aws-s3-static-site` | S3静的サイト | 静的ホスティング |

#### Docker
| テンプレート | 説明 | 用途 |
|----------|-------------|----------|
| `docker-nodejs` | Node.jsコンテナ | コンテナ化 |
| `docker-python-fastapi` | FastAPIコンテナ | Pythonコンテナ |
| `docker-nginx-proxy` | Nginxプロキシ | リバースプロキシ |
| `docker-compose-fullstack` | フルスタック構成 | 開発環境 |

### 🧪 テスト・品質（40+テンプレート）

#### テストフレームワーク
| テンプレート | 説明 | テストタイプ |
|----------|-------------|----------|
| `vitest-unit-testing` | Vitestユニットテスト | ユニットテスト |
| `jest-testing-setup` | Jest テストセットアップ | ユニットテスト |
| `playwright-e2e-testing` | Playwright E2Eテスト | E2Eテスト |
| `cypress-e2e-testing` | Cypress E2Eテスト | E2Eテスト |
| `react-testing-library` | React テストライブラリ | コンポーネントテスト |

#### 品質保証
| テンプレート | 説明 | 品質管理 |
|----------|-------------|----------|
| `eslint-prettier-setup` | ESLint + Prettier | コード品質 |
| `husky-lint-staged` | Git hooks | コミット品質 |
| `commitlint-conventional` | コミットメッセージ規約 | コミット管理 |

### 📈 監視・可観測性（30+テンプレート）

#### メトリクス・監視
| テンプレート | 説明 | 監視ツール |
|----------|-------------|----------|
| `prometheus-metrics` | Prometheusメトリクス | メトリクス収集 |
| `grafana-dashboard` | Grafanaダッシュボード | データ可視化 |
| `datadog-integration` | Datadog統合 | APM監視 |
| `newrelic-monitoring` | New Relic監視 | パフォーマンス監視 |

#### ログ・トレーシング
| テンプレート | 説明 | ログツール |
|----------|-------------|----------|
| `winston-logging` | Winston ログ | 構造化ログ |
| `pino-logging` | Pino ログ | 高性能ログ |
| `jaeger-tracing` | Jaeger分散トレーシング | トレーシング |
| `zipkin-tracing` | Zipkin分散トレーシング | トレーシング |

## 🛠️ 開発ツール・ユーティリティ（50+テンプレート）

### ビルドツール
| テンプレート | 説明 | ツール |
|----------|-------------|----------|
| `vite-typescript` | Vite + TypeScript | ビルドツール |
| `webpack-config` | Webpack設定 | バンドラー |
| `rollup-library` | Rollupライブラリ | ライブラリビルド |
| `turbo-monorepo` | Turbo monorepo | モノレポ管理 |

### CI/CD
| テンプレート | 説明 | CI/CD |
|----------|-------------|----------|
| `github-actions-nodejs` | GitHub Actions Node.js | CI/CD |
| `github-actions-python` | GitHub Actions Python | CI/CD |
| `gitlab-ci-docker` | GitLab CI Docker | CI/CD |
| `jenkins-pipeline` | Jenkins パイプライン | CI/CD |

## 使用方法

### 1. テンプレートの発見
```bash
# キーワードでテンプレートを検索
fluorite discover-spikes --query "nextjs auth"

# カテゴリでフィルタリング
fluorite discover-spikes --query "backend python"

# 制限数を指定
fluorite discover-spikes --limit 10
```

### 2. テンプレートのプレビュー
```bash
# テンプレートの詳細を確認
fluorite preview-spike --id "nextjs-auth-nextauth-credentials"

# パラメータ付きプレビュー
fluorite preview-spike --id "express-minimal" --params '{"port": 8080}'
```

### 3. テンプレートの適用
```bash
# 基本的な適用
fluorite apply-spike --id "nextjs-minimal"

# パラメータ指定
fluorite apply-spike --id "nextjs-api-zod-router" --params '{"apiVersion": "v2"}'

# 適用戦略指定
fluorite apply-spike --id "react-vite-minimal" --strategy "merge"
```

## ベストプラクティス

### スパイク開発のガイドライン

1. **明確な目標設定**: スパイクで解決したい具体的な質問を定義
2. **時間制限**: 1-3日の明確な時間制限を設定
3. **最小実装**: 質問に答えるのに必要最小限の機能のみ実装
4. **学習の記録**: 得られた知見と決定事項を文書化
5. **次ステップの決定**: 本番実装に進むか別のアプローチを探るかを決定

### テンプレート選択のコツ

1. **目的に合致**: 解決したい問題に最も近いテンプレートを選択
2. **技術スタック**: チームの得意な技術スタックを考慮
3. **スケーラビリティ**: 将来の拡張性を念頭に置いた選択
4. **セキュリティ**: 認証やセキュリティ要件を考慮
5. **パフォーマンス**: 性能要件に適したテンプレートを選択

## 高度な使用例

### カスタムパラメータ
```json
{
  "projectName": "my-spike",
  "port": 3001,
  "database": "postgresql",
  "authProvider": "auth0",
  "features": ["api", "auth", "database"]
}
```

### 複数テンプレートの組み合わせ
```bash
# フロントエンド
fluorite apply-spike --id "nextjs-minimal"

# バックエンドAPI
fluorite apply-spike --id "express-prisma-crud" --target "./api"

# 認証サービス
fluorite apply-spike --id "nextauth-credentials" --merge
```

### チーム開発での活用
```bash
# 共有設定ファイル
cat > spike-config.json << EOF
{
  "defaultStack": "nextjs-typescript",
  "authProvider": "auth0",
  "database": "postgresql",
  "deployment": "vercel"
}
EOF

# 設定ファイルを使用した適用
fluorite apply-spike --config spike-config.json
```

## まとめ

Fluorite MCPのスパイクテンプレートシステムは、不確実性を解決し、技術的な意思決定を迅速化するための強力なツールです。750+のテンプレートから適切なものを選択し、効率的なスパイク駆動開発を実践してください。

詳細な情報については、以下のリソースを参照してください：
- [インストールガイド](./installation.ja.md) - セットアップ手順
- [機能リファレンス](./function-reference.ja.md) - API詳細
- [統合ガイド](./integration-guide.ja.md) - 開発ワークフロー統合
- [トラブルシューティング](./troubleshooting.ja.md) - 問題解決