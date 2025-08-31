import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('GraphQL endpoints', () => {
  it('adds Next.js graphql route', () => {
    const spec = generateSpike('strike-graphql-route-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('app/api/graphql/route.ts')).toBe(true);
  });
  it('adds Express graphql service server', () => {
    const spec = generateSpike('strike-graphql-service-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/graphql/express-server.ts')).toBe(true);
  });
});

describe('LINE Flex variants and RichMenu/LIFF share', () => {
  it('adds flex variants for example', () => {
    const spec = generateSpike('strike-line-example-typed-ts');
    const paths = new Set((spec.files || []).map(f => f.path));
    expect(paths.has('src/line/flex-variants.ts')).toBe(true);
  });
  it('adds richmenu config and liff share', () => {
    const cfg = generateSpike('strike-line-config-typed-ts');
    const prv = generateSpike('strike-line-provider-typed-ts');
    const cp = new Set((cfg.files || []).map(f => f.path));
    const pp = new Set((prv.files || []).map(f => f.path));
    expect(cp.has('src/line/richmenu.ts')).toBe(true);
    expect(pp.has('src/line/liff-share.ts')).toBe(true);
  });
});

