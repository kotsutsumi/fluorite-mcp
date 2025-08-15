# Getting Started with Fluorite MCP

Welcome to Fluorite MCP! This guide will help you quickly set up and start using Fluorite MCP with Claude Code CLI to enhance your development workflow with comprehensive library knowledge, static analysis, and spike-driven development.

## 📖 Table of Contents

- [What is Fluorite MCP?](#what-is-fluorite-mcp)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Understanding Key Features](#understanding-key-features)
- [Your First Commands](#your-first-commands)
- [Next Steps](#next-steps)

## What is Fluorite MCP?

Fluorite MCP is a Model Context Protocol (MCP) server that enhances Claude Code CLI with:

- **📚 90+ Library Specifications**: Deep knowledge of modern web development libraries
- **🌍 12 Language Ecosystems**: From TypeScript to Rust, covering all major platforms
- **🧪 1000+ Spike Templates**: Pre-built patterns for rapid prototyping
- **🔍 Static Analysis**: 50+ validation rules for Next.js, React, Vue
- **🤖 Error Prediction**: AI-powered pattern matching to prevent runtime errors

## Quick Start (5 minutes)

### Step 1: Install Fluorite MCP

```bash
# Install globally via npm
npm i -g fluorite-mcp
```

### Step 2: Add to Claude Code CLI

```bash
# Connect to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

### Step 3: Verify Installation

```bash
# Test the connection
claude mcp list
# You should see 'fluorite' in the list
```

### Step 4: Try Your First Command

Open Claude Code and try:

```
Create a modern React data table with sorting and filtering using TypeScript
```

Claude will automatically use Fluorite MCP's knowledge of TanStack Table, TypeScript patterns, and best practices to generate production-ready code!

## Understanding Key Features

### 1. Automatic Library Knowledge

When you mention any supported library, Claude automatically accesses the relevant specification:

**Example Libraries**:
- UI Components: shadcn/ui, Radix UI, Material-UI
- State Management: Zustand, Jotai, TanStack Query
- Forms: react-hook-form, Zod validation
- Data Tables: AG Grid, TanStack Table
- Authentication: NextAuth.js, Clerk, Supabase

### 2. Static Analysis & Error Prediction

Fluorite MCP includes intelligent code analysis:

```bash
# Static analysis is automatically applied when Claude analyzes your code
# Detects 50+ common issues in Next.js, React, and Vue
```

**Common Issues Detected**:
- Client hooks in Server Components
- Hydration mismatches
- Missing dependencies
- Type safety violations
- Performance anti-patterns

### 3. Spike-Driven Development

Quick prototyping with pre-built templates:

**Available Template Categories**:
- **Next.js**: Minimal apps, API routes, authentication
- **FastAPI**: REST APIs, database integration, auth
- **GitHub Actions**: CI/CD workflows, testing pipelines
- **Playwright**: Testing configurations, accessibility

### 4. Comprehensive Ecosystems

Access to complete development ecosystems:

**Language Ecosystems**:
- TypeScript/JavaScript (Web development)
- Python (FastAPI, Django, Data Science)
- Rust (Systems programming, Tauri)
- Go (High-performance backends)
- Ruby (Rails development)
- And 7 more...

## Your First Commands

### Creating UI Components

```
Create a responsive navigation component using Radix UI and Tailwind CSS
```

**What happens**:
- Claude accesses `spec://radix-ui-themes`
- Uses proper TypeScript patterns
- Includes accessibility features
- Applies modern CSS practices

### Building APIs

```
Create a FastAPI endpoint with JWT authentication and Pydantic validation
```

**What happens**:
- Claude uses `spec://fastapi-ecosystem`
- Includes security best practices
- Proper error handling
- Type-safe response models

### Setting Up Testing

```
Set up Playwright testing with accessibility checking
```

**What happens**:
- Uses `spec://playwright-axe-accessibility`
- Configures proper test structure
- Includes CI/CD integration
- Adds accessibility validation

### Spike Development

```
I need to experiment with drag-and-drop functionality for a tree component
```

**What happens**:
- Claude suggests relevant spike templates
- Provides rapid prototyping setup
- Includes validation strategies
- Offers integration guidance

## Next Steps

### 📖 Learn More

| Next Step | Time | Purpose |
|-----------|------|---------|
| **[Installation Guide](./installation.md)** | 15 min | Detailed setup and troubleshooting |
| **[Command Reference](./commands.md)** | 30 min | Master all available features |
| **[Spike Templates Guide](./spike-templates.md)** | 20 min | Rapid prototyping techniques |
| **[API Documentation](../API.md)** | 45 min | Complete technical reference |

### 🛠️ Advanced Usage

| Topic | Guide | Description |
|-------|-------|-------------|
| **Custom Specifications** | [Template Creation](./template-creation.md#library-specification-creation) | Add your own library specs |
| **Static Analysis Rules** | [Developer Guide](./developer.md#creating-custom-specifications) | Configure custom analysis rules |
| **Team Templates** | [Template Creation](./template-creation.md#team-distribution) | Create and share team templates |
| **Plugin Development** | [Developer Guide](./developer.md#plugin-development) | Build custom integrations |

### 🤝 Community & Support

| Resource | When to Use | Link |
|----------|-------------|------|
| **GitHub Discussions** | Questions, sharing experiences | [Visit Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions) |
| **GitHub Issues** | Bug reports, feature requests | [Report Issues](https://github.com/kotsutsumi/fluorite-mcp/issues) |
| **Contributing Guide** | Want to help improve Fluorite MCP | [Contributing](../CONTRIBUTING.md) |
| **Troubleshooting** | Having problems? | [Troubleshooting Guide](./troubleshooting.md) |

### 📚 Documentation Navigation

- **[📋 Documentation Index](./README.md)** - Complete documentation overview
- **[🔍 Search & Navigation](./README.md#quick-navigation)** - Find what you need quickly

### 💡 Pro Tips

1. **Be Specific**: Mention specific libraries or frameworks for best results
   ```
   ✅ "Create a form with react-hook-form and Zod validation"
   ❌ "Create a form"
   ```

2. **Use Technology Names**: Claude can better select specifications
   ```
   ✅ "Build a Next.js API with tRPC and Prisma"
   ❌ "Build an API"
   ```

3. **Ask for Best Practices**: Fluorite MCP includes extensive best practice knowledge
   ```
   ✅ "What are the best practices for Next.js authentication with NextAuth?"
   ```

4. **Leverage Static Analysis**: Ask Claude to analyze existing code
   ```
   ✅ "Analyze this React component for potential issues"
   ```

## 🚀 What's Next?

You're now ready to supercharge your development workflow with Fluorite MCP! The system works transparently with Claude Code CLI, providing rich context and best practices for modern web development.

Start with simple requests and gradually explore more advanced features. The more specific you are about technologies and requirements, the better Fluorite MCP can assist you.

Happy coding! 🎉

---

*Need help? Check our [Troubleshooting Guide](./troubleshooting.md) or ask in [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions).*