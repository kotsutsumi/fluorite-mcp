#!/bin/bash
# Fluorite MCP Quick Start for Teams
# This script sets up Fluorite MCP for a development team in under 5 minutes

set -e

echo "🚀 Fluorite MCP Team Setup"
echo "=========================="
echo ""

# Color functions for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm $(npm --version) detected"

# Check Claude Code CLI
if ! command -v claude &> /dev/null; then
    print_warning "Claude Code CLI not detected. Please install it first:"
    echo "Visit: https://claude.ai/code"
    read -p "Press Enter when Claude Code CLI is installed..."
fi

print_success "Claude Code CLI detected"

echo ""
echo "📦 Installing Fluorite MCP..."

# Install Fluorite MCP globally
npm install -g fluorite-mcp

# Verify installation
if ! command -v fluorite-mcp &> /dev/null; then
    print_error "Installation failed. Please check npm permissions."
    exit 1
fi

print_success "Fluorite MCP installed successfully"

echo ""
echo "🔗 Configuring Claude Code CLI integration..."

# Remove existing server if it exists
claude mcp remove fluorite 2>/dev/null || true

# Add Fluorite MCP server
claude mcp add fluorite -- fluorite-mcp-server

# Verify server registration
if ! claude mcp list | grep -q fluorite; then
    print_error "Failed to register Fluorite MCP server"
    exit 1
fi

print_success "Fluorite MCP server registered with Claude Code CLI"

echo ""
echo "🧪 Running system tests..."

# Test Fluorite MCP directly
print_info "Testing Fluorite MCP server..."
fluorite-mcp --self-test

# Test MCP integration
print_info "Testing Claude Code CLI integration..."
claude mcp status fluorite

print_success "All tests passed!"

echo ""
echo "⚙️  Setting up team configuration..."

# Create .fluorite directory if it doesn't exist
mkdir -p .fluorite

# Create team configuration
cat > .fluorite/team-config.yml << EOF
team:
  name: "Development Team"
  size: "small"
  setup_date: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  
frameworks:
  primary: ["nextjs", "react", "fastapi"]
  experimental: ["vue", "nuxt"]
  
quality_gates:
  error_threshold: 3
  warning_threshold: 10
  enable_performance_checks: true
  enable_security_checks: true
  
development:
  enable_real_time_validation: true
  auto_fix_suggestions: true
  cache_templates: true
  
integrations:
  pre_commit_hooks: true
  ci_cd_integration: true
  vscode_tasks: true
EOF

print_success "Team configuration created"

echo ""
echo "🧪 Testing with sample project..."

# Create sample component for testing
cat > sample-component.tsx << EOF
import React, { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={\`btn btn-\${variant} \${isLoading ? 'loading' : ''}\`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
EOF

print_info "Analyzing sample React component..."

# Test analysis
if fluorite-mcp --quick-validate --file sample-component.tsx --framework react; then
    print_success "Sample component analysis passed"
else
    print_warning "Sample component has some suggestions (this is normal)"
fi

# Clean up sample file
rm -f sample-component.tsx

echo ""
echo "📋 Setting up common development scripts..."

# Create package.json scripts if package.json exists
if [ -f package.json ]; then
    print_info "Adding Fluorite scripts to package.json..."
    
    # Backup original package.json
    cp package.json package.json.backup
    
    # Add fluorite scripts using jq if available, otherwise manual
    if command -v jq &> /dev/null; then
        jq '.scripts += {
          "fluorite:analyze": "fluorite-mcp --static-analysis --project-path . --framework auto-detect",
          "fluorite:validate": "fluorite-mcp --quick-validate --framework auto-detect",
          "fluorite:performance": "fluorite-mcp --performance-test",
          "fluorite:health": "fluorite-mcp --self-test",
          "fluorite:spikes": "fluorite-mcp --discover-spikes",
          "precommit": "fluorite-mcp --quick-validate --staged-files"
        }' package.json > package.json.tmp && mv package.json.tmp package.json
        
        print_success "Fluorite scripts added to package.json"
    else
        print_info "jq not available. You can manually add these scripts to package.json:"
        echo '  "fluorite:analyze": "fluorite-mcp --static-analysis --project-path . --framework auto-detect"'
        echo '  "fluorite:validate": "fluorite-mcp --quick-validate --framework auto-detect"'
        echo '  "fluorite:spikes": "fluorite-mcp --discover-spikes"'
    fi
fi

# Create VS Code tasks if .vscode directory exists
if [ -d .vscode ]; then
    print_info "Setting up VS Code integration..."
    
    cat > .vscode/fluorite-tasks.json << EOF
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fluorite: Analyze Current File",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--quick-validate",
        "--file", "\${file}",
        "--framework", "auto-detect"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Fluorite: Project Analysis",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--static-analysis",
        "--project-path", "\${workspaceFolder}",
        "--framework", "auto-detect"
      ],
      "group": "build"
    },
    {
      "label": "Fluorite: Discover Templates",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--discover-spikes",
        "--query", "\${input:spikeQuery}"
      ],
      "group": "build"
    }
  ],
  "inputs": [
    {
      "id": "spikeQuery",
      "description": "What kind of template are you looking for?",
      "default": "React component",
      "type": "promptString"
    }
  ]
}
EOF
    
    print_success "VS Code tasks created in .vscode/fluorite-tasks.json"
    print_info "Access via Command Palette > Tasks: Run Task > Fluorite"
fi

# Create pre-commit hook if .git directory exists
if [ -d .git ]; then
    print_info "Setting up pre-commit hook..."
    
    mkdir -p .git/hooks
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Fluorite MCP pre-commit hook

echo "🔍 Running Fluorite MCP pre-commit validation..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|vue|py)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No relevant files to validate"
  exit 0
fi

# Quick validation
if fluorite-mcp --quick-validate --staged-files --framework auto-detect; then
  echo "✅ Pre-commit validation passed"
else
  echo "❌ Pre-commit validation failed. Please fix issues before committing."
  echo "💡 Run 'npm run fluorite:analyze' for detailed analysis"
  exit 1
fi
EOF
    
    chmod +x .git/hooks/pre-commit
    print_success "Pre-commit hook installed"
fi

echo ""
echo "📚 Quick command reference..."
echo ""
echo "Basic Commands:"
echo "  fluorite-mcp --self-test                    # Test installation"
echo "  fluorite-mcp --static-analysis              # Analyze current project" 
echo "  fluorite-mcp --quick-validate --file FILE   # Validate specific file"
echo "  fluorite-mcp --discover-spikes --query TEXT # Find templates"
echo ""
echo "Development Workflow:"
echo "  npm run fluorite:analyze                    # Full project analysis"
echo "  npm run fluorite:validate                   # Quick validation"
echo "  npm run fluorite:spikes                     # Browse templates"
echo ""
echo "Claude Code CLI Integration:"
echo "  claude-code \"Analyze this component\"        # Natural language analysis"
echo "  claude-code \"Create React form validation\"  # Template-based generation"
echo ""

echo ""
print_success "Setup complete! 🎉"
echo ""
echo "🚀 Next Steps:"
echo "1. Share this setup script with your team members"
echo "2. Run 'fluorite-mcp --static-analysis' to analyze your project"
echo "3. Try 'fluorite-mcp --discover-spikes --query \"your framework\"' to explore templates"
echo "4. Use Claude Code CLI with natural language requests"
echo ""
echo "📖 Resources:"
echo "- Documentation: README.mdおよびdocs/フォルダを参照"
echo "- Use Cases Guide: ./docs/use-cases-examples.md"
echo "- Troubleshooting: ./docs/troubleshooting.md"
echo "- GitHub Discussions: https://github.com/kotsutsumi/fluorite-mcp/discussions"
echo ""
echo "💬 Need help? Run 'fluorite-mcp --help' or visit our documentation!"