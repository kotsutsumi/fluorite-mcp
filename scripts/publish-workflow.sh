#!/bin/bash

# Fluorite MCP - Manual Publish Workflow
# Handles merging to main and publishing to npm (non-CI workflow)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
DEFAULT_VERSION_TYPE="patch"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to print colored messages
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Fluorite MCP Manual Publish Workflow
Merges current branch to main and publishes to npm

OPTIONS:
    -v, --version TYPE    Version bump type (patch|minor|major) [default: $DEFAULT_VERSION_TYPE]
    -s, --skip-tests      Skip test execution
    -d, --dry-run        Show what would be done without executing
    -h, --help           Show this help message

EXAMPLES:
    $0                   # Patch version bump and publish
    $0 -v minor          # Minor version bump and publish
    $0 --dry-run         # Show what would happen
    $0 -s -v major       # Major version, skip tests

EOF
}

# Parse command line arguments
VERSION_TYPE="$DEFAULT_VERSION_TYPE"
SKIP_TESTS=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            VERSION_TYPE="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    log_error "Invalid version type: $VERSION_TYPE. Must be patch, minor, or major."
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

log_info "Starting Fluorite MCP publish workflow..."
log_info "Project root: $PROJECT_ROOT"
log_info "Version type: $VERSION_TYPE"
log_info "Skip tests: $SKIP_TESTS"
log_info "Dry run: $DRY_RUN"

# Pre-flight checks
log_info "Running pre-flight checks..."

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    log_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Check if fluorite-mcp project
if ! grep -q '"name": "fluorite-mcp"' package.json; then
    log_error "This doesn't appear to be the fluorite-mcp project"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    log_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

# Check if logged into npm
if ! npm whoami >/dev/null 2>&1; then
    log_error "Not logged into npm. Please run: npm login"
    exit 1
fi

log_success "Pre-flight checks passed"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" == "$MAIN_BRANCH" ]]; then
    log_warning "Already on main branch. Will proceed with publishing current state."
    MERGE_NEEDED=false
else
    log_info "Will merge $CURRENT_BRANCH into $MAIN_BRANCH"
    MERGE_NEEDED=true
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
log_info "Current version: $CURRENT_VERSION"

# Calculate new version
NEW_VERSION=$(npm version --no-git-tag-version $VERSION_TYPE --silent)
NEW_VERSION=${NEW_VERSION#v}  # Remove 'v' prefix if present
log_info "New version will be: $NEW_VERSION"

# Reset version in package.json (we'll set it properly later)
git checkout -- package.json

if [[ "$DRY_RUN" == "true" ]]; then
    log_info "=== DRY RUN - What would happen ==="
    log_info "1. Run tests and linting"
    if [[ "$MERGE_NEEDED" == "true" ]]; then
        log_info "2. Checkout and update main branch"
        log_info "3. Merge $CURRENT_BRANCH into main"
    fi
    log_info "4. Bump version from $CURRENT_VERSION to $NEW_VERSION"
    log_info "5. Build project"
    log_info "6. Publish to npm"
    log_info "7. Create git tag and push"
    log_info "=== End of dry run ==="
    exit 0
fi

# Run tests and linting (unless skipped)
if [[ "$SKIP_TESTS" != "true" ]]; then
    log_info "Running tests and linting..."
    
    # Type checking
    log_info "Running TypeScript type checking..."
    npm run lint
    
    # Run tests
    log_info "Running test suite..."
    npm test
    
    log_success "Tests and linting passed"
else
    log_warning "Skipping tests as requested"
fi

# Merge workflow if needed
if [[ "$MERGE_NEEDED" == "true" ]]; then
    log_info "Switching to main branch and merging..."
    
    # Fetch latest changes
    git fetch origin
    
    # Checkout main and pull latest
    git checkout "$MAIN_BRANCH"
    git pull origin "$MAIN_BRANCH"
    
    # Merge the feature branch
    log_info "Merging $CURRENT_BRANCH into $MAIN_BRANCH..."
    git merge "$CURRENT_BRANCH" --no-ff -m "Merge branch '$CURRENT_BRANCH' for release $NEW_VERSION"
    
    log_success "Successfully merged $CURRENT_BRANCH into $MAIN_BRANCH"
fi

# Version bump
log_info "Bumping version to $NEW_VERSION..."
npm version "$VERSION_TYPE" --no-git-tag-version
log_success "Version bumped to $NEW_VERSION"

# Build the project
log_info "Building project..."
npm run build

# Validate build
log_info "Validating build..."
npm run build:check

log_success "Build completed and validated"

# Publish to npm
log_info "Publishing to npm..."
npm publish

log_success "Successfully published fluorite-mcp@$NEW_VERSION to npm!"

# Create git tag and push
log_info "Creating git tag and pushing..."
git add package.json
git commit -m "chore: Bump version to $NEW_VERSION

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git tag "v$NEW_VERSION"
git push origin "$MAIN_BRANCH"
git push origin "v$NEW_VERSION"

log_success "Git tag v$NEW_VERSION created and pushed"

# Final summary
echo ""
log_success "🎉 Publish workflow completed successfully!"
echo ""
log_info "Summary:"
log_info "  • Version: $CURRENT_VERSION → $NEW_VERSION"
log_info "  • Branch: $CURRENT_BRANCH → $MAIN_BRANCH" 
log_info "  • Published: fluorite-mcp@$NEW_VERSION"
log_info "  • Tagged: v$NEW_VERSION"
echo ""
log_info "Next steps:"
log_info "  • Verify publication: https://www.npmjs.com/package/fluorite-mcp"
log_info "  • Update documentation if needed"
log_info "  • Announce the release"
echo ""

# Switch back to original branch if we merged
if [[ "$MERGE_NEEDED" == "true" && "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]]; then
    log_info "Switching back to original branch: $CURRENT_BRANCH"
    git checkout "$CURRENT_BRANCH"
fi