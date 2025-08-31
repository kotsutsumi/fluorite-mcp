import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('reactflow spikes', () => {
  it('creates Flow component for component pattern (ts)', () => {
    const spec = generateSpike('strike-reactflow-component-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/Flow.tsx')).toBe(true);
  });
  it('creates example entry using Flow (ts)', () => {
    const spec = generateSpike('strike-reactflow-example-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/flow/App.tsx')).toBe(true);
  });
  it('creates docs notes', () => {
    const spec = generateSpike('strike-reactflow-docs-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/flow/README.md')).toBe(true);
  });
  it('supports JS variant for component', () => {
    const spec = generateSpike('strike-reactflow-component-typed-js');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/components/Flow.jsx')).toBe(true);
  });
});

