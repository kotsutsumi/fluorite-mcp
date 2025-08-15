# Fluorite MCP - Modern Web Development Context for Claude Code CLI

[![NPM Version](https://img.shields.io/npm/v/fluorite-mcp.svg)](https://www.npmjs.com/package/fluorite-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/fluorite-mcp.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-vitepress-green.svg)](https://kotsutsumi.github.io/fluorite-mcp)

**Fluorite MCP** supercharges Claude Code CLI with comprehensive library knowledge, static analysis, and rapid prototyping capabilities. Transform your development workflow with production-ready code generation, intelligent error prediction, and 1000+ spike templates.

**Quick Start**: `npm i -g fluorite-mcp && claude mcp add fluorite -- fluorite-mcp`

## 🌟 Key Features

### 📚 Comprehensive Library Knowledge
- **90+ Library Specifications** with usage patterns and best practices
- **12 Language Ecosystems** from TypeScript to Rust
- **Framework Expertise** for Next.js, React, Vue, FastAPI, and more

### 🔍 Intelligent Code Analysis
- **50+ Static Analysis Rules** for framework-specific validation
- **Error Prediction Engine** to prevent runtime issues
- **Performance Optimization** recommendations

### 🧪 Rapid Prototyping
- **1000+ Spike Templates** for instant scaffolding
- **Natural Language Commands** for intuitive development
- **Multi-Framework Support** across web, mobile, and backend

### ⚡ Developer Experience
- **Zero Configuration** - works out of the box
- **Production-Ready Output** with correct imports and types
- **Best Practices Built-In** from industry standards

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm i -g fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

### First Steps

Once installed, simply describe what you want to build:

```
"Create a responsive data table with sorting and filtering using shadcn/ui"
```

Claude will automatically access relevant specifications and generate production-ready code with:
- ✅ Correct imports and dependencies
- ✅ TypeScript definitions
- ✅ Accessibility features
- ✅ Best practices built-in

## 🎯 What's Included

### Core Technology Coverage

| Category | Libraries | Count |
|----------|-----------|-------|
| **UI Components** | shadcn/ui, Radix UI, Material-UI, Tremor | 15+ |
| **State Management** | Zustand, Jotai, TanStack Query, Redux | 8+ |
| **Forms & Validation** | react-hook-form, Zod, Valibot, Yup | 6+ |
| **Authentication** | NextAuth.js, Clerk, Lucia, Supabase | 8+ |
| **Testing** | Playwright, Vitest, Cypress, Testing Library | 10+ |
| **Data Visualization** | Recharts, D3.js, Chart.js, Tremor | 6+ |

### Language Ecosystems

| Language | Frameworks | Use Cases |
|----------|------------|-----------|
| **TypeScript/JavaScript** | Next.js, React, Vue | Web development |
| **Python** | FastAPI, Django | APIs, data science |
| **Rust** | Tauri, Axum | Systems, desktop apps |
| **Go** | Fiber, Gin | High-performance backends |
| **Ruby** | Rails | Full-stack web apps |
| **Plus 7 more** | | Mobile, game dev, embedded |

## 💡 How It Works

### Natural Language → Production Code

Simply describe what you need:

| Your Request | Fluorite MCP Action | Result |
|--------------|-------------------|---------|
| "Create a form with validation" | Uses `react-hook-form` + `zod` specs | Type-safe form with validation |
| "Set up authentication" | Accesses `nextauth` specification | Complete auth implementation |
| "Build a data table" | Uses `tanstack-table` patterns | Feature-rich data table |
| "Create API with JWT" | Applies `fastapi-jwt-auth` spike | Production-ready API |

### 🧪 Spike Development

Rapid prototyping with 1000+ pre-built templates:

**Available Categories**:
- **Next.js** (15+ templates): SSR, API routes, authentication, middleware
- **FastAPI** (15+ templates): REST APIs, auth, database, WebSockets
- **Playwright** (8+ templates): E2E testing, accessibility, CI/CD
- **GitHub Actions** (10+ templates): Workflows, deployment, security

**Workflow**:
```bash
1. "I need to prototype JWT authentication"
2. Claude suggests fastapi-jwt-auth spike
3. Template generates working code in seconds
4. Test, iterate, and integrate
```

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](./docs/getting-started.md)** - 5-minute setup and first commands
- **[Installation Guide](./docs/installation.md)** - Detailed installation and troubleshooting
- **[Command Reference](./docs/commands.md)** - Complete command documentation

### Developer Resources  
- **[API Documentation](./API.md)** - Complete technical reference
- **[Developer Guide](./docs/developer.md)** - Contributing and advanced usage
- **[Template Creation](./docs/template-creation.md)** - Create custom templates and specs

### Help & Support
- **[Troubleshooting Guide](./docs/troubleshooting.md)** - Common issues and solutions
- **[Spike Templates Guide](./docs/spike-templates.md)** - Rapid prototyping guide
- **[Online Documentation](https://kotsutsumi.github.io/fluorite-mcp)** - Complete documentation site

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

**Fluorite MCP**は、Claude Code CLIを強化し、包括的なライブラリ知識、静的解析、そして迅速なプロトタイピング機能を提供します。

### 🚀 主な機能

- **📚 90以上のライブラリ仕様**: 使用パターンとベストプラクティス
- **🔍 静的解析**: 50以上のフレームワーク固有の検証ルール
- **🧪 1000以上のスパイクテンプレート**: 即座にスキャフォールディング
- **⚡ ゼロ設定**: すぐに使える

### インストール

```bash
npm i -g fluorite-mcp && claude mcp add fluorite -- fluorite-mcp
```

### ドキュメント

- **[クイックスタートガイド](./docs/getting-started.md)** - 5分でセットアップ
- **[インストールガイド](./docs/installation.md)** - 詳細なインストール手順
- **[APIドキュメント](./API.md)** - 技術リファレンス
- **[開発者ガイド](./docs/developer.md)** - 高度な使用法

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
