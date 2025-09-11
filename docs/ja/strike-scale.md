## 100K+ Strike テンプレート拡張ガイド（日本語）

Fluorite MCP は、物理ファイルのスパイクに加えて「仮想スパイク（実行時合成）」を提供します。これにより `strike-*` を含むテンプレートを 100,000 件以上スケールして提供できます。

このドキュメントでは、規模、設計方針、使い方、パフォーマンス調整（環境変数）をまとめます。

### 規模と設計の考え方

- 次元の組み合わせで合成
  - ライブラリ/フレームワーク: 170+（React/Next.js/FastAPI/Express/Prisma/Redis/Kafka/S3 など）
  - パターン: 20+（init/config/route/controller/service/client/crud/webhook/job/middleware/schema/component/hook/provider/adapter/plugin/worker/listener/migration/seed）
  - スタイル: 5（basic/typed/advanced/secure/testing）
  - 言語: 6（ts/js/py/go/rs/kt）
  - ID 体系: `gen-*` と `strike-*` の両系統
- 合計（理論値）
  - 約 219,240 の仮想スパイク（実際の列挙は必要分のみ、オンデマンド）
- 実装箇所
  - コア: `src/core/spike-generators.ts`（ID 列挙、メタ/本文合成、Next.js/FastAPI などの一部特化ロジック）
  - カタログ: `src/core/spike-catalog.ts`（物理ファイルと仮想の統合、キャッシュ）
  - ハンドラ: `src/core/spike-handlers.ts`（discover/auto/preview/apply/validate/explain）

### 使い方（Claude Code から）

- 自然言語から自動選定
  - `/fl:implement "Kafka ワーカー（TypeScript、セキュア、テスト付き）を追加"`
  - `/fl:spike auto "Next.js の typed middleware を追加"`
- 候補探索
  - `/fl:spike discover "strike next middleware typed ts"`
- ショートエイリアス（推奨）
  - `/fl:implement "[alias: next-mw-ts]"`
  - `/fl:implement "[alias: prisma-schema-ts]" model=User`
  - 詳細は `docs/ja/short-aliases.md`（日本語） / `docs/short-aliases.md`（英語）

### パフォーマンス/出力件数の調整（環境変数）

- `FLUORITE_SPIKE_LIST_LIMIT`
  - 一覧に出す最大件数の上限。大量列挙を避けるため小さめに（例: 80〜200）
- `FLUORITE_SPIKE_METADATA_MULTIPLIER`（既定 2）
  - discover 時にメタデータを余分に読み込んでスコアリングする倍率。1〜5 の範囲で調整
- `FLUORITE_AUTO_SPIKE_BATCH`（既定 50）
  - `auto-spike` のメタ読み込みバッチサイズ。メモリと速度のトレードオフ
- `FLUORITE_AUTO_SPIKE_TOP`（既定 5）
  - 詳細スコアリングに回す候補数
- `FLUORITE_AUTO_SPIKE_THRESHOLD`（既定 0.4）
  - カバレッジ閾値。下回ると discover と確認質問を提案
- `FLUORITE_ALIAS_ENABLE`（既定 true）/ `FLUORITE_ALIAS_BOOST`（既定 2.0）
  - ショートエイリアスの利用可否と優先度
- `FLUORITE_GENERATED_SPIKES_LIMIT`
  - 合成スパイクの内部上限（テスト/検証目的で一時的に制限する場合）

### ベストプラクティス

- まずは `discover-spikes` で 20〜50 件程度に絞り、`preview-spike` で差分/追加ファイルを確認
- `apply-spike` は three_way_merge を前提（サーバーは diff を返すのみ。適用はクライアント側）
- 物理テンプレート（`src/spikes/*.json`）は「よく使う/こだわりたい」ものに限定し、その他は仮想で十分
- 反復（イテレーション）時は alias を活用し、パラメータ（`params`）で微調整

### 既存の物理テンプレートと併用

レポジトリには 10K+ の物理スパイクファイルも含まれます（`src/spikes/`）。仮想と物理は同一 API（`preview-spike`/`apply-spike` など）で扱え、ID 衝突時は物理が優先されます。

### よくある質問

Q. 10万件超のテンプレートをすべて列挙しますか？
- いいえ。`list` 系は上限（`FLUORITE_SPIKE_LIST_LIMIT`）を適用し、`discover`/`auto` は必要分のみメタ読み込み→スコアリング→上位のみ詳細読み込みの二段階設計です。

Q. どうやって目的のテンプレートに素早く辿り着けますか？
- ショートエイリアス（`[alias: ...]`）の利用を推奨します。`docs/ja/short-aliases.md`（日本語）/ `docs/short-aliases.md`（英語）に代表例を掲載しています。

Q. 個別フレームワーク向けの「凝った」テンプレートは作れますか？
- はい。物理ファイルとして `src/spikes/strike-<lib>-<pattern>-<style>-<lang>.json` を追加すれば、合成よりもリッチな構成/差分を返せます。

—

本ガイドは Strike 開発向けの大規模テンプレート運用にフォーカスしています。追加のレシピや運用例は `docs/recipes.md` や `docs/spike-templates.md` も参照してください。
