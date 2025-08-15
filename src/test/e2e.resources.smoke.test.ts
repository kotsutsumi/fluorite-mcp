import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { spawn, type ChildProcess } from 'node:child_process'
import { TEST_CATALOG_DIR } from './setup.js'

// Minimal MCP client (reuse lightweight parts inline)
class Client {
  p: ChildProcess | null = null
  id = 0
  pending = new Map<number, (res: any) => void>()
  buf = ''
  async start() {
    await fs.mkdir(TEST_CATALOG_DIR, { recursive: true })
    this.p = spawn('node', [path.resolve('dist/server.js')], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, FLUORITE_CATALOG_DIR: TEST_CATALOG_DIR } })
    this.p!.stdout!.on('data', (d: Buffer) => { this.buf += d.toString(); this.flush() })
    await this.req('initialize', { protocolVersion: '2024-11-05', capabilities: { resources: { subscribe: false }, tools: { listChanged: false } }, clientInfo: { name: 'smoke', version: '1.0.0' } })
    this.send({ jsonrpc: '2.0', method: 'notifications/initialized' })
  }
  send(msg: any) { this.p!.stdin!.write(JSON.stringify(msg) + '\n') }
  flush() {
    const lines = this.buf.split('\n'); this.buf = lines.pop() || ''
    for (const line of lines) {
      try { const m = JSON.parse(line); if (m.id && this.pending.has(m.id)) { const r = this.pending.get(m.id)!; this.pending.delete(m.id); r(m) } } catch {}
    }
  }
  async req(method: string, params?: any) {
    const id = ++this.id
    this.send({ jsonrpc: '2.0', id, method, params })
    return await new Promise<any>((res, rej) => {
      this.pending.set(id, res)
      setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); rej(new Error('timeout ' + method)) } }, 8000)
    })
  }
  async callTool(name: string, args?: any) { return this.req('tools/call', { name, arguments: args || {} }) }
  async read(uri: string) { return this.req('resources/read', { uri }) }
  async close() { if (this.p) { this.p.kill('SIGTERM'); await new Promise(r => setTimeout(r, 200)); this.p = null } }
}

describe('Spec resources smoke (upsert + read)', () => {
  const ids = [
    'vue-ecosystem', 'vue-opinionated-starter', 'nuxt-ecosystem', 'laravel-ecosystem',
    'zod', 'react-hook-form', '@tanstack__react-query', 'trpc',
    'ag-grid', '@mui__x-data-grid', '@tanstack__react-table', '@tremor__react',
    'recharts', 'visx', 'prisma', 'drizzle-orm', 'uploadthing', 'next-intl',
    '@sentry__nextjs', 'posthog', '@upstash__redis', 'hono', 'laravel', 'rust-tauri-ecosystem',
    'fastapi-ecosystem', 'supabase-ecosystem', 'firebase-ecosystem', 'vercel-ecosystem', 'azure-ecosystem', 'gcp-ecosystem',
    'vercel-next-starter', 'fastapi-starter'
    , 'zig-ecosystem', 'elixir-ecosystem', 'go-ecosystem', 'dart-ecosystem', 'flutter-ecosystem', 'csharp-ecosystem', 'unity-ecosystem',
    'expo-react-native-ecosystem', 'mobile-native-ecosystem', 'frontend-visualization-ecosystem', 'ui-component-quality', 'vitepress-ecosystem', 'lua-ecosystem', 'ruby-rails-ecosystem', 'webrtc-streaming-ecosystem', 'shell-tools-ecosystem', 'modern-tech-ecosystem'
  ]
  const client = new Client()
  beforeAll(async () => { await client.start() })
  afterAll(async () => {
    await client.close()
    try { await fs.rm(TEST_CATALOG_DIR, { recursive: true, force: true }) } catch {}
  })

  it('upserts and retrieves multiple catalog specs', async () => {
    // Write minimal YAML for each ID into test catalog via tool, then read resource
    for (const id of ids) {
      const uriId = id.replace(/^@/, '') // '@' は URI で問題になる場合があるため除去
      const yaml = `id: ${uriId}\nname: ${uriId} (smoke)`
      const up = await client.callTool('upsert-spec', { pkg: uriId, yaml })
      expect(up.error).toBeUndefined()
      const rd = await client.read(`spec://${uriId}`)
      expect(rd.error).toBeUndefined()
      expect(rd.result.contents[0].text).toContain(`id: ${uriId}`)
    }
  }, 30000)
})
