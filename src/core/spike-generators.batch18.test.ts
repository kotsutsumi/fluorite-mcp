import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch18: i18n, CMS, AI, analytics, bug tracking, config, storage', () => {
  // i18n
  it('i18next config includes i18n file', () => {
    const spec = generateSpike('gen-i18next-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/i18n/i18next.ts');
  });
  it('next-intl route includes api file', () => {
    const spec = generateSpike('gen-next-intl-route-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('app/api/i18n/hello/route.ts');
  });

  // CMS
  it('strapi client includes cms file', () => {
    const spec = generateSpike('gen-strapi-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cms/strapi.ts');
  });
  it('contentful client includes cms file', () => {
    const spec = generateSpike('gen-contentful-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cms/contentful.ts');
  });
  it('sanity client includes cms file', () => {
    const spec = generateSpike('gen-sanity-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cms/sanity.ts');
  });
  it('ghost client includes cms file', () => {
    const spec = generateSpike('gen-ghost-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cms/ghost.ts');
  });

  // AI providers
  it('groq client includes ai file', () => {
    const spec = generateSpike('gen-groq-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/ai/groq.ts');
  });
  it('mistral client includes ai file', () => {
    const spec = generateSpike('gen-mistral-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/ai/mistral.ts');
  });
  it('cohere client includes ai file', () => {
    const spec = generateSpike('gen-cohere-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/ai/cohere.ts');
  });

  // Analytics
  it('segment client includes analytics file', () => {
    const spec = generateSpike('gen-segment-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/analytics/segment.ts');
  });
  it('amplitude client includes analytics file', () => {
    const spec = generateSpike('gen-amplitude-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/analytics/amplitude.ts');
  });
  it('mixpanel client includes analytics file', () => {
    const spec = generateSpike('gen-mixpanel-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/analytics/mixpanel.ts');
  });

  // Bug tracking
  it('bugsnag config includes monitoring file', () => {
    const spec = generateSpike('gen-bugsnag-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/monitoring/bugsnag.ts');
  });
  it('honeybadger config includes monitoring file', () => {
    const spec = generateSpike('gen-honeybadger-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/monitoring/honeybadger.ts');
  });

  // Config/util
  it('dotenv config includes env loader', () => {
    const spec = generateSpike('gen-dotenv-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/config/dotenv.ts');
  });
  it('lru-cache config includes cache file', () => {
    const spec = generateSpike('gen-lru-cache-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/cache/lru.ts');
  });

  // Uploads/storage extras
  it('cloudinary client includes uploads file', () => {
    const spec = generateSpike('gen-cloudinary-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/uploads/cloudinary.ts');
  });
  it('uploadthing client includes uploads file', () => {
    const spec = generateSpike('gen-uploadthing-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/uploads/uploadthing.ts');
  });
  it('mailgun client includes email helper', () => {
    const spec = generateSpike('gen-mailgun-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/email/mailgun.ts');
  });
  it('paddle client includes payments file', () => {
    const spec = generateSpike('gen-paddle-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/payments/paddle.ts');
  });
});

