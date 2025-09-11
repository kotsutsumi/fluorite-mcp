# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build and Development
- **Build**: `npm run build` - Compiles TypeScript source to JavaScript in dist/ directory
- **Development**: `npm run dev` - Run development server with hot reload
- **Type checking**: `npm run lint` - Run TypeScript type checking

### Testing
- **All tests**: `npm test` - Run all tests with memory optimization
- **Unit tests**: `npm run test:unit` - Run unit tests only (excludes e2e and static analysis)
- **E2E tests**: `npm run test:e2e` - Run end-to-end tests
- **Coverage**: `npm run test:coverage` - Run tests with coverage report
- **CI tests**: `npm run test:ci` - Run tests in CI mode with special configuration
- **Watch mode**: `npm run test:watch` - Run tests in watch mode

### CLI Commands
- **Setup**: `fluorite setup` - Initialize Fluorite MCP with Claude Code
- **Spike commands**: 
  - `fluorite spikes synth` - Generate virtual spike templates
  - `fluorite spikes discover [query]` - Search for spike templates
  - `fluorite spikes preview [id]` - Preview a spike template
  - `fluorite spikes apply [id]` - Apply a spike template
- **Documentation**: `fluorite docs` - List available documentation

### Publishing and Version Management
- **Version check**: `npm run version:status` - Check current version status
- **Publish workflow**: `npm run publish:workflow` - Run complete publish workflow
- **Pre-publish checks**: `npm run publish:check` - Run pre-publish validation

## Architecture

### Core Structure
This is a Model Context Protocol (MCP) server for Claude Code CLI, providing library specifications, spike templates, and static analysis capabilities.

#### Key Components:

1. **MCP Server** (`src/mcp-server.ts`)
   - Main server entry point that registers MCP tools and resources
   - Handles library specifications, spike templates, and static analysis
   - Uses StdioServerTransport for communication with Claude Code

2. **CLI Tool** (`src/cli/index.ts`)
   - Command-line interface for setup, spike management, and utilities
   - Separate from MCP server but integrates with Claude Code configuration

3. **Spike System** (`src/core/spike-*.ts`)
   - Template generation and management system
   - Supports both file-based spikes in `src/spikes/` and virtual generated spikes
   - Auto-spike selection based on natural language queries
   - Generators create 10,000+ virtual templates with `gen-` or `strike-` prefixes

4. **Static Analysis** (`src/core/*-analyzer.ts`)
   - Framework-specific analyzers for React, Vue, Next.js
   - Error prediction and dependency analysis
   - 50+ validation rules for code quality

5. **Library Catalog** (`src/catalog/`)
   - 86+ YAML specifications for popular libraries
   - Structured knowledge base for code generation

### MCP Tools Registration
The server registers multiple tools categories:
- **Spec Management**: upsert-spec, list-specs, catalog-stats
- **Static Analysis**: static-analysis, quick-validate, realtime-validation
- **Spike Tools**: discover-spikes, auto-spike, preview-spike, apply-spike, validate-spike
- **Diagnostics**: self-test, performance-test, server-metrics

### Testing Strategy
- Uses Vitest with Node environment
- Tests organized by feature area (catalog, handlers, spikes, static analysis)
- Memory optimization with forked processes for stability
- Coverage thresholds: 80% for all metrics

### Configuration
- TypeScript ES2022 modules with strict mode
- Bundle output to `dist/` directory
- MCP protocol integration via `@modelcontextprotocol/sdk`

## Key Features

### Spike Templates
- 6,200+ production-ready templates in `src/spikes/`
- Virtual spike generation for 10,000+ additional templates
- Natural language discovery and auto-selection
- Support for frameworks: Next.js, React, FastAPI, Laravel, etc.
- Template IDs follow patterns like `nextjs-auth-basic-ts` or `strike-express-route-ts`

### Library Specifications
- Comprehensive YAML specs for 86+ libraries
- Covers UI components, state management, authentication, testing
- Used for intelligent code generation and recommendations

### Static Analysis
- Framework-specific validation (React, Vue, Next.js)
- Error prediction using pattern matching
- Dependency analysis and security scanning
- Real-time validation during development

## Environment Variables

### Spike System Tuning
- `FLUORITE_AUTO_SPIKE_THRESHOLD` (default 0.4): Coverage threshold for auto-spike
- `FLUORITE_AUTO_SPIKE_TOP` (default 5): Number of top candidates to evaluate
- `FLUORITE_SPIKE_LIST_LIMIT`: Maximum spikes to return in listings
- `FLUORITE_GENERATED_SPIKES_LIMIT`: Cap virtual spike generation
- `FLUORITE_ALIAS_ENABLE` (default true): Enable short alias resolution

## Development Notes

- The project uses ES modules throughout (`"type": "module"` in package.json)
- All imports must include `.js` extensions even for TypeScript files
- The CLI and MCP server are separate entry points but share core functionality
- Spike templates can be either JSON files in `src/spikes/` or virtually generated
- Generated spike IDs with `gen-` or `strike-` prefixes are created at runtime