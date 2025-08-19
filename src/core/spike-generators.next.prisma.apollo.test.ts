import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('generator next/prisma/apollo specializations', () => {
  it('nextjs config/init includes middleware.ts', () => {
    const spec1 = generateSpike('gen-nextjs-config-basic-ts');
    const spec2 = generateSpike('gen-nextjs-init-basic-ts');
    const p1 = (spec1.files || []).map(f => f.path);
    const p2 = (spec2.files || []).map(f => f.path);
    expect(p1).toContain('middleware.ts');
    expect(p2).toContain('middleware.ts');
  });

  it('nextjs service includes server action', () => {
    const spec = generateSpike('gen-nextjs-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/actions/demo.ts');
  });

  it('prisma service includes transaction example', () => {
    const spec = generateSpike('gen-prisma-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/user.service.ts');
  });

  it('apollo service includes apollo server entry', () => {
    const spec = generateSpike('gen-apollo-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/apollo/server.ts');
  });

  it('apollo client includes apollo client init', () => {
    const spec = generateSpike('gen-apollo-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/apollo/client.ts');
  });
});

