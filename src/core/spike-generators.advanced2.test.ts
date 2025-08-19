import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('advanced specializations 2', () => {
  it('nextjs advanced route includes items with zod pagination', () => {
    const spec = generateSpike('gen-nextjs-route-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/items/route.ts');
  });

  it('prisma advanced service includes pagination helper', () => {
    const spec = generateSpike('gen-prisma-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/prisma.pagination.ts');
  });

  it('graphql advanced client includes mutation hook', () => {
    const spec = generateSpike('gen-graphql-client-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/graphql/useUpdateTitle.tsx');
  });

  it('next-auth advanced includes protected dashboard page', () => {
    const spec = generateSpike('gen-next-auth-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/(protected)/dashboard/page.tsx');
  });

  it('github actions advanced job adds e2e workflow', () => {
    const spec = generateSpike('gen-github-actions-job-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/e2e.yml');
  });
});

