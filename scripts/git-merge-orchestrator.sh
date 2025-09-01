#!/bin/bash

# Fluorite MCP - Git Merge Orchestrator
# Safe git merge workflow for preparing releases

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

# Configuration
MAIN_BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] [BRANCH]

Fluorite MCP Git Merge Orchestrator
Safely merge a branch into main with comprehensive checks

ARGUMENTS:
    BRANCH              Source branch to merge (default: current branch)

OPTIONS:
    -t, --target BRANCH Target branch (default: $MAIN_BRANCH)
    -n, --no-ff         Use --no-ff merge strategy (default)
    -f, --ff-only       Use --ff-only merge strategy  
    -s, --squash        Use --squash merge strategy
    -d, --dry-run       Show what would be done without executing
    -p, --push          Push to remote after merge
    -h, --help          Show this help message

EXAMPLES:
    $0                      # Merge current branch to main
    $0 feature/auth         # Merge feature/auth to main
    $0 -s -p feature/ui     # Squash merge feature/ui and push
    $0 --dry-run            # Preview merge operations

EOF
}

# Parse command line arguments
TARGET_BRANCH="$MAIN_BRANCH"
MERGE_STRATEGY="--no-ff"
DRY_RUN=false
PUSH_AFTER=false
SOURCE_BRANCH=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            TARGET_BRANCH="$2"
            shift 2
            ;;
        -n|--no-ff)
            MERGE_STRATEGY="--no-ff"
            shift
            ;;
        -f|--ff-only)
            MERGE_STRATEGY="--ff-only"
            shift
            ;;
        -s|--squash)
            MERGE_STRATEGY="--squash"
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -p|--push)
            PUSH_AFTER=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        -*)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [[ -z "$SOURCE_BRANCH" ]]; then
                SOURCE_BRANCH="$1"
            else
                log_error "Too many arguments"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Change to project root
cd "$PROJECT_ROOT"

log_info "Starting Git merge orchestration..."
log_info "Project root: $PROJECT_ROOT"

# Pre-flight checks
log_info "Running pre-flight checks..."

# Check if we're in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

# Determine source branch
if [[ -z "$SOURCE_BRANCH" ]]; then
    SOURCE_BRANCH=$(git branch --show-current)
    if [[ -z "$SOURCE_BRANCH" ]]; then
        log_error "Cannot determine current branch and no source branch specified"
        exit 1
    fi
fi

log_info "Source branch: $SOURCE_BRANCH"
log_info "Target branch: $TARGET_BRANCH"
log_info "Merge strategy: $MERGE_STRATEGY"
log_info "Push after merge: $PUSH_AFTER"
log_info "Dry run: $DRY_RUN"

# Check if source branch exists
if ! git show-ref --verify --quiet "refs/heads/$SOURCE_BRANCH"; then
    log_error "Source branch '$SOURCE_BRANCH' does not exist"
    exit 1
fi

# Check if target branch exists
if ! git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    log_error "Target branch '$TARGET_BRANCH' does not exist"
    exit 1
fi

# Check if source and target are the same
if [[ "$SOURCE_BRANCH" == "$TARGET_BRANCH" ]]; then
    log_warning "Source and target branches are the same: $SOURCE_BRANCH"
    log_info "Nothing to merge"
    exit 0
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    log_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

# Check remote connectivity
log_info "Checking remote connectivity..."
if ! git ls-remote origin >/dev/null 2>&1; then
    log_warning "Cannot connect to remote 'origin'. Continuing with local-only operations."
    REMOTE_AVAILABLE=false
else
    REMOTE_AVAILABLE=true
    log_success "Remote 'origin' is available"
fi

# Fetch latest changes if remote is available
if [[ "$REMOTE_AVAILABLE" == "true" ]]; then
    log_info "Fetching latest changes from remote..."
    git fetch origin
    
    # Check if source branch is up to date with remote
    if git show-ref --verify --quiet "refs/remotes/origin/$SOURCE_BRANCH"; then
        local source_local=$(git rev-parse "$SOURCE_BRANCH")
        local source_remote=$(git rev-parse "origin/$SOURCE_BRANCH")
        
        if [[ "$source_local" != "$source_remote" ]]; then
            log_warning "Source branch '$SOURCE_BRANCH' is not up to date with remote"
            log_info "Local: $source_local"
            log_info "Remote: $source_remote"
            
            if [[ "$DRY_RUN" != "true" ]]; then
                read -p "Do you want to update the source branch? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git checkout "$SOURCE_BRANCH"
                    git pull origin "$SOURCE_BRANCH"
                    log_success "Updated source branch"
                else
                    log_warning "Proceeding with potentially outdated source branch"
                fi
            fi
        fi
    fi
    
    # Check if target branch is up to date with remote
    if git show-ref --verify --quiet "refs/remotes/origin/$TARGET_BRANCH"; then
        local target_local=$(git rev-parse "$TARGET_BRANCH")
        local target_remote=$(git rev-parse "origin/$TARGET_BRANCH")
        
        if [[ "$target_local" != "$target_remote" ]]; then
            log_warning "Target branch '$TARGET_BRANCH' is not up to date with remote"
            if [[ "$DRY_RUN" != "true" ]]; then
                log_info "Will update target branch during merge"
            fi
        fi
    fi
fi

# Check for merge conflicts (dry-run merge)
log_info "Checking for potential merge conflicts..."
current_branch=$(git branch --show-current)

if [[ "$DRY_RUN" != "true" ]]; then
    # Create a temporary branch to test merge
    temp_branch="temp-merge-test-$(date +%s)"
    git checkout "$TARGET_BRANCH" -b "$temp_branch" >/dev/null 2>&1 || {
        log_error "Failed to create temporary branch"
        exit 1
    }
    
    # Try to merge and see if there are conflicts
    if git merge --no-commit --no-ff "$SOURCE_BRANCH" >/dev/null 2>&1; then
        git merge --abort >/dev/null 2>&1 || true
        log_success "No merge conflicts detected"
    else
        git merge --abort >/dev/null 2>&1 || true
        log_error "Merge conflicts detected!"
        log_error "Please resolve conflicts manually before running this script"
        
        # Show conflicting files
        git checkout "$TARGET_BRANCH" >/dev/null 2>&1
        git merge --no-commit --no-ff "$SOURCE_BRANCH" 2>/dev/null || true
        if [[ -n $(git diff --name-only --diff-filter=U) ]]; then
            log_info "Conflicting files:"
            git diff --name-only --diff-filter=U | sed 's/^/  • /'
        fi
        git merge --abort >/dev/null 2>&1 || true
        git branch -D "$temp_branch" >/dev/null 2>&1 || true
        git checkout "$current_branch" >/dev/null 2>&1 || true
        exit 1
    fi
    
    # Clean up temporary branch
    git checkout "$current_branch" >/dev/null 2>&1
    git branch -D "$temp_branch" >/dev/null 2>&1
fi

# Show what will be merged
log_info "Changes to be merged:"
if [[ "$MERGE_STRATEGY" == "--squash" ]]; then
    commit_count=$(git rev-list --count "$TARGET_BRANCH..$SOURCE_BRANCH")
    log_info "  • $commit_count commits from $SOURCE_BRANCH will be squashed"
else
    git log --oneline "$TARGET_BRANCH..$SOURCE_BRANCH" | head -10 | sed 's/^/  • /'
    local total_commits=$(git rev-list --count "$TARGET_BRANCH..$SOURCE_BRANCH")
    if [[ $total_commits -gt 10 ]]; then
        log_info "  ... and $((total_commits - 10)) more commits"
    fi
fi

if [[ "$DRY_RUN" == "true" ]]; then
    log_info "=== DRY RUN - What would happen ==="
    log_info "1. Switch to $TARGET_BRANCH branch"
    if [[ "$REMOTE_AVAILABLE" == "true" ]]; then
        log_info "2. Pull latest changes from origin/$TARGET_BRANCH"
    fi
    log_info "3. Merge $SOURCE_BRANCH using $MERGE_STRATEGY strategy"
    if [[ "$PUSH_AFTER" == "true" && "$REMOTE_AVAILABLE" == "true" ]]; then
        log_info "4. Push $TARGET_BRANCH to origin"
    fi
    log_info "5. Switch back to original branch: $current_branch"
    log_info "=== End of dry run ==="
    exit 0
fi

# Confirmation prompt
echo ""
log_warning "Ready to merge $SOURCE_BRANCH into $TARGET_BRANCH"
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Merge cancelled by user"
    exit 0
fi

# Perform the actual merge
log_info "Performing merge..."

# Switch to target branch
log_info "Switching to $TARGET_BRANCH branch..."
git checkout "$TARGET_BRANCH"

# Update target branch if remote is available
if [[ "$REMOTE_AVAILABLE" == "true" ]]; then
    log_info "Pulling latest changes from origin/$TARGET_BRANCH..."
    git pull origin "$TARGET_BRANCH"
fi

# Perform the merge
log_info "Merging $SOURCE_BRANCH with $MERGE_STRATEGY strategy..."
if [[ "$MERGE_STRATEGY" == "--squash" ]]; then
    git merge --squash "$SOURCE_BRANCH"
    log_info "Squash merge completed. Please create a commit:"
    echo "  git commit -m 'Merge branch '$SOURCE_BRANCH' (squashed)'"
else
    # Generate a meaningful merge commit message
    commit_count=$(git rev-list --count "$TARGET_BRANCH..$SOURCE_BRANCH")
    merge_message="Merge branch '$SOURCE_BRANCH'"
    if [[ $commit_count -gt 1 ]]; then
        merge_message="$merge_message ($commit_count commits)"
    fi
    
    git merge $MERGE_STRATEGY "$SOURCE_BRANCH" -m "$merge_message"
    log_success "Merge completed successfully"
fi

# Push if requested
if [[ "$PUSH_AFTER" == "true" && "$REMOTE_AVAILABLE" == "true" ]]; then
    log_info "Pushing $TARGET_BRANCH to origin..."
    git push origin "$TARGET_BRANCH"
    log_success "Pushed to remote successfully"
fi

# Show merge result
echo ""
log_success "🎉 Git merge orchestration completed!"
echo ""
log_info "Summary:"
log_info "  • Merged: $SOURCE_BRANCH → $TARGET_BRANCH"
log_info "  • Strategy: $MERGE_STRATEGY"
if [[ "$PUSH_AFTER" == "true" && "$REMOTE_AVAILABLE" == "true" ]]; then
    log_info "  • Pushed: Yes"
else
    log_info "  • Pushed: No"
fi
echo ""

# Show current status
log_info "Current status:"
git log --oneline -5 | sed 's/^/  • /'
echo ""

log_info "Next steps:"
if [[ "$PUSH_AFTER" != "true" && "$REMOTE_AVAILABLE" == "true" ]]; then
    log_info "  • Push changes: git push origin $TARGET_BRANCH"
fi
log_info "  • Switch to other branch: git checkout <branch>"
log_info "  • Continue with release workflow"
echo ""