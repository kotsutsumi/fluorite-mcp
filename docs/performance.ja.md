# パフォーマンスガイド

Fluorite MCPにおけるパフォーマンスの最適化、監視、トラブルシューティングの包括的なガイドです。

## 概要

Fluorite MCPは、組み込みの監視機能、最適化機能、エンタープライズグレードのスケーラビリティを備えた高性能操作向けに設計されています。このガイドでは、パフォーマンス特性、最適化戦略、本番環境デプロイメントのベストプラクティスについて説明します。

## パフォーマンス特性

### 主要パフォーマンスメトリクス

| メトリクス | 目標値 | 優秀 | 良好 | 要注意 |
|--------|--------|-----------|------|-----------------|
| **応答時間** | <100ms | <50ms | <100ms | >200ms |
| **メモリ使用量** | <50MB | <25MB | <50MB | >100MB |
| **起動時間** | <2s | <1s | <2s | >5s |
| **スループット** | >1000 ops/min | >2000 ops/min | >1000 ops/min | <500 ops/min |
| **エラー率** | <0.1% | <0.01% | <0.1% | >1% |

### フレームワーク固有のパフォーマンス

#### 静的解析パフォーマンス
- **TypeScript解析**: ファイルあたり約50ms
- **Reactコンポーネント解析**: コンポーネントあたり約30ms
- **Next.jsルート解析**: ルートあたり約20ms
- **Vueコンポーネント解析**: コンポーネントあたり約40ms

#### カタログ操作パフォーマンス
- **スペック検索**: <10ms（キャッシュ）、<50ms（ディスク）
- **スペック書き込み**: 操作あたり約20ms
- **リスト操作**: 100未満のスペックで<30ms
- **検索操作**: 87+スペック全体で<100ms

## 組み込みパフォーマンス監視

### パフォーマンスモニター

Fluorite MCPには包括的なパフォーマンス監視システムが含まれています：

```typescript
// 自動操作タイミング
logger.time('operation-name', async () => {
  // ここに操作を記述
});

// 手動パフォーマンス記録
performanceMonitor.recordOperation('custom-op', duration);

// パフォーマンスメトリクスの取得
const metrics = performanceMonitor.getMetrics();
```

### リアルタイムメトリクス

`server-metrics`ツールを通じてリアルタイムパフォーマンスデータにアクセス：

```bash
# CLI経由
fluorite-mcp --server-metrics

# MCPプロトコル経由
{
  "method": "tools/call",
  "params": {
    "name": "server-metrics"
  }
}
```

**サンプル出力:**
```json
{
  "uptime": 3600000,
  "operationCount": 1250,
  "errorCount": 2,
  "errorRate": 0.0016,
  "memory": {
    "heapUsed": 45.2,
    "heapTotal": 67.8,
    "external": 12.3,
    "rss": 89.1
  },
  "performanceMetrics": {
    "avg": 45.2,
    "max": 180,
    "min": 12,
    "count": 1250
  }
}
```

### パフォーマンステスト

包括的なパフォーマンステストの実行：

```bash
# 組み込みパフォーマンステスト
fluorite-mcp --performance-test

# MCPプロトコル経由
{
  "method": "tools/call",
  "params": {
    "name": "performance-test"
  }
}
```

**パフォーマンステストカバレッジ:**
- カタログ操作（読み込み/書き込み/リスト）
- メモリリーク検出
- 同時操作処理
- エラー回復パフォーマンス
- 静的解析スループット

## 最適化戦略

### 1. メモリ最適化

#### メモリ使用量の監視
```typescript
// 現在のメモリ使用量を取得
const metrics = logger.getMetrics();
console.log(`メモリ使用量: ${metrics.memory.heapUsed}MB`);

// パフォーマンス閾値監視
if (metrics.memory.heapUsed > 100) {
  logger.warn('高メモリ使用量を検出', { 
    usage: metrics.memory.heapUsed 
  });
}
```

#### メモリ最適化技術
- **遅延読み込み**: スペックはオンデマンドで読み込み
- **ガベージコレクション**: 未使用リソースの自動クリーンアップ
- **ストリーム処理**: 大きなファイルをチャンク単位で処理
- **キャッシュ管理**: 頻繁にアクセスされるスペックのLRUキャッシュ

### 2. I/O最適化

#### ファイルシステム操作
```typescript
// バッチファイル操作
const batchSize = 10;
const files = await Promise.all(
  batch.map(file => readSpec(file, config))
);

// 非同期ファイル操作
const content = await fs.readFile(path, 'utf8');
```

#### キャッシュ戦略
- **インメモリキャッシュ**: 頻繁にアクセスされるスペック
- **ディスクキャッシュ**: 複雑な操作の解析済みコンテンツ
- **バージョン対応**: コンテンツ変更時のキャッシュ無効化

### 3. 静的解析最適化

#### パフォーマンス設定
```typescript
const analyzerConfig = {
  maxIssues: 100,           // 問題検出の制限
  enabledRules: ['critical'], // 重要なルールに集中
  strictMode: false,        // 処理オーバーヘッドの削減
  targetFiles: ['src/**']   // 解析範囲の制限
};
```

#### フレームワーク固有の最適化
- **React**: コンポーネントレベルの解析キャッシュ
- **Next.js**: ルートベースの最適化
- **TypeScript**: 増分型チェック
- **Vue**: テンプレートコンパイルキャッシュ

### 4. 同時操作

#### 接続プール管理
```typescript
// 同時操作の設定
const config = {
  maxConcurrentOperations: 10,
  operationTimeout: 30000,
  retryAttempts: 3
};
```

#### 負荷分散
- **操作キューイング**: 同時リクエストの管理
- **リソース割り当て**: 動的リソース配布
- **段階的劣化**: 負荷時のフォールバック戦略

## 本番環境デプロイメント

### リソース要件

#### 最小システム要件
- **Node.js**: 18.0+（20.0+推奨）
- **メモリ**: 最小512MB RAM、推奨1GB
- **CPU**: 最小1コア、推奨2+コア
- **ディスク**: インストール用100MB、キャッシュ用500MB
- **ネットワーク**: ライブラリ検索用の安定したインターネット

#### スケーリングガイドライン

| デプロイメント規模 | メモリ | CPU | 同時ユーザー数 | スペック数 |
|----------------|--------|-----|------------------|-------|
| **小規模** | 1GB | 2コア | <50 | <100 |
| **中規模** | 2GB | 4コア | <200 | <500 |
| **大規模** | 4GB | 8コア | <1000 | <1000 |
| **エンタープライズ** | 8GB+ | 16+コア | >1000 | >1000 |

### 環境設定

#### パフォーマンス環境変数
```bash
# ログ設定
FLUORITE_LOG_LEVEL=info           # ログ詳細度の削減
FLUORITE_LOG_FORMAT=json          # 構造化ログ
FLUORITE_LOG_DISABLE=false        # ログ有効化

# パフォーマンス調整
NODE_OPTIONS="--max-old-space-size=4096"  # メモリ制限
UV_THREADPOOL_SIZE=16              # I/Oスレッドプールサイズ

# キャッシュ設定
FLUORITE_CATALOG_DIR=/fast/storage # カタログ用にSSD使用
```

#### 本番環境最適化
```bash
# 本番環境最適化を有効化
NODE_ENV=production

# デバッグ機能を無効化
DEBUG=

# プロセス管理を設定
pm2 start fluorite-mcp --instances 4 --max-memory-restart 1G
```

### 負荷テスト

#### ベンチマークスクリプト
```bash
#!/bin/bash
# performance-benchmark.sh

echo "🚀 Fluorite MCPパフォーマンスベンチマーク開始"

# ウォームアップ
for i in {1..10}; do
  fluorite-mcp list-specs >/dev/null 2>&1
done

# スループットテスト
start_time=$(date +%s%N)
for i in {1..100}; do
  fluorite-mcp list-specs >/dev/null 2>&1 &
done
wait
end_time=$(date +%s%N)

duration=$((($end_time - $start_time) / 1000000))
throughput=$((100 * 1000 / $duration))

echo "✅ 100操作を${duration}msで完了"
echo "📊 スループット: ${throughput} ops/second"
```

#### ストレステスト
```typescript
// stress-test.ts
import { performance } from 'perf_hooks';

async function stressTest() {
  const operations = 1000;
  const concurrency = 50;
  
  const start = performance.now();
  
  // 同時操作の実行
  const promises = Array.from({ length: operations }, (_, i) => 
    runOperation(i % concurrency)
  );
  
  const results = await Promise.allSettled(promises);
  const end = performance.now();
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log({
    operations,
    duration: end - start,
    successful,
    failed,
    throughput: operations / ((end - start) / 1000)
  });
}
```

## 監視と可観測性

### 構造化ログ

#### ログレベルとパフォーマンス影響
| レベル | 影響 | 用途 | パフォーマンスコスト |
|-------|--------|----------|------------------|
| `trace` | 最小 | 開発デバッグ | 高 |
| `debug` | 低 | 開発/ステージング | 中 |
| `info` | 最小 | 本番監視 | 低 |
| `warn` | なし | 本番アラート | なし |
| `error` | なし | エラー追跡 | なし |

#### パフォーマンス重視のログ
```typescript
// 効率的なログパターン
logger.info('操作完了', {
  operation: 'read-spec',
  duration: 45,
  packageName: pkg,
  performanceMetrics: {
    memoryUsage: process.memoryUsage(),
    responseTime: duration
  }
});
```

### ヘルスチェック

#### 組み込みヘルス監視
```bash
# クイックヘルスチェック
fluorite-mcp --self-test

# 包括的監視
fluorite-mcp --server-metrics
```

#### カスタムヘルスチェック
```typescript
// health-check.ts
export async function healthCheck() {
  const start = performance.now();
  
  try {
    // 基本操作のテスト
    await listSpecs();
    const testResult = await runSelfTest();
    const metrics = await getServerMetrics();
    
    const duration = performance.now() - start;
    
    return {
      status: 'healthy',
      duration,
      metrics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### アラート

#### パフォーマンスアラート
```yaml
# alerts.yml
alerts:
  - name: "高メモリ使用量"
    condition: "memory.heapUsed > 100"
    severity: "警告"
    action: "再起動"
  
  - name: "高エラー率"
    condition: "errorRate > 0.05"
    severity: "重大"
    action: "調査"
  
  - name: "応答時間低下"
    condition: "avg_response_time > 200"
    severity: "警告"
    action: "最適化"
```

## パフォーマンス問題のトラブルシューティング

### 一般的なパフォーマンス問題

#### 1. 高メモリ使用量
**症状:**
- メモリ使用量>100MB
- 時間の経過と共にメモリが漸増
- OutOfMemoryエラー

**診断:**
```bash
# メモリ使用量の確認
fluorite-mcp --server-metrics | grep memory

# 時間経過での監視
watch -n 5 'fluorite-mcp --server-metrics'
```

**解決策:**
- 定期的なサービス再起動
- 同時操作数の削減
- キャッシュの定期的なクリア
- メモリ割り当ての増加

#### 2. 応答時間の低下
**症状:**
- 応答時間>200ms
- クライアントタイムアウト
- スループットの低下

**診断:**
```bash
# パフォーマンステスト
fluorite-mcp --performance-test

# 特定操作の確認
time fluorite-mcp list-specs
```

**解決策:**
- キャッシュの有効化
- ファイルI/Oの最適化
- 解析範囲の削減
- SSDストレージの使用

#### 3. 高エラー率
**症状:**
- エラー率>1%
- 頻繁な操作失敗
- 一貫性のない動作

**診断:**
```bash
# エラーパターンの確認
grep -i error /var/log/fluorite-mcp.log

# 診断実行
fluorite-mcp --self-test
```

**解決策:**
- ファイル権限の修正
- ディスク容量の確保
- 依存関係の更新
- サービス再起動

### パフォーマンスデバッグ

#### デバッグログの有効化
```bash
# 詳細パフォーマンスログの有効化
FLUORITE_LOG_LEVEL=debug fluorite-mcp
DEBUG=fluorite-mcp* fluorite-mcp

# パフォーマンス固有のデバッグ
DEBUG=fluorite-mcp:performance fluorite-mcp
```

#### プロファイリングツール
```bash
# Node.jsプロファイリング
node --prof dist/mcp-server.js

# メモリプロファイリング
node --inspect dist/mcp-server.js

# CPUプロファイリング
node --cpu-prof dist/mcp-server.js
```

### パフォーマンス最適化チェックリスト

#### デプロイメント前
- [ ] パフォーマンステストの実行
- [ ] 適切なメモリ制限の設定
- [ ] 監視とアラートの設定
- [ ] 環境変数の最適化
- [ ] 負荷テストの実施

#### ランタイム監視
- [ ] メモリ使用量傾向の監視
- [ ] 応答時間パーセンタイルの追跡
- [ ] エラー率の監視
- [ ] ディスク使用量の確認
- [ ] ログローテーションの確認

#### 定期保守
- [ ] 週次パフォーマンスメトリクスレビュー
- [ ] 古いキャッシュファイルのクリーンアップ
- [ ] 最新バージョンへの更新
- [ ] 高メモリ使用時のサービス再起動
- [ ] 静的解析ルールのレビューと最適化

## 高度なパフォーマンス機能

### インテリジェントキャッシュ

#### 多層キャッシュ戦略
```typescript
// L1: インメモリキャッシュ（ホットデータ）
const memoryCache = new Map<string, CacheEntry>();

// L2: ディスクキャッシュ（ウォームデータ）
const diskCache = path.join(config.baseDir, '.cache');

// L3: ネットワークキャッシュ（コールドデータ）
const networkCache = '/api/cache'; // ローカルキャッシュエンドポイント
```

#### キャッシュ設定
```typescript
const cacheConfig = {
  maxMemoryEntries: 1000,
  maxDiskSize: '100MB',
  ttl: 3600, // 1時間
  compressionLevel: 6
};
```

### バッチ処理

#### 最適化されたバッチ操作
```typescript
// 複数スペックの効率的処理
async function batchProcessSpecs(packages: string[]) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(pkg => processSpec(pkg))
    );
    results.push(...batchResults);
    
    // イベントループに制御を譲る
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
}
```

### リソースプール管理

#### 接続プール
```typescript
class ResourcePool {
  private resources: Resource[] = [];
  private maxSize = 10;
  private currentSize = 0;
  
  async acquire(): Promise<Resource> {
    if (this.resources.length > 0) {
      return this.resources.pop()!;
    }
    
    if (this.currentSize < this.maxSize) {
      this.currentSize++;
      return this.createResource();
    }
    
    // リソースが利用可能になるまで待機
    return this.waitForResource();
  }
  
  release(resource: Resource): void {
    this.resources.push(resource);
  }
}
```

## ベストプラクティス概要

### 開発
- 初日からパフォーマンス監視を使用
- 開発中の定期的プロファイリング
- 現実的なデータサイズでのテスト
- 段階的なパフォーマンス改善の実装

### デプロイメント
- 適切なリソース制限の設定
- 包括的監視の設定
- 本番グレードログの使用
- 自動ヘルスチェックの実装

### 保守
- 現在値だけでなく傾向の監視
- パフォーマンス劣化のアラート設定
- 定期的なパフォーマンスレビュー
- 使用パターンに基づく積極的最適化

### スケーリング
- 現在の負荷の3倍を計画
- 高スループットには水平スケーリングを使用
- 段階的劣化の実装
- ボトルネックの継続的監視と最適化

---

詳細情報:
- [インストールガイド](./installation.ja.md) - セットアップと設定
- [機能リファレンス](./function-reference.ja.md) - 完全なAPI文書
- [トラブルシューティングガイド](./troubleshooting.ja.md) - 一般的な問題と解決方法
- [アーキテクチャ文書](./architecture/) - システム設計とスケーリング