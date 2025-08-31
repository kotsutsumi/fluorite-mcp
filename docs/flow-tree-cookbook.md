---
title: Flow + Tree Cookbook
---

# Flow + Tree Cookbook

実践的なレシピ集です。Flow と Tree のブリッジ、保存/ロード、差分適用、リアルタイム同期の導入順を示します。

## 1) Tree → Flow の展開
```ts
import { toFlow } from '@/src/treeview/toFlow'
const { nodes, edges } = toFlow(tree)
```

## 2) Flow → Tree への反映
```ts
import { fromFlow } from '@/src/treeview/fromFlow'
const updated = fromFlow(nodes, edges)
```

## 3) API 保存/ロード
```ts
import { saveTree, loadTree } from '@/src/treeview/api'
await saveTree(updated)
const loaded = await loadTree()
```

## 4) GraphQL 経由の保存/取得
```ts
import { saveTreeGraphQL, loadTreeGraphQL } from '@/src/treeview/graphql'
await saveTreeGraphQL('/graphql', updated)
const gql = await loadTreeGraphQL('/graphql')
```

## 5) PATCH API（差分適用）
```ts
import { applyPatch } from '@/src/treeview/patch'
const next = applyPatch(loaded, { op: 'add', id: 'x1', parentId: 'root', label: 'New' })
```

## 6) Realtime（socket.io 概念）
```ts
import { connectRealtime } from '@/src/treeview/realtime'
const rt = connectRealtime()
rt.emitChange({ type: 'update', id: 'a' })
rt.onChange((ev)=> console.log('change', ev))
```
### Ably の概念クライアント
```ts
import { connectAbly } from '@/src/treeview/realtime-ably'
const ably = connectAbly()
ably.publish('tree', 'update', { id: 'a' })
ably.subscribe('tree', (msg)=> console.log(msg))
```

## 7) Next.js / Express / FastAPI ルート
- Next.js: `app/api/tree/route.ts`
- Express: `src/treeview/route.ts`
- FastAPI: `src/treeview/fastapi_tree.py`

## Tips
- VirtualizedTree/DnDTree はプレースホルダです。実運用時は `react-window` / `@dnd-kit/core` を導入してください。
- a11y チェックには `axe-core` / `jest-axe` などの導入を検討してください。
