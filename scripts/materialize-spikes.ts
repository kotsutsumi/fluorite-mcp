#!/usr/bin/env tsx
/*
  Materialize generated spike templates into physical JSON files under src/spikes/.

  Usage examples:
    - tsx scripts/materialize-spikes.ts --limit 200
    - tsx scripts/materialize-spikes.ts --libs nextjs,fastapi --patterns route,service --styles typed,secure --langs ts,py --limit 500 --prefix strike

  Notes:
    - 既存ファイルは上書きしません（安全に追記）。
    - 大量生成時は --limit を使って段階的にマテリアライズしてください。
*/

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

import { listGeneratedSpikeIdsFiltered, generateSpike } from '../src/core/spike-generators.js';

type Opts = {
  libs?: string[];
  patterns?: string[];
  styles?: string[];
  langs?: string[];
  limit?: number;
  outDir?: string;
  prefix?: string; // 'strike'|'gen'|'any' or arbitrary (e.g., 'gen3-')
};

function parseArgs(argv: string[]): Opts {
  const opts: Opts = { outDir: 'src/spikes', prefix: 'strike' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => (i + 1 < argv.length ? argv[++i] : undefined);
    if (a === '--libs') opts.libs = (next() || '').split(',').filter(Boolean);
    else if (a === '--patterns') opts.patterns = (next() || '').split(',').filter(Boolean);
    else if (a === '--styles') opts.styles = (next() || '').split(',').filter(Boolean);
    else if (a === '--langs') opts.langs = (next() || '').split(',').filter(Boolean);
    else if (a === '--limit') opts.limit = Math.max(1, parseInt(next() || '0', 10));
    else if (a === '--out') opts.outDir = next() || 'src/spikes';
    else if (a === '--prefix') {
      const p = (next() || 'strike').toLowerCase();
      opts.prefix = (p === 'gen' ? 'gen' : p === 'any' ? 'any' : 'strike');
    }
  }
  return opts;
}

async function ensureDir(dir: string) {
  try { await access(dir, constants.F_OK); } catch { await mkdir(dir, { recursive: true }); }
}

async function exists(file: string): Promise<boolean> {
  try { await access(file, constants.F_OK); return true; } catch { return false; }
}

async function main() {
  const opts = parseArgs(process.argv);
  const outDir = path.resolve(opts.outDir || 'src/spikes');
  await ensureDir(outDir);

  const ids = listGeneratedSpikeIdsFiltered({
    libs: opts.libs,
    patterns: opts.patterns,
    styles: opts.styles,
    langs: opts.langs,
    limit: opts.limit && opts.limit > 0 ? opts.limit : undefined
  });

  if (!ids.length) {
    console.log('No ids selected with given filters.');
    process.exit(0);
  }

  console.log(`Selected ${ids.length} ids. Writing to ${outDir}`);
  let created = 0, skipped = 0;
  for (const id of ids) {
    const spec = generateSpike(id);
    const needsCustomPrefix = opts.prefix && !['strike','gen','any'].includes(String(opts.prefix));
    const effectiveId = needsCustomPrefix ? `${opts.prefix}${id}` : id;
    if (needsCustomPrefix) { (spec as any).id = effectiveId; }
    const file = path.join(outDir, `${effectiveId}.json`);
    if (await exists(file)) { skipped++; continue; }
    await writeFile(file, JSON.stringify(spec, null, 2), 'utf-8');
    created++;
  }

  console.log(`Done. created=${created}, skipped=${skipped}, dir=${outDir}`);
}

main().catch((e) => {
  console.error('materialize-spikes failed:', e?.message || e);
  process.exit(1);
});
