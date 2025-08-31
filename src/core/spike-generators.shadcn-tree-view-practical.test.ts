import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('practical starters for TreeView', () => {
  it('adds react-window and dnd-kit starters in advanced component', () => {
    const spec = generateSpike('strike-shadcn-tree-view-component-advanced-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/VirtualizedTreeWindow.tsx')).toBe(true);
    expect(paths.has('src/components/DnDTreeKit.tsx')).toBe(true);
  });
  it('adds realtime abstraction adapter on adapter/service', () => {
    const spec = generateSpike('strike-shadcn-tree-view-adapter-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/treeview/realtime-adapter.ts')).toBe(true);
  });
});

