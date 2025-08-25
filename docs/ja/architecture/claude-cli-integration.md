# Claude Code CLI 統合仕様

## 概要

このドキュメントは、fluorite-mcp が Claude Code CLI と統合して、既存の /sc: コマンドと並行してシームレスな /fl: コマンドを提供する方法を仕様化しています。

## 統合アーキテクチャ

```
Claude Code CLI
    ├── ~/.claude/                    # Claude 設定ディレクトリ
    │   ├── COMMANDS.md              # コマンド定義
    │   ├── FLAGS.md                 # フラグ仕様
    │   ├── PERSONAS.md              # ペルソナ設定
    │   ├── MCP.md                   # MCP サーバー設定
    │   └── fluorite/                # Fluorite 固有の設定
    │       ├── config.yaml          # Fluorite 設定
    │       ├── commands.md          # Fluorite コマンド仕様
    │       └── spikes/              # ローカルスパイクキャッシュ
    └── MCP Servers
        └── fluorite-mcp             # 当方の MCP サーバー
```

## セットアップ自動化

### 1. インストールフロー

```bash
# ユーザーが実行:
npm install -g fluorite-mcp
fluorite-mcp setup

# セットアップが実行すること:
1. Claude Code CLI インストールの検出
2. fluorite-mcp を MCP サーバーとして登録
3. fluorite コマンドを ~/.claude に注入
4. コマンドエイリアスの設定
5. スパイクテンプレートのダウンロード
6. インストールの検証
```

### 2. MCP サーバー登録

```bash
# セットアップ中に自動実行:
claude mcp add fluorite-mcp -- fluorite-mcp

# これにより ~/.claude/mcp_servers.yaml が作成/更新される:
```

```yaml
fluorite:
  command: fluorite-mcp
  args: []
  env:
    FLUORITE_HOME: ~/.fluorite
    SPIKE_CACHE: ~/.fluorite/spikes
  capabilities:
    - commands
    - tools
    - resources
  auto_start: true
```

### 3. コマンド注入

#### ~/.claude/COMMANDS.md への追加
```markdown
## Fluorite コマンド

### 開発コマンド

**`/fl:git $ARGUMENTS`**
- **目的**: スパイクテンプレート付きの拡張 git 操作
- **マッピング**: `/sc:git` にコミットメッセージ拡張を追加
- **自動ペルソナ**: DevOps, Scribe
- **MCP 統合**: fluorite, serena
- **例**: `/fl:git commit,push`

**`/fl:analyze $ARGUMENTS`**
- **目的**: fluorite 静的アナライザーによる深度コード解析
- **マッピング**: `/sc:analyze` にアーキテクチャ洞察を追加
- **自動ペルソナ**: Analyzer, Architect
- **MCP 統合**: fluorite, sequential
- **例**: `/fl:analyze --focus architecture`

**`/fl:implement $ARGUMENTS`**
- **目的**: スパイクテンプレート付きの実装
- **マッピング**: `/sc:implement` に自動ボイラープレートを追加
- **自動ペルソナ**: Frontend, Backend, Architect
- **MCP 統合**: fluorite, magic, serena
- **例**: `/fl:implement "認証付きREST API"`

**`/fl:spike $OPERATION $ARGUMENTS`**
- **目的**: スパイクテンプレート管理
- **操作**: discover, apply, create, list
- **MCP 統合**: fluorite
- **例**: `/fl:spike discover "nextjs typescript"`
```

#### ~/.claude/FLAGS.md への追加
```markdown
## Fluorite 固有フラグ

**`--spike [template]`**
- コマンド実行中にスパイクテンプレートを適用
- 自動起動: テンプレートマッチングが検出された場合
- 例: `/fl:implement --spike nextjs-api-edge`

**`--no-spike`**
- 自動スパイクテンプレート選択を無効化
- 生の SuperClaude コマンドを使用

**`--spike-cache`**
- キャッシュされたスパイクテンプレートを使用（オフラインモード）
- 90% 高速実行

**`--serena`**
- 自然言語処理のための Serena MCP を有効化
- 自動起動: 自然言語が検出された場合
```

#### ~/.claude/MCP.md への追加
```markdown
## Fluorite MCP 統合

**目的**: スパイクテンプレート、静的解析、拡張ワークフロー

**起動パターン**:
- 自動: `/fl:` コマンドが検出された場合
- 手動: `--fluorite` フラグ
- スマート: スパイクテンプレートキーワード

**機能**:
- スパイクテンプレートの発見と適用
- 静的コード解析
- エラー予測
- 依存関係分析
- 自然言語からスパイクへのマッピング

**統合コマンド**:
- `/fl:spike` - スパイクテンプレート操作
- `/fl:analyze` - 拡張解析
- `/fl:implement` - テンプレート駆動実装
```

### 4. 設定ファイル

#### ~/.claude/fluorite/config.yaml
```yaml
version: 1.0.0
claude_version: 1.x.x
enabled: true

# コマンドマッピング
commands:
  prefix: "/fl:"
  mappings:
    - fluorite: "git"
      superclaude: "/sc:git"
      enhanced: true
    - fluorite: "analyze"
      superclaude: "/sc:analyze"
      enhanced: true
    - fluorite: "implement"
      superclaude: "/sc:implement"
      enhanced: true

# スパイクテンプレート
spikes:
  cache_dir: ~/.fluorite/spikes
  auto_update: true
  # index_url: configuration will be added when API is available
  
# Serena MCP 統合
serena:
  enabled: true
  endpoint: serena-mcp
  fallback: true

# パフォーマンス
optimization:
  cache_enabled: true
  cache_ttl: 3600
  compression: true
  token_limit: 100000
  
# テレメトリ
telemetry:
  enabled: false
  anonymous: true
```

### 5. コマンドエイリアスシステム

#### ~/.claude/fluorite/aliases.sh
```bash
# Fluorite コマンドエイリアス
alias fl="claude --fluorite"
alias fls="claude /fl:spike"
alias fla="claude /fl:analyze"
alias fli="claude /fl:implement"
alias flg="claude /fl:git"

# ワークフローエイリアス
alias fldev="claude /fl:implement && /fl:test && /fl:git commit"
alias flapi="claude /fl:spike apply fastapi-minimal && /fl:implement"
```

## ランタイム統合

### 1. コマンドインターセプト

```typescript
// Fluorite MCP サーバーがコマンドをインターセプト
export class CommandInterceptor {
  async intercept(command: string): Promise<InterceptResult> {
    if (command.startsWith('/fl:')) {
      return this.handleFluoriteCommand(command);
    }
    return { passthrough: true };
  }
  
  async handleFluoriteCommand(command: string): Promise<InterceptResult> {
    // コマンドの解析
    const parsed = this.parser.parse(command);
    
    // 拡張の適用
    const enhanced = await this.enhance(parsed);
    
    // SuperClaude へのマッピング
    const mapped = this.mapToSuperClaude(enhanced);
    
    // 監視付きで実行
    return this.execute(mapped);
  }
}
```

### 2. コンテキスト共有

```typescript
// fluorite と Claude 間でコンテキストを共有
export class ContextManager {
  async getContext(): Promise<Context> {
    return {
      project: await this.detectProject(),
      history: await this.getCommandHistory(),
      spikes: await this.getUsedSpikes(),
      preferences: await this.getUserPreferences()
    };
  }
  
  async persistContext(context: Context): Promise<void> {
    // ~/.claude/fluorite/context.json に保存
    await fs.writeJson(this.contextPath, context);
  }
}
```

### 3. ツール登録

```typescript
// fluorite ツールを Claude に登録
export class ToolRegistry {
  async registerTools(): Promise<void> {
    await this.server.registerTool('spike-discover', {
      description: 'スパイクテンプレートの発見',
      inputSchema: { query: z.string() },
      handler: this.handleSpikeDiscover
    });
    
    await this.server.registerTool('spike-apply', {
      description: 'スパイクテンプレートの適用',
      inputSchema: { template: z.string(), params: z.object({}) },
      handler: this.handleSpikeApply
    });
    
    // その他のツール...
  }
}
```

## 検証と確認

### 1. インストール検証

```bash
fluorite-mcp verify

# チェック項目:
✓ Claude Code CLI がインストール済み
✓ Fluorite MCP サーバーが登録済み
✓ ~/.claude でコマンドが利用可能
✓ スパイクテンプレートがキャッシュ済み
✓ Serena MCP が接続済み
✓ テストコマンド実行
```

### 2. コマンドテスト

```bash
# fluorite コマンドのテスト
fluorite-mcp test-commands

# 実行内容:
- /fl:spike list
- /fl:analyze --test
- /fl:implement --dry-run
- /fl:git --version
```

### 3. 統合ヘルスチェック

```typescript
// ヘルスチェックエンドポイント
export class HealthCheck {
  async check(): Promise<HealthStatus> {
    return {
      claude_cli: await this.checkClaudeCLI(),
      mcp_server: await this.checkMCPServer(),
      spike_cache: await this.checkSpikeCache(),
      serena: await this.checkSerena(),
      commands: await this.checkCommands()
    };
  }
}
```

## トラブルシューティング

### よくある問題と解決策

| 問題 | 解決策 |
|-------|----------|
| コマンドが認識されない | `fluorite-mcp setup --repair` を実行 |
| MCP サーバーが起動しない | `claude mcp list` を確認して再起動 |
| スパイクが読み込まれない | キャッシュをクリア: `fluorite-mcp cache clear` |
| Serena 接続失敗 | 直接 SuperClaude にフォールバック |
| 権限拒否 | ~/.claude の権限を確認 |

### デバッグモード

```bash
# デバッグログを有効化
export FLUORITE_DEBUG=true
export CLAUDE_DEBUG=true

# ログを表示
tail -f ~/.claude/logs/fluorite.log
```

### 復旧コマンド

```bash
# インストールの修復
fluorite-mcp setup --repair

# 設定のリセット
fluorite-mcp config --reset

# 全キャッシュをクリア
fluorite-mcp cache --clear-all

# 完全アンインストール
fluorite-mcp uninstall
```

## 更新とメンテナンス

### 自動更新システム

```yaml
# ~/.claude/fluorite/config.yaml
updates:
  auto_check: true
  auto_install: false
  channel: stable  # stable, beta, nightly
  check_interval: 86400  # 24時間
```

### 手動更新

```bash
# 更新をチェック
fluorite-mcp update --check

# 最新版に更新
fluorite-mcp update

# スパイクテンプレートを更新
fluorite-mcp spike update
```

## セキュリティ考慮事項

### 1. 権限モデル
- Claude 設定への読み取り専用アクセス
- ~/.fluorite/ への書き込みアクセスのみ
- ユーザー確認なしでの実行なし

### 2. スパイクテンプレートセキュリティ
- テンプレートはサンドボックス化
- 任意のコード実行なし
- 適用前に検証

### 3. API キー管理
- Serena API キーは暗号化
- システムキーチェーンに保存
- ログ記録や送信なし

## パフォーマンス指標

### 目標指標
- セットアップ時間: < 60秒
- コマンドオーバーヘッド: < 100ms
- スパイク適用: < 2秒
- キャッシュヒット率: > 80%
- トークン削減: 30-50%