import * as path from 'path';
import * as os from 'os';

/**
 * Get Claude Code CLI configuration paths
 */
export class ClaudePaths {
  static get homeDir(): string {
    return os.homedir();
  }

  static get claudeDir(): string {
    return path.join(this.homeDir, '.claude');
  }

  static get fluoriteDir(): string {
    return path.join(this.claudeDir, 'fluorite');
  }

  static get commandsFile(): string {
    return path.join(this.claudeDir, 'COMMANDS.md');
  }

  static get flagsFile(): string {
    return path.join(this.claudeDir, 'FLAGS.md');
  }

  static get mcpFile(): string {
    return path.join(this.claudeDir, 'MCP.md');
  }

  static get fluoriteConfig(): string {
    return path.join(this.fluoriteDir, 'config.yaml');
  }

  static get fluoriteCommands(): string {
    return path.join(this.fluoriteDir, 'commands.md');
  }
}