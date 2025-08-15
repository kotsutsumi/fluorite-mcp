#!/bin/bash

# Fluorite MCP Setup Script for Claude Code
# This script sets up fluorite-mcp with Claude Code CLI for new instances

set -e

echo "🚀 Fluorite MCP Setup for Claude Code"
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
        "step")
            echo -e "${BLUE}🔧 $message${NC}"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo
print_status "step" "Checking prerequisites..."

if ! command_exists node; then
    print_status "error" "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    print_status "error" "npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists claude; then
    print_status "error" "Claude Code CLI is not installed. Please install Claude Code CLI first."
    exit 1
fi

print_status "success" "All prerequisites are met"

# Check if fluorite-mcp is already installed
echo
print_status "step" "Checking fluorite-mcp installation..."

NEEDS_INSTALL=false
NEEDS_UPDATE=false

if command_exists fluorite-mcp; then
    CURRENT_VERSION=$(fluorite-mcp --version 2>/dev/null || echo "unknown")
    print_status "info" "Found fluorite-mcp version: $CURRENT_VERSION"
    
    # Check if it's the development version (0.10.0)
    if [ "$CURRENT_VERSION" != "0.10.0" ]; then
        print_status "warning" "Outdated version detected. Will update to 0.10.0"
        NEEDS_UPDATE=true
    fi
else
    print_status "info" "fluorite-mcp not found. Will install from current directory."
    NEEDS_INSTALL=true
fi

# Install or update fluorite-mcp
if [ "$NEEDS_INSTALL" = true ] || [ "$NEEDS_UPDATE" = true ]; then
    echo
    print_status "step" "Setting up fluorite-mcp..."
    
    # Check if we're in the fluorite-mcp project directory
    if [ -f "package.json" ] && grep -q "fluorite-mcp" package.json; then
        print_status "info" "Detected fluorite-mcp project directory"
        
        # Build the project
        print_status "step" "Building fluorite-mcp..."
        npm run build
        
        # Link it globally
        print_status "step" "Linking fluorite-mcp globally..."
        npm link
        
        print_status "success" "Successfully installed fluorite-mcp 0.10.0 from source"
    else
        print_status "step" "Installing fluorite-mcp from npm..."
        npm install -g fluorite-mcp
        print_status "success" "Successfully installed fluorite-mcp from npm"
    fi
else
    print_status "success" "fluorite-mcp is already up to date"
fi

# Verify fluorite-mcp-server binary
echo
print_status "step" "Verifying MCP server binary..."

if command_exists fluorite-mcp-server; then
    print_status "success" "fluorite-mcp-server binary is available"
else
    print_status "error" "fluorite-mcp-server binary not found. Installation may have failed."
    exit 1
fi

# Configure Claude Code MCP
echo
print_status "step" "Configuring Claude Code MCP connection..."

# Check if fluorite is already registered
MCP_LIST_OUTPUT=$(claude mcp list 2>/dev/null || echo "")

if echo "$MCP_LIST_OUTPUT" | grep -q "fluorite"; then
    print_status "info" "Fluorite MCP server is already registered. Removing old configuration..."
    claude mcp remove fluorite 2>/dev/null || true
fi

# Add fluorite MCP server with correct binary
print_status "step" "Adding fluorite MCP server to Claude Code..."
claude mcp add fluorite -- fluorite-mcp-server

print_status "success" "Successfully registered fluorite MCP server"

# Test the connection
echo
print_status "step" "Testing MCP connection..."

sleep 2  # Give it a moment to initialize

MCP_TEST_OUTPUT=$(claude mcp list 2>/dev/null || echo "failed")

if echo "$MCP_TEST_OUTPUT" | grep -q "fluorite.*✓ Connected"; then
    print_status "success" "Fluorite MCP server is connected and working!"
elif echo "$MCP_TEST_OUTPUT" | grep -q "fluorite.*✗ Failed to connect"; then
    print_status "error" "Fluorite MCP server failed to connect"
    print_status "info" "You may need to restart Claude Code or check the logs"
    exit 1
else
    print_status "warning" "Connection status unclear. Please check manually with: claude mcp list"
fi

# Show available tools
echo
print_status "step" "Setup completed successfully!"
echo
echo "🎉 Fluorite MCP is now ready to use with Claude Code!"
echo
echo "Available tools:"
echo "  📋 discover-spikes    - Find relevant spike templates"
echo "  🤖 auto-spike        - Intelligent spike selection"
echo "  👀 preview-spike     - Preview spike templates"
echo "  ⚡ apply-spike       - Apply spike templates"
echo "  🔍 static-analysis   - Code analysis tools"
echo "  📝 upsert-spec       - Manage library specifications"
echo "  📚 list-specs        - List available specifications"
echo
echo "Try using the /mcp command in Claude Code to access these tools!"
echo
print_status "info" "Run './scripts/validate-mcp-connection.sh' to verify the installation anytime"

echo
print_status "success" "Setup completed! 🎉"