# Fluorite Memory Engine

fluorite-mcp向けの高性能Rust基盤メモリ・事前学習システム。インテリジェントなパターン認識とML駆動学習により、コード生成精度を向上させるよう設計されています。

## 🎯 概要

Memory Engineは以下を組み合わせた高度なシステムです：
- **Rust** による高性能並列I/O操作
- **PyO3** によるPython MLモデル統合（CPU専用）
- 思考プロセスと学習データのための**チャンク型ストレージ**
- シームレスなMCP統合のための**Node.jsブリッジ**
- スパイクテンプレートとWebソースからの**自動学習**

## 🏗️ アーキテクチャ

```
fluorite-mcp/
├── memory-engine/
│   ├── fluorite-memory/     # コアメモリストレージエンジン
│   ├── fluorite-learner/    # 学習パイプライン
│   ├── fluorite-ml/         # ML統合（CPU専用）
│   └── fluorite-bridge/     # Node.js統合
└── learning-chunks/         # 生成された学習データ
```

## 🚀 主要機能

### 1. **ハイブリッドメモリ・ディスクストレージ**
- LRU追い出しによるインテリジェントキャッシュ
- 大型データセット向け圧縮ディスクストレージ
- 高速アクセス用メモリマップファイル
- 並列I/O操作

### 2. **ML統合（CPU専用）**
- 埋め込み用Sentence Transformers
- パターン認識モデル
- 類似コードパターンのクラスタリング
- GPU不要 - 標準ハードウェアで動作

### 3. **自動学習パイプライン**
- スパイクテンプレートの自動処理
- フレームワーク組み合わせの学習（Next.js + Hono + Laravel）
- 再利用可能なコードパターンの生成
- フィードバックによる継続的改善

### 4. **Node.jsブリッジ**
- N-APIを使用したネイティブNode.jsアドオン
- async/awaitサポート
- 型安全TypeScript定義
- ゼロコピーデータ転送

## 📦 インストール

### 前提条件
- Rust 1.75+（メモリエンジン用）
- Node.js 18+（fluorite-mcp用）
- Python 3.9+（MLモデル用）
- 推奨RAM 4GB以上

### Memory Engineのビルド

```bash
cd memory-engine
cargo build --release
```

### Node.jsブリッジのインストール

```bash
cd fluorite-bridge
npm install
npm run build
```

### Python環境のセットアップ

```bash
# 仮想環境の作成
python3 -m venv venv
source venv/bin/activate

# ML依存関係のインストール（CPU専用）
pip install sentence-transformers scikit-learn numpy --no-deps torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

## 🤖 自動学習

システムには継続的学習のための自動化スクリプトが含まれています：

### 学習スクリプト（`~/fluorite-auto-learn.sh`）

以下のタスクを実行します：
1. 技術ソースから実装例を収集
2. スパイクテンプレートの処理
3. 学習チャンクの生成
4. MLモデルの学習
5. fluorite-mcpリポジトリの更新

### 手動実行

```bash
~/fluorite-auto-learn.sh
```

### スケジュール実行の設定

```bash
~/fluorite-schedule-setup.sh
```

以下から選択できます：
- 日次cron job（午前2時）
- macOS LaunchAgent
- 手動実行

### プライバシー・ストレージ

- **検索履歴**: `~/tmp/fluorite-learning/`に保存（リポジトリから除外）
- **学習チャンク**: `fluorite-mcp/learning-chunks/`に保存
- **モデル**: `memory-engine/models/`にキャッシュ

## 🧠 動作方法

### 1. パターン収集
システムは以下からパターンを収集します：
- 既存のスパイクテンプレート
- フレームワークドキュメント
- コミュニティ例
- ユーザーインタラクション

### 2. 学習プロセス
```rust
// 例：スパイクテンプレートからの学習
let pipeline = LearningPipeline::new(config).await?;
let report = pipeline.learn_from_spikes().await?;

// パターンが抽出され保存される
for pattern in report.patterns {
    memory_engine.store_chunk(pattern).await?;
}
```

### 3. パターン認識
```python
# MLモデルがパターンを認識
embeddings = model.encode(code_snippets)
similar_patterns = find_similar(query_embedding, stored_embeddings)
```

### 4. コード生成強化
コード生成時、システムは以下を行います：
1. ユーザーリクエストの分析
2. 類似パターンの検索
3. 関連チャンクの組み合わせ
4. 最適化されたコードの生成

## 📊 パフォーマンス

- **チャンクストレージ**: 約100万チャンク、100ms未満での検索
- **埋め込み生成**: テキストあたり約50ms（CPU）
- **パターンマッチング**: 類似性検索10ms未満
- **メモリ使用量**: ベースライン約500MB、データに応じてスケール

## 🔧 設定

### Memory Engine設定
```toml
[memory]
cache_size_mb = 512
enable_compression = true
max_chunk_size = 1048576  # 1MB

[learning]
quality_threshold = 0.7
batch_size = 32
parallel_processing = true

[ml]
embedding_model = "all-MiniLM-L6-v2"
cpu_only = true
num_threads = 8
```

## 🧪 テスト

```bash
# 全テストの実行
cargo test --all

# 特定コンポーネントテストの実行
cargo test -p fluorite-memory
cargo test -p fluorite-ml

# 統合テストの実行
cargo test --test integration
```

## 📈 モニタリング

システムは以下のメトリクスを提供します：
- 学習進捗
- パターン品質スコア
- メモリ使用量
- キャッシュヒット率
- MLモデル精度

メトリクス表示：
```bash
cat ~/tmp/fluorite-learning/learning-*.log
```

## 🔄 継続的改善

システムは以下により改善されます：
1. **ユーザーフィードバック**: 生成されたコードの評価
2. **使用パターン**: 成功した生成からの学習
3. **エラー修正**: ミスからの学習
4. **コミュニティ貢献**: 共有パターンとテンプレート

## 🤝 fluorite-mcpとの統合

メモリエンジンはシームレスに統合されます：

```javascript
// fluorite-mcp Node.jsコード内
const { FluoriteBridge } = require('./memory-engine/fluorite-bridge');

const bridge = new FluoriteBridge();
await bridge.initialize({
    memory_path: './memory',
    models_path: './models',
    spike_templates_path: './src/spikes',
    enable_ml: true
});

// 学習チャンクの保存
await bridge.storeChunk({
    id: 'nextjs-bff-pattern',
    content: codeSnippet,
    frameworks: ['nextjs', 'hono'],
    quality_score: 0.9
});

// 類似パターンの検索
const similar = await bridge.searchSimilar('BFF implementation', 10);
```

## 🚦 ロードマップ

- [ ] 高度なパターン合成
- [ ] 多言語サポート
- [ ] 分散学習
- [ ] リアルタイムパターン更新
- [ ] ビジュアルパターン探索
- [ ] 外部統合用API

## 📝 ライセンス

MIT License - 詳細はLICENSEファイルをご確認ください

## 🙏 謝辞

- CPU推論のためのONNX Runtime
- 埋め込みのためのSentence Transformers
- Python統合のためのPyO3
- RustとNode.jsコミュニティ

---

**注意**: これは高度な実験的システムです。自動学習機能はローカルおよびプライベートに実行するよう設計されており、すべての検索履歴はプライバシーのためリポジトリ外に保存されます。