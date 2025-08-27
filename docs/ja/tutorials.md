## クイックチュートリアル（導入→検証→ロールバック）

最小ステップでスパイクを導入・検証し、不要なら差分をロールバックする手順をまとめます。

### 1) パック選定と下見
```
fluorite spikes packs
fluorite spikes synth --pack search --generated-only --max 20
```

### 2) 差分のプレビューと適用
Claude Code から:
```
/fl:spike preview id=strike-elasticsearch-client-typed-ts
/fl:spike apply id=strike-elasticsearch-client-typed-ts strategy=three_way_merge
```

### 3) 動作確認（最小サンプル）
```
npx tsx examples/pack-examples/meili/index.ts
npx tsx examples/pack-examples/pino/index.ts
```

補足（フル例）:
```
# もっと包括的に（/health, /metrics を露出する最小HTTPサーバ）
npx tsx examples/pack-examples/monitoring-full/index.ts
# 確認
curl -s localhost:3001/health | jq
curl -s localhost:3001/metrics

# 検索サービス（Meiliが無ければインメモリ）
npx tsx examples/pack-examples/search-full/index.ts
# シード/リセット（メモリバックエンド限定）
curl -s -X POST localhost:3002/_seed -H 'content-type: application/json' \
  -d '[{"id":"1","title":"hello"},{"id":"2","content":"world"}]'
curl -s -X POST localhost:3002/_reset
```

### 4) 検証観点の確認
- `docs/ja/pack-checklists.md` を参照して必須観点を順にチェック

### 5) ロールバック（不要だった場合）
- クライアント側で Git 消し込み（サーバーは diff 返却のみ）
- もしくは `git restore -SW :/` などで差分破棄

—

追加の例や注意事項は `docs/ja/strike-packs.md`, `docs/ja/strike-recipes.md`, `docs/ja/pack-samples.md` を参照してください。
# 検索サービス（Meiliが無ければインメモリ）
npx tsx examples/pack-examples/search-full/index.ts
