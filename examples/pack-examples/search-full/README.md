# Search Full Example (HTTP + /search)

Minimal HTTP search service with MeiliSearch fallback to in-memory index.

- MeiliSearch enabled when `MEILI_HOST` is set. API key via `MEILI_API_KEY`.
- Otherwise, uses an in-memory index (simple substring match).
- Port: `PORT` (default 3002)

Run:
```bash
# Start service
npx tsx examples/pack-examples/search-full/index.ts
# Seed a doc (in-memory mode)
curl -s -X POST localhost:3002/index -H 'content-type: application/json' \
  -d '{"id":"1","title":"hello","content":"world"}'
# Search
curl -s 'localhost:3002/search?q=hello' | jq

# Optional bulk seed/reset (memory backend only)
curl -s -X POST localhost:3002/_seed -H 'content-type: application/json' \
  -d '[{"id":"1","title":"hello"},{"id":"2","content":"world"}]'
curl -s -X POST localhost:3002/_reset
```

Notes:
- For MeiliSearch, create an index named `samples` or seed via the POST /index endpoint.
- This example is intentionally minimal. See docs/ja/pack-checklists.md for validation points.
