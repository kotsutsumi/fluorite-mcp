import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

const DESCRIPTIONS: Record<string, string> = {
  'short-aliases.md': 'Short aliases and recipes',
  'file-structure-samples.md': 'Typical files by alias',
  'diff-samples.md': 'Minimal diffs for common spikes',
  'post-apply-checklists.md': 'What to verify after applying',
  'verification-examples.md': 'CLI/Dashboard commands to test',
  'queue-snippets.md': 'Retry/DLQ/shutdown snippets',
  'search-index-tips.md': 'Meilisearch/Typesense index tips',
  'recipes.md': 'Integrated recipes (prompt → files → diff → verify)',
  'one-pagers.md': 'One-page guides for representative aliases',
  'monitoring-alerts.md': 'Minimum viable monitoring & alert thresholds'
};

export const docsCommand = new Command('docs')
  .description('List Fluorite documentation resources')
  .option('-s, --show <name>', 'Show full path for a specific doc')
  .option('-c, --cat <name>', 'Print a specific doc to stdout')
  .option('-f, --filter <term>', 'Filter docs by filename or description')
  .option('-o, --open <name>', 'Open a specific doc via OS default handler')
  .action(async (opts) => {
    const docsDir = path.resolve('docs');
    try {
      const files = await fs.readdir(docsDir);
      let md = files.filter((f) => f.endsWith('.md')).sort();
      if (opts.filter) {
        const q = String(opts.filter).toLowerCase();
        md = md.filter((f) => f.toLowerCase().includes(q) || (DESCRIPTIONS[f] || '').toLowerCase().includes(q));
      }
      if (opts.cat) {
        const name = String(opts.cat).trim();
        const file = path.join(docsDir, name);
        try {
          const stat = await fs.stat(file);
          if (stat.isFile()) {
            const content = await fs.readFile(file, 'utf8');
            process.stdout.write(content);
            return;
          }
        } catch {}
        console.error(`Document not found: ${name}`);
        process.exit(1);
      }
      if (opts.show) {
        const name = String(opts.show).trim();
        const file = path.join(docsDir, name);
        try {
          const stat = await fs.stat(file);
          if (stat.isFile()) {
            console.log(`${name}: ${file}`);
            return;
          }
        } catch {}
        console.log(`Document not found: ${name}`);
        return;
      }
      if (opts.open) {
        const name = String(opts.open).trim();
        const file = path.join(docsDir, name);
        try {
          const stat = await fs.stat(file);
          if (!stat.isFile()) throw new Error('Not a file');
          const platform = process.platform;
          let cmd: string;
          let args: string[] = [];
          if (platform === 'darwin') {
            cmd = 'open';
            args = [file];
          } else if (platform === 'win32') {
            cmd = 'cmd';
            args = ['/c', 'start', '""', file];
          } else {
            cmd = 'xdg-open';
            args = [file];
          }
          const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
          child.unref();
          console.log(`Opening ${file} ...`);
          return;
        } catch {
          console.error(`Document not found or cannot open: ${name}`);
          process.exit(1);
        }
      }
      console.log('Fluorite Docs:');
      for (const f of md) {
        const desc = DESCRIPTIONS[f] || '';
        console.log(`- ${f}${desc ? ` — ${desc}` : ''}`);
      }
      console.log('\nTips:');
      console.log('- Print absolute path: `fluorite docs --show <name>`');
      console.log('- Print file content: `fluorite docs --cat <name>`');
      console.log('- Open in default app: `fluorite docs --open <name>`');
      if (opts.filter) {
        console.log(`\nFilter applied: ${opts.filter}`);
      }
    } catch (e) {
      console.error(`Failed to list docs: ${(e as Error).message}`);
      process.exit(1);
    }
  });
