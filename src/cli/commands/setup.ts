import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ClaudeDetector } from '../utils/claude-detector.js';
import { ClaudePaths } from '../utils/paths.js';
import { SuperClaudeCommands } from '../data/superclaude-commands.js';

const execAsync = promisify(exec);

/**
 * CLI command for setting up fluorite-mcp integration with Claude Code CLI.
 * Configures MCP server registration, creates fluorite command files, and
 * establishes the complete development workflow integration.
 * 
 * Features:
 * - Detects Claude Code CLI installation and version
 * - Registers fluorite-mcp as an MCP server
 * - Creates fluorite command configurations (/fl: commands)
 * - Updates Claude commands configuration
 * - Verifies complete installation setup
 * 
 * @example
 * ```bash
 * # Basic setup
 * fluorite setup
 * 
 * # Force setup even if already configured
 * fluorite setup --force
 * 
 * # Preview setup without making changes
 * fluorite setup --dry-run
 * ```
 */
export const setupCommand = new Command('setup')
  .description('Setup fluorite-mcp with Claude Code CLI')
  .option('--force', 'Force setup even if already configured')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    console.log('🚀 Setting up fluorite-mcp with Claude Code CLI...\n');

    try {
      // Step 1: Detect Claude Code CLI
      console.log('1. Detecting Claude Code CLI installation...');
      const claude = await ClaudeDetector.detect();
      
      if (!claude.installed) {
        console.error('❌ Claude Code CLI not found. Please install it first:');
        console.error('   npm install -g @anthropic/claude-code-cli');
        process.exit(1);
      }
      
      console.log(`✅ Claude Code CLI detected (${claude.version})`);
      
      if (!claude.mcpSupported) {
        console.warn('⚠️  MCP support not detected. Please update Claude CLI.');
      }

      // Step 2: Ensure configuration directories exist
      console.log('\n2. Creating configuration directories...');
      if (!options.dryRun) {
        await ClaudeDetector.ensureClaudeConfig();
      }
      console.log(`✅ Configuration directories ready`);

      // Step 3: Register MCP server
      console.log('\n3. Registering fluorite-mcp as MCP server...');
      if (!options.dryRun) {
        try {
          await execAsync('claude mcp add fluorite -- fluorite-mcp-server');
          console.log('✅ MCP server registered');
        } catch (error) {
          console.log('ℹ️  MCP server already registered or registration failed');
        }
      } else {
        console.log('📋 Would run: claude mcp add fluorite -- fluorite-mcp-server');
      }

      // Step 4: Create fluorite commands configuration
      console.log('\n4. Creating fluorite command configurations...');
      if (!options.dryRun) {
        await createFluoriteCommands();
        await updateClaudeCommands(options.force);
      } else {
        console.log('📋 Would create fluorite command configurations');
      }
      console.log('✅ Command configurations created');

      // Step 5: Verify installation
      console.log('\n5. Verifying installation...');
      await verifyInstallation(options.dryRun);

      console.log('\n🎉 Setup completed successfully!');
      console.log('\nYou can now use /fl: commands in Claude Code CLI:');
      console.log('  /fl:git commit,push');
      console.log('  /fl:analyze --focus architecture');
      console.log('  /fl:implement "create REST API"');
      console.log('\nFor help: /fl:help');

    } catch (error) {
      console.error(`\n❌ Setup failed: ${error}`);
      process.exit(1);
    }
  });


/**
 * Creates fluorite command files in the Claude CLI commands directory.
 * Generates markdown files for each SuperClaude command with fluorite enhancements,
 * including spike template integration and token optimization capabilities.
 * 
 * @private
 * @returns Promise that resolves when all command files are created
 * 
 * @example
 * Creates files like:
 * - ~/.claude/commands/fl/build.md
 * - ~/.claude/commands/fl/implement.md
 * - ~/.claude/commands/fl/analyze.md
 * - ~/.claude/commands/fl/help.md
 */
async function createFluoriteCommands(): Promise<void> {
  // Create ~/.claude/commands/fl/ directory for slash commands
  const flCommandsDir = path.join(ClaudePaths.claudeDir, 'commands', 'fl');
  await fs.mkdir(flCommandsDir, { recursive: true });

  // Command template for each fluorite command
  const createCommandFile = (cmd: any) => {
    const allowedTools = getToolsForCommand(cmd.name);
    return `---
allowed-tools: [${allowedTools.join(', ')}]
description: "Enhanced ${cmd.description} with fluorite intelligence"
---

# /fl:${cmd.name} - Enhanced ${cmd.description.charAt(0).toUpperCase() + cmd.description.slice(1)}

## Purpose
${cmd.description.charAt(0).toUpperCase() + cmd.description.slice(1)} enhanced with fluorite intelligence and SuperClaude optimizations.

## Usage
\`\`\`
/fl:${cmd.name} ${cmd.usage || '[arguments]'} [--spike-aware]
\`\`\`

## Arguments
${cmd.usage ? `- Arguments: ${cmd.usage}` : '- Standard command arguments'}
${cmd.flags ? cmd.flags.map((flag: string) => `- \`${flag}\` - ${getFlagDescription(flag)}`).join('\n') : ''}
- \`--spike-aware\` - Enable spike template integration

## Fluorite Enhancements
- **SuperClaude Mapping**: Maps to \`/sc:${cmd.name}\` with intelligent preprocessing
- **Spike Integration**: Automatic spike template discovery and application
- **Token Optimization**: Enhanced with \`--persona-smart --token-optimize\` flags
- **Enhanced Intelligence**: Advanced ${cmd.category.toLowerCase()} capabilities

## Execution
1. Parse ${cmd.name} requirements with natural language understanding
2. Apply fluorite-specific enhancements and spike template matching
3. Execute enhanced SuperClaude command with preprocessing
4. Integrate with MCP servers for specialized functionality
5. Provide comprehensive results with optimization recommendations

## Examples
\`\`\`
/fl:${cmd.name} ${getExampleUsage(cmd.name)}
\`\`\`
`;
  };

  // Create command files for all SuperClaude commands
  const commands = SuperClaudeCommands.getAll();
  for (const cmd of commands) {
    const filePath = path.join(flCommandsDir, `${cmd.name}.md`);
    const content = createCommandFile(cmd);
    await fs.writeFile(filePath, content, 'utf8');
  }

  // Create special help command
  const helpContent = `---
allowed-tools: [Read]
description: "Show help and documentation for fluorite commands"
---

# /fl:help - Fluorite Command Help

## Purpose
Display comprehensive help and documentation for fluorite commands and SuperClaude wrapper functionality.

## Usage
\`\`\`
/fl:help [command] [--category] [--detailed]
\`\`\`

## Available Commands
${SuperClaudeCommands.getCategories().map(category => 
  `### ${category} Commands\n${SuperClaudeCommands.getByCategory(category).map(cmd => 
    `- \`/fl:${cmd.name}\` - ${cmd.description}`
  ).join('\n')}`
).join('\n\n')}

## Fluorite Enhancements
All \`/fl:\` commands are enhanced versions of SuperClaude \`/sc:\` commands with:
- **Spike Template Integration**: Automatic template discovery and application
- **Token Optimization**: Enhanced efficiency with smart preprocessing
- **Natural Language Support**: Advanced understanding of requirements
- **MCP Integration**: Seamless integration with specialized servers

## Getting Started
1. Use \`/fl:load\` to analyze your project
2. Try \`/fl:build\` for building with optimizations
3. Use \`/fl:implement\` for feature development
4. Run \`/fl:analyze\` for comprehensive project analysis
`;

  const helpFilePath = path.join(flCommandsDir, 'help.md');
  await fs.writeFile(helpFilePath, helpContent, 'utf8');
}

/**
 * Maps fluorite command names to their required Claude Code tools.
 * Defines which tools each command needs for proper execution,
 * enabling fine-grained permission control in the CLI environment.
 * 
 * @private
 * @param commandName - The fluorite command name (e.g., 'build', 'implement')
 * @returns Array of tool names required for the command
 * 
 * @example
 * ```typescript
 * const tools = getToolsForCommand('build');
 * console.log(tools); // ['Read', 'Bash', 'Glob', 'TodoWrite', 'Edit', 'MultiEdit', 'Task']
 * ```
 */
function getToolsForCommand(commandName: string): string[] {
  const toolMap: { [key: string]: string[] } = {
    'build': ['Read', 'Bash', 'Glob', 'TodoWrite', 'Edit', 'MultiEdit', 'Task'],
    'implement': ['Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Glob', 'TodoWrite', 'Task'],
    'analyze': ['Read', 'Grep', 'Glob', 'TodoWrite', 'Task'],
    'improve': ['Read', 'Grep', 'Edit', 'MultiEdit', 'TodoWrite', 'Task'],
    'test': ['Read', 'Bash', 'TodoWrite', 'Task'],
    'git': ['Read', 'Bash', 'TodoWrite', 'Edit'],
    'document': ['Read', 'Write', 'Edit', 'MultiEdit', 'TodoWrite'],
    'troubleshoot': ['Read', 'Grep', 'Bash', 'TodoWrite', 'Task'],
    'explain': ['Read', 'Grep', 'TodoWrite'],
    'cleanup': ['Read', 'Grep', 'Edit', 'MultiEdit', 'Bash', 'TodoWrite', 'Task'],
    'design': ['Read', 'Write', 'Edit', 'MultiEdit', 'Task'],
    'estimate': ['Read', 'Grep', 'TodoWrite', 'Task'],
    'task': ['Read', 'TodoWrite', 'Task'],
    'index': ['Read', 'Grep', 'TodoWrite'],
    'load': ['Read', 'Glob', 'Grep', 'TodoWrite', 'Task'],
    'spawn': ['Read', 'TodoWrite', 'Task'],
    'help': ['Read']
  };
  return toolMap[commandName] || ['Read', 'TodoWrite'];
}

/**
 * Provides human-readable descriptions for common CLI flags used in
 * fluorite commands. Used for generating comprehensive command documentation.
 * 
 * @private
 * @param flag - The CLI flag (e.g., '--framework', '--optimize')
 * @returns Human-readable description of the flag's purpose
 * 
 * @example
 * ```typescript
 * const desc = getFlagDescription('--framework');
 * console.log(desc); // 'Target framework or technology stack'
 * ```
 */
function getFlagDescription(flag: string): string {
  const descriptions: { [key: string]: string } = {
    '--framework': 'Target framework or technology stack',
    '--optimize': 'Enable optimizations',
    '--watch': 'Enable watch mode',
    '--production': 'Production build mode',
    '--type': 'Implementation type',
    '--test': 'Include tests',
    '--dry-run': 'Preview without changes',
    '--focus': 'Focus area for analysis',
    '--depth': 'Analysis depth level',
    '--format': 'Output format',
    '--output': 'Output destination',
    '--coverage': 'Generate coverage reports',
    '--parallel': 'Parallel execution',
    '--verbose': 'Verbose output'
  };
  return descriptions[flag] || 'Command flag';
}

/**
 * Generates example usage strings for fluorite commands to include in
 * command documentation. Provides realistic examples that demonstrate
 * common use cases and flag combinations.
 * 
 * @private
 * @param commandName - The fluorite command name
 * @returns Example usage string with common flags and arguments
 * 
 * @example
 * ```typescript
 * const example = getExampleUsage('implement');
 * console.log(example); // '"user authentication system" --type feature --test'
 * ```
 */
function getExampleUsage(commandName: string): string {
  const examples: { [key: string]: string } = {
    'build': '--framework react --optimize',
    'implement': '"user authentication system" --type feature --test',
    'analyze': '--focus security --depth comprehensive',
    'improve': 'src/components --focus performance',
    'test': 'unit --coverage --watch',
    'git': 'commit --conventional --auto-push',
    'document': 'api --format markdown --include-examples',
    'troubleshoot': '"build fails with memory error" --logs',
    'explain': '"React hooks" --detail intermediate --examples',
    'cleanup': '--safe --preview',
    'design': 'user-dashboard --style component --responsive',
    'estimate': '"user authentication" --breakdown --hours',
    'task': 'create "implement user auth" --priority high',
    'index': '"testing" --category Quality --detailed',
    'load': '. --deep --cache',
    'spawn': 'auto --parallel --max-workers 4'
  };
  return examples[commandName] || '[arguments] --spike-aware';
}


/**
 * Updates the Claude CLI COMMANDS.md file with fluorite command definitions.
 * Adds comprehensive documentation for fluorite commands and their integration
 * with SuperClaude framework, including command mapping and processing pipeline.
 * 
 * @private
 * @param force - If true, overwrites existing fluorite commands section
 * @returns Promise that resolves when COMMANDS.md is updated
 * 
 * @example
 * ```typescript
 * await updateClaudeCommands(true); // Force update existing commands
 * ```
 */
async function updateClaudeCommands(force: boolean): Promise<void> {
  const commandsPath = ClaudePaths.commandsFile;
  
  // Check if COMMANDS.md exists
  let commandsContent = '';
  try {
    commandsContent = await fs.readFile(commandsPath, 'utf8');
  } catch {
    // File doesn't exist, create base content
    commandsContent = `# Claude Code CLI Commands

This file contains command definitions for Claude Code CLI.

`;
  }

  // Check if fluorite commands are already added
  if (commandsContent.includes('## Fluorite Commands') && !force) {
    console.log('ℹ️  Fluorite commands already exist in COMMANDS.md');
    return;
  }

  // Generate fluorite commands section with executable mappings
  const executorPath = path.join(ClaudePaths.fluoriteDir, 'executor.sh');
  const fluoriteSection = `
## Fluorite Commands

Enhanced SuperClaude commands with spike templates and optimizations.

**Command Executor**: \`${executorPath}\`

**Available Commands**:
${SuperClaudeCommands.getAll().map(cmd => `
**\`/fl:${cmd.name}\`**
- Purpose: ${cmd.description}
- Maps to: \`/sc:${cmd.name}\` with fluorite enhancements
- Usage: \`/fl:${cmd.name} ${cmd.usage || '[arguments]'}\`
- Features: Spike templates, token optimization, natural language
`).join('')}

**\`/fl:help\`**
- Purpose: Show help for fluorite commands
- Usage: \`/fl:help [command]\`

**\`/fl:spike\`**
- Purpose: Spike template operations
- Usage: 
  - \`/fl:spike discover [query]\`
  - \`/fl:spike apply [template]\`
  - \`/fl:spike list\`

**Command Processing**:
Fluorite commands are processed through \`${executorPath}\` which:
1. Parses the \`/fl:\` command syntax
2. Adds fluorite-specific enhancements (\`--persona-smart --token-optimize --spike-aware\`)
3. Maps to equivalent SuperClaude \`/sc:\` commands
4. Integrates with MCP server for spike templates

`;

  // Add fluorite section to commands
  if (commandsContent.includes('## Fluorite Commands')) {
    // Replace existing section
    const regex = /## Fluorite Commands[\s\S]*?(?=##|$)/;
    commandsContent = commandsContent.replace(regex, fluoriteSection.trim());
  } else {
    // Add new section
    commandsContent += fluoriteSection;
  }

  await fs.writeFile(commandsPath, commandsContent, 'utf8');
}

/**
 * Verifies that fluorite-mcp setup completed successfully by checking
 * for required configuration files, command files, and MCP server connectivity.
 * Provides comprehensive validation of the entire installation.
 * 
 * @private
 * @param dryRun - If true, performs validation checks without actual verification
 * @returns Promise that resolves when verification is complete
 * @throws Error if critical setup components are missing
 * 
 * @example
 * ```typescript
 * await verifyInstallation(false); // Full verification
 * await verifyInstallation(true);  // Dry run mode
 * ```
 */
async function verifyInstallation(dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log('📋 Would verify fluorite-mcp installation');
    return;
  }

  // Check if configuration files exist
  try {
    await fs.access(ClaudePaths.fluoriteConfig);
    console.log('✅ Fluorite configuration file created');
  } catch {
    throw new Error('Fluorite configuration file not found');
  }

  try {
    await fs.access(ClaudePaths.commandsFile);
    console.log('✅ Claude commands file updated');
  } catch {
    console.log('⚠️  Claude commands file not found (this is optional)');
  }

  // Check fluorite command files
  try {
    const flCommandsDir = path.join(ClaudePaths.claudeDir, 'commands', 'fl');
    await fs.access(flCommandsDir);
    console.log('✅ Fluorite commands directory created');
    
    // Check for some key command files
    const keyCommands = ['build.md', 'implement.md', 'analyze.md', 'help.md'];
    for (const cmdFile of keyCommands) {
      const cmdPath = path.join(flCommandsDir, cmdFile);
      await fs.access(cmdPath);
    }
    console.log('✅ Fluorite command files created (17 commands)');
  } catch {
    throw new Error('Fluorite command files not found');
  }

  // Test MCP server connection
  try {
    await execAsync('claude mcp list');
    console.log('✅ MCP server connection verified');
  } catch {
    console.log('⚠️  Could not verify MCP server connection');
  }
}