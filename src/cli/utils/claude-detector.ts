import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ClaudePaths } from './paths.js';

const execAsync = promisify(exec);

export interface ClaudeInstallation {
  installed: boolean;
  version?: string;
  configExists: boolean;
  mcpSupported: boolean;
}

/**
 * Detect Claude Code CLI installation and configuration
 */
export class ClaudeDetector {
  static async detect(): Promise<ClaudeInstallation> {
    const result: ClaudeInstallation = {
      installed: false,
      configExists: false,
      mcpSupported: false
    };

    try {
      // Check if claude command is available
      const { stdout } = await execAsync('claude --version');
      result.installed = true;
      result.version = stdout.trim();

      // Check if configuration directory exists
      try {
        await fs.access(ClaudePaths.claudeDir);
        result.configExists = true;
      } catch {
        result.configExists = false;
      }

      // Check if MCP is supported (look for mcp command)
      try {
        await execAsync('claude mcp --help');
        result.mcpSupported = true;
      } catch {
        result.mcpSupported = false;
      }

    } catch (error) {
      result.installed = false;
    }

    return result;
  }

  static async ensureClaudeConfig(): Promise<void> {
    try {
      await fs.mkdir(ClaudePaths.claudeDir, { recursive: true });
      await fs.mkdir(ClaudePaths.fluoriteDir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create Claude config directory: ${error}`);
    }
  }
}