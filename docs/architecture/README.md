# Fluorite-MCP Architecture Documentation

## Overview

This directory contains the comprehensive architectural documentation for the Fluorite-MCP SuperClaude wrapper system.

## Document Index

### Core Architecture
1. **[Architecture Summary](../ARCHITECTURE_SUMMARY.md)** - Executive overview and key components
2. **[Fluorite Wrapper Design](./fluorite-wrapper-design.md)** - Core system architecture and design principles
3. **[Implementation Roadmap](./implementation-roadmap.md)** - Detailed 6-week implementation plan

### Technical Specifications
4. **[Command Mapping Specification](./command-mapping-spec.md)** - How `/fl:` commands map to `/sc:` commands
5. **[Claude CLI Integration](./claude-cli-integration.md)** - Integration with Claude Code CLI
6. **[Spike Template Expansion Plan](./spike-template-expansion-plan.md)** - Plan for 1000+ templates

### Quality & Deployment
7. **[Testing Strategy](./testing-strategy.md)** - Comprehensive testing approach
8. **[Deployment Plan](./deployment-plan.md)** - NPM publishing and distribution strategy

## Quick Links

### For Developers
- Start with the [Implementation Roadmap](./implementation-roadmap.md)
- Review [Command Mapping](./command-mapping-spec.md) for implementation details
- Check [Testing Strategy](./testing-strategy.md) for quality guidelines

### For Architects
- Read the [Architecture Summary](../ARCHITECTURE_SUMMARY.md)
- Explore the [Wrapper Design](./fluorite-wrapper-design.md)
- Understand [Claude CLI Integration](./claude-cli-integration.md)

### For Contributors
- Follow the [Implementation Roadmap](./implementation-roadmap.md)
- Contribute to [Spike Templates](./spike-template-expansion-plan.md)
- Ensure compliance with [Testing Strategy](./testing-strategy.md)

## Key Metrics

- **Development Timeline**: 6 weeks
- **Target Performance**: 30-50% token reduction
- **Template Coverage**: 1000+ templates, 80% pattern coverage
- **Quality Target**: >90% test coverage
- **Adoption Goal**: 100,000+ users in 6 months

## Architecture Principles

1. **Compatibility First**: Full SuperClaude command compatibility
2. **Enhancement Over Replacement**: Add value without breaking existing workflows
3. **Token Efficiency**: Optimize every interaction for minimal token usage
4. **Developer Experience**: Zero-friction setup and intuitive commands
5. **Extensibility**: Easy to add new commands and templates

## Technology Stack

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **MCP Integration**: @modelcontextprotocol/sdk
- **Testing**: Vitest
- **Documentation**: VitePress
- **CI/CD**: GitHub Actions
- **Distribution**: NPM, Docker

## Contact

- **Repository**: [github.com/kotsutsumi/fluorite-mcp](https://github.com/kotsutsumi/fluorite-mcp)
- **Issues**: [GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)
- **Documentation**: README.mdおよびdocs/フォルダを参照