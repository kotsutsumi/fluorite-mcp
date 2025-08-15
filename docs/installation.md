# Installation Guide

This guide provides detailed instructions for installing and configuring Fluorite MCP with Claude Code CLI.

## 📖 Table of Contents

- [System Requirements](#system-requirements)
- [Installation Methods](#installation-methods)
- [Configuration](#configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Advanced Setup](#advanced-setup)

## System Requirements

### Minimum Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or yarn/pnpm equivalent)
- **Claude Code CLI**: Latest version
- **Operating System**: macOS, Linux, or Windows with WSL2

### Recommended Requirements

- **Node.js**: Version 20.0 or higher (LTS)
- **npm**: Version 10.0 or higher
- **Memory**: 4GB+ available RAM
- **Storage**: 500MB+ free space for catalog and cache

### Check Your Environment

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version  
npm --version
# Should output: 8.0.0 or higher

# Check Claude Code CLI
claude --version
# Should output Claude Code CLI version
```

## Installation Methods

### Method 1: Global Installation (Recommended)

This is the most common and recommended installation method:

```bash
# Install Fluorite MCP globally
npm install -g fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

### Method 2: Local Installation

For project-specific installations:

```bash
# Create a dedicated directory
mkdir ~/.claude-mcp-servers
cd ~/.claude-mcp-servers

# Install locally
npm install fluorite-mcp

# Add to Claude Code CLI with full path
claude mcp add fluorite -- $(pwd)/node_modules/.bin/fluorite-mcp
```

### Method 3: From Source (Development)

For developers or latest features:

```bash
# Clone the repository
git clone https://github.com/kotsutsumi/fluorite-mcp.git
cd fluorite-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Link globally
npm link

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

### Method 4: Using Package Managers

#### Using Yarn

```bash
# Global installation
yarn global add fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

#### Using pnpm

```bash
# Global installation
pnpm add -g fluorite-mcp

# Add to Claude Code CLI
claude mcp add fluorite -- fluorite-mcp
```

## Configuration

### Basic Configuration

After installation, Fluorite MCP works with default settings. No additional configuration is required for basic usage.

### Advanced Configuration

#### Custom Catalog Directory

Set a custom location for specifications:

```bash
# Set environment variable
export FLUORITE_CATALOG_DIR="/path/to/your/specs"

# Or create a config file
echo 'export FLUORITE_CATALOG_DIR="/path/to/your/specs"' >> ~/.bashrc
source ~/.bashrc
```

#### Memory and Performance Settings

For large projects or limited resources:

```bash
# Set memory limits
export NODE_OPTIONS="--max-old-space-size=4096"

# Set cache directory
export FLUORITE_CACHE_DIR="/path/to/cache"
```

#### Logging Configuration

Enable detailed logging for debugging:

```bash
# Enable debug logging
export FLUORITE_LOG_LEVEL="debug"

# Set log file location
export FLUORITE_LOG_FILE="/path/to/fluorite.log"
```

### Configuration File

Create a configuration file at `~/.fluorite-mcp.json`:

```json
{
  "catalogDir": "/custom/path/to/catalog",
  "cacheDir": "/custom/path/to/cache",
  "logLevel": "info",
  "maxFileSize": "10MB",
  "enableAnalysis": true,
  "enableSpikes": true,
  "analysisRules": {
    "nextjs": true,
    "react": true,
    "vue": true
  },
  "customSpecs": [
    "/path/to/custom/specs/*.yaml"
  ]
}
```

## Verification

### Step 1: Check Installation

```bash
# Verify global installation
fluorite-mcp --version
# Should output: fluorite-mcp version x.x.x

# Check if binary is accessible
which fluorite-mcp
# Should output path to fluorite-mcp
```

### Step 2: Test MCP Connection

```bash
# List all MCP servers
claude mcp list
# Should show 'fluorite' in the list

# Test server status
claude mcp status fluorite
# Should show 'running' or 'healthy'
```

### Step 3: Test Basic Functionality

Open Claude Code and try these test commands:

```
Test 1: List available specifications
"What library specifications are available?"

Test 2: Access a specific spec
"Show me the shadcn/ui specification"

Test 3: Generate code with context
"Create a button component using shadcn/ui"
```

### Step 4: Run Built-in Tests

```bash
# Run self-diagnostic
fluorite-mcp --self-test
# Should output: All tests passed ✅

# Run performance test
fluorite-mcp --performance-test
# Should show performance metrics
```

## Troubleshooting

### Common Issues

#### 1. "Command not found: fluorite-mcp"

**Problem**: Binary not in PATH after global installation

**Solutions**:
```bash
# Check npm global bin directory
npm config get prefix
# Add to PATH if missing
export PATH="$(npm config get prefix)/bin:$PATH"

# Or reinstall with explicit path
npm install -g fluorite-mcp --force
```

#### 2. "Permission denied" on Installation

**Problem**: Insufficient permissions for global installation

**Solutions**:
```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g fluorite-mcp

# Option 2: Configure npm prefix (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g fluorite-mcp
```

#### 3. "Module not found" Error

**Problem**: Node.js version incompatibility or corrupted installation

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall with specific Node.js version
nvm use 20
npm install -g fluorite-mcp

# Or try yarn instead
yarn global add fluorite-mcp
```

#### 4. Claude Code CLI Connection Issues

**Problem**: MCP server not connecting properly

**Solutions**:
```bash
# Remove and re-add the server
claude mcp remove fluorite
claude mcp add fluorite -- fluorite-mcp

# Check server logs
claude mcp logs fluorite

# Test with verbose output
claude mcp status fluorite --verbose
```

### Platform-Specific Issues

#### Windows (WSL2)

```bash
# Install Windows Build Tools if needed
npm install --global windows-build-tools

# Use WSL2 Ubuntu
wsl --install -d Ubuntu
# Then follow Linux instructions
```

#### macOS with Homebrew Node.js

```bash
# If using Homebrew Node.js
brew unlink node && brew link node

# Ensure proper permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### Linux with Permission Issues

```bash
# Fix npm permissions without sudo
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

## Advanced Setup

### Development Environment Setup

For contributors and advanced users:

```bash
# Clone and setup development environment
git clone https://github.com/kotsutsumi/fluorite-mcp.git
cd fluorite-mcp

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build and test
npm run build && npm run test:e2e
```

### Custom Specifications

Add your own library specifications:

```bash
# Create custom spec directory
mkdir ~/.fluorite-custom-specs

# Add to configuration
echo 'export FLUORITE_CUSTOM_SPECS="~/.fluorite-custom-specs"' >> ~/.bashrc

# Add custom spec (see Template Creation Guide for format)
```

### Monitoring and Logging

Setup monitoring for production use:

```bash
# Enable comprehensive logging
export FLUORITE_LOG_LEVEL="debug"
export FLUORITE_LOG_FILE="~/.fluorite.log"

# Monitor performance
fluorite-mcp --server-metrics

# Set up log rotation (optional)
sudo apt install logrotate  # Ubuntu/Debian
# Create logrotate config for ~/.fluorite.log
```

### Performance Optimization

For large projects or resource-constrained environments:

```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=8192"

# Enable caching
export FLUORITE_ENABLE_CACHE="true"
export FLUORITE_CACHE_TTL="3600"

# Optimize for specific frameworks
export FLUORITE_FRAMEWORK_HINT="nextjs"  # or "react", "vue"
```

## Next Steps

After successful installation:

1. **[Getting Started Guide](./getting-started.md)** - Basic usage and first commands
2. **[Command Reference](./commands.md)** - Complete list of available features  
3. **[Spike Templates](./spike-templates.md)** - Learn rapid prototyping
4. **[API Documentation](../API.md)** - For programmatic usage

## Support

If you encounter issues not covered here:

1. **Check the [Troubleshooting Guide](./troubleshooting.md)**
2. **Search [GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)**
3. **Ask in [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)**
4. **Report bugs**: Create a new issue with installation details

---

*Last updated: 2025-08-15*