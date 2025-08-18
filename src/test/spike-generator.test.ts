import { describe, it, expect } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateSpikesFromSeed } from '../cli/utils/spike-generator.js';

describe('spike-generator', () => {
  it('generates spikes from seed into custom directory', async () => {
    const seed = path.resolve('src/cli/data/spike-seed.json');
    const outDir = path.resolve('src/test/.tmp/spikes-gen');
    await fs.mkdir(outDir, { recursive: true });

    const result = await generateSpikesFromSeed(seed, { outDir, overwrite: true, prefix: 'test' });
    expect(result.written).toBeGreaterThan(0);

    const oneFile = path.join(outDir, 'test-strike-express-route-minimal.json');
    const stat = await fs.stat(oneFile);
    expect(stat.isFile()).toBe(true);
  });

  it('merges metadata into existing spike without overwriting files', async () => {
    const outDir = path.resolve('src/test/.tmp/spikes-merge');
    await fs.mkdir(outDir, { recursive: true });

    // Create existing spike file
    const id = 'demo-spike';
    const filePath = path.join(outDir, `${id}.json`);
    const existing = {
      id,
      name: 'Demo Spike',
      stack: ['node'],
      tags: ['demo'],
      params: [{ name: 'x' }],
      files: [{ path: 'index.js', template: "console.log('hi')" }],
      patches: []
    };
    await fs.writeFile(filePath, JSON.stringify(existing, null, 2));

    // Create seed file that adds new tags/stack/params
    const seedPath = path.join(outDir, 'seed.json');
    const seed = {
      items: [
        {
          id,
          stack: ['express'],
          tags: ['demo', 'example'],
          params: [{ name: 'y' }],
          files: [{ path: 'ignored.js', template: 'ignored' }]
        }
      ]
    };
    await fs.writeFile(seedPath, JSON.stringify(seed));

    const res = await generateSpikesFromSeed(seedPath, { outDir, mergeMetadata: true });
    expect(res.merged).toBe(1);

    const after = JSON.parse(await fs.readFile(filePath, 'utf8'));
    expect(new Set(after.stack)).toEqual(new Set(['node', 'express']));
    expect(new Set(after.tags)).toEqual(new Set(['demo', 'example']));
    expect(after.params.find((p: any) => p.name === 'x')).toBeTruthy();
    expect(after.params.find((p: any) => p.name === 'y')).toBeTruthy();
    // files unchanged
    expect(after.files.length).toBe(1);
  });
});
