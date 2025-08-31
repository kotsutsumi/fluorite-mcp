---
title: Flow + Tree Quick Start
---

# Flow + Tree Quick Start

依存の導入（任意の組み合わせ）:

```
# ReactFlow
npm i reactflow

# Virtualized
npm i react-window

# Drag & Drop
npm i @dnd-kit/core @dnd-kit/sortable

# GraphQL（どちらか一方）
npm i graphql @apollo/server
# or
npm i @graphql-yoga/node

# Realtime（どちらか一方）
npm i socket.io-client
# or
npm i ably
```

生成＆物理化（新規IDで衝突回避）:

```
# パック一括（推奨）
npx tsx src/cli/index.ts spikes synth-bulk \
  --pack flow-tree-starter \
  --generated-only \
  --prefix gen2- \
  --total 3000 \
  --batch 300 \
  --pretty

# ピンポイント（新パターンのみ）
npx tsx scripts/materialize-spikes.ts \
  --prefix gen2 \
  --libs reactflow,shadcn-tree-view \
  --patterns realtime,graphql-server,graphql-client,dnd,virtualize \
  --styles typed,advanced,testing \
  --langs ts,js,py \
  --limit 2000
```

実行のヒント:
- 生成物は `src/spikes/*.json` に出力されます。`gen-` や `gen2-` を使って衝突を避けられます。
- Virtualized/DnD はプレースホルダ構成です。依存導入後に差し替えてください。

