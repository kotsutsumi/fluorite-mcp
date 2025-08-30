# Spike Template Schema & Naming

このドキュメントは Fluorite MCP における Spike テンプレートのスキーマと命名規約をまとめたものです。生成テンプレート（`gen-*` と `strike-*`）はランタイムに合成され、必要に応じて物理ファイルにマテリアライズできます。

## 命名規約

- 形式: `strike-<lib>-<pattern>-<style>-<lang>` または `gen-<lib>-<pattern>-<style>-<lang>`
- 例:
  - `strike-nextjs-route-typed-ts`
  - `gen-fastapi-service-secure-py`

要素の意味:
- `<lib>`: ライブラリ/フレームワーク（例: `nextjs`, `fastapi`, `bun-elysia`, `prisma` 等）
- `<pattern>`: 用途や構造（例: `route`, `service`, `client`, `schema`, `hook`, `plugin` 等）
- `<style>`: 実装スタイル（`basic`, `typed`, `advanced`, `secure`, `testing`）
- `<lang>`: 言語（`ts`, `js`, `py`, `go`, `rs`, `kt`）

現在の組合せからは 243,000 件以上（`strike`/`gen` の2倍）を生成可能です。

## SpikeSpec スキーマ（要約）

必須/主要フィールド:
- `id`: 一意ID（命名規約に準拠）
- `name`: 表示名
- `version`: スキーマ/テンプレートのバージョン（例: `0.1.0`）
- `stack`: 主要スタック（例: `["nextjs", "ts"]`）
- `tags`: タグ（`pattern`, `style`, `generated`, Strike の場合は `strike` を含む）
- `description`: 概要
- `params`: パラメータ配列（`name`, `required`, `description`, `default`）
- `files`: 生成ファイルテンプレート配列（`path`, `content` or `template`）
- `patches`: 適用する差分（統一 diff 文字列）

注記:
- 生成テンプレートは `src/core/spike-generators.ts` のロジックにより、ライブラリ×パターン×スタイル×言語の組合せで自動合成されます。
- `strike-*` ID には自動的に `strike` タグが付与されます。

## スケールとメモリ制御

巨大なテンプレート空間の探索を安全に行うため、以下の環境変数で上限を制御できます。

- `FLUORITE_GENERATED_SPIKES_LIMIT`: 生成IDの上限（一覧作成時に有効）
- `FLUORITE_SPIKE_LIST_LIMIT`: `listSpikeIds` の返却上限（MCPのdiscover等にも有効）
- `FLUORITE_AUTO_SPIKE_BATCH`: auto-spike のバッチ評価サイズ
- `FLUORITE_AUTO_SPIKE_TOP`: auto-spike の候補上位件数

## マテリアライズ（物理ファイル化）

生成テンプレートを `src/spikes` に JSON として保存したい場合は、付属のスクリプトを利用します。

```
npm run materialize:spikes -- --limit 200
npm run materialize:spikes -- --libs nextjs,fastapi --patterns route,service --styles typed,secure --langs ts,py --limit 500 --prefix strike
```

既存ファイルは上書きしません。数百〜数千件ずつ、段階的に実行するのが推奨です。

