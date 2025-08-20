import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch13: Auth providers, storage, logging, AWS/GCP clients', () => {
  it('auth0 init includes client', () => {
    const spec = generateSpike('gen-auth0-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/auth0/client.ts');
  });

  it('clerk config includes client', () => {
    const spec = generateSpike('gen-clerk-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/clerk/client.ts');
  });

  it('lucia init includes auth file', () => {
    const spec = generateSpike('gen-lucia-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/lucia/auth.ts');
  });

  it('firebase-auth config includes auth file', () => {
    const spec = generateSpike('gen-firebase-auth-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/firebase/auth.ts');
  });

  it('redis config includes client', () => {
    const spec = generateSpike('gen-redis-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/redis/client.ts');
  });

  it('sns service includes publisher', () => {
    const spec = generateSpike('gen-sns-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/sns.ts');
  });

  it('kinesis service includes client', () => {
    const spec = generateSpike('gen-kinesis-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/kinesis.ts');
  });

  it('pubsub service includes publisher', () => {
    const spec = generateSpike('gen-pubsub-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/gcp/pubsub.ts');
  });

  it('s3 client includes s3 helper', () => {
    const spec = generateSpike('gen-s3-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/aws/s3.ts');
  });

  it('gcs client includes storage helper', () => {
    const spec = generateSpike('gen-gcs-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/gcp/storage.ts');
  });

  it('azure-blob client includes blob helper', () => {
    const spec = generateSpike('gen-azure-blob-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/azure/blob.ts');
  });

  it('pino config includes logger', () => {
    const spec = generateSpike('gen-pino-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/logging/pino.ts');
  });

  it('winston config includes logger', () => {
    const spec = generateSpike('gen-winston-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/logging/winston.ts');
  });

  it('prometheus service includes metrics helper', () => {
    const spec = generateSpike('gen-prometheus-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/metrics/prometheus.ts');
  });
});

