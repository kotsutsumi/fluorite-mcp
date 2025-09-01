# Strike テンプレート超大量生成ガイド（100,000+ 対応）

このプロジェクトは、物理ファイルの増加やビルド時間の悪化を避けつつ、100,000 件以上のスパイク（テンプレート）を “仮想的に” 提供する仕組みを実装済みです。`strike-` と `gen-` の ID を用いた組み合わせ生成で、膨大なライブラリ × パターン × スタイル × 言語の行列をカバーします。

- 生成器: `src/core/spike-generators.ts`
- カタログ: `src/core/spike-catalog.ts`（ファイル存在時はそれを優先、なければ生成器で合成）
- ツール: `list-generated-spikes`, `discover-spikes`, `preview-spike`, `apply-spike`, `validate-spike`, `explain-spike`
- マテリアライズ（任意）: `scripts/materialize-spikes.ts`

## 何が “100,000+” なのか

`LIBRARIES` × `PATTERNS` × `STYLES` × `LANGS` の直積を、`gen-` と `strike-` の 2 系列で生成します。既存の配列だけで 100,000 件以上が確保され、テストでも閾値を満たすことを検証済みです（`src/core/spike-generators.count.test.ts`）。

- `strike-xxxxx-<pattern>-<style>-<lang>`（Strike ブランド ID）
- `gen-xxxxx-<pattern>-<style>-<lang>`（通常の生成 ID）

> 例: `strike-nextjs-route-typed-ts`, `gen-fastapi-service-secure-py` など

## 使い方（MCP ツール）

- 一覧（フィルタ可）: `list-generated-spikes`
  - 引数: `libs`, `patterns`, `styles`, `langs`, `limit`, `prefix`（`strike`|`gen`|`any`）
  - 例: `list-generated-spikes { patterns:["route"], styles:["typed"], langs:["ts"], prefix:"strike", limit:50 }`
- 発見・検索: `discover-spikes`
  - 日本語/英語クエリで関連度順にスパイク候補を表示
  - 例: `discover-spikes { query:"Next.js 型安全な API ルート" }`
- 自動選定: `auto-spike`
  - 自然言語の要件から高スコア候補を選び、次アクションを提示
  - 別名推論（ショートエイリアス）も対応
- プレビュー: `preview-spike { id:"strike-nextjs-route-typed-ts" }`
- 適用計画（diff 返却）: `apply-spike { id:"…", strategy:"three_way_merge" }`
- 簡易検証: `validate-spike { id:"…" }`
- 説明: `explain-spike { id:"…" }`

## ID の命名規則（覚え方）

`strike-<library>-<pattern>-<style>-<lang>`

- library: 例 `nextjs`, `react`, `bun-elysia`, `fastapi`, `s3`, `stripe`, `redis` …
- pattern: 例 `route`, `service`, `client`, `schema`, `component`, `hook`, `middleware`, `worker`, `webhook` …
- style: `basic` | `typed` | `advanced` | `secure` | `testing`
- lang: `ts` | `js` | `py` | `go` | `rs` | `kt`

ショートエイリアスにも対応（例）:

- `elysia-worker-ts` → `strike-bun-elysia-worker-typed-ts`
- `next-route-ts` → `strike-nextjs-route-typed-ts`
- `fastapi-secure-py` → `strike-fastapi-route-secure-py`

（詳細は `src/core/spike-handlers.ts` の `inferStrikeAliasIds` を参照）

## 物理ファイルへ“マテリアライズ”する（任意）

実運用で一部セットだけ物理テンプレートを配布したい場合は、スクリプトで JSON を生成します。既存ファイルは上書きしません。

- 例1: 200 件だけ出力
  - `npm run materialize:spikes -- --limit 200`
- 例2: Next.js の `route` × `typed` × `ts`（Strike）を 500 件上限で
  - `npm run materialize:spikes -- --libs nextjs --patterns route --styles typed --langs ts --limit 500 --prefix strike`

出力先: `src/spikes/`

## 大量生成時のコツ（環境変数）

- `FLUORITE_SPIKE_LIST_LIMIT`: 一覧の露出上限を制御
- `FLUORITE_GENERATED_SPIKES_LIMIT`: 生成 ID 数の上限（診断/プレビュー用途）
- `FLUORITE_ALIAS_ENABLE`: エイリアス推論 ON/OFF（既定: ON）

メモリ制約のある CI/環境では、上記を併用して段階的に確認してください。

## 反復拡張の方針（提案）

- ライブラリ拡充: Django, Rails, Laravel, Spring Boot, Phoenix, ASP.NET などを `LIBRARIES` に追加
- パターン拡充: `operator`, `job`, `daemon`, `adapter-io`, `bridge` など
- 言語拡充: 要望に応じて `rb`, `php`, `java`, `cs` 等をスニペット対応（`codeSnippet` の分岐を追加）
- パック整備: よく使う組合せを `spike-packs.ts` に追加（例: 認証＋検索＋監視）
- 品質チェック: 高頻度スタックのプレビューに軽量な検証を追加（`validate-spike` の強化）

この設計により、テンプレート総数は無制限に拡張可能で、ストレージ/ビルド負荷を抑えたまま 100,000 件以上の Strike テンプレート提供を継続できます。

