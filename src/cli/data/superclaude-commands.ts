/**
 * SuperClaude command definitions for fluorite wrapping
 */

export interface SuperClaudeCommand {
  name: string;
  description: string;
  usage?: string;
  category: string;
  flags?: string[];
}

export class SuperClaudeCommands {
  private static commands: SuperClaudeCommand[] = [
    // Development Commands
    {
      name: 'build',
      description: 'Project builder with framework detection',
      usage: '[target] [--framework name] [--optimize]',
      category: 'Development',
      flags: ['--framework', '--optimize', '--watch', '--production']
    },
    {
      name: 'implement',
      description: 'Feature and code implementation',
      usage: '[description] [--type component|api|service] [--framework name]',
      category: 'Development',
      flags: ['--type', '--framework', '--test', '--dry-run']
    },
    {
      name: 'design',
      description: 'Design orchestration and system architecture',
      usage: '[domain] [--style component|system|api]',
      category: 'Development',
      flags: ['--style', '--framework', '--responsive', '--accessible']
    },

    // Analysis Commands
    {
      name: 'analyze',
      description: 'Multi-dimensional code and system analysis',
      usage: '[target] [--focus quality|security|performance|architecture]',
      category: 'Analysis',
      flags: ['--focus', '--depth', '--format', '--output']
    },
    {
      name: 'troubleshoot',
      description: 'Problem investigation and debugging',
      usage: '[symptoms] [--logs] [--trace]',
      category: 'Analysis',
      flags: ['--logs', '--trace', '--verbose', '--quick']
    },
    {
      name: 'explain',
      description: 'Educational explanations and documentation',
      usage: '[topic] [--detail level] [--examples]',
      category: 'Analysis',
      flags: ['--detail', '--examples', '--interactive', '--simple']
    },

    // Quality Commands
    {
      name: 'improve',
      description: 'Evidence-based code enhancement',
      usage: '[target] [--focus performance|quality|security]',
      category: 'Quality',
      flags: ['--focus', '--metrics', '--auto-fix', '--preview']
    },
    {
      name: 'cleanup',
      description: 'Project cleanup and technical debt reduction',
      usage: '[target] [--aggressive] [--safe]',
      category: 'Quality',
      flags: ['--aggressive', '--safe', '--preview', '--backup']
    },
    {
      name: 'test',
      description: 'Testing workflows and validation',
      usage: '[type] [--coverage] [--watch]',
      category: 'Quality',
      flags: ['--coverage', '--watch', '--parallel', '--verbose']
    },

    // Documentation Commands
    {
      name: 'document',
      description: 'Documentation generation and updates',
      usage: '[target] [--format markdown|html|api]',
      category: 'Documentation',
      flags: ['--format', '--output', '--include-examples', '--update']
    },

    // Workflow Commands
    {
      name: 'git',
      description: 'Git workflow assistant with enhanced commit messages',
      usage: '[operation] [--conventional] [--auto-push]',
      category: 'Workflow',
      flags: ['--conventional', '--auto-push', '--interactive', '--force']
    },
    {
      name: 'estimate',
      description: 'Evidence-based project estimation',
      usage: '[target] [--detail] [--breakdown]',
      category: 'Workflow',
      flags: ['--detail', '--breakdown', '--hours', '--story-points']
    },
    {
      name: 'task',
      description: 'Long-term project and task management',
      usage: '[operation] [--priority] [--assign]',
      category: 'Workflow',
      flags: ['--priority', '--assign', '--due-date', '--dependencies']
    },

    // Meta Commands
    {
      name: 'index',
      description: 'Command catalog browsing and discovery',
      usage: '[query] [--category] [--detailed]',
      category: 'Meta',
      flags: ['--category', '--detailed', '--search', '--recent']
    },
    {
      name: 'load',
      description: 'Project context loading and analysis',
      usage: '[path] [--deep] [--cache]',
      category: 'Meta',
      flags: ['--deep', '--cache', '--exclude', '--include']
    },
    {
      name: 'spawn',
      description: 'Task orchestration and parallel execution',
      usage: '[mode] [--parallel] [--sequence]',
      category: 'Meta',
      flags: ['--parallel', '--sequence', '--max-workers', '--timeout']
    }
  ];

  static getAll(): SuperClaudeCommand[] {
    return [...this.commands];
  }

  static getByCategory(category: string): SuperClaudeCommand[] {
    return this.commands.filter(cmd => cmd.category === category);
  }

  static getByName(name: string): SuperClaudeCommand | undefined {
    return this.commands.find(cmd => cmd.name === name);
  }

  static getCategories(): string[] {
    return [...new Set(this.commands.map(cmd => cmd.category))];
  }

  static generateHelpText(): string {
    const categories = this.getCategories();
    let help = 'Fluorite Commands (SuperClaude Wrapper)\n\n';
    
    for (const category of categories) {
      help += `${category} Commands:\n`;
      const cmds = this.getByCategory(category);
      for (const cmd of cmds) {
        help += `  /fl:${cmd.name.padEnd(12)} ${cmd.description}\n`;
      }
      help += '\n';
    }
    
    help += 'Usage: /fl:[command] [arguments] [flags]\n';
    help += 'Example: /fl:implement "create REST API" --framework fastapi\n\n';
    help += 'For detailed help: /fl:help [command]\n';
    
    return help;
  }
}