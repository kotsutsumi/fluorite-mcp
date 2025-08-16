//! Fluorite ML Engine
//! 
//! CPU-only machine learning integration providing semantic similarity, embeddings,
//! and pattern recognition for the Fluorite memory engine. Designed to work with
//! Spike templates and code patterns without requiring GPU acceleration.
//! 
//! Features:
//! - ONNX Runtime integration for cross-platform model execution
//! - Multiple embedding models (sentence-transformers, custom models)
//! - Semantic similarity calculation with configurable algorithms  
//! - Pattern clustering and classification
//! - Incremental learning and model fine-tuning
//! - Memory-efficient processing for large codebases

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, debug, warn};

pub mod embeddings;
pub mod similarity;
pub mod models;
pub mod clustering;
pub mod training;

pub use embeddings::*;
pub use similarity::*;
pub use models::*;
pub use clustering::*;
pub use training::*;

/// Configuration for the ML engine
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLConfig {
    /// Directory for storing models and cached embeddings
    pub models_path: PathBuf,
    /// Default embedding model to use
    pub default_embedding_model: String,
    /// Maximum cache size for embeddings (MB)
    pub embedding_cache_size_mb: usize,
    /// Similarity threshold for pattern matching
    pub similarity_threshold: f32,
    /// Number of threads for CPU-intensive operations
    pub num_threads: usize,
    /// Enable GPU acceleration if available (fallback to CPU)
    pub enable_gpu_fallback: bool,
    /// Batch size for processing embeddings
    pub batch_size: usize,
    /// Enable incremental learning
    pub enable_incremental_learning: bool,
}

impl Default for MLConfig {
    fn default() -> Self {
        Self {
            models_path: PathBuf::from("./models"),
            default_embedding_model: "all-MiniLM-L6-v2".to_string(),
            embedding_cache_size_mb: 512,
            similarity_threshold: 0.7,
            num_threads: num_cpus::get(),
            enable_gpu_fallback: false, // CPU-only as requested
            batch_size: 32,
            enable_incremental_learning: true,
        }
    }
}

/// Main ML engine coordinating all machine learning operations
#[derive(Debug)]
pub struct MLEngine {
    config: MLConfig,
    embedding_engine: Arc<EmbeddingEngine>,
    similarity_engine: Arc<SimilarityEngine>,
    model_manager: Arc<ModelManager>,
    clustering_engine: Arc<ClusteringEngine>,
    training_engine: Option<Arc<TrainingEngine>>,
    // Runtime state
    statistics: Arc<RwLock<MLStatistics>>,
    cache_metrics: Arc<RwLock<CacheMetrics>>,
}

/// ML engine statistics and performance metrics
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct MLStatistics {
    /// Total embeddings generated
    pub embeddings_generated: u64,
    /// Total similarity calculations performed
    pub similarity_calculations: u64,
    /// Cache hit rate for embeddings
    pub cache_hit_rate: f64,
    /// Average embedding generation time (ms)
    pub avg_embedding_time_ms: f64,
    /// Average similarity calculation time (ms)  
    pub avg_similarity_time_ms: f64,
    /// Total training iterations completed
    pub training_iterations: u64,
    /// Model accuracy scores by task
    pub accuracy_scores: HashMap<String, f64>,
    /// Memory usage statistics
    pub memory_usage_mb: f64,
}

/// Cache performance metrics
#[derive(Debug, Default)]
pub struct CacheMetrics {
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub size_bytes: u64,
}

impl MLEngine {
    /// Create a new ML engine with the given configuration
    pub async fn new(config: MLConfig) -> Result<Self> {
        info!("Initializing Fluorite ML Engine (CPU-only mode)");

        // Create models directory if it doesn't exist
        tokio::fs::create_dir_all(&config.models_path).await
            .context("Failed to create models directory")?;

        // Initialize embedding engine
        let embedding_engine = Arc::new(
            EmbeddingEngine::new(&config).await
                .context("Failed to initialize embedding engine")?
        );

        // Initialize similarity engine  
        let similarity_engine = Arc::new(
            SimilarityEngine::new(&config).await
                .context("Failed to initialize similarity engine")?
        );

        // Initialize model manager
        let model_manager = Arc::new(
            ModelManager::new(&config).await
                .context("Failed to initialize model manager")?
        );

        // Initialize clustering engine
        let clustering_engine = Arc::new(
            ClusteringEngine::new(&config).await
                .context("Failed to initialize clustering engine")?
        );

        // Initialize training engine if incremental learning is enabled
        let training_engine = if config.enable_incremental_learning {
            Some(Arc::new(
                TrainingEngine::new(&config).await
                    .context("Failed to initialize training engine")?
            ))
        } else {
            None
        };

        let engine = Self {
            config,
            embedding_engine,
            similarity_engine,
            model_manager,
            clustering_engine,
            training_engine,
            statistics: Arc::new(RwLock::new(MLStatistics::default())),
            cache_metrics: Arc::new(RwLock::new(CacheMetrics::default())),
        };

        info!("ML Engine initialized successfully");
        Ok(engine)
    }

    /// Generate embeddings for a text input
    pub async fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        let start_time = std::time::Instant::now();
        
        let embedding = self.embedding_engine.generate_embedding(text).await
            .context("Failed to generate embedding")?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.embeddings_generated += 1;
            let duration_ms = start_time.elapsed().as_millis() as f64;
            stats.avg_embedding_time_ms = 
                (stats.avg_embedding_time_ms * (stats.embeddings_generated - 1) as f64 + duration_ms) 
                / stats.embeddings_generated as f64;
        }

        Ok(embedding)
    }

    /// Generate embeddings for multiple texts in batch
    pub async fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        let start_time = std::time::Instant::now();
        
        let embeddings = self.embedding_engine.generate_embeddings_batch(texts).await
            .context("Failed to generate batch embeddings")?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.embeddings_generated += texts.len() as u64;
            let duration_ms = start_time.elapsed().as_millis() as f64;
            let avg_per_item = duration_ms / texts.len() as f64;
            stats.avg_embedding_time_ms = 
                (stats.avg_embedding_time_ms * (stats.embeddings_generated - texts.len() as u64) as f64 + duration_ms) 
                / stats.embeddings_generated as f64;
        }

        Ok(embeddings)
    }

    /// Calculate similarity between two embeddings
    pub async fn calculate_similarity(&self, embedding1: &[f32], embedding2: &[f32]) -> Result<f32> {
        let start_time = std::time::Instant::now();
        
        let similarity = self.similarity_engine.calculate_similarity(embedding1, embedding2)
            .context("Failed to calculate similarity")?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.similarity_calculations += 1;
            let duration_ms = start_time.elapsed().as_millis() as f64;
            stats.avg_similarity_time_ms = 
                (stats.avg_similarity_time_ms * (stats.similarity_calculations - 1) as f64 + duration_ms) 
                / stats.similarity_calculations as f64;
        }

        Ok(similarity)
    }

    /// Find similar embeddings in a collection
    pub async fn find_similar(&self, query_embedding: &[f32], candidates: &[Vec<f32>], top_k: usize) -> Result<Vec<SimilarityResult>> {
        self.similarity_engine.find_similar(query_embedding, candidates, top_k).await
    }

    /// Cluster embeddings using the configured clustering algorithm
    pub async fn cluster_embeddings(&self, embeddings: &[Vec<f32>], num_clusters: usize) -> Result<ClusteringResult> {
        self.clustering_engine.cluster_embeddings(embeddings, num_clusters).await
    }

    /// Perform semantic search across a collection of texts
    pub async fn semantic_search(&self, query: &str, documents: &[String], top_k: usize) -> Result<Vec<SearchResult>> {
        debug!("Performing semantic search for query: {}", query);
        
        // Generate embedding for query
        let query_embedding = self.generate_embedding(query).await?;
        
        // Generate embeddings for documents (with caching)
        let doc_embeddings = self.generate_embeddings_batch(documents).await?;
        
        // Find most similar documents
        let similarity_results = self.find_similar(&query_embedding, &doc_embeddings, top_k).await?;
        
        // Convert to search results with document content
        let search_results: Vec<SearchResult> = similarity_results.into_iter()
            .map(|sim_result| SearchResult {
                document_index: sim_result.index,
                document_content: documents[sim_result.index].clone(),
                similarity_score: sim_result.score,
                embedding: doc_embeddings[sim_result.index].clone(),
            })
            .collect();

        Ok(search_results)
    }

    /// Train or fine-tune models with new data
    pub async fn train_incremental(&self, training_data: &[TrainingExample]) -> Result<TrainingResult> {
        if let Some(training_engine) = &self.training_engine {
            training_engine.train_incremental(training_data).await
        } else {
            Err(anyhow::anyhow!("Training engine not enabled"))
        }
    }

    /// Get current ML engine statistics
    pub async fn get_statistics(&self) -> MLStatistics {
        self.statistics.read().await.clone()
    }

    /// Get cache performance metrics
    pub async fn get_cache_metrics(&self) -> CacheMetrics {
        self.cache_metrics.read().await.clone()
    }

    /// Update model configuration
    pub async fn update_model(&self, model_name: &str) -> Result<()> {
        self.model_manager.switch_model(model_name).await
    }

    /// Get available models
    pub async fn list_available_models(&self) -> Result<Vec<ModelInfo>> {
        self.model_manager.list_models().await
    }

    /// Optimize performance by warming up caches and models
    pub async fn warmup(&self) -> Result<()> {
        info!("Warming up ML engine...");
        
        // Generate a sample embedding to load models
        let _sample = self.generate_embedding("sample text for warmup").await?;
        
        // Warm up similarity calculations
        let sample_embedding = vec![0.1f32; 384]; // Typical embedding size
        let _similarity = self.calculate_similarity(&sample_embedding, &sample_embedding).await?;
        
        info!("ML engine warmup completed");
        Ok(())
    }

    /// Clean up resources and save state
    pub async fn shutdown(&self) -> Result<()> {
        info!("Shutting down ML engine...");
        
        // Save current statistics
        let stats = self.get_statistics().await;
        let stats_path = self.config.models_path.join("ml_statistics.json");
        let stats_json = serde_json::to_string_pretty(&stats)?;
        tokio::fs::write(stats_path, stats_json).await?;
        
        // Clean up model resources
        self.model_manager.cleanup().await?;
        
        info!("ML engine shutdown completed");
        Ok(())
    }
}

/// Result of a similarity search operation
#[derive(Debug, Clone)]
pub struct SearchResult {
    pub document_index: usize,
    pub document_content: String,
    pub similarity_score: f32,
    pub embedding: Vec<f32>,
}

/// Result of a similarity calculation
#[derive(Debug, Clone)]
pub struct SimilarityResult {
    pub index: usize,
    pub score: f32,
}

/// Training example for incremental learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingExample {
    pub input_text: String,
    pub expected_output: String,
    pub task_type: String,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Result of a training operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingResult {
    pub accuracy: f64,
    pub loss: f64,
    pub training_time_seconds: f64,
    pub examples_processed: usize,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn create_test_ml_engine() -> (MLEngine, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        
        let config = MLConfig {
            models_path: temp_dir.path().join("models"),
            embedding_cache_size_mb: 32, // Small cache for testing
            batch_size: 4,
            num_threads: 2,
            ..Default::default()
        };
        
        let engine = MLEngine::new(config).await.unwrap();
        (engine, temp_dir)
    }

    #[tokio::test]
    async fn test_ml_engine_initialization() {
        let (_engine, _temp_dir) = create_test_ml_engine().await;
        // Test passes if no panic occurs during initialization
    }

    #[tokio::test]
    async fn test_embedding_generation() {
        let (engine, _temp_dir) = create_test_ml_engine().await;
        
        let embedding = engine.generate_embedding("Hello world").await.unwrap();
        assert!(!embedding.is_empty());
        assert!(embedding.len() > 0);
    }

    #[tokio::test]
    async fn test_batch_embedding_generation() {
        let (engine, _temp_dir) = create_test_ml_engine().await;
        
        let texts = vec![
            "First text".to_string(),
            "Second text".to_string(),
            "Third text".to_string(),
        ];
        
        let embeddings = engine.generate_embeddings_batch(&texts).await.unwrap();
        assert_eq!(embeddings.len(), texts.len());
        
        for embedding in &embeddings {
            assert!(!embedding.is_empty());
        }
    }

    #[tokio::test]
    async fn test_similarity_calculation() {
        let (engine, _temp_dir) = create_test_ml_engine().await;
        
        let text1 = "Hello world";
        let text2 = "Hello world";
        let text3 = "Completely different text";
        
        let emb1 = engine.generate_embedding(text1).await.unwrap();
        let emb2 = engine.generate_embedding(text2).await.unwrap();
        let emb3 = engine.generate_embedding(text3).await.unwrap();
        
        let similarity_same = engine.calculate_similarity(&emb1, &emb2).await.unwrap();
        let similarity_different = engine.calculate_similarity(&emb1, &emb3).await.unwrap();
        
        // Identical texts should have higher similarity
        assert!(similarity_same > similarity_different);
        assert!(similarity_same > 0.8); // Very similar
        assert!(similarity_different < similarity_same);
    }

    #[tokio::test]
    async fn test_semantic_search() {
        let (engine, _temp_dir) = create_test_ml_engine().await;
        
        let query = "machine learning";
        let documents = vec![
            "Artificial intelligence and machine learning".to_string(),
            "Cooking recipes and food preparation".to_string(),
            "Deep learning neural networks".to_string(),
            "Travel destinations in Europe".to_string(),
        ];
        
        let results = engine.semantic_search(query, &documents, 2).await.unwrap();
        
        assert_eq!(results.len(), 2);
        // First result should be most similar (AI/ML related)
        assert!(results[0].document_content.contains("machine learning") || 
                results[0].document_content.contains("Deep learning"));
    }

    #[tokio::test]
    async fn test_statistics_tracking() {
        let (engine, _temp_dir) = create_test_ml_engine().await;
        
        // Generate some embeddings
        let _emb1 = engine.generate_embedding("test1").await.unwrap();
        let _emb2 = engine.generate_embedding("test2").await.unwrap();
        
        // Calculate similarity
        let emb1 = vec![1.0, 0.0, 0.0];
        let emb2 = vec![0.0, 1.0, 0.0];
        let _similarity = engine.calculate_similarity(&emb1, &emb2).await.unwrap();
        
        let stats = engine.get_statistics().await;
        assert_eq!(stats.embeddings_generated, 2);
        assert_eq!(stats.similarity_calculations, 1);
        assert!(stats.avg_embedding_time_ms > 0.0);
        assert!(stats.avg_similarity_time_ms > 0.0);
    }
}