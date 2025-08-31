---
title: Flow + Tree Starter
---

# Flow + Tree Starter

ReactFlow と Shadcn TreeView を組み合わせた UI/サーバ/スキーマ/ブリッジのスターターセットです。

## 含まれる要素
- ReactFlow: `Flow.tsx`, `FlowAdvanced.tsx`, `CustomNode.tsx` ほか
- TreeView: `TreeView.tsx`, `TreeViewAdvanced.tsx`, `VirtualizedTree.tsx`, `DnDTree.tsx`
- サーバ連携: Next.js App Router（`app/api/(flow|tree)/route.ts`）、Express ルート、FastAPI ルータ
- スキーマ/パッチ: Zod（TS）/ Pydantic（Py）、PATCH API スタブ
- ブリッジ: Tree ⇄ ReactFlow（`toFlow.ts`, `fromFlow.ts`）
- テスト雛形: `*.test.ts(x)` / `*.rtl.test.ts(x)` / a11y プレースホルダ

## セットアップ
1. ReactFlow（必須）
   - `npm i reactflow`
   - `import 'reactflow/dist/style.css'`
2. shadcn/ui（任意）
   - `TreeView*.tsx` は Tailwind + shadcn 風のクラスを想定
3. サーバ/API
   - Next.js なら `app/api/(flow|tree)/route.ts`
   - Express なら `createFlowRoute()` / `createTreeRoute()` をマウント
   - FastAPI なら `fastapi_flow.py` / `fastapi_tree.py` を `APIRouter` に含める

## 典型ワークフロー
1. Tree を編集（検索/チェック/右クリックメニュー）
2. `toFlow(tree)` で ReactFlow の `nodes/edges` に展開
3. Flow 上で編集 → `fromFlow(nodes, edges)` で Tree に反映
4. API に `saveTree()` / `loadTree()` / PATCH を送受信

## テスト
- コンポーネント: `*.test.tsx`（最小）、`*.rtl.test.tsx`（RTL向けプレースホルダ）
- a11y: `a11y.test.ts` に axe/jest-axe を導入して検証

## 物理化の例
```bash
npx tsx scripts/materialize-spikes.ts \
  --prefix strike \
  --libs reactflow,shadcn-tree-view \
  --patterns component,route,schema,adapter,example,docs \
  --styles typed,advanced,testing \
  --langs ts,js,py \
  --limit 2000
```

## 注意
- Virtualized/DnD はプレースホルダ実装です。実導入時は `react-window` や `@dnd-kit/core` のセットアップを行ってください。
- PATCH API/ブリッジは最小スタブです。要件に応じて差分適用や座標→階層マッピングの精度を調整してください。

