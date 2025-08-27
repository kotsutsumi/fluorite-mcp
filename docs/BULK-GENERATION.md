# Bulk Generation Guide (10k+ Strike Templates)

This guide explains how to materialize 10,000+ generated Strike templates to disk in repeated batches.

## TL;DR

- One-time per session (optional):
  ```bash
  export FLUORITE_GENERATED_SPIKES_LIMIT=0   # expose all generated IDs
  ```
- Run batches (example: 1,000 items × 10 runs):
  ```bash
  fluorite spikes synth-bulk --generated-only --filter '^strike-' --total 1000 --batch 100 --pretty
  # re-run the same command 9 more times (it resumes automatically)
  ```
- Inspect a sample in Claude:
  - `/fl:spike auto "Next.js に typed route を追加"` → preview → apply
  - Docs: `fluorite docs` / `fluorite docs --open recipes.md`

## Command Options

- `--filter <regex>`: restrict IDs (default: `^strike-`)
- `--total <n>`: number of items to write in this run (default: 1000)
- `--batch <n>`: batch size per iteration (default: 100)
- `--generated-only`: ignore non-generated items
- `--pretty`: pretty JSON output (slightly larger files)
- `--overwrite`: overwrite files if already present (default: skip)
- `--state-file`: progress state (default: `src/cli/data/synth-state.json`)
- `--start-index <n>`: manual override starting index (advanced)
- `--dry-run`: print plan but do not write files

## Recommended Cadence

- Start with `--dry-run` to estimate counts
- Run with `--total 1000 --batch 100` then re-run 9 more times → ~10k
- Use different filters per run if needed (e.g., `^strike-(nextjs|bun-elysia)-`)

## Verification & Quality

- In Claude: preview/apply a subset and follow the docs (One-Pagers/Recipes)
- Post-apply: run checklists and verification commands
- Monitor growth (repo size, CI time); consider archiving older batches

## Docs

- `fluorite docs` (list); `--show`; `--cat`; `--open`
- One-Pagers: `docs/one-pagers.md`
- Recipes: `docs/recipes.md`
- File Structures: `docs/file-structure-samples.md`
- Minimal Diffs: `docs/diff-samples.md`
- Post-Apply: `docs/post-apply-checklists.md`
- Verification: `docs/verification-examples.md`
- Monitoring/Alerts: `docs/monitoring-alerts.md`
- Queue/Snippets: `docs/queue-snippets.md`
- Search Tips: `docs/search-index-tips.md`
