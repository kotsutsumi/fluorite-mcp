# /fl: コマンドリファレンス - SuperClaude統合

SuperClaudeパラメータバイパスとSpike開発ワークフロー統合を備えた拡張fluorite-mcpコマンド。

## 概要

`/fl:`コマンドシリーズは、完全なSuperClaudeパラメータバイパスサポートを備えた拡張fluorite-mcp機能を提供します。これらのコマンドは、Claude Code CLIをfluorite-mcpの包括的なライブラリ知識とSpike開発ワークフローと橋渡しします。

## 完全なパラメータバイパスサポート

✅ **すべてのSuperClaudeフラグが透過的に渡されます**:
- `--loop` - 反復改善モード
- `--wave-mode` - 多段階オーケストレーション
- `--delegate` - サブエージェント委任
- `--until-perfect` - 品質ゲート実行
- `--ultrathink` - 最大解析深度
- `--all-mcp` - 全MCPサーバーを有効化

## 利用可能なコマンド

### /fl:implement

Spike開発統合を備えた拡張機能実装。

**使用法**: `/fl:implement [説明] [SuperClaudeフラグ] [--type type] [--framework name]`

**主な機能**:
- UIコンポーネント用Spike開発ワークフロー
- 自動スパイクテンプレート発見と適用
- 完全なSuperClaudeパラメータバイパス
- 750+のスパイクテンプレートカタログ
- フレームワーク固有の最適化

**例**:
```bash
# React TypeScriptコンポーネントの作成
/fl:implement "データテーブルコンポーネント（ソート・フィルタリング付き）" --type component --framework react-typescript

# 反復改善モードでAPIエンドポイント実装
/fl:implement "ユーザー認証API" --loop --type api --framework express

# 最大思考モードでUI実装
/fl:implement "レスポンシブダッシュボード" --ultrathink --wave-mode --type component
```

### /fl:build

フレームワーク検出を備えたプロジェクトビルダー。

**使用法**: `/fl:build [ターゲット] [SuperClaudeフラグ] [--framework name] [--optimize]`

**主な機能**:
- 自動フレームワーク検出（Next.js、React、Vue、FastAPI等）
- パフォーマンス最適化
- TypeScript統合
- 本番環境対応の設定
- ビルドパイプライン最適化

**例**:
```bash
# Next.jsアプリケーションの最適化ビルド
/fl:build --framework nextjs --optimize

# 複数言語サポートでビルド
/fl:build --wave-mode --delegate --framework react --optimize

# 完璧になるまで反復ビルド
/fl:build --loop --until-perfect --framework vue
```

### /fl:analyze

多次元コードおよびシステム解析。

**使用法**: `/fl:analyze [ターゲット] [SuperClaudeフラグ] [--focus area]`

**フォーカスエリア**:
- `quality` - コード品質と保守性
- `security` - セキュリティ脆弱性
- `performance` - パフォーマンスボトルネック
- `architecture` - システム設計とパターン

**例**:
```bash
# 包括的品質解析
/fl:analyze src/ --focus quality --ultrathink --all-mcp

# セキュリティ監査
/fl:analyze --focus security --wave-mode --delegate

# パフォーマンス解析
/fl:analyze --focus performance --loop --until-perfect
```

### /fl:improve

エビデンスベースのコード改善。

**使用法**: `/fl:improve [ターゲット] [SuperClaudeフラグ] [--focus area]`

**改善エリア**:
- `performance` - パフォーマンス最適化
- `quality` - コード品質向上
- `security` - セキュリティ強化
- `accessibility` - アクセシビリティ改善

**例**:
```bash
# パフォーマンス改善の反復実行
/fl:improve src/components --focus performance --loop --wave-mode

# 品質改善の完全実行
/fl:improve --focus quality --until-perfect --ultrathink --all-mcp

# セキュリティ強化
/fl:improve --focus security --delegate --wave-mode
```

### /fl:design

設計オーケストレーションとシステムアーキテクチャ。

**使用法**: `/fl:design [ドメイン] [SuperClaudeフラグ] [--style type]`

**設計スタイル**:
- `component` - UIコンポーネント設計
- `system` - システムアーキテクチャ
- `api` - API設計
- `database` - データベース設計

**例**:
```bash
# システムアーキテクチャ設計
/fl:design "eコマースプラットフォーム" --style system --wave-mode --ultrathink

# コンポーネント設計システム
/fl:design "デザインシステム" --style component --delegate --loop

# API設計
/fl:design "マイクロサービスAPI" --style api --until-perfect
```

### /fl:test

テストワークフローと検証。

**使用法**: `/fl:test [type] [SuperClaudeフラグ] [--coverage] [--watch]`

**テストタイプ**:
- `unit` - ユニットテスト
- `integration` - 統合テスト
- `e2e` - エンドツーエンドテスト
- `performance` - パフォーマンステスト

**例**:
```bash
# 包括的テストスイート
/fl:test --coverage --wave-mode --delegate --until-perfect

# E2Eテストの監視実行
/fl:test e2e --watch --loop

# パフォーマンステスト
/fl:test performance --ultrathink --all-mcp
```

### /fl:document

ドキュメント生成と更新。

**使用法**: `/fl:document [ターゲット] [SuperClaudeフラグ] [--format type] [--lang language]`

**フォーマット**:
- `markdown` - Markdownドキュメント
- `html` - HTMLドキュメント
- `api` - APIドキュメント
- `jsdoc` - JSDocドキュメント

**例**:
```bash
# 日本語API文書生成
/fl:document src/api --format api --lang ja --loop --until-perfect

# 包括的プロジェクトドキュメント
/fl:document --format markdown --wave-mode --delegate --ultrathink

# 多言語ドキュメント
/fl:document --lang ja --lang en --all-mcp --until-perfect
```

## 高度な機能

### SuperClaudeペルソナ統合

各`/fl:`コマンドは、適切なSuperClaudeペルソナを自動的にアクティブ化します：

- `--persona-architect` - システム設計とアーキテクチャ
- `--persona-frontend` - UI/UX とフロントエンド開発
- `--persona-backend` - サーバーサイドとインフラ
- `--persona-security` - セキュリティとコンプライアンス
- `--persona-performance` - 最適化とボトルネック解消

### MCPサーバー統合

`/fl:`コマンドは複数のMCPサーバーと統合します：

- **Context7**: 公式ライブラリドキュメントとベストプラクティス
- **Sequential**: 複雑な多段階分析と推論
- **Magic**: モダンUIコンポーネント生成
- **Playwright**: クロスブラウザ自動化とE2Eテスト

### Spike開発ワークフロー

750+ のスパイクテンプレートカタログと統合：

**フロントエンドフレームワーク**: 180+ テンプレート
- React、Vue、Angular、Svelte
- Next.js、Nuxt.js、SvelteKit
- TypeScript統合と最適化

**バックエンドAPI**: 120+ テンプレート
- Express、Fastify、Hono
- FastAPI、Django、Flask
- GraphQL、REST、gRPC

**テストと品質**: 150+ テンプレート
- Jest、Vitest、Playwright
- Cypress、Testing Library
- パフォーマンステストとE2E

**インフラストラクチャ**: 200+ テンプレート
- Docker、Kubernetes
- GitHub Actions、CI/CD
- クラウドデプロイメント

## 実用例

### React TypeScriptアプリケーション

```bash
# 1. プロジェクト分析
/fl:analyze --focus architecture --ultrathink

# 2. コンポーネント実装
/fl:implement "ユーザーダッシュボード" --type component --framework react-typescript --loop

# 3. パフォーマンス最適化
/fl:improve --focus performance --wave-mode --until-perfect

# 4. テスト追加
/fl:test --coverage --delegate

# 5. ドキュメント生成
/fl:document --format markdown --lang ja --all-mcp
```

### FastAPI バックエンド

```bash
# 1. API設計
/fl:design "ユーザー管理API" --style api --ultrathink --wave-mode

# 2. 実装
/fl:implement "認証エンドポイント" --type api --framework fastapi --loop

# 3. セキュリティ監査
/fl:analyze --focus security --all-mcp --until-perfect

# 4. API文書生成
/fl:document --format api --lang ja --delegate
```

### Full-Stack プロジェクト

```bash
# 1. システム設計
/fl:design "Eコマースプラットフォーム" --style system --wave-mode --ultrathink

# 2. フロントエンド構築
/fl:build frontend/ --framework nextjs --optimize --delegate

# 3. バックエンド構築
/fl:build backend/ --framework fastapi --optimize --delegate

# 4. 統合テスト
/fl:test integration --coverage --loop --until-perfect

# 5. 全体最適化
/fl:improve --focus performance --wave-mode --all-mcp --until-perfect
```

## パフォーマンス最適化

### 効率的な実行

`/fl:`コマンドは、最適なパフォーマンスのために設計されています：

- **並列実行**: `--delegate`による複数サブエージェント
- **インテリジェントキャッシュ**: Context7とSequential結果のキャッシュ
- **トークン最適化**: `--uc`フラグによる自動トークン効率化
- **プログレッシブ強化**: `--wave-mode`による段階的改善

### 推奨設定

```bash
# 高速開発
export FLUORITE_PERFORMANCE_MODE=fast
export FLUORITE_CACHE_ENABLED=true

# バランス型
export FLUORITE_PERFORMANCE_MODE=balanced
export FLUORITE_MAX_PARALLEL=3

# 高精度モード
export FLUORITE_PERFORMANCE_MODE=accuracy
export FLUORITE_ANALYSIS_DEPTH=deep
```

## トラブルシューティング

### 一般的な問題

**コマンドが認識されない**
```bash
# SuperClaudeコマンド形式を確認
echo '/fl:help'

# fluorite-mcpが正しくインストールされているか確認
fluorite-mcp --version
```

**パフォーマンスが遅い**
```bash
# キャッシュを有効化
export FLUORITE_CACHE_ENABLED=true

# 並列実行を制限
export FLUORITE_MAX_PARALLEL=2
```

**メモリ使用量が高い**
```bash
# メモリ制限を設定
export NODE_OPTIONS="--max-old-space-size=4096"

# ガベージコレクションを最適化
export NODE_OPTIONS="--gc-interval=100"
```

### デバッグモード

```bash
# デバッグログを有効化
export FLUORITE_DEBUG=true
export FLUORITE_LOG_LEVEL=debug

# 詳細トレーシング
export FLUORITE_TRACE_COMMANDS=true
export FLUORITE_TRACE_MCP=true
```

## 関連ドキュメント

- **[スパイクテンプレートガイド](./spike-templates.ja.md)** - 750+ テンプレートの完全リファレンス
- **[APIドキュメント](../API.md)** - 技術的なAPIリファレンス
- **[コマンドリファレンス](./commands.ja.md)** - 標準コマンドドキュメント
- **[トラブルシューティング](./troubleshooting.ja.md)** - 問題解決ガイド

## コミュニティとサポート

### ヘルプの取得

1. **GitHub Issues**: [バグ報告と機能要求](https://github.com/kotsutsumi/fluorite-mcp/issues)
2. **GitHub Discussions**: [コミュニティサポート](https://github.com/kotsutsumi/fluorite-mcp/discussions)
3. **ドキュメント**: [完全なドキュメント](./README.ja.md)

### 貢献

`/fl:`コマンドの改善に貢献してください：

- 新しいコマンドパターンの提案
- スパイクテンプレートの追加
- パフォーマンス最適化
- ドキュメントの改善

---

*Fluorite MCPの`/fl:`コマンドで、高度な開発ワークフローを体験してください。SuperClaudeの力と750+のスパイクテンプレートを組み合わせて、開発効率を最大化しましょう。*