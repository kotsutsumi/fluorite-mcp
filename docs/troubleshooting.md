# Troubleshooting Guide

Common issues, solutions, and debugging techniques for Fluorite MCP.

## 📖 Table of Contents

- [Installation Issues](#installation-issues)
- [Connection Problems](#connection-problems)
- [Performance Issues](#performance-issues)
- [Static Analysis Issues](#static-analysis-issues)
- [Spike Template Issues](#spike-template-issues)
- [Resource and Memory Issues](#resource-and-memory-issues)
- [Debugging Techniques](#debugging-techniques)
- [Error Reference](#error-reference)

## Installation Issues

### "Command not found: fluorite-mcp"

**Symptoms**: CLI command not recognized after installation

**Causes**: Binary not in PATH, permission issues, npm configuration

**Solutions**:

```bash
# Check if package is installed
npm list -g fluorite-mcp

# Check npm global bin directory
npm config get prefix

# Add npm global bin to PATH
export PATH="$(npm config get prefix)/bin:$PATH"
echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Reinstall if necessary
npm uninstall -g fluorite-mcp
npm install -g fluorite-mcp
```

**Windows-specific**:
```cmd
# Check PATH includes npm global directory
echo %PATH%

# Add npm global bin to PATH (PowerShell)
$env:PATH += ";$(npm config get prefix)"
```

### Permission Denied During Installation

**Symptoms**: `EACCES` or permission errors during `npm install -g`

**Causes**: Insufficient permissions for global npm directory

**Solutions**:

```bash
# Option 1: Use npx instead of global install
npx fluorite-mcp --version

# Option 2: Configure npm to use different directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g fluorite-mcp

# Option 3: Fix npm permissions
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

**macOS with Homebrew**:
```bash
# Fix Homebrew npm permissions
brew unlink node && brew link node
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Node.js Version Conflicts

**Symptoms**: Module loading errors, compatibility warnings

**Causes**: Using unsupported Node.js version (<18.0)

**Solutions**:

```bash
# Check Node.js version
node --version

# Install/switch to compatible version using nvm
nvm install 20
nvm use 20

# Or update Node.js directly
# Visit: https://nodejs.org/

# Reinstall fluorite-mcp with correct Node.js version
npm install -g fluorite-mcp
```

### Package Corruption

**Symptoms**: Unexpected errors, missing files, import failures

**Causes**: Incomplete installation, network issues, cache corruption

**Solutions**:

```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
npm uninstall -g fluorite-mcp
npm install -g fluorite-mcp

# Clear Node.js module cache
rm -rf ~/.npm/_cacache

# Verify installation
fluorite-mcp --version
fluorite-mcp --self-test
```

## Connection Problems

### Claude Code CLI Cannot Connect

**Symptoms**: "Server not found" or connection timeout errors

**Causes**: MCP server not registered, incorrect configuration, server crash

**Diagnosis**:
```bash
# Check if MCP server is registered
claude mcp list
# Should show 'fluorite' in the list

# Check server status
claude mcp status fluorite

# View server logs
claude mcp logs fluorite
```

**Solutions**:

```bash
# Remove and re-add server
claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp

# Test with verbose output
claude mcp status fluorite --verbose

# Restart Claude Code CLI
# Close and reopen Claude Code application
```

### Server Fails to Start

**Symptoms**: Server status shows "failed" or "crashed"

**Causes**: Missing dependencies, port conflicts, configuration errors

**Diagnosis**:
```bash
# Run server directly to see error messages
fluorite-mcp 2>&1 | head -20

# Check for port conflicts
lsof -i :3000  # or your configured port

# Verify dependencies
npm list -g fluorite-mcp --depth=0
```

**Solutions**:

```bash
# Reinstall with dependencies
npm install -g fluorite-mcp --force

# Use different port
export FLUORITE_PORT=3001
claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp

# Check system resources
free -h  # Linux
top -l 1 | grep PhysMem  # macOS
```

### Intermittent Connection Drops

**Symptoms**: Connections work sometimes but fail randomly

**Causes**: Resource exhaustion, timeout issues, network problems

**Solutions**:

```bash
# Increase timeout settings
export FLUORITE_TIMEOUT=60000  # 60 seconds

# Enable keep-alive
export FLUORITE_KEEP_ALIVE=true

# Monitor resource usage
fluorite-mcp --server-metrics

# Check system limits
ulimit -n  # File descriptor limit
```

## Performance Issues

### Slow Response Times

**Symptoms**: Operations take >10 seconds, timeouts

**Causes**: Large catalogs, insufficient memory, disk I/O bottlenecks

**Diagnosis**:
```bash
# Check performance metrics
fluorite-mcp --performance-test

# Monitor resource usage
top -p $(pgrep fluorite-mcp)  # Linux
top -pid $(pgrep fluorite-mcp)  # macOS

# Check disk space
df -h
```

**Solutions**:

```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable caching
export FLUORITE_ENABLE_CACHE=true
export FLUORITE_CACHE_TTL=3600

# Optimize catalog location
export FLUORITE_CATALOG_DIR="/path/to/fast/storage"

# Use framework-specific optimization
export FLUORITE_PRIMARY_FRAMEWORK=nextjs
```

### High Memory Usage

**Symptoms**: System slowdown, out-of-memory errors

**Causes**: Memory leaks, large projects, catalog caching

**Solutions**:

```bash
# Monitor memory usage over time
watch -n 5 'ps aux | grep fluorite-mcp'

# Implement memory limits
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable garbage collection tuning
export NODE_OPTIONS="--max-old-space-size=2048 --gc-interval=100"

# Restart server periodically
# Add to crontab for automatic restart
0 */4 * * * claude mcp restart fluorite
```

### CPU Usage Spikes

**Symptoms**: High CPU usage, system unresponsiveness

**Causes**: Analysis of large files, regex processing, infinite loops

**Solutions**:

```bash
# Limit concurrent analysis
export FLUORITE_ANALYSIS_CONCURRENCY=5

# Exclude large directories
export FLUORITE_IGNORE_PATTERNS="node_modules/**,dist/**,build/**"

# Profile CPU usage
node --prof fluorite-mcp
# Process profile with: node --prof-process isolate-*.log
```

## Static Analysis Issues

### Analysis Not Working

**Symptoms**: No analysis results, "analysis failed" errors

**Causes**: Unsupported file types, permission issues, missing framework detection

**Diagnosis**:
```bash
# Test with simple file
echo 'const x = 1;' > test.js
fluorite-mcp --quick-validate test.js

# Check supported frameworks
fluorite-mcp --get-validation-rules

# Verify file permissions
ls -la /path/to/project
```

**Solutions**:

```bash
# Specify framework explicitly
export FLUORITE_DEFAULT_FRAMEWORK=nextjs

# Check file extensions
# Supported: .ts, .tsx, .js, .jsx, .vue

# Verify project structure
# Make sure package.json exists for framework detection
```

### False Positives in Analysis

**Symptoms**: Incorrect error reports, warnings for valid code

**Causes**: Outdated rules, framework version mismatches, custom patterns

**Solutions**:

```bash
# Update to latest version
npm update -g fluorite-mcp

# Configure custom rules
cat > .fluorite.json << EOF
{
  "rules": {
    "react-hooks-dependencies": "warning",
    "nextjs-client-server-boundary": "error"
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/legacy/**"
  ]
}
EOF

# Disable specific rules
export FLUORITE_DISABLED_RULES="rule-id-1,rule-id-2"
```

### Missing Framework Detection

**Symptoms**: Generic analysis instead of framework-specific rules

**Causes**: Missing package.json, ambiguous project structure

**Solutions**:

```bash
# Ensure package.json exists with framework dependencies
cat package.json | jq '.dependencies + .devDependencies'

# Add framework hints in package.json
{
  "fluorite": {
    "framework": "nextjs",
    "version": "14.x"
  }
}

# Specify framework in analysis
export FLUORITE_FRAMEWORK_HINT=nextjs
```

## Spike Template Issues

### Template Not Found

**Symptoms**: "Template 'xyz' not found" errors

**Causes**: Typo in template name, template not installed, catalog corruption

**Solutions**:

```bash
# List available templates
fluorite-mcp --discover-spikes

# Search for templates
fluorite-mcp --discover-spikes --query="nextjs"

# Refresh template catalog
rm -rf ~/.fluorite/cache/spikes
fluorite-mcp --self-test
```

### Template Rendering Errors

**Symptoms**: Invalid output, missing variables, malformed files

**Causes**: Invalid template syntax, missing parameters

**Diagnosis**:
```bash
# Preview template before applying
fluorite-mcp --preview-spike template-id --params='{"name":"test"}'

# Check template structure
fluorite-mcp --explain-spike template-id
```

**Solutions**:

```bash
# Provide all required parameters
{
  "app_name": "my-app",
  "port": "3000",
  "database": "postgresql"
}

# Check for parameter requirements
# Templates may have default values for optional parameters
```

### Spike Application Fails

**Symptoms**: Files not created, partial application, permission errors

**Causes**: File system permissions, target directory issues, conflicts

**Solutions**:

```bash
# Check target directory permissions
ls -la /path/to/target

# Create target directory if needed
mkdir -p /path/to/target

# Apply with explicit strategy
fluorite-mcp --apply-spike template-id --strategy=overwrite

# Resolve conflicts manually
fluorite-mcp --apply-spike template-id --strategy=three_way_merge
```

## Resource and Memory Issues

### "Out of Memory" Errors

**Symptoms**: Process crash, ENOMEM errors

**Solutions**:

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=8192"

# Enable memory monitoring
export FLUORITE_MEMORY_MONITORING=true

# Implement memory cleanup
export FLUORITE_AUTO_CLEANUP=true
export FLUORITE_CLEANUP_INTERVAL=300000  # 5 minutes
```

### Disk Space Issues

**Symptoms**: Write failures, cache errors

**Solutions**:

```bash
# Check disk usage
df -h

# Clean up cache
rm -rf ~/.fluorite/cache/*

# Configure cache limits
export FLUORITE_MAX_CACHE_SIZE=100MB
export FLUORITE_CACHE_CLEANUP=auto
```

### File Descriptor Limits

**Symptoms**: "Too many open files" errors

**Solutions**:

```bash
# Check current limits
ulimit -n

# Increase file descriptor limit
ulimit -n 4096

# Make permanent (Linux)
echo "* soft nofile 4096" >> /etc/security/limits.conf
echo "* hard nofile 4096" >> /etc/security/limits.conf
```

## Debugging Techniques

### Enable Debug Logging

```bash
# Set debug level
export FLUORITE_LOG_LEVEL=debug
export FLUORITE_LOG_FILE=/tmp/fluorite-debug.log

# Run with verbose output
fluorite-mcp --verbose 2>&1 | tee debug.log

# Monitor logs in real-time
tail -f /tmp/fluorite-debug.log
```

### Trace MCP Communication

```bash
# Enable MCP protocol tracing
export FLUORITE_MCP_TRACE=true

# Save trace to file
export FLUORITE_TRACE_FILE=/tmp/mcp-trace.json

# Analyze MCP messages
cat /tmp/mcp-trace.json | jq '.messages[] | select(.type == "error")'
```

### Performance Profiling

```bash
# Enable performance profiling
node --prof --max-old-space-size=4096 fluorite-mcp

# Generate performance report
node --prof-process isolate-*.log > profile-report.txt

# Analyze bottlenecks
grep -A 10 "Bottom up" profile-report.txt
```

### Memory Leak Detection

```bash
# Run with heap profiling
node --max-old-space-size=4096 --expose-gc fluorite-mcp &
PID=$!

# Monitor memory over time
while true; do
  echo "$(date): $(ps -o rss= -p $PID) KB"
  sleep 60
done

# Generate heap snapshot
kill -USR2 $PID
```

## Error Reference

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `SPEC_NOT_FOUND` | Specification doesn't exist | Check available specs with `list-specs` |
| `INVALID_YAML` | YAML parsing failed | Validate YAML syntax |
| `SIZE_LIMIT_EXCEEDED` | File/spec too large | Reduce size or increase limits |
| `ANALYSIS_FAILED` | Static analysis error | Check file paths and permissions |
| `TEMPLATE_NOT_FOUND` | Spike template missing | Use `discover-spikes` to find templates |
| `PERMISSION_DENIED` | File system permission error | Check directory permissions |
| `TIMEOUT_ERROR` | Operation timed out | Increase timeout or optimize operation |
| `MEMORY_ERROR` | Out of memory | Increase memory limit or reduce load |

### Framework-Specific Errors

#### Next.js

```bash
# "Cannot use client hooks in Server Components"
# Solution: Add 'use client' directive or move to client component

# "Hydration mismatch"
# Solution: Use useEffect for client-only code

# "Invalid API route"
# Solution: Check route naming and export format
```

#### React

```bash
# "Hooks called conditionally"
# Solution: Move hooks to top level of component

# "Missing dependency in useEffect"
# Solution: Add missing dependencies to dependency array

# "Component not exported"
# Solution: Add export statement or check import path
```

### Recovery Procedures

#### Complete Reset

```bash
# Remove all Fluorite MCP data
rm -rf ~/.fluorite
rm -rf ~/.npm/_cacache/fluorite-mcp

# Uninstall and reinstall
npm uninstall -g fluorite-mcp
claude mcp remove fluorite
npm install -g fluorite-mcp
claude mcp add fluorite-mcp -- fluorite-mcp

# Verify installation
fluorite-mcp --self-test
```

#### Partial Reset

```bash
# Reset only cache
rm -rf ~/.fluorite/cache

# Reset only configuration
rm ~/.fluorite.json

# Reset only logs
rm ~/.fluorite/logs/*
```

## Real-World Troubleshooting Examples

### Issue: Team Member Can't Connect to MCP Server

**Scenario**: New team member follows setup but gets "Server not found" errors.

**Common Causes & Solutions**:

```bash
# 1. Check if they have the correct Node.js version
node --version  # Should be >= 18.0

# 2. Verify global npm installation location
npm config get prefix
ls -la $(npm config get prefix)/bin/fluorite-mcp*

# 3. Check Claude Code CLI installation
claude --version

# 4. Re-register the server
claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp
claude mcp status fluorite

# 5. Test with direct command
fluorite-mcp --self-test
```

**Prevention**: Use the [team setup script](../examples/quick-start-team.sh) for consistent installation.

### Issue: Analysis Takes Too Long on Large Codebase

**Scenario**: Monorepo with 100+ files, analysis takes >5 minutes.

**Optimization Steps**:

```bash
# 1. Enable parallel processing
export FLUORITE_ANALYSIS_CONCURRENCY=8

# 2. Exclude unnecessary directories
export FLUORITE_IGNORE_PATTERNS="node_modules/**,dist/**,build/**,.next/**"

# 3. Use incremental analysis
fluorite-mcp --static-analysis --incremental --changed-only

# 4. Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=8192"

# 5. Enable caching
export FLUORITE_ENABLE_CACHE=true
export FLUORITE_CACHE_TTL=7200

# 6. Framework-specific optimization
export FLUORITE_PRIMARY_FRAMEWORK=nextjs
```

**For Enterprise Monorepos**:
```bash
# Use monorepo-specific analysis
fluorite-mcp --static-analysis --monorepo-mode --team-parallel

# Example configuration from examples/monorepo-config.yml
analysis:
  parallel_processing: true
  max_workers: 16
  cache_strategy: "distributed"
```

### Issue: False Positives in CI/CD Pipeline

**Scenario**: CI pipeline fails with warnings about valid code patterns.

**Solution Strategy**:

```bash
# 1. Create project-specific configuration
cat > .fluorite.json << EOF
{
  "framework": "nextjs",
  "rules": {
    "react-hooks-dependencies": "warning",
    "nextjs-client-server-boundary": "error"
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/legacy/**",
    "**/generated/**"
  ],
  "customRules": {
    "team-naming-convention": true,
    "project-specific-patterns": true
  }
}
EOF

# 2. Adjust CI thresholds by environment
# In .github/workflows/ci.yml:
if [ "${{ github.ref }}" == "refs/heads/main" ]; then
  MAX_ERRORS=0
  MAX_WARNINGS=3
else
  MAX_ERRORS=2
  MAX_WARNINGS=10
fi

# 3. Use staged analysis for faster feedback
fluorite-mcp --quick-validate --staged-files --framework auto-detect
```

### Issue: Memory Leak in Long-Running Analysis

**Scenario**: Fluorite MCP process consumes increasing memory over time.

**Diagnosis & Fix**:

```bash
# 1. Monitor memory usage
watch -n 5 'ps aux | grep fluorite-mcp'

# 2. Check for memory leaks
node --expose-gc fluorite-mcp --performance-test

# 3. Implement memory limits
export NODE_OPTIONS="--max-old-space-size=4096 --gc-interval=100"

# 4. Enable automatic cleanup
export FLUORITE_AUTO_CLEANUP=true
export FLUORITE_CLEANUP_INTERVAL=300000  # 5 minutes

# 5. Use process restart in long-running environments
# In crontab:
0 */6 * * * claude mcp restart fluorite
```

### Issue: Template Application Fails in Production

**Scenario**: Spike templates work locally but fail in production environment.

**Debugging Steps**:

```bash
# 1. Check production environment differences
echo "NODE_ENV: $NODE_ENV"
echo "Working directory: $(pwd)"
echo "Permissions: $(ls -la)"

# 2. Preview template before applying
fluorite-mcp --preview-spike template-id --params '{"env":"production"}'

# 3. Validate template parameters
fluorite-mcp --explain-spike template-id

# 4. Apply with explicit strategy
fluorite-mcp --apply-spike template-id \
  --strategy overwrite \
  --validate true \
  --backup true

# 5. Check for conflicts
fluorite-mcp --apply-spike template-id --strategy three_way_merge
```

## Getting Help

### Collect Diagnostic Information

```bash
# Generate comprehensive diagnostic report
cat > diagnostic-report.txt << EOF
=== System Information ===
OS: $(uname -a)
Node.js: $(node --version)
npm: $(npm --version)
Shell: $SHELL
User: $(whoami)

=== Fluorite MCP Information ===
Version: $(fluorite-mcp --version)
Installation Path: $(which fluorite-mcp)
Server Status: $(claude mcp status fluorite 2>&1)

=== Environment Variables ===
NODE_OPTIONS: $NODE_OPTIONS
FLUORITE_LOG_LEVEL: $FLUORITE_LOG_LEVEL
FLUORITE_CACHE_TTL: $FLUORITE_CACHE_TTL

=== Performance Test ===
$(fluorite-mcp --performance-test 2>&1)

=== Self-Test Results ===
$(fluorite-mcp --self-test 2>&1)

=== Recent Logs ===
$(tail -50 ~/.fluorite/logs/fluorite.log 2>/dev/null || echo "No logs found")

=== Git Status (if applicable) ===
$(git status --porcelain 2>/dev/null || echo "Not a git repository")

=== Project Structure ===
$(find . -name "package.json" -o -name "requirements.txt" -o -name "*.config.*" | head -10)
EOF

echo "Diagnostic report saved to diagnostic-report.txt"
```

### Report Issues

When reporting issues, include:

1. **Environment details**: OS, Node.js version, Fluorite MCP version
2. **Error messages**: Complete error text and stack traces
3. **Steps to reproduce**: Exact commands that cause the issue
4. **Expected behavior**: What should happen
5. **Diagnostic report**: Output from diagnostic script above

### Community Resources

- **[GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)** - Bug reports and feature requests
- **Documentation** - README.md and docs/ folder for complete documentation

### Emergency Contacts

For critical production issues:
1. Check [Status Page] for known issues
2. Contact support through available channels
3. For enterprise users: Use priority support channel

---

*Last updated: 2025-08-15*