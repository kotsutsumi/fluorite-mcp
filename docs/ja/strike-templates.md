# Strike テンプレート（100k+ 自動生成）

本サーバは、`strike-` および `gen-` プレフィックスを持つテンプレートをオンデマンド生成し、20万件超のスパイク（組み合わせ）を提供します。物理ファイルを増やさず、必要なときに即時レンダリングする仕組みです。

- 規模: 約 204,120 テンプレート（`2 * |LIBRARIES| * |PATTERNS| * |STYLES| * |LANGS|`）
- 例: `strike-nextjs-route-typed-ts`, `strike-bun-elysia-plugin-secure-ts`, `strike-fastapi-route-secure-py`
- 目的: 多様なライブラリ/パターン/スタイル/言語の試行（spike）を最小コストで開始する

## 使い方（MCP ツール）

- 一覧取得: `discover-spikes` ツール
  - 引数: `query`（任意, スコアリング用）, `limit`（既定 20, 最大 50）, `offset`
  - 出力: 件数、候補（id / name / tags / score）
- プレビュー: `preview-spike` ツール
  - 引数: `id`, `params`（テンプレート内の `{{var}}` 置換）
  - 出力: 生成ファイルとパッチのプレビュー（サーバは適用せず返すだけ）
- 適用計画: `apply-spike` ツール
  - 引数: `id`, `params`, `strategy`（`three_way_merge` 推奨）
  - 注意: サーバは差分を返すのみ。クライアント側で適用してください
- 自動選定: `auto-spike` ツール
  - 引数: `task`（自然言語）, `constraints`（任意）
  - 仕組み: メタデータでスコアリング→上位候補から1件を選定→`preview-spike` を提案

## 主な ID ルール

```
strike-<library>-<pattern>-<style>-<lang>
```

- `<library>` 例: `nextjs`, `bun-elysia`, `react`, `fastapi`, `prisma`, `redis`, `algolia` など多数
- `<pattern>` 例: `route`, `middleware`, `component`, `hook`, `provider`, `adapter`, `service`, `client`, `schema`, `migration`, `seed`, `worker`, `listener` など
- `<style>` 例: `basic`, `typed`, `advanced`, `secure`, `testing`
- `<lang>` 例: `ts`, `js`, `py`, `go`, `rs`, `kt`

## 検索クエリのヒント

`discover-spikes` の `query` は日本語も簡易対応しています（`secure/typed/route` 等に正規化）。

- 例1: `"Next.js API セキュア TypeScript"` → `strike-nextjs-route-secure-ts` 付近が上位
- 例2: `"Elysia worker typed ts"` → `strike-bun-elysia-worker-typed-ts`
- 例3: `"FastAPI ルート セキュア Python"` → `strike-fastapi-route-secure-py`

さらに、短縮エイリアスも一部サポートしています（`auto-spike` 内）。

- 例: `alias: elysia-worker-ts` → `strike-bun-elysia-worker-typed-ts`

## 代表的なワークフロー

1) 候補探索

```
discover-spikes { query: "Next.js ルート typed ts", limit: 10 }
```

2) プレビュー

```
preview-spike { id: "strike-nextjs-route-typed-ts" }
```

3) 適用計画（クライアント側適用）

```
apply-spike { id: "strike-nextjs-route-typed-ts", strategy: "three_way_merge" }
```

## パフォーマンスと環境変数

大規模カタログはメモリを消費します。テストや開発では以下の環境変数で上限を調整してください。

- `FLUORITE_SPIKE_LIST_LIMIT`: `listSpikeIds` の返却件数を上限スライス
- `FLUORITE_GENERATED_SPIKES_LIMIT`: 自動生成 ID の上限（総当りをキャップ）
- `FLUORITE_SPIKE_METADATA_MULTIPLIER`: `discover-spikes` 内部のメタ読み込み増幅（1〜5）
- `FLUORITE_AUTO_SPIKE_BATCH`: `auto-spike` のメタ走査バッチサイズ（10〜200）
- `FLUORITE_ALIAS_ENABLE`: エイリアス推論のON/OFF（既定ON）
- `FLUORITE_ALIAS_BOOST`: エイリアスのスコア増幅（既定 2.0, 0〜5）

例（テスト実行時のヒープ節約）:

```
FLUORITE_SPIKE_LIST_LIMIT=500 FLUORITE_GENERATED_SPIKES_LIMIT=2000 npm test
```

## よくある質問

- Q: 本当に 10万件以上ありますか？
  - A: 既定の組合せで約 204,120 件（`strike-` と `gen-` を含む）を生成可能です。
- Q: 物理ファイルはどこにありますか？
  - A: 物理ファイルは必要最小限です。`strike-*`/`gen-*` はランタイム生成され、`preview`/`apply` で返却します。
- Q: もっと特化したテンプレートが欲しい
  - A: `src/core/spike-generators.ts` の `LIBRARIES`/`PATTERNS`/`STYLES`/`LANGS` を拡張、もしくは `src/spikes/` に個別 JSON を追加してください。

