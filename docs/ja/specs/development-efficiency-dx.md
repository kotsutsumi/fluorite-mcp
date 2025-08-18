# 開発効率・DXエコシステム

`spec://development-efficiency-dx-ecosystem`

## 概要

開発効率とDeveloper Experience（DX）を最大化するための包括的エコシステム仕様です。モノレポ管理、コード品質、ビルドツール、開発環境の最適化を網羅しています。

## 主要コンポーネント

### モノレポ管理
- **Nx** - エンタープライズ向けモノレポツール
- **Turborepo** - 高性能ビルドシステム
- **Rush** - Microsoft製モノレポマネージャー
- **Lerna** - マルチパッケージ管理

### コード品質
- **Biome** - 高速フォーマッター/リンター
- **ESLint** - JavaScript/TypeScriptリンター
- **Prettier** - コードフォーマッター
- **Husky** - Git フック管理

### 開発ツール
- **Storybook** - UIコンポーネント開発環境
- **Vite** - 高速ビルドツール
- **esbuild** - 超高速バンドラー
- **tsup** - TypeScriptライブラリバンドラー

## 実装例

### Nx モノレポ設定
```typescript
// nx.json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "parallel": 3,
        "cacheDirectory": ".nx/cache"
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    }
  },
  "affected": {
    "defaultBase": "main"
  }
}

// プロジェクト作成
nx g @nx/react:app my-app
nx g @nx/react:lib shared-ui
nx g @nx/node:app api

// 依存関係グラフ表示
nx graph

// 影響範囲のテスト実行
nx affected:test

// 並列ビルド
nx run-many --target=build --all --parallel
```

### Turborepo パイプライン
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "env": ["NODE_ENV", "API_URL"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"],
      "outputs": []
    }
  },
  "globalEnv": ["CI"],
  "globalDependencies": ["tsconfig.json"]
}
```

### Biome 設定
```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExtraBooleanCast": "error",
        "noUselessConstructor": "error"
      },
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useConst": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingComma": "es5"
    }
  }
}
```

### Storybook 設定
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-coverage'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  features: {
    storyStoreV7: true
  },
  viteFinal: async (config) => {
    // Vite設定のカスタマイズ
    return config
  }
}

export default config

// コンポーネントストーリー
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
}
```

### Git フック自動化
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# コードフォーマット
npx lint-staged

# テスト実行
npm run test:changed

// package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "biome check --apply",
      "biome format --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ]
  }
}
```

## ベストプラクティス

- キャッシング戦略の最適化
- 並列処理の活用
- 依存関係の最小化
- CI/CD統合の自動化
- 開発環境の標準化

## リソース

- [Nx ドキュメント](https://nx.dev)
- [Turborepo ドキュメント](https://turbo.build)
- [Biome ドキュメント](https://biomejs.dev)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/development-efficiency-dx-ecosystem.yaml)