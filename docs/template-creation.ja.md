# テンプレート作成ガイド

Fluorite MCP用のカスタムスパイクテンプレートとライブラリ仕様の作成方法を学びます。

## 📖 目次

- [スパイクテンプレート作成](#スパイクテンプレート作成)
- [ライブラリ仕様作成](#ライブラリ仕様作成)
- [テンプレートのベストプラクティス](#テンプレートのベストプラクティス)
- [テンプレートのテスト](#テンプレートのテスト)
- [公開と配布](#公開と配布)
- [高度なテクニック](#高度なテクニック)

## スパイクテンプレート作成

スパイクテンプレートは、ファイルテンプレートとパラメータ置換による迅速なプロトタイピングスキャフォールドを定義するJSONファイルです。

### 基本的なテンプレート構造

```json
{
  "id": "my-custom-template",
  "name": "マイカスタムテンプレート",
  "version": "1.0.0",
  "stack": ["typescript", "react", "nextjs"],
  "tags": ["web", "frontend", "custom"],
  "description": "迅速なReact開発用のカスタムテンプレート",
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "プロジェクト名"
    },
    {
      "name": "author_name",
      "required": true,
      "description": "package.json用の作者名"
    }
  ],
  "files": [
    {
      "path": "{{project_name}}/package.json",
      "template": "{\n  \"name\": \"{{project_name}}\",\n  \"author\": \"{{author_name}}\"\n}"
    }
  ],
  "patches": []
}
```

### テンプレートフィールドリファレンス

#### 必須フィールド

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `id` | string | テンプレートの一意識別子 |
| `name` | string | 人間が読める名前 |
| `version` | string | セマンティックバージョン（例："1.0.0"） |
| `description` | string | 目的の簡潔な説明 |
| `files` | array | 生成するファイルテンプレート |

#### オプションフィールド

| フィールド | 型 | 説明 |
|-------|------|-------------|
| `stack` | string[] | 使用する技術（検索用） |
| `tags` | string[] | カテゴリとキーワード |
| `params` | object[] | テンプレートパラメータ |
| `patches` | object[] | 既存ファイルの修正 |
| `dependencies` | object | インストールするNPM依存関係 |
| `scripts` | object | 追加するNPMスクリプト |

### パラメータ設定

パラメータはテンプレートの動的カスタマイズを可能にします：

```json
{
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "package.json用のプロジェクト名",
      "type": "string",
      "validation": "^[a-z][a-z0-9-]*$"
    },
    {
      "name": "use_typescript",
      "required": false,
      "default": true,
      "description": "JavaScriptの代わりにTypeScriptを使用",
      "type": "boolean"
    },
    {
      "name": "port",
      "required": false,
      "default": 3000,
      "description": "開発サーバーポート",
      "type": "number",
      "min": 1000,
      "max": 65535
    }
  ]
}
```

### ファイルテンプレート

ファイルテンプレートはパラメータ置換をサポートします：

```json
{
  "files": [
    {
      "path": "{{project_name}}/src/App.{{use_typescript ? 'tsx' : 'jsx'}}",
      "template": "import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <h1>{{project_name}}</h1>\n    </div>\n  );\n}\n\nexport default App;"
    },
    {
      "path": "{{project_name}}/package.json",
      "template": "{\n  \"name\": \"{{project_name}}\",\n  \"version\": \"1.0.0\",\n  \"scripts\": {\n    \"dev\": \"next dev -p {{port}}\"\n  }\n}"
    }
  ]
}
```

### 条件付きロジック

テンプレート内で条件付きロジックを使用：

```json
{
  "files": [
    {
      "path": "{{project_name}}/{{use_typescript ? 'tsconfig.json' : 'jsconfig.json'}}",
      "template": "{{#if use_typescript}}{\n  \"compilerOptions\": {\n    \"target\": \"es5\",\n    \"strict\": true\n  }\n}{{else}}{\n  \"compilerOptions\": {\n    \"target\": \"es5\"\n  }\n}{{/if}}"
    }
  ]
}
```

## ライブラリ仕様作成

ライブラリ仕様は特定のライブラリの詳細な使用情報を提供します。

### 基本的な仕様構造

```yaml
# lib-example.yaml
id: "custom-library"
name: "Custom Library"
version: "2.1.0"
description: "カスタムライブラリの包括的な仕様"

installation:
  npm: "npm install custom-library"
  yarn: "yarn add custom-library"
  pnpm: "pnpm add custom-library"

imports:
  - "import { Component } from 'custom-library'"
  - "import customLib from 'custom-library'"

typescript:
  types_included: true
  types_package: "@types/custom-library"

examples:
  basic_usage: |
    import { Component } from 'custom-library';
    
    function App() {
      return <Component prop="value" />;
    }

  advanced_usage: |
    import customLib, { utility } from 'custom-library';
    
    const config = customLib.configure({
      option: 'value'
    });

best_practices:
  - "常にTypeScriptの型定義を使用"
  - "パフォーマンスのためにコンポーネントをメモ化"
  - "エラーハンドリングを適切に実装"

common_issues:
  - issue: "TypeScript型エラー"
    solution: "@types/custom-libraryをインストール"
  - issue: "スタイルが適用されない"
    solution: "CSSファイルをインポート"

api:
  components:
    - name: "Component"
      props:
        - name: "prop"
          type: "string"
          required: true
          description: "コンポーネントプロパティ"
      
  functions:
    - name: "utility"
      params:
        - name: "input"
          type: "string"
      returns: "string"
      description: "ユーティリティ関数"

performance:
  bundle_size: "45.2KB"
  tree_shaking: true
  notes: "使用していない機能は自動的に除外されます"

security:
  vulnerabilities: []
  last_audit: "2025-01-15"
  notes: "定期的なセキュリティ監査済み"
```

## テンプレートのベストプラクティス

### 1. 命名規則

```json
{
  "id": "framework-feature-type",
  "name": "Framework Feature Template",
  "tags": ["framework", "feature-type", "use-case"]
}
```

**例**:
- `nextjs-auth-minimal` - Next.js認証の最小実装
- `react-component-advanced` - 高度なReactコンポーネント
- `fastapi-crud-complete` - 完全なFastAPI CRUD

### 2. パラメータ設計

```json
{
  "params": [
    {
      "name": "component_name",
      "required": true,
      "description": "PascalCase形式のコンポーネント名",
      "validation": "^[A-Z][a-zA-Z0-9]*$"
    },
    {
      "name": "styling_solution",
      "required": false,
      "default": "tailwind",
      "options": ["tailwind", "styled-components", "css-modules"],
      "description": "使用するスタイリング解決策"
    }
  ]
}
```

### 3. ファイル組織

```json
{
  "files": [
    {
      "path": "{{project_name}}/src/components/{{component_name}}/index.ts",
      "template": "export { default } from './{{component_name}}';"
    },
    {
      "path": "{{project_name}}/src/components/{{component_name}}/{{component_name}}.tsx",
      "template": "// メインコンポーネントファイル"
    },
    {
      "path": "{{project_name}}/src/components/{{component_name}}/{{component_name}}.test.tsx",
      "template": "// テストファイル"
    }
  ]
}
```

### 4. エラーハンドリング

```json
{
  "validation": {
    "required_files": ["package.json"],
    "required_dependencies": ["react"],
    "prohibited_files": ["conflicting-config.js"]
  },
  "error_messages": {
    "missing_dependency": "{{dependency}}が必要です。npm install {{dependency}}を実行してください。",
    "invalid_project": "有効なReactプロジェクトディレクトリで実行してください。"
  }
}
```

## テンプレートのテスト

### 1. ローカルテスト

```bash
# テンプレートを開発環境に追加
mkdir -p ~/.fluorite/templates/custom
cp my-template.json ~/.fluorite/templates/custom/

# テンプレートをテスト
fluorite-mcp preview-spike --id my-custom-template --params '{"project_name": "test-project"}'

# 実際に適用してテスト
mkdir test-output
cd test-output
fluorite-mcp apply-spike --id my-custom-template --params '{"project_name": "test-app", "author_name": "テストユーザー"}'
```

### 2. 自動テスト

```javascript
// test-template.js
const { testTemplate } = require('fluorite-mcp/testing');

describe('マイカスタムテンプレート', () => {
  test('基本パラメータで正しく生成される', async () => {
    const result = await testTemplate('my-custom-template', {
      project_name: 'test-app',
      author_name: 'テストユーザー'
    });
    
    expect(result.files).toContain('test-app/package.json');
    expect(result.content['test-app/package.json']).toContain('"name": "test-app"');
  });
  
  test('必須パラメータが不足時にエラー', async () => {
    await expect(testTemplate('my-custom-template', {
      project_name: 'test-app'
      // author_name missing
    })).rejects.toThrow('author_nameが必要です');
  });
});
```

### 3. 統合テスト

```bash
# 完全なプロジェクトワークフローをテスト
#!/bin/bash
set -e

echo "🧪 テンプレート統合テストを開始..."

# テンプレートを適用
fluorite-mcp apply-spike --id my-custom-template --params test-params.json

# 生成されたプロジェクトに移動
cd test-app

# 依存関係をインストール
npm install

# ビルドをテスト
npm run build

# テストを実行
npm test

echo "✅ 統合テスト完了!"
```

## 公開と配布

### 1. テンプレートレジストリ

```bash
# 公式レジストリに公開
fluorite-mcp publish-template my-template.json --registry official

# プライベートレジストリに公開
fluorite-mcp publish-template my-template.json --registry private --url https://templates.company.com
```

### 2. Git リポジトリ

```bash
# Gitリポジトリからテンプレートを使用
fluorite-mcp add-template-source --git https://github.com/username/fluorite-templates.git

# 特定のブランチまたはタグ
fluorite-mcp add-template-source --git https://github.com/username/templates.git#v1.0.0
```

### 3. NPMパッケージ

```json
{
  "name": "my-fluorite-templates",
  "version": "1.0.0",
  "fluorite": {
    "templates": "./templates",
    "specs": "./specs"
  },
  "files": [
    "templates/**/*.json",
    "specs/**/*.yaml"
  ]
}
```

## 高度なテクニック

### 1. 動的テンプレート生成

```json
{
  "dynamic_generation": {
    "enabled": true,
    "generator": "generate-components.js"
  }
}
```

```javascript
// generate-components.js
module.exports = function generateTemplate(params) {
  const components = params.components || [];
  const files = components.map(comp => ({
    path: `src/components/${comp.name}.tsx`,
    template: generateComponentTemplate(comp)
  }));
  
  return { files };
};
```

### 2. テンプレートの継承

```json
{
  "extends": "base-react-template",
  "overrides": {
    "dependencies": {
      "additional-lib": "^2.0.0"
    }
  },
  "additional_files": [
    {
      "path": "custom-config.js",
      "template": "// カスタム設定"
    }
  ]
}
```

### 3. 条件付きファイル生成

```json
{
  "files": [
    {
      "path": "{{project_name}}/src/{{#if use_database}}models/{{/if}}User.ts",
      "condition": "use_database === true",
      "template": "// データベースモデル"
    }
  ]
}
```

### 4. 後処理スクリプト

```json
{
  "post_generation": [
    {
      "command": "npm install",
      "description": "依存関係をインストール"
    },
    {
      "command": "npm run format",
      "description": "コードをフォーマット"
    }
  ]
}
```

## デバッグとトラブルシューティング

### 1. テンプレート検証

```bash
# テンプレートの構文チェック
fluorite-mcp validate-template my-template.json

# 詳細な検証レポート
fluorite-mcp validate-template my-template.json --verbose --report validation-report.json
```

### 2. デバッグモード

```bash
# デバッグ情報付きでテンプレートを適用
FLUORITE_DEBUG=true fluorite-mcp apply-spike --id my-template

# ステップバイステップ実行
fluorite-mcp apply-spike --id my-template --step-by-step
```

### 3. ログ分析

```bash
# テンプレート生成ログを確認
fluorite-mcp logs --filter template-generation --last 24h

# エラーログのみ表示
fluorite-mcp logs --level error --template my-template
```

## まとめ

カスタムテンプレートの作成により、Fluorite MCPを特定のニーズに合わせてカスタマイズできます。ベストプラクティスに従い、適切にテストすることで、チーム全体で再利用可能な高品質なテンプレートを作成できます。

詳細な例とアドバンステクニックについては、[スパイクテンプレートガイド](./spike-templates.ja.md)と[開発者ガイド](./developer.ja.md)を参照してください。