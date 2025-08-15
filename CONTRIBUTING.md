# Contributing to Fluorite MCP

Thank you for your interest in contributing to Fluorite MCP! This guide will help you get started with contributing to our project.

## 🎯 Our Mission

Fluorite MCP enhances Claude Code CLI with comprehensive library specifications and development methodologies, enabling more accurate and production-ready code generation.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Adding New Specifications](#adding-new-specifications)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Git
- TypeScript knowledge (helpful but not required)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fluorite-mcp.git
   cd fluorite-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Build Documentation**
   ```bash
   npm run docs:dev
   ```

## How to Contribute

### 1. 🐛 Report Bugs

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

### 2. 💡 Suggest Features

Have an idea? Open an issue with:
- Use case description
- Proposed solution
- Alternative approaches considered
- Potential impact on existing features

### 3. 📚 Add Library Specifications

This is the most common contribution! To add a new library spec:

#### Step 1: Create YAML File

Create a file in `catalog/` directory:
```yaml
# catalog/library-name.yaml
name: Library Name
version: 1.0.0
description: Brief description of the library
category: ui-components # or appropriate category
homepage: https://library-homepage.com
repository: https://github.com/org/library
language: TypeScript

tools:
  tool_name:
    name: Tool Name
    description: What this tool does
    usage: |
      Example code showing how to use it
    best_practices:
      - Best practice 1
      - Best practice 2
```

#### Step 2: Add Documentation

Create a markdown file in `docs/specs/`:
```markdown
# Library Name

`spec://library-name`

## 概要
Library description in Japanese and English

## 主な機能
- Feature 1
- Feature 2

## 使用例
\```typescript
// Code examples
\```
```

#### Step 3: Update Index

Add your library to `docs/specs/index.md`:
```markdown
- [Library Name](./library-name) - `spec://library-name`
```

### 4. 🔧 Improve Existing Code

- Refactor for better performance
- Add missing TypeScript types
- Improve error handling
- Enhance logging

### 5. 📝 Improve Documentation

- Fix typos and grammar
- Add examples
- Translate documentation
- Improve clarity

## Testing Guidelines

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

### Writing Tests

Tests should be:
- **Isolated**: No dependencies on external services
- **Deterministic**: Same input = same output
- **Fast**: < 100ms per test
- **Clear**: Test name describes what is being tested

Example test:
```typescript
describe('LibraryCatalog', () => {
  it('should load YAML specifications', async () => {
    const catalog = new LibraryCatalog();
    const spec = await catalog.load('react-dnd-treeview');
    expect(spec).toBeDefined();
    expect(spec.name).toBe('React DnD TreeView');
  });
});
```

## Pull Request Process

### 1. Branch Naming

Use descriptive branch names:
- `feat/add-react-query-spec`
- `fix/typescript-error-handler`
- `docs/update-contributing-guide`
- `chore/update-dependencies`

### 2. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add React Query specification
fix: resolve TypeScript compilation error
docs: update installation instructions
chore: upgrade dependencies
```

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Specification addition

## Testing
- [ ] Tests pass locally
- [ ] Added new tests (if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Updated documentation
- [ ] No breaking changes
```

### 4. Review Process

1. Submit PR against `main` branch
2. Ensure CI checks pass
3. Respond to review feedback
4. Maintainer will merge when approved

## Documentation

### Documentation Structure

```
docs/
├── index.md           # Main documentation
├── specs/            # Library specifications
│   ├── index.md     # Specification index
│   └── *.md         # Individual specs
└── .vitepress/      # VitePress configuration
```

### Writing Documentation

- Use clear, concise language
- Include code examples
- Provide both Japanese and English when possible
- Keep formatting consistent

## Project Structure

```
fluorite-mcp/
├── catalog/          # YAML specification files
├── src/
│   ├── core/        # Core functionality
│   ├── server.ts    # MCP server entry
│   └── test/        # Test files
├── docs/            # Documentation
└── dist/            # Compiled output
```

## Coding Standards

### TypeScript

- Use strict mode
- Provide types for all exports
- Avoid `any` type
- Use async/await over promises

### Style Guide

- 2 spaces indentation
- Single quotes for strings
- Trailing commas in multiline
- No semicolons (optional)
- Max line length: 100 characters

### File Naming

- Kebab-case for files: `library-spec.yaml`
- PascalCase for components: `LibraryCatalog.ts`
- camelCase for utilities: `parseYaml.ts`

## Community

### Getting Help

- 💬 [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)
- 🐛 [Issue Tracker](https://github.com/kotsutsumi/fluorite-mcp/issues)
- 📧 Contact maintainers (see README)

### Recognition

Contributors are recognized in:
- README.md contributors section
- GitHub contributors page
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You! 🙏

Your contributions make Fluorite MCP better for everyone. Whether it's adding a specification, fixing a bug, or improving documentation, every contribution matters!

---

**Questions?** Feel free to open an issue or start a discussion. We're here to help!