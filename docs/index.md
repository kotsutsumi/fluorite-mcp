---
layout: home

hero:
  name: "Fluorite MCP"
  text: "Modern Web Development Context"
  tagline: "35+ ライブラリの深い知識をClaude Code CLIに提供し、実用的なコード生成を実現"
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
    details: 35以上の必須ライブラリの包括的な仕様を提供。正確なインポート、型定義、実装パターンを含む
  - icon: ⚡
    title: 即座のコード生成
    details: プロダクションレディなコードを正しいインポートとベストプラクティスで生成
  - icon: 🎯
    title: ベストプラクティス内蔵
    details: セキュリティ、パフォーマンス、デザインパターンが組み込まれた実装
  - icon: 🔄
    title: ライブラリ統合
    details: 複数のライブラリがどのように連携するかを理解し、統合的なソリューションを提供
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
