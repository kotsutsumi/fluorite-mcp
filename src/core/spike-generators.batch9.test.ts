import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch9: Knex/PG/MySQL/SQLite/K8s/Helm/Serverless/GCF/Azure/ESLint/Prettier/Vite/Webpack/Tsup/Ansible', () => {
  it('knex init adds knexfile and migration', () => {
    const spec = generateSpike('gen-knex-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('knexfile.ts');
    expect(paths).toContain('migrations/0001_init.ts');
  });

  it('postgres config adds pg client', () => {
    const spec = generateSpike('gen-postgres-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/pg/client.ts');
  });

  it('mysql config adds mysql client', () => {
    const spec = generateSpike('gen-mysql-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/mysql/client.ts');
  });

  it('sqlite config adds sqlite db', () => {
    const spec = generateSpike('gen-sqlite-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/sqlite/db.ts');
  });

  it('kubernetes init adds deployment and service', () => {
    const spec = generateSpike('gen-kubernetes-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('k8s/deployment.yaml');
    expect(paths).toContain('k8s/service.yaml');
  });

  it('helm init adds chart and deployment template', () => {
    const spec = generateSpike('gen-helm-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('chart/Chart.yaml');
    expect(paths).toContain('chart/templates/deployment.yaml');
  });

  it('serverless init adds serverless.yml', () => {
    const spec = generateSpike('gen-serverless-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('serverless.yml');
  });

  it('gcp functions service adds function file', () => {
    const spec = generateSpike('gen-gcp-cloud-functions-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/gcp/functions.ts');
  });

  it('azure functions service adds binding and index', () => {
    const spec = generateSpike('gen-azure-functions-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('AzureFunctions/HttpTrigger1/function.json');
    expect(paths).toContain('AzureFunctions/HttpTrigger1/index.ts');
  });

  it('eslint init adds config', () => {
    const spec = generateSpike('gen-eslint-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.eslintrc.cjs');
  });

  it('prettier init adds config', () => {
    const spec = generateSpike('gen-prettier-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('.prettierrc.json');
  });

  it('vite init adds config', () => {
    const spec = generateSpike('gen-vite-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('vite.config.ts');
  });

  it('webpack init adds config', () => {
    const spec = generateSpike('gen-webpack-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('webpack.config.js');
  });

  it('tsup init adds config', () => {
    const spec = generateSpike('gen-tsup-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('tsup.config.ts');
  });

  it('ansible init adds playbook', () => {
    const spec = generateSpike('gen-ansible-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('ansible/playbook.yml');
  });
});

