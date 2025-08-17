# トラブルシューティングガイド

Fluorite MCP の一般的な問題と解決方法をまとめたガイドです。

## 🚨 よくある問題

### インストール関連

#### 問題: NPMインストールエラー
```bash
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
```

**解決方法**:
```bash
# Node Version Managerを使用
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
nvm use node

# または権限修正
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### 問題: Claude MCP追加エラー
```bash
Error: Failed to add MCP server
```

**解決方法**:
```bash
# Claude CLIの更新
claude --version
# 最新版でない場合は更新

# MCP設定の確認
claude mcp list
claude mcp remove fluorite  # 既存設定削除
claude mcp add fluorite -- fluorite-mcp-server  # 再追加
```

### 実行時エラー

#### 問題: "spec not found" エラー
```
Error: Library specification not found: <library-name>
```

**解決方法**:
1. **キャッシュクリア**:
   ```bash
   fluorite-mcp --clear-cache
   ```

2. **利用可能な仕様確認**:
   ```bash
   fluorite-mcp --list-specs
   ```

3. **手動更新**:
   ```bash
   fluorite-mcp --update-specs
   ```

#### 問題: パフォーマンス低下
```
Warning: Response time > 5000ms
```

**解決方法**:
1. **ログレベル調整**:
   ```bash
   export FLUORITE_LOG_LEVEL=warn
   ```

2. **キャッシュ最適化**:
   ```bash
   fluorite-mcp --optimize-cache
   ```

3. **並列処理制限**:
   ```bash
   export FLUORITE_MAX_CONCURRENT=2
   ```

## 🔧 設定問題

### 環境変数設定

#### 必要な環境変数
```bash
# ~/.bashrc または ~/.zshrc
export FLUORITE_HOME="$HOME/.fluorite"
export FLUORITE_LOG_LEVEL="info"
export FLUORITE_CACHE_SIZE="100MB"
export FLUORITE_MAX_CONCURRENT="3"
```

#### 設定ファイル (`~/.fluorite/config.yaml`)
```yaml
server:
  port: 3000
  host: "localhost"
  
cache:
  size: "100MB"
  ttl: 3600
  
logging:
  level: "info"
  file: "~/.fluorite/logs/fluorite.log"
  
performance:
  max_concurrent: 3
  timeout: 30000
```

### Claude CLI連携

#### MCP設定確認
```bash
# MCP設定ファイルの場所
cat ~/.claude/mcp_settings.json

# 期待される設定
{
  "mcpServers": {
    "fluorite": {
      "command": "fluorite-mcp-server",
      "args": []
    }
  }
}
```

## 🐛 デバッグ方法

### ログ確認

#### デバッグモード有効化
```bash
export FLUORITE_DEBUG=true
export FLUORITE_LOG_LEVEL=debug
```

#### ログファイル確認
```bash
# 最新ログ表示
tail -f ~/.fluorite/logs/fluorite.log

# エラーログのみ
grep "ERROR" ~/.fluorite/logs/fluorite.log

# 詳細ログ
fluorite-mcp --debug --verbose
```

### 診断コマンド

#### セルフテスト実行
```bash
fluorite-mcp --self-test
```

期待される出力:
```
✅ NPM package installation
✅ MCP server connection
✅ Specification loading
✅ Cache functionality
✅ Claude CLI integration
```

#### システム情報収集
```bash
fluorite-mcp --system-info
```

## 📊 パフォーマンス最適化

### メモリ使用量削減

#### キャッシュサイズ調整
```bash
# 設定ファイル編集
vim ~/.fluorite/config.yaml

# cache.size を調整
cache:
  size: "50MB"  # デフォルト: 100MB
```

#### 不要なキャッシュ削除
```bash
fluorite-mcp --clean-cache --older-than=7d
```

### レスポンス時間改善

#### 並列処理最適化
```yaml
# config.yaml
performance:
  max_concurrent: 2  # CPUコア数に応じて調整
  batch_size: 10
  timeout: 15000
```

#### プリロード設定
```yaml
preload:
  specifications:
    - "react"
    - "next.js"
    - "typescript"
  templates:
    - "frontend-starter"
    - "api-template"
```

## 🔍 トラブルシューティング手順

### 基本診断フロー

1. **症状の確認**
   - エラーメッセージの収集
   - 発生タイミングの特定
   - 影響範囲の確認

2. **環境チェック**
   ```bash
   node --version  # v18.0.0以上
   npm --version   # v8.0.0以上
   claude --version  # 最新版
   fluorite-mcp --version
   ```

3. **基本的な修復**
   ```bash
   # キャッシュクリア
   fluorite-mcp --clear-cache
   
   # 設定リセット
   fluorite-mcp --reset-config
   
   # 再インストール
   npm uninstall -g fluorite-mcp
   npm install -g fluorite-mcp
   ```

4. **詳細診断**
   ```bash
   # デバッグ情報収集
   fluorite-mcp --debug --output=debug.log
   
   # システム情報出力
   fluorite-mcp --system-info > system.txt
   ```

### 高度なトラブルシューティング

#### ネットワーク問題
```bash
# 接続テスト
curl -I https://api.fluorite-mcp.com/health

# プロキシ設定確認
echo $HTTP_PROXY
echo $HTTPS_PROXY

# DNS設定確認
nslookup api.fluorite-mcp.com
```

#### ファイルシステム問題
```bash
# 権限確認
ls -la ~/.fluorite/

# ディスク容量確認
df -h ~/.fluorite/

# 権限修正
chmod -R 755 ~/.fluorite/
```

## 📞 サポート情報

### コミュニティサポート

1. **GitHub Discussions**: 一般的な質問と議論
   - URL: https://github.com/kotsutsumi/fluorite-mcp/discussions

2. **GitHub Issues**: バグ報告と機能リクエスト
   - URL: https://github.com/kotsutsumi/fluorite-mcp/issues

3. **ドキュメント**: 包括的なガイド
   - URL: https://kotsutsumi.github.io/fluorite-mcp

### バグ報告時の情報

問題報告時は以下の情報を含めてください:

```markdown
## 環境情報
- OS: macOS 14.1
- Node.js: v20.8.0
- NPM: v10.1.0
- Claude CLI: v1.2.0
- Fluorite MCP: v0.12.1

## 問題の詳細
- 発生したエラー: [エラーメッセージ]
- 再現手順: [手順を詳細に]
- 期待される動作: [何が起こるべきか]
- 実際の動作: [実際に何が起こったか]

## ログ情報
```
[デバッグログを貼り付け]
```

## システム情報
```
[fluorite-mcp --system-info の出力]
```
```

### エスカレーション手順

1. **セルフサービス**: このガイドとドキュメント確認
2. **コミュニティ**: GitHub Discussionsで質問
3. **バグ報告**: GitHub Issuesで報告
4. **緊急時**: メンテナと直接連絡

## 🔄 定期メンテナンス

### 推奨メンテナンスタスク

#### 週次
```bash
# キャッシュ最適化
fluorite-mcp --optimize-cache

# ログローテーション
fluorite-mcp --rotate-logs
```

#### 月次
```bash
# 古いキャッシュ削除
fluorite-mcp --clean-cache --older-than=30d

# システムヘルスチェック
fluorite-mcp --health-check --full
```

#### 四半期
```bash
# 完全リセットと再設定
fluorite-mcp --factory-reset
# 設定の再適用が必要
```

---

**問題が解決しない場合**: [GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues) で詳細なバグ報告をお願いします。