// Minimal Pino logger test
// Run: npx tsx examples/pack-examples/pino/index.ts
import pino from 'pino';

const log = pino();
log.info({ ok: true }, 'hello');
console.log('ok');
