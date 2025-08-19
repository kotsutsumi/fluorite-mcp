import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('generator nextjs/next-auth/prisma/graphql/apollo advanced cases', () => {
  it('nextjs client pattern includes client component page', () => {
    const spec = generateSpike('gen-nextjs-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/client-demo/page.tsx');
  });

  it('nextjs route includes zod echo route', () => {
    const spec = generateSpike('gen-nextjs-route-typed-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/echo/route.ts');
  });

  it('next-auth config includes middleware for protection', () => {
    const spec = generateSpike('gen-next-auth-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('middleware.ts');
  });

  it('prisma advanced crud has relation schema and post.service', () => {
    const spec = generateSpike('gen-prisma-crud-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    const schema = (spec.files || []).find(f => f.path === 'prisma/schema.prisma')?.template || '';
    expect(schema).toMatch(/model Post/);
    expect(paths).toContain('src/post.service.ts');
  });

  it('graphql advanced includes codegen.yml', () => {
    const spec = generateSpike('gen-graphql-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('codegen.yml');
  });

  it('apollo advanced includes federation and subscriptions', () => {
    const spec = generateSpike('gen-apollo-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/apollo/federation.ts');
    expect(paths).toContain('src/apollo/subscriptions.ts');
  });
});

