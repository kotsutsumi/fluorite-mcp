# Search Index Tips (Meilisearch/Typesense)

## Meilisearch
- Schema: define primary key; use filterable/sortable attributes only where needed
- Synonyms and stop-words: configure domain terms and abbreviations
- Tokenization: consider n-gram/word splitting for your language
- Index updates: batch writes and wait for task completion before querying

## Typesense
- Collections: choose appropriate `fields` and `facet` settings
- Synonyms: set synonyms JSON to improve recall
- Ranking: adjust `ranking` and `sort_by` based on UX requirements
- Security: use scoped API keys and server-side signed search params where applicable

