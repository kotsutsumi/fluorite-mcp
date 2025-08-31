import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('treeview graphql server stubs', () => {
  it('adds graphql schema/resolvers for TS service/schema', () => {
    const s1 = generateSpike('strike-shadcn-tree-view-service-typed-ts');
    const s2 = generateSpike('strike-shadcn-tree-view-schema-typed-ts');
    const p1 = new Set((s1.files || []).map(f => f.path));
    const p2 = new Set((s2.files || []).map(f => f.path));
    expect(p1.has('src/treeview/graphql-schema.ts') || p2.has('src/treeview/graphql-schema.ts')).toBe(true);
    expect(p1.has('src/treeview/graphql-resolvers.ts') || p2.has('src/treeview/graphql-resolvers.ts')).toBe(true);
  });
  it('adds Ably realtime placeholder', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/realtime-ably.ts')).toBe(true);
  });
});

