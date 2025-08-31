import { describe, it, expect } from 'vitest';
import { listGeneratedSpikeIdsFiltered } from './spike-generators.js';
import { filterIdsByPack } from './spike-packs.js';

describe('flow-tree-starter advanced patterns', () => {
  it('covers realtime/graphql/dnd/virtualize', () => {
    const ids = listGeneratedSpikeIdsFiltered({
      libs: ['reactflow','shadcn-tree-view'],
      patterns: ['realtime','graphql-server','graphql-client','dnd','virtualize'],
      styles: ['typed','advanced','testing'],
      langs: ['ts','js','py'],
      limit: 500
    });
    const filtered = filterIdsByPack(ids, 'flow-tree-starter');
    expect(filtered.length).toBeGreaterThan(0);
  });
});

