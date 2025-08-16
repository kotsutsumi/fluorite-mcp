# Fluorite Memory Engine

A high-performance Rust-based memory and pre-learning system for fluorite-mcp, designed to enhance code generation accuracy through intelligent pattern recognition and ML-powered learning.

## 🎯 Overview

The Memory Engine is a sophisticated system that combines:
- **Rust** for high-performance parallel I/O operations
- **PyO3** for Python ML model integration (CPU-only)
- **Chunk-based storage** for thought processes and learning data
- **Node.js bridge** for seamless MCP integration
- **Automated learning** from spike templates and web sources

## 🏗️ Architecture

```
fluorite-mcp/
├── memory-engine/
│   ├── fluorite-memory/     # Core memory storage engine
│   ├── fluorite-learner/    # Learning pipeline
│   ├── fluorite-ml/         # ML integration (CPU-only)
│   └── fluorite-bridge/     # Node.js integration
└── learning-chunks/         # Generated learning data
```

## 🚀 Key Features

### 1. **Hybrid Memory-Disk Storage**
- Intelligent caching with LRU eviction
- Compressed disk storage for large datasets
- Memory-mapped files for fast access
- Parallel I/O operations

### 2. **ML Integration (CPU-Only)**
- Sentence transformers for embeddings
- Pattern recognition models
- Clustering for similar code patterns
- No GPU required - runs on standard hardware

### 3. **Automated Learning Pipeline**
- Processes spike templates automatically
- Learns framework combinations (Next.js + Hono + Laravel)
- Generates reusable code patterns
- Continuously improves through feedback

### 4. **Node.js Bridge**
- Native Node.js addon using N-API
- Async/await support
- Type-safe TypeScript definitions
- Zero-copy data transfer

## 📦 Installation

### Prerequisites
- Rust 1.75+ (for memory engine)
- Node.js 18+ (for fluorite-mcp)
- Python 3.9+ (for ML models)
- 4GB+ RAM recommended

### Building the Memory Engine

```bash
cd memory-engine
cargo build --release
```

### Installing Node.js Bridge

```bash
cd fluorite-bridge
npm install
npm run build
```

### Setting up Python Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install ML dependencies (CPU-only)
pip install sentence-transformers scikit-learn numpy --no-deps torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

## 🤖 Automated Learning

The system includes automated scripts for continuous learning:

### Learning Script (`~/fluorite-auto-learn.sh`)

Performs the following tasks:
1. Collects implementation examples from technical sources
2. Processes spike templates
3. Generates learning chunks
4. Trains ML models
5. Updates the fluorite-mcp repository

### Running Manually

```bash
~/fluorite-auto-learn.sh
```

### Setting Up Scheduled Execution

```bash
~/fluorite-schedule-setup.sh
```

Choose from:
- Daily cron job (2 AM)
- macOS LaunchAgent
- Manual execution

### Privacy & Storage

- **Search history**: Stored in `~/tmp/fluorite-learning/` (excluded from repo)
- **Learning chunks**: Stored in `fluorite-mcp/learning-chunks/`
- **Models**: Cached in `memory-engine/models/`

## 🧠 How It Works

### 1. Pattern Collection
The system collects patterns from:
- Existing spike templates
- Framework documentation
- Community examples
- User interactions

### 2. Learning Process
```rust
// Example: Learning from spike templates
let pipeline = LearningPipeline::new(config).await?;
let report = pipeline.learn_from_spikes().await?;

// Patterns are extracted and stored
for pattern in report.patterns {
    memory_engine.store_chunk(pattern).await?;
}
```

### 3. Pattern Recognition
```python
# ML model recognizes patterns
embeddings = model.encode(code_snippets)
similar_patterns = find_similar(query_embedding, stored_embeddings)
```

### 4. Code Generation Enhancement
When generating code, the system:
1. Analyzes the user's request
2. Searches for similar patterns
3. Combines relevant chunks
4. Generates optimized code

## 📊 Performance

- **Chunk Storage**: ~1M chunks with <100ms retrieval
- **Embedding Generation**: ~50ms per text (CPU)
- **Pattern Matching**: <10ms for similarity search
- **Memory Usage**: ~500MB baseline, scales with data

## 🔧 Configuration

### Memory Engine Config
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

## 🧪 Testing

```bash
# Run all tests
cargo test --all

# Run specific component tests
cargo test -p fluorite-memory
cargo test -p fluorite-ml

# Run integration tests
cargo test --test integration
```

## 📈 Monitoring

The system provides metrics for:
- Learning progress
- Pattern quality scores
- Memory usage
- Cache hit rates
- ML model accuracy

View metrics:
```bash
cat ~/tmp/fluorite-learning/learning-*.log
```

## 🔄 Continuous Improvement

The system improves through:
1. **User Feedback**: Rating generated code
2. **Usage Patterns**: Learning from successful generations
3. **Error Corrections**: Learning from mistakes
4. **Community Contributions**: Shared patterns and templates

## 🤝 Integration with fluorite-mcp

The memory engine integrates seamlessly:

```javascript
// In fluorite-mcp Node.js code
const { FluoriteBridge } = require('./memory-engine/fluorite-bridge');

const bridge = new FluoriteBridge();
await bridge.initialize({
    memory_path: './memory',
    models_path: './models',
    spike_templates_path: './src/spikes',
    enable_ml: true
});

// Store learning chunk
await bridge.storeChunk({
    id: 'nextjs-bff-pattern',
    content: codeSnippet,
    frameworks: ['nextjs', 'hono'],
    quality_score: 0.9
});

// Search similar patterns
const similar = await bridge.searchSimilar('BFF implementation', 10);
```

## 🚦 Roadmap

- [ ] Advanced pattern synthesis
- [ ] Multi-language support
- [ ] Distributed learning
- [ ] Real-time pattern updates
- [ ] Visual pattern exploration
- [ ] API for external integrations

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- ONNX Runtime for CPU inference
- Sentence Transformers for embeddings
- PyO3 for Python integration
- The Rust and Node.js communities

---

**Note**: This is an advanced experimental system. The automated learning capabilities are designed to run locally and privately, with all search history stored outside the repository for privacy.