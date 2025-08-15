---
layout: home

hero:
  name: "Fluorite MCP"
  text: "Multi-Platform Development Context"
  tagline: "50+ ライブラリ、7つのプログラミング言語エコシステム、8つの包括的モダン技術エコシステムの深い知識をClaude Code CLIに提供"
  actions:
    - theme: brand
      text: はじめる
      link: /specs/
    - theme: alt
      text: GitHub
      link: https://github.com/kotsutsumi/fluorite-mcp

features:
  - icon: 📚
    title: 深いライブラリ知識
    details: 50以上の必須ライブラリの包括的な仕様を提供。正確なインポート、型定義、実装パターンを含む
  - icon: 🌐
    title: 多言語エコシステム
    details: Zig、Elixir、Go、Dart、Flutter、C#、Unityの7つの主要言語エコシステムをサポート
  - icon: 🚀
    title: 包括的モダン技術エコシステム
    details: AI/ML・LLM、クラウドネイティブ、データ処理、モバイル開発など8つの包括的エコシステムをカバー
  - icon: ⚡
    title: 即座のコード生成
    details: プロダクションレディなコードを正しいインポートとベストプラクティスで生成
  - icon: 🎯
    title: ベストプラクティス内蔵
    details: セキュリティ、パフォーマンス、デザインパターンが組み込まれた実装
---

## 🚀 Fluorite MCPとは？

**Fluorite MCP** は、ライブラリや UI コンポーネントの仕様を YAML/JSON で収集し、MCP (Model Context Protocol) で提供するサーバーです。Claude Code CLI に現代的な Web 開発ライブラリの深い知識を提供し、より正確で実用的なコード生成を可能にします。

## 📦 対応ライブラリ

### UI コンポーネント & スタイリング
- **shadcn/ui** - コピペ可能なReactコンポーネント
- **Radix UI Themes** - 完全なデザインシステム  
- **Tailwind CSS** - ユーティリティファーストCSS
- **MUI X Data Grid** - Material-UIグリッド
- **Tremor** - ダッシュボードコンポーネント

### フォーム & バリデーション
- **react-hook-form** - 高性能フォーム
- **Zod** - TypeScriptファーストバリデーション

### 状態管理
- **Jotai** - アトミック状態管理
- **TanStack Query** - 非同期状態とキャッシング

### 認証
- **Auth.js (NextAuth)** - 完全な認証ソリューション
- **Clerk** - ユーザー管理プラットフォーム
- **Lucia** - シンプルな認証ライブラリ

### データベース & ORM
- **Prisma** - 次世代ORM
- **Drizzle ORM** - TypeScript ORM

### 他多数...

## 🌐 言語エコシステム

### システムプログラミング
- **Zig** (`spec://zig-ecosystem`) - メモリ安全なシステムプログラミング

### 関数型・並行プログラミング
- **Elixir** (`spec://elixir-ecosystem`) - Actorモデル、フォルトトレラント設計

### 高性能バックエンド
- **Go** (`spec://go-ecosystem`) - 並行処理、マイクロサービス

### クロスプラットフォーム開発
- **Dart** (`spec://dart-ecosystem`) - 型安全なマルチプラットフォーム言語
- **Flutter** (`spec://flutter-ecosystem`) - モバイル・デスクトップUIフレームワーク

### エンタープライズ・ゲーム開発
- **C#** (`spec://csharp-ecosystem`) - エンタープライズアプリケーション開発
- **Unity** (`spec://unity-ecosystem`) - プロフェッショナルゲーム開発

## 🚀 包括的モダン技術エコシステム

### AI/ML・LLM統合
- **AI/ML・LLM包括エコシステム** (`spec://ai-ml-llm-comprehensive-ecosystem`) - LangChain、llama.cpp、vLLM、Ollama、ベクターデータベース、Hugging Face

### モバイル開発
- **Expo/React Native包括エコシステム** (`spec://expo-react-native-comprehensive-ecosystem`) - Expo Router、React Navigation、状態管理、パフォーマンス最適化
- **ネイティブモバイル開発** (`spec://additional-modern-technologies-ecosystem`) - Swift/iOS、Kotlin/Android、プラットフォーム固有実装

### フロントエンド・UI
- **フロントエンドUI革新エコシステム** (`spec://frontend-ui-innovation-ecosystem`) - tldraw、Excalidraw、Framer Motion、Three.js、shadcn/ui

### バックエンド・サーバーレス
- **モダンバックエンド・サーバーレスエコシステム** (`spec://modern-backend-serverless-ecosystem`) - Bun、Deno、Hono、tRPC、エッジコンピューティング

### 開発効率・DX
- **開発効率・DXエコシステム** (`spec://development-efficiency-dx-ecosystem`) - Nx、Turborepo、Biome、Storybook、モノレポ管理

### データ処理・分析
- **データ処理・分析エコシステム** (`spec://data-processing-analytics-ecosystem`) - DuckDB、Polars、Apache Arrow、Kafka、D3.js

### クラウドネイティブ・インフラ
- **クラウドネイティブインフラエコシステム** (`spec://cloud-native-infrastructure-ecosystem`) - Docker、Kubernetes、Terraform、Prometheus、観測可能性

### テスティング・データベース
- **テスティング・データベース包括エコシステム** (`spec://additional-modern-technologies-ecosystem`) - Playwright、Jest、Prisma、Supabase、品質保証

## 🛠️ クイックスタート

### 1. インストール

```bash
npm install -g fluorite-mcp
```

### 2. Claude Code設定に追加

`claude_desktop_config.json`に以下を追加:

```json
{
  "mcpServers": {
    "fluorite-mcp": {
      "command": "npx",
      "args": ["fluorite-mcp"],
      "env": {}
    }
  }
}
```

### 3. 使用開始

Claude Code CLIで:

```bash
# ライブラリ仕様を取得
spec://@shadcn/ui

# 利用可能な仕様をリスト
list-specs
```

## 📖 MCP プロトコル

### Resources
- **Pattern**: `spec://{package-name}`
- **Example**: `spec://@minoru/react-dnd-treeview`

### Tools
- `list-specs` - 利用可能な仕様をリスト表示
- `upsert-spec` - 新しい仕様を追加または更新

## 🤝 コントリビューション

新しいライブラリ仕様の追加を歓迎します！`src/catalog/`ディレクトリにYAMLファイルを追加してPRを送信してください。

## 📄 ライセンス

MIT License - 詳細は[LICENSE](https://github.com/kotsutsumi/fluorite-mcp/blob/main/LICENSE)を参照
