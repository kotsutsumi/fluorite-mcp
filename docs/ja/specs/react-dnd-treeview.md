# React DnD TreeView

高機能なドラッグ&ドロップ対応のReactツリービューコンポーネント

- **NPM**: `@minoru/react-dnd-treeview`  
- **Repository**: <https://github.com/minop1205/react-dnd-treeview>
- **Version**: ^3.4.4
- **License**: MIT

## 概要

React DnD TreeViewは、組み込みのドラッグ&ドロップ機能を備えた高度にカスタマイズ可能なツリーコンポーネントを提供します。react-dndライブラリを活用して堅牢なドラッグ操作を実現し、MultiBackendアダプターを通じてマウスとタッチデバイスの両方をサポートしています。

## 主要機能

- 🎯 **階層的なドラッグ&ドロップ** - 自動的なツリー構造の再編成
- 📱 **クロスデバイス対応** - MultiBackend経由でマウス、タッチ、スタイラスに対応
- 🎨 **完全にカスタマイズ可能** - レンダープロップによるノードレンダリング
- ♿ **アクセシビリティ優先** - キーボードナビゲーションとARIA属性
- ⚡ **高パフォーマンス** - 大規模データセット用の仮想スクロールサポート
- 📦 **TypeScript サポート** - 包括的な型定義
- 🔧 **柔軟なAPI** - 制御/非制御パターンをサポート

## インストール

```bash
# npm
npm install react-dnd @minoru/react-dnd-treeview

# yarn
yarn add react-dnd @minoru/react-dnd-treeview

# pnpm
pnpm add react-dnd @minoru/react-dnd-treeview
```

### 必要要件
- React 16.8+ (フックサポートが必要)
- ドラッグ&ドロップ機能用のreact-dnd

## データモデル

### ノード構造

```typescript
interface NodeModel<T = any> {
  id: number | string;        // 一意の識別子 (必須)
  parent: number | string;     // 親ノードID、ルートの場合は0 (必須)
  text: string;               // 表示テキスト (必須)
  droppable?: boolean;        // ドロップを受け入れ可能か (デフォルト: false)
  data?: T;                   // カスタムデータの添付
}
```

## コアAPI

### メインコンポーネントのプロパティ

#### 必須プロパティ

| プロパティ | 型 | 説明 |
|------|------|-------------|
| `tree` | `NodeModel<T>[]` | 階層構造を持つツリーノードの配列 |
| `rootId` | `number \| string` | ルートノードのID (通常は0) |
| `render` | `(node, params) => ReactNode` | ノードレンダリング関数 |
| `onDrop` | `(tree, options) => void` | ドロップ操作のコールバック |

#### オプションプロパティ

| プロパティ | 型 | デフォルト | 説明 |
|------|------|---------|-------------|
| `initialOpen` | `boolean \| (number\|string)[]` | `false` | 初期展開されるノード |
| `canDrag` | `(node) => boolean` | - | ノード毎のドラッグ可否制御 |
| `canDrop` | `(tree, options) => boolean` | - | ドロップターゲットの制御 |
| `sort` | `(a, b) => number` | - | カスタム兄弟ソート |
| `dragPreviewRender` | `(monitor) => ReactNode` | - | カスタムドラッグプレビュー |
| `classes` | `object \| function` | - | スタイリング用CSSクラス |
| `onChangeOpen` | `(nodeIds) => void` | - | 展開状態変更コールバック |

### レンダーパラメータ

レンダー関数は以下のパラメータを受け取ります：

```typescript
interface RenderParams {
  depth: number;         // ネストレベル
  isOpen: boolean;       // 展開状態
  isDropTarget: boolean; // 現在のドロップターゲット
  isDragging: boolean;   // ドラッグ中
  onToggle: () => void; // 展開の切り替え
}
```

## 使用例

### 基本的な実装

```tsx
import { useState } from "react";
import { Tree, MultiBackend, getBackendOptions } from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";

const initialData = [
  { id: 1, parent: 0, droppable: true, text: "Folder 1" },
  { id: 2, parent: 1, text: "File 1-1" },
  { id: 3, parent: 0, droppable: true, text: "Folder 2" },
  { id: 4, parent: 3, text: "File 2-1" }
];

export default function FileTree() {
  const [treeData, setTreeData] = useState(initialData);
  
  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={treeData}
        rootId={0}
        onDrop={setTreeData}
        render={(node, { depth, isOpen, onToggle }) => (
          <div style={{ paddingLeft: depth * 20 }}>
            {node.droppable && (
              <span onClick={onToggle}>{isOpen ? "📂" : "📁"}</span>
            )}
            <span>{node.text}</span>
          </div>
        )}
      />
    </DndProvider>
  );
}
```

### 高度なTypeScriptの例

```tsx
interface FileData {
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
}

type FileNode = NodeModel<FileData>;

const FileExplorer: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>(initialFiles);
  
  const handleDrop = useCallback(
    (newTree: FileNode[], options: DropOptions<FileData>) => {
      // Validate folder-only drops
      const target = newTree.find(n => n.id === options.dropTargetId);
      if (target?.data?.type === 'folder') {
        setTree(newTree);
      }
    },
    []
  );
  
  const renderNode = useCallback(
    (node: FileNode, params: RenderParams) => (
      <FileItem 
        node={node} 
        {...params}
        icon={node.data?.type === 'folder' ? '📁' : '📄'}
      />
    ),
    []
  );
  
  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree<FileData>
        tree={tree}
        rootId={0}
        render={renderNode}
        onDrop={handleDrop}
        canDrop={(_, opts) => {
          const target = tree.find(n => n.id === opts.dropTargetId);
          return target?.data?.type === 'folder' || false;
        }}
        sort={(a, b) => {
          // Folders first, then alphabetical
          if (a.droppable !== b.droppable) {
            return a.droppable ? -1 : 1;
          }
          return a.text.localeCompare(b.text);
        }}
      />
    </DndProvider>
  );
};
```

## パフォーマンスの最適化

### ベストプラクティス

1. **レンダー関数のメモ化** - 不要な再レンダリングを防ぐ
2. **仮想スクロールの実装** - 1000以上のノードを持つツリー用
3. **本番ビルドの使用** - react-dndの最適なパフォーマンスのため
4. **状態更新のデバウンス** - 展開状態を永続化する際

### パフォーマンスベンチマーク

- 仮想スクロールで **10,000以上のノード** を処理
- **100ms未満** のドラッグレスポンス時間
- ドラッグ操作中の **60fps** アニメーション
- **約45KB** の圧縮後バンドルサイズ

## アクセシビリティ

コンポーネントには包括的なアクセシビリティ機能が含まれています：

- ✅ ツリー構造のためのARIA属性
- ✅ キーボードナビゲーション（矢印キー、Enter、Space）
- ✅ スクリーンリーダーアナウンス
- ✅ インタラクション中のフォーカス管理

## ブラウザ互換性

| ブラウザ | 最小バージョン |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## よくある問題と解決策

### タッチデバイスのドラッグプレビュー
**問題**: モバイルデバイスでドラッグプレビューが表示されない  
**解決策**: `dragPreviewRender` プロパティにカスタムプレビューコンポーネントを実装する

### 大規模データセットのパフォーマンス
**問題**: 数千のノードで動作が遅い  
**解決策**: 仮想スクロールまたはページネーション戦略を実装する

### TypeScriptジェネリック型
**問題**: カスタムデータ型でTypeScriptエラーが発生  
**解決策**: ジェネリック型パラメータを使用： `Tree<YourDataType>`

## 関連パッケージ

- **react-dnd**: コアドラッグ&ドロップライブラリ（必須依存関係）
- **react-sortable-tree**: 組み込み機能を持つ代替案
- **rc-tree**: Ant Designツリーコンポーネント
- **react-arborist**: 仮想化を備えたファイルツリー

## リソース

- [ドキュメント](https://github.com/minop1205/react-dnd-treeview/blob/main/README.md)
- [ライブデモ](https://minop1205.github.io/react-dnd-treeview/)
- [APIリファレンス](https://github.com/minop1205/react-dnd-treeview/blob/main/docs/api.md)
- [サンプル](https://github.com/minop1205/react-dnd-treeview/tree/main/examples)
- [変更履歴](https://github.com/minop1205/react-dnd-treeview/blob/main/CHANGELOG.md)

## パッケージ統計

- **週間ダウンロード数**: 約5,000
- **GitHubスター数**: 400+
- **最終公開日**: 2024年3月
- **バンドルサイズ**: 圧縮後約45KB
- **ライセンス**: MIT