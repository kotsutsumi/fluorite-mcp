# /fl:ui コマンド - 自然言語UI生成

`/fl:ui` コマンドは、TailwindCSS v4.1+ と shadcn/ui v2+ を統合したv0.io スタイルの自然言語UIコンポーネント生成を可能にします。

## 概要

自然言語での説明を使用してモダンなUIコンポーネントを生成します。コマンドがあなたの説明を分析し、適切なコンポーネントタイプを決定し、TypeScript、TailwindCSS、shadcn/ui を使用したプロダクションレディなReact/Next.jsコンポーネントを生成します。

## 使用方法

```bash
fluorite-mcp ui "<自然言語での説明>" [オプション]
```

### 例

```bash
# ログインフォームを生成
fluorite-mcp ui "メール、パスワード、ソーシャル認証ボタン付きのモダンなログインフォームを作成"

# データテーブルを生成
fluorite-mcp ui "ソート、フィルタリング、ページネーション機能付きの高度なデータテーブルを構築"

# 特定のフレームワークで生成
fluorite-mcp ui "レスポンシブなモーダルダイアログを作成" --framework next --style glass

# プレビューモード（ファイル書き込みなし）
fluorite-mcp ui "カードとチャート付きのダッシュボードを作成" --preview

# カスタムコンポーネント名
fluorite-mcp ui "ボタンを作成" --component-name ActionButton

# 異なるスタイリング
fluorite-mcp ui "カードコンポーネントを構築" --style minimal --dark
```

## オプション

| オプション | 説明 | デフォルト |
|--------|-----|---------|
| `-f, --framework <framework>` | 対象フレームワーク: `react`, `next`, `vue` | `react` |
| `-s, --style <style>` | デザインスタイル: `modern`, `minimal`, `glass`, `card` | `modern` |
| `-o, --output <path>` | コンポーネントの出力ディレクトリ | `./components` |
| `--dark` | ダークモードサポートを含める | `false` |
| `--responsive` | レスポンシブデザインを保証 | `true` |
| `--a11y` | アクセシビリティ機能を含める | `true` |
| `--preview` | ファイル書き込み前にコードをプレビュー | `false` |
| `--component-name <name>` | カスタムコンポーネント名 | 自動検出 |
| `--tailwind-version <version>` | TailwindCSSバージョン | `latest` |
| `--shadcn-version <version>` | shadcn/uiバージョン | `latest` |

## 自然言語処理

コマンドは説明を分析して以下を決定します：

### コンポーネントタイプ
- **フォーム**: ログイン、サインアップ、コンタクトフォーム
- **テーブル**: ソート/フィルタリング付きデータテーブル
- **モーダル**: ダイアログ、ポップアップ
- **ナビゲーション**: メニュー、ナビゲーションバー
- **カード**: コンテンツカード、メトリクスカード
- **ボタン**: 各種ボタンタイプ
- **ダッシュボード**: 分析ダッシュボード
- **カスタム**: その他のコンポーネントタイプ

### 複雑度検出
- **シンプル**: 基本コンポーネント（< 3機能）
- **中程度**: 標準コンポーネント（3-5機能）
- **複雑**: 高度なコンポーネント（> 5機能、アニメーションなど）

### 機能検出
自動的に検出し、含める機能：
- レスポンシブデザイン
- ダークモードサポート
- アニメーションとトランジション
- フォームバリデーション
- アクセシビリティ機能
- ソーシャル認証
- ソートとフィルタリング
- ページネーション

## 生成されるコンポーネント

### 含まれるもの

✅ **モダンなTypeScriptコンポーネント**
- 完全なTypeScript型定義
- 適切なReactコンポーネントパターン
- エクスポート/インポート対応

✅ **TailwindCSS v4.1+ スタイリング**
- モダンなCSSカスタムプロパティ
- レスポンシブデザインクラス
- ダークモードサポート
- ユーティリティファーストアプローチ

✅ **shadcn/ui v2+ 統合**
- 最新のコンポーネントプリミティブ
- 一貫したデザインシステム
- アクセシビリティ内蔵
- テーマサポート

✅ **ベストプラクティス**
- WCAG 2.1 AA アクセシビリティ
- セマンティックHTML構造
- パフォーマンス最適化
- モバイルファーストレスポンシブ

### ファイル構造

```
components/
├── ComponentName.tsx     # メインコンポーネントファイル
├── index.ts             # エクスポートファイル（必要な場合）
└── types.ts            # 型定義（複雑な場合）
```

## コンポーネント統計

生成される各コンポーネントには以下が含まれます：
- **コード行数**: 合計コンポーネントサイズ
- **依存関係**: 必要なインポートとパッケージ
- **アクセシビリティスコア**: WCAG準拠パーセンテージ
- **フレームワーク互換性**: React/Next.js/Vueサポート
- **パフォーマンス指標**: バンドルサイズ推定

## 統合ガイド

### 前提条件

```bash
# 必要な依存関係をインストール
npm install @shadcn/ui @tailwindcss/forms
npm install clsx tailwind-merge
npm install lucide-react  # アイコン用
```

### TailwindCSS設定

`tailwind.config.js` に以下が含まれていることを確認：

```js
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // カスタムテーマ拡張を追加
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // 必要に応じて他のプラグインを追加
  ],
}
```

### ユーティリティ関数

`lib/utils.ts` を作成：

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 高度な使用方法

### カスタムスタイリング

```bash
# グラスモーフィズムデザイン
fluorite-mcp ui "料金カードを作成" --style glass

# ミニマルデザイン
fluorite-mcp ui "シンプルなボタンを構築" --style minimal

# カードベースレイアウト
fluorite-mcp ui "ユーザープロフィールを作成" --style card
```

### フレームワーク固有機能

```bash
# App Router付きNext.js
fluorite-mcp ui "サーバーコンポーネントテーブルを作成" --framework next

# Composition API付きVue 3
fluorite-mcp ui "リアクティブフォームを構築" --framework vue
```

### ダークモードサポート

```bash
# ダークモードバリアントを含める
fluorite-mcp ui "ナビゲーションメニューを作成" --dark
```

## トラブルシューティング

### よくある問題

1. **依存関係の不足**
   ```bash
   npm install @shadcn/ui @tailwindcss/forms clsx tailwind-merge
   ```

2. **TailwindCSSが動作しない**
   - `tailwind.config.js` のコンテンツパスを確認
   - TailwindCSSがCSSでインポートされているか確認

3. **TypeScriptエラー**
   - `@/lib/utils` パスが `tsconfig.json` で設定されているか確認
   - 不足している型定義をインストール

4. **コンポーネントがレンダリングされない**
   - ランタイムエラーをコンソールで確認
   - すべてのインポートが利用可能か確認
   - コンポーネントが適切にエクスポートされているか確認

### デバッグモード

```bash
# ファイル作成なしでテストするためのプレビューモードを使用
fluorite-mcp ui "あなたの説明" --preview
```

## パフォーマンスの考慮事項

- 生成されるコンポーネントはツリーシェイキング用に最適化
- 必要な依存関係のみがインポート
- CSSクラスは最小で効率的
- TypeScriptはコンパイル時最適化を提供
- コンポーネントは再レンダリングのためのReactベストプラクティスに従う

## 今後の機能拡張

`/fl:ui` コマンドは以下で機能強化される予定：
- [ ] スパイクテンプレート統合（現在パフォーマンス向上のため無効）
- [ ] 高度な生成のためのMCP Magic統合
- [ ] アニメーションとマイクロインタラクションサポート
- [ ] 高度なコンポーネント合成
- [ ] リアルタイムプレビューサーバー
- [ ] カスタムデザインシステム統合
- [ ] マルチファイルコンポーネント生成
- [ ] Storybook統合

## 関連項目

- [スパイクテンプレート](./spike-templates.md)
- [MCP統合](./mcp-integration.md)
- [TailwindCSS v4.1+ 機能](./tailwindcss.md)
- [shadcn/ui v2+ コンポーネント](./shadcn-ui.md)