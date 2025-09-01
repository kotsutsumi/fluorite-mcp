# Fluorite MCP - Manual Publish Workflow

Manual workflow for merging to main and publishing to npm (non-CI approach).

## 🚀 Quick Start

### Option 1: Full Automated Workflow
```bash
# Patch release (0.28.0 → 0.28.1)
npm run publish:patch

# Minor release (0.28.0 → 0.29.0) 
npm run publish:minor

# Major release (0.28.0 → 1.0.0)
npm run publish:major
```

### Option 2: Step-by-Step Workflow
```bash
# 1. Check current status
npm run version:status

# 2. Run safety checks
npm run publish:check

# 3. Preview what will happen
npm run publish:dry-run

# 4. Execute publish workflow
npm run publish:workflow
```

## 📋 Available Scripts

### Version Management
- `npm run version:status` - Show version status and next version options
- `npm run version:validate` - Validate project state for publishing
- `npm run version:current` - Show current version only
- `npm run version:next` - Show next patch version

### Pre-Publish Validation
- `npm run publish:check` - Run comprehensive safety checks (28 checks)
- `npm run publish:check-fix` - Run checks and auto-fix issues
- `npm run publish:check-strict` - Fail on warnings (strict mode)

### Git Merge Operations
- `npm run git:merge` - Interactive merge workflow
- `npm run git:merge-dry` - Preview merge operations

### Publish Workflow
- `npm run publish:workflow` - Full workflow (interactive)
- `npm run publish:patch` - Patch version bump and publish
- `npm run publish:minor` - Minor version bump and publish  
- `npm run publish:major` - Major version bump and publish
- `npm run publish:dry-run` - Preview workflow without execution

## 🔍 Safety Features

### Pre-Flight Checks
✅ Working directory clean  
✅ NPM authentication  
✅ Valid semver version  
✅ Required files exist  
✅ TypeScript compilation  
✅ Clean build successful  
✅ All tests pass  
✅ No critical vulnerabilities  
✅ Version not already published  

### Git Safety
✅ Merge conflict detection  
✅ Remote branch synchronization  
✅ Automatic backup creation  
✅ Rollback on failure  

## 🛠️ Advanced Usage

### Custom Version Types
```bash
# Specify exact version bump
./scripts/publish-workflow.sh --version minor
./scripts/publish-workflow.sh --version major

# Skip tests (faster, but risky)
./scripts/publish-workflow.sh --skip-tests

# Dry run to see what would happen
./scripts/publish-workflow.sh --dry-run
```

### Manual Git Merge
```bash
# Merge feature branch to main
./scripts/git-merge-orchestrator.sh feature/new-feature

# Squash merge with push
./scripts/git-merge-orchestrator.sh --squash --push feature/hotfix

# Preview merge without executing
./scripts/git-merge-orchestrator.sh --dry-run feature/ui-updates
```

### Comprehensive Validation
```bash
# Full validation with auto-fix
./scripts/pre-publish-checks.sh --fix

# Strict mode (warnings = errors)
./scripts/pre-publish-checks.sh --strict

# Quick checks only (skip slow tests)
./scripts/pre-publish-checks.sh --quick
```

## ⚠️ Important Notes

1. **Always run `npm run publish:dry-run` first** to preview operations
2. **Ensure you're logged into npm**: `npm login`
3. **Version 0.28.0 already exists** - next version will be 0.28.1
4. **Scripts require bash** - works on macOS/Linux/WSL
5. **Working directory must be clean** before publishing

## 🚨 Error Recovery

### Common Issues

**"Working directory is not clean"**
```bash
git status
git add . && git commit -m "your message"
# or
git stash
```

**"Not logged into npm"**
```bash
npm login
npm whoami  # verify
```

**"Version already exists"**
```bash
npm run version:status  # check next available version
npm run publish:minor   # bump to next minor version
```

**"Merge conflicts detected"**
```bash
# Resolve conflicts manually, then:
git add .
git commit -m "resolve conflicts"
# Re-run workflow
```

## 📊 Workflow Overview

```
Current Branch → Pre-checks → Merge to Main → Version Bump → Build → Test → Publish → Tag & Push
     ↓              ↓             ↓             ↓         ↓      ↓        ↓         ↓
  [feature]    [28 checks]   [conflict     [semver]   [tsc]  [vitest] [npm pub] [git tag]
                             detection]
```

## 🎯 Example Session

```bash
$ npm run version:status
Current: 0.28.0, Latest: 0.28.0 (already exists)
Next options: patch: 0.28.1, minor: 0.29.0, major: 1.0.0

$ npm run publish:check --
✅ 25 checks passed, ⚠️ 3 warnings

$ npm run publish:dry-run
=== DRY RUN ===
1. Run tests and linting
2. Bump version from 0.28.0 to 0.28.1  
3. Build project
4. Publish to npm
5. Create git tag and push

$ npm run publish:patch
[Interactive workflow with confirmations]
🎉 Successfully published fluorite-mcp@0.28.1!
```