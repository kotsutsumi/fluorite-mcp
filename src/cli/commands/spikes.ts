import { Command } from 'commander';
import * as path from 'path';
import { generateSpikesFromSeed } from '../utils/spike-generator.js';

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
