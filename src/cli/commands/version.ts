import { Command } from 'commander';
import { getPackageVersion } from '../../utils.js';

export const versionCommand = new Command('version')
  .description('Show fluorite-mcp version')
  .action(() => {
    console.log(`fluorite-mcp v${getPackageVersion()}`);
  });