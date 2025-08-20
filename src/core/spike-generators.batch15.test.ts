import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch15: Realtime/APM/Flags/Secrets/Storage/Search extras', () => {
  it('socket.io service includes realtime helper', () => {
    const spec = generateSpike('gen-socket.io-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/realtime/socketio.ts');
  });
  it('pusher client includes helper', () => {
    const spec = generateSpike('gen-pusher-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/realtime/pusher.ts');
  });
  it('ably client includes helper', () => {
    const spec = generateSpike('gen-ably-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/realtime/ably.ts');
  });
  it('datadog init includes apm file', () => {
    const spec = generateSpike('gen-datadog-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/apm/datadog.ts');
  });
  it('newrelic init includes apm file', () => {
    const spec = generateSpike('gen-newrelic-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/apm/newrelic.ts');
  });
  it('launchdarkly config includes flags helper', () => {
    const spec = generateSpike('gen-launchdarkly-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/flags/launchdarkly.ts');
  });
  it('unleash config includes flags helper', () => {
    const spec = generateSpike('gen-unleash-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/flags/unleash.ts');
  });
  it('vault config includes secrets helper', () => {
    const spec = generateSpike('gen-vault-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/secrets/vault.ts');
  });
  it('doppler config includes secrets helper', () => {
    const spec = generateSpike('gen-doppler-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/secrets/doppler.ts');
  });
  it('minio client includes storage helper', () => {
    const spec = generateSpike('gen-minio-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/storage/minio.ts');
  });
  it('elasticsearch client includes search helper', () => {
    const spec = generateSpike('gen-elasticsearch-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/search/elasticsearch.ts');
  });
  it('opensearch client includes search helper', () => {
    const spec = generateSpike('gen-opensearch-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/search/opensearch.ts');
  });
  it('mqtt client includes iot helper', () => {
    const spec = generateSpike('gen-mqtt-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/iot/mqtt.ts');
  });
  it('memcached client includes cache helper', () => {
    const spec = generateSpike('gen-memcached-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cache/memcached.ts');
  });
  it('cloudflare-workers service includes worker', () => {
    const spec = generateSpike('gen-cloudflare-workers-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cloudflare/worker.ts');
  });
});

