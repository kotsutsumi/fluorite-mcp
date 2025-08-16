# Fluorite MCP Examples & Configurations

Practical, ready-to-use examples and configuration files for integrating Fluorite MCP into your development workflow.

## 🚀 Quick Start Examples

### [Team Setup Script](./quick-start-team.sh)
**One-click team setup script** that gets your development team up and running with Fluorite MCP in under 5 minutes.

```bash
# Download and run
curl -fsSL https://raw.githubusercontent.com/kotsutsumi/fluorite-mcp/main/examples/quick-start-team.sh | bash

# Or clone and run locally
./examples/quick-start-team.sh
```

**What it does**:
- ✅ Installs Fluorite MCP globally
- ✅ Configures Claude Code CLI integration
- ✅ Sets up team configuration files
- ✅ Creates VS Code tasks and pre-commit hooks
- ✅ Tests installation with sample analysis
- ✅ Provides quick command reference

## 🔧 IDE & Editor Integrations

### [VS Code Integration](./vscode-integration.json)
**Complete VS Code configuration** for Fluorite MCP development workflow.

**Includes**:
- Task definitions for analysis and template discovery
- Custom keybindings for quick access
- Problem matchers for error highlighting
- Code snippets for common commands
- Settings for real-time validation
- Multi-root workspace configuration

**Setup**:
```bash
# Copy tasks to your project
cp examples/vscode-integration.json .vscode/fluorite-tasks.json

# Or copy individual sections to existing files
# .vscode/tasks.json, .vscode/settings.json, etc.
```

### Other Editors
- **Cursor**: Use VS Code configuration (fully compatible)
- **WebStorm/IntelliJ**: Task runner configurations
- **Vim/Neovim**: LSP integration examples
- **Sublime Text**: Build system configurations

## 🔄 CI/CD Integration Examples

### [GitHub Actions](./github-actions-integration.yml)
**Production-ready GitHub Actions workflow** with comprehensive quality gates.

**Features**:
- Multi-framework analysis (Next.js, FastAPI, React)
- Security scanning with vulnerability reporting
- Performance validation with bundle size checks
- Quality gates with configurable thresholds
- Deployment validation for staging/production
- Automated dependency monitoring
- Team notifications via Slack

**Setup**:
```bash
# Copy to your repository
mkdir -p .github/workflows
cp examples/github-actions-integration.yml .github/workflows/fluorite-quality.yml
```

### Other CI/CD Platforms
- **GitLab CI**: Pipeline configurations with quality gates
- **Azure Pipelines**: Multi-stage pipeline examples
- **Jenkins**: Declarative pipeline scripts
- **CircleCI**: Workflow configurations
- **Travis CI**: Build configurations

## 🏗️ Large-Scale Project Examples

### [Monorepo Configuration](./monorepo-config.yml)
**Enterprise-grade monorepo setup** for large teams and complex projects.

**Covers**:
- Multi-team structure with role definitions
- Framework-specific configurations
- Quality gates per project criticality
- Cross-team collaboration rules
- Security and compliance settings
- Performance optimization strategies

**Use Cases**:
- 50+ developers across multiple teams
- Multiple frameworks (Next.js, FastAPI, React Native)
- Enterprise compliance requirements
- Complex deployment strategies

## 📋 Configuration Templates

### Team Configurations

#### Small Team (3-5 developers)
```yaml
# .fluorite/team-config.yml
team:
  name: "Startup Team"
  size: "small"
  
frameworks:
  primary: ["nextjs", "react"]
  
quality_gates:
  error_threshold: 3
  warning_threshold: 10
  mvp_mode: true
```

#### Enterprise Team (50+ developers)
```yaml
# .fluorite/enterprise-config.yml
enterprise:
  name: "Large Corp Platform"
  compliance_level: "SOX/PCI-DSS"
  
security:
  required_patterns:
    - audit-logging
    - encryption-at-rest
    - secure-headers
  
quality_gates:
  error_threshold: 0
  warning_threshold: 2
  security_scan: required
```

### Framework-Specific Configurations

#### Next.js Project
```json
{
  "fluorite": {
    "framework": "nextjs",
    "version": "14.x",
    "rules": {
      "nextjs-hydration": "error",
      "nextjs-server-components": "error"
    },
    "performance": {
      "bundleSize": "5MB",
      "loadTime": "3s"
    }
  }
}
```

#### FastAPI Project
```yaml
fluorite:
  framework: fastapi
  language: python
  rules:
    - fastapi-security-headers
    - pydantic-model-validation
    - async-best-practices
  compliance:
    - gdpr
    - api-security
```

## 🛠️ Development Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "fluorite:analyze": "fluorite-mcp --static-analysis --project-path . --framework auto-detect",
    "fluorite:validate": "fluorite-mcp --quick-validate --framework auto-detect", 
    "fluorite:performance": "fluorite-mcp --performance-test",
    "fluorite:health": "fluorite-mcp --self-test",
    "fluorite:spikes": "fluorite-mcp --discover-spikes",
    "precommit": "fluorite-mcp --quick-validate --staged-files",
    "prebuild": "npm run fluorite:validate",
    "test:quality": "npm run fluorite:analyze && npm run test"
  }
}
```

### Git Hooks

#### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
echo "🔍 Running Fluorite MCP validation..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|vue|py)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No relevant files to validate"
  exit 0
fi

if fluorite-mcp --quick-validate --staged-files --framework auto-detect; then
  echo "✅ Pre-commit validation passed"
else
  echo "❌ Please fix issues before committing"
  exit 1
fi
```

#### Pre-push Hook
```bash
#!/bin/sh
# .git/hooks/pre-push
echo "🔍 Running comprehensive analysis before push..."

fluorite-mcp --static-analysis --project-path . --framework auto-detect --max-issues 5

if [ $? -ne 0 ]; then
  echo "❌ Quality gate failed. Please fix issues before pushing."
  exit 1
fi

echo "✅ Pre-push validation passed"
```

## 🔧 Environment-Specific Examples

### Docker Integration
```dockerfile
# Dockerfile.fluorite
FROM node:20-alpine

# Install Fluorite MCP
RUN npm install -g fluorite-mcp

# Copy project files
COPY . /app
WORKDIR /app

# Run analysis in container
RUN fluorite-mcp --static-analysis --framework auto-detect

# Continue with build...
```

### Docker Compose for CI
```yaml
# docker-compose.ci.yml
version: '3.8'
services:
  fluorite-analysis:
    image: node:20-alpine
    volumes:
      - .:/app
    working_dir: /app
    command: |
      sh -c "
        npm install -g fluorite-mcp &&
        fluorite-mcp --static-analysis --framework auto-detect
      "
```

## 📊 Real-World Usage Patterns

### Daily Development Workflow
```bash
# Morning routine
fluorite-mcp --self-test
fluorite-mcp --static-analysis --quick

# Before implementing new feature
fluorite-mcp --discover-spikes --query "authentication system"

# During development
fluorite-mcp --quick-validate --file src/components/NewComponent.tsx

# Before committing
git add -A && npm run precommit

# Before pushing
npm run fluorite:analyze
```

### Weekly Team Review
```bash
# Generate team report
fluorite-mcp --static-analysis --generate-report --team-metrics

# Check dependency health
fluorite-mcp --dependency-analysis --security-scan

# Performance analysis
fluorite-mcp --performance-test --benchmark
```

## 🚀 Getting Started

1. **Choose your scenario**:
   - Individual developer → Use quick-start script
   - Small team → VS Code integration + basic config
   - Large team → Monorepo configuration + CI/CD
   - Enterprise → Full enterprise setup with compliance

2. **Copy relevant examples**:
   ```bash
   # Copy the files you need
   cp examples/quick-start-team.sh .
   cp examples/vscode-integration.json .vscode/
   cp examples/github-actions-integration.yml .github/workflows/
   ```

3. **Customize for your project**:
   - Update team names and configurations
   - Adjust quality gate thresholds
   - Configure framework-specific rules
   - Set up monitoring and notifications

4. **Test and iterate**:
   ```bash
   # Test your setup
   fluorite-mcp --self-test
   fluorite-mcp --static-analysis
   
   # Refine based on results
   ```

## 📚 Related Documentation

- **[Use Cases & Examples Guide](../docs/use-cases-examples.md)** - Comprehensive real-world scenarios
- **[Integration Guide](../docs/integration-guide.md)** - Development workflow integration
- **[Troubleshooting Guide](../docs/troubleshooting.md)** - Common issues and solutions
- **[Function Reference](../docs/function-reference.md)** - Complete API reference

## 💬 Community Examples

Found a great integration pattern? [Share it with the community](https://github.com/kotsutsumi/fluorite-mcp/discussions) or [contribute an example](https://github.com/kotsutsumi/fluorite-mcp/blob/main/CONTRIBUTING.md).

---

*Examples v0.11.0 - Last updated: December 2024*