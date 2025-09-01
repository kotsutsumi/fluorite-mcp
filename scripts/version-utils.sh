#!/bin/bash

# Fluorite MCP - Version Management Utilities
# Helper functions and utilities for version management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Get project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to get current version
get_current_version() {
    cd "$PROJECT_ROOT"
    node -p "require('./package.json').version"
}

# Function to get next version
get_next_version() {
    local version_type="${1:-patch}"
    cd "$PROJECT_ROOT"
    # Create a temporary package.json to get the next version without modifying the original
    local temp_dir=$(mktemp -d)
    cp package.json "$temp_dir/"
    cd "$temp_dir"
    local next_version=$(npm version --no-git-tag-version "$version_type" --silent 2>/dev/null || echo "")
    next_version=${next_version#v}  # Remove 'v' prefix if present
    rm -rf "$temp_dir"
    echo "$next_version"
}

# Function to check if version exists on npm
check_npm_version_exists() {
    local version="$1"
    local package_name="fluorite-mcp"
    
    if npm view "$package_name@$version" version >/dev/null 2>&1; then
        return 0  # Version exists
    else
        return 1  # Version does not exist
    fi
}

# Function to get latest published version
get_latest_published_version() {
    npm view fluorite-mcp version 2>/dev/null || echo "0.0.0"
}

# Function to validate version format
validate_version_format() {
    local version="$1"
    if [[ $version =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9-]+(\.[0-9]+)?)?(\+[a-zA-Z0-9-]+)?$ ]]; then
        return 0  # Valid semver format
    else
        return 1  # Invalid format
    fi
}

# Function to compare versions
compare_versions() {
    local version1="$1"
    local version2="$2"
    
    # Use node to compare versions semantically
    cd "$PROJECT_ROOT"
    local result=$(node -e "
        const semver = { compare: (a, b) => {
            const parseVersion = (v) => v.split('.').map(Number);
            const [a1, a2, a3] = parseVersion(a);
            const [b1, b2, b3] = parseVersion(b);
            if (a1 !== b1) return a1 - b1;
            if (a2 !== b2) return a2 - b2;
            return a3 - b3;
        }};
        console.log(semver.compare('$version1', '$version2'));
    ")
    echo "$result"
}

# Function to show version status
show_version_status() {
    cd "$PROJECT_ROOT"
    
    echo ""
    log_info "=== Fluorite MCP Version Status ==="
    
    local current_version=$(get_current_version)
    local latest_published=$(get_latest_published_version)
    
    echo "  📦 Package: fluorite-mcp"
    echo "  📍 Current local version: $current_version"
    echo "  🌐 Latest published version: $latest_published"
    
    # Check if current version exists on npm
    if check_npm_version_exists "$current_version"; then
        log_warning "Current version $current_version already exists on npm"
    else
        log_success "Current version $current_version is not yet published"
    fi
    
    # Compare versions
    local comparison=$(compare_versions "$current_version" "$latest_published")
    if [[ $comparison -gt 0 ]]; then
        log_success "Local version is ahead of published version"
    elif [[ $comparison -eq 0 ]]; then
        log_warning "Local version matches published version"
    else
        log_error "Local version is behind published version!"
    fi
    
    # Show next versions
    echo ""
    log_info "Next version options:"
    echo "  • patch: $(get_next_version patch)"
    echo "  • minor: $(get_next_version minor)"
    echo "  • major: $(get_next_version major)"
    
    echo ""
}

# Function to validate project state for publishing
validate_project_state() {
    cd "$PROJECT_ROOT"
    local errors=0
    
    log_info "Validating project state for publishing..."
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        ((errors++))
    fi
    
    # Check if this is the fluorite-mcp project
    if ! grep -q '"name": "fluorite-mcp"' package.json 2>/dev/null; then
        log_error "This doesn't appear to be the fluorite-mcp project"
        ((errors++))
    fi
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_error "Working directory is not clean"
        git status --short
        ((errors++))
    fi
    
    # Check if logged into npm
    if ! npm whoami >/dev/null 2>&1; then
        log_error "Not logged into npm. Run: npm login"
        ((errors++))
    fi
    
    # Check current version format
    local current_version=$(get_current_version)
    if ! validate_version_format "$current_version"; then
        log_error "Invalid version format: $current_version"
        ((errors++))
    fi
    
    # Check if current version already exists
    if check_npm_version_exists "$current_version"; then
        log_warning "Version $current_version already exists on npm"
    fi
    
    # Check if package builds
    if ! npm run build >/dev/null 2>&1; then
        log_error "Project does not build successfully"
        ((errors++))
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "Project state validation passed"
        return 0
    else
        log_error "Found $errors validation errors"
        return 1
    fi
}

# Main function to handle command line arguments
main() {
    case "${1:-}" in
        "status")
            show_version_status
            ;;
        "validate")
            validate_project_state
            ;;
        "current")
            get_current_version
            ;;
        "next")
            local version_type="${2:-patch}"
            get_next_version "$version_type"
            ;;
        "latest")
            get_latest_published_version
            ;;
        "exists")
            local version="${2:-$(get_current_version)}"
            if check_npm_version_exists "$version"; then
                echo "Version $version exists on npm"
                exit 0
            else
                echo "Version $version does not exist on npm"
                exit 1
            fi
            ;;
        *)
            echo "Usage: $0 {status|validate|current|next|latest|exists} [args]"
            echo ""
            echo "Commands:"
            echo "  status                 Show version status and comparison"
            echo "  validate              Validate project state for publishing"
            echo "  current               Show current version"
            echo "  next [patch|minor|major]  Show next version"
            echo "  latest                Show latest published version"
            echo "  exists [version]      Check if version exists on npm"
            echo ""
            echo "Examples:"
            echo "  $0 status"
            echo "  $0 next minor"
            echo "  $0 exists 0.28.0"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"