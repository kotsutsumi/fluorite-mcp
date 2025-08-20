import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch10: Express security/Otel, Drizzle migrate, Docker cloud targets', () => {
  it('express config basic includes security helper', () => {
    const spec = generateSpike('gen-express-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/express/security.ts');
  });

  it('express config advanced includes otel files', () => {
    const spec = generateSpike('gen-express-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/otel/tracer.ts');
    expect(paths).toContain('src/otel/instrument.ts');
  });

  it('drizzle config includes migrate script', () => {
    const spec = generateSpike('gen-drizzle-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/db/migrate.ts');
  });

  it('docker advanced includes cloud run/render/fly files', () => {
    const spec = generateSpike('gen-docker-config-advanced-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('cloudrun.yaml');
    expect(paths).toContain('render.yaml');
    expect(paths).toContain('fly.toml');
  });
});

