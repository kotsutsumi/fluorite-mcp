# スパイクテンプレート - エンタープライズ開発アクセラレーター

**6,200以上の本番対応テンプレート** で即座のプロトタイピングと開発の加速を実現。Fluorite MCP の包括的なテンプレートライブラリで、アイデアを動作するコードに数秒で変換します。

## 🚀 クイックスタート

```bash
# 自然言語を使ったテンプレート発見
fluorite-mcp discover "認証システム"
fluorite-mcp discover "検証付き React フォーム"
fluorite-mcp discover "PostgreSQL を使った REST API"

# 最適なテンプレートの自動選択と適用
fluorite-mcp auto-spike "Next.js アプリのログインシステムを作成"

# 適用前のプレビュー
fluorite-mcp preview-spike nextauth-setup --params app_name=my-app

# パラメーター付きでテンプレートを適用
fluorite-mcp apply-spike nextauth-setup \
  --params app_name=my-app,database_url=postgresql://...
```

## スパイク駆動開発とは？

**スパイク** は特定の質問に答えるか、技術的な不確実性を解決するために設計されたタイムボックス化された実験（通常1-3日）です。目標は本番品質のコードを生産することではなく、知識を得てアプローチを検証することです。

### スパイクテンプレートを使用する場面

- **🔬 技術評価**: 「複雑なツリービューに `react-dnd` を使用できますか？」
- **⚡ 実現可能性テスト**: 「1,000の同時ユーザーに対してWebSocketでリアルタイム更新を実現できますか？」
- **🧪 プロトタイプ開発**: 「このカスタム検証アルゴリズムを実装する最適な方法は何ですか？」
- **🎨 UX 検証**: 「この新しいドラッグアンドドロップの相互作用はユーザーにとって直感的に感じられますか？」
- **🚀 高速プロトタイピング**: 「ステークホルダーレビューのための実働デモを構築」
- **📚 新技術の学習**: 「Next.js App Router の機能を探索」

## 💎 主要利点

### 即座の開発環境
- **⚡ ゼロセットアップ時間**: 数時間ではなく数秒で動作するプロトタイプ
- **🏆 本番品質**: 業界のベストプラクティスとTypeScript型を含む
- **🔧 事前設定済み**: 依存関係、ビルドツール、テストが準備完了
- **🎯 価値に集中**: ビジネスロジックに時間を費やし、ボイラープレートは不要

### テンプレート インテリジェンス
- **🧠 自然言語による発見**: 平易な日本語を使ったテンプレート検索
- **🤖 自動選択**: AI があなたのニーズに最適なテンプレートを選択
- **🔄 スマートマージ**: テンプレート適用時のインテリジェントな競合解決
- **📊 利用解析**: 成功したテンプレート適用から学習

## 🛠️ テンプレート発見と適用

### 発見方法

#### 自然言語検索
```bash
# 記述的なクエリを使ったテンプレート検索
fluorite-mcp discover "リフレッシュトークン付きJWT認証"
fluorite-mcp discover "チャート付きReactダッシュボード"
fluorite-mcp discover "DynamoDB付きサーバーレスAPI"
```

#### カテゴリブラウジング
```bash
# カテゴリで閲覧
fluorite-mcp list-spikes --category authentication
fluorite-mcp list-spikes --category frontend --framework react
fluorite-mcp list-spikes --category database --type nosql
```

#### キーワードフィルタリング
```bash
# 特定の技術でフィルタリング
fluorite-mcp discover --keywords "s3,presigned,upload"
fluorite-mcp discover --keywords "kafka,streaming,event"
fluorite-mcp discover --keywords "redis,cache,session"
```

### 適用ワークフロー

#### 1. テンプレートプレビュー
```bash
# 生成される内容を確認
fluorite-mcp preview-spike nextauth-jwt \
  --params app_name=my-app,port=3000
```

#### 2. パラメーター付きで適用
```bash
# カスタム設定でファイルを生成
fluorite-mcp apply-spike nextauth-jwt \
  --params app_name=my-app,\
           database_url=postgresql://localhost/mydb,\
           jwt_secret=$(openssl rand -base64 32)
```

#### 3. 競合解決
```bash
# 既存ファイルをインテリジェントに処理
fluorite-mcp apply-spike api-routes \
  --strategy three_way_merge  # または: overwrite, abort
```

## 概要

スパイクテンプレートは、スパイク開発手法を実装した本番対応のスキャフォールドです： **最小アプリ作成 → 検証 → 統合**。各テンプレートは組み込まれたベストプラクティスと動作するコードを提供します。

## テンプレートカテゴリ

### 🌐 フロントエンドフレームワーク（180以上のテンプレート）

#### Next.js エコシステム（150以上のテンプレート）
| テンプレート | 説明 | 使用例 |
|----------|-------------|----------|
| `nextjs-minimal` | TypeScript 付き基本 SSR Next.js アプリ | あらゆる Next.js プロジェクトの出発点 |
| `nextjs-app-router-rsc-fetch` | Server Components 付き App Router | モダンな Next.js 開発 |
| `nextjs-api-hello` | シンプル API ルートハンドラー | バックエンド API 開発 |
| `nextjs-api-edge` | Edge API ランタイム最適化 | 高性能 API |
| `nextjs-api-zod-router` | Zod 検証付き型安全 API | 堅牢な API 開発 |
| `nextjs-auth-nextauth-credentials` | 完全な認証フロー | ユーザー管理システム |
| `nextjs-auth0-minimal` | Auth0 統合 | エンタープライズ認証 |
| `nextauth-github-provider` | GitHub OAuth 認証 | ソーシャルログイン |
| `nextauth-google-provider` | Google OAuth 認証 | ソーシャルログイン |
| `clerk-nextjs-minimal` | Clerk 認証 | モダンな認証プラットフォーム |
| `nextjs-supabase-auth` | Supabase 認証 | BaaS 認証 |
| `nextjs-edge-middleware` | エッジミドルウェアパターン | リクエスト処理 |
| `nextjs-env-zod-validate` | 環境検証 | 設定管理 |
| `nextjs-file-upload-route` | ファイルアップロード処理 | ファイル管理機能 |
| `nextjs-form-server-action` | フォーム用 Server Actions | モダンなフォーム処理 |
| `nextjs-i18n-minimal` | 国際化セットアップ | 多言語アプリケーション |
| `nextjs-image-optimization` | Next.js 画像最適化 | パフォーマンス最適化 |
| `nextjs-isr-page` | 増分静的再生成 | 動的な静的サイト |
| `nextjs-middleware-basic-auth` | 認証ミドルウェア | セキュリティ実装 |
| `nextjs-prisma-sqlite-crud` | Prisma 付きフルスタック CRUD | データベース駆動アプリケーション |
| `nextjs-ratelimit-middleware` | レート制限実装 | API 保護 |
| `nextjs-route-params` | 動的ルート処理 | URL パラメーター処理 |
| `nextjs-s3-presigned-upload` | AWS S3 ファイルアップロード | クラウドファイルストレージ |
| `nextjs-gcs-signed-url` | Google Cloud Storage アップロード | GCS 統合 |
| `nextjs-route-headers-cookies` | ヘッダーとクッキー処理 | API ユーティリティ |
| `nextjs-route-streaming` | ストリーミング API レスポンス | リアルタイムデータ |
| `nextjs-edge-fetch-cache` | エッジフェッチキャッシュ制御 | パフォーマンス最適化 |
| `nextjs-route-error-retry` | リトライ付きエラー処理 | 復元力パターン |
| `nextjs-middleware-ab-test` | A/B テストミドルウェア | 実験 |
| `nextjs-safe-action` | 型安全サーバーアクション | セキュアなアクション処理 |
| `nextjs-supabase-client` | Supabase 統合 | フルスタック開発 |
| `nextjs-upstash-ratelimit` | Upstash レート制限 | 分散レート制限 |
| `nextauth-prisma-adapter` | NextAuth Prisma アダプター | 認証データベース統合 |
| `nextjs-isr-on-demand` | オンデマンド ISR 再検証 | 動的な静的再生成 |
| `nextjs-middleware-geo-target` | 地域ターゲティングミドルウェア | 位置ベースルーティング |
| `nextjs-prom-client-metrics` | Prometheus メトリクスエンドポイント | 監視統合 |
| `nextjs-route-formdata-upload` | FormData ファイルアップロード | ファイル処理 |

#### React エコシステム（17テンプレート）
| テンプレート | 説明 | スタック |
|----------|-------------|-------|
| `react-vite-minimal` | React + Vite TypeScript スターター | React, Vite, TypeScript |
| `react-hook-form-zod-login` | Zod 付きフォーム検証 | React Hook Form, Zod |
| `react-hook-form-yup-login` | Yup 付きフォーム検証 | React Hook Form, Yup |
| `react-hook-form-valibot-login` | Valibot 付きフォーム検証 | React Hook Form, Valibot |
| `react-i18next-minimal` | 国際化 | i18next |
| `react-intl-minimal` | React Intl 国際化 | React Intl |
| `react-jotai-minimal` | アトミック状態管理 | Jotai |
| `react-redux-toolkit-counter` | Redux 状態管理 | Redux Toolkit |
| `react-tanstack-query-fetch` | データフェッチングとキャッシュ | TanStack Query |
| `react-zustand-counter` | 軽量状態管理 | Zustand |
| `react-tailwind-vite` | React + Tailwind CSS + Vite | Tailwind CSS |

#### Vue エコシステム（2テンプレート）
| テンプレート | 説明 | 機能 |
|----------|-------------|----------|
| `vue-vite-minimal` | Vue 3 + Vite スターター | Composition API, TypeScript |
| `vue-pinia-minimal` | Pinia 状態管理付き Vue 3 | Pinia, リアクティブ状態 |

#### その他のフレームワーク（3テンプレート）
| テンプレート | 説明 | フレームワーク |
|----------|-------------|-----------|
| `nuxt-minimal` | Nuxt.js スターター | ユニバーサル Vue.js |
| `sveltekit-minimal` | SvelteKit アプリケーション | Svelte + Kit |
| `next-tailwind-setup` | Next.js + Tailwind CSS セットアップ | スタイリングフレームワーク |
| `next-shadcn-setup` | Next.js shadcn/ui セットアップ | モダンな UI コンポーネント |
| `next-shadcn-tabs` | Next.js shadcn/ui タブ | タブナビゲーションコンポーネント |
| `next-shadcn-toast` | Next.js shadcn/ui トースト | トースト通知コンポーネント |
| `next-shadcn-dropdown` | Next.js shadcn/ui ドロップダウン | ドロップダウンメニューコンポーネント |
| `next-shadcn-dialog` | Next.js shadcn/ui ダイアログ | モーダルダイアログコンポーネント |
| `next-shadcn-badge` | Next.js shadcn/ui バッジ | 小さな丸いバッジ |
| `next-shadcn-combobox-async` | 非同期 shadcn/ui コンボボックス | 非同期オプション読み込み |
| `next-shadcn-drawer` | Next.js shadcn/ui ドロワー | 底部ドロワーパネル |
| `next-shadcn-sheet` | Next.js shadcn/ui シート | サイドシートパネル |
| `next-shadcn-avatar-badge` | Next.js shadcn/ui アバター + バッジ | ステータス付きアバター |
| `next-shadcn-combobox` | Next.js shadcn/ui コンボボックス | 検索可能なセレクト |
| `next-shadcn-select` | Next.js shadcn/ui セレクト | ドロップダウンセレクト |

### 🚀 バックエンドフレームワーク（59以上のテンプレート）

#### FastAPI エコシステム（24テンプレート）
| テンプレート | 説明 | 機能 |
|----------|-------------|----------|
| `fastapi-minimal` | 基本 FastAPI アプリ | ヘルスエンドポイント、非同期サポート |
| `fastapi-jwt-auth` | JWT 認証 | セキュアな API 認証 |
| `fastapi-oauth2-password` | OAuth2 パスワードフロー | 標準 OAuth2 実装 |
| `fastapi-dependency-injection` | 依存性注入パターン | クリーンアーキテクチャ |
| `fastapi-background-tasks` | バックグラウンドタスク処理 | 非同期タスク処理 |
| `fastapi-websockets` | WebSocket 実装 | リアルタイム通信 |
| `fastapi-cors` | CORS 設定 | クロスオリジンリクエスト |
| `fastapi-settings-pydantic` | 設定管理 | Pydantic 設定 |
| `fastapi-logging-uvicorn` | 構造化ログ | 本番ログ |
| `fastapi-openapi-tags` | API ドキュメント | OpenAPI 仕様 |
| `fastapi-pydantic-v2-models` | Pydantic v2 モデル | モダンなデータ検証 |
| `fastapi-pytest-minimal` | テストセットアップ | ユニットテストフレームワーク |
| `fastapi-depends-override-test` | 依存性テスト | テスト分離 |
| `fastapi-alembic-minimal` | データベースマイグレーション | SQLAlchemy マイグレーション |
| `fastapi-celery-skeleton` | Celery タスクキュー | 分散タスク処理 |
| `fastapi-redis-cache` | Redis キャッシュ | パフォーマンス最適化 |
| `fastapi-sqlalchemy-postgres` | PostgreSQL 統合 | 本番データベース |
| `fastapi-sqlmodel-sqlite` | SQLite 付き SQLModel | モダンな ORM |
| `fastapi-motor-mongodb` | MongoDB 非同期ドライバー | NoSQL データベース |
| `fastapi-opentelemetry` | 可観測性トレーシング | パフォーマンス監視 |
| `fastapi-bg-db-sqlite` | バックグラウンド DB 書き込み | SQLite 非同期操作 |
| `fastapi-oauth2-scopes` | スコープ付き OAuth2 | 細かい権限制御 |

#### Node.js エコシステム（4テンプレート）
| テンプレート | 説明 | 使用例 |
|----------|-------------|----------|
| `express-minimal` | 基本 Express.js サーバー | 従来の Node.js API |
| `express-cors` | CORS 付き Express | クロスオリジン API サーバー |
| `express-opentelemetry` | トレーシング付き Express | 可観測性 |
| `fastify-minimal` | 高性能 Fastify | 高速な Node.js API |
| `fastify-prometheus-metrics` | メトリクス収集 | パフォーマンス監視 |
| `fastify-rate-limit` | レート制限 | API 保護 |

#### Go エコシステム（3テンプレート）
| テンプレート | 説明 | フレームワーク |
|----------|-------------|-----------|
| `go-gin-minimal` | Gin ウェブフレームワーク | 高性能 Go API |
| `go-echo-minimal` | Echo ウェブフレームワーク | ミニマリスト Go フレームワーク |
| `go-grpc-minimal` | gRPC サービス | 高性能 RPC |

#### Rust エコシステム（2テンプレート）
| テンプレート | 説明 | フレームワーク |
|----------|-------------|-----------|
| `rust-axum-minimal` | Axum ウェブフレームワーク | モダンな非同期 Rust |
| `rust-actix-minimal` | Actix ウェブフレームワーク | 高性能 Rust |

### 🧪 テスト・品質（58以上のテンプレート）

#### Playwright テスト（11テンプレート）
| テンプレート | 説明 | 機能 |
|----------|-------------|------------|
| `playwright-minimal` | 基本 E2E テストセットアップ | クロスブラウザテスト |
| `playwright-axe-accessibility` | アクセシビリティテスト | WCAG 準拠 |
| `playwright-ct-react` | コンポーネントテスト | React コンポーネントテスト |
| `playwright-data-fixture` | テストデータ管理 | データ駆動テスト |
| `playwright-docker-ci` | コンテナ化テスト | CI/CD 統合 |
| `playwright-network-intercept` | ネットワークモッキング | API テスト |
| `playwright-parallel-shards` | 並列テスト実行 | パフォーマンス最適化 |
| `playwright-report-allure` | 高度なレポート | テスト結果可視化 |
| `playwright-trace-on-failure` | デバッグトレーシング | テストデバッグ |
| `playwright-visual-regression` | ビジュアル回帰テスト | UI スナップショット比較 |

#### 品質・セキュリティツール（3テンプレート）
| テンプレート | 説明 | 目的 |
|----------|-------------|---------|
| `api-contract-jest-openapi` | OpenAPI 契約テスト | API 検証 |
| `gitleaks-action` | コード内のシークレット検出 | セキュリティスキャン |
| `secretlint-config` | シークレット検出設定 | セキュリティ設定 |

#### GitHub Actions CI/CD（32テンプレート）
| テンプレート | 説明 | 目的 |
|----------|-------------|---------|
| `gha-node-ci` | Node.js CI パイプライン | 基本 CI セットアップ |
| `gha-node-pnpm` | pnpm パッケージマネージャー | 代替パッケージマネージャー |
| `gha-playwright` | Playwright テスト自動化 | E2E テスト |
| `gha-docker-build-push` | Docker イメージ CI/CD | コンテナデプロイ |
| `gha-lint-typecheck-split` | コード品質チェック | 静的解析 |
| `gha-env-deploy-gates` | 環境デプロイ | 段階的デプロイ |
| `gha-secrets-scan` | セキュリティスキャン | 脆弱性検出 |
| `gha-codeql-analysis` | コードセキュリティ解析 | GitHub セキュリティ |
| `gha-dependency-review` | 依存関係セキュリティ | サプライチェーンセキュリティ |
| `gha-npm-audit` | NPM セキュリティ監査 | パッケージ脆弱性スキャン |
| `gha-pr-label-conditional` | 条件付きワークフロー | PR 自動化 |
| `gha-release-drafter` | リリース自動化 | リリース管理 |
| `gha-release-please` | 自動リリース | セマンティックバージョニング |
| `gha-monorepo-matrix` | モノレポ CI | マルチパッケージテスト |
| `gha-monorepo-matrix-turbo-pnpm` | Turbo + pnpm モノレポ | モダンなモノレポ CI |
| `gha-e2e-pipeline` | エンドツーエンドテストパイプライン | 完全な CI/CD |
| `gha-python-pytest` | Python テスト | Python CI パイプライン |
| `gha-go-test` | Go テスト | Go CI パイプライン |
| `gha-syft-sbom` | ソフトウェア部品表 | セキュリティ準拠 |
| `gha-zap-baseline` | OWASP ZAP セキュリティテスト | セキュリティテスト |
| `gha-artifact-upload` | ビルドアーティファクトアップロード | CI アーティファクト管理 |
| `gha-cloudflare-pages-preview` | Cloudflare Pages プレビュー | プレビューデプロイ |
| `gha-cloudfront-invalidate` | CloudFront キャッシュ無効化 | CDN キャッシュ管理 |
| `gha-pr-comment-e2e` | E2E テスト PR コメント | PR 自動化 |
| `gha-snyk-scan` | Snyk セキュリティスキャン | 脆弱性検出 |
| `gha-turbo-cache` | Turborepo リモートキャッシュ | ビルドパフォーマンス |
| `gha-vercel-preview` | Vercel プレビューデプロイ | プレビュー環境 |

### 🎨 UI コンポーネント・ライブラリ（72以上のテンプレート）

#### コンポーネントライブラリ
| テンプレート | 説明 | ライブラリ |
|----------|-------------|---------|
| `mui-react-minimal` | Material-UI コンポーネント | Google Material Design |
| `mui-react-hook-form` | MUI + React Hook Form | フォーム統合 |
| `mui-grid-minimal` | MUI グリッドレイアウトシステム | レスポンシブレイアウト |
| `mui-datagrid-minimal` | MUI X DataGrid | 高度なデータテーブル |
| `mui-dialog-minimal` | MUI ダイアログ | モーダルダイアログ |
| `mui-stepper-minimal` | MUI ステッパー | マルチステップフォーム |
| `mui-form-helpertext-validation` | MUI フォーム検証 | フィールド検証表示 |
| `radix-ui-dialog-minimal` | Radix UI ダイアログコンポーネント | アクセシブルプリミティブ |
| `radix-popover-minimal` | Radix UI ポップオーバー | フローティング UI 要素 |
| `radix-tooltip-minimal` | Radix UI ツールチップ | コンテキスト情報 |
| `radix-contextmenu-minimal` | Radix UI コンテキストメニュー | 右クリックメニュー |
| `radix-menubar-minimal` | Radix UI メニューバー | アプリケーションメニューバー |
| `radix-accordion-minimal` | Radix UI アコーディオン | 折りたたみ可能なコンテンツパネル |
| `radix-slider-minimal` | Radix UI スライダー | 範囲入力コントロール |
| `radix-switch-minimal` | Radix UI スイッチ | トグルスイッチコントロール |
| `radix-dropdown-menu-minimal` | Radix UI ドロップダウンメニュー | セレクトメニューコンポーネント |
| `headlessui-dialog-minimal` | Headless UI コンポーネント | スタイルなしコンポーネント |
| `tanstack-table-react-minimal` | データテーブル実装 | TanStack Table |
| `tanstack-table-sorting` | ソート付き TanStack Table | 高度なテーブル機能 |
| `tanstack-table-grouping` | グループ化付き TanStack Table | 行グループ化 |
| `tanstack-table-rowselection` | 選択付き TanStack Table | チェックボックス選択 |
| `tanstack-table-pagination` | TanStack Table ページネーション | クライアントサイドページネーション |
| `ag-grid-react-minimal` | エンタープライズデータグリッド | AG Grid |

#### インタラクティブコンポーネント
| テンプレート | 説明 | 機能 |
|----------|-------------|---------------|
| `dnd-kit-minimal` | ドラッグアンドドロップインターフェース | モダンな DnD 実装 |
| `react-dnd-minimal` | React DnD 実装 | 従来の DnD |

### 🗄️ データ・状態管理（35以上のテンプレート）

#### データベース統合
| テンプレート | 説明 | データベース |
|----------|-------------|----------|
| `docker-compose-postgres` | Docker 付き PostgreSQL | 開発データベース |
| `prisma-postgres-migrate` | Prisma + Postgres マイグレーション | データベーススキーマ管理 |
| `prisma-compound-unique` | Prisma 複合一意インデックス | マルチカラムの一意性 |
| `prisma-indexes` | Prisma インデックス最適化 | パフォーマンスインデックス |
| `typeorm-postgres-minimal` | TypeORM + Postgres | エンタープライズ ORM |
| `typeorm-cli-generate` | TypeORM CLI マイグレーション | スキーママイグレーション生成 |
| `typeorm-migration` | TypeORM マイグレーション設定 | マイグレーション実行スクリプト |
| `prisma-relations` | Prisma 1:N 関係 | User-Post 関係 |
| `prisma-transaction` | Prisma トランザクション | マルチ操作アトミック性 |
| `sqlite-wal-config` | SQLite WAL 設定 | 高性能 SQLite |
| `node-redis-cache` | Redis キャッシュ | インメモリキャッシュ |
| `node-bullmq-queue` | BullMQ ジョブキュー | タスク処理 |

#### リアルタイム通信
| テンプレート | 説明 | プロトコル |
|----------|-------------|----------|
| `socketio-minimal` | Socket.IO リアルタイム | WebSocket 通信 |
| `node-ws-websocket` | ネイティブ WebSocket | 低レベル WebSocket |
| `node-kafkajs-producer-consumer` | Apache Kafka | メッセージストリーミング |
| `kafka-consumer-group` | Kafka コンシューマーグループ | グループ処理 |
| `rabbitmq-amqplib` | RabbitMQ メッセージング | メッセージキューイング |
| `redis-pubsub-ioredis` | Redis Pub/Sub | リアルタイムイベント |
| `redis-streams-ioredis` | Redis Streams | ストリーム処理 |
| `nats-js-minimal` | NATS.js Pub/Sub | 軽量メッセージング |

### ☁️ インフラ・DevOps（40以上のテンプレート）

#### コンテナ・オーケストレーション
| テンプレート | 説明 | 技術 |
|----------|-------------|------------|
| `dockerfile-next-standalone` | Next.js Docker イメージ | コンテナ化 |
| `docker-compose-postgres` | PostgreSQL 開発 | ローカル開発 |
| `docker-compose-otel-loki-tempo` | OpenTelemetry スタック | 可観測性 |
| `docker-compose-prom-grafana` | Prometheus + Grafana | 監視スタック |
| `k8s-nextjs-deployment` | Kubernetes デプロイ | コンテナオーケストレーション |
| `k8s-ingress-cert-manager` | TLS 証明書付き Ingress | Kubernetes ネットワーキング |

#### クラウドプラットフォーム
| テンプレート | 説明 | プロバイダー |
|----------|-------------|----------|
| `cloudflare-workers-minimal` | エッジコンピューティング | Cloudflare Workers |
| `cloudflare-r2-signed-url` | R2 ストレージ署名 URL | Cloudflare R2 |
| `vercel-json-minimal` | Vercel 設定 | サーバーレスデプロイ |
| `serverless-framework-lambda-ts` | AWS Lambda TypeScript | サーバーレス関数 |
| `s3-multipart-post-policy` | S3 マルチパートアップロード | AWS S3 |

#### Infrastructure as Code
| テンプレート | 説明 | ツール |
|----------|-------------|------|
| `terraform-aws-s3-cloudfront` | AWS CDN セットアップ | Terraform |
| `terraform-aws-elasticache-redis` | ElastiCache Redis クラスター | Terraform |
| `pulumi-aws-s3-website-ts` | 静的サイトホスティング | Pulumi TypeScript |
| `pulumi-aws-rds-ts` | RDS データベースインスタンス | Pulumi TypeScript |

### 📊 監視・可観測性（15以上のテンプレート）

#### ログ・メトリクス
| テンプレート | 説明 | 技術 |
|----------|-------------|------------|
| `node-winston-logger` | 構造化ログ | Winston |
| `python-structlog-minimal` | Python 構造化ログ | Structlog |
| `fastapi-opentelemetry` | 分散トレーシング | OpenTelemetry |
| `express-opentelemetry` | Express.js トレーシング | OpenTelemetry |
| `node-otel-metrics-logs` | OTLP メトリクスとログ | OpenTelemetry SDK |
| `grafana-dashboard-minimal` | Grafana ダッシュボード JSON | 監視ダッシュボード |

#### 検証・品質
| テンプレート | 説明 | 目的 |
|----------|-------------|---------|
| `zod-to-openapi-minimal` | スキーマから OpenAPI | API ドキュメント |
| `openapi-cli-validate` | OpenAPI 検証 | API 仕様検証 |
| `prism-mock-openapi` | モック OpenAPI 仕様 | API モッキング |

### 🛠️ ビルドツール・モノレポ（4テンプレート）

#### モノレポ管理
| テンプレート | 説明 | ツール |
|----------|-------------|------|
| `nx-monorepo-minimal` | Nx ワークスペーススケルトン | Nx モノレポ |
| `pnpm-workspace-minimal` | pnpm ワークスペースセットアップ | pnpm ワークスペース |
| `turborepo-minimal` | Turbo モノレポ設定 | Turborepo |

## テンプレート構造

各スパイクテンプレートは一貫した JSON 構造に従っています：

```json
{
  "id": "template-identifier",
  "name": "人間が読める形式のテンプレート名",
  "version": "1.0.0",
  "stack": ["technology", "framework"],
  "tags": ["category", "feature"],
  "description": "このテンプレートが提供する内容の簡潔な説明",
  "params": [
    {
      "name": "parameter_name",
      "required": false,
      "default": "default_value"
    }
  ],
  "files": [
    {
      "path": "{{param}}/relative/path/to/file",
      "template": "{{param}} 置換付きのファイル内容"
    }
  ],
  "patches": []
}
```

## /fl: コマンドでの使用方法

### 基本テンプレート適用
```bash
# 利用可能なテンプレートを発見
/fl:discover "React フォーム検証"
# 結果: react-hook-form-zod-login を提案

# テンプレートを自動適用
/fl:implement "検証付きログインフォームを作成" --framework react
# 結果: react-hook-form-zod-login テンプレートを適用
```

### 高度なスパイクワークフロー
```bash
# 完全なスパイク開発サイクル
/fl:implement --loop --wave-mode --delegate --until-perfect --ultrathink --all-mcp "ドラッグアンドドロップできるツリービュー"

# 自動ワークフロー:
# 1. テンプレート発見: dnd-kit-minimal または react-dnd-minimal
# 2. 最小アプリ作成: スタンドアロンコンポーネントアプリ
# 3. 検証: ドラッグドロップ機能をテスト
# 4. 統合: メインアプリケーションにマージ
```

### フレームワーク固有ワークフロー

#### Next.js 開発
```bash
# API 開発
/fl:implement "FastAPI スタイルの API ルート" --framework nextjs
# テンプレート: nextjs-api-zod-router, nextjs-api-edge

# 認証
/fl:implement "ユーザー認証システム" --framework nextjs
# テンプレート: nextjs-auth-nextauth-credentials, nextjs-auth0-minimal

# パフォーマンス最適化
/fl:implement "画像最適化と ISR" --framework nextjs
# テンプレート: nextjs-image-optimization, nextjs-isr-page
```

#### FastAPI 開発
```bash
# 認証付き完全 API
/fl:implement "JWT 認証とバックグラウンドタスク付き API" --framework fastapi
# テンプレート: fastapi-jwt-auth, fastapi-background-tasks

# データベース統合
/fl:implement "PostgreSQL とキャッシュ付き API" --framework fastapi
# テンプレート: fastapi-sqlalchemy-postgres, fastapi-redis-cache
```

## テンプレート発見

### 技術スタック別
- **React**: SPA 開発用 11 テンプレート
- **Next.js**: フルスタックアプリケーション用 26 テンプレート（shadcn/ui を含む）
- **FastAPI**: Python API 用 21 テンプレート
- **Vue/Nuxt**: Vue.js エコシステム用 3 テンプレート
- **Go**: 高性能バックエンド用 3 テンプレート
- **Rust**: システムプログラミング用 2 テンプレート

### 使用例別
- **認証**: 4 テンプレート（JWT、OAuth2、Auth0、NextAuth）
- **データベース**: 11 テンプレート（PostgreSQL、MongoDB、SQLite、Redis、Prisma、TypeORM）
- **テスト**: 15 テンプレート（Playwright、GitHub Actions、pytest）
- **UI コンポーネント**: 16 テンプレート（Material-UI、Radix UI、shadcn/ui、ドラッグドロップ）
- **リアルタイム**: 4 テンプレート（WebSocket、Socket.IO、Kafka、NATS）
- **インフラ**: 18 テンプレート（Docker、Kubernetes、Terraform）

### 複雑性別
- **最小**: クイックスタートテンプレート（30以上のテンプレート）
- **標準**: ベストプラクティス付き本番対応（50以上のテンプレート）
- **高度**: 可観測性付きエンタープライズパターン（30以上のテンプレート）

## 品質基準

### テンプレート要件
- ✅ **本番対応**: すべてのテンプレートは最新の安定バージョンを使用
- ✅ **ベストプラクティス**: フレームワークの規約とパターンに従う
- ✅ **型安全性**: 該当する場合の TypeScript サポート
- ✅ **セキュリティ**: セキュアなデフォルトと検証
- ✅ **パフォーマンス**: 最適化された設定
- ✅ **テスト**: テストセットアップと例を含む

### テンプレート検証
- **構文**: JSON スキーマ検証
- **依存関係**: パッケージ可用性検証
- **セキュリティ**: 脆弱性スキャニング
- **機能**: 自動テスト
- **ドキュメント**: 使用例と説明

## SuperClaude との統合

### 自動テンプレート選択
`/fl:` コマンドは以下に基づいて最適なテンプレートを自動選択します：
- **自然言語解析**: ユーザーの意図を理解
- **フレームワーク検出**: 既存のプロジェクト構造
- **複雑性評価**: 要求された機能の範囲
- **ベストプラクティスマッチング**: 使用例に最適なパターン

### スパイク開発ワークフロー
1. **テンプレート発見**: AI 駆動のテンプレート推奨
2. **最小アプリ作成**: テンプレートを使用したスタンドアロン実装
3. **検証**: 分離環境での機能テスト
4. **統合**: 既存コードベースとのシームレスなマージ
5. **強化**: 追加の最適化と改良

### パラメーターバイパスサポート
すべてのスパイクテンプレートは SuperClaude の完全なパラメーターバイパスで動作します：
- `--loop`: 反復的なテンプレート改良
- `--wave-mode`: マルチステージ実装
- `--delegate`: 並列テンプレート処理
- `--until-perfect`: 品質検証
- `--ultrathink`: 包括的解析
- `--all-mcp`: 完全な MCP サーバー統合

---

**テンプレート総数**: 385 本番対応スキャフォールド  
**総行数**: 3,500 行以上の実戦テスト済み設定  
**カバレッジ**: 15以上の技術スタック、50以上のフレームワークとライブラリ  
**品質**: セキュリティとパフォーマンスを内蔵したエンタープライズグレードパターン

### 最新追加（v0.20.3）
- **品質・セキュリティ**: OpenAPI 契約テスト、シークレット検出、脆弱性スキャニング
- **GitHub Actions**: アーティファクトアップロード、Cloudflare Pages プレビュー、CloudFront 無効化、Snyk スキャニング、Turborepo キャッシュ
- **Next.js コンポーネント**: shadcn/ui バッジと非同期コンボボックスコンポーネント
- **NextAuth**: データベース認証用 Prisma アダプター統合
- **Next.js 機能**: オンデマンド ISR、地域ターゲティングミドルウェア、Prometheus メトリクス、FormData アップロード
- **FastAPI 拡張**: バックグラウンドデータベース操作、OAuth2 スコープ実施
- **UI コンポーネント**: MUI フォーム検証ヘルパー、Radix ドロップダウンメニュー、TanStack ページネーション
- **データベース**: Prisma 関係とトランザクション、TypeORM マイグレーション
- **メッセージング**: Kafka コンシューマーグループ、RabbitMQ、Redis Pub/Sub と Streams
- **インフラ**: Docker Compose 可観測性スタック（OpenTelemetry + Loki + Tempo、Prometheus + Grafana）
- **監視**: Node.js OpenTelemetry メトリクス/ログ、Grafana ダッシュボード、OpenAPI モッキング
- **ビルドツール**: Nx モノレポ、pnpm ワークスペース、Turborepo 設定
- **総カバレッジ**: すべての技術スタックにわたる 385 の本番対応テンプレート