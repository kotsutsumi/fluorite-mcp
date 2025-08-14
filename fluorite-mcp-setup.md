
# fluorite-mcp MCP サーバー構築 & 公開ガイド

このドキュメントでは、**fluorite-mcp** パッケージとして、
Next.js / Laravel 開発用コンポーネントやライブラリの仕様を解析・蓄積する MCP サーバーを構築し、
npm 公開しつつ GitHub Pages + VitePress でドキュメント化する手順をまとめます。

---

## 1. GitHub リポジトリ作成とブランチ作成

```bash
gh repo create your-org/fluorite-mcp --public --clone
cd fluorite-mcp
git checkout -b feat/init-fluorite-mcp
```

---

## 2. プロジェクト初期化

```bash
npm init -y
npm pkg set name="fluorite-mcp" version="0.1.0" type="module"
npm pkg set main="dist/server.js" types="dist/server.d.ts"
npm pkg set license="MIT" author="Your Name <you@example.com>"
npm pkg set engines.node=">=18"
npm pkg set files='["dist","README.md","LICENSE"]'
npm pkg set bin.fluorite-mcp="dist/server.js"
```

依存関係：
```bash
npm i @modelcontextprotocol/sdk zod
npm i -D typescript tsx @types/node rimraf vitepress
```

---

## 3. ディレクトリ構成

```
fluorite-mcp/
├─ src/
│  ├─ server.ts
│  ├─ catalog/
│  │  └─ example-lib.yaml
│  ├─ schemas/
│  │  └─ library-spec.schema.json
├─ docs/                  # VitePress ドキュメント
│  ├─ index.md
│  └─ guide.md
├─ .github/workflows/
│  └─ deploy-docs.yml
└─ package.json
```

---

## 4. VitePress セットアップ

```bash
npx vitepress init docs
```

GitHub Pages デプロイ用 `.github/workflows/deploy-docs.yml`:
```yaml
name: Deploy Docs
on:
  push:
    branches: [ main ]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run docs:build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

`package.json` スクリプト追加:
```json
"scripts": {
  "dev": "tsx src/server.ts",
  "build": "rimraf dist && tsc -p tsconfig.json",
  "start": "node dist/server.js",
  "docs:dev": "vitepress dev docs",
  "docs:build": "vitepress build docs",
  "docs:serve": "vitepress serve docs"
}
```

---

## 5. サンプル仕様ファイル（`src/catalog/example-lib.yaml`）

```yaml
id: "@minoru/react-dnd-treeview"
name: "React DnD TreeView"
summary: "ドラッグ&ドロップ可能な React ツリー"
lastReviewed: "2025-08-14"
```

---

## 6. npm 公開

初回のみ:
```bash
npm publish --access public
```

---

## 7. GitHub Pages 公開手順

1. `main` ブランチに push
2. Actions が VitePress をビルドして Pages にデプロイ
3. https://<user>.github.io/fluorite-mcp で公開
