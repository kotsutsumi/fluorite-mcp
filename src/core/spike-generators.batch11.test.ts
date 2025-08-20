import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch11: OpenAPI server, Otel stubs, Next security, Relay/URQL/Yoga, CI deploy', () => {
  it('openapi service adds express server serving openapi.yaml', () => {
    const spec = generateSpike('gen-openapi-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('openapi.yaml');
    expect(paths).toContain('src/openapi/server.ts');
  });

  it('fastify advanced adds otel stub', () => {
    const spec = generateSpike('gen-fastify-service-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/otel/fastify.ts');
  });

  it('nextjs advanced adds security headers helper', () => {
    const spec = generateSpike('gen-nextjs-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/next/security-headers.ts');
  });

  it('drizzle advanced adds CI migrate workflow', () => {
    const spec = generateSpike('gen-drizzle-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/drizzle-migrate.yml');
  });

  it('knex advanced adds CI migrate workflow', () => {
    const spec = generateSpike('gen-knex-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/knex-migrate.yml');
  });

  it('docker advanced adds cloud run deploy workflow', () => {
    const spec = generateSpike('gen-docker-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.github/workflows/cloudrun-deploy.yml');
  });

  it('relay client adds environment', () => {
    const spec = generateSpike('gen-relay-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/relay/environment.ts');
  });

  it('urql client adds client config', () => {
    const spec = generateSpike('gen-urql-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/urql/client.ts');
  });

  it('graphql-yoga service adds server', () => {
    const spec = generateSpike('gen-graphql-yoga-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/graphql/yoga.ts');
  });
});

