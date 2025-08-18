import * as fs from 'fs/promises';
import * as path from 'path';

export interface SpikeSeedItem {
  id: string; // kebab-case unique id
  name?: string;
  version?: string;
  description?: string;
  stack?: string[];
  tags?: string[];
  params?: { name: string; required?: boolean; description?: string; default?: string }[];
  files?: { path: string; template?: string; content?: string }[];
  patches?: { path: string; diff: string }[];
}

export interface SpikeSeedFile {
  items: SpikeSeedItem[];
  defaultParams?: { [key: string]: string };
}

export interface GenerateOptions {
  outDir?: string; // defaults to src/spikes
  overwrite?: boolean; // default false
  prefix?: string; // optional prefix to add to ids
  dryRun?: boolean; // if true, only reports without writing
  mergeMetadata?: boolean; // if true, merge metadata into existing files when present
}

/**
 * Generate spike JSON files from a seed JSON file.
 */
export async function generateSpikesFromSeed(seedPath: string, options: GenerateOptions = {}): Promise<{ written: number; skipped: number; merged: number; outDir: string }>{
  const outDir = path.resolve(options.outDir || 'src/spikes');
  const raw = await fs.readFile(path.resolve(seedPath), 'utf8');
  const seed = JSON.parse(raw) as SpikeSeedFile;

  let written = 0;
  let skipped = 0;
  let merged = 0;

  await fs.mkdir(outDir, { recursive: true });

  for (const item of seed.items) {
    const id = (options.prefix ? `${options.prefix}-${item.id}` : item.id).toLowerCase();
    const filePath = path.join(outDir, `${id}.json`);

    // When file exists
    let existing: any | null = null;
    try {
      const cur = await fs.readFile(filePath, 'utf8');
      existing = JSON.parse(cur);
    } catch {}

    const spec = {
      id,
      name: item.name || id,
      version: item.version,
      description: item.description,
      stack: item.stack,
      tags: item.tags,
      params: item.params,
      files: item.files,
      patches: item.patches || []
    };

    if (existing && !options.overwrite) {
      if (options.mergeMetadata) {
        const mergedSpec = mergeSpikeMetadata(existing, spec);
        const changed = JSON.stringify(existing) !== JSON.stringify(mergedSpec);
        if (changed && !options.dryRun) {
          await fs.writeFile(filePath, JSON.stringify(mergedSpec, null, 2) + '\n', 'utf8');
        }
        merged++;
      } else {
        skipped++;
      }
      continue;
    }

    if (options.dryRun) {
      written++;
      continue;
    }

    await fs.writeFile(filePath, JSON.stringify(spec, null, 2) + '\n', 'utf8');
    written++;
  }

  return { written, skipped, merged, outDir };
}

function mergeSpikeMetadata(existing: any, incoming: any) {
  const out = { ...existing };
  // Prefer existing id/name/description if present; only fill gaps
  out.id = existing.id || incoming.id;
  out.name = existing.name || incoming.name;
  out.version = existing.version || incoming.version;
  out.description = existing.description || incoming.description;
  // Union arrays for stack/tags
  out.stack = unionArray(existing.stack, incoming.stack);
  out.tags = unionArray(existing.tags, incoming.tags);
  // Merge params by name (do not override existing definitions)
  out.params = mergeParams(existing.params, incoming.params);
  // Do not modify files/patches in metadata merge mode
  out.files = existing.files;
  out.patches = existing.patches;
  return out;
}

function unionArray(a?: any[], b?: any[]) {
  const set = new Set<string>();
  (a || []).forEach(v => set.add(String(v)));
  (b || []).forEach(v => set.add(String(v)));
  return Array.from(set);
}

function mergeParams(a?: any[], b?: any[]) {
  const byName: Record<string, any> = {};
  (a || []).forEach(p => { if (p && p.name) byName[p.name] = p; });
  (b || []).forEach(p => { if (p && p.name && !byName[p.name]) byName[p.name] = p; });
  return Object.values(byName);
}
