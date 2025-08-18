#!/usr/bin/env node
import { Command } from 'commander';
import { setupCommand } from './commands/setup.js';
import { versionCommand } from './commands/version.js';
import { flHelpCommand } from './commands/fl-help.js';
import { initCommand } from './commands/init.js';
import { getPackageVersion } from '../utils.js';
import { spikesCommand } from './commands/spikes.js';

const program = new Command();

program
  .name('fluorite-mcp')
  .description('SuperClaude wrapper with enhanced development workflows')
  .version(getPackageVersion());

// Register commands
program.addCommand(setupCommand);
program.addCommand(versionCommand);
program.addCommand(flHelpCommand);
program.addCommand(initCommand);
program.addCommand(spikesCommand);

// Parse command line arguments
program.parse();
