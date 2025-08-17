# Fluorite MCP - 完全機能ドキュメント

## 目次

1. [コアMCPサーバー機能](#コアmcpサーバー機能)
2. [ライブラリ仕様システム](#ライブラリ仕様システム)
3. [スパイクテンプレートエンジン](#スパイクテンプレートエンジン)
4. [静的解析エンジン](#静的解析エンジン)
5. [メモリエンジン](#メモリエンジン)
6. [CLI統合](#cli統合)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [セキュリティ機能](#セキュリティ機能)

---

## コアMCPサーバー機能

### 概要
Fluorite MCPは、Model Context Protocol (MCP)を実装し、Claude Code CLIおよび他のAI支援開発ツールに包括的な開発コンテキストを提供します。

### 主要コンポーネント

#### 1. MCPプロトコル実装
- **完全プロトコルサポート**: MCP仕様の完全実装
- **ツール登録**: Claude Code CLIとの動的ツール登録
- **コンテキストストリーミング**: 開発中のリアルタイムコンテキスト更新
- **エラー回復**: 堅牢なエラー処理と回復メカニズム

#### 2. リクエスト処理
```typescript
interface MCPRequest {
  method: string;
  params: Record<string, any>;
  id?: string | number;
}

interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}
```

#### 3. リソース管理
- **動的リソース解決**: 要求時のライブラリ仕様読み込み
- **キャッシング戦略**: パフォーマンス向上のためのインテリジェントキャッシング
- **メモリ効率**: 大規模プロジェクトでの低メモリフットプリント

---

## ライブラリ仕様システム

### アーキテクチャ

#### YAML仕様フォーマット
```yaml
name: "library-name"
version: "1.0.0"
description: "ライブラリの説明"
category: "development-category"

# インストール情報
installation:
  npm: "npm install library-name"
  yarn: "yarn add library-name"
  pnpm: "pnpm add library-name"

# 使用例
usage: |
  import { LibraryClass } from 'library-name';
  
  const instance = new LibraryClass({
    config: 'value'
  });

# APIリファレンス
api:
  classes:
    LibraryClass:
      description: "メインライブラリクラス"
      methods:
        initialize:
          description: "ライブラリを初期化"
          parameters:
            - name: "config"
              type: "object"
              required: true

# 設定オプション
configuration:
  options:
    - name: "timeout"
      type: "number"
      default: 5000
      description: "タイムアウト値（ミリ秒）"
```

#### カタログ管理
- **750+のエコシステム**: React、Vue、Next.js、Node.js等
- **自動更新**: 最新バージョンとの同期
- **品質保証**: 手動レビューと自動検証

### 主要機能

#### 1. ライブラリ検索
```bash
# 名前による検索
fluorite-mcp list-specs --filter "react"

# カテゴリによる検索
fluorite-mcp list-specs --filter "ui-framework"
```

#### 2. 仕様アップサート
```bash
# 新しい仕様の追加
fluorite-mcp upsert-spec my-library "$(cat spec.yaml)"
```

#### 3. 統計と診断
```bash
# カタログ統計の表示
fluorite-mcp catalog-stats
```

---

## スパイクテンプレートエンジン

### 概要
スパイクテンプレートは、共通パターンの実証済み実装を提供することで開発を加速する本番対応のコードスキャフォールドです。認証、API、テスト、デプロイメントなどをカバーする750+のテンプレートで、アイデアから動作するコードまで数秒で実現できます。

### テンプレートカテゴリ

#### 認証・セキュリティ
- **JWT認証**: 様々なフレームワーク向けの15+テンプレート
- **OAuth統合**: 主要なOAuthプロバイダーとプラットフォーム
- **セッション管理**: Cookie ベース、トークンベース、Redisセッション
- **2FA実装**: TOTP、SMS、メール認証

#### API開発
- **REST API**: Express、Fastify、Honoテンプレート
- **GraphQL**: Apollo Server、GraphQL Yoga、Pothos
- **WebSockets**: Socket.IO、ネイティブWebSockets、リアルタイム機能

#### フロントエンド開発
- **React コンポーネント**: Hooks、Context、状態管理
- **Vue コンポーネント**: Composition API、Pinia、reactive patterns
- **UI ライブラリ**: Tailwind、Chakra UI、MUI、shadcn/ui

#### データベース統合
- **SQL データベース**: PostgreSQL、MySQL、SQLite
- **NoSQL データベース**: MongoDB、Redis、DynamoDB
- **ORM/ODM**: Prisma、TypeORM、Mongoose、Drizzle

#### テスト・品質保証
- **単体テスト**: Jest、Vitest、Testing Library
- **E2Eテスト**: Playwright、Cypress、Puppeteer
- **パフォーマンステスト**: Lighthouse、WebPageTest、k6

### テンプレート発見

#### 自然言語検索
```bash
# 必要なものを平易な英語で説明
fluorite-mcp discover "JWT認証システム"
fluorite-mcp discover "バリデーション付きReactフォーム"
fluorite-mcp discover "PostgreSQLを使用したREST API"
```

#### インテリジェント自動選択
```bash
# AIにタスクに最適なテンプレートを選択させる
fluorite-mcp auto-spike "Next.jsアプリ用のログインシステムを作成"
```

### テンプレート適用

#### プレビューモード
```bash
# 適用前にテンプレートをプレビュー
fluorite-mcp preview-spike nextauth-setup --params app_name=my-app
```

#### テンプレート適用
```bash
# テンプレートを適用してファイルを生成
fluorite-mcp apply-spike nextauth-setup \
  --params app_name=my-app,database_url=postgresql://...
```

#### 競合解決
```bash
# 競合解決戦略を指定
fluorite-mcp apply-spike api-setup \
  --strategy three_way_merge \
  --params port=3000
```

---

## 静的解析エンジン

### 概要
実行前に包括的な静的解析を実行し、潜在的な問題を検出する高度な解析システム。特にNext.js、React、Vueなどのモダンフレームワーク向けに最適化されています。

### 解析機能

#### 1. フレームワーク固有の解析
- **Next.js最適化**: App Router、ページルーティング、API routes
- **React パターン**: Hooks規則、コンポーネント構造、状態管理
- **Vue 3対応**: Composition API、リアクティビティ、TypeScript統合

#### 2. コード品質解析
```typescript
interface AnalysisResult {
  issues: Issue[];
  metrics: CodeMetrics;
  suggestions: Suggestion[];
  autoFixes: AutoFix[];
}

interface Issue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  rule: string;
  fixable: boolean;
}
```

#### 3. パフォーマンス解析
- **バンドルサイズ解析**: 大きな依存関係の特定
- **レンダリング最適化**: 不要な再レンダリングの検出
- **非同期パターン**: Promise、async/await の使用パターン

### 解析ルール

#### セキュリティルール
- **XSS防止**: 危険なinnerHTML使用の検出
- **CSRF保護**: 適切なCSRFトークンの確認
- **依存関係スキャン**: 既知の脆弱性のチェック

#### パフォーマンスルール
- **メモリリーク**: 適切でないイベントリスナーの検出
- **バンドル最適化**: 未使用コードの特定
- **画像最適化**: 最適化されていない画像の検出

### 使用方法

#### 基本的な解析
```bash
# プロジェクト全体を解析
fluorite-mcp static-analysis /path/to/project

# 特定のファイルを解析
fluorite-mcp static-analysis /path/to/project \
  --target-files src/components/Header.tsx
```

#### フレームワーク指定解析
```bash
# Next.js特化解析
fluorite-mcp static-analysis /path/to/nextjs-app \
  --framework nextjs \
  --strict-mode

# React特化解析
fluorite-mcp static-analysis /path/to/react-app \
  --framework react \
  --auto-fix
```

#### リアルタイム解析
```bash
# ファイル変更の監視と解析
fluorite-mcp realtime-validation src/components/Button.tsx \
  --watch-mode
```

---

## メモリエンジン

### アーキテクチャ
Rustで実装された高パフォーマンスメモリエンジンは、パターン学習、テンプレート分析、および適応的推奨を提供します。

### 主要機能

#### 1. パターン学習
```rust
pub struct PatternLearner {
    pattern_db: PatternDatabase,
    learning_rate: f64,
    confidence_threshold: f64,
}

impl PatternLearner {
    pub async fn learn_from_usage(&mut self, 
        usage_data: &UsageData
    ) -> Result<LearningResult, LearningError> {
        // パターン学習の実装
    }
}
```

#### 2. テンプレート最適化
- **使用頻度追跡**: よく使用されるテンプレートの特定
- **成功率測定**: テンプレート適用の成功率
- **コンテキスト学習**: プロジェクト固有の使用パターン

#### 3. 適応的推奨
- **プロジェクト分析**: 既存のコードベースの理解
- **フレームワーク検出**: 使用技術スタックの自動検出
- **パーソナライゼーション**: 開発者の好みの学習

---

## CLI統合

### fluorite-mcp CLI

#### インストール
```bash
# グローバルインストール
npm install -g fluorite-mcp

# プロジェクト固有インストール
npm install --save-dev fluorite-mcp
```

#### 基本コマンド
```bash
# セットアップ
fluorite-mcp setup

# バージョン確認
fluorite-mcp --version

# ヘルプ表示
fluorite-mcp --help
```

### Claude Code統合

#### MCP サーバー設定
```json
{
  "name": "fluorite-mcp",
  "command": "fluorite-mcp",
  "env": {
    "FLUORITE_CATALOG_DIR": "./fluorite-catalog"
  }
}
```

#### 使用例
```bash
# Claude Code内でfluorite-mcpツールを使用
claude code --mcp fluorite-mcp analyze-project
claude code --mcp fluorite-mcp discover-spikes "authentication"
```

---

## パフォーマンス最適化

### メモリ効率
- **遅延読み込み**: 必要時のみ仕様ファイルを読み込み
- **キャッシング戦略**: LRUキャッシュによる高速アクセス
- **メモリプール**: オブジェクト再利用によるGC圧力軽減

### 処理速度
```typescript
// パフォーマンス測定
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  startTimer(operation: string): void {
    this.metrics.set(operation, {
      startTime: performance.now(),
      endTime: 0,
      duration: 0
    });
  }

  endTimer(operation: string): number {
    const metric = this.metrics.get(operation);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      return metric.duration;
    }
    return 0;
  }
}
```

### スケーラビリティ
- **並列処理**: 複数ファイルの同時解析
- **ストリーミング**: 大きなファイルのストリーミング処理
- **増分処理**: 変更されたファイルのみの再解析

---

## セキュリティ機能

### 入力検証
```typescript
// Zodを使用した厳格な入力検証
import { z } from 'zod';

const PackageNameSchema = z.string()
  .min(1, "パッケージ名は必須です")
  .max(214, "パッケージ名が長すぎます")
  .regex(/^[a-z0-9\-_./@]+$/, "無効なパッケージ名形式");

const YamlContentSchema = z.string()
  .min(1, "YAML内容は必須です")
  .max(1024 * 1024, "ファイルサイズが大きすぎます");
```

### ファイルシステム保護
- **パス検証**: ディレクトリトラバーサル攻撃の防止
- **権限チェック**: 適切なファイル権限の確認
- **サンドボックス**: 指定ディレクトリ外へのアクセス制限

### 依存関係セキュリティ
- **脆弱性スキャン**: npm audit との統合
- **ライセンスチェック**: ライセンス互換性の確認
- **更新通知**: セキュリティアップデートの通知

### 暗号化
- **トランジット暗号化**: HTTPS通信の強制
- **ローカル暗号化**: 機密データのローカル暗号化
- **認証**: APIキーとトークンの安全な管理

---

## 開発者体験

### エラーハンドリング
```typescript
export class FluoriteError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FluoriteError';
  }
}

export class ValidationError extends FluoriteError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}
```

### ログ機能
- **構造化ログ**: JSON形式での詳細ログ
- **レベル別ログ**: debug、info、warn、error
- **パフォーマンス追跡**: 操作時間の記録

### デバッグサポート
- **詳細エラーメッセージ**: 問題の正確な特定
- **スタックトレース**: エラー発生箇所の表示
- **診断ツール**: self-test、performance-test

この包括的な機能セットにより、Fluorite MCPは現代の開発ワークフローに不可欠なツールとなり、開発者の生産性を大幅に向上させます。