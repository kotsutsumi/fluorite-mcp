import { describe, it, expect } from 'vitest';
import { generateSpike } from './spike-generators.js';

describe('batch8: Koa/NestJS/Hapi/Mongoose/Sequelize/TypeORM/Neo4j/OpenAPI/Terraform/Pulumi', () => {
  it('koa service adds server', () => {
    const spec = generateSpike('gen-koa-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/koa/server.ts');
  });

  it('nestjs init adds main/module/controller', () => {
    const spec = generateSpike('gen-nestjs-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/nest/main.ts');
    expect(paths).toContain('src/nest/app.module.ts');
    expect(paths).toContain('src/nest/app.controller.ts');
  });

  it('hapi service adds server', () => {
    const spec = generateSpike('gen-hapi-service-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/hapi/server.ts');
  });

  it('mongoose config adds conn and model', () => {
    const spec = generateSpike('gen-mongoose-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/mongoose/conn.ts');
    expect(paths).toContain('src/mongoose/user.model.ts');
  });

  it('sequelize config adds index and model', () => {
    const spec = generateSpike('gen-sequelize-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/sequelize/index.ts');
  });

  it('typeorm config adds data source and entity', () => {
    const spec = generateSpike('gen-typeorm-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/typeorm/data-source.ts');
    expect(paths).toContain('src/typeorm/User.ts');
  });

  it('neo4j config adds driver', () => {
    const spec = generateSpike('gen-neo4j-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('src/neo4j/driver.ts');
  });

  it('openapi config adds spec file', () => {
    const spec = generateSpike('gen-openapi-config-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('openapi.yaml');
  });

  it('terraform init adds main.tf', () => {
    const spec = generateSpike('gen-terraform-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('main.tf');
  });

  it('pulumi init adds config and index', () => {
    const spec = generateSpike('gen-pulumi-init-basic-ts');
    const paths = (spec.files || []).map(f => f.path);
    expect(paths).toContain('Pulumi.yaml');
    expect(paths).toContain('index.ts');
  });
});

