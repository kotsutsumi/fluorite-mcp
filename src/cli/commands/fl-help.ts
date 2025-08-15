import { Command } from 'commander';
import { SuperClaudeCommands } from '../data/superclaude-commands.js';

export const flHelpCommand = new Command('fl-help')
  .description('Show help for fluorite /fl: commands')
  .argument('[command]', 'specific command to get help for')
  .action((commandName?: string) => {
    if (commandName) {
      const command = SuperClaudeCommands.getByName(commandName);
      if (command) {
        console.log(`\n/fl:${command.name}`);
        console.log(`Description: ${command.description}`);
        if (command.usage) {
          console.log(`Usage: /fl:${command.name} ${command.usage}`);
        }
        if (command.flags && command.flags.length > 0) {
          console.log(`Flags: ${command.flags.join(', ')}`);
        }
        console.log(`Category: ${command.category}`);
        console.log('\nThis command maps to SuperClaude with fluorite enhancements:');
        console.log('- Spike template integration');
        console.log('- Token optimization');
        console.log('- Natural language support');
      } else {
        console.log(`Command '/fl:${commandName}' not found.`);
        console.log('\nAvailable commands:');
        SuperClaudeCommands.getAll().forEach(cmd => {
          console.log(`  /fl:${cmd.name}`);
        });
      }
    } else {
      console.log(SuperClaudeCommands.generateHelpText());
    }
  });