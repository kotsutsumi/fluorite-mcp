#!/usr/bin/env tsx
/**
 * Minimal spike generator to scale spike creation.
 * Usage: tsx scripts/generate-spikes.ts <id> <name> <stackCsv> <tagsCsv> <description>
 * Creates src/spikes/<id>.json with a stub SpikeSpec.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

function toArr(s?: string) {
  return (s || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

async function main() {
  const [id, name, stackCsv, tagsCsv, ...descParts] = process.argv.slice(2);
  if (!id || !name) {
    console.error('Usage: tsx scripts/generate-spikes.ts <id> <name> <stackCsv> <tagsCsv> <description>');
    process.exit(1);
  }
  const desc = descParts.join(' ') || '';
  const spec = {
    id,
    name,
    version: '1.0.0',
    stack: toArr(stackCsv),
    tags: toArr(tagsCsv),
    description: desc,
    params: [
      { name: 'app_name', default: id },
    ],
    files: [
      { path: `{{app_name}}/README.md`, template: `# ${name}\n\n${desc}\n` }
    ],
    patches: []
  } as const;

  const file = path.resolve('src/spikes', `${id}.json`);
  await writeFile(file, JSON.stringify(spec, null, 2) + '\n', 'utf-8');
  console.log('Created', file);
}

main().catch((e) => { console.error(e); process.exit(1); });
