import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch5 specializations: tRPC/Drizzle/Docker/Kafka/Playwright', () => {
  it('tRPC service adds router and server files', () => {
    const spec = generateSpike('gen-trpc-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/trpc/router.ts');
    expect(paths).toContain('src/trpc/server.ts');
  });

  it('tRPC client adds client proxy', () => {
    const spec = generateSpike('gen-trpc-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/trpc/client.ts');
  });

  it('Drizzle config adds config, schema and client', () => {
    const spec = generateSpike('gen-drizzle-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('drizzle.config.ts');
    expect(paths).toContain('src/db/schema.ts');
    expect(paths).toContain('src/db/client.ts');
  });

  it('Docker config adds Dockerfile and compose', () => {
    const spec = generateSpike('gen-docker-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('Dockerfile');
    expect(paths).toContain('docker-compose.yml');
  });

  it('Kafka service adds producer and consumer', () => {
    const spec = generateSpike('gen-kafka-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/kafka/producer.ts');
    expect(paths).toContain('src/kafka/consumer.ts');
  });

  it('Playwright config adds config and example spec', () => {
    const spec = generateSpike('gen-playwright-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('playwright.config.ts');
    expect(paths).toContain('tests/example.spec.ts');
  });
});

