import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('shadcn-tree-view graphql/realtime adapters', () => {
  it('adds GraphQL save/load helpers', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/graphql.ts')).toBe(true);
  });
  it('adds realtime socket.io placeholder', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-js');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/realtime.js')).toBe(true);
  });
});

