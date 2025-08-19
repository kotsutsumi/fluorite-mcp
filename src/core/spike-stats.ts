import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { DEFAULT_SPIKE_CONFIG, listSpikeIds } from './spike-catalog.js';
import { listGeneratedSpikeIds, isGeneratedId } from './spike-generators.js';

export interface SpikeStats {
  total: number;
  files_count: number;
  generated_count: number;
  duplicates: string[];
  sample: string[];
}

export async function getSpikeStats(): Promise<SpikeStats> {
  const all = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
  const gen = new Set(listGeneratedSpikeIds());
  const duplicates: string[] = [];
  const seen = new Set<string>();
  for (const id of all) {
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);
  }
  const generated_count = all.filter(isGeneratedId).length;

  // Count file-based spikes from directory
  const entries = await readdir(path.resolve(DEFAULT_SPIKE_CONFIG.baseDir));
  const files_count = entries.filter(f => f.endsWith('.json')).length;

  return {
    total: all.length,
    files_count,
    generated_count,
    duplicates,
    sample: all.slice(0, 20)
  };
}

