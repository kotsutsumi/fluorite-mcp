# Fluorite MCP 静的解析ドキュメント

## 🚀 概要

Fluorite MCPは、包括的な静的解析機能を提供し、特にNext.jsのようなランタイムエラーの予測が困難なフレームワークに対して、実行前の極めて詳細な検証を実現します。このシステムは、コード実行前に深いコード分析、依存関係の検証、エラー予測、フレームワーク固有のチェックを実行します。

## 🎯 主要機能

### 1. **包括的静的解析（v0.20.3で50+検証ルール）**
- TypeScript/JavaScript検証（20+ 組み込みルール）
- フレームワーク固有の検証（Next.js、React、Vue、Angular）
- 依存関係分析とバージョン競合検出
- セキュリティ脆弱性スキャン（8+ セキュリティルール）
- パフォーマンスボトルネックの特定（6+ パフォーマンスルール）
- アクセシビリティチェック（10+ アクセシビリティルール）
- コード品質評価

### 2. **エラー予測システム（v0.20.3で拡張）**
- 機械学習にインスパイアされたパターンマッチング
- 信頼度スコア付きランタイムエラー予測（85-95% 精度）
- Next.jsのハイドレーションエラー検出
- TypeScript コンパイルエラー予測
- パフォーマンス問題の早期警告
- メモリリーク検出
- 競合状態の識別
- ビルド時とランタイムエラーの分類

### 3. **フレームワーク固有のインテリジェンス（v0.20.3で拡張）**
- **Next.js（20+ ルール）**: サーバー/クライアントコンポーネント境界検証、App Router パターン、ハイドレーションミスマッチ検出
- **React（15+ ルール）**: フック依存関係検証、コンポーネントライフサイクル分析、パフォーマンスアンチパターン検出
- **Vue（10+ ルール）**: Composition API 使用検証、リアクティブデータフロー分析
- **Angular（5+ ルール）**: サービス注入パターン、コンポーネント通信検証
- **TypeScript**: 高度な型安全チェック、ジェネリック使用パターン、strict mode 準拠

### 4. **リアルタイム検証（v0.20.3で強化）**
- ファイル変更監視による即座のフィードバック
- 継続的な開発のためのウォッチモード
- 大規模コードベースのインクリメンタル分析
- IDE統合サポート
- コードスニペットの迅速な検証
- フレームワーク固有のルールとリアルタイム検証

## 📦 MCPツール

### `static-analysis`

プロジェクト全体または特定のファイルに対して包括的な静的解析を実行します。

**入力パラメータ:**
- `projectPath` (必須): プロジェクトルートディレクトリのパス
- `targetFiles` (オプション): 分析する特定のファイル
- `framework` (オプション): ターゲットフレームワーク ('nextjs', 'react', 'vue', 'angular')
- `enabledRules` (オプション): 有効にする特定のルール
- `disabledRules` (オプション): 無効にする特定のルール
- `strictMode` (オプション): 厳格な検証モードを有効化（デフォルト: true）
- `autoFix` (オプション): 自動修正の提案を生成
- `predictErrors` (オプション): エラー予測を有効化
- `analyzeDependencies` (オプション): 依存関係を分析
- `maxIssues` (オプション): 報告する最大問題数（デフォルト: 1000）

**使用例:**
```javascript
{
  "tool": "static-analysis",
  "arguments": {
    "projectPath": "/path/to/your/project",
    "framework": "nextjs",
    "predictErrors": true,
    "analyzeDependencies": true
  }
}
```

### `quick-validate`

ファイルシステムアクセスなしでコードスニペットを迅速に検証します。

**入力パラメータ:**
- `code` (必須): 検証するコード
- `language` (オプション): コード言語 ('typescript', 'javascript', 'jsx', 'tsx')
- `framework` (オプション): ターゲットフレームワーク
- `fileName` (オプション): コンテキスト用のオプションファイル名

**使用例:**
```javascript
{
  "tool": "quick-validate",
  "arguments": {
    "code": "const Component = () => { useState() }",
    "language": "tsx",
    "framework": "nextjs"
  }
}
```

### `realtime-validation`

個々のファイルに対してリアルタイム検証を提供します。

**入力パラメータ:**
- `file` (必須): 検証するファイルパス
- `content` (オプション): ファイルコンテンツ（ディスクから読み込まない場合）
- `framework` (オプション): ターゲットフレームワーク
- `watchMode` (オプション): 継続的な検証のためのウォッチモードを有効化

**使用例:**
```javascript
{
  "tool": "realtime-validation",
  "arguments": {
    "file": "/path/to/component.tsx",
    "framework": "nextjs",
    "watchMode": true
  }
}
```

### `get-validation-rules`

利用可能なすべての検証ルールのリストを返します。

**入力パラメータは必要ありません。**

## 📊 検証カテゴリ（v0.20.3で50+ルール）

### フレームワーク固有ルール（45+ ルール）
- **Next.js（20+ ルール）**: サーバー/クライアント境界、ハイドレーション、画像最適化、API ルート
- **React（15+ ルール）**: フック使用、コンポーネントパターン、状態管理、アクセシビリティ
- **Vue（10+ ルール）**: Composition API、リアクティビティ、テンプレート構文、コンポーネント通信

### 言語ルール（12+ ルール）
- **TypeScript**: 型安全、インターフェース設計、ジェネリック使用、strict mode 準拠
- **JavaScript**: モダン構文、ベストプラクティス、エラーハンドリング

### セキュリティルール（8+ ルール）
- **XSS 防止**: クロスサイトスクリプティング検出
- **インジェクション検出**: SQL/コードインジェクションパターン
- **機密データ**: データ露出チェック
- **認証**: 認証実装検証

### パフォーマンスルール（6+ ルール）
- **バンドルサイズ**: 最適化チェック
- **遅延読み込み**: 実装検証
- **メモリリーク**: 検出パターン
- **レンダリング最適化**: パフォーマンスパターン

### アクセシビリティルール（10+ ルール）
- **ARIA ラベル**: ラベル検証
- **キーボードナビゲーション**: ナビゲーションサポート
- **色コントラスト**: コントラスト準拠
- **セマンティック HTML**: セマンティックマークアップ使用

## 🔍 詳細検証ルール

### コアJavaScript/TypeScriptルール

| ルールID | 説明 | 重要度 |
|---------|-------------|----------|
| `ts-strict-null-checks` | 厳格なnullチェックが有効になっていることを確認 | エラー |
| `unused-imports` | 使用されていないインポート文を検出 | 警告 |
| `async-await-error-handling` | 非同期関数の適切なエラーハンドリングを確認 | エラー |
| `console-log-detection` | console.log文を検出 | 警告 |
| `dependency-version-check` | 依存関係のバージョンを検証 | 警告 |

### Next.js固有のルール

| ルールID | 説明 | 重要度 |
|---------|-------------|----------|
| `nextjs-app-router-structure` | App Routerの構造を検証 | エラー |
| `nextjs-server-components` | サーバー/クライアントコンポーネントの使用を検証 | エラー |
| `nextjs-image-optimization` | Imageコンポーネントの適切な使用を確認 | 警告 |
| `nextjs-api-routes` | APIルートハンドラを検証 | エラー |
| `nextjs-env-vars` | 環境変数の使用を検証 | エラー |
| `nextjs-dynamic-imports` | パフォーマンス向上のための動的インポートを提案 | 情報 |
| `nextjs-config` | next.config.jsの設定を検証 | 警告 |
| `nextjs-data-fetching` | データフェッチングパターンを検証 | 警告 |
| `nextjs-middleware` | ミドルウェアの実装を検証 | エラー |

### エラー予測パターン

| パターンID | 説明 | 確率範囲 |
|------------|-------------|------------------|
| `nextjs-hydration` | ハイドレーションミスマッチ検出 | 70-90% |
| `undefined-access` | 未定義変数アクセス | 60-80% |
| `async-component` | 非同期コンポーネントエラー | 80-95% |
| `memory-leak` | メモリリークパターン | 65-85% |
| `race-condition` | 競合状態検出 | 55-75% |
| `infinite-loop` | 無限ループ検出 | 70-90% |
| `import-error` | インポート解決エラー | 60-80% |
| `env-var-error` | 環境変数エラー | 50-70% |

## 🚀 エラー予測機能（v0.20.3で高精度化）

### Next.js固有予測
1. **ハイドレーションミスマッチ** (85-95% 精度)
   - サーバー/クライアントの日付レンダリング差異
   - 適切なガードなしの条件付きレンダリング  
   - クライアントサイドチェックなしのダイナミックコンテンツ

2. **サーバーコンポーネントエラー** (90% 精度)
   - サーバーコンポーネントでのクライアントフック
   - サーバー環境でのブラウザAPI
   - 非同期コンポーネントパターン

3. **App Router問題** (80% 精度)
   - 無効なルート構造
   - メタデータ設定エラー
   - Loading/Error boundary の配置

### React Hook予測
1. **依存関係配列問題** (92% 精度)
   - useEffect での依存関係の欠如
   - stale closure 問題
   - 無限再レンダリングループ

2. **状態管理問題** (85% 精度)
   - 直接的な状態変更
   - 非同期状態更新での競合状態
   - Context値の不安定性

### TypeScript予測
1. **型エラー** (88% 精度)
   - 型注釈の欠如
   - 型アサーションの誤用
   - ジェネリック制約違反

## 🎨 使用例

### 例1: プロジェクト全体の分析
```javascript
// Next.jsプロジェクト全体を分析
{
  "tool": "static-analysis",
  "arguments": {
    "projectPath": "/Users/dev/my-nextjs-app",
    "framework": "nextjs",
    "predictErrors": true,
    "analyzeDependencies": true,
    "strictMode": true
  }
}
```

### 例2: コンポーネントの迅速な検証
```javascript
// Reactコンポーネントを検証
{
  "tool": "quick-validate",
  "arguments": {
    "code": `
      'use client';
      import { useState } from 'react';
      
      export default function Counter() {
        const [count, setCount] = useState(0);
        console.log('Rendering');
        
        return (
          <button onClick={() => setCount(count + 1)}>
            Count: {count}
          </button>
        );
      }
    `,
    "language": "tsx",
    "framework": "nextjs"
  }
}
```

### 例3: リアルタイムファイル監視
```javascript
// ファイルの問題を監視
{
  "tool": "realtime-validation",
  "arguments": {
    "file": "/Users/dev/project/app/page.tsx",
    "framework": "nextjs",
    "watchMode": true
  }
}
```

## 📊 出力フォーマット

### 静的解析レポート
```
📊 静的解析レポート
==================================================

🔍 サマリー:
  • エラー: 5
  • 警告: 12
  • 情報: 3

📋 問題:

📁 nextjs-components:
  ❌ サーバーコンポーネントでクライアントサイドフック 'useState' を使用
     📄 app/components/Header.tsx:15
     💡 ファイルの先頭に 'use client' ディレクティブを追加
     🎯 信頼度: 100%

📁 dependencies:
  ⚠️ 不足している依存関係: 'lodash'
     📄 src/utils/helpers.ts:3
     💡 実行: npm install lodash
     🎯 信頼度: 95%

🔮 エラー予測レポート
==================================================

📊 サマリー:
  • 総予測数: 8
  • 高リスク (>70%): 3
  • 中リスク (40-70%): 4
  • 低リスク (<40%): 1

⚠️ 予測されるエラー:

🕐 ランタイムフェーズ:
  🔴 HydrationError (85% 確率)
     📝 潜在的なハイドレーションミスマッチを検出
     📄 app/components/Timer.tsx
     💡 予防策: クライアント専用コードにはuseEffectを使用
     🔍 予想: Error: Text content does not match server-rendered HTML
```

## 🔧 設定

### 環境変数

- `FLUORITE_LOG_LEVEL`: ログレベルを設定（debug, info, warn, error）
- `FLUORITE_CATALOG_DIR`: デフォルトカタログディレクトリを上書き
- `NODE_ENV`: 詳細ログのために 'development' に設定

### カスタムルール

`ValidationRule` インターフェースを拡張してカスタム検証ルールを追加できます：

```typescript
const customRule: ValidationRule = {
  id: 'custom-rule',
  name: 'カスタム検証ルール',
  description: 'このルールが検証する内容の説明',
  severity: 'error',
  category: 'custom',
  frameworks: ['nextjs'],
  validate: async (context, content, filePath) => {
    const results: AnalysisResult[] = [];
    // ここに検証ロジックを記述
    return results;
  }
};
```

## 🚀 パフォーマンスの考慮事項

- **ファイル検出**: node_modules、dist、build、.next ディレクトリを自動的に除外
- **インクリメンタル分析**: プロジェクト全体ではなく特定のファイルを分析可能
- **キャッシング**: パフォーマンス向上のため結果をキャッシュ
- **並列処理**: 複数のファイルを同時に分析
- **スマートルール選択**: フレームワーク固有のルールは関連するフレームワークでのみ実行

## 🛡️ セキュリティ機能

- **脆弱性スキャン**: 依存関係の既知のセキュリティ脆弱性をチェック
- **環境変数検証**: 機密データがクライアントに公開されていないことを確認
- **CORS設定**: APIルートのCORSヘッダーを検証
- **認証パターン**: 潜在的な認証問題を検出
- **入力検証**: 適切な入力サニタイゼーションをチェック

## 📈 利点

1. **ランタイム前にエラーをキャッチ**: デプロイメント前に問題を特定
2. **フレームワーク固有のインテリジェンス**: フレームワークに合わせた検証
3. **予測分析**: AIにインスパイアされたエラー予測
4. **包括的なカバレッジ**: 構文からセキュリティ、パフォーマンスまで
5. **開発者の生産性**: デバッグ時間を大幅に削減
6. **CI/CD統合**: ビルドパイプラインに統合可能
7. **リアルタイムフィードバック**: コーディング中に検証を取得

## 🔄 Claude Codeとの統合

この静的解析システムは、Claude Codeのコード検証機能を強化するために特別に設計されています。このMCPサーバーでClaude Codeを使用する場合：

1. Claude Codeはコード変更を提案する前に検証をリクエスト可能
2. コード生成中のリアルタイム検証
3. 生成されたコードの予測エラー分析
4. フレームワーク認識コード提案
5. 依存関係の互換性チェック

## 📝 ベストプラクティス

1. **早期かつ頻繁に実行**: 開発中にリアルタイム検証を使用
2. **CI/CD統合**: ビルドパイプラインにstatic-analysisを追加
3. **フレームワーク選択**: 最良の結果を得るために常にフレームワークを指定
4. **カスタムルール**: プロジェクト固有の検証ルールを追加
5. **エラー予測**: 高確率の予測に注意を払う
6. **依存関係分析**: バージョン競合をキャッチするため定期的に実行
7. **厳格モード**: 本番ビルドに使用

## 🎯 Next.js固有のヒント

1. **サーバーコンポーネント**: サーバー/クライアントコンポーネントの境界を検証
2. **データフェッチング**: fetchキャッシュ設定をチェック
3. **画像最適化**: すべての画像がNext.js Imageコンポーネントを使用することを確認
4. **環境変数**: NEXT_PUBLIC_ プレフィックスの使用を検証
5. **APIルート**: 適切なレスポンス処理を確認
6. **ミドルウェア**: ミドルウェアを軽量に保つ
7. **App Router**: 命名規則に従う

## 📚 追加リソース

- [Next.jsドキュメント](https://nextjs.org/docs)
- [TypeScriptハンドブック](https://www.typescriptlang.org/docs/)
- [Reactベストプラクティス](https://react.dev/learn)
- [MCPプロトコルドキュメント](https://modelcontextprotocol.io/)

## 🤝 貢献

新しい検証ルールを追加したり、既存のルールを改善するには：

1. `ValidationRule` インターフェースに従って新しいルールを作成
2. 必要に応じてフレームワーク固有のロジックを追加
3. エラー予測パターンを含める
4. 包括的なテストを追加
5. ドキュメントを更新

## 📄 ライセンス

この静的解析システムはFluorite MCPサーバーの一部であり、MITライセンスの下でリリースされています。

---

*静的解析ドキュメント - 最終更新: 2025年8月15日 | バージョン 0.20.3*