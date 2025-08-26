# Fluorite MCP API ドキュメント

## 概要

Fluorite MCPは、Claude Code CLIにライブラリ仕様、静的解析、スパイク開発ツールを提供するModel Context Protocol（MCP）の実装です。この包括的APIリファレンスは、利用可能な全リソース、ツール、統合パターンをカバーしています。

**バージョン**: 0.12.1  
**MCPプロトコル**: 1.0.0  
**Node.js**: 18.0+  
**スパイクテンプレート**: 750+  
**カタログ仕様**: 87+

## 目次

- [クイックリファレンス](#クイックリファレンス)
- [リソース](#リソース)
- [ツール](#ツール)
- [仕様フォーマット](#仕様フォーマット)
- [静的解析](#静的解析)
- [スパイクテンプレート](#スパイクテンプレート)
- [統合ガイド](#統合ガイド)
- [エラーハンドリング](#エラーハンドリング)
- [パフォーマンスと制限](#パフォーマンスと制限)

## クイックリファレンス

### 利用可能ツール一覧

| ツール | 目的 | パラメータ | レスポンス型 |
|------|---------|------------|---------------|
| **仕様管理** ||||
| `list-specs` | 仕様一覧表示 | `filter?` | 仕様リスト |
| `upsert-spec` | 仕様追加/更新 | `pkg`, `yaml` | 操作結果 |
| `catalog-stats` | カタログ統計 | なし | 統計オブジェクト |
| **診断・監視** ||||
| `self-test` | ヘルスチェック | なし | テスト結果 |
| `performance-test` | パフォーマンス測定 | なし | パフォーマンスデータ |
| `server-metrics` | サーバー可観測性 | なし | メトリクスオブジェクト |
| **静的解析・検証** ||||
| `static-analysis` | 包括的コード解析 | `projectPath`, `framework?`, オプション | 解析結果 |
| `quick-validate` | コードスニペット検証 | `code`, `language?`, `framework?` | 検証結果 |
| `realtime-validation` | ファイル検証 | `file`, `framework?`, オプション | 検証結果 |
| `get-validation-rules` | 利用可能ルール一覧 | なし | 利用可能ルール |
| **スパイクテンプレート** ||||
| `discover-spikes` | テンプレート検索 | `query?`, `limit?`, `offset?` | テンプレートリスト |
| `auto-spike` | スマートテンプレート選択 | `task`, `constraints?` | 最適マッチ |
| `preview-spike` | テンプレートプレビュー | `id`, `params?` | テンプレート詳細 |
| `apply-spike` | テンプレート適用 | `id`, `params?`, `strategy?` | 適用プラン |
| `validate-spike` | 適用検証 | `id`, `params?` | 検証結果 |
| `explain-spike` | テンプレート詳細 | `id` | テンプレート情報 |

### リソースURIパターン

| パターン | 説明 | 例 |
|---------|-------------|---------|
| `spec://{library-id}` | ライブラリ仕様 | `spec://react-dnd-treeview` |
| `spec://{ecosystem-id}` | エコシステム仕様 | `spec://web-development-comprehensive-ecosystem` |
| `spec://{framework}-{feature}` | フレームワーク機能 | `spec://nextjs-auth` |

## リソース

リソースはYAML形式で保存されたライブラリ仕様へのアクセスを提供します。

### リソースURI形式

```
spec://{library-identifier}
```

### 利用可能なリソース

| リソース | 説明 | 例URI |
|----------|-------------|-------------|
| ライブラリ仕様 | 個別ライブラリ仕様 | `spec://react-dnd-treeview` |
| エコシステム仕様 | 包括的エコシステム仕様 | `spec://spike-development-ecosystem` |
| スターターテンプレート | 推奨スターター設定 | `spec://vercel-next-starter` |
| SuperClaude統合 | スパイク開発を含むfl:コマンドの拡張 | fluorite-mcp wrapper CLI経由で拡張 |

### リソース取得

```typescript
// MCP Client例
const resource = await client.getResource('spec://react-dnd-treeview');
```

レスポンス形式:
```json
{
  "uri": "spec://react-dnd-treeview",
  "name": "React DnD TreeView Specification",
  "mimeType": "application/x-yaml",
  "content": "name: React DnD TreeView\n..."
}
```

## ツール

Fluorite MCPは仕様管理と静的解析のための複数のツールを提供します。

### 1. list-specs

カタログ内の利用可能な全仕様を一覧表示します。

**パラメータ:**
```typescript
{
  filter?: string  // パッケージ名のオプションフィルターパターン
}
```

**例:**
```json
{
  "filter": "react"
}
```

**レスポンス:**
```json
{
  "specs": [
    {
      "id": "react-dnd-treeview",
      "name": "React DnD TreeView",
      "category": "ui-components"
    }
  ],
  "total": 87
}
```

### 2. upsert-spec

ライブラリ仕様を作成または更新します。

**パラメータ:**
```typescript
{
  pkg: string      // パッケージ識別子（最大255文字）
  yaml: string     // YAML仕様コンテンツ（最大1MB）
}
```

**例:**
```json
{
  "pkg": "my-library",
  "yaml": "name: My Library\nversion: 1.0.0\n..."
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "Specification saved successfully",
  "id": "my-library"
}
```

### 3. catalog-stats

診断用のカタログ統計を表示します。

**パラメータ:** なし

**レスポンス:**
```json
{
  "totalSpecs": 87,
  "categories": {
    "ui-components": 15,
    "state-management": 8,
    "development-methodology": 2
  },
  "totalLines": 44000,
  "lastUpdated": "2025-08-15T10:00:00Z"
}
```

### 4. self-test

MCPサーバーの自己診断テストを実行します。

**パラメータ:** なし

**レスポンス:**
```json
{
  "status": "healthy",
  "tests": {
    "catalog_loading": "passed",
    "yaml_parsing": "passed",
    "resource_access": "passed"
  },
  "duration": "45ms"
}
```

### 5. performance-test

MCPサーバーのパフォーマンステストを実行します。

**パラメータ:** なし

**レスポンス:**
```json
{
  "metrics": {
    "catalog_load_time": "23ms",
    "resource_fetch_avg": "1.2ms",
    "memory_usage": "34MB",
    "spec_count": 87
  },
  "status": "optimal"
}
```

### 6. server-metrics

サーバーの可観測性メトリクスを表示します。

**パラメータ:** なし

**レスポンス:**
```json
{
  "uptime": 3600,
  "requests_handled": 1523,
  "errors": 0,
  "memory": {
    "used": "34MB",
    "heap": "52MB"
  },
  "performance": {
    "avg_response_time": "2.3ms",
    "p95_response_time": "8.1ms"
  }
}
```

### 7. static-analysis

フレームワーク固有のルールとエラー予測機能を使用して、コードの包括的な静的解析を実行します。

**パラメータ:**
```typescript
{
  projectPath: string            // プロジェクトルートディレクトリパス
  targetFiles?: string[]         // 解析する特定ファイル
  framework?: "nextjs" | "react" | "vue"  // ターゲットフレームワーク
  strictMode?: boolean           // 厳密検証モードの有効化
  maxIssues?: number            // 報告する最大問題数
  enabledRules?: string[]       // 有効にする特定ルール
  disabledRules?: string[]      // 無効にする特定ルール
  autoFix?: boolean             // 自動修正提案の生成
  analyzeDependencies?: boolean // 依存関係の解析
  predictErrors?: boolean       // エラー予測の有効化
}
```

**例:**
```json
{
  "projectPath": "/path/to/project",
  "framework": "nextjs",
  "predictErrors": true,
  "analyzeDependencies": true
}
```

**レスポンス:**
```json
{
  "summary": {
    "errors": 5,
    "warnings": 12,
    "info": 3
  },
  "issues": [
    {
      "severity": "error",
      "message": "Using client hook in Server Component",
      "file": "app/page.tsx",
      "line": 15,
      "confidence": 1.0,
      "fix": "Add 'use client' directive"
    }
  ],
  "predictions": [
    {
      "type": "HydrationError",
      "probability": 0.85,
      "description": "Date.now() will cause hydration mismatch"
    }
  ]
}
```

### 8. quick-validate

ファイルシステムアクセスなしでコードスニペットを検証します。

**パラメータ:**
```typescript
{
  code: string                                    // 検証するコード
  language?: "typescript" | "javascript" | "jsx" | "tsx"  // コード言語
  framework?: string                              // フレームワークコンテキスト
  fileName?: string                               // コンテキスト用のオプションファイル名
}
```

**例:**
```json
{
  "code": "const Component = () => { useState() }",
  "language": "tsx",
  "framework": "react"
}
```

**レスポンス:**
```json
{
  "valid": false,
  "issues": [
    {
      "message": "useState must be imported from React",
      "line": 1,
      "severity": "error"
    }
  ]
}
```

### 9. realtime-validation

フレームワーク固有のルールでファイルのリアルタイム検証を実行します。

**パラメータ:**
```typescript
{
  file: string          // 検証するファイルパス
  content?: string      // ファイルコンテンツ（ディスクから読み取らない場合）
  framework?: string    // ターゲットフレームワーク
  watchMode?: boolean   // 継続的検証の有効化
}
```

**例:**
```json
{
  "file": "./src/components/Button.tsx",
  "framework": "react"
}
```

**レスポンス:**
```json
{
  "valid": true,
  "issues": [],
  "metrics": {
    "linesOfCode": 45,
    "complexity": 3,
    "maintainabilityIndex": 85
  }
}
```

### 10. get-validation-rules

異なるフレームワークで利用可能な検証ルールを返します。

**パラメータ:** なし

**レスポンス:**
```json
{
  "rules": [
    {
      "id": "react-hooks-order",
      "name": "Hook Call Order",
      "framework": "react",
      "severity": "error",
      "description": "Hooks must be called in the same order"
    },
    {
      "id": "nextjs-client-server-boundary",
      "name": "Client/Server Boundary",
      "framework": "nextjs", 
      "severity": "error",
      "description": "Client hooks cannot be used in Server Components"
    }
  ],
  "frameworks": ["react", "nextjs", "vue"],
  "totalRules": 50
}
```

## 仕様フォーマット

### YAML構造

各仕様は以下の構造に従います:

```yaml
name: Library Name              # 必須
version: 1.0.0                  # 必須
description: Brief description   # 必須
category: category-name         # 必須
subcategory: subcategory       # オプション
tags:                          # オプション
  - tag1
  - tag2
homepage: # Library homepage (optional)
repository: # Git repository (optional)
language: TypeScript           # オプション

# シンプルなライブラリ用
features:                      # オプション
  - Feature 1
  - Feature 2

configuration:                 # オプション
  example: |
    Code configuration example

# エコシステム用
tools:                        # エコシステムに必須
  tool_name:
    name: Tool Name
    description: Tool description
    homepage: # Tool homepage
    repository: # Tool repository
    language: TypeScript
    features:
      - Feature 1
    configuration: |
      Configuration example
    best_practices:
      - Practice 1
      - Practice 2

workflows:                    # オプション
  workflow_name:
    description: Workflow description
    steps:
      - Step 1
      - Step 2

templates:                    # オプション
  template_name:
    description: Template description
    code: |
      Template code
```

### カテゴリー

仕様の標準カテゴリー:

- `ui-components` - UIライブラリとコンポーネント
- `state-management` - 状態管理ソリューション
- `development-methodology` - 開発プラクティスとワークフロー
- `testing` - テストフレームワークとツール
- `authentication` - 認証ライブラリ
- `database` - データベースとORMツール
- `framework` - Webフレームワーク
- `infrastructure` - インフラストラクチャとDevOpsツール
- `language-ecosystem` - プログラミング言語エコシステム

## 静的解析

Fluorite MCPは、モダンWebフレームワーク向けの包括的な静的解析機能を提供します。

### サポートフレームワーク

| フレームワーク | 解析ルール | エラー予測 | パフォーマンス測定 |
|-----------|----------------|------------------|-------------------|
| **Next.js** | 20+ ルール | ✅ | ✅ |
| **React** | 15+ ルール | ✅ | ✅ |
| **Vue.js** | 10+ ルール | ✅ | ✅ |
| **TypeScript** | 12+ ルール | ✅ | ✅ |

### 解析カテゴリー

#### Next.js固有

- **サーバー/クライアント境界**: Server Componentsでのクライアントフックの検出
- **ハイドレーション問題**: SSR/クライアントミスマッチの防止
- **ルート設定**: ルートパラメータとミドルウェアの検証
- **画像最適化**: Next.js Image使用の確認
- **APIルートパターン**: APIルート実装の検証

#### React固有

- **フック使用**: フック呼び出し順序と依存関係の検証
- **コンポーネントパターン**: コンポーネントライフサイクルとパターンの確認
- **状態管理**: 状態更新パターンの解析
- **パフォーマンス**: 不要な再レンダリングの検出
- **アクセシビリティ**: ARIAとセマンティックHTMLの検証

#### Vue.js固有

- **Composition API**: リアクティブパターンの検証
- **コンポーネント通信**: propsとemitパターン
- **ライフサイクル管理**: setupとクリーンアップの検証
- **テンプレート構文**: テンプレート式の解析
- **パフォーマンス**: リアクティブ性の最適化

### エラー予測エンジン

拡張されたエラー予測システムは、機械学習パターンとフレームワーク固有のヒューリスティックを使用して、発生前に潜在的なランタイム問題を特定します:

#### 予測タイプ

- **HydrationError**: SSR/クライアントサイドレンダリングのミスマッチ
- **MemoryLeak**: イベントリスナー、サブスクリプションのクリーンアップ不備
- **PerformanceIssue**: 非効率なレンダリングパターン
- **SecurityVulnerability**: 潜在的なXSS、インジェクションリスク
- **AccessibilityViolation**: WCAGコンプライアンス問題
- **TypeScript**: ランタイムでの型安全性違反

#### 拡張レスポンス形式

```json
{
  "predictions": [
    {
      "type": "HydrationError",
      "probability": 0.85,
      "confidence": "high",
      "description": "Date.now() will cause hydration mismatch",
      "file": "components/ServerTime.tsx",
      "line": 12,
      "column": 15,
      "severity": "error",
      "suggestion": "Use useEffect to update client-side time",
      "autoFixAvailable": true,
      "category": "nextjs-hydration",
      "ruleId": "nextjs-ssr-client-mismatch"
    },
    {
      "type": "MemoryLeak",
      "probability": 0.72,
      "confidence": "medium",
      "description": "Event listener not cleaned up",
      "file": "hooks/useWindowResize.ts",
      "line": 8,
      "column": 10,
      "severity": "warning",
      "suggestion": "Return cleanup function from useEffect",
      "autoFixAvailable": true,
      "category": "react-lifecycle",
      "ruleId": "react-effect-cleanup"
    }
  ]
}
```

### 自動修正機能

静的解析エンジンは一般的な問題に対する自動修正を生成できます:

#### サポートされる自動修正

- **インポート文**: 不足するインポートの追加
- **フック依存関係**: useEffect依存関係配列の修正
- **TypeScript**: 型注釈の追加
- **アクセシビリティ**: ARIA属性の追加
- **パフォーマンス**: レンダリングパターンの最適化
- **セキュリティ**: ユーザー入力のサニタイズ

#### 自動修正レスポンス

```json
{
  "autoFixes": {
    "components/Button.tsx": [
      {
        "line": 12,
        "column": 5,
        "type": "insert",
        "content": "import { useState } from 'react';\n",
        "description": "Add missing React import"
      },
      {
        "line": 25,
        "column": 15,
        "type": "replace", 
        "oldContent": "[]",
        "newContent": "[count, setCount]",
        "description": "Fix useEffect dependencies"
      }
    ]
  }
}
```

### カスタムルール設定

```typescript
// 解析ルールの設定
const analysisConfig = {
  framework: 'nextjs',
  rules: {
    'nextjs-client-server-boundary': 'error',
    'react-hooks-dependencies': 'warning',
    'typescript-strict-mode': 'info'
  },
  ignorePatterns: [
    '**/*.test.ts',
    'node_modules/**'
  ],
  customRules: [
    {
      id: 'team-naming-convention',
      pattern: /^[A-Z][a-zA-Z]*Component$/,
      message: 'Components must end with "Component"'
    }
  ]
};
```

## スパイクテンプレート

スパイクテンプレートは、事前構築されたスキャフォールドによる迅速なプロトタイピング機能を提供します。

### テンプレート構造

各スパイクテンプレートは以下のJSON形式に従います:

```json
{
  "id": "template-id",
  "name": "Human Readable Name",
  "version": "1.0.0",
  "stack": ["technology1", "technology2"],
  "tags": ["category", "feature"],
  "description": "What this template provides",
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "Name of the project"
    }
  ],
  "files": [
    {
      "path": "{{project_name}}/package.json",
      "template": "JSON or code template with {{variable}} substitution"
    }
  ],
  "patches": [
    {
      "path": "existing-file.js",
      "operation": "insert",
      "content": "Code to insert"
    }
  ]
}
```

### 利用可能テンプレートカテゴリー（750+総数）

#### Webフレームワーク（300+テンプレート）

- **Next.js (150+テンプレート)**: SSRアプリ、APIルート、ミドルウェア、認証、ファイルアップロード、マルチパート処理、エッジ関数、キャッシュ、フォーム、画像最適化
- **React (50+テンプレート)**: コンポーネント、フック、コンテキスト、テスト、状態管理（Jotai、Zustand、Redux Toolkit）、国際化
- **Vue (30+テンプレート)**: Composition API、コンポーネント、ルーティング、Pinia状態管理
- **FastAPI (60+テンプレート)**: REST API、認証、データベース統合、WebSocket、バックグラウンドタスク、OpenAPI、依存関係注入
- **Express (30+テンプレート)**: 最小セットアップ、セキュリティ、ミドルウェア、認証、レート制限
- **Cloudflare Workers (20+テンプレート)**: エッジ関数、R2ストレージ、KV操作
- **その他フレームワーク**: Fastify、Hapi、Koa、NestJS、SvelteKit、Nuxt

#### UIコンポーネントライブラリ（100+テンプレート）

- **Shadcn/ui**: アラート、ダイアログ、フォーム、ナビゲーション、データ表示コンポーネント
- **Material-UI (MUI)**: データグリッド、フォーム、ナビゲーション、テーマ、React Hook Form統合
- **Radix UI**: アクセシブルプリミティブ、オーバーレイ、ナビゲーション、フォームコントロール
- **Headless UI**: フレームワーク非依存コンポーネント

#### テスト・品質（150+テンプレート）

- **Playwright**: E2Eテスト、アクセシビリティ、ビジュアル回帰、Docker CI、並列実行
- **Vitest**: ユニットテスト、コンポーネントテスト、モック
- **Jest**: TypeScriptテスト、OpenAPI検証
- **Cypress**: 統合テスト、カスタムコマンド
- **Pytest**: FastAPIテスト、フィクスチャ

#### データベース・ORM（50+テンプレート）

- **Prisma**: PostgreSQL、SQLite、MongoDB、マイグレーション、トランザクション
- **Drizzle**: PostgreSQL、SQLite構成
- **TypeORM**: MySQL、PostgreSQL、SQLite、マイグレーション
- **Sequelize**: MySQL、PostgreSQL構成
- **Mongoose**: MongoDB CRUD操作

#### DevOps・CI/CD（200+テンプレート）

- **GitHub Actions (150+テンプレート)**: CIパイプライン、デプロイメント、セキュリティスキャン、モノレポマトリックスビルド、E2Eテスト、コンポジットアクション
- **Docker**: コンテナ化、マルチステージビルド、composeコンフィグレーション
- **インフラストラクチャ**: Terraform (AWS)、Pulumi、Kubernetesデプロイメント
- **監視**: OpenTelemetry、Prometheus、Grafanaダッシュボード
- **セキュリティ**: シークレットスキャン、依存関係レビュー、SASTツール

#### クラウドサービス（50+テンプレート）

- **AWS**: S3、Lambda、CloudFront、SQS統合
- **Google Cloud**: ストレージ、Pub/Sub、署名付きURL
- **Cloudflare**: Workers、R2、KVストレージ
- **認証**: Auth0、Clerk、NextAuth.js（各種プロバイダー）

#### 開発ツール（50+テンプレート）

- **ビルドツール**: Turbo、pnpmワークスペース、Nxモノレポ
- **リンティング**: ESLint、Prettier構成
- **パッケージ管理**: Serverless Framework、PM2エコシステム

### テンプレートパラメータ

テンプレートは動的パラメータ置換をサポートします:

```json
{
  "params": [
    { "name": "app_name", "default": "my-app" },
    { "name": "port", "default": "3000" },
    { "name": "database", "default": "sqlite" }
  ]
}
```

使用法:
```typescript
// カスタムパラメータでテンプレートを適用
const result = await client.callTool('apply-spike', {
  id: 'nextjs-minimal',
  params: {
    app_name: 'my-next-app',
    port: '3001'
  }
});
```

### テンプレート検索

自然言語クエリを使用してテンプレートを検索:

```typescript
// テンプレート検索
const templates = await client.callTool('discover-spikes', {
  query: 'nextjs authentication',
  limit: 5
});

// 最適テンプレートの自動選択
const autoSelected = await client.callTool('auto-spike', {
  task: 'Create a Next.js app with JWT authentication'
});
```

### スパイクワークフロー

1. **検索**: 関連テンプレートの検索
2. **プレビュー**: テンプレート内容の確認
3. **適用**: ファイルとパッチの生成
4. **検証**: 実装の確認
5. **説明**: テンプレート選択の理解

## 統合ガイド

### Claude Code CLIでの使用

fluorite-mcp CLIはSuperClaude統合とローカル開発コマンドを提供します。

#### 利用可能なCLIコマンド

```bash
# グローバルインストール
npm i -g fluorite-mcp

# Claude Codeでの設定
claude mcp add fluorite -- fluorite-mcp-server

# CLIコマンド
fluorite-mcp setup              # SuperClaude統合のセットアップ
fluorite-mcp version            # バージョン情報の表示
fluorite-mcp fl-help [command]  # fluoriteコマンドヘルプの表示
```

#### SuperClaude /fl: コマンド

FluoriteはSuperClaudeを拡張された`/fl:`コマンドで拡張します:

- `/fl:build` - スパイクテンプレートを使用した拡張プロジェクトビルド
- `/fl:implement` - テンプレートサポート付き機能実装
- `/fl:analyze` - フレームワーク検出付き静的解析
- `/fl:design` - テンプレートを使用したデザイン統合
- `/fl:improve` - 最適化を伴うコード拡張
- `/fl:spike [operation]` - 直接スパイクテンプレート操作

#### 基本的な使用法
Claude Codeを使用する際、仕様は自動的に利用可能になります:
```
User: "ドラッグアンドドロップツリーコンポーネントを作成"
Claude: [spec://react-dnd-treeviewに自動アクセス]
```

### プログラムでの使用

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  command: 'fluorite-mcp',
  args: []
});

// 利用可能な仕様の一覧
const specs = await client.callTool('list-specs', {});

// 特定の仕様の取得
const resource = await client.getResource('spec://react-dnd-treeview');

// 静的解析の実行
const analysis = await client.callTool('static-analysis', {
  projectPath: './my-project',
  framework: 'nextjs'
});
```

### カスタム統合

```typescript
// カスタムMCPサーバー拡張
import { FluoriteMCP } from 'fluorite-mcp';

class CustomMCP extends FluoriteMCP {
  constructor() {
    super();
    // カスタム仕様の追加
    this.addSpec('custom-lib', customYaml);
  }
  
  // 必要に応じてメソッドをオーバーライド
  async handleTool(name: string, params: any) {
    // カスタムツール処理
    return super.handleTool(name, params);
  }
}
```

## エラーハンドリング

### エラーレスポンス形式

```json
{
  "error": {
    "code": "SPEC_NOT_FOUND",
    "message": "Specification 'unknown-lib' not found",
    "details": {
      "requested": "unknown-lib",
      "available": ["lib1", "lib2"]
    }
  }
}
```

### 一般的なエラーコード

| コード | 説明 | 解決方法 |
|------|-------------|------------|
| `SPEC_NOT_FOUND` | リクエストされた仕様が存在しない | `list-specs`で利用可能な仕様を確認 |
| `INVALID_YAML` | YAML解析が失敗 | YAML構文の検証 |
| `SIZE_LIMIT_EXCEEDED` | 仕様のサイズが大きすぎる（>1MB） | 仕様サイズの削減 |
| `INVALID_PARAMS` | 無効なツールパラメータ | パラメータ要件の確認 |
| `ANALYSIS_FAILED` | 静的解析エラー | ファイルパスと権限の確認 |

### エラーの処理

```typescript
try {
  const result = await client.callTool('upsert-spec', {
    pkg: 'my-lib',
    yaml: invalidYaml
  });
} catch (error) {
  if (error.code === 'INVALID_YAML') {
    console.error('YAML syntax error:', error.details);
  }
}
```

## レート制限とパフォーマンス

### パフォーマンス特性

- **起動時間**: < 100ms
- **リソース取得**: 平均~1ms
- **静的解析**: ファイルあたり1-10ms（最大1000ファイル）
- **スパイク操作**: テンプレートの複雑さに応じて5-50ms
- **メモリ使用量**: アクティブ時~34MB（負荷時最大100MB）
- **最大仕様サイズ**: 仕様あたり1MB
- **カタログサイズ**: 87仕様、750+スパイクテンプレート
- **同期操作**: 100+リソース取得、20スパイク操作

### 最適化のヒント

1. **リソースキャッシュ**: 頻繁に使用される仕様をキャッシュ
2. **バッチ操作**: 複数回の取得ではなく、フィルター付き`list-specs`を使用
3. **非同期操作**: 全ツールがasync/awaitをサポート
4. **選択的解析**: より高速な静的解析のためのフレームワークヒント使用

## バージョニング

Fluorite MCPはセマンティックバージョニングに従います:

- **メジャー**: 破壊的APIの変更
- **マイナー**: 新機能、後方互換性あり
- **パッチ**: バグ修正、ドキュメント更新

バージョン確認:
```bash
fluorite-mcp --version
```

## パフォーマンスと制限

### パフォーマンス特性

| 操作 | 一般的なレスポンス時間 | メモリ使用量 | 同期性 |
|-----------|---------------------|--------------|-------------|
| **リソース取得** | ~1ms | <1MB | 100+並行 |
| **静的解析** | 1-10ms/ファイル | 2-8MB | 10並行 |
| **スパイク操作** | 5-50ms | <5MB | 20並行 |
| **カタログ操作** | <5ms | <10MB | 無制限 |

### システム制限

#### ファイルとコンテンツ制限

- **最大仕様サイズ**: 仕様あたり1MB
- **最大プロジェクトサイズ**: ハード制限なし（10k以上のファイルでパフォーマンス低下）
- **最大ファイル名長**: 255文字
- **サポートファイル型**: `.yaml`, `.yml`, `.json`, `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`

#### リクエスト制限

- **同期リクエスト**: 秒あたり100
- **リクエストタイムアウト**: 30秒
- **最大レスポンスサイズ**: 10MB
- **レート制限**: クライアントあたり1000リクエスト/分

#### メモリ管理

```typescript
// コンポーネント別メモリ使用量
const memoryUsage = {
  catalogCache: "10-20MB",
  analysisEngine: "5-15MB", 
  spikeTemplates: "2-5MB",
  mcpProtocol: "1-3MB"
};

// 自動クリーンアップトリガー
const cleanupTriggers = {
  memoryThreshold: "100MB",
  cacheExpiry: "1 hour",
  inactivityTimeout: "30 minutes"
};
```

### 最適化のヒント

#### クライアントサイド最適化

```typescript
// コネクションプーリングの使用
const client = new MCPClient({
  keepAlive: true,
  maxConnections: 5
});

// 可能な場合はリクエストをバッチ処理
const [specs, stats, rules] = await Promise.all([
  client.callTool('list-specs', { filter: 'react' }),
  client.callTool('catalog-stats', {}),
  client.callTool('get-validation-rules', {})
]);

// 頻繁にアクセスされるリソースをキャッシュ
const resourceCache = new Map();
const getResource = async (uri) => {
  if (!resourceCache.has(uri)) {
    resourceCache.set(uri, await client.getResource(uri));
  }
  return resourceCache.get(uri);
};
```

#### サーバーサイド最適化

```bash
# 大規模プロジェクト用のメモリ配分増加
export NODE_OPTIONS="--max-old-space-size=4096"

# 解析キャッシュの有効化
export FLUORITE_ENABLE_CACHE=true
export FLUORITE_CACHE_TTL=3600

# 特定フレームワーク用の最適化
export FLUORITE_PRIMARY_FRAMEWORK=nextjs
```

### 監視と可観測性

#### ヘルスチェック

```typescript
// 基本ヘルスチェック
const health = await client.callTool('self-test', {});
console.log('Server health:', health.status);

// パフォーマンスメトリクス
const perf = await client.callTool('performance-test', {});
console.log('Average response time:', perf.metrics.avg_response_time);

// サーバーメトリクス
const metrics = await client.callTool('server-metrics', {});
console.log('Memory usage:', metrics.memory.used);
```

#### カスタム監視

```typescript
// リクエストパターンの追跡
class MCPMonitor {
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0
  };
  
  async callTool(name: string, args: any) {
    const start = performance.now();
    try {
      const result = await this.client.callTool(name, args);
      this.updateMetrics(performance.now() - start, false);
      return result;
    } catch (error) {
      this.updateMetrics(performance.now() - start, true);
      throw error;
    }
  }
  
  private updateMetrics(duration: number, isError: boolean) {
    this.metrics.requestCount++;
    if (isError) this.metrics.errorCount++;
    
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + duration) / 2;
  }
}
```

### スケーリング考慮事項

#### 水平スケーリング

```yaml
# Docker Compose例
services:
  fluorite-mcp-1:
    image: fluorite-mcp:latest
    environment:
      - CATALOG_DIR=/shared/catalog
    volumes:
      - catalog-data:/shared/catalog
      
  fluorite-mcp-2:
    image: fluorite-mcp:latest
    environment:
      - CATALOG_DIR=/shared/catalog
    volumes:
      - catalog-data:/shared/catalog
      
  load-balancer:
    image: nginx:alpine
    ports:
      - "3000:80"
    depends_on:
      - fluorite-mcp-1
      - fluorite-mcp-2

volumes:
  catalog-data:
```

#### 垂直スケーリング

```bash
# 本番デプロイメント最適化
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=8192"
export FLUORITE_WORKER_THREADS=8
export FLUORITE_ANALYSIS_CONCURRENCY=20
```

## バージョン互換性

### MCPプロトコル互換性

| Fluorite MCPバージョン | MCPプロトコル | Claude Code CLI | Node.js | 機能 |
|---------------------|--------------|-----------------|---------|----------|
| 0.12.x | 1.0.0 | 最新 | 18.0+ | フル機能セット |
| 0.11.x | 1.0.0 | 最新 | 18.0+ | レガシーサポート |
| 0.10.x | 1.0.0 | 最新 | 18.0+ | 静的解析 |
| 0.9.x | 1.0.0 | 最新 | 18.0+ | スパイクテンプレート |
| 0.8.x | 1.0.0 | 最新 | 18.0+ | コア機能 |

### APIバージョニング

Fluorite MCPはセマンティックバージョニングに従います:
- **メジャー**: 破壊的APIの変更、MCPプロトコル更新
- **マイナー**: 新ツール、仕様、後方互換性あり
- **パッチ**: バグ修正、仕様更新、パフォーマンス改善

### マイグレーションガイド

#### 0.7.xから0.8.xへのアップグレード

```bash
# パッケージの更新
npm update -g fluorite-mcp

# 破壊的変更の確認
fluorite-mcp --migration-check

# 必要に応じてClaude Code CLI設定の更新
claude mcp remove fluorite
claude mcp add fluorite -- fluorite-mcp-server
```

**破壊的変更**:
- スパイク操作のツールレスポンス形式の更新
- 静的解析に新しいエラー予測形式を含む
- 一部の仕様カテゴリが再編成

**マイグレーション**:
```typescript
// 旧形式 (0.7.x)
const result = await client.callTool('analyze-project', { path: './src' });

// 新形式 (0.8.x)  
const result = await client.callTool('static-analysis', {
  projectPath: './src',
  framework: 'nextjs'
});
```

## サポート

### ドキュメント

- **[Getting Started Guide](./docs/getting-started.md)** - クイックセットアップと最初のステップ
- **[Installation Guide](./docs/installation.md)** - 詳細なインストール手順
- **[Command Reference](./docs/commands.md)** - 完全なコマンドドキュメント
- **[Developer Guide](./docs/developer.md)** - 高度な開発と貢献

### ドキュメントサポート

- **Official Documentation** - 完全なドキュメントサイト

### 商用サポート

エンタープライズデプロイメントとカスタム統合向け:
- パフォーマンス最適化コンサルティング
- カスタム仕様開発
- 優先サポートとSLA
- トレーニングとオンボーディング

---

*API Documentation v0.12.1 - 最終更新: 2025年1月*