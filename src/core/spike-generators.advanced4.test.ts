import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('advanced specializations 4', () => {
  it('nextjs advanced config adds typed route and withRole helper', () => {
    const spec = generateSpike('gen-nextjs-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/typed/route.ts');
    expect(paths).toContain('src/next/withRole.ts');
  });

  it('prisma advanced service includes dto and sort helpers', () => {
    const spec = generateSpike('gen-prisma-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/prisma.dto.ts');
    expect(paths).toContain('src/prisma.sort.ts');
  });

  it('graphql client advanced includes updateCache, fragments and policies', () => {
    const spec = generateSpike('gen-graphql-client-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/graphql/updateCache.ts');
    expect(paths).toContain('src/graphql/fragments.ts');
    expect(paths).toContain('src/graphql/cachePolicies.ts');
  });

  it('next-auth advanced includes withRole HOC and admin page', () => {
    const spec = generateSpike('gen-next-auth-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/auth/withRole.tsx');
    expect(paths).toContain('app/(protected)/admin/page.tsx');
  });

  it('actions config advanced includes monorepo workflow', () => {
    const spec = generateSpike('gen-github-actions-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/monorepo.yml');
  });
});

