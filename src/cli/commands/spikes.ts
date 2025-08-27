import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs/promises';
import { generateSpikesFromSeed } from '../utils/spike-generator.js';
import { listSpikeIds, loadSpike } from '../../core/spike-catalog.js';
import { listPacks, filterIdsByPack } from '../../core/spike-packs.js';
import { isGeneratedId } from '../../core/spike-generators.js';

// Helper: when a pack is provided and generated-only is true, prefer filtered generated IDs
async function getIdsForPackOrAll(filter: string, opts: any): Promise<string[]> {
  const ids = await listSpikeIds(filter);
  let pool = opts.generatedOnly ? ids.filter((id) => isGeneratedId(id)) : ids;
  if (!opts.pack) return pool;
  // Try optimized path: generate only matching combos using pack definition
  try {
    const { SPIKE_PACKS } = await import('../../core/spike-packs.js');
    const { listGeneratedSpikeIdsFiltered } = await import('../../core/spike-generators.js');
    const def = (SPIKE_PACKS as any)[String(opts.pack)];
    if (def && def.include && opts.generatedOnly) {
      const combos = listGeneratedSpikeIdsFiltered({
        libs: def.include.libs,
        patterns: def.include.patterns,
        styles: def.include.styles,
        langs: def.include.langs,
        limit: opts.max && Number.isFinite(opts.max) ? Number(opts.max) * 10 : undefined // fetch a bit more
      });
      // Optionally merge with physical ids already present that match regex filter
      pool = combos;
      return pool;
    }
  } catch {}
  // Fallback to pack filter on the general list
  return filterIdsByPack(pool, String(opts.pack));
}
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
    .option('-s, --skip <n>', 'Skip first N items before processing', (v)=>parseInt(v,10), 0)
    .option('-o, --out-dir <outDir>', 'Output directory when --write is set', 'src/spikes')
    .option('--write', 'Write JSON files instead of listing')
    .option('--pack <name>', 'Filter by predefined Strike Pack (e.g., nextjs-secure, payments)')
    .option('--pretty', 'Pretty-print JSON when writing')
    .option('--overwrite', 'Overwrite if file exists (default: skip)')
    .option('--prefix <prefix>', 'Optional prefix added to spike ids when writing (avoids collisions)')
    .option('--generated-only', 'Process only virtual/generated spikes (e.g., strike-*, gen-*)')
    .option('--nonexistent-only', 'Exclude IDs that already have a physical file')
    .action(async (opts) => {
      const filter = String(opts.filter || '');
      const max = Number.isFinite(opts.max) ? Number(opts.max) : 2000;
      const skip = Number.isFinite(opts.skip) ? Number(opts.skip) : 0;
      const ids = await getIdsForPackOrAll(filter, opts);

      // Optional narrowing to generated-only
      let pool = opts.generatedOnly ? ids.filter((id) => isGeneratedId(id)) : ids;
      if (opts.pack) {
        pool = filterIdsByPack(pool, String(opts.pack));
      }

      // Optionally exclude IDs that already exist on disk
      const poolFiltered: string[] = [];
      if (opts.nonexistentOnly) {
        const fs = await import('fs/promises');
        const path = await import('path');
        for (const id of pool) {
          const file = path.resolve(opts.outDir || 'src/spikes', `${id}.json`);
          try { await fs.access(file); /* exists */ }
          catch { poolFiltered.push(id); }
        }
      }
      const effective = opts.nonexistentOnly ? poolFiltered : pool;
      const selected = effective.slice(skip, skip + max);

      if (!opts.write) {
        console.log(`Matched ${ids.length} (effective ${effective.length}); showing ${selected.length} from offset ${skip} by /${filter}/`);
        selected.forEach((id) => console.log(id));
        return;
      }

      const outDir = path.resolve(opts.outDir || 'src/spikes');
      await fs.mkdir(outDir, { recursive: true });
      let written = 0;
      let skipped = 0;
      let overwritten = 0;
      let failed = 0;
      for (const id of selected) {
        try {
          const spec = await loadSpike(id);
          const file = path.join(outDir, `${id}.json`);
          let exists = false;
          try { await fs.access(file); exists = true; } catch {}
          if (exists && !opts.overwrite) { skipped++; continue; }
          const data = opts.pretty ? JSON.stringify(spec, null, 2) + '\n' : JSON.stringify(spec);
          await fs.writeFile(file, data, 'utf8');
          if (exists) overwritten++; else written++;
        } catch (e) {
          failed++;
          // Continue processing next items instead of aborting the entire run
        }
      }
      console.log(`Materialized: written=${written}, overwritten=${overwritten}, skipped=${skipped}, failed=${failed}, outDir=${outDir}`);
    })
);

// Incremental synthesizer with persisted progress (avoids re-scanning from start)
spikesCommand.addCommand(
  new Command('synth-next')
    .description('Incrementally materialize generated spikes using a persisted progress state')
    .option('-f, --filter <regex>', 'ID filter (regex)', '^strike-')
    .option('-m, --max <n>', 'Max items to write this run', (v)=>parseInt(v,10), 50)
    .option('-o, --out-dir <outDir>', 'Output directory', 'src/spikes')
    .option('--state-file <file>', 'Progress state file', 'src/cli/data/synth-state.json')
    .option('--generated-only', 'Process only virtual/generated spikes (e.g., strike-*, gen-*)')
    .option('--pretty', 'Pretty-print JSON when writing')
    .option('--pack <name>', 'Filter by predefined Strike Pack (e.g., nextjs-secure, payments)')
    .action(async (opts) => {
      const filter = String(opts.filter || '');
      const max = Number.isFinite(opts.max) ? Number(opts.max) : 50;
      const outDir = path.resolve(opts.outDir || 'src/spikes');
      const stateFile = path.resolve(opts.stateFile || 'src/cli/data/synth-state.json');
      await fs.mkdir(path.dirname(stateFile), { recursive: true });
      await fs.mkdir(outDir, { recursive: true });

      // Load previous state if exists
      let state: { startIndex: number } = { startIndex: 0 };
      try {
        const raw = await fs.readFile(stateFile, 'utf8');
        const json = JSON.parse(raw);
        if (typeof json?.startIndex === 'number') state.startIndex = json.startIndex;
      } catch {}

      const ids = await getIdsForPackOrAll(filter, opts);
      let pool = ids;

      let start = Math.max(0, Math.min(state.startIndex || 0, pool.length));
      const selected: string[] = [];
      const exists = await import('fs/promises');

      // Collect up to `max` nonexistent items from current start index, advance start as we scan
      for (let i = start; i < pool.length && selected.length < max; i++) {
        const id = pool[i];
        const file = path.join(outDir, `${id}.json`);
        try { await exists.access(file); /* present */ }
        catch { selected.push(id); }
        start = i + 1;
      }

      if (selected.length === 0) {
        console.log(`No new spikes to materialize (startIndex=${state.startIndex}, pool=${pool.length}).`);
        // Still advance a little to prevent infinite loop on fully populated window
        await fs.writeFile(stateFile, JSON.stringify({ startIndex: start }, null, 2) + '\n', 'utf8');
        return;
      }

      let written = 0; let failed = 0; let overwritten = 0; let skipped = 0;
      for (const id of selected) {
        try {
          const spec = await loadSpike(id);
          const file = path.join(outDir, `${id}.json`);
          let existsFlag = false;
          try { await exists.access(file); existsFlag = true; } catch {}
          if (existsFlag) { skipped++; continue; }
          const data = opts.pretty ? JSON.stringify(spec, null, 2) + '\n' : JSON.stringify(spec);
          await fs.writeFile(file, data, 'utf8');
          if (existsFlag) overwritten++; else written++;
        } catch { failed++; }
      }

      // Persist next start index for subsequent runs
      await fs.writeFile(stateFile, JSON.stringify({ startIndex: start }, null, 2) + '\n', 'utf8');
      console.log(`Materialized(next): written=${written}, overwritten=${overwritten}, skipped=${skipped}, failed=${failed}, startIndex=${start}, outDir=${outDir}`);
    })
);

// Bulk synthesizer to write many generated spikes in batches repeatedly
spikesCommand.addCommand(
  new Command('synth-bulk')
    .description('Materialize many generated spikes in repeated batches using a persisted progress state')
    .option('-f, --filter <regex>', 'ID filter (regex)', '^strike-')
    .option('-t, --total <n>', 'Total number of items to write this run', (v)=>parseInt(v,10), 1000)
    .option('-b, --batch <n>', 'Batch size per iteration', (v)=>parseInt(v,10), 100)
    .option('-o, --out-dir <outDir>', 'Output directory', 'src/spikes')
    .option('--state-file <file>', 'Progress state file', 'src/cli/data/synth-state.json')
    .option('--generated-only', 'Process only virtual/generated spikes (e.g., strike-*, gen-*)')
    .option('--pretty', 'Pretty-print JSON when writing')
    .option('--overwrite', 'Overwrite if file exists (default: skip)')
    .option('--start-index <n>', 'Override start index (advanced)', (v)=>parseInt(v,10))
    .option('--dry-run', 'Preview what would be written without writing files')
    .option('--pack <name>', 'Filter by predefined Strike Pack (e.g., nextjs-secure, payments)')
    .action(async (opts) => {
      const filter = String(opts.filter || '');
      const total = Number.isFinite(opts.total) ? Number(opts.total) : 1000;
      const batch = Number.isFinite(opts.batch) ? Math.max(1, Number(opts.batch)) : 100;
      const outDir = path.resolve(opts.outDir || 'src/spikes');
      const stateFile = path.resolve(opts.stateFile || 'src/cli/data/synth-state.json');
      await fs.mkdir(path.dirname(stateFile), { recursive: true });
      await fs.mkdir(outDir, { recursive: true });

      // Load previous state if exists
      let state: { startIndex: number } = { startIndex: 0 };
      try {
        const raw = await fs.readFile(stateFile, 'utf8');
        const json = JSON.parse(raw);
        if (typeof json?.startIndex === 'number') state.startIndex = json.startIndex;
      } catch {}
      if (Number.isFinite(opts.startIndex)) {
        state.startIndex = Math.max(0, Number(opts.startIndex));
      }

      let writtenTotal = 0; let failedTotal = 0; let skippedTotal = 0; let overwrittenTotal = 0;
      let iterations = 0;
      for (; writtenTotal < total; iterations++) {
      const ids = await getIdsForPackOrAll(filter, opts);
      let pool = ids;
        if (pool.length === 0) {
          console.log(`No spikes matched filter '${filter}'.`);
          break;
        }

        let start = Math.max(0, Math.min(state.startIndex || 0, pool.length));
        const selected: string[] = [];
        const exists = await import('fs/promises');

        for (let i = start; i < pool.length && selected.length < batch; i++) {
          const id = pool[i];
          const file = path.join(outDir, `${id}.json`);
          try { await exists.access(file); /* present */ }
          catch { selected.push(id); }
          start = i + 1;
        }

        if (selected.length === 0) {
          // If we wrapped around and found nothing new, break
          if (start >= pool.length) start = 0;
          // Persist and stop to avoid infinite loop
          await fs.writeFile(stateFile, JSON.stringify({ startIndex: start }, null, 2) + '\n', 'utf8');
          console.log(`No new spikes to materialize in this window (startIndex=${state.startIndex}, pool=${pool.length}).`);
          break;
        }

        let written = 0; let failed = 0; let overwritten = 0; let skipped = 0;
        if (opts.dryRun) {
          console.log(`[dry-run] Would write ${selected.length} items to ${outDir} (from index ${state.startIndex})`);
          console.log(selected.join('\n'));
        } else {
          for (const id of selected) {
            try {
              const spec = await loadSpike(id);
              const effectiveId = opts.prefix ? `${opts.prefix}${id}` : id;
              if (opts.prefix) {
                // clone with new id to avoid collision
                (spec as any).id = effectiveId;
              }
              const file = path.join(outDir, `${effectiveId}.json`);
              let existsFlag = false;
              try { await exists.access(file); existsFlag = true; } catch {}
              if (existsFlag && !opts.overwrite) { skipped++; continue; }
              const data = opts.pretty ? JSON.stringify(spec, null, 2) + '\n' : JSON.stringify(spec);
              await fs.writeFile(file, data, 'utf8');
              if (existsFlag) overwritten++; else written++;
            } catch { failed++; }
          }
        }

        // Accumulate totals
        writtenTotal += written; failedTotal += failed; skippedTotal += skipped; overwrittenTotal += overwritten;
        // Persist next start index (always persist to advance window, even in dry-run)
        state.startIndex = start;
        await fs.writeFile(stateFile, JSON.stringify({ startIndex: start }, null, 2) + '\n', 'utf8');
        console.log(`Batch #${iterations+1}: ${opts.dryRun ? '[dry-run] ' : ''}written=${written}, overwritten=${overwritten}, skipped=${skipped}, failed=${failed}, startIndex=${start}`);
        if (writtenTotal >= total) break;
      }

      console.log(`Bulk materialized total: written=${writtenTotal}, overwritten=${overwrittenTotal}, skipped=${skippedTotal}, failed=${failedTotal}, iterations=${iterations}`);
    })
);

// Packs helper commands
spikesCommand.addCommand(
  new Command('packs')
    .description('List available Strike Packs')
    .action(() => {
      const packs = listPacks();
      console.log(`Available packs: ${packs.length}`);
      for (const p of packs) {
        console.log(`- ${p.key}: ${p.description}`);
      }
    })
);
