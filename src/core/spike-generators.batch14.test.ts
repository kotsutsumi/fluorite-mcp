import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch14: Vector DBs, Email, Search providers', () => {
  // Vector DBs
  it('pinecone client includes vectors helper', () => {
    const spec = generateSpike('gen-pinecone-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/vectors/pinecone.ts');
  });
  it('weaviate client includes vectors helper', () => {
    const spec = generateSpike('gen-weaviate-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/vectors/weaviate.ts');
  });
  it('milvus client includes vectors helper', () => {
    const spec = generateSpike('gen-milvus-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/vectors/milvus.ts');
  });
  it('qdrant client includes vectors helper', () => {
    const spec = generateSpike('gen-qdrant-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/vectors/qdrant.ts');
  });

  // Email providers
  it('resend client includes email helper', () => {
    const spec = generateSpike('gen-resend-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/email/resend.ts');
  });
  it('sendgrid client includes email helper', () => {
    const spec = generateSpike('gen-sendgrid-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/email/sendgrid.ts');
  });
  it('postmark client includes email helper', () => {
    const spec = generateSpike('gen-postmark-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/email/postmark.ts');
  });
  it('nodemailer client includes email helper', () => {
    const spec = generateSpike('gen-nodemailer-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/email/nodemailer.ts');
  });

  // Search providers
  it('algolia client includes search helper', () => {
    const spec = generateSpike('gen-algolia-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/search/algolia.ts');
  });
  it('meilisearch client includes search helper', () => {
    const spec = generateSpike('gen-meilisearch-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/search/meilisearch.ts');
  });
  it('typesense client includes search helper', () => {
    const spec = generateSpike('gen-typesense-client-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/search/typesense.ts');
  });
});

