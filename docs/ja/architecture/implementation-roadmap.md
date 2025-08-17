# Fluorite-MCP 実装ロードマップ

## フェーズ1: CLI基盤構築（第1週）

### 1.1 CLIエントリーポイント
```typescript
// src/cli/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { setupCommand } from './commands/setup.js';
import { getPackageVersion } from '../utils.js';

const program = new Command();

program
  .name('fluorite-mcp')
  .description('SuperClaude ラッパー（開発ワークフロー強化版）')
  .version(getPackageVersion());

// コマンドを登録
program.addCommand(setupCommand);

program.parse();
```

### 1.2 セットアップコマンド実装
```typescript
// src/cli/commands/setup.ts
export const setupCommand = new Command('setup')
  .description('Claude Code CLI を使って fluorite-mcp をセットアップ')
  .action(async () => {
    // 1. Claude Code CLI のインストール確認
    // 2. MCP サーバーのインストール
    // 3. ~/.claude ファイルの設定
    // 4. コマンドエイリアスのセットアップ
    // 5. スパイクテンプレートの初期化
    // 6. インストールの検証
  });
```

### 1.3 設定管理
```typescript
// src/cli/config.ts
interface FluoriteConfig {
  version: string;
  claudePath: string;
  commands: CommandMapping[];
  spikeTemplates: SpikeConfig;
  serena: SerenaConfig;
  optimization: OptimizationConfig;
}
```

## フェーズ2: コマンドラッパーシステム（第2週）

### 2.1 コマンドパーサー
```typescript
// src/cli/parser/command-parser.ts
export class CommandParser {
  parse(input: string): ParsedCommand {
    // /fl:command 構文の解析
    // コマンド、引数、フラグの抽出
    // SuperClaude 同等コマンドにマッピング
  }
}
```

### 2.2 SuperClaude コマンドマッピング
```typescript
// src/cli/integration/command-mappings.ts
export const COMMAND_MAPPINGS = {
  '/fl:git': {
    superclaude: '/sc:git',
    enhancers: ['git-workflow-spike', 'commit-message-optimizer'],
    serena: true
  },
  '/fl:analyze': {
    superclaude: '/sc:analyze',
    enhancers: ['architecture-analyzer', 'code-quality-checker'],
    serena: true
  },
  // ... その他のマッピング
};
```

### 2.3 コマンド実行パイプライン
```typescript
// src/cli/executor.ts
export class CommandExecutor {
  async execute(command: ParsedCommand): Promise<Result> {
    // 1. スパイクテンプレートでの前処理
    // 2. Serena が有効な場合の拡張処理
    // 3. SuperClaude コマンドの実行
    // 4. 結果の後処理
    // 5. トークン最適化のためのキャッシュ
  }
}
```

## フェーズ3: Serena MCP 統合（第3週）

### 3.1 Serena クライアント
```typescript
// src/cli/integration/serena-mcp.ts
export class SerenaMCPClient {
  async enhance(command: string): Promise<EnhancedCommand> {
    // Serena MCP への接続
    // 自然言語の処理
    // 拡張されたコマンドの返却
  }
}
```

### 3.2 自然言語処理
```typescript
// src/cli/nlp/processor.ts
export class NLPProcessor {
  async process(input: string): Promise<ProcessedInput> {
    // 自然言語の解析
    // 意図とエンティティの抽出
    // スパイクテンプレートへのマッピング
  }
}
```

## フェーズ4: スパイクテンプレートシステム（第4週）

### 4.1 テンプレートマネージャー
```typescript
// src/cli/templates/manager.ts
export class TemplateManager {
  async loadTemplates(): Promise<Template[]> {
    // ローカル spikes ディレクトリからの読み込み
    // 高速検索のためのインデックス作成
    // メモリへのキャッシュ
  }
  
  async apply(template: string, params: any): Promise<string> {
    // テンプレートの読み込み
    // パラメータの適用
    // 生成されたコードの返却
  }
}
```

### 4.2 テンプレート発見
```typescript
// src/cli/templates/discovery.ts
export class TemplateDiscovery {
  async discover(query: string): Promise<Template[]> {
    // テンプレートの検索
    // 関連性によるランキング
    // 上位マッチの返却
  }
}
```

## フェーズ5: トークン最適化（第5週）

### 5.1 キャッシュシステム
```typescript
// src/cli/cache/manager.ts
export class CacheManager {
  async get(key: string): Promise<CachedResult | null> {
    // キャッシュの確認
    // TTL の検証
    // 有効な場合の返却
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    // キャッシュへの保存
    // 有効期限の設定
  }
}
```

### 5.2 トークンカウンター
```typescript
// src/cli/optimization/token-counter.ts
export class TokenCounter {
  count(text: string): number {
    // トークンの計数
    // 使用量の追跡
    // 制限値での警告
  }
}
```

## 実装スケジュール

### 第1週: CLI基盤
- [ ] CLI構造の作成
- [ ] セットアップコマンドの実装
- [ ] バージョン管理の追加
- [ ] 設定スキーマの作成

### 第2週: コマンドラッパー
- [ ] コマンドパーサーの構築
- [ ] コマンドマッピングの作成
- [ ] 実行パイプラインの実装
- [ ] エラーハンドリングの追加

### 第3週: Serena 統合
- [ ] Serena MCP クライアントのセットアップ
- [ ] NLP 処理の実装
- [ ] 自然言語コマンドの追加
- [ ] 統合テスト

### 第4週: スパイクテンプレート
- [ ] テンプレートマネージャーの作成
- [ ] 既存テンプレートのインポート
- [ ] 発見システムの構築
- [ ] テンプレート適用の追加

### 第5週: 最適化とテスト
- [ ] キャッシュの実装
- [ ] トークンカウンティングの追加
- [ ] テストスイートの作成
- [ ] パフォーマンス最適化

### 第6週: ドキュメント作成とリリース
- [ ] ユーザードキュメントの作成
- [ ] サンプルの作成
- [ ] CI/CD のセットアップ
- [ ] NPM への公開

## テスト戦略

### ユニットテスト
```typescript
// src/cli/__tests__/parser.test.ts
describe('CommandParser', () => {
  it('should parse /fl:git commands', () => {
    const result = parser.parse('/fl:git commit,push');
    expect(result.command).toBe('git');
    expect(result.args).toEqual(['commit', 'push']);
  });
});
```

### 統合テスト
```typescript
// src/cli/__tests__/integration.test.ts
describe('Fluorite CLI Integration', () => {
  it('should execute setup successfully', async () => {
    const result = await execute('fluorite-mcp setup');
    expect(result.success).toBe(true);
  });
});
```

### E2E テスト
```typescript
// src/cli/__tests__/e2e.test.ts
describe('End-to-End Workflows', () => {
  it('should complete full development cycle', async () => {
    await execute('/fl:analyze --focus architecture');
    await execute('/fl:implement --spike nextjs-api');
    await execute('/fl:test');
    await execute('/fl:git commit,push');
  });
});
```

## 成功基準

1. **セットアップ時間**: < 60秒
2. **コマンドオーバーヘッド**: < 100ms
3. **トークン削減**: 30-50%
4. **テンプレートカバレッジ**: 一般的なパターンの80%
5. **テストカバレッジ**: > 90%
6. **ユーザー採用**: 90%が /fl: コマンドを使用

## リスク軽減

| リスク | 軽減策 |
|------|------------|
| Claude CLI の変更 | バージョン検出と互換性レイヤー |
| Serena MCP が利用不可 | 直接 SuperClaude へのフォールバック |
| テンプレートの競合 | 名前空間の分離とバージョニング |
| パフォーマンス問題 | キャッシュと遅延読み込み |
| トークン制限 | 圧縮とページネーション |