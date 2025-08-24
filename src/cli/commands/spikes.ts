import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs/promises';
import { generateSpikesFromSeed } from '../utils/spike-generator.js';
import { listSpikeIds, loadSpike } from '../../core/spike-catalog.js';

export const spikesCommand = new Command('spikes')
  .description('Spike template utilities')
  .addCommand(
    new Command('generate')
      .description('Generate spike templates from a seed JSON file')
      .argument('<seed>', 'Path to seed JSON (see src/cli/data/spike-seed.json)')
      .option('-o, --out-dir <outDir>', 'Output directory', 'src/spikes')
      .option('--prefix <prefix>', 'Optional prefix added to spike ids')
      .option('--overwrite', 'Overwrite existing files')
      .option('--dry-run', 'Preview files without writing')
      .option('--merge-metadata', 'Merge metadata into existing spikes when present')
      .action(async (seed: string, options) => {
        const seedPath = path.resolve(seed);
        const { written, skipped, merged, outDir } = await generateSpikesFromSeed(seedPath, {
          outDir: options.outDir,
          overwrite: Boolean(options.overwrite),
          prefix: options.prefix,
          dryRun: Boolean(options.dryRun),
          mergeMetadata: Boolean(options.mergeMetadata)
        });
        console.log(`Spikes ${options.dryRun ? 'previewed' : 'generated'}: written=${written}, merged=${merged}, skipped=${skipped}, outDir=${outDir}`);
      })
  );

// Synthesize generated spikes (e.g., strike-*) to list or files
spikesCommand.addCommand(
  new Command('synth')
    .description('List or materialize generated spikes (e.g., strike-*)')
    .option('-f, --filter <regex>', 'ID filter (regex)', '^strike-')
    .option('-m, --max <n>', 'Max items to process', (v)=>parseInt(v,10), 2000)
    .option('-o, --out-dir <outDir>', 'Output directory when --write is set', 'src/spikes')
    .option('--write', 'Write JSON files instead of listing')
    .option('--pretty', 'Pretty-print JSON when writing')
    .option('--overwrite', 'Overwrite if file exists (default: skip)')
    .action(async (opts) => {
      const filter = String(opts.filter || '');
      const max = Number.isFinite(opts.max) ? Number(opts.max) : 2000;
      const ids = await listSpikeIds(filter);
      const selected = ids.slice(0, max);

      if (!opts.write) {
        console.log(`Matched ${ids.length} (showing first ${selected.length}) by /${filter}/`);
        selected.forEach((id) => console.log(id));
        return;
      }

      const outDir = path.resolve(opts.outDir || 'src/spikes');
      await fs.mkdir(outDir, { recursive: true });
      let written = 0;
      let skipped = 0;
      let overwritten = 0;
      for (const id of selected) {
        const spec = await loadSpike(id);
        const file = path.join(outDir, `${id}.json`);
        let exists = false;
        try { await fs.access(file); exists = true; } catch {}
        if (exists && !opts.overwrite) { skipped++; continue; }
        const data = opts.pretty ? JSON.stringify(spec, null, 2) + '\n' : JSON.stringify(spec);
        await fs.writeFile(file, data, 'utf8');
        if (exists) overwritten++; else written++;
      }
      console.log(`Materialized: written=${written}, overwritten=${overwritten}, skipped=${skipped}, outDir=${outDir}`);
    })
);
