# Fluorite MCP Documentation

Complete documentation for Fluorite MCP - the comprehensive Model Context Protocol server that enhances Claude Code CLI with library knowledge, static analysis, and rapid prototyping capabilities.

## 📚 Documentation Overview

### 🚀 Getting Started

| Guide | Description | Time Required |
|-------|-------------|---------------|
| **[Quick Start](./getting-started.md)** | 5-minute setup and first commands | ⏱️ 5 min |
| **[Installation](./installation.md)** | Detailed installation and troubleshooting | ⏱️ 15 min |
| **[Commands](./commands.md)** | Complete command reference | ⏱️ 30 min |

### 🛠️ Developer Resources

| Resource | Audience | Purpose |
|----------|----------|---------|
| **[Developer Guide](./developer.md)** | Contributors, Advanced Users | Architecture, contributing, plugins |
| **[Template Creation](./template-creation.md)** | Template Authors | Creating custom templates and specs |
| **[/fl: Commands](./fl-commands.md)** | SuperClaude Users | Enhanced fluorite-mcp with parameter bypass |
| **[API Documentation](../API.md)** | Developers, Integrators | Complete technical reference |

### 🧪 Advanced Features

| Feature | Guide | Description |
|---------|-------|-------------|
| **Spike Templates** | **[Spike Templates Guide](./spike-templates.md)** | 750+ production-ready development scaffolds |
| **Spike Templates** | **[Legacy Spike Templates](./spike-templates.md)** | Legacy rapid prototyping system |
| **Static Analysis** | **[API Documentation](../API.md#static-analysis)** | Framework-specific code analysis |
| **Custom Integrations** | **[Developer Guide](./developer.md#plugin-development)** | Building custom plugins and extensions |

### 🆘 Help & Support

| Resource | When to Use | Content |
|----------|-------------|---------|
| **[Troubleshooting](./troubleshooting.md)** | Having issues? | Common problems and solutions |
| **[GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)** | Found a bug? | Report bugs and request features |
| **[GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)** | Need help? | Community support and Q&A |

## 🎯 Quick Navigation

### For New Users

1. **Start Here**: [Getting Started Guide](./getting-started.md)
2. **Install**: Follow the [Installation Guide](./installation.md)
3. **Learn Commands**: Review [Command Reference](./commands.md)
4. **Explore Templates**: Browse [Spike Templates](./spike-templates.md)
5. **Try Spikes**: Explore [Legacy Spike Templates](./spike-templates.md)

### For Developers

1. **Understand Architecture**: [Developer Guide](./developer.md)
2. **API Reference**: [Complete API Documentation](../API.md)
3. **Create Templates**: [Template Creation Guide](./template-creation.md)
4. **Contribute**: [Contributing Guidelines](../CONTRIBUTING.md)

### For Troubleshooting

1. **Common Issues**: [Troubleshooting Guide](./troubleshooting.md)
2. **Installation Problems**: [Installation Guide](./installation.md#troubleshooting)
3. **Command Issues**: [Command Reference](./commands.md#error-handling-and-troubleshooting)

## 📖 Documentation Features

### Cross-References

All documentation includes cross-references to related topics:

- **Internal Links**: Links between documentation sections
- **Code Examples**: Working examples in all guides
- **Command References**: Quick links to relevant commands
- **API Links**: Direct links to API documentation

### Interactive Elements

- **Copy-paste Code**: All code examples are copy-pasteable
- **Command Examples**: Real commands you can run immediately
- **Table of Contents**: Navigate quickly within documents
- **Search Functionality**: Find information quickly

### Up-to-Date Content

Documentation is updated with each release:

- **Version-specific**: Examples match current version
- **Feature Coverage**: All features documented
- **Best Practices**: Current industry standards
- **Community Input**: Incorporates user feedback

## 🔍 What's Covered

### Core Functionality

| Topic | Coverage |
|-------|----------|
| **Library Specifications** | 87+ libraries with complete usage patterns |
| **Static Analysis** | 50+ validation rules across frameworks |
| **Spike Templates** | 385 production scaffolds for rapid development |
| **Spike Templates** | Legacy template system |
| **Natural Language** | How Claude automatically uses Fluorite MCP |

### Technical Details

| Component | Documentation |
|-----------|---------------|
| **MCP Protocol** | Complete protocol implementation details |
| **API Endpoints** | All tools, resources, and parameters |
| **Error Handling** | Error codes, recovery strategies |
| **Performance** | Optimization tips and system limits |

### Integration Patterns

| Integration | Guide Location |
|-------------|----------------|
| **Claude Code CLI** | [Getting Started](./getting-started.md), [Installation](./installation.md) |
| **SuperClaude Integration** | [/fl: Commands](./fl-commands.md) |
| **Spike Development** | [Spike Templates](./spike-templates.md) |
| **Custom Plugins** | [Developer Guide](./developer.md#plugin-development) |
| **CI/CD Pipelines** | [Spike Templates - CI/CD Section](./spike-templates.md#testing--quality-19-templates) |
| **Team Workflows** | [Template Creation](./template-creation.md#team-distribution) |

## 🚀 Quick Reference

### Essential Commands

```bash
# Installation
npm i -g fluorite-mcp
claude mcp add fluorite -- fluorite-mcp-server

# Health Check
claude mcp status fluorite
fluorite-mcp --self-test

# Documentation
fluorite-mcp --help
```

### Key Natural Language Patterns

```
"Create a [component] using [library]"
"Set up [feature] with [technology]"
"Build a [type] with [requirements]"
"Generate [artifact] for [framework]"
```

### Important File Locations

```
~/.fluorite/                   # Configuration directory
~/.fluorite/custom-templates/  # Custom spike templates
~/.fluorite/cache/            # Analysis cache
~/.fluorite/logs/             # Debug logs
```

## 🔄 Documentation Updates

This documentation is actively maintained:

- **Release Updates**: Updated with each version
- **Community Contributions**: Pull requests welcome
- **User Feedback**: Issues and discussions incorporated
- **Best Practices**: Evolved based on real usage

### Contributing to Documentation

1. **Found an Error?** [Open an issue](https://github.com/kotsutsumi/fluorite-mcp/issues)
2. **Want to Improve?** [Submit a pull request](https://github.com/kotsutsumi/fluorite-mcp/pulls)
3. **Have Questions?** [Start a discussion](https://github.com/kotsutsumi/fluorite-mcp/discussions)

## 📊 Documentation Metrics

- **Total Pages**: 9 comprehensive guides
- **Code Examples**: 100+ working examples + 750+ Spike templates
- **Cross-References**: 250+ internal links
- **Languages**: English and Japanese
- **Update Frequency**: Every release
- **Community Contributions**: Welcome and encouraged

---

**Need help finding something?** Use the search functionality or ask in [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions).

*Documentation v0.12.1 - Last updated: January 2025*