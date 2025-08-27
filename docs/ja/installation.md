# インストールガイド

このガイドでは、Fluorite MCP を Claude Code CLI と共にインストールし設定するための詳細な手順を提供します。

## 📖 目次

- [システム要件](#システム要件)
- [インストール方法](#インストール方法)
- [設定](#設定)
- [確認](#確認)
- [トラブルシューティング](#トラブルシューティング)
- [高度なセットアップ](#高度なセットアップ)

## システム要件

### 最小要件

- **Node.js**: バージョン 18.0 以上
- **npm**: バージョン 8.0 以上（または yarn/pnpm 等価版）
- **Claude Code CLI**: 最新版
- **オペレーティングシステム**: macOS、Linux、または WSL2 付き Windows

### 推奨要件

- **Node.js**: バージョン 20.0 以上（LTS）
- **npm**: バージョン 10.0 以上
- **メモリ**: 4GB 以上の利用可能 RAM
- **ストレージ**: カタログとキャッシュ用に 500MB 以上の空き容量

### 環境の確認

```bash
# Node.js バージョンを確認
node --version
# 出力例: v18.0.0 以上

# npm バージョンを確認  
npm --version
# 出力例: 8.0.0 以上

# Claude Code CLI を確認
claude --version
# Claude Code CLI バージョンが出力されるはずです
```

## インストール方法

### 方法 0: 自動セットアップ（最も簡単）

最も迅速なセットアップには、自動インストールスクリプトを使用：

```bash
# リポジトリをクローン（まだ行っていない場合）
# フォークまたはローカルコピーからクローン
cd fluorite-mcp

# 自動セットアップスクリプトを実行
./scripts/setup-mcp-connection.sh

# インストールを確認
./scripts/validate-mcp-connection.sh
```

このスクリプトは自動的に以下を実行します：
- fluorite-mcp を最新版にインストール/更新
- 正しい MCP サーバーバイナリで Claude Code CLI を設定
- 接続をテストし検証を提供

### 方法 1: グローバルインストール（手動）

これは最も一般的で推奨されるインストール方法です：

```bash
# Fluorite MCP をグローバルにインストール
npm install -g fluorite-mcp

# Claude Code CLI に追加
claude mcp add fluorite-mcp -- fluorite-mcp
```

### 方法 2: ローカルインストール

プロジェクト固有のインストール用：

```bash
# 専用ディレクトリを作成
mkdir ~/.claude-mcp-servers
cd ~/.claude-mcp-servers

# ローカルにインストール
npm install fluorite-mcp

# 完全パスで Claude Code CLI に追加
claude mcp add fluorite-mcp -- $(pwd)/node_modules/.bin/fluorite-mcp
```

### 方法 3: ソースから（開発用）

開発者または最新機能用：

```bash
# リポジトリをクローン
# フォークまたはローカルコピーからクローン
cd fluorite-mcp

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build

# グローバルにリンク
npm link

# Claude Code CLI に追加
claude mcp add fluorite-mcp -- fluorite-mcp
```

### 方法 4: パッケージマネージャーの使用

#### Yarn を使用

```bash
# グローバルインストール
yarn global add fluorite-mcp

# Claude Code CLI に追加
claude mcp add fluorite-mcp -- fluorite-mcp
```

#### pnpm を使用

```bash
# グローバルインストール
pnpm add -g fluorite-mcp

# Claude Code CLI に追加
claude mcp add fluorite-mcp -- fluorite-mcp
```

## 設定

### 基本設定

インストール後、Fluorite MCP はデフォルト設定で動作します。基本的な使用には追加の設定は不要です。

### 高度な設定

#### カスタムカタログディレクトリ

仕様のカスタム場所を設定：

```bash
# 環境変数を設定
export FLUORITE_CATALOG_DIR="/path/to/your/specs"

# または設定ファイルを作成
echo 'export FLUORITE_CATALOG_DIR="/path/to/your/specs"' >> ~/.bashrc
source ~/.bashrc
```

#### メモリとパフォーマンス設定

大規模プロジェクトや限られたリソース用：

```bash
# メモリ制限を設定
export NODE_OPTIONS="--max-old-space-size=4096"

# キャッシュディレクトリを設定
export FLUORITE_CACHE_DIR="/path/to/cache"
```

#### ログ設定

デバッグ用の詳細ログを有効化：

```bash
# デバッグログを有効化
export FLUORITE_LOG_LEVEL="debug"

# ログファイル場所を設定
export FLUORITE_LOG_FILE="/path/to/fluorite.log"
```

### 設定ファイル

`~/.fluorite-mcp.json` に設定ファイルを作成：

```json
{
  "catalogDir": "/custom/path/to/catalog",
  "cacheDir": "/custom/path/to/cache",
  "logLevel": "info",
  "maxFileSize": "10MB",
  "enableAnalysis": true,
  "enableSpikes": true,
  "analysisRules": {
    "nextjs": true,
    "react": true,
    "vue": true
  },
  "customSpecs": [
    "/path/to/custom/specs/*.yaml"
  ]
}
```

## 確認

### ステップ 1: インストールの確認

```bash
# グローバルインストールを確認
fluorite-mcp --version
# 出力例: fluorite-mcp version x.x.x

# バイナリがアクセス可能かチェック
which fluorite-mcp
# fluorite-mcp へのパスが出力されるはずです
```

### ステップ 2: MCP 接続のテスト

```bash
# すべての MCP サーバーを一覧表示
claude mcp list
# 一覧に 'fluorite' が表示されるはずです

# サーバーステータスをテスト
claude mcp status fluorite
# 'running' または 'healthy' が表示されるはずです
```

### ステップ 3: 基本機能のテスト

Claude Code を開いて以下のテストコマンドを試してください：

```
テスト1: 利用可能な仕様を一覧表示
"どのライブラリ仕様が利用可能ですか？"

テスト2: 特定の仕様にアクセス
"shadcn/ui の仕様を教えて"

テスト3: コンテキスト付きでコードを生成
"shadcn/ui を使ってボタンコンポーネントを作成"
```

### ステップ 4: 内蔵テストを実行

```bash
# 包括的な検証スクリプトを実行（推奨）
./scripts/validate-mcp-connection.sh
# 出力例: All checks passed! ✅

# または個別のテストを実行
fluorite-mcp --self-test
# 出力例: All tests passed ✅

fluorite-mcp --performance-test
# パフォーマンス指標が表示されます
```

**注意**: 検証スクリプトは、インストールの最も包括的なチェックを提供し、問題のトラブルシューティングに推奨されます。

## トラブルシューティング

### 一般的な問題

#### 1. "Command not found: fluorite-mcp"

**問題**: グローバルインストール後にバイナリが PATH にない

**解決策**:
```bash
# npm グローバル bin ディレクトリを確認
npm config get prefix
# PATH に追加（不足している場合）
export PATH="$(npm config get prefix)/bin:$PATH"

# または明示的なパスで再インストール
npm install -g fluorite-mcp --force
```

#### 2. インストール時の "Permission denied"

**問題**: グローバルインストールの権限不足

**解決策**:
```bash
# オプション1: sudo を使用（推奨されません）
sudo npm install -g fluorite-mcp

# オプション2: npm prefix を設定（推奨）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g fluorite-mcp
```

#### 3. "Module not found" エラー

**問題**: Node.js バージョンの非互換性または破損したインストール

**解決策**:
```bash
# npm キャッシュをクリア
npm cache clean --force

# 特定の Node.js バージョンで再インストール
nvm use 20
npm install -g fluorite-mcp

# または yarn を代わりに試す
yarn global add fluorite-mcp
```

#### 4. Claude Code CLI 接続の問題

**問題**: MCP サーバーが適切に接続しない

**解決策**:
```bash
# 正しいバイナリでサーバーを削除・再追加
claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp

# 現在の MCP サーバーステータスを確認
claude mcp list

# サーバー詳細を確認
claude mcp get fluorite
```

#### 5. "Wrong Binary" 接続エラー

**問題**: MCP 接続で `fluorite-mcp` の代わりに `fluorite-mcp` を使用

**重要**: `fluorite-mcp` コマンドは CLI ツールであり、`fluorite-mcp` は MCP サーバーバイナリです。Claude Code MCP 接続には常に `fluorite-mcp` を使用してください。

**解決策**:
```bash
# 間違ったバイナリを使用しているかチェック
claude mcp get fluorite
# コマンドが "fluorite-mcp" を表示する場合、削除して正しく再追加

claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp

# 接続を確認
claude mcp list
# 表示例: "fluorite: fluorite-mcp - ✓ Connected"
```

### プラットフォーム固有の問題

#### Windows (WSL2)

```bash
# 必要に応じて Windows Build Tools をインストール
npm install --global windows-build-tools

# WSL2 Ubuntu を使用
wsl --install -d Ubuntu
# その後 Linux の手順に従う
```

#### Homebrew Node.js を使用する macOS

```bash
# Homebrew Node.js を使用している場合
brew unlink node && brew link node

# 適切な権限を確保
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

#### 権限問題がある Linux

```bash
# sudo なしで npm 権限を修正
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

## 高度なセットアップ

### 開発環境セットアップ

貢献者と上級ユーザー向け：

```bash
# 開発環境をクローンしてセットアップ
# フォークまたはローカルコピーからクローン
cd fluorite-mcp

# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# テストを実行
npm test

# ビルドしてテスト
npm run build && npm run test:e2e
```

### カスタム仕様

独自のライブラリ仕様を追加：

```bash
# カスタム仕様ディレクトリを作成
mkdir ~/.fluorite-custom-specs

# 設定に追加
echo 'export FLUORITE_CUSTOM_SPECS="~/.fluorite-custom-specs"' >> ~/.bashrc

# カスタム仕様を追加（フォーマットはテンプレート作成ガイドを参照）
```

### 監視とログ

本番使用向けの監視をセットアップ：

```bash
# 包括的ログを有効化
export FLUORITE_LOG_LEVEL="debug"
export FLUORITE_LOG_FILE="~/.fluorite.log"

# パフォーマンスを監視
fluorite-mcp --server-metrics

# ログローテーションをセットアップ（オプション）
sudo apt install logrotate  # Ubuntu/Debian
# ~/.fluorite.log 用の logrotate 設定を作成
```

### パフォーマンス最適化

大規模プロジェクトやリソースに制約のある環境向け：

```bash
# メモリ割り当てを増加
export NODE_OPTIONS="--max-old-space-size=8192"

# キャッシュを有効化
export FLUORITE_ENABLE_CACHE="true"
export FLUORITE_CACHE_TTL="3600"

# 特定のフレームワーク向けに最適化
export FLUORITE_FRAMEWORK_HINT="nextjs"  # または "react", "vue"
```

## 次のステップ

インストール成功後：

1. **[はじめにガイド](./getting-started.md)** - 基本的な使用法と最初のコマンド
2. **[コマンドリファレンス](./commands.md)** - 利用可能な機能の完全一覧  
3. **[スパイクテンプレート](./spike-templates.md)** - 高速プロトタイピングを学ぶ
4. **[API ドキュメント](../API.md)** - プログラム的使用向け

## サポート

ここでカバーされていない問題に遭遇した場合：

1. **[トラブルシューティングガイド](./troubleshooting.md) を確認**
2. **イシュートラッカーを検索**
3. **ディスカッションフォーラムで質問**
4. **バグ報告**: インストール詳細と共に新しいイシューを作成

## よくある質問（FAQ）

### Q: なぜ `fluorite-mcp` の代わりに `fluorite-mcp` を使うのですか？

A: `fluorite-mcp` は CLI ツールで、`fluorite-mcp` は MCP プロトコルサーバーです。Claude Code CLI は MCP サーバーと通信するため、`fluorite-mcp` バイナリが必要です。

### Q: インストール後に機能しない場合は？

A: 以下の順序で確認してください：
1. `./scripts/validate-mcp-connection.sh` を実行
2. `claude mcp list` で fluorite が表示されるか確認
3. `fluorite-mcp --self-test` でセルフテストを実行
4. それでも問題がある場合は、トラブルシューティングセクションを参照

### Q: Node.js バージョンをアップグレードする必要がありますか？

A: 最小要件は Node.js 18.0 ですが、最適なパフォーマンスのため Node.js 20.0 LTS を推奨します。

### Q: Windows で使用できますか？

A: はい、WSL2 (Windows Subsystem for Linux 2) を使用することを強く推奨します。ネイティブ Windows サポートは限定的です。

---

*最終更新: 2025年8月15日 | バージョン 0.20.3*