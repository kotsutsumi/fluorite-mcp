# トラブルシューティングガイド

Fluorite MCPの一般的な問題、解決方法、デバッグ技術について説明します。

## 📖 目次

- [インストールの問題](#インストールの問題)
- [接続の問題](#接続の問題)
- [パフォーマンスの問題](#パフォーマンスの問題)
- [静的解析の問題](#静的解析の問題)
- [スパイクテンプレートの問題](#スパイクテンプレートの問題)
- [リソースとメモリの問題](#リソースとメモリの問題)
- [デバッグ技術](#デバッグ技術)
- [エラーリファレンス](#エラーリファレンス)

## インストールの問題

### "Command not found: fluorite-mcp"

**症状**: インストール後にCLIコマンドが認識されない

**原因**: バイナリがPATHにない、権限問題、npm設定の問題

**解決方法**:

```bash
# パッケージがインストールされているか確認
npm list -g fluorite-mcp

# npmのグローバルbinディレクトリを確認
npm config get prefix

# パッケージを再インストール
npm uninstall -g fluorite-mcp
npm install -g fluorite-mcp

# バイナリパスを確認
which fluorite-mcp-server
```

**追加の解決策**:
- `sudo npm install -g fluorite-mcp`（macOS/Linux）
- Node.jsを再インストール
- npmキャッシュをクリア: `npm cache clean --force`

### Claude Code CLIとの接続失敗

**症状**: `claude mcp add`が失敗する

**原因**: Claude Code CLIが正しく設定されていない、権限問題

**解決方法**:

```bash
# Claude Code CLIのステータス確認
claude --version

# MCPサーバーリストを確認
claude mcp list

# 手動でMCPサーバーを追加
claude mcp add fluorite -- fluorite-mcp-server

# 設定ファイルの場所を確認
claude mcp config
```

### npm権限エラー

**症状**: `EACCES: permission denied`エラー

**解決方法**:

```bash
# npmのグローバルディレクトリを変更（推奨）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# または sudo を使用（非推奨）
sudo npm install -g fluorite-mcp
```

## 接続の問題

### MCP接続タイムアウト

**症状**: Claude Code CLIでfluorite MCPサーバーに接続できない

**原因**: ネットワーク問題、ファイアウォール、サーバー起動失敗

**診断コマンド**:

```bash
# サーバーを直接テスト
fluorite-mcp-server --help

# セルフテストを実行
fluorite-mcp-server self-test

# プロセスを確認
ps aux | grep fluorite

# ポート使用状況を確認
lsof -i :8080
```

**解決方法**:
1. サーバーを手動で再起動
2. ファイアウォール設定を確認
3. ウイルス対策ソフトウェアの例外設定
4. Claude Code CLIの設定を再読み込み

### プロトコルバージョンの不一致

**症状**: `Protocol version mismatch`エラー

**解決方法**:

```bash
# 両方のパッケージを最新版に更新
npm update -g fluorite-mcp
npm update -g claude

# キャッシュをクリア
npm cache clean --force

# 再起動
claude mcp restart fluorite
```

## パフォーマンスの問題

### 高いメモリ使用率

**症状**: システムが遅くなる、メモリ使用量が高い

**診断**:

```bash
# メモリ使用量を監視
top | grep fluorite
htop

# Nodeプロセスのメモリ
ps aux | grep node | grep fluorite
```

**解決方法**:

```bash
# メモリ制限を設定
export NODE_OPTIONS="--max-old-space-size=4096"

# キャッシュをクリア
rm -rf ~/.cache/fluorite-mcp

# サーバーを再起動
claude mcp restart fluorite
```

### 応答が遅い

**症状**: 応答時間が30秒以上

**最適化方法**:

1. **カタログキャッシュを有効化**:
   ```bash
   export FLUORITE_CACHE_ENABLED=true
   export FLUORITE_CACHE_TTL=3600
   ```

2. **並列処理を調整**:
   ```bash
   export FLUORITE_MAX_PARALLEL=2
   ```

3. **ログレベルを下げる**:
   ```bash
   export FLUORITE_LOG_LEVEL=warn
   ```

## 静的解析の問題

### TypeScript解析エラー

**症状**: TypeScriptファイルの解析が失敗する

**解決方法**:

```bash
# TypeScript設定を確認
cat tsconfig.json

# 依存関係を確認
npm list typescript

# TypeScriptを最新版に更新
npm update typescript
```

### 大きなプロジェクトでの解析失敗

**症状**: メモリ不足、タイムアウト

**最適化**:

```bash
# 解析範囲を制限
export FLUORITE_ANALYSIS_MAX_FILES=100

# タイムアウトを延長
export FLUORITE_ANALYSIS_TIMEOUT=60000

# 除外パターンを設定
export FLUORITE_EXCLUDE_PATTERNS="node_modules,dist,build"
```

## スパイクテンプレートの問題

### テンプレート生成エラー

**症状**: スパイクテンプレートの適用が失敗する

**診断**:

```bash
# 利用可能なテンプレートを確認
fluorite-mcp-server discover-spikes

# 特定のテンプレートをテスト
fluorite-mcp-server preview-spike react-minimal

# カタログ統計を確認
fluorite-mcp-server catalog-stats
```

**解決方法**:
1. テンプレート名のスペルを確認
2. 必要な依存関係をインストール
3. プロジェクト構造を確認
4. 権限問題を解決

### カスタムテンプレートが見つからない

**症状**: 独自のテンプレートが認識されない

**解決方法**:

```bash
# カタログディレクトリを確認
echo $FLUORITE_CATALOG_DIR

# テンプレートファイルの形式を確認
cat your-template.json

# テンプレートを手動で追加
fluorite-mcp-server upsert-spec your-template
```

## リソースとメモリの問題

### システムリソース不足

**症状**: `ENOMEM`、`EMFILE`エラー

**監視コマンド**:

```bash
# ディスク使用量
df -h

# メモリ使用量
free -h

# ファイルハンドル制限
ulimit -n

# プロセス制限
ulimit -u
```

**解決方法**:

```bash
# ファイルハンドル制限を増加
ulimit -n 4096

# プロセス制限を増加
ulimit -u 2048

# 一時ファイルをクリア
rm -rf /tmp/fluorite-*

# システムリソースを解放
sudo sync && sudo purge  # macOS
sudo sync && echo 3 > /proc/sys/vm/drop_caches  # Linux
```

## デバッグ技術

### ログレベルの調整

```bash
# デバッグモードを有効化
export FLUORITE_LOG_LEVEL=debug
export FLUORITE_DEBUG=true

# 詳細ログを表示
claude mcp logs fluorite

# ログファイルの場所
ls ~/.claude/logs/
```

### 詳細診断

```bash
# 環境情報を収集
fluorite-mcp-server server-metrics

# パフォーマンステスト
fluorite-mcp-server performance-test

# 設定を表示
env | grep FLUORITE
```

### トレーシング

```bash
# MCPメッセージをトレース
export FLUORITE_TRACE_MCP=true

# パフォーマンスをトレース
export FLUORITE_TRACE_PERFORMANCE=true

# ネットワークをトレース
export FLUORITE_TRACE_NETWORK=true
```

## エラーリファレンス

### 一般的なエラーコード

| エラーコード | 説明 | 解決方法 |
|-------------|------|----------|
| `ECONNREFUSED` | 接続拒否 | サーバーの起動状態を確認 |
| `ETIMEDOUT` | タイムアウト | ネットワーク接続とファイアウォールを確認 |
| `EACCES` | アクセス拒否 | ファイル権限を確認 |
| `ENOENT` | ファイルが見つからない | パスとファイル名を確認 |
| `ENOMEM` | メモリ不足 | システムリソースを確認 |

### Fluorite固有のエラー

**`CatalogNotFoundError`**
- 原因: カタログディレクトリが見つからない
- 解決: `FLUORITE_CATALOG_DIR`環境変数を設定

**`TemplateValidationError`**
- 原因: テンプレート形式が無効
- 解決: JSONスキーマを確認、必須フィールドを追加

**`AnalysisTimeoutError`**
- 原因: 静的解析がタイムアウト
- 解決: タイムアウト値を増加、ファイル数を制限

### パフォーマンス指標

**正常な動作範囲**:
- 応答時間: < 5秒
- メモリ使用量: < 500MB
- CPU使用率: < 30%
- ファイルハンドル: < 1000

**警告レベル**:
- 応答時間: 5-15秒
- メモリ使用量: 500MB-1GB
- CPU使用率: 30-70%

**緊急レベル**:
- 応答時間: > 15秒
- メモリ使用量: > 1GB
- CPU使用率: > 70%

## サポートとコミュニティ

### ヘルプの取得

1. **GitHub Issues**: [バグ報告と機能要求](https://github.com/kotsutsumi/fluorite-mcp/issues)
2. **GitHub Discussions**: [コミュニティサポート](https://github.com/kotsutsumi/fluorite-mcp/discussions)
3. **ドキュメント**: [完全なドキュメント](./README.ja.md)

### バグ報告時の情報

問題を報告する際は、以下の情報を含めてください：

```bash
# システム情報
uname -a
node --version
npm --version

# Fluorite情報
fluorite-mcp --version
claude --version

# エラーログ
claude mcp logs fluorite | tail -50

# 環境変数
env | grep FLUORITE
```

### よくある質問

**Q: インストール後にコマンドが見つからない**
A: パッケージがグローバルにインストールされ、PATHが正しく設定されているか確認してください。

**Q: パフォーマンスが遅い**
A: キャッシュを有効化し、メモリ制限を適切に設定してください。

**Q: 特定のライブラリがサポートされていない**
A: カスタムテンプレートを作成するか、機能要求を提出してください。

**Q: 大きなプロジェクトで動作しない**
A: 解析範囲を制限し、除外パターンを設定してください。

---

*その他の問題については、[GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions)でコミュニティに相談してください。*