# テンプレート作成ガイド

Fluorite MCP でカスタムスパイクテンプレートとライブラリ仕様を作成する包括的なガイドです。

## 🎯 概要

このガイドでは、以下の作成方法について説明します：
- **スパイクテンプレート**: 迅速なプロトタイピング用のコードスキャフォールド
- **ライブラリ仕様**: Claude に提供するライブラリの使用パターン
- **カスタム統合**: 特定のワークフロー向けの専用テンプレート

## 📋 前提条件

### 必要なツール
- **Node.js**: 18.0以上
- **npm**: 8.0以上
- **Git**: バージョン管理用
- **エディタ**: VS Code推奨（YAML拡張機能付き）

### 基本知識
- YAML構文の理解
- 対象技術スタックの知識
- テンプレートエンジンの基本概念

## 🧪 スパイクテンプレート作成

### 基本構造

```yaml
# template.yaml
metadata:
  name: "my-custom-template"
  version: "1.0.0"
  description: "カスタムテンプレートの説明"
  author: "あなたの名前"
  category: "frontend" # frontend, backend, fullstack, etc.
  tags: 
    - "react"
    - "typescript"
    - "components"
  
template:
  framework: "react"
  language: "typescript"
  dependencies:
    - "react@^18.0.0"
    - "typescript@^5.0.0"
    - "@types/react@^18.0.0"
  
files:
  - path: "src/components/{{componentName}}.tsx"
    content: |
      import React from 'react';
      
      interface {{componentName}}Props {
        // プロパティを定義
      }
      
      export const {{componentName}}: React.FC<{{componentName}}Props> = () => {
        return (
          <div>
            {/* コンポーネントの実装 */}
          </div>
        );
      };
      
      export default {{componentName}};
```

### 変数システム

#### 基本変数
```yaml
variables:
  componentName:
    type: "string"
    description: "コンポーネント名"
    default: "MyComponent"
    pattern: "^[A-Z][a-zA-Z0-9]*$"
  
  includeTests:
    type: "boolean"
    description: "テストファイルを含める"
    default: true
```

#### 高度な変数
```yaml
variables:
  apiEndpoint:
    type: "string"
    description: "APIエンドポイントURL"
    validation:
      required: true
      format: "url"
  
  authProvider:
    type: "choice"
    description: "認証プロバイダー"
    options:
      - "nextauth"
      - "auth0"
      - "firebase"
    default: "nextauth"
```

### 条件付きファイル生成

```yaml
files:
  - path: "src/components/{{componentName}}.tsx"
    content: |
      // メインコンポーネント
  
  # テストが有効な場合のみ生成
  - path: "src/components/__tests__/{{componentName}}.test.tsx"
    condition: "includeTests"
    content: |
      import { render, screen } from '@testing-library/react';
      import {{componentName}} from '../{{componentName}}';
      
      describe('{{componentName}}', () => {
        it('正常にレンダリングされる', () => {
          render(<{{componentName}} />);
          // テストの実装
        });
      });
```

## 📚 ライブラリ仕様作成

### 基本仕様構造

```yaml
# library-spec.yaml
metadata:
  name: "my-custom-library"
  version: "1.0.0"
  description: "カスタムライブラリの仕様"
  documentation: "https://example.com/docs"
  
library:
  name: "my-custom-library"
  npm: "my-custom-library"
  language: "typescript"
  framework: "react"
  
usage_patterns:
  basic:
    description: "基本的な使用方法"
    code: |
      import { MyComponent } from 'my-custom-library';
      
      function App() {
        return <MyComponent prop="value" />;
      }
  
  advanced:
    description: "高度な使用方法"
    code: |
      import { MyComponent, useMyHook } from 'my-custom-library';
      
      function App() {
        const { data, error } = useMyHook();
        
        if (error) return <div>エラー: {error.message}</div>;
        
        return <MyComponent data={data} />;
      }

configuration:
  installation: "npm install my-custom-library"
  peer_dependencies:
    - "react@^18.0.0"
    - "react-dom@^18.0.0"
  
  setup: |
    // プロバイダーの設定
    import { MyProvider } from 'my-custom-library';
    
    function App() {
      return (
        <MyProvider config={{ apiKey: 'your-key' }}>
          {/* アプリケーション */}
        </MyProvider>
      );
    }

best_practices:
  - "常にTypeScriptの型を活用する"
  - "エラーハンドリングを適切に実装する"
  - "パフォーマンスを考慮したレンダリング"
  
common_patterns:
  error_handling: |
    try {
      const result = await myLibraryFunction();
      // 成功時の処理
    } catch (error) {
      console.error('エラー:', error);
      // エラー処理
    }
```

### API仕様定義

```yaml
api:
  endpoints:
    - name: "getData"
      method: "GET"
      path: "/api/data"
      description: "データを取得"
      parameters:
        - name: "id"
          type: "string"
          required: true
          description: "データのID"
      response:
        type: "object"
        properties:
          id: "string"
          name: "string"
          data: "any"
      
    - name: "createData"
      method: "POST"
      path: "/api/data"
      description: "新しいデータを作成"
      body:
        type: "object"
        properties:
          name: "string"
          data: "any"
      response:
        type: "object"
        properties:
          id: "string"
          message: "string"
```

## 🔧 高度な機能

### 複数ファイルテンプレート

```yaml
files:
  # メインコンポーネント
  - path: "src/components/{{componentName}}/index.tsx"
    content: |
      export { default } from './{{componentName}}';
      export * from './{{componentName}}';
  
  # コンポーネント実装
  - path: "src/components/{{componentName}}/{{componentName}}.tsx"
    content: |
      // コンポーネント実装
  
  # スタイル
  - path: "src/components/{{componentName}}/{{componentName}}.module.css"
    content: |
      .container {
        /* スタイル定義 */
      }
  
  # 型定義
  - path: "src/components/{{componentName}}/types.ts"
    content: |
      export interface {{componentName}}Props {
        // 型定義
      }
```

### 動的依存関係

```yaml
dependencies:
  base:
    - "react@^18.0.0"
    - "typescript@^5.0.0"
  
  conditional:
    # 状態管理が選択された場合
    - condition: "stateManagement === 'zustand'"
      packages:
        - "zustand@^4.0.0"
    
    - condition: "stateManagement === 'redux'"
      packages:
        - "@reduxjs/toolkit@^1.9.0"
        - "react-redux@^8.0.0"
```

### カスタムジェネレーター

```yaml
generators:
  - name: "createApiHooks"
    description: "API呼び出し用のカスタムフックを生成"
    template: |
      export const use{{entityName}} = () => {
        const [data, setData] = useState<{{entityName}}[]>([]);
        const [loading, setLoading] = useState(false);
        
        const fetch{{entityName}} = async () => {
          setLoading(true);
          try {
            const response = await api.get('/{{entityPath}}');
            setData(response.data);
          } catch (error) {
            console.error('取得エラー:', error);
          } finally {
            setLoading(false);
          }
        };
        
        return { data, loading, fetch{{entityName}} };
      };
```

## 📦 パッケージ化と配布

### ローカル配布

```bash
# テンプレートディレクトリ作成
mkdir ~/.fluorite/custom-templates/my-template

# テンプレートファイルをコピー
cp template.yaml ~/.fluorite/custom-templates/my-template/
```

### NPMパッケージとして配布

```json
{
  "name": "my-fluorite-templates",
  "version": "1.0.0",
  "description": "カスタム Fluorite MCP テンプレート",
  "main": "index.js",
  "files": [
    "templates/**/*",
    "specs/**/*"
  ],
  "keywords": ["fluorite-mcp", "templates", "claude"],
  "fluorite": {
    "templates": "./templates",
    "specs": "./specs"
  }
}
```

### GitHub リポジトリから

```bash
# リポジトリをクローン
git clone https://github.com/username/my-fluorite-templates

# 手動インストール
fluorite-mcp install-templates ./my-fluorite-templates
```

## 🧪 テスト戦略

### テンプレートテスト

```yaml
# template.test.yaml
test:
  scenarios:
    - name: "基本生成テスト"
      variables:
        componentName: "TestComponent"
        includeTests: true
      expected_files:
        - "src/components/TestComponent.tsx"
        - "src/components/__tests__/TestComponent.test.tsx"
      
    - name: "条件付き生成テスト"
      variables:
        componentName: "TestComponent"
        includeTests: false
      expected_files:
        - "src/components/TestComponent.tsx"
      excluded_files:
        - "src/components/__tests__/TestComponent.test.tsx"
```

### 自動検証

```bash
# テンプレートの構文チェック
fluorite-mcp validate-template ./my-template

# 生成テスト
fluorite-mcp test-template ./my-template

# 依存関係チェック
fluorite-mcp check-dependencies ./my-template
```

## 🌟 ベストプラクティス

### デザイン原則

1. **シンプルさ**: 複雑すぎないテンプレートを作成
2. **再利用性**: 汎用的で再利用可能な構造
3. **保守性**: 更新とメンテナンスが容易
4. **ドキュメント**: 十分な説明と例

### コード品質

1. **型安全性**: TypeScript型を活用
2. **エラーハンドリング**: 適切なエラー処理
3. **テスト**: 自動テストを含める
4. **セキュリティ**: セキュリティベストプラクティス

### ユーザー体験

1. **直感的な変数名**: 分かりやすい変数名を使用
2. **適切なデフォルト値**: 合理的なデフォルト設定
3. **明確な説明**: 各オプションの説明
4. **例とドキュメント**: 使用例と説明書

## 🚀 コミュニティ貢献

### 貢献プロセス

1. **GitHub Issues**: 新しいテンプレートの提案
2. **Pull Request**: テンプレートの実装
3. **レビュー**: コミュニティレビュー
4. **マージ**: 承認後のマージ

### 品質基準

- **動作確認**: すべてのテンプレートが正常に動作
- **ドキュメント**: 完全なドキュメント
- **テスト**: 自動テストの実装
- **メンテナンス**: 継続的なメンテナンス

## 📚 参考資料

- **[Fluorite MCP API](../API.md)**: 技術仕様
- **[開発者ガイド](./developer.md)**: 高度なカスタマイズ
- **[例とサンプル](./use-cases-examples.md)**: 実用例
- **[GitHub Repository](https://github.com/kotsutsumi/fluorite-mcp)**: 最新の更新情報

---

