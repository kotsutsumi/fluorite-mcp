//! Fluorite Memory Engine
//! 
//! A high-performance hybrid memory/disk storage system for learning and caching
//! code generation patterns, with specialized support for Next.js + Laravel patterns.
//! 
//! Features:
//! - Hybrid storage: Hot data in memory, warm/cold data on disk
//! - Full-text search with tantivy indexing
//! - LRU caching with intelligent eviction
//! - Chunk-based learning with embeddings and relationships
//! - Cross-framework pattern mapping
//! - Concurrent access with minimal locking

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use dashmap::DashMap;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tantivy::{collector::TopDocs, query::QueryParser, schema::*, Index, IndexReader, IndexWriter};
use tokio::sync::RwLock as AsyncRwLock;
use uuid::Uuid;

pub mod storage;
pub mod search;
pub mod cache;
pub mod chunk;
pub mod patterns;

pub use chunk::*;
pub use storage::*;
pub use search::*;
pub use cache::*;
pub use patterns::*;

/// Configuration for the memory engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryConfig {
    /// Storage directory for persistent data
    pub storage_path: PathBuf,
    /// Maximum memory cache size in MB
    pub cache_size_mb: usize,
    /// Maximum number of chunks to keep in hot cache
    pub max_hot_chunks: usize,
    /// Compression level (0-9, 9 = maximum compression)
    pub compression_level: u32,
    /// Enable full-text search indexing
    pub enable_search: bool,
    /// Embedding dimensions (for ML integration)
    pub embedding_dim: usize,
}

impl Default for MemoryConfig {
    fn default() -> Self {
        Self {
            storage_path: PathBuf::from("./fluorite-memory"),
            cache_size_mb: 512,
            max_hot_chunks: 10000,
            compression_level: 6,
            enable_search: true,
            embedding_dim: 384, // All-MiniLM-L6-v2 default
        }
    }
}

/// Core memory engine that orchestrates all storage, indexing, and caching components
#[derive(Debug)]
pub struct MemoryEngine {
    config: MemoryConfig,
    storage: Arc<HybridStorage>,
    cache: Arc<LruCache>,
    search_engine: Option<Arc<SearchEngine>>,
    pattern_analyzer: Arc<PatternAnalyzer>,
    // Runtime statistics
    stats: Arc<RwLock<EngineStats>>,
}

/// Runtime statistics for the memory engine
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct EngineStats {
    pub total_chunks: u64,
    pub cache_hits: u64,
    pub cache_misses: u64,
    pub disk_reads: u64,
    pub disk_writes: u64,
    pub search_queries: u64,
    pub pattern_matches: u64,
    pub memory_usage_mb: f64,
    pub last_update: Option<DateTime<Utc>>,
}

impl MemoryEngine {
    /// Create a new memory engine with the given configuration
    pub async fn new(config: MemoryConfig) -> Result<Self> {
        tracing::info!("Initializing Fluorite Memory Engine");

        // Ensure storage directory exists
        tokio::fs::create_dir_all(&config.storage_path)
            .await
            .context("Failed to create storage directory")?;

        // Initialize storage backend
        let storage = Arc::new(
            HybridStorage::new(&config.storage_path, config.compression_level)
                .await
                .context("Failed to initialize storage backend")?
        );

        // Initialize LRU cache
        let cache = Arc::new(
            LruCache::new(config.max_hot_chunks, config.cache_size_mb * 1024 * 1024)
        );

        // Initialize search engine if enabled
        let search_engine = if config.enable_search {
            let search_path = config.storage_path.join("search_index");
            let engine = SearchEngine::new(&search_path)
                .await
                .context("Failed to initialize search engine")?;
            Some(Arc::new(engine))
        } else {
            None
        };

        // Initialize pattern analyzer
        let pattern_analyzer = Arc::new(PatternAnalyzer::new(config.embedding_dim));

        let stats = Arc::new(RwLock::new(EngineStats::default()));

        let engine = Self {
            config,
            storage,
            cache,
            search_engine,
            pattern_analyzer,
            stats,
        };

        // Load existing chunks into cache on startup
        engine.warmup_cache().await?;

        tracing::info!("Memory engine initialized successfully");
        Ok(engine)
    }

    /// Store a learning chunk in the memory engine
    pub async fn store_chunk(&self, chunk: LearningChunk) -> Result<ChunkId> {
        let chunk_id = chunk.id.clone();
        
        tracing::debug!("Storing chunk: {}", chunk_id);

        // Store in persistent storage
        self.storage.store_chunk(&chunk).await
            .context("Failed to store chunk to disk")?;

        // Add to hot cache
        self.cache.insert(chunk_id.clone(), chunk.clone()).await;

        // Index for search if enabled
        if let Some(search_engine) = &self.search_engine {
            search_engine.index_chunk(&chunk).await
                .context("Failed to index chunk for search")?;
        }

        // Analyze patterns
        self.pattern_analyzer.analyze_chunk(&chunk).await?;

        // Update stats
        {
            let mut stats = self.stats.write();
            stats.total_chunks += 1;
            stats.disk_writes += 1;
            stats.last_update = Some(Utc::now());
        }

        Ok(chunk_id)
    }

    /// Retrieve a learning chunk by ID
    pub async fn get_chunk(&self, chunk_id: &ChunkId) -> Result<Option<LearningChunk>> {
        tracing::debug!("Retrieving chunk: {}", chunk_id);

        // Check hot cache first
        if let Some(chunk) = self.cache.get(chunk_id).await {
            let mut stats = self.stats.write();
            stats.cache_hits += 1;
            return Ok(Some(chunk));
        }

        // Fall back to disk storage
        let chunk = self.storage.get_chunk(chunk_id).await?;
        
        if let Some(ref chunk) = chunk {
            // Add to cache for future access
            self.cache.insert(chunk_id.clone(), chunk.clone()).await;
        }

        // Update stats
        {
            let mut stats = self.stats.write();
            if chunk.is_some() {
                stats.cache_misses += 1;
                stats.disk_reads += 1;
            }
        }

        Ok(chunk)
    }

    /// Search for chunks using full-text search
    pub async fn search_chunks(&self, query: &str, limit: usize) -> Result<Vec<LearningChunk>> {
        if let Some(search_engine) = &self.search_engine {
            let mut stats = self.stats.write();
            stats.search_queries += 1;
            drop(stats);

            search_engine.search(query, limit).await
        } else {
            Err(anyhow::anyhow!("Search engine not enabled"))
        }
    }

    /// Find similar chunks based on content and patterns
    pub async fn find_similar(&self, chunk: &LearningChunk, limit: usize) -> Result<Vec<SimilarityMatch>> {
        self.pattern_analyzer.find_similar(chunk, limit).await
    }

    /// Get chunks related to a specific framework (e.g., "nextjs", "laravel")
    pub async fn get_framework_chunks(&self, framework: &str) -> Result<Vec<LearningChunk>> {
        let chunks = self.storage.get_chunks_by_framework(framework).await?;
        Ok(chunks)
    }

    /// Learn from user feedback to improve pattern matching
    pub async fn learn_from_feedback(&self, chunk_id: &ChunkId, feedback: UserFeedback) -> Result<()> {
        self.pattern_analyzer.update_from_feedback(chunk_id, feedback).await
    }

    /// Get runtime statistics
    pub fn get_stats(&self) -> EngineStats {
        self.stats.read().clone()
    }

    /// Optimize storage by compacting and cleaning up old data
    pub async fn optimize(&self) -> Result<()> {
        tracing::info!("Starting memory engine optimization");

        // Compact storage
        self.storage.compact().await?;

        // Rebuild search index if enabled
        if let Some(search_engine) = &self.search_engine {
            search_engine.optimize().await?;
        }

        // Update pattern relationships
        self.pattern_analyzer.rebuild_relationships().await?;

        tracing::info!("Memory engine optimization completed");
        Ok(())
    }

    /// Warm up cache by loading frequently accessed chunks
    async fn warmup_cache(&self) -> Result<()> {
        tracing::info!("Warming up cache");

        let recent_chunks = self.storage.get_recent_chunks(self.config.max_hot_chunks / 2).await?;
        
        for chunk in recent_chunks {
            self.cache.insert(chunk.id.clone(), chunk).await;
        }

        tracing::info!("Cache warmup completed");
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_memory_engine_basic_operations() {
        let temp_dir = TempDir::new().unwrap();
        let config = MemoryConfig {
            storage_path: temp_dir.path().to_path_buf(),
            cache_size_mb: 64,
            max_hot_chunks: 100,
            ..Default::default()
        };

        let engine = MemoryEngine::new(config).await.unwrap();

        // Create test chunk
        let chunk = LearningChunk {
            id: ChunkId::new("test-chunk"),
            chunk_type: ChunkType::SpikeTemplate,
            content: ChunkContent::Code {
                language: "typescript".to_string(),
                code: "export const testFunction = () => 'hello';".to_string(),
                framework: Some("nextjs".to_string()),
            },
            metadata: ChunkMetadata {
                source: "test".to_string(),
                tags: vec!["test".to_string(), "function".to_string()],
                frameworks: vec!["nextjs".to_string()],
                patterns: vec!["export-function".to_string()],
                usage_count: 0,
                last_accessed: Utc::now(),
                created_at: Utc::now(),
                file_path: Some("test.ts".to_string()),
                line_range: Some((1, 1)),
                dependencies: vec![],
            },
            embedding: None,
            relationships: vec![],
            quality_score: 0.8,
        };

        // Store chunk
        let chunk_id = engine.store_chunk(chunk.clone()).await.unwrap();
        assert_eq!(chunk_id, chunk.id);

        // Retrieve chunk
        let retrieved = engine.get_chunk(&chunk_id).await.unwrap();
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().content, chunk.content);

        // Check stats
        let stats = engine.get_stats();
        assert_eq!(stats.total_chunks, 1);
        assert_eq!(stats.disk_writes, 1);
    }

    #[tokio::test]
    async fn test_framework_filtering() {
        let temp_dir = TempDir::new().unwrap();
        let config = MemoryConfig {
            storage_path: temp_dir.path().to_path_buf(),
            enable_search: false,
            ..Default::default()
        };

        let engine = MemoryEngine::new(config).await.unwrap();

        // Create Next.js chunk
        let nextjs_chunk = LearningChunk {
            id: ChunkId::new("nextjs-chunk"),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "typescript".to_string(),
                code: "export default function Page() {}".to_string(),
                framework: Some("nextjs".to_string()),
            },
            metadata: ChunkMetadata {
                source: "nextjs".to_string(),
                frameworks: vec!["nextjs".to_string()],
                ..Default::default()
            },
            ..Default::default()
        };

        engine.store_chunk(nextjs_chunk).await.unwrap();

        // Get framework chunks
        let nextjs_chunks = engine.get_framework_chunks("nextjs").await.unwrap();
        assert_eq!(nextjs_chunks.len(), 1);
        assert_eq!(nextjs_chunks[0].id.as_str(), "nextjs-chunk");
    }
}