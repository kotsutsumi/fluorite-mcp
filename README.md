# Fluorite MCP - Modern Web Development Context for Claude Code CLI

[![NPM Version](https://img.shields.io/npm/v/fluorite-mcp.svg)](https://www.npmjs.com/package/fluorite-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/fluorite-mcp.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-vitepress-green.svg)](https://kotsutsumi.github.io/fluorite-mcp)

**Fluorite MCP** enhances Claude Code CLI with comprehensive library specifications, development methodologies, and multi-language ecosystem knowledge, enabling production-ready code generation with best practices built-in.

[English](#english) | [日本語](#日本語)

## English

### 🚀 Features

- **📚 90+ Library Specifications**: Deep knowledge of modern web development libraries
- **🌍 12 Language Ecosystems**: From TypeScript to Rust, covering all major platforms
- **🎯 Development Methodologies**: Spike development, agile practices, and more
- **⚡ Production-Ready Code**: Generate code with correct imports, types, and patterns
- **🔍 Static Analysis**: 50+ validation rules for Next.js, React, Vue
- **🤖 Error Prediction**: AI-inspired pattern matching to prevent runtime errors

### 📦 Installation

```bash
# Install globally
npm i -g fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

### 🎯 What's Included

#### Core Libraries (90+)
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS, Material-UI
- **State Management**: Zustand, Jotai, TanStack Query, Redux Toolkit
- **Forms & Validation**: react-hook-form, Zod, Valibot, Yup
- **Data Tables**: AG Grid, TanStack Table, MUI X Data Grid
- **Authentication**: NextAuth.js, Clerk, Lucia, Supabase Auth
- **Payments**: Stripe, Paddle, RevenueCat
- **Testing**: Playwright, Vitest, Cypress, Testing Library

#### Comprehensive Ecosystems

**Web Development**
- Build Tools: Vite, Webpack, ESBuild, SWC, Rollup
- Frameworks: Next.js, Remix, Nuxt, SvelteKit, Astro
- Mobile/Desktop: React Native, Expo, Electron, Tauri, Capacitor

**Development Methodologies**
- **Spike Development**: Rapid prototyping and proof-of-concept workflows
- **Agile Practices**: User story templates, sprint planning tools
- **Testing Strategies**: TDD, BDD, E2E testing patterns

**Language Ecosystems**
- **TypeScript/JavaScript**: Modern web development
- **Rust**: Systems programming with Tauri
- **Go**: High-performance backends
- **Python**: FastAPI, Django, data science
- **Ruby**: Rails full-stack development
- **Elixir**: Phoenix framework, fault-tolerant systems
- **C#**: .NET Core, Unity game development
- **Dart/Flutter**: Cross-platform mobile apps
- **Lua**: Embedded scripting, game development
- **Zig**: Memory-safe systems programming

**Infrastructure & DevOps**
- **Kubernetes**: Helm, ArgoCD, Flux, Istio
- **IaC**: Terraform, Pulumi, CloudFormation
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Monitoring**: Prometheus, Grafana, OpenTelemetry

### 💡 Usage Examples

Once connected to Claude Code CLI, Fluorite MCP automatically provides context:

```typescript
// User: "Create a data table with sorting and filtering"
// Claude will use spec://tanstack-table for accurate implementation

// User: "Set up authentication with NextAuth"
// Claude will use spec://nextauth with correct configuration

// User: "Create a spike for drag-and-drop feature"
// Claude will use spec://spike-development-ecosystem
```

### 🧪 Spikes (experimental)

Template-driven spikes help LLMs reuse pre-vetted scaffolds instead of free-form generation.

- Tools: `discover-spikes`, `auto-spike`, `preview-spike`, `apply-spike`, `validate-spike`, `explain-spike`.
- Catalog: `src/spikes/*.json` with simple `{{var}}` templating.
- Flow: `auto_spike(task)` → `preview_spike(id, params)` → `apply_spike` → `validate_spike` → `explain_spike`.

Note: The server returns diffs/files; the client applies them.

### 📚 Documentation

- [API Documentation](./API.md) - Complete API reference
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Benefits Overview](./BENEFITS.md) - Detailed advantages
- [Online Documentation](https://kotsutsumi.github.io/fluorite-mcp) - Full documentation

### 🛠️ Development

```bash
# Clone repository
git clone https://github.com/kotsutsumi/fluorite-mcp.git
cd fluorite-mcp

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build documentation
npm run docs:dev
```

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

Common contributions:
- Adding new library specifications
- Updating existing specifications
- Adding language ecosystems
- Improving documentation
- Bug fixes and enhancements

---

## 日本語

### 🚀 特徴

- **📚 90以上のライブラリ仕様**: モダンWeb開発ライブラリの深い知識
- **🌍 12の言語エコシステム**: TypeScriptからRustまで、主要プラットフォームを網羅
- **🎯 開発方法論**: スパイク開発、アジャイル手法など
- **⚡ 本番対応コード**: 正しいインポート、型、パターンでコード生成
- **🔍 静的解析**: Next.js、React、Vue向けの50以上の検証ルール
- **🤖 エラー予測**: AIパターンマッチングによる実行時エラー防止

### 📦 インストール

```bash
# グローバルインストール
npm i -g fluorite-mcp

# Claude Code CLIに追加
claude mcp add fluorite -- fluorite-mcp
```

### 🎯 含まれる内容

#### コアライブラリ（90以上）
- **UIコンポーネント**: shadcn/ui、Radix UI、Tailwind CSS、Material-UI
- **状態管理**: Zustand、Jotai、TanStack Query、Redux Toolkit
- **フォーム・検証**: react-hook-form、Zod、Valibot、Yup
- **データテーブル**: AG Grid、TanStack Table、MUI X Data Grid
- **認証**: NextAuth.js、Clerk、Lucia、Supabase Auth
- **決済**: Stripe、Paddle、RevenueCat
- **テスト**: Playwright、Vitest、Cypress、Testing Library

#### 包括的エコシステム

**Web開発**
- ビルドツール: Vite、Webpack、ESBuild、SWC、Rollup
- フレームワーク: Next.js、Remix、Nuxt、SvelteKit、Astro
- モバイル/デスクトップ: React Native、Expo、Electron、Tauri、Capacitor

**開発方法論**
- **スパイク開発**: 高速プロトタイピングとPoCワークフロー
- **アジャイル手法**: ユーザーストーリーテンプレート、スプリント計画ツール
- **テスト戦略**: TDD、BDD、E2Eテストパターン

**言語エコシステム**
- **TypeScript/JavaScript**: モダンWeb開発
- **Rust**: Tauriを使用したシステムプログラミング
- **Go**: 高性能バックエンド
- **Python**: FastAPI、Django、データサイエンス
- **Ruby**: Railsフルスタック開発
- **Elixir**: Phoenixフレームワーク、耐障害性システム
- **C#**: .NET Core、Unityゲーム開発
- **Dart/Flutter**: クロスプラットフォームモバイルアプリ
- **Lua**: 組み込みスクリプティング、ゲーム開発
- **Zig**: メモリ安全なシステムプログラミング

**インフラ・DevOps**
- **Kubernetes**: Helm、ArgoCD、Flux、Istio
- **IaC**: Terraform、Pulumi、CloudFormation
- **CI/CD**: GitHub Actions、GitLab CI、Jenkins
- **監視**: Prometheus、Grafana、OpenTelemetry

### 💡 使用例

Claude Code CLIに接続すると、Fluorite MCPが自動的にコンテキストを提供：

```typescript
// ユーザー: "ソートとフィルタリング機能付きのデータテーブルを作成"
// Claudeは spec://tanstack-table を使用して正確な実装を提供

// ユーザー: "NextAuthで認証を設定"
// Claudeは spec://nextauth を使用して正しい設定を提供

// ユーザー: "ドラッグ&ドロップ機能のスパイクを作成"
// Claudeは spec://spike-development-ecosystem を使用
```

### 🧪 Spikes（実験的）

テンプレート化されたスパイクで、自由生成よりも再利用を優先できます。

- ツール: `discover-spikes`, `auto-spike`, `preview-spike`, `apply-spike`, `validate-spike`, `explain-spike`
- カタログ: `src/spikes/*.json`（`{{var}}`トークンをレンダリング）
- 流れ: `auto_spike(task)` → `preview_spike(id, params)` → `apply_spike` → `validate_spike` → `explain_spike`

注: サーバーは差分とファイルを返します（適用はクライアント側）。

### 📚 ドキュメント

- [APIドキュメント](./API.md) - 完全なAPIリファレンス
- [コントリビューションガイド](./CONTRIBUTING.md) - 貢献方法
- [利点の概要](./BENEFITS.md) - 詳細な利点
- [オンラインドキュメント](https://kotsutsumi.github.io/fluorite-mcp) - 完全なドキュメント

### 🛠️ 開発

```bash
# リポジトリをクローン
git clone https://github.com/kotsutsumi/fluorite-mcp.git
cd fluorite-mcp

# 依存関係をインストール
npm install

# 開発サーバーを実行
npm run dev

# テストを実行
npm test

# ドキュメントをビルド
npm run docs:dev
```

### 🤝 コントリビューション

貢献を歓迎します！詳細は[コントリビューションガイド](./CONTRIBUTING.md)をご覧ください。

一般的な貢献：
- 新しいライブラリ仕様の追加
- 既存仕様の更新
- 言語エコシステムの追加
- ドキュメントの改善
- バグ修正と機能強化

---

## 📊 Project Statistics

- **Total Specifications**: 90+ libraries and tools
- **Language Ecosystems**: 12 comprehensive ecosystems
- **Validation Rules**: 50+ for framework-specific checks
- **Error Patterns**: 12 predictive patterns
- **Documentation**: 100+ pages of guides and references

## 🏗️ Project Structure

```
fluorite-mcp/
├── catalog/          # YAML specification files
├── src/             # TypeScript source code
│   ├── core/        # Core MCP functionality
│   ├── server.ts    # MCP server entry point
│   └── test/        # Test files
├── docs/            # VitePress documentation
│   └── specs/       # Library specifications
├── dist/            # Compiled JavaScript
└── package.json     # Project configuration
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- Claude Code CLI team for MCP support
- All library maintainers for excellent documentation
- Community contributors for specifications and improvements

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/fluorite-mcp)
- [GitHub Repository](https://github.com/kotsutsumi/fluorite-mcp)
- [Documentation](https://kotsutsumi.github.io/fluorite-mcp)
- [Issue Tracker](https://github.com/kotsutsumi/fluorite-mcp/issues)
- [Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)

---

<p align="center">
  Built with ❤️ to enhance Claude Code CLI's capabilities
</p>
