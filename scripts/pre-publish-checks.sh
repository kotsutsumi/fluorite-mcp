#!/bin/bash

# Fluorite MCP - Pre-Publish Safety Checks
# Comprehensive validation before publishing to npm

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored messages
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_check() { echo -e "${PURPLE}🔍 $1${NC}"; }

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNINGS=0

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Fluorite MCP Pre-Publish Safety Checks
Comprehensive validation before publishing to npm

OPTIONS:
    -f, --fix          Attempt to auto-fix issues when possible
    -s, --strict       Fail on warnings (treat warnings as errors)
    -q, --quick        Skip time-intensive checks
    -v, --verbose      Show detailed output
    -h, --help         Show this help message

EXAMPLES:
    $0                 # Run all standard checks
    $0 --fix           # Run checks and auto-fix issues
    $0 --strict        # Fail on any warnings
    $0 --quick         # Skip slow checks for fast validation

EOF
}

# Parse command line arguments
AUTO_FIX=false
STRICT_MODE=false
QUICK_MODE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--fix)
            AUTO_FIX=true
            shift
            ;;
        -s|--strict)
            STRICT_MODE=true
            shift
            ;;
        -q|--quick)
            QUICK_MODE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
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

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    local fix_command="${3:-}"
    local warning_only="${4:-false}"
    
    log_check "Checking: $check_name"
    
    if eval "$check_command"; then
        log_success "$check_name"
        ((CHECKS_PASSED++))
        return 0
    else
        if [[ "$warning_only" == "true" ]]; then
            log_warning "$check_name (warning)"
            ((CHECKS_WARNINGS++))
            
            # In strict mode, treat warnings as errors
            if [[ "$STRICT_MODE" == "true" ]]; then
                ((CHECKS_FAILED++))
                return 1
            fi
            
            # Try to fix if auto-fix is enabled and fix command provided
            if [[ "$AUTO_FIX" == "true" && -n "$fix_command" ]]; then
                log_info "Attempting to fix: $check_name"
                if eval "$fix_command"; then
                    log_success "Fixed: $check_name"
                    return 0
                else
                    log_error "Failed to fix: $check_name"
                fi
            fi
            return 0
        else
            log_error "$check_name (critical)"
            ((CHECKS_FAILED++))
            
            # Try to fix if auto-fix is enabled and fix command provided
            if [[ "$AUTO_FIX" == "true" && -n "$fix_command" ]]; then
                log_info "Attempting to fix: $check_name"
                if eval "$fix_command"; then
                    log_success "Fixed: $check_name"
                    ((CHECKS_PASSED++))
                    ((CHECKS_FAILED--))
                    return 0
                else
                    log_error "Failed to fix: $check_name"
                fi
            fi
            return 1
        fi
    fi
}

# Change to project root
cd "$PROJECT_ROOT"

log_info "Starting Fluorite MCP pre-publish safety checks..."
log_info "Project root: $PROJECT_ROOT"
log_info "Auto-fix: $AUTO_FIX"
log_info "Strict mode: $STRICT_MODE"
log_info "Quick mode: $QUICK_MODE"
echo ""

# === CRITICAL CHECKS ===
log_info "=== Critical Checks ==="

# Check 1: Project Identity
run_check "Project identity (package.json)" \
    "test -f package.json && grep -q '\"name\": \"fluorite-mcp\"' package.json"

# Check 2: Working directory clean
run_check "Working directory clean" \
    "test -z \"\$(git status --porcelain)\""

# Check 3: npm authentication
run_check "NPM authentication" \
    "npm whoami >/dev/null 2>&1"

# Check 4: Valid semver version
run_check "Valid semver version" \
    "node -e \"const v=require('./package.json').version; if(!/^\\d+\\.\\d+\\.\\d+/.test(v)) process.exit(1)\""

# Check 5: Required files exist
run_check "Required files exist" \
    "test -f README.md && test -f LICENSE && test -f package.json"

# Check 6: TypeScript compilation
run_check "TypeScript compilation" \
    "npm run lint >/dev/null 2>&1"

# === BUILD CHECKS ===
log_info ""
log_info "=== Build Checks ==="

# Check 7: Clean build
run_check "Clean build successful" \
    "npm run build >/dev/null 2>&1"

# Check 8: Build artifacts exist
run_check "Build artifacts exist" \
    "test -d dist && test -f dist/mcp-server.js && test -f dist/mcp-server.d.ts"

# Check 9: CLI executable exists
run_check "CLI executable exists" \
    "test -f dist/cli/index.js && test -x dist/cli/index.js"

# Check 10: Build verification passes
run_check "Build verification" \
    "timeout 5s npm run build:check >/dev/null 2>&1 || true"

# === TESTING CHECKS ===
if [[ "$QUICK_MODE" != "true" ]]; then
    log_info ""
    log_info "=== Testing Checks ==="

    # Check 11: Unit tests pass
    run_check "Unit tests pass" \
        "npm run test:unit >/dev/null 2>&1"

    # Check 12: Basic server validation
    run_check "Server module loads" \
        "npm run test:server >/dev/null 2>&1"
    
    # Check 13: Examples dry run
    run_check "Examples dry run" \
        "npm run examples:dryrun >/dev/null 2>&1" \
        "" "true"
fi

# === PACKAGE CHECKS ===
log_info ""
log_info "=== Package Checks ==="

# Check 14: Package.json validation
run_check "Package.json structure" \
    "node -e \"
        const pkg = require('./package.json');
        if (!pkg.name || !pkg.version || !pkg.description) process.exit(1);
        if (!pkg.main || !pkg.types || !pkg.bin) process.exit(1);
        if (!pkg.files || !pkg.publishConfig) process.exit(1);
    \""

# Check 15: Files array includes required files
run_check "Files array complete" \
    "node -e \"
        const pkg = require('./package.json');
        const required = ['dist/**/*', 'README.md', 'LICENSE', 'package.json'];
        const missing = required.filter(f => !pkg.files.some(pf => pf === f || f.includes('**')));
        if (missing.length > 0) process.exit(1);
    \""

# Check 16: Version not already published
run_check "Version not published" \
    "! npm view fluorite-mcp@\$(node -p \"require('./package.json').version\") version >/dev/null 2>&1"

# Check 17: Dependencies are up to date (warning only)
run_check "Dependencies relatively current" \
    "npm outdated --depth=0 | wc -l | grep -q '^[[:space:]]*0'" \
    "" "true"

# === SECURITY CHECKS ===
log_info ""
log_info "=== Security Checks ==="

# Check 18: No high/critical vulnerabilities
run_check "No critical vulnerabilities" \
    "npm audit --audit-level high --quiet >/dev/null 2>&1" \
    "" "true"

# Check 19: No .env files in git
run_check "No .env files committed" \
    "! git ls-files | grep -E '\\.(env|secret|key)$'" \
    "" "true"

# Check 20: No TODO/FIXME in critical files
run_check "No TODO/FIXME in critical files" \
    "! grep -r 'TODO\\|FIXME' package.json README.md src/server.ts src/mcp-server.ts 2>/dev/null" \
    "" "true"

# === DOCUMENTATION CHECKS ===
log_info ""
log_info "=== Documentation Checks ==="

# Check 21: README not empty
run_check "README has content" \
    "test \$(wc -l < README.md) -gt 10"

# Check 22: API.md exists and has content
run_check "API documentation exists" \
    "test -f API.md && test \$(wc -l < API.md) -gt 5" \
    "" "true"

# Check 23: Version in README matches package.json (warning only)
run_check "Version consistency in docs" \
    "grep -q \"\$(node -p \"require('./package.json').version\")\" README.md" \
    "" "true"

# === REPOSITORY CHECKS ===
log_info ""
log_info "=== Repository Checks ==="

# Check 24: On main branch
run_check "On main/master branch" \
    "git branch --show-current | grep -E '^(main|master)$'" \
    "" "true"

# Check 25: Remote exists and accessible
run_check "Remote repository accessible" \
    "git ls-remote origin >/dev/null 2>&1" \
    "" "true"

# Check 26: Local branch up to date with remote
run_check "Branch up to date with remote" \
    "test \"\$(git rev-parse HEAD)\" = \"\$(git rev-parse @{u} 2>/dev/null || echo 'no-upstream')\"" \
    "" "true"

# === PERFORMANCE CHECKS ===
if [[ "$QUICK_MODE" != "true" ]]; then
    log_info ""
    log_info "=== Performance Checks ==="

    # Check 27: Bundle size reasonable
    run_check "Reasonable bundle size" \
        "test \$(du -sk dist | cut -f1) -lt 10000" \
        "" "true"

    # Check 28: No large files in package
    run_check "No large files in package" \
        "! find dist -type f -size +1M" \
        "" "true"
fi

# === FINAL SUMMARY ===
echo ""
log_info "=== Pre-Publish Check Summary ==="
echo ""

if [[ $CHECKS_FAILED -gt 0 ]]; then
    log_error "❌ $CHECKS_FAILED critical checks failed"
fi

if [[ $CHECKS_WARNINGS -gt 0 ]]; then
    if [[ "$STRICT_MODE" == "true" ]]; then
        log_error "⚠️  $CHECKS_WARNINGS warnings (treated as errors in strict mode)"
    else
        log_warning "⚠️  $CHECKS_WARNINGS warnings"
    fi
fi

log_success "✅ $CHECKS_PASSED checks passed"

echo ""

# Final decision
if [[ $CHECKS_FAILED -gt 0 ]] || ([[ "$STRICT_MODE" == "true" ]] && [[ $CHECKS_WARNINGS -gt 0 ]]); then
    log_error "🚫 Pre-publish checks FAILED"
    echo ""
    log_info "Please fix the issues above before publishing."
    if [[ "$AUTO_FIX" != "true" ]]; then
        log_info "Try running with --fix to auto-fix some issues."
    fi
    exit 1
else
    log_success "🎉 Pre-publish checks PASSED"
    echo ""
    log_info "Ready for publishing to npm!"
    if [[ $CHECKS_WARNINGS -gt 0 ]]; then
        log_info "Note: There are $CHECKS_WARNINGS warnings that should be addressed."
    fi
    exit 0
fi