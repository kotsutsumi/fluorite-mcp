# Repository Guidelines

## Project Structure & Module Organization
- `src/server.ts`: MCP server entry. Registers resources and tools.
- `src/core/`: Core modules
  - `catalog.ts`, `handlers.ts`, `logger.ts`, `static-analysis-*`: spec I/O, tool handlers, logging, analyzers
  - `spike-catalog.ts`, `spike-handlers.ts`: spike templates and tool flow
- `src/catalog/`: Runtime spec catalog (YAML/JSON) served via `spec://{pkg}`
- `src/spikes/`: Spike templates (`*.json`) rendered via spike tools
- `src/test/`: Vitest tests
- `docs/`, `README.md`: Documentation

## Build, Test, and Development Commands
- `npm run dev`: Start server in dev (stdio) via tsx
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled server from `dist/`
- `npm test`: Build then run all tests
- `npm run test:unit` / `npm run test:e2e` / `npm run test:coverage`: Focused runs
- Quick CLI add (Claude Code): `claude mcp add fluorite -- fluorite-mcp`

## Coding Style & Naming Conventions
- Language: TypeScript (ES2022 modules, strict mode)
- Indentation: 2 spaces; avoid trailing whitespace
- Filenames: kebab-case for TS (`static-analysis-handlers.ts`), kebab/JSON for specs (`library-name.yaml`)
- Exports: prefer named exports; keep modules focused
- Lint/typecheck: `npm run lint` (tsc noEmit). No repo-wide formatter—follow existing style

## Testing Guidelines
- Framework: Vitest (`vitest`, `@vitest/coverage-v8`)
- Location: tests colocated (e.g., `src/core/logger.test.ts`)
- Naming: `*.test.ts`
- Run: `npm test` (or `npm run test:unit` / `:e2e`)
- Goal: keep fast, deterministic tests; cover new tools/handlers and critical branches

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat: add spike tools`, `fix: handle ENOENT`) and small, scoped diffs
- PRs: clear description, rationale, linked issues, and before/after notes; include docs changes when adding tools/specs
- CI: ensure `npm run validate` passes locally before opening PRs

## Security & Configuration Tips
- Node.js ≥ 18. Env vars: `FLUORITE_CATALOG_DIR` (spec dir), `FLUORITE_LOG_LEVEL`, `FLUORITE_LOG_FORMAT=json`
- Self-diagnostics: run server with `--self-test` or `--perf-test`
- Spike safety: server returns files/diffs; clients apply changes—avoid mutating user FS on the server

## Agent-Specific Notes
- Add tools by implementing handlers in `src/core/` and registering in `src/server.ts`
- Add specs to `src/catalog/` and spikes to `src/spikes/`; prefer minimal, composable templates
- Update README sections listing available tools and features
