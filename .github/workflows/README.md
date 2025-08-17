# CI/CD Workflows

This directory contains GitHub Actions workflows for automated testing, building, publishing, and deployment.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests to `main`/`develop`

**Jobs**:
- **test**: Run tests on Node.js 18 & 20, build verification
- **docs**: Build documentation with VitePress
- **security**: Run security audits and vulnerability checks
- **quality-gate**: Summarize quality checks for main branch
- **deploy-docs**: Deploy documentation to GitHub Pages (main branch only)

**Features**:
- ✅ Multi-node testing (Node 18, 20)
- ✅ Comprehensive quality validation
- ✅ GitHub Pages documentation deployment
- ✅ Security vulnerability scanning
- ✅ Build artifact preservation

### 2. Auto Release & Publish (`auto-release.yml`)

**Triggers**: Push to `main` when `package.json` changes

**Jobs**:
- **check-version**: Detect version changes and determine release type
- **validate-release**: Comprehensive validation before release
- **create-release**: Create GitHub release with auto-generated changelog
- **publish-npm**: Publish to NPM with provenance
- **post-release**: Success notifications and cleanup

**Features**:
- ✅ Automatic version change detection
- ✅ Prerelease support (alpha, beta, rc)
- ✅ Comprehensive validation before release
- ✅ GitHub release creation with changelog
- ✅ NPM publishing with provenance
- ✅ Failure notifications and recovery guidance

### 3. Pull Request Validation & Merge (`pr-merge.yml`)

**Triggers**: Pull Requests to `main`, PR reviews

**Jobs**:
- **pr-validation**: Comprehensive quality checks on PR code
- **auto-merge**: Automatically merge approved PRs that pass validation
- **merge-notification**: Success notifications

**Features**:
- ✅ Automated PR quality validation
- ✅ Auto-merge on approval (if validation passes)
- ✅ PR status comments
- ✅ Merge notifications

## Setup Requirements

### NPM Publishing

1. Add `NPM_TOKEN` secret to repository:
   - Go to Settings → Secrets and variables → Actions
   - Add new secret: `NPM_TOKEN` with your NPM access token

### GitHub Pages

1. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy documentation

### Branch Protection (Recommended)

1. Protect main branch:
   - Go to Settings → Branches
   - Add rule for `main` branch:
     - Require pull request reviews
     - Require status checks to pass
     - Include administrators

## Enhanced Publishing Flow

### Standard Development Flow
1. **Development**: Work on feature branches
2. **Pull Request**: Create PR to `main` → triggers validation (`pr-merge.yml`)
3. **Review & Approval**: PR gets reviewed and approved
4. **Auto-merge**: Approved PR automatically merges to `main`
5. **Quality Gate**: Main CI pipeline validates the merge (`ci.yml`)
6. **Documentation**: Documentation automatically updated on GitHub Pages

### Release Flow (Version Publishing)
1. **Version Bump**: Update version in `package.json` and push to `main`
2. **Auto-detection**: `auto-release.yml` detects version change
3. **Release Validation**: Comprehensive validation (build, test, docs)
4. **GitHub Release**: Automatic release creation with changelog
5. **NPM Publishing**: Secure publishing with provenance
6. **Notifications**: Success/failure notifications with recovery guidance

### Workflow Orchestration
- **CI Pipeline** (`ci.yml`): Always runs for quality validation
- **Auto-release** (`auto-release.yml`): Only runs when version changes detected
- **PR Merge** (`pr-merge.yml`): Handles PR validation and auto-merge
- **Deploy Docs** (`deploy-docs.yml`): Dedicated documentation deployment

## Version Management

The workflow automatically detects version changes in `package.json`:

- **Version unchanged**: Normal CI/CD runs, no publishing
- **Version changed**: Triggers NPM publishing and GitHub release

### Publishing a New Version

```bash
# Update version
npm version patch  # or minor, major

# Push changes (triggers auto-publish)
git push origin main
```

## Workflow Status

Check workflow status:
- **Actions tab**: See all workflow runs
- **Pull requests**: See validation status
- **Releases**: See published versions

## Troubleshooting

### Common Issues

1. **NPM publish fails**: Check `NPM_TOKEN` secret is set correctly
2. **Tests fail**: Review test output in Actions tab
3. **Documentation build fails**: Check VitePress configuration
4. **Auto-merge not working**: Ensure PR is approved and validation passes

### Manual Intervention

If auto-publish fails, you can manually publish:

```bash
npm run build
npm publish --access public
```

If documentation deployment fails, you can manually trigger it by re-running the workflow.

## Security

- All secrets are stored securely in GitHub Secrets
- NPM token has minimal required permissions
- Workflows only run on approved code changes
- Security audits run on every build

---

🤖 These workflows are designed to provide a seamless development experience with automated quality checks, publishing, and deployment.