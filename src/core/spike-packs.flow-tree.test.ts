import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIdsFiltered } from './spike-generators.js';
import { filterIdsByPack } from './spike-packs.js';

describe('flow-tree-starter pack', () => {
  it('selects reactflow and shadcn-tree-view combos', () => {
    const ids = listGeneratedSpikeIdsFiltered({
      libs: ['reactflow','shadcn-tree-view'],
      patterns: ['component','route','schema','adapter','example','docs'],
      styles: ['typed','advanced','testing'],
      langs: ['ts','py','js'],
      limit: 200
    });
    const filtered = filterIdsByPack(ids, 'flow-tree-starter');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some(id => id.includes('reactflow'))).toBe(true);
    expect(filtered.some(id => id.includes('shadcn-tree-view'))).toBe(true);
  });
});

