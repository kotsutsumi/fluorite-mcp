#!/bin/bash

# Fluorite MCP Connection Validation Script
# This script validates that fluorite-mcp is properly installed and connected to Claude Code

set -e

echo "🔍 Fluorite MCP Connection Validation"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status="$1"
    local message="$2"
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo
echo "📋 System Requirements Check"
echo "----------------------------"

if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "success" "Node.js version: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_status "success" "Node.js version meets requirements (>=18)"
    else
        print_status "error" "Node.js version is too old. Please upgrade to version 18 or higher."
        exit 1
    fi
else
    print_status "error" "Node.js is not installed"
    exit 1
fi

# Check npm version
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "success" "npm version: $NPM_VERSION"
else
    print_status "error" "npm is not installed"
    exit 1
fi

# Check Claude Code CLI
echo
echo "🎯 Claude Code CLI Check"
echo "------------------------"

if command_exists claude; then
    CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
    print_status "success" "Claude Code CLI is installed: $CLAUDE_VERSION"
else
    print_status "error" "Claude Code CLI is not installed"
    print_status "info" "Please install Claude Code CLI first"
    exit 1
fi

# Check fluorite-mcp installation
echo
echo "📦 Fluorite MCP Installation Check"
echo "----------------------------------"

if command_exists fluorite-mcp; then
    FLUORITE_VERSION=$(fluorite-mcp --version 2>/dev/null || echo "unknown")
    print_status "success" "fluorite-mcp CLI version: $FLUORITE_VERSION"
else
    print_status "error" "fluorite-mcp CLI is not installed"
    print_status "info" "Run: npm install -g fluorite-mcp"
    exit 1
fi

if command_exists fluorite-mcp-server; then
    print_status "success" "fluorite-mcp-server binary is available"
else
    print_status "error" "fluorite-mcp-server binary is not available"
    print_status "info" "This is the MCP server binary. Check your installation."
    exit 1
fi

# Check MCP server registration
echo
echo "🔗 MCP Server Registration Check"
echo "--------------------------------"

MCP_LIST_OUTPUT=$(claude mcp list 2>/dev/null || echo "failed")

if echo "$MCP_LIST_OUTPUT" | grep -q "fluorite.*✓ Connected"; then
    print_status "success" "Fluorite MCP server is registered and connected"
elif echo "$MCP_LIST_OUTPUT" | grep -q "fluorite.*✗ Failed to connect"; then
    print_status "error" "Fluorite MCP server is registered but failed to connect"
    print_status "info" "Try: claude mcp remove fluorite && claude mcp add fluorite -- fluorite-mcp-server"
    exit 1
elif echo "$MCP_LIST_OUTPUT" | grep -q "fluorite"; then
    print_status "warning" "Fluorite MCP server is registered but status unclear"
else
    print_status "error" "Fluorite MCP server is not registered"
    print_status "info" "Run: claude mcp add fluorite -- fluorite-mcp-server"
    exit 1
fi

# Test MCP server functionality
echo
echo "🧪 MCP Server Functionality Test"
echo "--------------------------------"

# Test direct server execution (should timeout for stdio servers)
timeout 3s fluorite-mcp-server >/dev/null 2>&1
SERVER_EXIT_CODE=$?

if [ $SERVER_EXIT_CODE -eq 124 ]; then
    print_status "success" "MCP server binary executes correctly (timeout expected for stdio)"
elif [ $SERVER_EXIT_CODE -eq 0 ]; then
    print_status "success" "MCP server binary executes correctly"
else
    print_status "error" "MCP server binary failed to execute (exit code: $SERVER_EXIT_CODE)"
    exit 1
fi

# Check if the catalog directory exists
CURRENT_DIR=$(pwd)
if [ -d "$CURRENT_DIR/src/catalog" ]; then
    CATALOG_COUNT=$(find "$CURRENT_DIR/src/catalog" -name "*.yaml" -o -name "*.yml" -o -name "*.json" | wc -l)
    print_status "success" "Catalog directory found with $CATALOG_COUNT specification files"
else
    print_status "warning" "Catalog directory not found in current location"
    print_status "info" "Make sure you're running this from the fluorite-mcp project directory"
fi

# Final validation
echo
echo "🎉 Validation Summary"
echo "===================="

print_status "success" "All checks passed! Fluorite MCP is properly configured."
print_status "info" "You can now use the /mcp command in Claude Code to access Fluorite tools"

echo
echo "Available tools:"
echo "  - discover-spikes: Find relevant spike templates"
echo "  - auto-spike: Intelligent spike selection"
echo "  - preview-spike: Preview spike templates"
echo "  - apply-spike: Apply spike templates"
echo "  - static-analysis: Code analysis tools"
echo "  - upsert-spec: Manage library specifications"
echo "  - list-specs: List available specifications"

echo
print_status "success" "Validation completed successfully!"