# スパイク開発エコシステム

`spec://spike-development-ecosystem`

## 📋 概要

アジャイル開発における**スパイク（Spike Solution）**開発をサポートする包括的エコシステムです。本体から独立した環境で特定機能の検証・試作を行い、成功したものを本体に統合する開発手法を効率化します。

## 🎯 スパイク開発とは

### 定義
スパイク（Spike Solution）は、技術的な不確実性を解消するための**時間制限付き実験**です。
- **期間**: 通常1-3日のタイムボックス
- **目的**: 学習と検証（本番品質のコードではない）
- **成果**: 技術的実現可能性の判断材料

### いつスパイクを使うべきか

**技術的不確実性がある場合**:
- 新しいライブラリやフレームワークの評価
- 複雑なアルゴリズムの実装可能性
- パフォーマンス要件の達成可能性

**ユーザー体験の検証**:
- 新しいUIパターンの実験
- インタラクションの実現可能性
- ユーザビリティの検証

## 🚀 スパイク開発サイクル

### 1. 計画フェーズ
```yaml
目的: 不確実性の特定と成功基準の定義
活動:
  - 検証したい技術や機能の明確化
  - タイムボックスの設定（最大3日）
  - 成功/失敗の判断基準設定
  - 最小限の要件定義
```

### 2. 環境構築フェーズ
```bash
# 30秒でスパイクプロジェクト開始
npm create vite@latest spike-dragdrop -- --template react-ts
cd spike-dragdrop
npm install
npm run dev
```

### 3. 実装フェーズ
```typescript
// スパイクでは完璧を求めない - 動作確認優先
function DragDropTreeSpike() {
  // ハードコーディングも許容
  const mockData = [
    { id: 1, name: "Node 1", children: [] },
    { id: 2, name: "Node 2", children: [] }
  ];
  
  // TODO: 本番では設定可能にする
  const MAX_DEPTH = 3;
  
  // FIXME: エラーハンドリングは後で
  const handleDrop = (source, target) => {
    console.log('Dropped!', source, target);
    // 最小限の実装で動作を確認
  };
  
  return <TreeView data={mockData} onDrop={handleDrop} />;
}
```

### 4. 検証フェーズ
```typescript
// Playwrightで基本動作を確認
test('ドラッグ&ドロップが機能する', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const node1 = page.locator('[data-node="1"]');
  const node2 = page.locator('[data-node="2"]');
  
  await node1.dragTo(node2);
  
  // 位置が入れ替わったことを確認
  await expect(node2).toBeAbove(node1);
});
```

### 5. 判断フェーズ
**成功の場合** → 本体への統合準備
**失敗の場合** → 学習内容の文書化と代替案検討
**追加調査が必要** → 新しいスパイクの計画

### 6. 統合フェーズ
```javascript
// Plopで本体への統合を自動化
module.exports = function (plop) {
  plop.setGenerator('integrate-spike', {
    description: 'スパイクを本体に統合',
    prompts: [{
      type: 'input',
      name: 'spikePath',
      message: 'スパイクのパス'
    }],
    actions: [{
      type: 'add',
      path: 'src/components/{{pascalCase name}}/index.tsx',
      templateFile: 'spike-template.hbs'
    }]
  });
};
```

## 💡 実践例: ドラッグ&ドロップツリーのスパイク

### Step 1: プロジェクト作成
```bash
# Viteで即座に開始
npm create vite@latest spike-dnd-tree -- --template react-ts
cd spike-dnd-tree
npm install react-dnd react-dnd-html5-backend
npm run dev
```

### Step 2: 最小実装
```typescript
// src/components/TreeNode.tsx
import { useDrag, useDrop } from 'react-dnd';

export function TreeNode({ node, onMove }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'NODE',
    item: { id: node.id }
  });
  
  const [{ isOver }, drop] = useDrop({
    accept: 'NODE',
    drop: (item) => onMove(item.id, node.id)
  });
  
  return (
    <div 
      ref={(el) => { drag(el); drop(el); }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {node.name}
    </div>
  );
}
```

### Step 3: Storybookで独立検証
```typescript
// TreeNode.stories.tsx
export default {
  title: 'Spike/DragDropTree',
  component: TreeNode
};

export const Default = {
  args: {
    node: { id: 1, name: 'Test Node' }
  }
};

export const Dragging = {
  play: async ({ canvasElement }) => {
    // ドラッグ中の状態をシミュレート
  }
};
```

### Step 4: MSWでAPIモック
```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/api/tree/move', (req, res, ctx) => {
    // バックエンドなしで動作確認
    return res(ctx.json({ success: true }));
  })
];
```

### Step 5: 本体への統合
```typescript
// 成功したスパイクを本体用にリファクタリング
export interface TreeNodeProps {
  node: TreeNodeData;
  onMove?: (sourceId: string, targetId: string) => void;
  depth?: number;
  maxDepth?: number;
  className?: string;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  onMove,
  depth = 0,
  maxDepth = Infinity,
  className
}) => {
  // プロダクション品質のコード
  // エラーハンドリング、アクセシビリティ、パフォーマンス最適化を追加
};
```

## 🛠️ 推奨ツールセット

### 高速プロトタイピング
- **Vite**: 即座にプロジェクト開始、HMR対応
- **StackBlitz**: ブラウザ内完結、URL共有可能
- **CodeSandbox**: オンラインコラボレーション

### UI開発
- **Storybook**: コンポーネントの独立開発
- **React DnD**: ドラッグ&ドロップ実装
- **Framer Motion**: アニメーション付きインタラクション

### 状態管理
- **Zustand**: 最小設定で即使用可能
- **Jotai**: アトミックな状態管理

### モック・テストデータ
- **MSW**: APIモッキング
- **Faker.js**: リアルなテストデータ生成

### 統合ツール
- **Plop**: スパイクから本体への移行自動化
- **Hygen**: テンプレートベースのコード生成

## 📊 並行スパイク戦略

複数のアプローチを同時に検証する場合:

```bash
# Git Worktreeで並行実験
git worktree add ../spike-approach-1 spike/approach1
git worktree add ../spike-approach-2 spike/approach2

# 各環境で異なる実装を試す
cd ../spike-approach-1
npm create vite@latest . -- --template react-ts
# React DnDで実装

cd ../spike-approach-2  
npm create vite@latest . -- --template vue-ts
# Vue Draggableで実装
```

## ✅ ベストプラクティス

### タイムマネジメント
- ✅ タイムボックスを厳守（最大3日）
- ✅ 毎日の進捗確認
- ✅ 延長が必要なら別スパイクとして計画

### コード品質
- ✅ 動作確認を最優先
- ✅ ハードコーディング許容
- ✅ TODO/FIXMEコメントで意図を明確に
- ❌ 過度なリファクタリング
- ❌ 本番品質の追求

### ドキュメント
- ✅ 学んだことを必ず記録
- ✅ 失敗も貴重な情報として残す
- ✅ スクリーンショット/動画の活用
- ✅ 判断の根拠を明記

## ⚠️ アンチパターン

### 過度な作り込み
```typescript
// ❌ スパイクでやりすぎの例
class TreeNodeComponent extends React.Component {
  // 100行以上の完璧な実装
  // 全エッジケース対応
  // 完全なテストカバレッジ
}

// ✅ スパイクの適切な実装
function TreeNodeSpike({ node }) {
  // 20行程度の最小実装
  // 基本ケースのみ対応
  // 動作確認用の簡易テスト
}
```

### ドキュメント不足
```markdown
# ❌ 不十分な記録
"DnD実装した"

# ✅ 適切な記録
## ドラッグ&ドロップ スパイク結果
- **実装ライブラリ**: React DnD
- **実装時間**: 4時間
- **パフォーマンス**: 100ノードで問題なし
- **課題**: ネストが深い場合のUX改善が必要
- **判断**: 採用可能、本実装では仮想スクロール検討
```

## 🎯 成功指標

### 技術的検証
- [ ] 機能が動作するか
- [ ] パフォーマンス要件を満たすか
- [ ] スケール可能か
- [ ] セキュリティ要件を満たすか

### 実現可能性評価  
- [ ] 実装にかかる時間の見積もり
- [ ] 必要なスキルセットの特定
- [ ] 依存関係の複雑さの把握
- [ ] メンテナンスコストの推定

### ユーザー価値
- [ ] UXの向上度
- [ ] ビジネス価値の評価
- [ ] 差別化要因の確認
- [ ] ROIの試算

## 🔮 AI/LLM活用の未来

### AIアシストスパイク
```typescript
// LLMにスパイクコードを生成させる
const prompt = `
React DnDを使ってツリー構造のドラッグ&ドロップを実装。
最小限の動作確認コードを生成してください。
`;

// 複数パターンを自動生成して比較
const approaches = await generateMultipleApproaches(prompt);
const bestApproach = await evaluateApproaches(approaches);
```

### 自動評価
- パフォーマンステストの自動実行
- コード品質の自動スコアリング
- セキュリティスキャンの自動化
- アクセシビリティチェックの自動化

## 📚 学習リソース

### 記事
- [Agile Spikes Explained](https://en.wikipedia.org/wiki/Spike_(software_development)) - スパイクの概念
- [Spike Solutions in Scrum](https://www.scrum.org/resources/what-is-a-spike) - Scrumでの活用

### 書籍
- **Extreme Programming Explained** (Kent Beck) - スパイクの起源
- **The Lean Startup** (Eric Ries) - 実験的アプローチ

---

スパイク開発エコシステムにより、リスクを最小化しながら新機能の検証を効率的に行い、確実な実装判断を下すことができます。