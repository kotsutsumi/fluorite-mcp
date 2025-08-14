# Repository Guidelines

## Project Structure & Modules
- `src/`: TypeScript sources. Key areas: `core/` (catalog, handlers, logger), `server.ts` (MCP server entry), `catalog/` (YAML spec files), `test/` (e2e setup).
- `dist/`: Compiled output (not edited by hand).
- `docs/`: VitePress site (`.vitepress/`, `specs/`).
- Config: `tsconfig.json`, `vitest.config.ts`, GitHub Actions in `.github/workflows/`.

## Build, Test, and Dev Commands
- `npm run dev`: Start the MCP server in watch mode via `tsx`.
- `npm run build`: Clean `dist/` and compile TypeScript.
- `npm start`: Run compiled server from `dist/`.
- `npm test`: Build then run all tests with Vitest.
- `npm run test:unit`: Run unit tests (excludes e2e).
- `npm run test:e2e`: Build then run e2e tests.
- `npm run test:coverage`: Build then run tests with coverage.
- `npm run lint`: Type-check (no emit) as the primary linting step.
- Docs: `npm run docs:dev`, `docs:build`, `docs:preview`.

## Coding Style & Naming
- Language: TypeScript ES2022, strict mode; Node >= 18.
- Indentation: 2 spaces; use single quotes; trailing commas where valid.
- Filenames: kebab- or lower-case (e.g., `server.ts`, `handlers.test.ts`).
- Specs: place YAML in `src/catalog/` using `@scope__name.yaml` (replace `/` with `__`).
- Linting: rely on `tsc --noEmit`; keep public types in `types.ts` or near usage.

## Testing Guidelines
- Framework: Vitest with V8 coverage; global thresholds at 80% (branches, lines, etc.).
- Locations: unit tests live alongside code (`*.test.ts` in `src/**`); e2e in `src/test/`.
- Commands: `npm run test:unit` for fast feedback; `npm run test:e2e` for process-level checks.
- Prefer small, deterministic tests; avoid network and filesystem writes unless mocked.

## Commit & Pull Requests
- Commits: prefer Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`). Keep messages imperative and scoped.
- PRs: include a concise description, linked issues, test coverage impact, and steps to verify. Add screenshots when docs change.
- Checks: PRs should pass `npm run validate` (type-check + tests) and maintain coverage.

## Security & CI Tips
- Releases: pushing `v*.*.*` tags triggers publish; set `NPM_TOKEN` secret.
- Docs deploys on `main` via Pages. Use `npm ci` for reproducible installs.
