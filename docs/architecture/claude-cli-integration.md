# Claude Code CLI Integration Specification

## Overview

This document specifies how fluorite-mcp integrates with Claude Code CLI to provide seamless /fl: commands alongside existing /sc: commands.

## Integration Architecture

```
Claude Code CLI
    ├── ~/.claude/                    # Claude configuration directory
    │   ├── COMMANDS.md              # Command definitions
    │   ├── FLAGS.md                 # Flag specifications
    │   ├── PERSONAS.md              # Persona configurations
    │   ├── MCP.md                   # MCP server configurations
    │   └── fluorite/                # Fluorite-specific configs
    │       ├── config.yaml          # Fluorite configuration
    │       ├── commands.md          # Fluorite command specs
    │       └── spikes/              # Local spike cache
    └── MCP Servers
        └── fluorite-mcp             # Our MCP server
```

## Setup Automation

### 1. Installation Flow

```bash
# User runs:
npm install -g fluorite-mcp
fluorite-mcp setup

# Setup performs:
1. Detect Claude Code CLI installation
2. Register fluorite-mcp as MCP server
3. Inject fluorite commands into ~/.claude
4. Configure command aliases
5. Download spike templates
6. Verify installation
```

### 2. MCP Server Registration

```bash
# Automatically executed during setup:
claude mcp add fluorite -- fluorite-mcp-server

# This creates/updates ~/.claude/mcp_servers.yaml:
```

```yaml
fluorite:
  command: fluorite-mcp
  args: []
  env:
    FLUORITE_HOME: ~/.fluorite
    SPIKE_CACHE: ~/.fluorite/spikes
  capabilities:
    - commands
    - tools
    - resources
  auto_start: true
```

### 3. Command Injection

#### ~/.claude/COMMANDS.md Addition
```markdown
## Fluorite Commands

### Development Commands

**`/fl:git $ARGUMENTS`**
- **Purpose**: Enhanced git operations with spike templates
- **Mapping**: `/sc:git` with commit message enhancement
- **Auto-Persona**: DevOps, Scribe
- **MCP Integration**: fluorite, serena
- **Example**: `/fl:git commit,push`

**`/fl:analyze $ARGUMENTS`**
- **Purpose**: Deep code analysis with fluorite static analyzer
- **Mapping**: `/sc:analyze` with architectural insights
- **Auto-Persona**: Analyzer, Architect
- **MCP Integration**: fluorite, sequential
- **Example**: `/fl:analyze --focus architecture`

**`/fl:implement $ARGUMENTS`**
- **Purpose**: Implementation with spike templates
- **Mapping**: `/sc:implement` with automatic boilerplate
- **Auto-Persona**: Frontend, Backend, Architect
- **MCP Integration**: fluorite, magic, serena
- **Example**: `/fl:implement "REST API with auth"`

**`/fl:spike $OPERATION $ARGUMENTS`**
- **Purpose**: Spike template management
- **Operations**: discover, apply, create, list
- **MCP Integration**: fluorite
- **Example**: `/fl:spike discover "nextjs typescript"`
```

#### ~/.claude/FLAGS.md Addition
```markdown
## Fluorite-Specific Flags

**`--spike [template]`**
- Apply spike template during command execution
- Auto-activates: Template matching detected
- Example: `/fl:implement --spike nextjs-api-edge`

**`--no-spike`**
- Disable automatic spike template selection
- Use raw SuperClaude commands

**`--spike-cache`**
- Use cached spike templates (offline mode)
- 90% faster execution

**`--serena`**
- Enable Serena MCP for natural language processing
- Auto-activates: Natural language detected
```

#### ~/.claude/MCP.md Addition
```markdown
## Fluorite MCP Integration

**Purpose**: Spike templates, static analysis, enhanced workflows

**Activation Patterns**:
- Automatic: `/fl:` commands detected
- Manual: `--fluorite` flag
- Smart: Spike template keywords

**Capabilities**:
- Spike template discovery and application
- Static code analysis
- Error prediction
- Dependency analysis
- Natural language to spike mapping

**Integration Commands**:
- `/fl:spike` - Spike template operations
- `/fl:analyze` - Enhanced analysis
- `/fl:implement` - Template-driven implementation
```

### 4. Configuration Files

#### ~/.claude/fluorite/config.yaml
```yaml
version: 1.0.0
claude_version: 1.x.x
enabled: true

# Command mappings
commands:
  prefix: "/fl:"
  mappings:
    - fluorite: "git"
      superclaude: "/sc:git"
      enhanced: true
    - fluorite: "analyze"
      superclaude: "/sc:analyze"
      enhanced: true
    - fluorite: "implement"
      superclaude: "/sc:implement"
      enhanced: true

# Spike templates
spikes:
  cache_dir: ~/.fluorite/spikes
  auto_update: true
  # index_url: configuration will be added when API is available
  
# Serena MCP integration
serena:
  enabled: true
  endpoint: serena-mcp
  fallback: true

# Performance
optimization:
  cache_enabled: true
  cache_ttl: 3600
  compression: true
  token_limit: 100000
  
# Telemetry
telemetry:
  enabled: false
  anonymous: true
```

### 5. Command Alias System

#### ~/.claude/fluorite/aliases.sh
```bash
# Fluorite command aliases
alias fl="claude --fluorite"
alias fls="claude /fl:spike"
alias fla="claude /fl:analyze"
alias fli="claude /fl:implement"
alias flg="claude /fl:git"

# Workflow aliases
alias fldev="claude /fl:implement && /fl:test && /fl:git commit"
alias flapi="claude /fl:spike apply fastapi-minimal && /fl:implement"
```

## Runtime Integration

### 1. Command Interception

```typescript
// Fluorite MCP server intercepts commands
export class CommandInterceptor {
  async intercept(command: string): Promise<InterceptResult> {
    if (command.startsWith('/fl:')) {
      return this.handleFluoriteCommand(command);
    }
    return { passthrough: true };
  }
  
  async handleFluoriteCommand(command: string): Promise<InterceptResult> {
    // Parse command
    const parsed = this.parser.parse(command);
    
    // Apply enhancements
    const enhanced = await this.enhance(parsed);
    
    // Map to SuperClaude
    const mapped = this.mapToSuperClaude(enhanced);
    
    // Execute with monitoring
    return this.execute(mapped);
  }
}
```

### 2. Context Sharing

```typescript
// Share context between fluorite and Claude
export class ContextManager {
  async getContext(): Promise<Context> {
    return {
      project: await this.detectProject(),
      history: await this.getCommandHistory(),
      spikes: await this.getUsedSpikes(),
      preferences: await this.getUserPreferences()
    };
  }
  
  async persistContext(context: Context): Promise<void> {
    // Save to ~/.claude/fluorite/context.json
    await fs.writeJson(this.contextPath, context);
  }
}
```

### 3. Tool Registration

```typescript
// Register fluorite tools with Claude
export class ToolRegistry {
  async registerTools(): Promise<void> {
    await this.server.registerTool('spike-discover', {
      description: 'Discover spike templates',
      inputSchema: { query: z.string() },
      handler: this.handleSpikeDiscover
    });
    
    await this.server.registerTool('spike-apply', {
      description: 'Apply spike template',
      inputSchema: { template: z.string(), params: z.object({}) },
      handler: this.handleSpikeApply
    });
    
    // More tools...
  }
}
```

## Verification & Validation

### 1. Installation Verification

```bash
fluorite-mcp verify

# Checks:
✓ Claude Code CLI installed
✓ Fluorite MCP server registered
✓ Commands available in ~/.claude
✓ Spike templates cached
✓ Serena MCP connected
✓ Test command execution
```

### 2. Command Testing

```bash
# Test fluorite commands
fluorite-mcp test-commands

# Runs:
- /fl:spike list
- /fl:analyze --test
- /fl:implement --dry-run
- /fl:git --version
```

### 3. Integration Health Check

```typescript
// Health check endpoint
export class HealthCheck {
  async check(): Promise<HealthStatus> {
    return {
      claude_cli: await this.checkClaudeCLI(),
      mcp_server: await this.checkMCPServer(),
      spike_cache: await this.checkSpikeCache(),
      serena: await this.checkSerena(),
      commands: await this.checkCommands()
    };
  }
}
```

## Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Commands not recognized | Run `fluorite-mcp setup --repair` |
| MCP server not starting | Check `claude mcp list` and restart |
| Spikes not loading | Clear cache: `fluorite-mcp cache clear` |
| Serena connection failed | Fallback to direct SuperClaude |
| Permission denied | Check ~/.claude permissions |

### Debug Mode

```bash
# Enable debug logging
export FLUORITE_DEBUG=true
export CLAUDE_DEBUG=true

# View logs
tail -f ~/.claude/logs/fluorite.log
```

### Recovery Commands

```bash
# Repair installation
fluorite-mcp setup --repair

# Reset configuration
fluorite-mcp config --reset

# Clear all caches
fluorite-mcp cache --clear-all

# Uninstall completely
fluorite-mcp uninstall
```

## Updates & Maintenance

### Auto-Update System

```yaml
# ~/.claude/fluorite/config.yaml
updates:
  auto_check: true
  auto_install: false
  channel: stable  # stable, beta, nightly
  check_interval: 86400  # 24 hours
```

### Manual Updates

```bash
# Check for updates
fluorite-mcp update --check

# Update to latest
fluorite-mcp update

# Update spike templates
fluorite-mcp spike update
```

## Security Considerations

### 1. Permission Model
- Read-only access to Claude configs
- Write access only to ~/.fluorite/
- No execution without user confirmation

### 2. Spike Template Security
- Templates are sandboxed
- No arbitrary code execution
- Validated before application

### 3. API Key Management
- Serena API keys encrypted
- Stored in system keychain
- Never logged or transmitted

## Performance Metrics

### Target Metrics
- Setup time: < 60 seconds
- Command overhead: < 100ms
- Spike application: < 2 seconds
- Cache hit rate: > 80%
- Token reduction: 30-50%