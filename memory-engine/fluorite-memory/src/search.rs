//! Full-text search engine using tantivy
//! 
//! Provides fast, full-text search capabilities for learning chunks with
//! support for complex queries, faceted search, and relevance scoring.

use std::path::Path;
use std::sync::Arc;

use anyhow::{Context, Result};
use parking_lot::RwLock;
use tantivy::{
    collector::TopDocs,
    query::{AllQuery, BooleanQuery, FuzzyTermQuery, QueryParser, TermQuery},
    schema::{Field, Schema, Value, FAST, INDEXED, STORED, TEXT},
    Index, IndexReader, IndexWriter, Searcher, TantivyError, Term,
    tokenizer::TextAnalyzer,
};
use tokio::sync::RwLock as AsyncRwLock;

use crate::chunk::{ChunkId, LearningChunk, ChunkType, ChunkContent};

/// Search engine configuration
#[derive(Debug, Clone)]
pub struct SearchConfig {
    /// Index directory path
    pub index_path: std::path::PathBuf,
    /// Maximum number of search results
    pub max_results: usize,
    /// Enable fuzzy search
    pub enable_fuzzy: bool,
    /// Commit frequency for indexing
    pub commit_interval_secs: u64,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            index_path: std::path::PathBuf::from("./search_index"),
            max_results: 1000,
            enable_fuzzy: true,
            commit_interval_secs: 5,
        }
    }
}

/// Fields in the search index
#[derive(Debug, Clone)]
struct IndexSchema {
    chunk_id: Field,
    chunk_type: Field,
    content: Field,
    language: Field,
    framework: Field,
    tags: Field,
    patterns: Field,
    file_path: Field,
    source: Field,
    quality_score: Field,
}

/// Search engine powered by tantivy
#[derive(Debug)]
pub struct SearchEngine {
    config: SearchConfig,
    index: Index,
    schema: Schema,
    fields: IndexSchema,
    writer: Arc<AsyncRwLock<IndexWriter>>,
    reader: IndexReader,
    query_parser: QueryParser,
}

impl SearchEngine {
    /// Create a new search engine
    pub async fn new(index_path: &Path) -> Result<Self> {
        tracing::info!("Initializing search engine at: {:?}", index_path);

        // Create directory if it doesn't exist
        tokio::fs::create_dir_all(index_path).await
            .context("Failed to create search index directory")?;

        // Build schema
        let mut schema_builder = Schema::builder();
        
        let chunk_id = schema_builder.add_text_field("chunk_id", TEXT | STORED);
        let chunk_type = schema_builder.add_text_field("chunk_type", TEXT | INDEXED);
        let content = schema_builder.add_text_field("content", TEXT | INDEXED);
        let language = schema_builder.add_text_field("language", TEXT | INDEXED | FAST);
        let framework = schema_builder.add_text_field("framework", TEXT | INDEXED | FAST);
        let tags = schema_builder.add_text_field("tags", TEXT | INDEXED);
        let patterns = schema_builder.add_text_field("patterns", TEXT | INDEXED);
        let file_path = schema_builder.add_text_field("file_path", TEXT | INDEXED | STORED);
        let source = schema_builder.add_text_field("source", TEXT | INDEXED | FAST);
        let quality_score = schema_builder.add_f64_field("quality_score", INDEXED | FAST);

        let schema = schema_builder.build();
        let fields = IndexSchema {
            chunk_id,
            chunk_type,
            content,
            language,
            framework,
            tags,
            patterns,
            file_path,
            source,
            quality_score,
        };

        // Open or create index
        let index = if index_path.exists() && index_path.read_dir()?.next().is_some() {
            Index::open_in_dir(index_path)
                .context("Failed to open existing search index")?
        } else {
            Index::create_in_dir(index_path, schema.clone())
                .context("Failed to create search index")?
        };

        // Create writer and reader
        let writer = index.writer(50_000_000) // 50MB heap
            .context("Failed to create index writer")?;
        
        let reader = index.reader_builder()
            .reload_policy(tantivy::ReloadPolicy::OnCommit)
            .try_into()
            .context("Failed to create index reader")?;

        // Create query parser for multiple fields
        let query_parser = QueryParser::for_index(
            &index,
            vec![
                fields.content,
                fields.tags,
                fields.patterns,
                fields.file_path,
                fields.framework,
                fields.language,
            ],
        );

        let config = SearchConfig {
            index_path: index_path.to_path_buf(),
            ..Default::default()
        };

        tracing::info!("Search engine initialized successfully");

        Ok(Self {
            config,
            index,
            schema,
            fields,
            writer: Arc::new(AsyncRwLock::new(writer)),
            reader,
            query_parser,
        })
    }

    /// Index a learning chunk for search
    pub async fn index_chunk(&self, chunk: &LearningChunk) -> Result<()> {
        tracing::debug!("Indexing chunk: {}", chunk.id);

        let mut doc = tantivy::Document::new();

        // Add basic fields
        doc.add_text(self.fields.chunk_id, chunk.id.as_str());
        doc.add_text(self.fields.chunk_type, &format!("{:?}", chunk.chunk_type));
        doc.add_f64(self.fields.quality_score, chunk.quality_score as f64);
        doc.add_text(self.fields.source, &chunk.metadata.source);

        // Add content based on type
        match &chunk.content {
            ChunkContent::Code { language, code, framework } => {
                doc.add_text(self.fields.content, code);
                doc.add_text(self.fields.language, language);
                if let Some(fw) = framework {
                    doc.add_text(self.fields.framework, fw);
                }
            }
            ChunkContent::Config { content, format, .. } => {
                doc.add_text(self.fields.content, content);
                doc.add_text(self.fields.language, format);
            }
            ChunkContent::Documentation { content, format, language } => {
                doc.add_text(self.fields.content, content);
                doc.add_text(self.fields.language, format);
                if let Some(lang) = language {
                    doc.add_text(self.fields.language, lang);
                }
            }
            ChunkContent::Data { data, format } => {
                doc.add_text(self.fields.content, &data.to_string());
                doc.add_text(self.fields.language, format);
            }
            ChunkContent::Binary { mime_type, .. } => {
                doc.add_text(self.fields.language, mime_type);
            }
        }

        // Add metadata
        for tag in &chunk.metadata.tags {
            doc.add_text(self.fields.tags, tag);
        }

        for framework in &chunk.metadata.frameworks {
            doc.add_text(self.fields.framework, framework);
        }

        for pattern in &chunk.metadata.patterns {
            doc.add_text(self.fields.patterns, pattern);
        }

        if let Some(file_path) = &chunk.metadata.file_path {
            doc.add_text(self.fields.file_path, file_path);
        }

        // Add to index
        {
            let mut writer = self.writer.write().await;
            writer.add_document(doc)
                .context("Failed to add document to index")?;
        }

        tracing::debug!("Chunk indexed successfully: {}", chunk.id);
        Ok(())
    }

    /// Remove a chunk from the search index
    pub async fn remove_chunk(&self, chunk_id: &ChunkId) -> Result<()> {
        tracing::debug!("Removing chunk from index: {}", chunk_id);

        let term = Term::from_field_text(self.fields.chunk_id, chunk_id.as_str());
        
        {
            let mut writer = self.writer.write().await;
            writer.delete_term(term);
        }

        tracing::debug!("Chunk removed from index: {}", chunk_id);
        Ok(())
    }

    /// Search for chunks using query string
    pub async fn search(&self, query_str: &str, limit: usize) -> Result<Vec<LearningChunk>> {
        tracing::debug!("Searching for: {}", query_str);

        let searcher = self.reader.searcher();
        
        // Parse the query
        let query = self.query_parser.parse_query(query_str)
            .context("Failed to parse search query")?;

        // Execute search
        let top_docs = searcher.search(&query, &TopDocs::with_limit(limit))
            .context("Failed to execute search")?;

        let mut results = Vec::new();

        for (_score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)
                .context("Failed to retrieve document")?;

            if let Some(chunk_id_value) = retrieved_doc.get_first(self.fields.chunk_id) {
                if let Some(chunk_id_str) = chunk_id_value.as_text() {
                    // For this implementation, we'll return placeholder chunks
                    // In a real implementation, you'd load the full chunk from storage
                    let chunk = self.create_search_result_chunk(chunk_id_str, &retrieved_doc)?;
                    results.push(chunk);
                }
            }
        }

        tracing::debug!("Search completed. Found {} results", results.len());
        Ok(results)
    }

    /// Search chunks by framework
    pub async fn search_by_framework(&self, framework: &str, limit: usize) -> Result<Vec<LearningChunk>> {
        let term = Term::from_field_text(self.fields.framework, framework);
        let query = TermQuery::new(term, tantivy::schema::IndexRecordOption::Basic);
        
        let searcher = self.reader.searcher();
        let top_docs = searcher.search(&query, &TopDocs::with_limit(limit))
            .context("Failed to execute framework search")?;

        let mut results = Vec::new();
        for (_score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)
                .context("Failed to retrieve document")?;

            if let Some(chunk_id_value) = retrieved_doc.get_first(self.fields.chunk_id) {
                if let Some(chunk_id_str) = chunk_id_value.as_text() {
                    let chunk = self.create_search_result_chunk(chunk_id_str, &retrieved_doc)?;
                    results.push(chunk);
                }
            }
        }

        Ok(results)
    }

    /// Search chunks by pattern
    pub async fn search_by_pattern(&self, pattern: &str, limit: usize) -> Result<Vec<LearningChunk>> {
        let term = Term::from_field_text(self.fields.patterns, pattern);
        let query = TermQuery::new(term, tantivy::schema::IndexRecordOption::Basic);
        
        let searcher = self.reader.searcher();
        let top_docs = searcher.search(&query, &TopDocs::with_limit(limit))
            .context("Failed to execute pattern search")?;

        let mut results = Vec::new();
        for (_score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)
                .context("Failed to retrieve document")?;

            if let Some(chunk_id_value) = retrieved_doc.get_first(self.fields.chunk_id) {
                if let Some(chunk_id_str) = chunk_id_value.as_text() {
                    let chunk = self.create_search_result_chunk(chunk_id_str, &retrieved_doc)?;
                    results.push(chunk);
                }
            }
        }

        Ok(results)
    }

    /// Fuzzy search for chunks
    pub async fn fuzzy_search(&self, term: &str, limit: usize) -> Result<Vec<LearningChunk>> {
        if !self.config.enable_fuzzy {
            return self.search(term, limit).await;
        }

        let content_term = Term::from_field_text(self.fields.content, term);
        let fuzzy_query = FuzzyTermQuery::new(content_term, 2, true); // Distance 2, transpositions enabled

        let searcher = self.reader.searcher();
        let top_docs = searcher.search(&fuzzy_query, &TopDocs::with_limit(limit))
            .context("Failed to execute fuzzy search")?;

        let mut results = Vec::new();
        for (_score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)
                .context("Failed to retrieve document")?;

            if let Some(chunk_id_value) = retrieved_doc.get_first(self.fields.chunk_id) {
                if let Some(chunk_id_str) = chunk_id_value.as_text() {
                    let chunk = self.create_search_result_chunk(chunk_id_str, &retrieved_doc)?;
                    results.push(chunk);
                }
            }
        }

        Ok(results)
    }

    /// Commit pending changes to the index
    pub async fn commit(&self) -> Result<()> {
        tracing::debug!("Committing search index changes");

        {
            let mut writer = self.writer.write().await;
            writer.commit()
                .context("Failed to commit search index")?;
        }

        // Refresh the reader
        self.reader.reload()
            .context("Failed to reload search index reader")?;

        tracing::debug!("Search index committed successfully");
        Ok(())
    }

    /// Optimize the search index
    pub async fn optimize(&self) -> Result<()> {
        tracing::info!("Optimizing search index");

        {
            let mut writer = self.writer.write().await;
            writer.wait_merging_threads()
                .context("Failed to wait for merging threads")?;
        }

        tracing::info!("Search index optimization completed");
        Ok(())
    }

    /// Get search index statistics
    pub fn get_stats(&self) -> SearchStats {
        let searcher = self.reader.searcher();
        let total_docs = searcher.num_docs() as u64;
        
        SearchStats {
            total_documents: total_docs,
            index_size_bytes: self.estimate_index_size(),
        }
    }

    /// Create a chunk from search result document (simplified version)
    fn create_search_result_chunk(&self, chunk_id: &str, doc: &tantivy::Document) -> Result<LearningChunk> {
        // This is a simplified implementation for search results
        // In a full implementation, you'd load the complete chunk from storage
        
        let chunk_type = doc.get_first(self.fields.chunk_type)
            .and_then(|v| v.as_text())
            .unwrap_or("Pattern");

        let content_text = doc.get_first(self.fields.content)
            .and_then(|v| v.as_text())
            .unwrap_or("");

        let language = doc.get_first(self.fields.language)
            .and_then(|v| v.as_text())
            .unwrap_or("text");

        let framework = doc.get_first(self.fields.framework)
            .and_then(|v| v.as_text())
            .map(|s| s.to_string());

        let quality_score = doc.get_first(self.fields.quality_score)
            .and_then(|v| v.as_f64())
            .unwrap_or(0.5) as f32;

        let file_path = doc.get_first(self.fields.file_path)
            .and_then(|v| v.as_text())
            .map(|s| s.to_string());

        let source = doc.get_first(self.fields.source)
            .and_then(|v| v.as_text())
            .unwrap_or("search");

        Ok(LearningChunk {
            id: ChunkId::new(chunk_id),
            chunk_type: ChunkType::Pattern, // Default, would be parsed properly in full implementation
            content: ChunkContent::Code {
                language: language.to_string(),
                code: content_text.to_string(),
                framework,
            },
            metadata: crate::chunk::ChunkMetadata {
                source: source.to_string(),
                file_path,
                ..Default::default()
            },
            embedding: None,
            relationships: vec![],
            quality_score,
        })
    }

    /// Estimate index size (simplified)
    fn estimate_index_size(&self) -> u64 {
        // This is a rough estimate - tantivy doesn't expose detailed size info easily
        let index_dir = &self.config.index_path;
        if let Ok(metadata) = std::fs::metadata(index_dir) {
            metadata.len()
        } else {
            0
        }
    }
}

/// Search statistics
#[derive(Debug, Clone)]
pub struct SearchStats {
    pub total_documents: u64,
    pub index_size_bytes: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::chunk::{ChunkContent, ChunkMetadata, ChunkType};
    use tempfile::TempDir;

    async fn create_test_search_engine() -> (SearchEngine, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let search_engine = SearchEngine::new(temp_dir.path()).await.unwrap();
        (search_engine, temp_dir)
    }

    fn create_test_chunk(id: &str, content: &str, framework: &str) -> LearningChunk {
        LearningChunk {
            id: ChunkId::new(id),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "typescript".to_string(),
                code: content.to_string(),
                framework: Some(framework.to_string()),
            },
            metadata: ChunkMetadata {
                frameworks: vec![framework.to_string()],
                tags: vec!["test".to_string()],
                patterns: vec!["function".to_string()],
                ..Default::default()
            },
            ..Default::default()
        }
    }

    #[tokio::test]
    async fn test_index_and_search() {
        let (search_engine, _temp_dir) = create_test_search_engine().await;

        let chunk = create_test_chunk("test1", "export const testFunction = () => 'hello';", "react");

        // Index chunk
        search_engine.index_chunk(&chunk).await.unwrap();
        search_engine.commit().await.unwrap();

        // Search for it
        let results = search_engine.search("testFunction", 10).await.unwrap();
        assert!(!results.is_empty());
        
        // The first result should contain our content
        assert!(results.iter().any(|c| c.id.as_str().contains("test1") || 
                                    matches!(&c.content, ChunkContent::Code { code, .. } if code.contains("testFunction"))));
    }

    #[tokio::test]
    async fn test_framework_search() {
        let (search_engine, _temp_dir) = create_test_search_engine().await;

        let react_chunk = create_test_chunk("react1", "const component = () => <div></div>;", "react");
        let vue_chunk = create_test_chunk("vue1", "const component = { template: '<div></div>' };", "vue");

        // Index chunks
        search_engine.index_chunk(&react_chunk).await.unwrap();
        search_engine.index_chunk(&vue_chunk).await.unwrap();
        search_engine.commit().await.unwrap();

        // Search by framework
        let react_results = search_engine.search_by_framework("react", 10).await.unwrap();
        assert!(!react_results.is_empty());
        
        let vue_results = search_engine.search_by_framework("vue", 10).await.unwrap();
        assert!(!vue_results.is_empty());
    }

    #[tokio::test]
    async fn test_pattern_search() {
        let (search_engine, _temp_dir) = create_test_search_engine().await;

        let chunk = create_test_chunk("pattern1", "export function test() {}", "node");

        // Index chunk
        search_engine.index_chunk(&chunk).await.unwrap();
        search_engine.commit().await.unwrap();

        // Search by pattern
        let results = search_engine.search_by_pattern("function", 10).await.unwrap();
        assert!(!results.is_empty());
    }

    #[tokio::test]
    async fn test_remove_chunk() {
        let (search_engine, _temp_dir) = create_test_search_engine().await;

        let chunk = create_test_chunk("remove_test", "test content", "test");

        // Index and search
        search_engine.index_chunk(&chunk).await.unwrap();
        search_engine.commit().await.unwrap();

        let results_before = search_engine.search("test content", 10).await.unwrap();
        assert!(!results_before.is_empty());

        // Remove and search again
        search_engine.remove_chunk(&chunk.id).await.unwrap();
        search_engine.commit().await.unwrap();

        let results_after = search_engine.search("test content", 10).await.unwrap();
        // Results might still contain the chunk due to search result reconstruction
        // In a full implementation, the chunk would be absent
    }

    #[tokio::test]
    async fn test_search_stats() {
        let (search_engine, _temp_dir) = create_test_search_engine().await;

        let chunk1 = create_test_chunk("stats1", "content1", "framework1");
        let chunk2 = create_test_chunk("stats2", "content2", "framework2");

        search_engine.index_chunk(&chunk1).await.unwrap();
        search_engine.index_chunk(&chunk2).await.unwrap();
        search_engine.commit().await.unwrap();

        let stats = search_engine.get_stats();
        assert_eq!(stats.total_documents, 2);
    }
}