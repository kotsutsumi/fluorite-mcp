import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('generator specializations', () => {
  it('nextjs route generates Next.js route handler path', () => {
    const spec = generateSpike('gen-nextjs-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/health/route.ts');
  });

  it('prisma crud includes prisma schema and client', () => {
    const spec = generateSpike('gen-prisma-crud-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/prisma.ts');
    expect(paths).toContain('prisma/schema.prisma');
  });

  it('graphql service includes schema and resolvers', () => {
    const spec = generateSpike('gen-graphql-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('schema.graphql');
    expect(paths).toContain('src/graphql/resolvers.ts');
  });

  it('next-auth config includes route handler', () => {
    const spec = generateSpike('gen-next-auth-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/auth/[...nextauth]/route.ts');
  });

  it('github-actions init includes ci workflow', () => {
    const spec = generateSpike('gen-github-actions-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/ci.yml');
  });
});

