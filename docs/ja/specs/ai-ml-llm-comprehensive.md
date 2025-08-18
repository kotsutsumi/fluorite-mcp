# AI/ML・LLM 包括エコシステム

`spec://ai-ml-llm-comprehensive-ecosystem`

## 概要

AI、機械学習、大規模言語モデル（LLM）統合のための包括的なエコシステム仕様です。最新のAI技術スタックとベストプラクティスを網羅しています。

## 主要コンポーネント

### LLMフレームワーク
- **LangChain** - LLMアプリケーション開発フレームワーク
- **llama.cpp** - 高効率LLM推論エンジン
- **vLLM** - 高スループットLLMサービング
- **Ollama** - ローカルLLM実行環境

### ベクターデータベース
- **Pinecone** - マネージドベクターデータベース
- **Weaviate** - オープンソースベクターサーチ
- **Qdrant** - 高性能ベクターデータベース
- **ChromaDB** - 組み込み可能なベクターDB

### AIプラットフォーム
- **Hugging Face** - モデルハブとツール
- **Replicate** - モデルデプロイメントプラットフォーム
- **Together AI** - LLMインフラストラクチャ

## アーキテクチャパターン

### RAG（Retrieval-Augmented Generation）
```python
from langchain import LangChain
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.llms import OpenAI

# ベクターストア初期化
embeddings = OpenAIEmbeddings()
vectorstore = Pinecone.from_documents(
    documents=docs,
    embedding=embeddings,
    index_name="knowledge-base"
)

# RAGチェーン構築
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(temperature=0),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

# 質問応答
result = qa_chain({"query": "What is RAG?"})
```

### エージェントシステム
```python
from langchain.agents import create_openai_tools_agent
from langchain.tools import Tool

# カスタムツール定義
tools = [
    Tool(
        name="Database Query",
        func=execute_sql_query,
        description="Execute SQL queries"
    ),
    Tool(
        name="Web Search",
        func=search_web,
        description="Search the web for information"
    )
]

# エージェント作成
agent = create_openai_tools_agent(
    llm=llm,
    tools=tools,
    prompt=prompt
)
```

## ローカルLLM実行

### Ollama を使用
```bash
# モデルのダウンロードと実行
ollama pull llama2
ollama run llama2

# APIとして使用
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is the sky blue?"
}'
```

### llama.cpp を使用
```cpp
// 高速推論の実装
#include "llama.h"

int main() {
    llama_context_params params = llama_context_default_params();
    params.n_ctx = 2048;
    params.n_batch = 512;
    params.n_threads = 8;
    
    llama_context* ctx = llama_init_from_file(
        "models/llama-2-7b.gguf", 
        params
    );
    
    // 推論実行
    llama_eval(ctx, tokens, n_tokens, n_past, n_threads);
}
```

## ベストプラクティス

- プロンプトエンジニアリングの最適化
- トークン使用量の管理
- レート制限とエラーハンドリング
- セキュリティとプライバシーの考慮
- コスト最適化戦略

## リソース

- [LangChain ドキュメント](https://docs.langchain.com)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/ai-ml-llm-comprehensive-ecosystem.yaml)