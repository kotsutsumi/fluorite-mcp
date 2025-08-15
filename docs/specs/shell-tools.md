# シェル/テキスト処理/ネットワーク CLI エコシステム

`spec://shell-tools-ecosystem`

## 📋 概要

シェルスクリプト、テキスト処理、ファイル操作、システム監視、ネットワークツールの包括的なエコシステム仕様です。Unix/Linux系システムでの効率的な作業とシステム管理を支援します。

## 🏗️ 主要カテゴリ

### シェル環境
- **bash**: 最も広く利用される高機能シェル環境
- **sh (POSIX Shell)**: 標準的な最小限のシェル
- **zsh**: bash互換性と拡張機能を持つモダンシェル

### テキスト処理
- **sed**: ストリームエディタによる正規表現置換
- **awk**: パターンマッチングとデータ処理言語
- **grep/egrep/fgrep**: パターン検索とマッチング
- **cut/tr/sort/uniq**: フィールド抽出と文字変換

### ファイル操作
- **cat/head/tail**: ファイル内容表示とリアルタイム監視
- **cp/mv/rm**: ファイル・ディレクトリ操作
- **find/locate**: 高度なファイル検索システム
- **ln/touch**: リンク作成とタイムスタンプ操作

### アーカイブ・圧縮
- **tar**: アーカイブ作成と展開
- **gzip/bzip2/xz**: 各種圧縮形式対応
- **zip/unzip**: クロスプラットフォーム互換

### システム監視
- **ps/top/htop**: プロセス監視とリソース管理
- **df/du**: ディスク使用量分析
- **free/uptime**: メモリとシステム稼働状況
- **lsof/netstat**: ファイルとネットワーク接続監視

### ネットワークツール
- **curl/wget**: HTTP/FTP通信とファイル取得
- **scp/rsync**: セキュアファイル転送と同期
- **ping/traceroute**: 接続確認と経路追跡
- **dig/nslookup**: DNS査詢とドメイン解決

## 🚀 主な用途

- **システム管理**: プロセス監視、リソース管理、ログ分析
- **自動化スクリプト**: バックアップ、デプロイ、定期処理
- **データ処理**: ログ解析、テキスト変換、レポート生成
- **ネットワーク管理**: 接続診断、ファイル転送、API通信
- **開発支援**: ビルド自動化、テスト実行、環境構築

## 💡 基本パターン

### シェルスクリプト基本構造
```bash
#!/bin/bash
set -euo pipefail  # 厳格モード

# 変数と配列
name="World"
files=(*.txt)

# 関数定義
greet() {
    local user=${1:-$name}
    echo "Hello, $user!"
}

# 制御構造
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "Processing: $file"
    fi
done
```

### テキスト処理パイプライン
```bash
# ログファイルから ERROR を抽出し、集計
grep "ERROR" access.log | \
    awk '{print $1}' | \
    sort | \
    uniq -c | \
    sort -nr
```

### ファイル操作とアーカイブ
```bash
# バックアップ作成
tar -czf backup_$(date +%Y%m%d).tar.gz \
    --exclude="*.log" \
    important_directory/

# リモート同期
rsync -av --delete \
    local_dir/ \
    user@server:/backup/
```

## ⚡ 高度な機能

### bash 拡張機能
- **連想配列**: `declare -A config`
- **パラメータ展開**: `${file%.*}`, `${path##*/}`
- **プロセス置換**: `diff <(cmd1) <(cmd2)`
- **Here Document**: `<<EOF`

### zsh 強化機能
- **グロブ拡張**: `**/*.txt`, `*(.)`
- **補完システム**: `compdef`, `_describe`
- **プラグインサポート**: Oh My Zsh, Prezto

### 高度なテキスト処理
```bash
# 複雑な sed 操作
sed -e 's/old/new/g' \
    -e '/pattern/d' \
    -e '1,5s/foo/bar/' file.txt

# awk でのデータ集計
awk -F',' '
BEGIN { total=0 }
/ERROR/ { errors++; print "Line " NR ": " $0 }
{ total++ }
END { print "Errors:", errors, "Total:", total }
' logfile.csv
```

## 🔧 統合パターン

### 自動化ワークフロー
```bash
# システム監視スクリプト
#!/bin/bash

check_disk_usage() {
    df -h | awk '$5 > 80 {print "Warning: " $1 " is " $5 " full"}'
}

check_memory() {
    free | awk 'NR==2 {printf "Memory: %.1f%% used\n", $3/$2*100}'
}

monitor_logs() {
    tail -f /var/log/syslog | \
        grep -E "(ERROR|CRITICAL)" | \
        while read line; do
            echo "Alert: $line" | mail admin@example.com
        done
}
```

### データ処理パイプライン
```bash
# Webサーバーログ分析
cat access.log | \
    awk '$9 >= 400 {print $1, $7, $9}' | \
    sort | \
    uniq -c | \
    sort -nr | \
    head -20 > error_summary.txt
```

### ネットワーク診断
```bash
# 接続診断スクリプト
hosts=("google.com" "github.com" "stackoverflow.com")

for host in "${hosts[@]}"; do
    if ping -c 1 "$host" >/dev/null 2>&1; then
        echo "✅ $host: Reachable"
    else
        echo "❌ $host: Unreachable"
    fi
done
```

## 📊 パフォーマンス指標

### 実行効率
- **grep vs ripgrep**: 10-100倍の性能向上
- **find vs locate**: locate は事前インデックス化で高速
- **parallel processing**: xargs -P で並列実行

### メモリ使用量
- **stream processing**: sed/awk はメモリ効率的
- **large files**: tail -f, less で大容量ファイル対応
- **compression**: xz > bzip2 > gzip (圧縮率順)

## 🌐 対応環境

### オペレーティングシステム
- **Linux**: 全ディストリビューション対応
- **macOS**: BSD系コマンド + GNU ツール
- **BSD**: FreeBSD, OpenBSD, NetBSD
- **Windows**: WSL, Cygwin, Git Bash

### シェル環境
- **bash**: バージョン 3.0+ (macOS: 3.2, Linux: 4.0+)
- **zsh**: バージョン 5.0+ (macOS標準)
- **dash**: Debian系の /bin/sh
- **fish**: モダンシェル (別仕様)

## 📚 ベストプラクティス

### スクリプト品質
- **厳格モード**: `set -euo pipefail`
- **変数引用**: `"$var"` 形式を使用
- **shellcheck**: スクリプト検証ツール活用
- **エラーハンドリング**: 適切な例外処理実装

### セキュリティ
- **入力検証**: パラメータ検証必須
- **権限管理**: 最小権限の原則
- **パス指定**: 絶対パス使用
- **機密情報**: 環境変数やファイルで管理

### パフォーマンス
- **パイプライン効率**: 不要な処理を避ける
- **並列処理**: 適切な並列化実装
- **メモリ使用**: ストリーム処理優先
- **キャッシュ活用**: 計算結果の再利用

### 可搬性
- **POSIX準拠**: ポータブルなスクリプト作成
- **システム依存性**: 明確な要件文書化
- **バージョン互換性**: 複数環境でのテスト
- **フォールバック**: 代替手段の提供

## 🔗 関連仕様

このエコシステムは以下の仕様で利用できます：

```
spec://shell-tools-ecosystem
```

Claude Code CLI でシェルスクリプトと CLI ツールの包括的な支援を受けられます。

## 🛠️ 実践例

### 1. ログ監視と分析
```bash
#!/bin/bash
# ログ分析スクリプト

LOG_FILE="/var/log/application.log"
ALERT_EMAIL="admin@example.com"

# エラー率監視
error_rate=$(tail -1000 "$LOG_FILE" | \
    awk '/ERROR/{errors++} END{print errors/NR*100}')

if (( $(echo "$error_rate > 5" | bc -l) )); then
    echo "High error rate: $error_rate%" | mail -s "Alert" "$ALERT_EMAIL"
fi
```

### 2. システムバックアップ
```bash
#!/bin/bash
# 自動バックアップスクリプト

BACKUP_DIR="/backup"
SOURCE_DIRS=("/home" "/etc" "/var/www")
DATE=$(date +%Y%m%d_%H%M%S)

for dir in "${SOURCE_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        tar -czf "$BACKUP_DIR/$(basename "$dir")_$DATE.tar.gz" \
            --exclude="*.tmp" \
            --exclude="*.log" \
            "$dir"
        echo "Backup completed: $dir"
    fi
done
```

### 3. 開発環境セットアップ
```bash
#!/bin/bash
# 開発環境自動構築

setup_node() {
    if ! command -v node >/dev/null; then
        curl -fsSL https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz | \
            tar -xJ -C /usr/local --strip-components=1
    fi
}

setup_project() {
    local project_dir="$1"
    cd "$project_dir" || exit 1
    
    if [[ -f package.json ]]; then
        npm install
    fi
    
    if [[ -f requirements.txt ]]; then
        pip install -r requirements.txt
    fi
}

main() {
    setup_node
    setup_project "${1:-.}"
    echo "Development environment ready!"
}

main "$@"
```

