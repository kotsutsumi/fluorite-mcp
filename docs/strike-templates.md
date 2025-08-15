# Strike Templates - Comprehensive Development Scaffolds

Complete reference for fluorite-mcp's 184 Strike templates for rapid prototyping and development.

## Overview

Strike templates are production-ready scaffolds that implement the Strike development methodology: **minimal app creation → validation → integration**. Each template provides working code with best practices built-in.

## Template Categories

### 🌐 Frontend Frameworks (25 templates)

#### Next.js Ecosystem (29 templates)
| Template | Description | Use Case |
|----------|-------------|----------|
| `nextjs-minimal` | Basic SSR Next.js app with TypeScript | Starting point for any Next.js project |
| `nextjs-app-router-rsc-fetch` | App Router with Server Components | Modern Next.js development |
| `nextjs-api-hello` | Simple API route handler | Backend API development |
| `nextjs-api-edge` | Edge API runtime optimization | High-performance APIs |
| `nextjs-api-zod-router` | Type-safe API with Zod validation | Robust API development |
| `nextjs-auth-nextauth-credentials` | Complete authentication flow | User management systems |
| `nextjs-auth0-minimal` | Auth0 integration | Enterprise authentication |
| `nextauth-github-provider` | GitHub OAuth authentication | Social login |
| `nextauth-google-provider` | Google OAuth authentication | Social login |
| `nextjs-edge-middleware` | Edge middleware patterns | Request processing |
| `nextjs-env-zod-validate` | Environment validation | Configuration management |
| `nextjs-file-upload-route` | File upload handling | File management features |
| `nextjs-form-server-action` | Server Actions for forms | Modern form handling |
| `nextjs-i18n-minimal` | Internationalization setup | Multi-language applications |
| `nextjs-image-optimization` | Next.js Image optimization | Performance optimization |
| `nextjs-isr-page` | Incremental Static Regeneration | Dynamic static sites |
| `nextjs-middleware-basic-auth` | Authentication middleware | Security implementation |
| `nextjs-prisma-sqlite-crud` | Full-stack CRUD with Prisma | Database-driven applications |
| `nextjs-ratelimit-middleware` | Rate limiting implementation | API protection |
| `nextjs-route-params` | Dynamic route handling | URL parameter processing |
| `nextjs-s3-presigned-upload` | AWS S3 file uploads | Cloud file storage |
| `nextjs-gcs-signed-url` | Google Cloud Storage uploads | GCS integration |
| `nextjs-route-headers-cookies` | Headers and cookies handling | API utilities |
| `nextjs-route-streaming` | Streaming API responses | Real-time data |
| `nextjs-edge-fetch-cache` | Edge fetch cache control | Performance optimization |
| `nextjs-route-error-retry` | Error handling with retry | Resilience patterns |
| `nextjs-safe-action` | Type-safe server actions | Secure action handling |
| `nextjs-supabase-client` | Supabase integration | Full-stack development |
| `nextjs-upstash-ratelimit` | Upstash rate limiting | Distributed rate limiting |

#### React Ecosystem (10 templates)
| Template | Description | Stack |
|----------|-------------|-------|
| `react-vite-minimal` | React + Vite TypeScript starter | React, Vite, TypeScript |
| `react-hook-form-zod-login` | Form validation with Zod | React Hook Form, Zod |
| `react-hook-form-yup-login` | Form validation with Yup | React Hook Form, Yup |
| `react-hook-form-valibot-login` | Form validation with Valibot | React Hook Form, Valibot |
| `react-i18next-minimal` | Internationalization | i18next |
| `react-intl-minimal` | React Intl internationalization | React Intl |
| `react-jotai-minimal` | Atomic state management | Jotai |
| `react-redux-toolkit-counter` | Redux state management | Redux Toolkit |
| `react-tanstack-query-fetch` | Data fetching and caching | TanStack Query |
| `react-zustand-counter` | Lightweight state management | Zustand |
| `react-tailwind-vite` | React + Tailwind CSS + Vite | Tailwind CSS |

#### Vue Ecosystem (2 templates)
| Template | Description | Features |
|----------|-------------|----------|
| `vue-vite-minimal` | Vue 3 + Vite starter | Composition API, TypeScript |
| `vue-pinia-minimal` | Vue 3 with Pinia state management | Pinia, reactive state |

#### Other Frameworks (3 templates)
| Template | Description | Framework |
|----------|-------------|-----------|
| `nuxt-minimal` | Nuxt.js starter | Universal Vue.js |
| `sveltekit-minimal` | SvelteKit application | Svelte + Kit |
| `next-tailwind-setup` | Next.js + Tailwind CSS setup | Styling framework |
| `next-shadcn-setup` | Next.js shadcn/ui Setup | Modern UI components |
| `next-shadcn-tabs` | Next.js shadcn/ui Tabs | Tab navigation component |
| `next-shadcn-toast` | Next.js shadcn/ui Toast | Toast notification component |
| `next-shadcn-dropdown` | Next.js shadcn/ui Dropdown | Dropdown menu component |
| `next-shadcn-dialog` | Next.js shadcn/ui Dialog | Modal dialog component |
| `next-shadcn-drawer` | Next.js shadcn/ui Drawer | Bottom drawer panel |
| `next-shadcn-sheet` | Next.js shadcn/ui Sheet | Side sheet panel |
| `next-shadcn-avatar-badge` | Next.js shadcn/ui Avatar + Badge | Avatar with status |
| `next-shadcn-combobox` | Next.js shadcn/ui Combobox | Searchable select |
| `next-shadcn-select` | Next.js shadcn/ui Select | Dropdown select |

### 🚀 Backend Frameworks (25 templates)

#### FastAPI Ecosystem (18 templates)
| Template | Description | Features |
|----------|-------------|----------|
| `fastapi-minimal` | Basic FastAPI app | Health endpoint, async support |
| `fastapi-jwt-auth` | JWT authentication | Secure API authentication |
| `fastapi-oauth2-password` | OAuth2 password flow | Standard OAuth2 implementation |
| `fastapi-dependency-injection` | Dependency injection patterns | Clean architecture |
| `fastapi-background-tasks` | Background task processing | Async task handling |
| `fastapi-websockets` | WebSocket implementation | Real-time communication |
| `fastapi-cors` | CORS configuration | Cross-origin requests |
| `fastapi-settings-pydantic` | Configuration management | Pydantic settings |
| `fastapi-logging-uvicorn` | Structured logging | Production logging |
| `fastapi-openapi-tags` | API documentation | OpenAPI specification |
| `fastapi-pydantic-v2-models` | Pydantic v2 models | Modern data validation |
| `fastapi-pytest-minimal` | Testing setup | Unit testing framework |
| `fastapi-depends-override-test` | Dependency testing | Test isolation |
| `fastapi-alembic-minimal` | Database migrations | SQLAlchemy migrations |
| `fastapi-celery-skeleton` | Celery task queue | Distributed task processing |
| `fastapi-redis-cache` | Redis caching | Performance optimization |
| `fastapi-sqlalchemy-postgres` | PostgreSQL integration | Production database |
| `fastapi-sqlmodel-sqlite` | SQLModel with SQLite | Modern ORM |
| `fastapi-motor-mongodb` | MongoDB async driver | NoSQL database |
| `fastapi-opentelemetry` | Observability tracing | Performance monitoring |

#### Node.js Ecosystem (4 templates)
| Template | Description | Use Case |
|----------|-------------|----------|
| `express-minimal` | Basic Express.js server | Traditional Node.js APIs |
| `express-cors` | Express with CORS | Cross-origin API server |
| `express-opentelemetry` | Express with tracing | Observability |
| `fastify-minimal` | High-performance Fastify | Fast Node.js APIs |
| `fastify-prometheus-metrics` | Metrics collection | Performance monitoring |
| `fastify-rate-limit` | Rate limiting | API protection |

#### Go Ecosystem (3 templates)
| Template | Description | Framework |
|----------|-------------|-----------|
| `go-gin-minimal` | Gin web framework | High-performance Go APIs |
| `go-echo-minimal` | Echo web framework | Minimalist Go framework |
| `go-grpc-minimal` | gRPC service | High-performance RPC |

#### Rust Ecosystem (2 templates)
| Template | Description | Framework |
|----------|-------------|-----------|
| `rust-axum-minimal` | Axum web framework | Modern async Rust |
| `rust-actix-minimal` | Actix web framework | High-performance Rust |

### 🧪 Testing & Quality (15 templates)

#### Playwright Testing (8 templates)
| Template | Description | Capability |
|----------|-------------|------------|
| `playwright-minimal` | Basic E2E testing setup | Cross-browser testing |
| `playwright-axe-accessibility` | Accessibility testing | WCAG compliance |
| `playwright-ct-react` | Component testing | React component tests |
| `playwright-data-fixture` | Test data management | Data-driven testing |
| `playwright-docker-ci` | Containerized testing | CI/CD integration |
| `playwright-network-intercept` | Network mocking | API testing |
| `playwright-parallel-shards` | Parallel test execution | Performance optimization |
| `playwright-report-allure` | Advanced reporting | Test result visualization |
| `playwright-trace-on-failure` | Debug tracing | Test debugging |

#### GitHub Actions CI/CD (16 templates)
| Template | Description | Purpose |
|----------|-------------|---------|
| `gha-node-ci` | Node.js CI pipeline | Basic CI setup |
| `gha-node-pnpm` | pnpm package manager | Alternative package manager |
| `gha-playwright` | Playwright test automation | E2E testing |
| `gha-docker-build-push` | Docker image CI/CD | Container deployment |
| `gha-lint-typecheck-split` | Code quality checks | Static analysis |
| `gha-env-deploy-gates` | Environment deployment | Staged deployments |
| `gha-secrets-scan` | Security scanning | Vulnerability detection |
| `gha-codeql-analysis` | Code security analysis | GitHub security |
| `gha-dependency-review` | Dependency security | Supply chain security |
| `gha-npm-audit` | NPM security audit | Package vulnerability scan |
| `gha-pr-label-conditional` | Conditional workflows | PR automation |
| `gha-release-drafter` | Release automation | Release management |
| `gha-release-please` | Automated releases | Semantic versioning |
| `gha-monorepo-matrix` | Monorepo CI | Multi-package testing |
| `gha-python-pytest` | Python testing | Python CI pipeline |
| `gha-go-test` | Go testing | Go CI pipeline |
| `gha-syft-sbom` | Software Bill of Materials | Security compliance |
| `gha-zap-baseline` | OWASP ZAP security testing | Security testing |

### 🎨 UI Components & Libraries (33 templates)

#### Component Libraries
| Template | Description | Library |
|----------|-------------|---------|
| `mui-react-minimal` | Material-UI components | Google Material Design |
| `mui-react-hook-form` | MUI + React Hook Form | Form integration |
| `mui-grid-minimal` | MUI Grid layout system | Responsive layouts |
| `mui-datagrid-minimal` | MUI X DataGrid | Advanced data tables |
| `mui-dialog-minimal` | MUI Dialog | Modal dialogs |
| `mui-stepper-minimal` | MUI Stepper | Multi-step forms |
| `radix-ui-dialog-minimal` | Radix UI dialog component | Accessible primitives |
| `radix-popover-minimal` | Radix UI Popover | Floating UI element |
| `radix-tooltip-minimal` | Radix UI Tooltip | Contextual information |
| `radix-contextmenu-minimal` | Radix UI Context Menu | Right-click menus |
| `radix-menubar-minimal` | Radix UI Menubar | Application menu bars |
| `radix-accordion-minimal` | Radix UI Accordion | Collapsible content panels |
| `radix-slider-minimal` | Radix UI Slider | Range input control |
| `radix-switch-minimal` | Radix UI Switch | Toggle switch control |
| `headlessui-dialog-minimal` | Headless UI components | Unstyled components |
| `tanstack-table-react-minimal` | Data table implementation | TanStack Table |
| `tanstack-table-sorting` | TanStack Table with sorting | Advanced table features |
| `tanstack-table-grouping` | TanStack Table with grouping | Row grouping |
| `tanstack-table-rowselection` | TanStack Table with selection | Checkbox selection |
| `ag-grid-react-minimal` | Enterprise data grid | AG Grid |

#### Interactive Components
| Template | Description | Functionality |
|----------|-------------|---------------|
| `dnd-kit-minimal` | Drag and drop interface | Modern DnD implementation |
| `react-dnd-minimal` | React DnD implementation | Traditional DnD |

### 🗄️ Data & State Management (15 templates)

#### Database Integration
| Template | Description | Database |
|----------|-------------|----------|
| `docker-compose-postgres` | PostgreSQL with Docker | Development database |
| `prisma-postgres-migrate` | Prisma + Postgres migrations | Database schema management |
| `prisma-compound-unique` | Prisma compound unique indexes | Multi-column uniqueness |
| `prisma-indexes` | Prisma index optimization | Performance indexes |
| `typeorm-postgres-minimal` | TypeORM + Postgres | Enterprise ORM |
| `typeorm-cli-generate` | TypeORM CLI migrations | Schema migration generation |
| `sqlite-wal-config` | SQLite WAL configuration | High-performance SQLite |
| `node-redis-cache` | Redis caching | In-memory cache |
| `node-bullmq-queue` | BullMQ job queue | Task processing |

#### Real-time Communication
| Template | Description | Protocol |
|----------|-------------|----------|
| `socketio-minimal` | Socket.IO real-time | WebSocket communication |
| `node-ws-websocket` | Native WebSocket | Low-level WebSocket |
| `node-kafkajs-producer-consumer` | Apache Kafka | Message streaming |
| `nats-js-minimal` | NATS.js Pub/Sub | Lightweight messaging |

### ☁️ Infrastructure & DevOps (18 templates)

#### Container & Orchestration
| Template | Description | Technology |
|----------|-------------|------------|
| `dockerfile-next-standalone` | Next.js Docker image | Containerization |
| `docker-compose-postgres` | PostgreSQL development | Local development |
| `k8s-nextjs-deployment` | Kubernetes deployment | Container orchestration |

#### Cloud Platforms
| Template | Description | Provider |
|----------|-------------|----------|
| `cloudflare-workers-minimal` | Edge computing | Cloudflare Workers |
| `vercel-json-minimal` | Vercel configuration | Serverless deployment |
| `serverless-framework-lambda-ts` | AWS Lambda TypeScript | Serverless functions |

#### Infrastructure as Code
| Template | Description | Tool |
|----------|-------------|------|
| `terraform-aws-s3-cloudfront` | AWS CDN setup | Terraform |
| `pulumi-aws-s3-website-ts` | Static site hosting | Pulumi TypeScript |

### 📊 Monitoring & Observability (6 templates)

#### Logging & Metrics
| Template | Description | Technology |
|----------|-------------|------------|
| `node-winston-logger` | Structured logging | Winston |
| `python-structlog-minimal` | Python structured logging | Structlog |
| `fastapi-opentelemetry` | Distributed tracing | OpenTelemetry |
| `express-opentelemetry` | Express.js tracing | OpenTelemetry |

#### Validation & Quality
| Template | Description | Purpose |
|----------|-------------|---------|
| `zod-to-openapi-minimal` | Schema to OpenAPI | API documentation |
| `openapi-cli-validate` | OpenAPI validation | API spec validation |

## Template Structure

Each Strike template follows a consistent JSON structure:

```json
{
  "id": "template-identifier",
  "name": "Human-readable Template Name",
  "version": "1.0.0",
  "stack": ["technology", "framework"],
  "tags": ["category", "feature"],
  "description": "Brief description of what this template provides",
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
      "template": "File content with {{param}} substitution"
    }
  ],
  "patches": []
}
```

## Usage with /fl: Commands

### Basic Template Application
```bash
# Discover available templates
/fl:discover "React form validation"
# Result: Suggests react-hook-form-zod-login

# Apply template automatically
/fl:implement "Create a login form with validation" --framework react
# Result: Applies react-hook-form-zod-login template
```

### Advanced Strike Workflows
```bash
# Complete Strike development cycle
/fl:implement --loop --wave-mode --delegate --until-perfect --ultrathink --all-mcp "ドラッグアンドドロップできるツリービュー"

# Automatic workflow:
# 1. Template Discovery: dnd-kit-minimal or react-dnd-minimal
# 2. Minimal App Creation: Standalone component app
# 3. Validation: Test drag-drop functionality
# 4. Integration: Merge into main application
```

### Framework-Specific Workflows

#### Next.js Development
```bash
# API development
/fl:implement "FastAPI-style API routes" --framework nextjs
# Templates: nextjs-api-zod-router, nextjs-api-edge

# Authentication
/fl:implement "User authentication system" --framework nextjs
# Templates: nextjs-auth-nextauth-credentials, nextjs-auth0-minimal

# Performance optimization
/fl:implement "Image optimization and ISR" --framework nextjs
# Templates: nextjs-image-optimization, nextjs-isr-page
```

#### FastAPI Development
```bash
# Complete API with auth
/fl:implement "API with JWT authentication and background tasks" --framework fastapi
# Templates: fastapi-jwt-auth, fastapi-background-tasks

# Database integration
/fl:implement "API with PostgreSQL and caching" --framework fastapi
# Templates: fastapi-sqlalchemy-postgres, fastapi-redis-cache
```

## Template Discovery

### By Technology Stack
- **React**: 11 templates for SPA development
- **Next.js**: 26 templates for full-stack applications (including shadcn/ui)
- **FastAPI**: 21 templates for Python APIs
- **Vue/Nuxt**: 3 templates for Vue.js ecosystem
- **Go**: 3 templates for high-performance backends
- **Rust**: 2 templates for systems programming

### By Use Case
- **Authentication**: 4 templates (JWT, OAuth2, Auth0, NextAuth)
- **Database**: 11 templates (PostgreSQL, MongoDB, SQLite, Redis, Prisma, TypeORM)
- **Testing**: 15 templates (Playwright, GitHub Actions, pytest)
- **UI Components**: 16 templates (Material-UI, Radix UI, shadcn/ui, drag-drop)
- **Real-time**: 4 templates (WebSocket, Socket.IO, Kafka, NATS)
- **Infrastructure**: 18 templates (Docker, Kubernetes, Terraform)

### By Complexity
- **Minimal**: Quick starter templates (30+ templates)
- **Standard**: Production-ready with best practices (50+ templates)
- **Advanced**: Enterprise patterns with observability (30+ templates)

## Quality Standards

### Template Requirements
- ✅ **Production Ready**: All templates use latest stable versions
- ✅ **Best Practices**: Follow framework conventions and patterns
- ✅ **Type Safety**: TypeScript support where applicable
- ✅ **Security**: Secure defaults and validation
- ✅ **Performance**: Optimized configurations
- ✅ **Testing**: Test setup and examples included

### Template Validation
- **Syntax**: JSON schema validation
- **Dependencies**: Package availability verification
- **Security**: Vulnerability scanning
- **Functionality**: Automated testing
- **Documentation**: Usage examples and descriptions

## Integration with SuperClaude

### Automatic Template Selection
The `/fl:` commands automatically select optimal templates based on:
- **Natural language analysis**: Understanding user intent
- **Framework detection**: Existing project structure
- **Complexity assessment**: Scope of requested functionality
- **Best practice matching**: Optimal patterns for use case

### Strike Development Workflow
1. **Template Discovery**: AI-powered template recommendation
2. **Minimal App Creation**: Standalone implementation using template
3. **Validation**: Functional testing in isolation
4. **Integration**: Seamless merge with existing codebase
5. **Enhancement**: Additional optimizations and refinements

### Parameter Bypass Support
All Strike templates work with full SuperClaude parameter bypass:
- `--loop`: Iterative template refinement
- `--wave-mode`: Multi-stage implementation
- `--delegate`: Parallel template processing
- `--until-perfect`: Quality validation
- `--ultrathink`: Comprehensive analysis
- `--all-mcp`: Full MCP server integration

---

**Total Templates**: 184 production-ready scaffolds  
**Total Lines**: 2,200+ lines of battle-tested configurations  
**Coverage**: 15+ technology stacks, 50+ frameworks and libraries  
**Quality**: Enterprise-grade patterns with security and performance built-in

### Latest Additions (v0.9.5)
- **shadcn/ui Components**: Tabs, Toast, and Dropdown components for Next.js
- **MUI Grid**: Responsive layout system for Material-UI
- **Radix UI**: Context Menu and Menubar components
- **TanStack Table**: Grouping and row selection features
- **Prisma**: Compound unique indexes and performance optimization
- **TypeORM**: CLI migration generation
- **Enhanced UI Library**: Now 26 UI component templates
- **Authentication**: NextAuth providers for GitHub and Google
- **Cloud Storage**: Google Cloud Storage integration
- **API Features**: Streaming responses and header management
- **Total Coverage**: 184 production-ready templates across all stacks
- **MUI Components**: Dialog and Stepper additions
- **Radix UI**: Slider and Switch components
- **Edge Runtime**: Cache control and error handling patterns