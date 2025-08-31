// Local replicas of types to avoid circular imports
export interface SpikeMetadata {
  id: string;
  name: string;
  description?: string;
  stack?: string[];
  tags?: string[];
  version?: string;
  fileCount?: number;
  patchCount?: number;
}

export interface SpikeFileTemplate {
  path: string;
  content?: string;
  template?: string;
}

export interface SpikePatch { path: string; diff: string }

export interface SpikeSpec {
  id: string;
  name: string;
  version?: string;
  stack?: string[];
  tags?: string[];
  description?: string;
  params?: Array<{ name: string; required?: boolean; description?: string; default?: string }>;
  files?: SpikeFileTemplate[];
  patches?: SpikePatch[];
}

// Prefix for generated spike IDs
const GEN_PREFIX = 'gen-';
// Also support Strike-branded generated IDs
const STRIKE_PREFIX = 'strike-';

// Dimensions to combine into many spikes
const LIBRARIES = [
  // core frameworks
  'react','vue','svelte','angular','solid','qwik','nextjs','nuxt','remix','astro',
  // meta-frameworks
  'sveltekit','solidstart','vitepress',
  // servers
  'express','fastify','koa','hapi','nestjs','deno-fresh','bun-elysia','sails','adonis','feathers','fastapi',
  // API/data
  'graphql','apollo','urql','relay','graphql-yoga','openapi','swagger','trpc','hono','elysia',
  'prisma','mongoose','sequelize','typeorm','drizzle','knex','postgres','mysql','sqlite','neo4j',
  // messaging/streaming
  'redis','bullmq','kafka','rabbitmq','nats','sqs','sns','pubsub','kinesis','activemq',
  // tooling
  'jest','vitest','playwright','cypress','eslint','prettier','rollup','vite','webpack','tsup',
  // infra
  'docker','kubernetes','helm','terraform','pulumi','ansible','serverless','aws-lambda','gcp-cloud-functions','azure-functions',
  // auth
  'auth0','passport','next-auth','keycloak','firebase-auth','cognito','supabase-auth','clerk','lucia','ory',
  // ai
  'openai','anthropic','langchain','llamaindex','transformers','whisper','weaviate','pinecone','milvus','qdrant',
  'github-actions',
  // specialized
  'sentry','stripe','posthog','shadcn','supabase',
  // docs/site/animation
  'starlight','docusaurus','lottie',
  // storage/logging/metrics
  's3','gcs','azure-blob','pino','winston','prometheus',
  // email
  'resend','sendgrid','postmark','nodemailer',
  // search
  'algolia','meilisearch','typesense',
  // realtime/apm/flags/secrets
  'socket.io','pusher','ably','datadog','newrelic','launchdarkly','unleash','vault','doppler','minio','elasticsearch','opensearch','mqtt','memcached','cloudflare-workers','line',
  // i18n/CMS/AI/analytics/bugtracking/config/uploads
  'i18next','next-intl','strapi','contentful','sanity','ghost',
  'groq','mistral','cohere',
  'segment','amplitude','mixpanel',
  'bugsnag','honeybadger',
  'dotenv','cloudinary','uploadthing','mailgun','lru-cache','paddle',
  // frontend utilities
  'zod','react-hook-form','zustand','redux','swr','radix-ui','tailwindcss','storybook','nx','turborepo','xterm','reactflow','shadcn-tree-view',
  // desktop/mobile platforms
  'electron','tauri','capacitor','expo','react-native',
  // load testing / observability
  'artillery','k6','opentelemetry'
];

const PATTERNS = [
  'minimal','init','config','route','controller','service','client','crud','webhook','job',
  // additional common patterns
  'middleware','schema','component','hook','provider','adapter','plugin','worker','listener','migration','seed',
  // expanded patterns
  'cli','command','pipeline','scheduler','cron','benchmark','example','docs'
];

const STYLES = ['basic','typed','advanced','secure','testing'];
const LANGS = ['ts','js','py','go','rs','kt'];

// Optionally cap generated spikes for performance
function getLimit(): number | undefined {
  const env = process.env.FLUORITE_GENERATED_SPIKES_LIMIT;
  if (!env) return undefined;
  const n = parseInt(env, 10);
  return Number.isNaN(n) || n <= 0 ? undefined : n;
}

export function isGeneratedId(id: string): boolean {
  // Treat both prefixes as generated (virtual) spikes
  return id.startsWith(GEN_PREFIX) || id.startsWith(STRIKE_PREFIX);
}

export function listGeneratedSpikeIdsFiltered(opts: { libs?: string[]; patterns?: string[]; styles?: string[]; langs?: string[]; limit?: number } = {}): string[] {
  const ids: string[] = [];
  const limit = typeof opts.limit === 'number' && opts.limit > 0 ? opts.limit : getLimit();
  const libs = opts.libs && opts.libs.length ? opts.libs : LIBRARIES;
  const pats = opts.patterns && opts.patterns.length ? opts.patterns : PATTERNS;
  const styles = opts.styles && opts.styles.length ? opts.styles : STYLES;
  const langs = opts.langs && opts.langs.length ? opts.langs : LANGS;
  const pushWithCap = (id: string) => { ids.push(id); return limit !== undefined && ids.length >= limit; };
  outer: for (const lib of libs) {
    for (const pat of pats) {
      for (const style of styles) {
        for (const lang of langs) {
          if (pushWithCap(`${GEN_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
          if (pushWithCap(`${STRIKE_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
        }
      }
    }
  }
  return ids;
}

export function listGeneratedSpikeIds(): string[] {
  const ids: string[] = [];
  const limit = getLimit();
  // Helper to push with optional cap
  const pushWithCap = (id: string) => {
    ids.push(id);
    return limit !== undefined && ids.length >= limit;
  };

  outer: for (const lib of LIBRARIES) {
    for (const pat of PATTERNS) {
      for (const style of STYLES) {
        for (const lang of LANGS) {
          // Standard generated id
          if (pushWithCap(`${GEN_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
          // Strike-branded generated id (same content, different id and extra tag)
          if (pushWithCap(`${STRIKE_PREFIX}${lib}-${pat}-${style}-${lang}`)) break outer;
        }
      }
    }
  }
  return ids;
}

function codeSnippet(lib: string, pattern: string, lang: string, style: string): string {
  const header = `# Spike: ${lib} ${pattern} (${lang})\n`;
  // Specialized snippets for popular stacks
  if (lib === 'express' && pattern === 'route') {
    if (lang === 'ts') {
      return header + `import express, { Request, Response } from 'express';\nconst app = express();\napp.get('/health', (req: Request, res: Response) => { res.json({ ok: true }); });\napp.listen(3000);\n`;}
    if (lang === 'js') {
      return header + `const express = require('express');\nconst app = express();\napp.get('/health', (req, res) => res.json({ ok: true }));\napp.listen(3000);\n`;}
  }
  if (lib === 'fastapi' && pattern === 'route' && lang === 'py') {
    return header + `from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\nasync def health():\n    return { 'ok': True }\n`;
  }
  switch (lang) {
    case 'ts':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nexport function demo() {\n  console.log('use ${lib} - ${pattern} (${style})');\n}\n`;
    case 'js':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nmodule.exports = function demo(){\n  console.log('use ${lib} - ${pattern} (${style})');\n};\n`;
    case 'py':
      return header + `# Auto-generated spike stub for ${lib} (${pattern})\ndef demo():\n    print('use ${lib} - ${pattern} (${style})')\n`;
    case 'go':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\npackage main\nimport \"fmt\"\nfunc demo(){ fmt.Println(\"use ${lib} - ${pattern} (${style})\") }\n`;
    case 'rs':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\npub fn demo(){ println!(\"use ${lib} - ${pattern} (${style})\"); }\n`;
    case 'kt':
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\nfun demo(){ println(\"use ${lib} - ${pattern} (${style})\") }\n`;
    default:
      return header + `// Auto-generated spike stub for ${lib} (${pattern})\n`;
  }
}

function makeFiles(id: string, lib: string, pattern: string, style: string, lang: string): SpikeFileTemplate[] {
  const ext = lang;
  const files: SpikeFileTemplate[] = [];

  // Next.js
  if (lib === 'nextjs' && pattern === 'route') {
    files.push({ path: `app/api/health/route.ts`, template: `import { NextResponse } from 'next/server';\nexport async function GET(){ return NextResponse.json({ ok: true }); }\n` });
    files.push({ path: `app/api/echo/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { z } from 'zod';\nconst Body = z.object({ message: z.string().min(1) });\nexport async function POST(req: Request){ const json = await req.json(); const parsed = Body.safeParse(json); if(!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 }); return NextResponse.json({ echo: parsed.data.message }); }\n` });
    if (style === 'advanced') {
      files.push({
        path: `app/api/items/route.ts`,
        template: `import { NextResponse } from 'next/server';\nimport { z } from 'zod';\nconst Query = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });\nexport async function GET(req: Request){ const url = new URL(req.url); const parsed = Query.safeParse(Object.fromEntries(url.searchParams)); if(!parsed.success){ return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }); } const { page, limit } = parsed.data; return NextResponse.json({ items: [], page, limit }); }\n`
      });
    }
  }

  // SvelteKit
  if (lib === 'sveltekit' && (pattern === 'route' || pattern === 'minimal')) {
    files.push({ path: `src/routes/+page.svelte`, template: `<script lang=\"ts\"></script>\n<h1>Hello SvelteKit</h1>\n` });
    files.push({ path: `src/routes/api/health/+server.ts`, template: `import type { RequestHandler } from '@sveltejs/kit';\nexport const GET: RequestHandler = () => new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });\n` });
  }

  // SolidStart
  if (lib === 'solidstart' && (pattern === 'route' || pattern === 'minimal')) {
    files.push({ path: `src/routes/index.tsx`, template: `export default function Home(){ return (<main><h1>Hello SolidStart</h1></main>); }\n` });
    files.push({ path: `src/routes/api/health.ts`, template: `import type { APIEvent } from 'solid-start/api';\nexport function GET(_e: APIEvent){ return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } }); }\n` });
  }

  // VitePress
  if (lib === 'vitepress' && (pattern === 'docs' || pattern === 'minimal' || pattern === 'init')) {
    files.push({ path: `.vitepress/config.ts`, template: `import { defineConfig } from 'vitepress';\nexport default defineConfig({ title: 'Docs' });\n` });
    files.push({ path: `index.md`, template: `# Docs\n\nWelcome to VitePress.\n` });
  }

  // Remix
  if (lib === 'remix' && (pattern === 'route' || pattern === 'minimal')) {
    files.push({ path: `app/routes/_index.tsx`, template: `import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';\nimport { json } from '@remix-run/node';\nexport async function loader(_args: LoaderFunctionArgs){ return json({ ok: true }); }\nexport async function action(_args: ActionFunctionArgs){ return json({ ok: true }); }\nexport default function Index(){ return (<main><h1>Hello Remix</h1></main>); }\n` });
  }

  // Electron
  if (lib === 'electron' && (pattern === 'init' || pattern === 'minimal')) {
    files.push({ path: `main.js`, template: `const { app, BrowserWindow } = require('electron');\nfunction createWindow(){ const win = new BrowserWindow({ width: 800, height: 600 }); win.loadFile('index.html'); }\napp.whenReady().then(createWindow);\n` });
    files.push({ path: `index.html`, template: `<!doctype html><html><body><h1>Hello Electron</h1></body></html>\n` });
  }
  if (lib === 'electron' && (pattern === 'ipc' || pattern === 'plugin')) {
    files.push({ path: `main.js`, template: `const { app, BrowserWindow, ipcMain } = require('electron');\nconst path = require('path');\nfunction createWindow(){ const win = new BrowserWindow({ width: 800, height: 600, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } }); win.loadFile('index.html'); }\nipcMain.handle('ping', async (_e, name)=> 'Hello ' + name);\napp.whenReady().then(createWindow);\n` });
    files.push({ path: `preload.js`, template: `const { contextBridge, ipcRenderer } = require('electron');\ncontextBridge.exposeInMainWorld('api', { ping: (name)=> ipcRenderer.invoke('ping', name) });\n` });
    files.push({ path: `index.html`, template: `<!doctype html><html><body><h1>IPC</h1><button id=btn>Ping</button><script>document.getElementById('btn').onclick=()=> window.api.ping('World').then(alert)</script></body></html>\n` });
  }

  // Tauri
  if (lib === 'tauri' && (pattern === 'init' || pattern === 'minimal' || pattern === 'command')) {
    files.push({ path: `src-tauri/src/main.rs`, template: `#![cfg_attr(not(debug_assertions), windows_subsystem = \"windows\")]\n#[tauri::command]\nfn greet(name: &str) -> String { format!(\"Hello, {}!\", name) }\nfn main(){ tauri::Builder::default().invoke_handler(tauri::generate_handler![greet]).run(tauri::generate_context!()).expect(\"error\"); }\n` });
    files.push({ path: `index.html`, template: `<!doctype html><html><body><h1>Tauri</h1><button id=btn>Greet</button><script>window.__TAURI__.invoke('greet',{ name: 'World' }).then(alert)</script></body></html>\n` });
  }

  // Expo / React Native
  if (lib === 'expo' && (pattern === 'component' || pattern === 'minimal')) {
    files.push({ path: `App.tsx`, template: `import React from 'react';\nimport { SafeAreaView, Text } from 'react-native';\nexport default function App(){ return (<SafeAreaView><Text>Hello Expo</Text></SafeAreaView>); }\n` });
  }
  if (lib === 'expo' && (pattern === 'navigation' || pattern === 'tabs')) {
    files.push({ path: `App.tsx`, template: `import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createBottomTabNavigator } from '@react-navigation/bottom-tabs';\nimport { SafeAreaView, Text } from 'react-native';\nfunction A(){ return (<SafeAreaView><Text>Screen A</Text></SafeAreaView>); }\nfunction B(){ return (<SafeAreaView><Text>Screen B</Text></SafeAreaView>); }\nconst Tab = createBottomTabNavigator();\nexport default function App(){\n  return (\n    <NavigationContainer>\n      <Tab.Navigator>\n        <Tab.Screen name=\"A\" component={A} />\n        <Tab.Screen name=\"B\" component={B} />\n      </Tab.Navigator>\n    </NavigationContainer>\n  );\n}\n` });
  }

  // Capacitor
  if (lib === 'capacitor' && (pattern === 'init' || pattern === 'minimal')) {
    files.push({ path: `src/main.ts`, template: `import { Capacitor } from '@capacitor/core';\nconsole.log('Platform:', Capacitor.getPlatform());\n` });
    files.push({ path: `index.html`, template: `<!doctype html><html><body><h1>Capacitor</h1><script type=\"module\" src=\"/src/main.ts\"></script></body></html>\n` });
  }

  // k6 load test
  if (lib === 'k6' && (pattern === 'benchmark' || pattern === 'minimal')) {
    files.push({ path: `k6/script.js`, template: `import http from 'k6/http';\nimport { sleep } from 'k6';\nexport const options = { vus: 1, duration: '10s' };\nexport default function(){ http.get('https://example.com'); sleep(1); }\n` });
  }

  // Artillery
  if (lib === 'artillery' && (pattern === 'benchmark' || pattern === 'minimal' || pattern === 'scenario')) {
    files.push({ path: `artillery/test.yml`, template: `config:\n  target: 'https://example.com'\n  phases:\n    - duration: 10\n      arrivalRate: 1\nscenarios:\n  - flow:\n      - get:\n          url: /\n` });
  }

  // OpenTelemetry (generic node tracer)
  if (lib === 'opentelemetry' && (pattern === 'config' || pattern === 'init' || pattern === 'minimal')) {
    files.push({ path: `otel/tracer.js`, template: `const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');\nconst { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');\nconst provider = new NodeTracerProvider();\nprovider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));\nprovider.register();\nmodule.exports = require('@opentelemetry/api').trace.getTracer('demo');\n` });
  }
  if (lib === 'nextjs' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `middleware.ts`, template: `import { NextResponse } from 'next/server';\nexport function middleware(){ return NextResponse.next(); }\n` });
  }
  if (lib === 'nextjs' && pattern === 'service') {
    files.push({ path: `app/actions/demo.ts`, template: `'use server';\nexport async function demoAction(){ return { ok: true }; }\n` });
    if (style === 'advanced') {
      files.push({ path: `src/next/response.ts`, template: `import { NextResponse } from 'next/server';\nexport type Ok<T> = { ok: true; data: T };\nexport type Err = { ok: false; error: unknown };\nexport function ok<T>(data: T){ return NextResponse.json({ ok: true, data } as Ok<T>); }\nexport function err(e: unknown, status=400){ return NextResponse.json({ ok: false, error: String(e) } as Err, { status }); }\n` });
    }
  }
  if (lib === 'nextjs' && pattern === 'client') {
    files.push({ path: `app/client-demo/page.tsx`, template: `'use client';\nexport default function Page(){ return <div>Client Component</div>; }\n` });
  }
  if (lib === 'nextjs' && style === 'advanced') {
    files.push({ path: `app/rsc/page.tsx`, template: `export default function Page(){ return <div>Server Component (RSC)</div>; }\n` });
    files.push({ path: `app/csr/page.tsx`, template: `'use client';\nexport default function Page(){ return <div>Client Component (CSR)</div>; }\n` });
    files.push({ path: `app/api/typed/route.ts`, template: `import { z } from 'zod';\nimport { ok, err } from '@/src/next/response';\nconst Payload = z.object({ name: z.string().min(1) });\nexport async function POST(req: Request){ try { const json = await req.json(); const parsed = Payload.parse(json); return ok({ message: 'Hello ' + parsed.name }); } catch(e){ return err(e, 400); } }\n` });
    files.push({ path: `src/next/withRole.ts`, template: `import type { NextRequest } from 'next/server';\nexport function withRole(required: 'user'|'admin', handler: (req: NextRequest)=>Promise<Response>|Response){\n  return async (req: NextRequest) => {\n    const role = (req.headers.get('x-role') as 'user'|'admin') || 'user';\n    if (required === 'admin' && role !== 'admin') {\n      return new Response('Forbidden', { status: 403 });\n    }\n    return handler(req);\n  };\n}\n` });
  }

  // Starlight (Astro docs)
  if (lib === 'starlight' && (pattern === 'minimal' || pattern === 'init' || pattern === 'config')) {
    files.push({ path: `package.json`, template: `{
  \"name\": \"starlight-docs\",\n  \"private\": true,\n  \"type\": \"module\",\n  \"scripts\": { \"dev\": \"astro dev\", \"build\": \"astro build\", \"preview\": \"astro preview\" },\n  \"devDependencies\": { \"astro\": \"latest\", \"@astrojs/starlight\": \"latest\" }
}\n` });
    files.push({ path: `astro.config.mjs`, template: `import { defineConfig } from 'astro/config';\nimport starlight from '@astrojs/starlight';\nexport default defineConfig({\n  site: 'https://example.com',\n  integrations: [ starlight({ title: 'Docs', sidebar: [{ label: 'Introduction', autogenerate: { directory: 'docs' } }] }) ]\n});\n` });
    files.push({ path: `src/content/docs/index.mdx`, template: `---\ntitle: Introduction\n---\n\n# Starlight Minimal\n\nThis is a minimal Starlight site.\n` });
  }

  // xterm.js
  if (lib === 'xterm') {
    const isTS = lang === 'ts';
    const jsExt = isTS ? 'ts' : 'js';
    // example/minimal: 素のDOMでターミナルを初期化
    if (pattern === 'example' || pattern === 'minimal') {
      files.push({ path: `index.html`, template: `<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\"/>\n    <title>xterm example</title>\n    <style>html,body,#terminal{height:100%;margin:0;}#terminal{padding:8px;background:#1e1e1e;}</style>\n  </head>\n  <body>\n    <div id=\"terminal\"></div>\n    <script type=\"module\" src=\"/src/main.${jsExt}\"></script>\n  </body>\n</html>\n` });
      files.push({ path: `src/main.${jsExt}` , template: `import { Terminal } from 'xterm';\nimport { FitAddon } from '@xterm/addon-fit';\nimport { WebLinksAddon } from '@xterm/addon-web-links';\nimport 'xterm/css/xterm.css';\n\nconst term = new Terminal({\n  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',\n  theme: { background: '#1e1e1e' },\n});\nconst fit = new FitAddon();\nterm.loadAddon(fit);\nterm.loadAddon(new WebLinksAddon());\n\nconst el = document.getElementById('terminal');\nif (!el) throw new Error('missing #terminal');\nterm.open(el);\nfit.fit();\nterm.writeln('Welcome to xterm.js');\nterm.writeln('Type and see echo:');\nterm.onData((d)=> term.write('\r\n' + d));\nwindow.addEventListener('resize', ()=> fit.fit());\n` });
    }
    // component: Reactコンポーネントで埋め込み
    if (pattern === 'component') {
      if (isTS) {
        files.push({ path: `src/components/XtermTerminal.tsx`, template: `import React, { useEffect, useRef } from 'react';\nimport { Terminal, ITerminalOptions } from 'xterm';\nimport { FitAddon } from '@xterm/addon-fit';\nimport 'xterm/css/xterm.css';\n\nexport interface XtermProps {\n  options?: ITerminalOptions;\n  onData?: (data: string)=> void;\n}\n\nexport function XtermTerminal({ options, onData }: XtermProps){\n  const ref = useRef<HTMLDivElement|null>(null);\n  const termRef = useRef<Terminal>();\n  useEffect(()=>{\n    if (!ref.current) return;\n    const term = new Terminal({\n      theme: { background: '#1e1e1e' },\n      cursorBlink: true,\n      ...options\n    });\n    const fit = new FitAddon();\n    term.loadAddon(fit);\n    term.open(ref.current);\n    fit.fit();\n    term.writeln('xterm ready');\n    const disp = term.onData(d => { onData?.(d); });\n    const onResize = () => fit.fit();\n    window.addEventListener('resize', onResize);\n    termRef.current = term;\n    return () => {\n      disp.dispose();\n      window.removeEventListener('resize', onResize);\n      term.dispose();\n    };\n  }, [ref.current]);\n  return <div ref={ref} style={{ height: 300, background: '#1e1e1e' }} />;\n}\n` });
      } else {
        files.push({ path: `src/components/XtermTerminal.jsx`, template: `import React, { useEffect, useRef } from 'react';\nimport { Terminal } from 'xterm';\nimport { FitAddon } from '@xterm/addon-fit';\nimport 'xterm/css/xterm.css';\n\nexport function XtermTerminal({ options, onData }){\n  const ref = useRef(null);\n  useEffect(()=>{\n    if (!ref.current) return;\n    const term = new Terminal({ theme: { background: '#1e1e1e' }, cursorBlink: true, ...(options||{}) });\n    const fit = new FitAddon();\n    term.loadAddon(fit);\n    term.open(ref.current);\n    fit.fit();\n    term.writeln('xterm ready');\n    const disp = term.onData(d => onData && onData(d));\n    const onResize = () => fit.fit();\n    window.addEventListener('resize', onResize);\n    return () => { disp.dispose(); window.removeEventListener('resize', onResize); term.dispose(); };\n  }, [ref.current]);\n  return <div ref={ref} style={{ height: 300, background: '#1e1e1e' }} />;\n}\n` });
      }
    }
    // hook: React用のカスタムフック
    if (pattern === 'hook') {
      files.push({ path: `src/hooks/useXterm.${jsExt}`, template: `import { useEffect, useRef } from 'react';\nimport { Terminal } from 'xterm';\nimport { FitAddon } from '@xterm/addon-fit';\nimport 'xterm/css/xterm.css';\n\nexport function useXterm(options){\n  const containerRef = useRef(null);\n  const termRef = useRef(null);\n  useEffect(()=>{\n    if (!containerRef.current) return;\n    const term = new Terminal({ theme: { background: '#1e1e1e' }, cursorBlink: true, ...(options||{}) });\n    const fit = new FitAddon();\n    term.loadAddon(fit);\n    term.open(containerRef.current);\n    fit.fit();\n    termRef.current = term;\n    const onResize = () => fit.fit();\n    window.addEventListener('resize', onResize);\n    return () => { window.removeEventListener('resize', onResize); term.dispose(); };\n  }, [containerRef.current]);\n  return { containerRef, term: termRef };\n}\n` });
    }
    // plugin/adapter: アドオンをまとめてロード
    if (pattern === 'plugin' || pattern === 'adapter') {
      files.push({ path: `src/xterm/addons.${jsExt}`, template: `import { WebLinksAddon } from '@xterm/addon-web-links';\nimport { FitAddon } from '@xterm/addon-fit';\nimport { SerializeAddon } from '@xterm/addon-serialize';\nexport function loadBasicAddons(term){\n  const fit = new FitAddon();\n  term.loadAddon(fit);\n  term.loadAddon(new WebLinksAddon());\n  term.loadAddon(new SerializeAddon());\n  return { fit };\n}\n` });
    }
    // config: テーマなどの共通設定
    if (pattern === 'config' || pattern === 'init') {
      files.push({ path: `src/xterm/config.${jsExt}`, template: `export const xtermTheme = {\n  background: '#1e1e1e',\n  foreground: '#d4d4d4',\n  cursor: '#cccccc',\n};\nexport const xtermDefaults = {\n  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',\n  allowProposedApi: true,\n  theme: xtermTheme,\n};\n` });
    }
  }

  // Docusaurus (React docs)
  if (lib === 'docusaurus' && (pattern === 'minimal' || pattern === 'init' || pattern === 'config')) {
    files.push({ path: `package.json`, template: `{
  \"name\": \"docusaurus-docs\",\n  \"private\": true,\n  \"scripts\": { \"start\": \"docusaurus start\", \"build\": \"docusaurus build\", \"serve\": \"docusaurus serve\" },\n  \"dependencies\": { \"@docusaurus/core\": \"latest\", \"@docusaurus/preset-classic\": \"latest\", \"react\": \"^18.0.0\", \"react-dom\": \"^18.0.0\" }
}\n` });
    files.push({ path: `docusaurus.config.js`, template: `// @ts-check\n/** @type {import('@docusaurus/types').Config} */\nmodule.exports = {\n  title: 'Docs', url: 'https://example.com', baseUrl: '/',\n  favicon: 'img/favicon.ico', organizationName: 'example', projectName: 'docs',\n  presets: [[ '@docusaurus/preset-classic', ({ docs: { sidebarPath: require.resolve('./sidebars.js') }, blog: false, theme: { customCss: [] } }) ]]
};\n` });
    files.push({ path: `sidebars.js`, template: `// @ts-check\n/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */\nmodule.exports = { docs: [{ type: 'autogenerated', dirName: '.' }] };\n` });
    files.push({ path: `docs/intro.md`, template: `---\nid: intro\nslug: /\ntitle: Introduction\n---\n\n# Docusaurus Minimal\n` });
  }

  // Lottie
  if (lib === 'lottie') {
    if (pattern === 'component' && (lang === 'ts' || lang === 'js')) {
      const isTs = lang === 'ts';
      const extx = isTs ? 'tsx' : 'jsx';
      files.push({ path: `src/ui/LottieDemo.${extx}`, template: `${isTs ? `import React, { useEffect, useState } from 'react';\n` : `import React, { useEffect, useState } from 'react';\n`}import Lottie from 'lottie-react';\nexport default function LottieDemo(){\n  const [data, setData] = useState(null as any);\n  const url = (typeof process !== 'undefined' && process.env && (process as any).env?.NEXT_PUBLIC_LOTTIE_URL) || 'https://assets9.lottiefiles.com/packages/lf20_5ngs2ksb.json';\n  useEffect(()=>{ let a=true; fetch(url).then(r=>r.json()).then(j=>{ if(a) setData(j); }); return ()=>{ a=false; }; },[url]);\n  return <div style={{ width: 240, height: 240 }}>{data ? <Lottie animationData={data} loop autoplay/> : 'Loading...'}</div>;\n}\n` });
    } else if (pattern === 'minimal') {
      files.push({ path: `index.html`, template: `<!doctype html>\n<html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>Lottie Minimal</title></head>\n<body style=\"font-family:sans-serif;padding:24px\">\n<h1>Lottie Minimal</h1>\n<div id=\"anim\" style=\"width:240px;height:240px;border:1px solid #ddd\"></div>\n<script src=\"https://unpkg.com/lottie-web/build/player/lottie.min.js\"></script>\n<script>\n  lottie.loadAnimation({ container: document.getElementById('anim'), renderer: 'svg', loop: true, autoplay: true, path: 'https://assets9.lottiefiles.com/packages/lf20_5ngs2ksb.json' });\n<\/script>\n</body></html>\n` });
    }
  }

  // Fallback: always provide at least one stub file for unknown combos
  if (files.length === 0) {
    const fallbackExt = (['ts','js','py','go','rs','kt'] as const).includes(ext as any) ? ext : 'md';
    const path = fallbackExt === 'md' ? `README.md` : `src/${lib}-${pattern}.${fallbackExt}`;
    files.push({ path, template: codeSnippet(lib, pattern, lang, style) });
  }

  // Prisma
  if (lib === 'prisma' && (pattern === 'crud' || pattern === 'service')) {
    files.push({ path: `src/prisma.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
    const advancedSchema = `datasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\ngenerator client { provider = \"prisma-client-js\" }\nmodel User { id Int @id @default(autoincrement()) email String @unique name String? posts Post[] createdAt DateTime @default(now()) deletedAt DateTime? }\nmodel Post { id Int @id @default(autoincrement()) slug String title String content String? author   User @relation(fields: [authorId], references: [id]) authorId Int tags Tag[] deletedAt DateTime? @@unique([authorId, slug]) }\nmodel Tag { id Int @id @default(autoincrement()) name String @unique posts Post[] }\n`;
    const basicSchema = `datasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\ngenerator client { provider = \"prisma-client-js\" }\nmodel User { id Int @id @default(autoincrement()) email String @unique name String? createdAt DateTime @default(now()) }\n`;
    files.push({ path: `prisma/schema.prisma`, template: (style === 'advanced' && pattern === 'crud') ? advancedSchema : basicSchema });
    if (pattern === 'service') {
      files.push({ path: `src/user.service.ts`, template: `import { prisma } from './prisma';\nexport async function createUserWithTx(email: string){\n  return await prisma.$transaction(async (tx)=>{\n    const user = await tx.user.create({ data: { email } });\n    return user;\n  });\n}\n` });
      if (style === 'advanced') {
        files.push({ path: `src/prisma.pagination.ts`, template: `import { prisma } from './prisma';\nexport async function listUsersPage(limit: number, cursor?: number){\n  const items = await prisma.user.findMany({ take: limit, skip: cursor ? 1 : 0, ...(cursor ? { cursor: { id: cursor } } : {}) });\n  const nextCursor = items.length === limit ? items[items.length-1].id : undefined;\n  return { items, nextCursor };\n}\nexport async function withRetry<T>(fn: ()=>Promise<T>, retries=3){\n  let lastErr: unknown;\n  for(let i=0;i<retries;i++){ try{ return await fn(); } catch(e){ lastErr = e; } }\n  throw lastErr;\n}\n` });
        files.push({ path: `src/prisma.dto.ts`, template: `export interface PageDTO<T> { items: T[]; nextCursor?: number }\nexport interface FilterDTO { term?: string; from?: string; to?: string }\n` });
        files.push({ path: `src/prisma.sort.ts`, template: `export type SortBy = 'id'|'createdAt'|'updatedAt';\nexport type SortOrder = 'asc'|'desc';\nexport function sortArg(sortBy?: SortBy, order: SortOrder='desc'){ return sortBy ? { [sortBy]: order } as any : undefined as any; }\n` });
        files.push({ path: `src/prisma.filters.ts`, template: `export type SortOrder = 'asc'|'desc';\nexport interface PageOpts { limit: number; cursor?: number; sortBy?: 'id'|'createdAt'; order?: SortOrder }\nexport function pageArgs<T extends { id: number }>(o: PageOpts){ const orderBy = o.sortBy ? { [o.sortBy]: o.order||'desc' } : undefined as any; return { take: o.limit, skip: o.cursor ? 1 : 0, ...(o.cursor ? { cursor: { id: o.cursor } } : {}), ...(orderBy ? { orderBy } : {}) }; }\n` });
      }
    }
    if (style === 'advanced' && pattern === 'crud') {
      files.push({ path: `src/post.service.ts`, template: `import { prisma } from './prisma';\nexport async function createPost(userId: number, slug: string, title: string){ return prisma.post.create({ data: { authorId: userId, slug, title } }); }\nexport async function listPosts(userId: number){ return prisma.post.findMany({ where: { authorId: userId, deletedAt: null } }); }\nexport async function softDeletePost(id: number){ return prisma.post.update({ where: { id }, data: { deletedAt: new Date() } }); }\nexport async function addTagToPost(postId: number, tagName: string){ return prisma.post.update({ where: { id: postId }, data: { tags: { connectOrCreate: { where: { name: tagName }, create: { name: tagName } } } } }); }\n` });
    }
  }

  // GraphQL and Apollo
  if (lib === 'graphql' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `schema.graphql`, template: `type Query { hello: String! }\n` });
    files.push({ path: `src/graphql/resolvers.ts`, template: `export const resolvers = { Query: { hello: () => 'world' } };\n` });
    if (style === 'advanced') {
      files.push({ path: `codegen.yml`, template: `schema: schema.graphql\ngenerates:\n  src/graphql/types.ts:\n    plugins:\n      - typescript\n` });
    }
  }
  if (lib === 'graphql' && pattern === 'client' && style === 'advanced') {
    files.push({ path: `src/graphql/useUpdateTitle.tsx`, template: `import { gql, useMutation } from '@apollo/client';\nconst UPDATE = gql\`mutation($id: ID!, $title: String!){ updateTitle(id:$id, title:$title){ id title } }\`;\nexport function useUpdateTitle(){\n  return useMutation(UPDATE, {\n    optimisticResponse: (vars)=>({ updateTitle: { __typename: 'Post', id: vars.id, title: vars.title } })\n  });\n}\n` });
    files.push({ path: `src/graphql/cache.ts`, template: `import type { ApolloCache, DefaultContext, MutationUpdaterFunction } from '@apollo/client';\nexport const noopUpdate: MutationUpdaterFunction<any, any, DefaultContext, ApolloCache<any>> = () => {};\n` });
    files.push({ path: `src/graphql/updateCache.ts`, template: `import type { ApolloCache } from '@apollo/client';\nexport function writePostTitle(cache: ApolloCache<any>, id: string, title: string){\n  cache.modify({ id: cache.identify({ __typename: 'Post', id }), fields: { title: () => title } });\n}\n` });
    files.push({ path: `src/graphql/fragments.ts`, template: `import { gql } from '@apollo/client';\nexport const POST_FIELDS = gql\`fragment PostFields on Post { id title }\`;\n` });
    files.push({ path: `src/graphql/cachePolicies.ts`, template: `import { InMemoryCache } from '@apollo/client';\nexport const cache = new InMemoryCache({ typePolicies: { Query: { fields: { posts: { merge: false } } } } });\n` });
  }
  if (lib === 'graphql' && pattern === 'client') {
    files.push({ path: `src/graphql/useHello.tsx`, template: `import { gql, useQuery } from '@apollo/client';\nconst HELLO = gql\`query { hello }\`;\nexport function useHello(){ return useQuery(HELLO); }\n` });
  }
  if (lib === 'apollo' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/apollo/server.ts`, template: `import { ApolloServer } from '@apollo/server';\nimport { startStandaloneServer } from '@apollo/server/standalone';\nconst typeDefs = \`type Query { hello: String! }\`;\nconst resolvers = { Query: { hello: () => 'world' } };\nconst server = new ApolloServer({ typeDefs, resolvers });\nstartStandaloneServer(server, { listen: { port: 4000 } });\n` });
    if (style === 'advanced') {
      files.push({ path: `src/apollo/federation.ts`, template: `// Apollo Federation setup placeholder\nexport const federated = true;\n` });
      files.push({ path: `src/apollo/subscriptions.ts`, template: `// GraphQL subscriptions (placeholder)\nexport const subscriptionsEnabled = true;\n` });
    }
  }
  if (lib === 'apollo' && pattern === 'client') {
    files.push({ path: `src/apollo/client.ts`, template: `import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';\nexport const client = new ApolloClient({ link: new HttpLink({ uri: '/api/graphql' }), cache: new InMemoryCache() });\n` });
  }

  // OpenAI
  if (lib === 'openai' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/openai/chat.ts`, template: `import OpenAI from 'openai';\nconst apiKey = process.env.OPENAI_API_KEY!;\nconst client = new OpenAI({ apiKey });\nexport async function chat(prompt: string){\n  const res = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });\n  return res.choices[0]?.message?.content || '';\n}\n` });
  }

  // LangChain
  if (lib === 'langchain' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/langchain/basic.ts`, template: `import { ChatOpenAI } from '@langchain/openai';\nimport { ChatPromptTemplate } from '@langchain/core/prompts';\nexport async function run(prompt: string){\n  const llm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: process.env.OPENAI_API_KEY });\n  const tpl = ChatPromptTemplate.fromMessages([['system','You are helpful.'],['human','{input}']]);\n  const chain = tpl.pipe(llm);\n  const res = await chain.invoke({ input: prompt });\n  return res?.content?.toString?.() || String(res);\n}\n` });
  }

  // BullMQ
  if (lib === 'bullmq' && (pattern === 'service' || pattern === 'job')) {
    files.push({ path: `src/queue/queue.ts`, template: `import { Queue } from 'bullmq';\nexport const queue = new Queue('jobs', { connection: { host: '127.0.0.1', port: 6379 } });\nexport async function enqueue(name: string, data: any){ return queue.add(name, data); }\n` });
    files.push({ path: `src/queue/worker.ts`, template: `import { Worker } from 'bullmq';\nexport const worker = new Worker('jobs', async (job)=>{ console.log('job', job.name, job.data); }, { connection: { host: '127.0.0.1', port: 6379 } });\n` });
  }

  // AWS Lambda
  if (lib === 'aws-lambda' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/lambda/handler.ts`, template: `import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';\nexport async function handler(_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2>{\n  return { statusCode: 200, body: JSON.stringify({ ok: true }) };\n}\n` });
  }

  // Cypress
  if (lib === 'cypress' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `cypress.config.ts`, template: `import { defineConfig } from 'cypress';\nexport default defineConfig({ e2e: { baseUrl: 'http://localhost:3000' } });\n` });
    files.push({ path: `cypress/e2e/spec.cy.ts`, template: `describe('home', () => { it('loads', () => { cy.visit('/'); cy.contains('html'); }); });\n` });
  }

  // tRPC
  if (lib === 'trpc' && (pattern === 'service' || pattern === 'server')) {
    files.push({ path: `src/trpc/context.ts`, template: `export type Context = {};\nexport async function createContext(): Promise<Context> { return {}; }\n` });
    files.push({ path: `src/trpc/router.ts`, template: `import { initTRPC } from '@trpc/server';\nconst t = initTRPC.context<{}>().create();\nexport const appRouter = t.router({ hello: t.procedure.query(()=> 'world') });\nexport type AppRouter = typeof appRouter;\n` });
    files.push({ path: `src/trpc/server.ts`, template: `import { createHTTPServer } from '@trpc/server/adapters/standalone';\nimport { appRouter } from './router';\nconst server = createHTTPServer({ router: appRouter });\nserver.listen(20222);\n` });
  }
  if (lib === 'trpc' && pattern === 'client') {
    files.push({ path: `src/trpc/client.ts`, template: `import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';\nimport type { AppRouter } from './router';\nexport const client = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url: '/trpc' })] });\n` });
  }

  // Drizzle ORM
  if (lib === 'drizzle' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `drizzle.config.ts`, template: `import type { Config } from 'drizzle-kit';\nexport default { schema: './src/db/schema.ts', out: './drizzle', driver: 'pg', dbCredentials: { connectionString: process.env.DATABASE_URL! } } satisfies Config;\n` });
    files.push({ path: `src/db/schema.ts`, template: `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';\nexport const posts = pgTable('posts', { id: serial('id').primaryKey(), title: text('title').notNull(), createdAt: timestamp('created_at').defaultNow() });\n` });
    files.push({ path: `src/db/client.ts`, template: `import { drizzle } from 'drizzle-orm/node-postgres';\nimport { Pool } from 'pg';\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });\nexport const db = drizzle(pool);\n` });
    files.push({ path: `src/db/migrate.ts`, template: `import { migrate } from 'drizzle-orm/node-postgres/migrator';\nimport { db } from './client';\nimport { Client } from 'pg';\n(async()=>{ const client = new Client({ connectionString: process.env.DATABASE_URL }); await client.connect(); await migrate(db, { migrationsFolder: 'drizzle' }); await client.end(); })().catch(e=>{ console.error(e); process.exit(1); });\n` });
  }

  // Prisma (schema/client)
  if (lib === 'prisma' && pattern === 'schema') {
    files.push({ path: `prisma/schema.prisma`, template: `generator client { provider = \"prisma-client-js\" }\ndatasource db { provider = \"postgresql\" url = env(\"DATABASE_URL\") }\n\nmodel {{model}} {\n  id    Int     @id @default(autoincrement())\n  name  String\n  createdAt DateTime @default(now())\n}\n` });
    files.push({ path: `src/db/client.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
  }
  if (lib === 'prisma' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/db/client.ts`, template: `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n` });
  }

  // Redis
  if (lib === 'redis' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/cache/redis.ts`, template: `import { createClient } from 'redis';\nconst url = process.env.REDIS_URL || 'redis://localhost:6379';\nexport const redis = createClient({ url });\nredis.on('error', (e)=> console.error('Redis error', e));\nexport async function connect(){ if(!redis.isOpen) await redis.connect(); }\nexport async function get(key: string){ await connect(); return redis.get(key); }\nexport async function set(key: string, val: string, ttl?: number){ await connect(); if (ttl) return redis.set(key, val, { EX: ttl }); return redis.set(key, val); }\n` });
  }

  // Stripe
  if (lib === 'stripe' && (pattern === 'service' || pattern === 'webhook' || pattern === 'route')) {
    files.push({ path: `src/payments/stripe.ts`, template: `import Stripe from 'stripe';\nconst apiKey = process.env.STRIPE_API_KEY || '';\nexport const stripe = new Stripe(apiKey, { apiVersion: '2024-06-20' as any });\nexport async function createCheckoutSession(priceId: string){\n  return stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }], success_url: 'https://example.com/success', cancel_url: 'https://example.com/cancel' });\n}\n` });
    if (pattern === 'webhook' || pattern === 'route') {
      files.push({ path: `app/api/stripe/webhook/route.ts`, template: `import { NextResponse } from 'next/server';\nimport Stripe from 'stripe';\nconst stripe = new Stripe(process.env.STRIPE_API_KEY || '', { apiVersion: '2024-06-20' as any });\nconst endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';\nexport async function POST(req: Request){\n  const sig = req.headers.get('stripe-signature') || '';\n  const body = await req.text();\n  let event: Stripe.Event;\n  try { event = stripe.webhooks.constructEvent(body, sig, endpointSecret); }\n  catch (err){ return new NextResponse('invalid signature', { status: 400 }); }\n  switch(event.type){ case 'checkout.session.completed': break; default: break; }\n  return NextResponse.json({ received: true });\n}\n` });
    }
  }

  // Object storage adapters
  if (lib === 's3' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/s3.ts`, template: `import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';\nconst region = process.env.AWS_REGION || '{{region}}';\nexport const s3 = new S3Client({ region });\nexport async function putObject(bucket: string, key: string, body: Uint8Array){ await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body })); }\nexport async function getObject(bucket: string, key: string){ return s3.send(new GetObjectCommand({ Bucket: bucket, Key: key })); }\n` });
  }
  if (lib === 'gcs' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/gcs.ts`, template: `import { Storage } from '@google-cloud/storage';\nexport const gcs = new Storage();\nexport async function upload(bucket: string, filename: string, buffer: Buffer){ const b = gcs.bucket(bucket); const file = b.file(filename); await file.save(buffer); return file.publicUrl(); }\n` });
  }
  if (lib === 'azure-blob' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/azureBlob.ts`, template: `import { BlobServiceClient } from '@azure/storage-blob';\nconst conn = process.env.AZURE_STORAGE_CONNECTION_STRING || '';\nexport const blob = BlobServiceClient.fromConnectionString(conn);\nexport async function put(container: string, name: string, data: Uint8Array){ const c = blob.getContainerClient(container); const block = c.getBlockBlobClient(name); await block.uploadData(data); }\n` });
  }
  if (lib === 'minio' && (pattern === 'adapter' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/storage/minio.ts`, template: `import * as Minio from 'minio';\nexport const minio = new Minio.Client({ endPoint: process.env.MINIO_ENDPOINT || 'localhost', port: parseInt(process.env.MINIO_PORT||'9000',10), useSSL: false, accessKey: process.env.MINIO_ACCESS_KEY||'', secretKey: process.env.MINIO_SECRET_KEY||'' });\nexport async function put(bucket: string, name: string, data: Buffer){ await minio.putObject(bucket, name, data); }\n` });
  }

  // Search clients
  if (lib === 'meilisearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/meilisearch.ts`, template: `import { MeiliSearch } from 'meilisearch';\nexport const meili = new MeiliSearch({ host: process.env.MEILI_HOST || 'http://127.0.0.1:7700', apiKey: process.env.MEILI_API_KEY });\nexport async function indexDoc(index: string, doc: any){ const i = meili.index(index); return i.addDocuments([doc]); }\n` });
  }
  if (lib === 'typesense' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/typesense.ts`, template: `import Typesense from 'typesense';\nexport const typesense = new (Typesense as any)({ nodes: [{ host: process.env.TS_HOST || 'localhost', port: parseInt(process.env.TS_PORT||'8108',10), protocol: 'http' }], apiKey: process.env.TS_API_KEY || 'xyz' });\nexport async function indexDoc(collection: string, doc: any){ return typesense.collections(collection).documents().upsert(doc); }\n` });
  }

  // Docker
  if (lib === 'docker' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `Dockerfile`, template: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD [\"npm\", \"start\"]\n` });
    files.push({ path: `docker-compose.yml`, template: `version: '3.9'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      - NODE_ENV=production\n` });
    if (style === 'advanced') {
      files.push({ path: `cloudrun.yaml`, template: `apiVersion: serving.knative.dev/v1\nkind: Service\nmetadata: { name: app }\nspec: { template: { spec: { containers: [{ image: gcr.io/PROJECT/IMAGE:TAG }], containerConcurrency: 80 } } }\n` });
      files.push({ path: `render.yaml`, template: `services:\n  - type: web\n    name: app\n    env: node\n    plan: starter\n    buildCommand: npm ci && npm run build\n    startCommand: npm start\n` });
      files.push({ path: `fly.toml`, template: `app = \"app\"\n[[services]]\n  internal_port = 3000\n  processes = [\"app\"]\n` });
    }
  }

  // Kafka
  if (lib === 'kafka' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/kafka/producer.ts`, template: `import { Kafka } from 'kafkajs';\nconst kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });\nexport async function produce(topic: string, message: string){ const p = kafka.producer(); await p.connect(); await p.send({ topic, messages: [{ value: message }] }); await p.disconnect(); }\n` });
    files.push({ path: `src/kafka/consumer.ts`, template: `import { Kafka } from 'kafkajs';\nconst kafka = new Kafka({ clientId: 'app', brokers: ['localhost:9092'] });\nexport async function consume(topic: string){ const c = kafka.consumer({ groupId: 'group' }); await c.connect(); await c.subscribe({ topic, fromBeginning: true }); await c.run({ eachMessage: async ({ message }) => console.log(message.value?.toString()) }); }\n` });
  }

  // Playwright
  if (lib === 'playwright' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `playwright.config.ts`, template: `import { defineConfig } from '@playwright/test';\nexport default defineConfig({ use: { headless: true } });\n` });
    files.push({ path: `tests/example.spec.ts`, template: `import { test, expect } from '@playwright/test';\ntest('homepage', async ({ page }) => { await page.goto('https://example.com'); await expect(page).toHaveTitle(/Example/); });\n` });
  }

  // Fastify
  if (lib === 'fastify' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/fastify/server.ts`, template: `import Fastify from 'fastify';\nconst app = Fastify();\napp.get('/', async ()=> ({ ok: true }));\napp.listen({ port: 3000 });\n` });
  }

  // Hono
  if (lib === 'hono' && (pattern === 'route' || pattern === 'service')) {
    files.push({ path: `src/hono/server.ts`, template: `import { Hono } from 'hono';\nconst app = new Hono();\napp.get('/hello', (c)=> c.json({ ok: true }));\nexport default app;\n` });
  }

  // RabbitMQ
  if (lib === 'rabbitmq' && (pattern === 'service' || pattern === 'job')) {
    files.push({ path: `src/rabbitmq/publisher.ts`, template: `import amqplib from 'amqplib';\nexport async function publish(queue: string, msg: string){ const conn = await amqplib.connect('amqp://localhost'); const ch = await conn.createChannel(); await ch.assertQueue(queue); ch.sendToQueue(queue, Buffer.from(msg)); await ch.close(); await conn.close(); }\n` });
    files.push({ path: `src/rabbitmq/consumer.ts`, template: `import amqplib from 'amqplib';\nexport async function consume(queue: string){ const conn = await amqplib.connect('amqp://localhost'); const ch = await conn.createChannel(); await ch.assertQueue(queue); await ch.consume(queue, (msg)=>{ if(msg){ console.log(msg.content.toString()); ch.ack(msg); } }); }\n` });
  }

  // NATS
  if (lib === 'nats' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/nats/pub.ts`, template: `import { connect, StringCodec } from 'nats';\nexport async function pub(subject: string, message: string){ const nc = await connect({ servers: 'localhost:4222' }); const sc = StringCodec(); nc.publish(subject, sc.encode(message)); await nc.drain(); }\n` });
    files.push({ path: `src/nats/sub.ts`, template: `import { connect, StringCodec } from 'nats';\nexport async function sub(subject: string){ const nc = await connect({ servers: 'localhost:4222' }); const sc = StringCodec(); const sub = nc.subscribe(subject); for await (const m of sub){ console.log(sc.decode(m.data)); } }\n` });
  }

  // AWS SQS
  if (lib === 'sqs' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/sqs.ts`, template: `import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';\nconst client = new SQSClient({});\nexport async function send(queueUrl: string, body: string){ await client.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: body })); }\nexport async function receive(queueUrl: string){ const out = await client.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 1 })); const msg = out.Messages?.[0]; if(msg){ await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: msg.ReceiptHandle! })); return msg.Body; } return undefined; }\n` });
  }

  // AWS SNS
  if (lib === 'sns' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/sns.ts`, template: `import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';\nconst client = new SNSClient({});\nexport async function publish(topicArn: string, message: string){ await client.send(new PublishCommand({ TopicArn: topicArn, Message: message })); }\n` });
  }

  // AWS Kinesis
  if (lib === 'kinesis' && (pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/aws/kinesis.ts`, template: `import { KinesisClient, PutRecordCommand } from '@aws-sdk/client-kinesis';\nconst client = new KinesisClient({});\nexport async function put(streamName: string, data: string, partitionKey='pk'){ await client.send(new PutRecordCommand({ StreamName: streamName, Data: new TextEncoder().encode(data), PartitionKey: partitionKey })); }\n` });
  }

  // Koa
  if (lib === 'koa' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/koa/server.ts`, template: `import Koa from 'koa';\nconst app = new Koa();\napp.use(async (ctx)=>{ ctx.body = { ok: true }; });\napp.listen(3000);\n` });
  }

  // NestJS
  if (lib === 'nestjs' && (pattern === 'service' || pattern === 'init')) {
    files.push({ path: `src/nest/main.ts`, template: `import { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module';\nasync function bootstrap(){ const app = await NestFactory.create(AppModule); await app.listen(3000); }\nbootstrap();\n` });
    files.push({ path: `src/nest/app.module.ts`, template: `import { Module } from '@nestjs/common';\nimport { AppController } from './app.controller';\n@Module({ controllers: [AppController] })\nexport class AppModule {}\n` });
    files.push({ path: `src/nest/app.controller.ts`, template: `import { Controller, Get } from '@nestjs/common';\n@Controller()\nexport class AppController { @Get() hello(){ return { ok: true }; } }\n` });
  }

  // Hapi
  if (lib === 'hapi' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/hapi/server.ts`, template: `import Hapi from '@hapi/hapi';\nasync function start(){ const server = Hapi.server({ port:3000, host:'localhost' }); server.route({ method: 'GET', path: '/', handler: ()=> ({ ok: true }) }); await server.start(); }\nstart();\n` });
  }

  // Mongoose
  if (lib === 'mongoose' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/mongoose/conn.ts`, template: `import mongoose from 'mongoose';\nexport async function connect(uri: string){ await mongoose.connect(uri); }\n` });
    files.push({ path: `src/mongoose/user.model.ts`, template: `import { Schema, model } from 'mongoose';\nconst schema = new Schema({ email: { type: String, unique: true }, name: String });\nexport const User = model('User', schema);\n` });
  }

  // Sequelize
  if (lib === 'sequelize' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/sequelize/index.ts`, template: `import { Sequelize, DataTypes } from 'sequelize';\nexport const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:');\nexport const User = sequelize.define('User', { email: { type: DataTypes.STRING, unique: true }, name: DataTypes.STRING });\n` });
  }

  // TypeORM
  if (lib === 'typeorm' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/typeorm/data-source.ts`, template: `import 'reflect-metadata';\nimport { DataSource } from 'typeorm';\nexport const AppDataSource = new DataSource({ type: 'sqlite', database: ':memory:', entities: [__dirname + '/**/*.ts'], synchronize: true });\n` });
    files.push({ path: `src/typeorm/User.ts`, template: `import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';\n@Entity() export class User { @PrimaryGeneratedColumn() id!: number; @Column({ unique: true }) email!: string; @Column({ nullable: true }) name?: string; }\n` });
  }

  // Neo4j
  if (lib === 'neo4j' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/neo4j/driver.ts`, template: `import neo4j from 'neo4j-driver';\nexport const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j','password'));\n` });
  }

  // OpenAPI / Swagger
  if (lib === 'openapi' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `openapi.yaml`, template: `openapi: 3.0.0\ninfo: { title: API, version: 1.0.0 }\npaths:\n  /hello:\n    get:\n      responses:\n        '200': { description: ok }\n` });
    if (pattern === 'service') {
      files.push({ path: `src/openapi/server.ts`, template: `import express from 'express';\nimport swaggerUi from 'swagger-ui-express';\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport YAML from 'yaml';\nconst app = express();\nconst spec = YAML.parse(fs.readFileSync(path.resolve('openapi.yaml'), 'utf-8'));\napp.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));\napp.listen(3000);\n` });
    }
  }
  if (lib === 'swagger' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/swagger/server.ts`, template: `import express from 'express';\nimport swaggerUi from 'swagger-ui-express';\nimport YAML from 'yamljs';\nconst app = express();\nconst doc = YAML.parse('openapi: 3.0.0\\ninfo: { title: API, version: 1.0.0 }');\napp.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));\napp.listen(3000);\n` });
  }

  // Express Security and OpenTelemetry
  if (lib === 'express' && pattern === 'config') {
    files.push({ path: `src/express/security.ts`, template: `import express from 'express';\nimport helmet from 'helmet';\nimport cors from 'cors';\nexport function createApp(){ const app = express(); app.use(helmet()); app.use(cors()); return app; }\n` });
    if (style === 'advanced') {
      files.push({ path: `src/otel/tracer.ts`, template: `import { NodeSDK } from '@opentelemetry/sdk-node';\nimport { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';\nimport { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';\nexport function setupOtel(){ const sdk = new NodeSDK(); (sdk as any)._tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); sdk.start(); return sdk; }\n` });
      files.push({ path: `src/otel/instrument.ts`, template: `import { setupOtel } from './tracer';\nconst sdk = setupOtel();\nprocess.on('SIGTERM', ()=> sdk.shutdown().finally(()=> process.exit(0)));\n` });
    }
  }

  // Fastify OpenTelemetry stub (advanced)
  if (lib === 'fastify' && style === 'advanced') {
    files.push({ path: `src/otel/fastify.ts`, template: `// Fastify OpenTelemetry setup (stub)\nexport function setupFastifyOtel(){ /* integrate @opentelemetry/instrumentation-fastify here */ }\n` });
  }

  // Next.js security headers helper (advanced)
  if (lib === 'nextjs' && style === 'advanced') {
    files.push({ path: `src/next/security-headers.ts`, template: `export const securityHeaders = [\n  { key: 'X-Frame-Options', value: 'DENY' },\n  { key: 'X-Content-Type-Options', value: 'nosniff' },\n  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }\n];\n` });
  }

  // CI workflows for migrations/deploy (advanced)
  if (lib === 'drizzle' && style === 'advanced') {
    files.push({ path: `.github/workflows/drizzle-migrate.yml`, template: `name: Drizzle Migrate\non: [push]\njobs:\n  migrate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: node src/db/migrate.ts\n` });
  }
  if (lib === 'knex' && style === 'advanced') {
    files.push({ path: `.github/workflows/knex-migrate.yml`, template: `name: Knex Migrate\non: [push]\njobs:\n  migrate:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npx knex migrate:latest --knexfile knexfile.ts\n` });
  }
  if (lib === 'docker' && style === 'advanced') {
    files.push({ path: `.github/workflows/cloudrun-deploy.yml`, template: `name: Deploy Cloud Run\non: [workflow_dispatch]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo 'stub deploy to Cloud Run'\n` });
  }

  // Relay
  if (lib === 'relay' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/relay/environment.ts`, template: `import { Environment, Network, RecordSource, Store } from 'relay-runtime';\nfunction fetchQuery(_operation: any, _variables: any){ return Promise.resolve({ data: {} }); }\nexport const relayEnv = new Environment({ network: Network.create(fetchQuery), store: new Store(new RecordSource()) });\n` });
  }

  // URQL
  if (lib === 'urql' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/urql/client.ts`, template: `import { createClient } from 'urql';\nexport const client = createClient({ url: '/graphql' });\n` });
  }

  // GraphQL Yoga
  if (lib === 'graphql-yoga' && (pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/graphql/yoga.ts`, template: `import { createYoga, createSchema } from 'graphql-yoga';\nimport http from 'node:http';\nconst yoga = createYoga({ schema: createSchema({ typeDefs: 'type Query { hello: String! }', resolvers: { Query: { hello: ()=> 'world' } } }) });\nhttp.createServer(yoga).listen(4000);\n` });
  }

  // Sentry
  if (lib === 'sentry' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/sentry/init.ts`, template: `import * as Sentry from '@sentry/node';\nexport function initSentry(){\n  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });\n}\n` });
  }

  // Stripe
  if (lib === 'stripe' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/stripe/client.ts`, template: `import Stripe from 'stripe';\nexport const stripe = new Stripe(process.env.STRIPE_API_KEY || '', { apiVersion: '2024-06-20' as any });\n` });
  }

  // PostHog
  if (lib === 'posthog' && (pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/analytics/posthog.ts`, template: `import { PostHog } from 'posthog-node';\nexport const posthog = new PostHog(process.env.POSTHOG_KEY || '', { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' });\n` });
  }

  // shadcn/ui (very light stub)
  if (lib === 'shadcn' && (pattern === 'init' || pattern === 'config')) {
    files.push({ path: `components/ui/button.tsx`, template: `import * as React from 'react';\nexport function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>){ return <button {...props} className={(props.className||'') + ' inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium'} /> }\n` });
  }

  // Supabase
  if (lib === 'supabase' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/supabase/client.ts`, template: `import { createClient } from '@supabase/supabase-js';\nexport const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');\n` });
    if (style === 'advanced' && pattern === 'service') {
      files.push({ path: `src/supabase/auth.ts`, template: `import { supabase } from './client';\nexport async function getUser(){ const { data } = await supabase.auth.getUser(); return data.user; }\n` });
    }
  }

  // Auth providers: basic init stubs
  if (lib === 'auth0' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/auth0/client.ts`, template: `export function createAuth0(){ return { domain: process.env.AUTH0_DOMAIN, clientId: process.env.AUTH0_CLIENT_ID }; }\n` });
  }
  if (lib === 'clerk' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/clerk/client.ts`, template: `export function createClerk(){ return { publishableKey: process.env.CLERK_PUBLISHABLE_KEY }; }\n` });
  }
  if (lib === 'lucia' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/lucia/auth.ts`, template: `export function lucia(){ /* configure lucia here */ return {}; }\n` });
  }
  if (lib === 'keycloak' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/keycloak/client.ts`, template: `export function keycloak(){ return { serverUrl: process.env.KEYCLOAK_URL, realm: process.env.KEYCLOAK_REALM }; }\n` });
  }
  if (lib === 'firebase-auth' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/firebase/auth.ts`, template: `export function initFirebaseAuth(){ return { projectId: process.env.FIREBASE_PROJECT_ID }; }\n` });
  }
  if (lib === 'cognito' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/cognito/client.ts`, template: `export function createCognito(){ return { userPoolId: process.env.COGNITO_USER_POOL_ID, clientId: process.env.COGNITO_CLIENT_ID }; }\n` });
  }
  if (lib === 'supabase-auth' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/supabase/auth-server.ts`, template: `export function supabaseAuth(){ return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_KEY }; }\n` });
  }
  if (lib === 'ory' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/ory/client.ts`, template: `export function createOry(){ return { project: process.env.ORY_PROJECT_ID }; }\n` });
  }

  // Storage clients
  if (lib === 's3' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/aws/s3.ts`, template: `export function s3(){ return { bucket: process.env.S3_BUCKET }; }\n` });
  }
  if (lib === 'gcs' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/gcp/storage.ts`, template: `export function gcs(){ return { bucket: process.env.GCS_BUCKET }; }\n` });
  }
  if (lib === 'azure-blob' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/azure/blob.ts`, template: `export function azureBlob(){ return { container: process.env.AZURE_BLOB_CONTAINER }; }\n` });
  }

  // Logging/metrics
  if (lib === 'pino' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/logging/pino.ts`, template: `export function logger(){ return { info: console.log, error: console.error }; }\n` });
  }
  if (lib === 'winston' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/logging/winston.ts`, template: `export function logger(){ return { info: console.log, error: console.error }; }\n` });
  }
  if (lib === 'prometheus' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/metrics/prometheus.ts`, template: `export function metrics(){ return { register: {} as any }; }\n` });
  }

  // AWS/GCP messaging clients specializations
  if (lib === 'sns' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/aws/sns.ts`, template: `export async function publishSNS(topicArn: string, message: string){ /* stub */ return { topicArn, message }; }\n` });
  }
  if (lib === 'kinesis' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/aws/kinesis.ts`, template: `export async function putRecord(stream: string, data: string){ /* stub */ return { stream, data }; }\n` });
  }
  if (lib === 'pubsub' && (pattern === 'service' || pattern === 'client' || pattern === 'config')) {
    files.push({ path: `src/gcp/pubsub.ts`, template: `export async function publish(topic: string, msg: string){ /* stub */ return { topic, msg }; }\n` });
  }

  // Redis
  if (lib === 'redis' && (pattern === 'config' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/redis/client.ts`, template: `export function redis(){ return { url: process.env.REDIS_URL || 'redis://localhost:6379' }; }\n` });
  }

  // Vector DB clients
  if (lib === 'pinecone' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/pinecone.ts`, template: `export function pinecone(){ return { apiKey: process.env.PINECONE_API_KEY, index: process.env.PINECONE_INDEX }; }\n` });
  }
  if (lib === 'weaviate' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/weaviate.ts`, template: `export function weaviate(){ return { url: process.env.WEAVIATE_URL, apiKey: process.env.WEAVIATE_API_KEY }; }\n` });
  }
  if (lib === 'milvus' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/milvus.ts`, template: `export function milvus(){ return { address: process.env.MILVUS_ADDR || 'localhost:19530' }; }\n` });
  }
  if (lib === 'qdrant' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/vectors/qdrant.ts`, template: `export function qdrant(){ return { url: process.env.QDRANT_URL || 'http://localhost:6333' }; }\n` });
  }

  // Email providers
  if (lib === 'resend' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/resend.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'resend' && pattern === 'route') {
    files.push({ path: `app/api/email/send/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { sendEmail } from '@/src/email/resend';\nexport async function POST(req: Request){ const json = await req.json(); await sendEmail(json.to, json.subject); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'sendgrid' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/sendgrid.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'sendgrid' && pattern === 'route') {
    files.push({ path: `app/api/email/send/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { sendEmail } from '@/src/email/sendgrid';\nexport async function POST(req: Request){ const json = await req.json(); await sendEmail(json.to, json.subject); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'postmark' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/postmark.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }
  if (lib === 'nodemailer' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/nodemailer.ts`, template: `export async function sendEmail(to: string, subject: string){ /* stub */ return { to, subject }; }\n` });
  }

  // Search/index providers
  if (lib === 'algolia' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/algolia.ts`, template: `export function algolia(){ return { appId: process.env.ALGOLIA_APP_ID, apiKey: process.env.ALGOLIA_API_KEY, index: process.env.ALGOLIA_INDEX }; }\n` });
  }
  if (lib === 'meilisearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/meilisearch.ts`, template: `export function meilisearch(){ return { host: process.env.MEILI_HOST || 'http://localhost:7700', apiKey: process.env.MEILI_API_KEY }; }\n` });
  }
  if (lib === 'typesense' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/typesense.ts`, template: `export function typesense(){ return { host: process.env.TYPESENSE_HOST || 'localhost', apiKey: process.env.TYPESENSE_API_KEY }; }\n` });
  }

  // Realtime
  if (lib === 'socket.io' && (pattern === 'service' || pattern === 'server' || pattern === 'config')) {
    files.push({ path: `src/realtime/socketio.ts`, template: `export function socketio(){ return { server: 'stub' }; }\n` });
  }
  if (lib === 'pusher' && pattern === 'route') {
    files.push({ path: `app/api/realtime/publish/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { pusher } from '@/src/realtime/pusher';\nexport async function POST(req: Request){ const json = await req.json(); const client = pusher(); return NextResponse.json({ ok: true, channel: json.channel }); }\n` });
  }
  if (lib === 'pusher' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/realtime/pusher.ts`, template: `export function pusher(){ return { appId: process.env.PUSHER_APP_ID }; }\n` });
  }
  if (lib === 'ably' && pattern === 'route') {
    files.push({ path: `app/api/realtime/publish/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { ably } from '@/src/realtime/ably';\nexport async function POST(req: Request){ const json = await req.json(); const client = ably(); return NextResponse.json({ ok: true, channel: json.channel }); }\n` });
  }
  if (lib === 'ably' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/realtime/ably.ts`, template: `export function ably(){ return { apiKey: process.env.ABLY_API_KEY }; }\n` });
  }

  // APM/Monitoring
  if (lib === 'datadog' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/apm/datadog.ts`, template: `export function datadog(){ return { enabled: true }; }\n` });
  }
  if (lib === 'newrelic' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/apm/newrelic.ts`, template: `export function newrelic(){ return { enabled: true }; }\n` });
  }

  // Feature flags
  if (lib === 'launchdarkly' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/flags/launchdarkly.ts`, template: `export function ld(){ return { sdkKey: process.env.LD_SDK_KEY }; }\n` });
  }
  if (lib === 'launchdarkly' && pattern === 'route') {
    files.push({ path: `app/api/flags/get/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { ld } from '@/src/flags/launchdarkly';\nexport async function GET(){ const client = ld(); return NextResponse.json({ ok: true, flag: 'example', value: true }); }\n` });
  }
  if (lib === 'unleash' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/flags/unleash.ts`, template: `export function unleash(){ return { url: process.env.UNLEASH_URL }; }\n` });
  }

  // Secrets
  if (lib === 'vault' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/secrets/vault.ts`, template: `export function vault(){ return { addr: process.env.VAULT_ADDR || 'http://127.0.0.1:8200' }; }\n` });
  }
  if (lib === 'vault' && pattern === 'route') {
    files.push({ path: `app/api/secrets/get/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { vault } from '@/src/secrets/vault';\nexport async function GET(){ const v = vault(); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'doppler' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/secrets/doppler.ts`, template: `export function doppler(){ return { project: process.env.DOPPLER_PROJECT }; }\n` });
  }

  // Extra storage/search
  if (lib === 'minio' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/storage/minio.ts`, template: `export function minio(){ return { endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000' }; }\n` });
  }
  if (lib === 'elasticsearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/elasticsearch.ts`, template: `export function elastic(){ return { node: process.env.ELASTIC_NODE || 'http://localhost:9200' }; }\n` });
  }
  if (lib === 'opensearch' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/search/opensearch.ts`, template: `export function opensearch(){ return { node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' }; }\n` });
  }

  // IoT/Cache/CDN
  if (lib === 'mqtt' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/iot/mqtt.ts`, template: `export function mqtt(){ return { url: process.env.MQTT_URL || 'mqtt://localhost:1883' }; }\n` });
  }
  if (lib === 'memcached' && (pattern === 'client' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/cache/memcached.ts`, template: `export function memcached(){ return { server: process.env.MEMCACHED_SERVER || '127.0.0.1:11211' }; }\n` });
  }
  if (lib === 'cloudflare-workers' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/cloudflare/worker.ts`, template: `export default { fetch(){ return new Response('ok'); } };\n` });
  }

  // i18n
  if (lib === 'i18next' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/i18n/i18next.ts`, template: `export const i18n = { lng: 'en', resources: { en: { translation: { hello: 'Hello' } } } };\n` });
  }
  if (lib === 'next-intl' && (pattern === 'config' || pattern === 'init' || pattern === 'route')) {
    files.push({ path: `src/i18n/next-intl.ts`, template: `export const messages = { en: { hello: 'Hello' }, ja: { hello: 'こんにちは' } };\n` });
    if (pattern === 'route') {
      files.push({ path: `app/api/i18n/hello/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { messages } from '@/src/i18n/next-intl';\nexport async function GET(){ return NextResponse.json({ msg: messages.en.hello }); }\n` });
    }
  }

  // CMS
  if (lib === 'strapi' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/strapi.ts`, template: `export function strapi(){ return { url: process.env.STRAPI_URL || 'http://localhost:1337' }; }\n` });
  }
  if (lib === 'contentful' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/contentful.ts`, template: `export function contentful(){ return { space: process.env.CONTENTFUL_SPACE_ID }; }\n` });
  }
  if (lib === 'sanity' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/sanity.ts`, template: `export function sanity(){ return { projectId: process.env.SANITY_PROJECT_ID }; }\n` });
  }
  if (lib === 'ghost' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/cms/ghost.ts`, template: `export function ghost(){ return { url: process.env.GHOST_URL }; }\n` });
  }

  // Additional AI providers
  if (lib === 'groq' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/groq.ts`, template: `export function groq(){ return { apiKey: process.env.GROQ_API_KEY }; }\n` });
  }
  if (lib === 'mistral' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/mistral.ts`, template: `export function mistral(){ return { apiKey: process.env.MISTRAL_API_KEY }; }\n` });
  }
  if (lib === 'cohere' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/ai/cohere.ts`, template: `export function cohere(){ return { apiKey: process.env.COHERE_API_KEY }; }\n` });
  }

  // Analytics
  if (lib === 'segment' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/segment.ts`, template: `export function segment(){ return { writeKey: process.env.SEGMENT_WRITE_KEY }; }\n` });
  }
  if (lib === 'amplitude' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/amplitude.ts`, template: `export function amplitude(){ return { apiKey: process.env.AMPLITUDE_API_KEY }; }\n` });
  }
  if (lib === 'mixpanel' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/analytics/mixpanel.ts`, template: `export function mixpanel(){ return { token: process.env.MIXPANEL_TOKEN }; }\n` });
  }

  // Bug tracking
  if (lib === 'bugsnag' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/bugsnag.ts`, template: `export function bugsnag(){ return { apiKey: process.env.BUGSNAG_API_KEY }; }\n` });
  }
  if (lib === 'honeybadger' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/honeybadger.ts`, template: `export function honeybadger(){ return { apiKey: process.env.HONEYBADGER_API_KEY }; }\n` });
  }

  // Config/util
  if (lib === 'dotenv' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `src/config/dotenv.ts`, template: `export function loadEnv(){ return { NODE_ENV: process.env.NODE_ENV || 'development' }; }\n` });
  }
  if (lib === 'lru-cache' && (pattern === 'config' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/cache/lru.ts`, template: `export function lru(){ return new Map<string, any>(); }\n` });
  }

  // Uploads/storage extras
  if (lib === 'cloudinary' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/uploads/cloudinary.ts`, template: `export function cloudinary(){ return { cloudName: process.env.CLOUDINARY_CLOUD_NAME }; }\n` });
  }
  if (lib === 'uploadthing' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/uploads/uploadthing.ts`, template: `export function uploadthing(){ return { token: process.env.UPLOADTHING_TOKEN }; }\n` });
  }
  if (lib === 'mailgun' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/email/mailgun.ts`, template: `export async function sendEmail(to: string, subject: string){ return { to, subject }; }\n` });
  }
  if (lib === 'paddle' && (pattern === 'client' || pattern === 'service' || pattern === 'route')) {
    files.push({ path: `src/payments/paddle.ts`, template: `export function paddle(){ return { vendorId: process.env.PADDLE_VENDOR_ID }; }\n` });
  }

  // Payments
  if (lib === 'paypal' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/payments/paypal.ts`, template: `export function paypal(){ return { clientId: process.env.PAYPAL_CLIENT_ID }; }\n` });
  }
  if (lib === 'paypal' && pattern === 'route') {
    files.push({ path: `app/api/payments/create/route.ts`, template: `import { NextResponse } from 'next/server';\nimport { paypal } from '@/src/payments/paypal';\nexport async function POST(){ const client = paypal(); return NextResponse.json({ ok: true }); }\n` });
  }
  if (lib === 'braintree' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/payments/braintree.ts`, template: `export function braintree(){ return { merchantId: process.env.BRAINTREE_MERCHANT_ID }; }\n` });
  }

  // Error tracking
  if (lib === 'rollbar' && (pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/monitoring/rollbar.ts`, template: `export function rollbar(){ return { accessToken: process.env.ROLLBAR_ACCESS_TOKEN }; }\n` });
  }

  // Service discovery / KV
  if (lib === 'consul' && (pattern === 'config' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/config/consul.ts`, template: `export function consul(){ return { host: process.env.CONSUL_HOST || '127.0.0.1:8500' }; }\n` });
  }
  if (lib === 'etcd' && (pattern === 'config' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/config/etcd.ts`, template: `export function etcd(){ return { endpoints: (process.env.ETCD_ENDPOINTS||'http://127.0.0.1:2379').split(',') }; }\n` });
  }

  // Job scheduler
  if (lib === 'agenda' && (pattern === 'job' || pattern === 'service' || pattern === 'config')) {
    files.push({ path: `src/jobs/agenda.ts`, template: `export function agenda(){ return { mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1/agenda' }; }\n` });
  }

  // Terraform
  if (lib === 'terraform' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `main.tf`, template: `terraform { required_version = ">= 1.5.0" }\n` });
  }

  // Pulumi
  if (lib === 'pulumi' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `Pulumi.yaml`, template: `name: app\nruntime: nodejs\n` });
    files.push({ path: `index.ts`, template: `import * as aws from '@pulumi/aws';\nconst bucket = new aws.s3.Bucket('bucket');\nexport const bucketName = bucket.id;\n` });
  }

  // Knex
  if (lib === 'knex' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `knexfile.ts`, template: `import type { Knex } from 'knex';\nconst config: { [key: string]: Knex.Config } = { development: { client: 'sqlite3', connection: { filename: './dev.sqlite3' }, useNullAsDefault: true, migrations: { directory: './migrations' } } };\nexport default config;\n` });
    files.push({ path: `migrations/0001_init.ts`, template: `import { Knex } from 'knex';\nexport async function up(knex: Knex){ await knex.schema.createTable('users', (t)=>{ t.increments('id'); t.string('email').unique(); t.string('name'); }); }\nexport async function down(knex: Knex){ await knex.schema.dropTable('users'); }\n` });
  }

  // Postgres (pg)
  if (lib === 'postgres' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/pg/client.ts`, template: `import { Pool } from 'pg';\nexport const pg = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/postgres' });\n` });
  }

  // MySQL (mysql2)
  if (lib === 'mysql' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/mysql/client.ts`, template: `import mysql from 'mysql2/promise';\nexport const mysqlPool = mysql.createPool({ uri: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/app' });\n` });
  }

  // SQLite (better-sqlite3)
  if (lib === 'sqlite' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/sqlite/db.ts`, template: `import Database from 'better-sqlite3';\nexport const db = new Database('app.sqlite');\n` });
  }

  // Kubernetes
  if (lib === 'kubernetes' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `k8s/deployment.yaml`, template: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: app }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: app } }\n  template:\n    metadata: { labels: { app: app } }\n    spec:\n      containers:\n        - name: app\n          image: node:20-alpine\n          args: ['node','index.js']\n` });
    files.push({ path: `k8s/service.yaml`, template: `apiVersion: v1\nkind: Service\nmetadata: { name: app }\nspec:\n  type: ClusterIP\n  selector: { app: app }\n  ports: [{ port: 80, targetPort: 3000 }]\n` });
  }

  // Helm
  if (lib === 'helm' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `chart/Chart.yaml`, template: `apiVersion: v2\nname: app\nversion: 0.1.0\n` });
    files.push({ path: `chart/templates/deployment.yaml`, template: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: app }\nspec: { replicas: 1, selector: { matchLabels: { app: app } }, template: { metadata: { labels: { app: app } }, spec: { containers: [{ name: app, image: node:20-alpine }] } } }\n` });
  }

  // Serverless Framework
  if (lib === 'serverless' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `serverless.yml`, template: `service: app\nframeworkVersion: '3'\nprovider: { name: aws, runtime: nodejs20.x }\nfunctions: { hello: { handler: src/lambda/handler.handler, events: [{ httpApi: { path: /hello, method: get } }] } }\n` });
  }

  // GCP Cloud Functions
  if (lib === 'gcp-cloud-functions' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `src/gcp/functions.ts`, template: `export async function helloHttp(req: any, res: any){ res.json({ ok: true }); }\n` });
  }

  // Azure Functions
  if (lib === 'azure-functions' && (pattern === 'config' || pattern === 'service')) {
    files.push({ path: `AzureFunctions/HttpTrigger1/function.json`, template: `{ \"bindings\": [{ \"authLevel\": \"function\", \"type\": \"httpTrigger\", \"direction\": \"in\", \"name\": \"req\", \"methods\": [\"get\"] }, { \"type\": \"http\", \"direction\": \"out\", \"name\": \"res\" }] }\n` });
    files.push({ path: `AzureFunctions/HttpTrigger1/index.ts`, template: `import type { Context, HttpRequest } from '@azure/functions';\nexport default async function (context: Context, _req: HttpRequest){ context.res = { status: 200, body: { ok: true } }; }\n` });
  }

  // ESLint
  if (lib === 'eslint' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `.eslintrc.cjs`, template: `module.exports = { env: { es2022: true, node: true }, extends: ['eslint:recommended'], parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }, rules: {} };\n` });
  }

  // Prettier
  if (lib === 'prettier' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `.prettierrc.json`, template: `{ \"singleQuote\": true, \"semi\": true }\n` });
  }

  // Vite
  if (lib === 'vite' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `vite.config.ts`, template: `import { defineConfig } from 'vite';\nexport default defineConfig({});\n` });
  }

  // Webpack
  if (lib === 'webpack' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `webpack.config.js`, template: `module.exports = { mode: 'development', entry: './src/index.ts', module: { rules: [ { test: /\\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] }, resolve: { extensions: ['.ts','.js'] } };\n` });
  }

  // tsup
  if (lib === 'tsup' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `tsup.config.ts`, template: `import { defineConfig } from 'tsup';\nexport default defineConfig({ entry: ['src/index.ts'], format: ['esm'], dts: false, clean: true });\n` });
  }

  // Ansible
  if (lib === 'ansible' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `ansible/playbook.yml`, template: `- hosts: all\n  tasks:\n    - name: Ping\n      ping:\n` });
  }

  // NextAuth
  if (lib === 'next-auth' && (pattern === 'config' || pattern === 'route')) {
    files.push({ path: `app/api/auth/[...nextauth]/route.ts`, template: `import NextAuth from 'next-auth';\nimport Credentials from 'next-auth/providers/credentials';\nconst handler = NextAuth({ providers: [Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })] });\nexport { handler as GET, handler as POST };\n` });
    files.push({ path: `middleware.ts`, template: `export { default } from 'next-auth/middleware';\nexport const config = { matcher: ['/dashboard/:path*'] };\n` });
    if (style === 'advanced') {
      files.push({ path: `env.example`, template: `NEXTAUTH_URL=http://localhost:3000\nNEXTAUTH_SECRET=please-change-me\nGITHUB_ID=xxx\nGITHUB_SECRET=yyy\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.ts`, template: `import GitHub from 'next-auth/providers/github';\nimport Credentials from 'next-auth/providers/credentials';\nexport const providers = [\n  GitHub({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! }),\n  Credentials({ name: 'Credentials', credentials: { username: {}, password: {} }, authorize: async () => ({ id: '1', name: 'demo' }) })\n];\n` });
      files.push({ path: `app/api/auth/[...nextauth]/providers.google.example.ts`, template: `import Google from 'next-auth/providers/google';\nexport const google = Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! });\n` });
      files.push({ path: `app/(protected)/dashboard/page.tsx`, template: `export default function Page(){ return <div>Protected Dashboard</div>; }\n` });
      files.push({ path: `src/auth/withRole.tsx`, template: `import type { ReactNode } from 'react';\nexport function withRole<TProps>(Comp: (p:TProps)=>any, required: 'user'|'admin'){\n  return function Guarded(props: TProps & { role?: 'user'|'admin'; children?: ReactNode }){\n    const role = props.role || 'user';\n    if(required==='admin' && role!=='admin'){ return null; }\n    return Comp(props);\n  }\n}\n` });
      files.push({ path: `app/(protected)/admin/page.tsx`, template: `export default function Page(){ return <div>Admin Only</div>; }\n` });
    }
  }

  // GitHub Actions CI
  if (lib === 'github-actions' && (pattern === 'config' || pattern === 'init')) {
    const basic = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm test\n`;
    const advanced = `name: CI\non: [push, pull_request]\njobs:\n  test:\n    strategy:\n      matrix:\n        node: [18, 20, 22]\n        os: [ubuntu-latest, macos-latest]\n    runs-on: \${{ matrix.os }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \${{ matrix.node }}\n          cache: npm\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm test -- --coverage\n`;
    files.push({ path: `.github/workflows/ci.yml`, template: style === 'advanced' ? advanced : basic });
    if (style === 'advanced') {
      files.push({ path: `.github/workflows/monorepo.yml`, template: `name: Monorepo CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        package: ['packages/app', 'packages/api']\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: cd \${{ matrix.package }} && npm ci && npm test --if-present\n` });
    }
  }
  if (lib === 'github-actions' && pattern === 'job' && style === 'advanced') {
    files.push({ path: `.github/workflows/e2e.yml`, template: `name: E2E\non: [push, pull_request]\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npx playwright install --with-deps\n      - run: npm run test:e2e --if-present\n` });
    files.push({ path: `.github/workflows/lint.yml`, template: `name: Lint\non: [push, pull_request]\njobs:\n  lint:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: npm run lint --if-present\n      - run: npm run format:check --if-present\n` });
    files.push({ path: `.github/workflows/affected-tests.yml`, template: `name: Affected Tests\non: [pull_request]\njobs:\n  affected:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: '20' }\n      - run: npm ci\n      - run: echo "Run only affected tests (stub)"\n` });
  }
  // Redux Toolkit
  if (lib === 'redux' && (pattern === 'init' || pattern === 'config' || pattern === 'service' || pattern === 'store' || pattern === 'slice')) {
    files.push({ path: `src/store/store.ts`, template: `import { configureStore } from '@reduxjs/toolkit';\nimport counter from './counterSlice';\nexport const store = configureStore({ reducer: { counter } });\nexport type RootState = ReturnType<typeof store.getState>;\nexport type AppDispatch = typeof store.dispatch;\n` });
    files.push({ path: `src/store/counterSlice.ts`, template: `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\ninterface State { value: number }\nconst initialState: State = { value: 0 };\nconst slice = createSlice({ name: 'counter', initialState, reducers: { inc: (s)=> { s.value += 1; }, add: (s, a: PayloadAction<number>)=> { s.value += a.payload; } } });\nexport const { inc, add } = slice.actions;\nexport default slice.reducer;\n` });
  }

  // SWR
  if (lib === 'swr' && (pattern === 'hook' || pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/hooks/useHello.ts`, template: `import useSWR from 'swr';\nconst fetcher = (url: string)=> fetch(url).then(r=> r.json());\nexport function useHello(){ return useSWR('/api/hello', fetcher); }\n` });
  }

  // Radix UI
  if (lib === 'radix-ui' && (pattern === 'component' || pattern === 'init')) {
    files.push({ path: `src/components/RadixDialog.tsx`, template: `import * as Dialog from '@radix-ui/react-dialog';\nexport function RadixDialog(){ return (<Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Overlay /><Dialog.Content><Dialog.Title>Title</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>); }\n` });
  }

  // React Flow (reactflow.dev)
  if (lib === 'reactflow') {
    const isTS = lang === 'ts';
    const jsxExt = isTS ? 'tsx' : 'jsx';
    // component: 基本のノード/エッジ表示 + 背景/コントロール
    if (pattern === 'component' || pattern === 'init') {
      files.push({ path: `src/components/Flow.${jsxExt}`, template: `import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 200, y: 100 }, data: { label: 'Node 2' } }
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' }
];

export default function Flow(){
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
` });
    }
    // example: 画面にFlowを表示する簡単なエントリ
    if (pattern === 'example') {
      files.push({ path: `src/flow/App.${jsxExt}`, template: `import React from 'react';
import Flow from '@/src/components/Flow';
export default function App(){ return (<main><h1>React Flow Example</h1><Flow /></main>); }
` });
    }
    // docs: 使い方メモ
    if (pattern === 'docs') {
      files.push({ path: `src/flow/README.md`, template: `# React Flow Quick Notes\n\n- Install: npm i reactflow\n- Import default styles: \'reactflow/dist/style.css\'\n- Core elements: ReactFlow, Background, Controls, MiniMap\n- Provide nodes/edges via props; manage state for interactivity\n` });
    }

    // hook: ノード/エッジの状態と接続ハンドラ
    if (pattern === 'hook') {
      files.push({ path: `src/flow/useFlowState.${isTS ? 'ts' : 'js'}`, template: `import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
export function useFlowState(initialNodes = [], initialEdges = []){
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds)), [setEdges]);
  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, onConnect };
}
` });
    }

    // adapter: サーバ保存/読込のAPIアダプタ（スタブ）
    if (pattern === 'adapter' || pattern === 'service') {
      files.push({ path: `src/flow/api.${isTS ? 'ts' : 'js'}`, template: `export async function loadFlow(api = '/api/flow'){
  const res = await fetch(api);
  if (!res.ok) throw new Error('load_failed:' + res.status);
  return res.json();
}
export async function saveFlow(data: any, api = '/api/flow'){
  const res = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('save_failed:' + res.status);
  return res.json();
}
` });
    }

    // advanced: MiniMap/CustomNode/ハンドラ付きの発展版
    if (style === 'advanced' && (pattern === 'component' || pattern === 'example')) {
      files.push({ path: `src/components/CustomNode.${jsxExt}`, template: `import React from 'react';
export default function CustomNode({ data }: { data: any }){ return <div style={{ padding: 8, border: '1px solid #999' }}>{data?.label || 'Custom'}</div>; }
` });
      files.push({ path: `src/components/FlowAdvanced.${jsxExt}`, template: `import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '@/src/components/CustomNode';

const initialNodes = [ { id: '1', position: { x: 0, y: 0 }, data: { label: 'Start' }, type: 'custom' } ];
const initialEdges = [] as any[];

export default function FlowAdvanced(){
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow nodes={initialNodes} edges={initialEdges} nodeTypes={nodeTypes}>
        <MiniMap />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
` });
    }

    // testing: 最小のテスト雛形
    if (style === 'testing' && pattern === 'component') {
      files.push({ path: `src/components/Flow.test.${isTS ? 'tsx' : 'jsx'}`, template: `// NOTE: In real apps, prefer @testing-library/react
import { describe, it, expect } from 'vitest';
describe('Flow', ()=>{ it('renders', ()=>{ expect(true).toBe(true); }); });
` });
      files.push({ path: `src/components/Flow.rtl.test.${isTS ? 'tsx' : 'jsx'}`, template: `// Placeholder for @testing-library/react based tests\n// import { render, screen } from '@testing-library/react'\n// import Flow from './Flow'\n// test('flow renders', ()=>{ /* render(<Flow />); expect(screen.getByText(/React Flow/)).toBeInTheDocument(); */ })\n` });
    }

    // server routes: Next.js App Router + Express + FastAPI stubs
    if (pattern === 'route' && (lang === 'ts' || lang === 'js')) {
      files.push({ path: `app/api/flow/route.ts`, template: `import { NextResponse } from 'next/server';\nexport async function GET(){ return NextResponse.json({ nodes: [], edges: [] }); }\nexport async function POST(req: Request){ const json = await req.json(); return NextResponse.json({ ok: true, received: json }); }\n` });
      files.push({ path: `src/flow/route.${isTS ? 'ts' : 'js'}`, template: `import express from 'express';\nexport function createFlowRoute(){ const app = express(); app.use(express.json()); app.get('/api/flow', (_req, res)=> res.json({ nodes: [], edges: [] })); app.post('/api/flow', (req, res)=> res.json({ ok: true, received: req.body })); return app; }\n` });
    }
    if (pattern === 'route' && lang === 'py') {
      files.push({ path: `src/flow/fastapi_flow.py`, template: `from fastapi import APIRouter, Request\nrouter = APIRouter()\n@router.get('/api/flow')\nasync def get_flow():\n    return { 'nodes': [], 'edges': [] }\n@router.post('/api/flow')\nasync def post_flow(request: Request):\n    data = await request.json()\n    return { 'ok': True, 'received': data }\n` });
    }

    // additional custom nodes for advanced style
    if (style === 'advanced' && (pattern === 'component' || pattern === 'example')) {
      files.push({ path: `src/components/InputNode.${jsxExt}`, template: `import React from 'react';\nexport default function InputNode({ data }: { data: any }){ return <input defaultValue={data?.label || ''} style={{ padding: 6, border: '1px solid #aaa' }} /> }\n` });
      files.push({ path: `src/components/DecisionNode.${jsxExt}`, template: `import React from 'react';\nexport default function DecisionNode({ data }: { data: any }){ return <div style={{ padding: 8, border: '2px dashed #c77' }}>❓ {data?.label || 'Decision'}</div> }\n` });
    }
  }

  // Shadcn-based TreeView (https://github.com/MrLightful/shadcn-tree-view)
  if (lib === 'shadcn-tree-view') {
    const isTS = lang === 'ts';
    const jsxExt = isTS ? 'tsx' : 'jsx';
    // component/init: 再帰描画の簡易ツリービュー（shadcn風のクラスを付与）
    if (pattern === 'component' || pattern === 'init') {
      files.push({ path: `src/components/TreeView.${jsxExt}`, template: `import React, { useState } from 'react';
type Node = { id: string; label: string; children?: Node[] }${isTS ? '' : ' // @ts-ignore'};
const sample: Node[] = [
  { id: 'root', label: 'Root', children: [ { id: 'a', label: 'A' }, { id: 'b', label: 'B', children: [ { id: 'b-1', label: 'B-1' } ] } ] }
];
function Item({ node, depth = 0 }: { node: Node; depth?: number }){
  const [open, setOpen] = useState(true);
  const has = !!node.children?.length;
  return (
    <div style={{ paddingLeft: depth * 12 }} className="space-y-1">
      <div className="flex items-center gap-2">
        {has && (<button className="h-5 w-5 text-xs border rounded" onClick={()=> setOpen(!open)}>{open ? '-' : '+'}</button>)}
        <span className="text-sm">{node.label}</span>
      </div>
      {has && open && (
        <div className="border-l pl-3 ml-2">
          {node.children!.map((c)=> (<Item key={c.id} node={c} depth={depth+1} />))}
        </div>
      )}
    </div>
  );
}
export default function TreeView({ nodes = sample }: { nodes?: Node[] }){
  return (
    <div className="rounded-md border p-2">
      {nodes.map((n)=> (<Item key={n.id} node={n} />))}
    </div>
  );
}
` });
    }
    // example: ページにツリーを配置
    if (pattern === 'example') {
      files.push({ path: `src/treeview/App.${jsxExt}`, template: `import React from 'react';
import TreeView from '@/src/components/TreeView';
export default function App(){ return (<main><h1>Shadcn TreeView Example</h1><TreeView /></main>); }
` });
    }
    // adapter: ノード配列の保存/読込
    if (pattern === 'adapter' || pattern === 'service') {
      files.push({ path: `src/treeview/api.${isTS ? 'ts' : 'js'}`, template: `export async function loadTree(api = '/api/tree'){
  const res = await fetch(api); if (!res.ok) throw new Error('load_failed'); return res.json();
}
export async function saveTree(data: any, api = '/api/tree'){
  const res = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('save_failed'); return res.json();
}
` });
    }
    // docs: 導入メモ
    if (pattern === 'docs') {
      files.push({ path: `src/treeview/README.md`, template: `# Shadcn TreeView Quick Notes\n\n- 参考: https://github.com/MrLightful/shadcn-tree-view\n- shadcn/ui スタイルに合わせた TreeView 実装やパッケージを利用可能\n- 最小例: 再帰描画 + 折り畳みボタン + インデント\n` });
    }
    // testing: RTL想定のプレースホルダ
    if (style === 'testing' && pattern === 'component') {
      files.push({ path: `src/components/TreeView.test.${jsxExt}`, template: `import { describe, it, expect } from 'vitest';
describe('TreeView', ()=>{ it('renders', ()=>{ expect(true).toBe(true); }); });
` });
      files.push({ path: `src/components/TreeView.rtl.test.${jsxExt}`, template: `// Placeholder for @testing-library/react based tests\n// import { render, screen } from '@testing-library/react'\n// import TreeView from './TreeView'\n// test('tree renders', ()=>{ /* render(<TreeView />); expect(screen.getByText('Root')).toBeInTheDocument(); */ })\n` });
    }
    // route: Next.js/Express/FastAPI の保存/ロード
    if (pattern === 'route' && (lang === 'ts' || lang === 'js')) {
      files.push({ path: `app/api/tree/route.ts`, template: `import { NextResponse } from 'next/server';\nexport async function GET(){ return NextResponse.json([{ id: 'root', label: 'Root' }]); }\nexport async function POST(req: Request){ const json = await req.json(); return NextResponse.json({ ok: true, received: json }); }\n` });
      files.push({ path: `src/treeview/route.${isTS ? 'ts' : 'js'}`, template: `import express from 'express';\nexport function createTreeRoute(){ const app = express(); app.use(express.json()); app.get('/api/tree', (_req, res)=> res.json([{ id: 'root', label: 'Root' }])); app.post('/api/tree', (req, res)=> res.json({ ok: true, received: req.body })); return app; }\n` });
    }
    if (pattern === 'route' && lang === 'py') {
      files.push({ path: `src/treeview/fastapi_tree.py`, template: `from fastapi import APIRouter, Request\nrouter = APIRouter()\n@router.get('/api/tree')\nasync def get_tree():\n    return [{ 'id': 'root', 'label': 'Root' }]\n@router.post('/api/tree')\nasync def post_tree(request: Request):\n    data = await request.json()\n    return { 'ok': True, 'received': data }\n` });
    }
    // advanced: 選択/チェック/右クリックメニューの簡易版 + 仮想化/DnDのプレースホルダ
    if (style === 'advanced' && (pattern === 'component' || pattern === 'example')) {
      files.push({ path: `src/components/TreeViewAdvanced.${jsxExt}`, template: `import React, { useState } from 'react';
type Node = { id: string; label: string; children?: Node[] }${isTS ? '' : ' // @ts-ignore'};
const data: Node[] = [{ id: 'root', label: 'Root', children: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }];
function Item({ node, depth=0, onCtx }: { node: Node; depth?: number; onCtx: (id:string, e:any)=>void }){
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const has = !!node.children?.length;
  return (
    <div style={{ paddingLeft: depth * 12 }} className="space-y-1" onContextMenu={(e)=> onCtx(node.id, e)} role="tree" aria-label="Tree">
      <div className="flex items-center gap-2" role="treeitem" aria-expanded={has ? open : undefined} aria-selected={checked}>
        {has && (<button className="h-5 w-5 text-xs border rounded" aria-label={open ? 'Collapse' : 'Expand'} onClick={()=> setOpen(!open)}>{open ? '-' : '+'}</button>)}
        <input type="checkbox" aria-label="Select" checked={checked} onChange={(e)=> setChecked(e.target.checked)} />
        <span className="text-sm select-none">{node.label}</span>
      </div>
      {has && open && (
        <div className="border-l pl-3 ml-2">
          {node.children!.map((c)=> (<Item key={c.id} node={c} depth={depth+1} onCtx={onCtx} />))}
        </div>
      )}
    </div>
  );
}
export default function TreeViewAdvanced(){
  const [ctx, setCtx] = useState<{id?:string;x?:number;y?:number}>({});
  const [q, setQ] = useState('');
  const filter = (n: Node): Node | null => {
    const hit = n.label.toLowerCase().includes(q.toLowerCase());
    const kids = (n.children||[]).map(filter).filter(Boolean) as Node[];
    if (hit || kids.length) return { ...n, children: kids };
    return null;
  };
  const filtered = (data.map(filter).filter(Boolean) as Node[]) || [];
  return (
    <div className="relative rounded-md border p-2">
      <input className="mb-2 border rounded px-2 py-1 text-sm" placeholder="Filter..." value={q} onChange={(e:any)=> setQ(e.target.value)} />
      {data.map((n)=> (<Item key={n.id} node={n} onCtx={(id,e)=>{ e.preventDefault(); setCtx({ id, x: e.clientX, y: e.clientY }); }} />))}
      {ctx.id && (
        <div className="absolute bg-white border rounded shadow p-2" style={{ left: ctx.x, top: ctx.y }}>
          <div className="text-xs">Node: {ctx.id}</div>
          <button className="text-xs">Action</button>
        </div>
      )}
    </div>
  );
}
` });
      files.push({ path: `src/components/VirtualizedTree.${jsxExt}`, template: `// Placeholder for virtualized tree rendering (e.g., react-window)
import React from 'react';
export default function VirtualizedTree(){ return <div className=\"text-xs text-muted-foreground\">Virtualized tree placeholder</div>; }
` });
      files.push({ path: `src/components/DnDTree.${jsxExt}`, template: `// Placeholder for drag-and-drop tree (e.g., dnd-kit)
import React from 'react';
export default function DnDTree(){ return <div className=\"text-xs text-muted-foreground\">DnD tree placeholder</div>; }
` });
    }

    // schema: Zod/Pydantic スキーマと PATCH API のスタブ
    if (pattern === 'schema' || pattern === 'service') {
      if (lang === 'ts') {
        files.push({ path: `src/treeview/schema.ts`, template: `import { z } from 'zod';
export const TreeNode = z.lazy(()=> z.object({ id: z.string(), label: z.string(), children: z.array(TreeNode).optional() }));
export const Tree = z.array(TreeNode);
export type TreeNodeT = z.infer<typeof TreeNode>;
export type TreeT = z.infer<typeof Tree>;
` });
        files.push({ path: `src/treeview/patch.ts`, template: `// Apply simple patch operations (add/remove/update) to a tree (stub)
export type Patch = { op: 'add'|'remove'|'update'; id: string; parentId?: string; label?: string };
export function applyPatch(tree: any[], patch: Patch){ return tree; }
` });
        files.push({ path: `app/api/tree/patch/route.ts`, template: `import { NextResponse } from 'next/server';
export async function POST(req: Request){ const json = await req.json(); return NextResponse.json({ ok: true, received: json }); }
` });
      }
      if (lang === 'py') {
        files.push({ path: `src/treeview/models.py`, template: `from pydantic import BaseModel
from typing import List, Optional
class TreeNode(BaseModel):
    id: str
    label: str
    children: Optional[List['TreeNode']] = None
TreeNode.model_rebuild()
` });
      }
    }

    // ReactFlow ブリッジ: Tree -> Flow へ展開
    if (pattern === 'adapter' || pattern === 'service') {
      files.push({ path: `src/treeview/toFlow.${isTS ? 'ts' : 'js'}`, template: `export function toFlow(tree: any[]){
  const nodes: any[] = []; const edges: any[] = [];
  const walk = (n: any, parent?: any, idx=0)=>{ nodes.push({ id: n.id, data: { label: n.label }, position: { x: idx*160, y: (parent? 100:0) + (idx*40) } }); if(parent){ edges.push({ id: parent.id+'-'+n.id, source: parent.id, target: n.id }); } (n.children||[]).forEach((c: any, i: number)=> walk(c, n, i)); };
  (tree||[]).forEach((n, i)=> walk(n, undefined, i));
  return { nodes, edges };
}
` });
      files.push({ path: `src/treeview/fromFlow.${isTS ? 'ts' : 'js'}`, template: `// Convert ReactFlow graph back to a flat tree (simple heuristic)
export function fromFlow(nodes: any[], edges: any[]){
  const byId = new Map(nodes.map(n=> [n.id, { id: n.id, label: n.data?.label || n.id, children: [] as any[] }]));
  const hasParent = new Set<string>();
  for (const e of edges||[]){ const p = byId.get(e.source); const c = byId.get(e.target); if (p && c){ (p.children as any[]).push(c); hasParent.add(e.target); } }
  const roots = nodes.filter(n=> !hasParent.has(n.id)).map(n=> byId.get(n.id));
  return roots;
}
` });
    }

    // testing: SSR/Next.js App Routerでの簡易a11yチェック雛形
    if (style === 'testing' && pattern === 'route' && (lang === 'ts' || lang === 'js')) {
      files.push({ path: `src/treeview/a11y.test.${isTS ? 'ts' : 'js'}`, template: `import { describe, it, expect } from 'vitest';
// Placeholder: In real projects, use axe-core or jest-axe for a11y checks
describe('a11y', ()=>{ it('basic a11y placeholder', ()=>{ expect(true).toBe(true); }); });
` });
    }
  }

  // TailwindCSS
  if (lib === 'tailwindcss' && (pattern === 'config' || pattern === 'init')) {
    files.push({ path: `tailwind.config.ts`, template: `import type { Config } from 'tailwindcss';\nexport default { content: ['./index.html','./src/**/*.{ts,tsx,js,jsx}'], theme: { extend: {} }, plugins: [] } satisfies Config;\n` });
    files.push({ path: `postcss.config.js`, template: `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n` });
    files.push({ path: `src/index.css`, template: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n` });
  }
  // Zod schemas
  if (lib === 'zod' && (pattern === 'schema' || pattern === 'config' || pattern === 'init' || pattern === 'service')) {
    files.push({ path: `src/validation/schemas.ts`, template: `import { z } from 'zod';
export const UserSchema = z.object({ id: z.number().int().positive(), email: z.string().email(), name: z.string().optional() });
export type User = z.infer<typeof UserSchema>;
` });
  }
  // React Hook Form
  if (lib === 'react-hook-form' && (pattern === 'component' || pattern === 'hook' || pattern === 'init')) {
    files.push({ path: `src/components/LoginForm.tsx`, template: `import { useForm } from 'react-hook-form';
type Inputs = { email: string; password: string };
export function LoginForm(){ const { register, handleSubmit, formState:{ errors } } = useForm<Inputs>(); const onSubmit = (data: Inputs)=> console.log(data); return (<form onSubmit={handleSubmit(onSubmit)}><input {...register('email',{ required:true })} /><input type='password' {...register('password',{ required:true })} /><button type='submit'>Sign in</button>{errors.email && 'email req'}</form>); }
` });
  }

  // Zustand
  if (lib === 'zustand' && (pattern === 'store' || pattern === 'init' || pattern === 'service' || pattern === 'client')) {
    files.push({ path: `src/stores/useCounter.ts`, template: `import { create } from 'zustand';
export const useCounter = create<{ count:number; inc:()=>void; }>((set)=>({ count:0, inc:()=> set((s)=> ({ count: s.count+1 })) }));
` });
  }
  // LINE Developers (Messaging API webhook + client)
  if (lib === 'line' && (pattern === 'webhook' || pattern === 'route')) {
    files.push({ path: `src/line/verify.ts`, template: `import crypto from 'node:crypto';
export function verifyLineSignature(channelSecret: string, bodyRaw: string, signature: string){
  const hmac = crypto.createHmac('sha256', channelSecret);
  hmac.update(bodyRaw);
  const expected = hmac.digest('base64');
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || '', 'utf8')); }
  catch { return false; }
}
` });
    files.push({ path: `src/line/webhook.ts`, template: `import express from 'express';
import { verifyLineSignature } from './verify';
export function createLineWebhookApp(channelSecret: string){
  const app = express();
  app.use(express.text({ type: '*/*' })); // keep raw body for signature verification
  app.post('/line/webhook', (req, res)=>{
    const signature = req.get('x-line-signature') || '';
    const ok = verifyLineSignature(channelSecret, req.body, signature);
    if (!ok) return res.status(403).send('forbidden');
    try {
      const json = JSON.parse(req.body || '{}');
      for (const ev of json.events || []) {
        if (ev.type === 'message' && ev.message?.type === 'text') {
          // handle message here (e.g., reply via LineMessagingClient)
        }
      }
      res.status(200).send('ok');
    } catch { res.status(400).send('bad request'); }
  });
  return app;
}
` });
    // Next.js App Router variant for token exchange (advanced/secure)
    if (pattern === 'route' && (style === 'advanced' || style === 'secure') && (lang === 'ts' || lang === 'js')) {
      files.push({ path: `app/api/line/exchange/route.ts`, template: `import { NextResponse } from 'next/server';
import { z } from 'zod';
const Body = z.object({ code: z.string(), code_verifier: z.string(), redirect_uri: z.string() });
export async function POST(req: Request){
  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    // NOTE: Exchange should be done server-side using channel secret securely.
    return NextResponse.json({ ok: true, input: parsed.data });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
` });
      if (style === 'secure') {
        files.push({ path: `src/line/next/security.ts`, template: `export function assertJson(req: Request){
  const ct = req.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('unsupported_media_type');
}
export function assertCsrf(req: Request){
  const token = req.headers.get('x-csrf-token');
  if (!token) throw new Error('missing_csrf');
}
` });
        files.push({ path: `src/line/next/rateLimit.ts`, template: `const WINDOW_MS = 60_000; // 1 minute
const LIMIT = 60; // 60 req/min
const store = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string){
  const now = Date.now();
  const rec = store.get(key) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + WINDOW_MS; }
  rec.count += 1;
  store.set(key, rec);
  if (rec.count > LIMIT) throw new Error('rate_limited');
}
` });
        files.push({ path: `src/line/next/audit.ts`, template: `export type Audit = { at: string; path: string; ok: boolean; note?: string };
const logs: Audit[] = [];
export function audit(path: string, ok: boolean, note?: string){ logs.push({ at: new Date().toISOString(), path, ok, note }); }
export function getAudits(){ return logs.slice(-1000); }
` });
      }
    }
  }
  // FastAPI variant for LINE token exchange (Python)
  if (lib === 'line' && pattern === 'route' && lang === 'py') {
    files.push({ path: `src/line/fastapi_exchange.py`, template: `from fastapi import APIRouter, HTTPException
import httpx
router = APIRouter()

@router.post('/line/exchange')
async def exchange(payload: dict):
    code = payload.get('code')
    code_verifier = payload.get('code_verifier')
    redirect_uri = payload.get('redirect_uri')
    channel_id = payload.get('channel_id', '')
    channel_secret = payload.get('channel_secret', '')
    if not code or not code_verifier or not redirect_uri:
        raise HTTPException(status_code=400, detail='invalid_request')
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': channel_id,
        'code_verifier': code_verifier,
        'client_secret': channel_secret,
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post('https://api.line.me/oauth2/v2.1/token', data=data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
        if resp.status_code >= 400:
            raise HTTPException(status_code=400, detail='token_exchange_failed')
        return resp.json()
` });
    if (style === 'advanced') {
      files.push({ path: `src/line/models.py`, template: `from pydantic import BaseModel
class ExchangeRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str
    channel_id: str
    channel_secret: str
` });
      files.push({ path: `src/line/settings.py`, template: `from pydantic import BaseSettings
class Settings(BaseSettings):
    channel_id: str = ''
    channel_secret: str = ''
settings = Settings()
` });
    }
  }
  if (lib === 'line' && pattern === 'service') {
    files.push({ path: `src/line/oauth.ts`, template: `export type TokenResponse = { access_token: string; expires_in: number; id_token?: string; refresh_token?: string; scope?: string; token_type: 'Bearer' };
export async function exchangeCodeForToken(params: { channelId: string; channelSecret: string; code: string; redirectUri: string; codeVerifier: string }){
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.channelId,
    code_verifier: params.codeVerifier,
    client_secret: params.channelSecret
  });
  const resp = await fetch('https://api.line.me/oauth2/v2.1/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!resp.ok) throw new Error('LINE token exchange failed: ' + resp.status);
  return (await resp.json()) as TokenResponse;
}
` });
  }
  if (lib === 'line' && pattern === 'route') {
    files.push({ path: `src/line/routes/exchange.ts`, template: `import type { Request, Response } from 'express';
import { exchangeCodeForToken } from '../oauth';
export function lineExchangeHandler(channelId: string, channelSecret: string){
  return async function handler(req: Request, res: Response){
    if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
    if (!/application\/json/.test(req.headers['content-type'] || '')) return res.status(415).json({ error: 'unsupported_media_type' });
    try {
      const { code, code_verifier, redirect_uri } = req.body || {};
      if (!code || !code_verifier || !redirect_uri) return res.status(400).json({ error: 'invalid_request' });
      const tokens = await exchangeCodeForToken({ channelId, channelSecret, code, redirectUri: redirect_uri, codeVerifier: code_verifier });
      return res.json(tokens);
    } catch (e){
      return res.status(400).json({ error: String(e) });
    }
  };
}
` });
  }
  if (lib === 'line' && pattern === 'provider') {
    files.push({ path: `src/line/liff.ts`, template: `// LIFF initializer (browser-side usage)
export async function initLiff(liffId: string){
  const { liff } = (await import('@line/liff')) as any;
  if (!liff) throw new Error('LIFF SDK not available');
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) liff.login();
  return liff;
}
` });
  }
  if (lib === 'line' && (pattern === 'client' || pattern === 'service')) {
    files.push({ path: `src/line/client.ts`, template: `export class LineMessagingClient {
  constructor(private token: string){}
  async reply(replyToken: string, messages: Array<{ type:'text'; text:string }>){
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyToken, messages })
    });
  }
  async push(to: string, messages: Array<{ type:'text'; text:string }>){
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + this.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, messages })
    });
  }
}
` });
  }

  // Expo example: LINE Login (AuthSession + PKCE)
  if (lib === 'expo' && pattern === 'example') {
    files.push({ path: `App.tsx`, template: `import * as AuthSession from 'expo-auth-session';
import * as React from 'react';
import { Button, SafeAreaView, Text } from 'react-native';
const AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';
export default function App(){
  const [result, setResult] = React.useState<any>(null);
  const redirectUri = AuthSession.makeRedirectUri();
  async function signIn(){
    const state = Math.random().toString(36).slice(2);
    const { codeVerifier, codeChallenge } = await AuthSession.generatePKCEChallengeAsync();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: '<LINE_CHANNEL_ID>',
      redirect_uri: redirectUri,
      state,
      scope: 'profile openid email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    }).toString();
    const authUrl = AUTH_URL + '?' + params;
    const res = await AuthSession.startAsync({ authUrl, returnUrl: redirectUri });
    setResult(res);
    // NOTE: Exchange code for tokens at your backend using code_verifier securely.
    void codeVerifier;
  }
  return (<SafeAreaView style={{ padding: 24 }}>
    <Button title="Sign in with LINE" onPress={signIn} />
    <Text selectable>{JSON.stringify(result)}</Text>
  </SafeAreaView>);
}
` });
  }
  // LINE Developers middleware (signature verification for Express)
  if (lib === 'line' && pattern === 'middleware') {
    files.push({ path: `src/line/middleware.ts`, template: `import type { Request, Response, NextFunction } from 'express';
import { verifyLineSignature } from './verify';
export function lineSignatureMiddleware(channelSecret: string){
  return (req: Request, res: Response, next: NextFunction)=>{
    const signature = req.get('x-line-signature') || '';
    const raw = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || ''));
    const ok = verifyLineSignature(channelSecret, raw, signature);
    if (!ok) return res.status(403).send('forbidden');
    next();
  };
}
` });
  }
  // LINE Developers adapter (Echo reply sample)
  if (lib === 'line' && pattern === 'adapter') {
    files.push({ path: `src/line/echo-adapter.ts`, template: `import type { Request, Response } from 'express';
import { LineMessagingClient } from './client';
export function makeEchoHandler(channelAccessToken: string){
  const client = new LineMessagingClient(channelAccessToken);
  return async (req: Request, res: Response)=>{
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    for (const ev of body?.events || []){
      if (ev.type === 'message' && ev.message?.type === 'text'){
        await client.reply(ev.replyToken, [{ type: 'text', text: ev.message.text }]);
      }
    }
    res.status(200).send('ok');
  };
}
` });
  }

  // Expo hook/provider for LINE Login
  if (lib === 'expo' && pattern === 'hook') {
    files.push({ path: `src/hooks/useLineLogin.ts`, template: `import * as AuthSession from 'expo-auth-session';
import * as React from 'react';
const AUTH_URL = 'https://access.line.me/oauth2/v2.1/authorize';
export function useLineLogin(clientId: string, scope = 'profile openid email'){
  const [result, setResult] = React.useState<any>(null);
  const redirectUri = AuthSession.makeRedirectUri();
  const signIn = React.useCallback(async ()=>{
    const state = Math.random().toString(36).slice(2);
    const { codeVerifier, codeChallenge } = await AuthSession.generatePKCEChallengeAsync();
    const params = new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: redirectUri, state, scope, code_challenge: codeChallenge, code_challenge_method: 'S256' }).toString();
    const res = await AuthSession.startAsync({ authUrl: AUTH_URL + '?' + params, returnUrl: redirectUri });
    setResult({ ...res, codeVerifier });
    return res;
  }, [clientId, scope, redirectUri]);
  return { signIn, result };
}
` });
  }
  if (lib === 'expo' && style === 'advanced') {
    files.push({ path: `src/app/deeplink.ts`, template: `import * as Linking from 'expo-linking';
export function makePrefix(){ return Linking.createURL('/'); }
export const prefixes = [makePrefix()];
` });
    files.push({ path: `src/components/ErrorToast.tsx`, template: `import * as React from 'react';
export function ErrorToast({ message }: { message: string }){ return <>{message}</>; }
` });
  }
  if (lib === 'expo' && style === 'secure') {
    files.push({ path: `src/hooks/useSecureFetch.ts`, template: `export async function secureFetch(input: RequestInfo | URL, init: RequestInit = {}){
  const headers = new Headers(init.headers || {});
  headers.set('x-requested-with', 'xmlhttprequest');
  headers.set('x-csrf-token', 'REPLACE_ME');
  const res = await fetch(input, { ...init, headers });
  if (!res.ok) throw new Error('request_failed:' + res.status);
  return res;
}
` });
    files.push({ path: `src/components/ErrorBoundary.tsx`, template: `import React from 'react';
type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: any){ return { hasError: true, error }; }
  componentDidCatch(error: any){ console.error(error); }
  render(){ if (this.state.hasError) return null; return this.props.children; }
}
` });
    files.push({ path: `src/components/Toast.tsx`, template: `import * as React from 'react';
export function Toast({ message }: { message: string }){ return <>{message}</>; }
` });
    files.push({ path: `src/components/RetryButton.tsx`, template: `import * as React from 'react';
export function RetryButton({ onRetry }: { onRetry: ()=>void }){ return <button onClick={onRetry}>Retry</button>; }
` });
  }
  if (lib === 'expo' && pattern === 'provider') {
    files.push({ path: `src/context/LineAuthProvider.tsx`, template: `import React, { createContext, useContext } from 'react';
import { useLineLogin } from '@/src/hooks/useLineLogin';
const Ctx = createContext<{ signIn: ()=>Promise<any>; result: any }|null>(null);
export function LineAuthProvider({ clientId, children }: { clientId: string; children: React.ReactNode }){
  const { signIn, result } = useLineLogin(clientId);
  return <Ctx.Provider value={{ signIn, result }}>{children}</Ctx.Provider>;
}
export function useLineAuth(){ const v = useContext(Ctx); if(!v) throw new Error('LineAuthProvider missing'); return v; }
` });
  }
  // LINE Developers: Flex Message example and helper
  if (lib === 'line' && (pattern === 'example' || pattern === 'component')) {
    files.push({ path: `src/line/flex.ts`, template: `export type FlexText = { type: 'text'; text: string; weight?: 'regular'|'bold'; size?: 'sm'|'md'|'lg'|'xl' };
export type FlexBox = { type: 'box'; layout: 'vertical'|'horizontal'|'baseline'; contents: Array<FlexBox|FlexText> };
export type FlexBubble = { type: 'bubble'; body: FlexBox };
export type FlexMessage = { type: 'flex'; altText: string; contents: FlexBubble };
export const HelloBubble: FlexBubble = {
  type: 'bubble',
  body: { type: 'box', layout: 'vertical', contents: [
    { type: 'text', text: 'Hello from LINE Flex', weight: 'bold', size: 'lg' },
    { type: 'text', text: 'This is a sample bubble.' }
  ] }
};
export const HelloMessage: FlexMessage = { type: 'flex', altText: 'Hello Flex', contents: HelloBubble };
` });
    files.push({ path: `src/line/flex-example.ts`, template: `import { LineMessagingClient } from './client';
import { HelloMessage } from './flex';
export async function sendHelloFlex(token: string, to: string){
  const client = new LineMessagingClient(token);
  await client.push(to, [HelloMessage as any]);
}
` });
  }

  // Expo testing style: add RN-friendly test skeletons
  if (lib === 'expo' && style === 'testing') {
    if (pattern === 'hook') {
      files.push({ path: `src/hooks/useLineLogin.test.tsx`, template: `import { describe, it, expect } from 'vitest';
// NOTE: This is a placeholder test. In a real app, use @testing-library/react-native.
describe('useLineLogin', () => { it('placeholder', () => { expect(true).toBe(true); }); });
` });
    }
    if (pattern === 'provider') {
      files.push({ path: `src/context/LineAuthProvider.test.tsx`, template: `import { describe, it, expect } from 'vitest';
// NOTE: This is a placeholder test. In a real app, use @testing-library/react-native.
describe('LineAuthProvider', () => { it('placeholder', () => { expect(true).toBe(true); }); });
` });
    }
    if (pattern === 'example') {
      files.push({ path: `App.test.tsx`, template: `import { describe, it, expect } from 'vitest';
// NOTE: Placeholder App test for Expo example.
describe('App', () => { it('renders', () => { expect(true).toBe(true); }); });
` });
    }
  }
  // Email/Notification providers
  if ((lib === 'resend' || lib === 'sendgrid' || lib === 'postmark' || lib === 'mailgun' || lib === 'nodemailer') && (pattern === 'service')) {
    if (lib === 'resend') {
      files.push({ path: `src/email/resend.ts`, template: `export async function sendResend(apiKey: string, from: string, to: string, subject: string, html: string){
  const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, subject, html }) });
  if (!res.ok) throw new Error('resend_failed:' + res.status);
  return res.json();
}
` });
    }
    if (lib === 'postmark') {
      files.push({ path: `src/email/postmark.ts`, template: `export async function sendPostmark(serverToken: string, from: string, to: string, subject: string, htmlBody: string){
  const res = await fetch('https://api.postmarkapp.com/email', { method: 'POST', headers: { 'X-Postmark-Server-Token': serverToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ From: from, To: to, Subject: subject, HtmlBody: htmlBody }) });
  if (!res.ok) throw new Error('postmark_failed:' + res.status);
  return res.json();
}
` });
    }
    if (lib === 'mailgun') {
      files.push({ path: `src/email/mailgun.ts`, template: `export async function sendMailgun(domain: string, apiKey: string, from: string, to: string, subject: string, text: string){
  const url = new URL('/v3/' + domain + '/messages', 'https://api.mailgun.net');
  const body = new URLSearchParams({ from, to, subject, text });
  const res = await fetch(url, { method: 'POST', headers: { 'Authorization': 'Basic ' + Buffer.from('api:' + apiKey).toString('base64') }, body });
  if (!res.ok) throw new Error('mailgun_failed:' + res.status);
  return res.text();
}
` });
    }
    if (lib === 'nodemailer') {
      files.push({ path: `src/email/nodemailer.ts`, template: `import nodemailer from 'nodemailer';
export async function sendSmtp(opts: { host: string; port?: number; secure?: boolean; user?: string; pass?: string; from: string; to: string; subject: string; text?: string; html?: string; }){
  const transporter = nodemailer.createTransport({ host: opts.host, port: opts.port ?? 587, secure: !!opts.secure, auth: opts.user ? { user: opts.user, pass: opts.pass } : undefined });
  const info = await transporter.sendMail({ from: opts.from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
  return info.messageId;
}
` });
    }
    if (lib === 'sendgrid') {
      files.push({ path: `src/email/sendgrid.ts`, template: `export async function sendSendGrid(apiKey: string, from: string, to: string, subject: string, html: string){
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: from }, subject, content: [{ type: 'text/html', value: html }] }) });
  if (!res.ok) throw new Error('sendgrid_failed:' + res.status);
  return res.text();
}
` });
    }
  }
  if ((lib === 'resend' || lib === 'sendgrid' || lib === 'postmark' || lib === 'mailgun') && pattern === 'route') {
    files.push({ path: `src/email/${lib}-route.ts`, template: `import express from 'express';
import { z } from 'zod';
const Body = z.object({ from: z.string(), to: z.string(), subject: z.string(), html: z.string().optional(), text: z.string().optional() });
export function make${lib.charAt(0).toUpperCase() + lib.slice(1)}Route(apiKey: string){
  const app = express();
  app.use(express.json());
  app.post('/email/send', async (req, res)=>{
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      // call provider-specific sender here
      return res.json({ ok: true });
    } catch (e) { return res.status(400).json({ error: String(e) }); }
  });
  return app;
}
` });
  }

  // Email provider webhooks (secure style adds simple verify placeholder)
  if ((lib === 'resend' || lib === 'sendgrid' || lib === 'postmark' || lib === 'mailgun') && pattern === 'webhook') {
    const Name = lib.charAt(0).toUpperCase() + lib.slice(1);
    files.push({ path: `src/email/${lib}-webhook.ts`, template: `import express from 'express';
export function ${lib}Webhook(){
  const app = express();
  app.use(express.json());
  app.post('/email/${lib}/events', (req, res)=>{
    // NOTE: verify signature (${Name}) here when available
    // events are in req.body
    res.status(200).send('ok');
  });
  return app;
}
` });
  }

  // Email webhook signature verification stubs (secure)
  if (lib === 'sendgrid' && pattern === 'webhook' && style === 'secure') {
    files.push({ path: `src/email/sendgrid-verify.ts`, template: `// SendGrid Event Webhook signature verification (stub)
export function verifySendGridSignature(_publicKey: string, _timestamp: string, _signature: string, _payload: string){
  // See: https://docs.sendgrid.com/for-developers/tracking-events/event#verify-the-event-webhook-signature
  return true; // replace with actual ECDSA verification
}
` });
    files.push({ path: `src/email/sendgrid-webhook.ts`, template: `import express from 'express';
import { verifySendGridSignature } from './sendgrid-verify';
export function sendgridWebhookSecure(publicKey: string){
  const app = express();
  app.use(express.text({ type: '*/*' }));
  app.post('/email/sendgrid/events', (req, res)=>{
    const sig = req.get('X-Twilio-Email-Event-Webhook-Signature') || '';
    const ts = req.get('X-Twilio-Email-Event-Webhook-Timestamp') || '';
    const ok = verifySendGridSignature(publicKey, ts, sig, req.body);
    if (!ok) return res.status(403).send('forbidden');
    res.status(200).send('ok');
  });
  return app;
}
` });
  }
  if (lib === 'postmark' && pattern === 'webhook' && style === 'secure') {
    files.push({ path: `src/email/postmark-verify.ts`, template: `// Postmark Webhook signature verification (stub)
export function verifyPostmarkSignature(_token: string, _signature: string, _payload: string){
  // See: https://postmarkapp.com/developer/webhooks
  return true;
}
` });
    files.push({ path: `src/email/postmark-webhook.ts`, template: `import express from 'express';
import { verifyPostmarkSignature } from './postmark-verify';
export function postmarkWebhookSecure(token: string){
  const app = express();
  app.use(express.text({ type: '*/*' }));
  app.post('/email/postmark/events', (req, res)=>{
    const sig = req.get('X-Postmark-Signature') || '';
    const ok = verifyPostmarkSignature(token, sig, req.body);
    if (!ok) return res.status(403).send('forbidden');
    res.status(200).send('ok');
  });
  return app;
}
` });
  }
  if (lib === 'mailgun' && pattern === 'webhook' && style === 'secure') {
    files.push({ path: `src/email/mailgun-verify.ts`, template: `// Mailgun Webhook signature verification (stub)
export function verifyMailgunSignature(_apiKey: string, _timestamp: string, _token: string, _signature: string){
  // See: https://documentation.mailgun.com/en/latest/user_manual.html#securing-webhooks
  return true;
}
` });
    files.push({ path: `src/email/mailgun-webhook.ts`, template: `import express from 'express';
import { verifyMailgunSignature } from './mailgun-verify';
export function mailgunWebhookSecure(apiKey: string){
  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.post('/email/mailgun/events', (req, res)=>{
    const ts = String(req.body.timestamp || '');
    const token = String(req.body.token || '');
    const sig = String(req.body.signature || '');
    const ok = verifyMailgunSignature(apiKey, ts, token, sig);
    if (!ok) return res.status(403).send('forbidden');
    res.status(200).send('ok');
  });
  return app;
}
` });
  }
  if (lib === 'resend' && pattern === 'webhook' && style === 'secure') {
    files.push({ path: `src/email/resend-verify.ts`, template: `// Resend Webhook verification (stub)
export function verifyResendSignature(_secret: string, _timestamp: string, _signature: string, _payload: string){
  return true;
}
` });
    files.push({ path: `src/email/resend-webhook.ts`, template: `import express from 'express';
import { verifyResendSignature } from './resend-verify';
export function resendWebhookSecure(secret: string){
  const app = express();
  app.use(express.text({ type: '*/*' }));
  app.post('/email/resend/events', (req, res)=>{
    const sig = req.get('X-Resend-Signature') || '';
    const ts = req.get('X-Resend-Timestamp') || '';
    const ok = verifyResendSignature(secret, ts, sig, req.body);
    if (!ok) return res.status(403).send('forbidden');
    res.status(200).send('ok');
  });
  return app;
}
` });
  }

  // GraphQL endpoints (Next.js route / Express server)
  if ((lib === 'graphql' || lib === 'apollo' || lib === 'graphql-yoga') && pattern === 'route' && (lang === 'ts' || lang === 'js')) {
    files.push({ path: `app/api/graphql/route.ts`, template: `import { NextResponse } from 'next/server';
export async function POST(){ return NextResponse.json({ ok: true }); }
` });
  }
  if ((lib === 'graphql' || lib === 'apollo') && pattern === 'service' && (lang === 'ts' || lang === 'js')) {
    files.push({ path: `src/graphql/express-server.ts`, template: `import express from 'express';
export function createGraphQLServer(){ const app = express(); app.post('/graphql', (_req, res)=> res.json({ ok: true })); return app; }
` });
  }

  // LINE Flex variants / RichMenu / LIFF share sample
  if (lib === 'line' && (pattern === 'example' || pattern === 'component')) {
    files.push({ path: `src/line/flex-variants.ts`, template: `export const InfoBubble = { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: [ { type: 'text', text: 'Info', weight: 'bold' }, { type: 'text', text: 'Details here' } ] } } as const;
export const AlertBubble = { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: [ { type: 'text', text: 'Alert', weight: 'bold' }, { type: 'text', text: 'Something happened' } ] } } as const;
` });
  }
  if (lib === 'line' && pattern === 'config') {
    files.push({ path: `src/line/richmenu.ts`, template: `export const SampleRichMenu = { size: { width: 2500, height: 843 }, selected: false, areas: [ { bounds: { x:0,y:0,width:1250,height:843 }, action: { type: 'message', text: 'left' } }, { bounds: { x:1250,y:0,width:1250,height:843 }, action: { type: 'message', text: 'right' } } ] } as const;
` });
  }
  if (lib === 'line' && (pattern === 'provider' || pattern === 'example')) {
    files.push({ path: `src/line/liff-share.ts`, template: `export async function shareText(text: string){
  const { liff } = (await import('@line/liff')) as any;
  await liff.shareTargetPicker([{ type: 'text', text }]);
}
` });
  }

  // LINE webhook -> GraphQL + Email pipeline (advanced)
  if (lib === 'line' && pattern === 'adapter' && style === 'advanced') {
    files.push({ path: `src/line/pipeline.ts`, template: `import type { Request, Response } from 'express';
import { postGraphQL } from '@/src/graphql/adapter';
import { sendResend } from '@/src/email/resend';
export function makeLinePipeline(endpoint: string, resendKey: string, notifyTo: string){
  return async (req: Request, res: Response)=>{
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    for (const ev of body?.events || []){
      if (ev.type === 'message' && ev.message?.type === 'text'){
        await postGraphQL(endpoint, 'mutation($to:String!,$text:String!){ sendMessage(to:$to,text:$text) }', { to: ev.source?.userId || 'unknown', text: ev.message.text });
        await sendResend(resendKey, 'no-reply@example.com', notifyTo, 'Line message', '<' + 'pre' + '>' + String(ev.message.text) + '</' + 'pre' + '>');
      }
    }
    res.status(200).send('ok');
  };
}
` });
  }

  // GraphQL schema/resolvers scaffolding
  if ((lib === 'apollo' || lib === 'graphql-yoga' || lib === 'graphql') && (pattern === 'schema' || pattern === 'service')) {
    files.push({ path: `src/graphql/schema.ts`, template: `export const typeDefs = /* GraphQL */ ` + "`" + `
type Query { hello: String! }
type Mutation { ping(message: String!): String! }
` + "`" + `;
` });
    files.push({ path: `src/graphql/resolvers.ts`, template: `export const resolvers = {
  Query: { hello: () => 'world' },
  Mutation: { ping: (_: any, args: { message: string }) => args.message }
};
` });
    if (lib === 'graphql-yoga' && pattern === 'service') {
      files.push({ path: `src/graphql-yoga/server.ts`, template: `// Minimal Yoga server stub (for reference)
export function createYogaServer(){ /* integrate @graphql-yoga/node in real app */ }
` });
    }
  }

  // LINE -> GraphQL bridge (advanced adapter posts mutation)
  if (lib === 'line' && pattern === 'adapter' && (style === 'advanced' || style === 'typed')) {
    files.push({ path: `src/line/graphql-bridge.ts`, template: `import { postGraphQL } from '@/src/graphql/adapter';
export async function sendLineMessageViaGraphQL(endpoint: string, to: string, text: string){
  const mutation = ` + "`" + `mutation($to: String!, $text: String!){ sendMessage(to:$to, text:$text) }` + "`" + `;
  return postGraphQL(endpoint, mutation, { to, text });
}
` });
  }

  files.push({ path: `spikes/${id}.${ext}.txt`, template: codeSnippet(lib, pattern, lang, style) });
  files.push({ path: `spikes/${id}.md`, template: `# ${lib} ${pattern} (${style}, ${lang})\n\nThis is an auto-generated spike template.\n` });
  // Testing artifacts
  if (style === 'testing') {
    if (lang === 'ts' || lang === 'js') {
      files.push({ path: `spikes/${id}.test.${lang === 'ts' ? 'ts' : 'js'}`, template: `describe('demo', ()=>{ it('works', ()=>{ expect(true).toBe(true); }); });\n` });
    }
    if (lang === 'py') {
      files.push({ path: `spikes/${id}_test.py`, template: `def test_demo():\n    assert True\n` });
    }
  }
  return files;
}

function extraParams(lib: string, pattern: string): Array<{ name: string; required?: boolean; description?: string; default?: string }>{
  const params: Array<{ name: string; required?: boolean; description?: string; default?: string }> = [];
  if (lib === 'line') {
    params.push({ name: 'channelId', required: false, description: 'LINE Channel ID', default: 'YOUR_CHANNEL_ID' });
    params.push({ name: 'channelSecret', required: false, description: 'LINE Channel Secret', default: 'YOUR_CHANNEL_SECRET' });
    params.push({ name: 'channelAccessToken', required: false, description: 'LINE Channel Access Token', default: 'YOUR_CHANNEL_ACCESS_TOKEN' });
    params.push({ name: 'liffId', required: false, description: 'LIFF App ID (optional)', default: 'YOUR_LIFF_ID' });
  }
  if (lib === 'prisma' && pattern === 'schema') {
    params.push({ name: 'model', required: false, description: 'Prisma モデル名', default: 'Item' });
  }
  if (lib === 's3') {
    params.push({ name: 'region', required: false, description: 'AWS リージョン', default: 'us-east-1' });
    params.push({ name: 'bucket', required: false, description: 'S3 バケット名', default: 'my-bucket' });
  }
  if (lib === 'stripe' && (pattern === 'service' || pattern === 'webhook')) {
    params.push({ name: 'priceId', required: false, description: 'Stripe Price ID', default: 'price_123' });
  }
  if (lib === 'redis') {
    params.push({ name: 'redisUrl', required: false, description: 'Redis 接続URL', default: 'redis://localhost:6379' });
  }
  return params;
}

export function generateSpike(id: string): SpikeSpec {
  if (!isGeneratedId(id)) {
    throw new Error(`Not a generated spike id: ${id}`);
  }
  // Remove either prefix when parsing id components
  const without = id
    .replace(new RegExp(`^${GEN_PREFIX}`), '')
    .replace(new RegExp(`^${STRIKE_PREFIX}`), '');
  const parts = without.split('-');
  if (parts.length < 4) {
    throw new Error(`Invalid generated spike id: ${id}`);
  }
  const lang = parts.pop() as string;
  const style = parts.pop() as string;
  const pat = parts.pop() as string;
  const lib = parts.join('-');
  const name = `${lib} ${pat} ${style} ${lang}`;
  const spec: SpikeSpec = {
    id,
    name,
    version: '0.1.0',
    stack: [lib, lang],
    tags: [pat, style, 'generated'].concat(id.startsWith(STRIKE_PREFIX) ? ['strike'] : []),
    description: `Auto-generated spike for ${lib} ${pat} in ${lang} (${style}).`,
    params: [{ name: 'app_name', default: `${lib}-${pat}-app` }, ...extraParams(lib, pat)],
    files: makeFiles(id, lib, pat, style, lang),
    patches: [] as SpikePatch[]
  };
  return spec;
}

export function generateMetadata(id: string): SpikeMetadata {
  const spec = generateSpike(id);
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    stack: spec.stack,
    tags: spec.tags,
    version: spec.version,
    fileCount: spec.files?.length || 0,
    patchCount: spec.patches?.length || 0
  };
}
