# Fluorite MCP - Modern Web Development Context for Claude Code CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/fluorite-mcp.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Fluorite MCP** は、ライブラリや UI コンポーネントの仕様を YAML/JSON で収集し、MCP (Model Context Protocol) で提供するサーバーです。Claude Code CLI にモダン開発ライブラリと12の主要プログラミング言語エコシステムの深い知識を提供し、より正確で実用的なコード生成を可能にします。

## 🚀 Why Fluorite MCP?

Fluorite MCP transforms Claude Code CLI into an intelligent multi-platform development expert with:

- **📚 Deep Library Knowledge**: Comprehensive specs for 90+ essential libraries
- **🌐 Multi-Language Support**: 12 major programming language ecosystems
- **⚡ Instant Code Generation**: Production-ready code with correct imports
- **🎯 Best Practices Built-in**: Security, performance, and patterns included
- **🔄 Library Integration**: Understands how libraries work together

See [BENEFITS.md](./BENEFITS.md) for detailed advantages.

## 📦 Supported Libraries

### UI Components & Styling
- **shadcn/ui** - Copy-paste React components
- **Radix UI Themes** - Complete design system
- **Tailwind CSS** - Utility-first CSS
- **Aceternity UI** - Animated components
- **Magic UI** - Beautiful animations

### Forms & Validation
- **react-hook-form** - Performant forms
- **Zod** - TypeScript-first validation

### State Management
- **Jotai** - Atomic state management
- **TanStack Query** - Async state & caching
- **Zustand** - Lightweight state management

### Data Tables & Visualization
- **AG Grid** - Enterprise data grid
- **MUI X Data Grid** - Material-UI grid
- **TanStack Table** - Headless tables
- **Recharts** - Composable charts
- **Tremor** - Dashboard components
- **visx** - D3-based visualizations

### Authentication
- **Auth.js (NextAuth)** - Complete auth solution
- **Clerk** - User management platform
- **Lucia** - Simple auth library

### Payments & Billing
- **Stripe** - Payment processing
- **Paddle** - SaaS billing & tax compliance

### Database & ORM
- **Prisma** - Next-generation ORM
- **Drizzle ORM** - TypeScript ORM

### File Uploads
- **UploadThing** - File upload infrastructure

### Internationalization
- **next-intl** - Next.js i18n

### Monitoring & Analytics
- **Sentry** - Error tracking & performance
- **PostHog** - Product analytics

### Infrastructure
- **Upstash Redis** - Serverless Redis
- **Hono** - Fast web framework

### API & Backend
- **tRPC** - End-to-end typesafe APIs
- **Hono** - Ultrafast web framework

## 🌐 Language Ecosystems

### System Programming
- **Zig** (`spec://zig-ecosystem`) - Memory-safe systems programming
  - Standard library, networking, HTTP, SQLite, testing

### Functional & Concurrent Programming  
- **Elixir** (`spec://elixir-ecosystem`) - Actor model, fault-tolerant design
  - Phoenix, Ecto, Absinthe, Plug, Guardian, Distillery

### High-Performance Backend
- **Go** (`spec://go-ecosystem`) - Concurrent backend development
  - Gin, Gorilla Mux, Chi, GORM, SQLx, Go-Kit, gRPC, Zap, Prometheus

### Cross-Platform Development
- **Dart** (`spec://dart-ecosystem`) - Type-safe multi-platform language
  - HTTP, Dio, json_serializable, Freezed, get_it, provider
- **Flutter** (`spec://flutter-ecosystem`) - Mobile/desktop UI framework
  - flutter_bloc, Riverpod, go_router, Intl, Hive, sqflite, Firebase

### Enterprise & Game Development
- **C#** (`spec://csharp-ecosystem`) - Enterprise application development
  - ASP.NET Core, Entity Framework, Dapper, AutoMapper, MediatR, Serilog
- **Unity** (`spec://unity-ecosystem`) - Professional game development
  - Zenject, UniRx, DOTween, Cinemachine, TextMeshPro, Addressables, Mirror

### Web Development & Documentation
- **Static Site Generators** (`spec://static-site-generators`) - Modern documentation and site generation
  - VitePress, Docusaurus, Next.js Static, Nuxt Content, Astro, Gatsby, Hugo, Jekyll, Eleventy
  - MkDocs, GitBook, Slate for documentation-specific needs
  - Includes search (Algolia, Pagefind), syntax highlighting (Shiki, Prism), and diagrams (Mermaid)

### Scripting & Embedded Programming
- **Lua** (`spec://lua-ecosystem`) - Lightweight embedded scripting
  - LuaJIT, Love2D, Defold, Roblox Luau for game development
  - OpenResty, Lapis, Kong for web services
  - LuaRocks package management, testing frameworks (Busted, LuaUnit)

### Full-Stack Web Development
- **Ruby on Rails** (`spec://ruby-rails-ecosystem`) - Complete full-stack framework
  - Rails with Active Record, Action Cable, Active Storage, Action Mailer
  - Authentication: Devise, OmniAuth, Pundit, CanCanCan
  - Background Jobs: Sidekiq, Resque, Delayed Job, GoodJob
  - Testing: RSpec, Capybara, Factory Bot, SimpleCov
  - Frontend: Hotwire (Turbo & Stimulus), React-Rails, Vue.js Rails

### Real-Time Communication & Streaming
- **WebRTC & Streaming** (`spec://webrtc-streaming-ecosystem`) - Comprehensive real-time media ecosystem
  - WebRTC: PeerJS, simple-peer, SkyWay, mediasoup, Janus Gateway, Jitsi Meet
  - Streaming Players: hls.js, Video.js, Shaka Player, dash.js, Clappr, ExoPlayer, AVPlayer
  - Media Servers: Kurento, Ant Media Server, OvenMediaEngine, Wowza, Red5 Pro
  - Streaming Platforms: Agora.io, Twilio, AWS IVS, AWS Chime SDK, Mux, Cloudflare Stream
  - Processing Tools: FFmpeg, GStreamer, OBS Studio, Streamlink
  - Low-Latency: LL-HLS, WebTransport, WebCodecs, QUIC/HTTP/3

### Shell Scripting & System Administration
- **Shell Tools & CLI Utilities** (`spec://shell-tools-ecosystem`) - Comprehensive command-line toolkit
  - Shell Environments: bash, sh (POSIX), zsh with advanced scripting capabilities
  - Text Processing: sed, awk, grep/egrep/fgrep, cut, tr, sort, uniq, wc, paste, join, comm
  - File Operations: cat, head, tail, less, touch, cp, mv, rm, ln, find, locate, xargs
  - Archive/Compression: tar, gzip, bzip2, xz, zip/unzip with cross-platform support
  - System Monitoring: ps, top, htop, df, du, free, uptime, uname, lsof, netstat/ss
  - Network Tools: curl, wget, scp, rsync, ping, traceroute, dig, nslookup
  - Text Editors: vi, vim, nano with advanced editing capabilities
  - Job Control: jobs, fg, bg, kill, pkill, killall, nohup, background execution
  - Utilities: date, env, export, history, alias, which, type, command location

## 🌐 Global Installation

For the simplest setup, install Fluorite MCP globally:

```bash
# Install globally via npm
npm i -g fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

This automatically configures Fluorite MCP with Claude Code CLI, providing instant access to all library specifications.

## Quick Start

```bash
# 1) 依存導入
npm i

# 2) 開発モード（MCP サーバー）
npm run dev

# 3) ビルド & 実行
npm run build
npm start

# 4) Docs（ローカル）
npm run docs:dev
```

### MCP 接続（例：Claude Desktop）

```json
{
  "mcpServers": {
    "fluorite": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/path/to/fluorite-mcp"
    }
  }
}
```

### Available Resources & Tools

- **Resource**: `spec://{pkg}` 例 `spec://@minoru/react-dnd-treeview`
- **Tools**:
  - `list-specs` : 仕様一覧を取得
  - `upsert-spec` : 仕様の登録/更新（YAMLを保存）

## 💡 Usage Examples

Once connected, Claude can provide expert guidance:

```typescript
// "Create a data table with sorting and filtering using TanStack Table"
// Claude will generate complete, type-safe implementation

// "Set up react-hook-form with Zod validation"
// Claude provides production-ready form with validation

// "Implement infinite scroll with TanStack Query"
// Claude creates optimized data fetching with caching
```

## 🛠️ Development

### Project Structure

```
fluorite-mcp/
├── src/
│   ├── catalog/        # Library specifications (YAML)
│   ├── core/           # Core MCP functionality
│   └── server.ts       # MCP server entry
├── docs/               # VitePress documentation
│   └── specs/          # Generated documentation
├── BENEFITS.md         # Detailed benefits documentation
└── package.json
```

### Adding New Specifications

1. Create YAML file in `src/catalog/` (format: `@scope__name.yaml`)
2. Follow existing structure for consistency
3. Include comprehensive examples and best practices
4. Update documentation in `docs/specs/`

### Testing

```bash
# Run tests
npm test

# Run specific test
npm test -- catalog.test.ts

# Watch mode
npm run test:watch
```

## GitHub Actions

- **`release.yml`**: `v*.*.*` タグで npm publish（要 `NPM_TOKEN`）
- **`deploy-docs.yml`**: `main` への push で VitePress を GitHub Pages にデプロイ

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create your feature branch
3. Add/update specifications with examples
4. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- Claude Code CLI team for MCP support
- Library maintainers for excellent documentation
- Community contributors for specifications

---

<p align="center">
  Built with ❤️ to enhance Claude Code CLI's web development capabilities
</p>