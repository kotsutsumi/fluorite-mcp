//! Embedding generation and management
//! 
//! Provides multiple embedding models with CPU-only execution, caching,
//! and batch processing capabilities for efficient text representation.

use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{debug, info, warn};
use lru::LruCache;
use std::num::NonZeroUsize;

use crate::{MLConfig, CacheMetrics};

/// Embedding engine managing multiple models and caching
#[derive(Debug)]
pub struct EmbeddingEngine {
    config: MLConfig,
    current_model: Arc<RwLock<Box<dyn EmbeddingModel + Send + Sync>>>,
    embedding_cache: Arc<RwLock<LruCache<String, Vec<f32>>>>,
    cache_metrics: Arc<RwLock<CacheMetrics>>,
    model_registry: HashMap<String, EmbeddingModelType>,
}

/// Types of embedding models available
#[derive(Debug, Clone)]
pub enum EmbeddingModelType {
    SentenceTransformers(String), // Model name
    FastEmbed(String),           // Model name  
    ONNX(String),               // Model path
    Candle(String),             // Model name/path
}

/// Trait for embedding model implementations
pub trait EmbeddingModel {
    /// Generate embedding for a single text
    fn generate_embedding(&self, text: &str) -> Result<Vec<f32>>;
    
    /// Generate embeddings for multiple texts (batch processing)
    fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>>;
    
    /// Get the dimensionality of embeddings produced by this model
    fn embedding_dimension(&self) -> usize;
    
    /// Get model information
    fn model_info(&self) -> ModelInfo;
    
    /// Check if model is ready for inference
    fn is_ready(&self) -> bool;
}

/// Model information and metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub model_type: String,
    pub dimension: usize,
    pub max_sequence_length: usize,
    pub description: String,
    pub supported_languages: Vec<String>,
    pub model_size_mb: f64,
    pub average_inference_time_ms: f64,
}

impl EmbeddingEngine {
    /// Create a new embedding engine
    pub async fn new(config: &MLConfig) -> Result<Self> {
        info!("Initializing embedding engine with model: {}", config.default_embedding_model);

        // Initialize cache
        let cache_size = (config.embedding_cache_size_mb * 1024 * 1024) / (384 * 4); // Approximate entries
        let cache_size = NonZeroUsize::new(cache_size.max(1000)).unwrap(); // At least 1000 entries
        let embedding_cache = Arc::new(RwLock::new(LruCache::new(cache_size)));

        // Build model registry
        let model_registry = Self::build_model_registry();

        // Load default model
        let current_model = Self::load_model(&config.default_embedding_model, &model_registry, config).await?;

        Ok(Self {
            config: config.clone(),
            current_model: Arc::new(RwLock::new(current_model)),
            embedding_cache,
            cache_metrics: Arc::new(RwLock::new(CacheMetrics::default())),
            model_registry,
        })
    }

    /// Generate embedding for a single text with caching
    pub async fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        // Check cache first
        let cache_key = self.create_cache_key(text);
        
        {
            let cache = self.embedding_cache.read().await;
            if let Some(embedding) = cache.peek(&cache_key) {
                // Cache hit
                {
                    let mut metrics = self.cache_metrics.write().await;
                    metrics.hits += 1;
                }
                return Ok(embedding.clone());
            }
        }

        // Cache miss - generate embedding
        {
            let mut metrics = self.cache_metrics.write().await;
            metrics.misses += 1;
        }

        let model = self.current_model.read().await;
        let embedding = model.generate_embedding(text)
            .context("Failed to generate embedding")?;

        // Store in cache
        {
            let mut cache = self.embedding_cache.write().await;
            if cache.put(cache_key, embedding.clone()).is_some() {
                // Eviction occurred
                let mut metrics = self.cache_metrics.write().await;
                metrics.evictions += 1;
            }
        }

        Ok(embedding)
    }

    /// Generate embeddings for multiple texts in batch
    pub async fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        if texts.is_empty() {
            return Ok(vec![]);
        }

        // Check cache for existing embeddings
        let mut cached_embeddings = HashMap::new();
        let mut texts_to_process = Vec::new();
        let mut indices_to_process = Vec::new();

        {
            let cache = self.embedding_cache.read().await;
            for (i, text) in texts.iter().enumerate() {
                let cache_key = self.create_cache_key(text);
                if let Some(embedding) = cache.peek(&cache_key) {
                    cached_embeddings.insert(i, embedding.clone());
                } else {
                    texts_to_process.push(text.clone());
                    indices_to_process.push(i);
                }
            }
        }

        // Update cache metrics
        {
            let mut metrics = self.cache_metrics.write().await;
            metrics.hits += cached_embeddings.len() as u64;
            metrics.misses += texts_to_process.len() as u64;
        }

        // Process uncached texts
        let mut new_embeddings = HashMap::new();
        if !texts_to_process.is_empty() {
            let model = self.current_model.read().await;
            let batch_embeddings = model.generate_embeddings_batch(&texts_to_process)
                .context("Failed to generate batch embeddings")?;

            // Store new embeddings in cache and result map
            {
                let mut cache = self.embedding_cache.write().await;
                for (i, (original_index, embedding)) in indices_to_process.iter().zip(batch_embeddings.iter()).enumerate() {
                    let cache_key = self.create_cache_key(&texts_to_process[i]);
                    if cache.put(cache_key, embedding.clone()).is_some() {
                        let mut metrics = self.cache_metrics.write().await;
                        metrics.evictions += 1;
                    }
                    new_embeddings.insert(*original_index, embedding.clone());
                }
            }
        }

        // Combine cached and new embeddings in original order
        let mut result = Vec::with_capacity(texts.len());
        for i in 0..texts.len() {
            if let Some(embedding) = cached_embeddings.get(&i) {
                result.push(embedding.clone());
            } else if let Some(embedding) = new_embeddings.get(&i) {
                result.push(embedding.clone());
            } else {
                return Err(anyhow::anyhow!("Missing embedding for index {}", i));
            }
        }

        Ok(result)
    }

    /// Switch to a different embedding model
    pub async fn switch_model(&self, model_name: &str) -> Result<()> {
        info!("Switching to embedding model: {}", model_name);
        
        let new_model = Self::load_model(model_name, &self.model_registry, &self.config).await?;
        
        {
            let mut current_model = self.current_model.write().await;
            *current_model = new_model;
        }

        // Clear cache since embeddings may be different
        {
            let mut cache = self.embedding_cache.write().await;
            cache.clear();
        }

        info!("Successfully switched to model: {}", model_name);
        Ok(())
    }

    /// Get current model information
    pub async fn get_model_info(&self) -> ModelInfo {
        let model = self.current_model.read().await;
        model.model_info()
    }

    /// Get cache statistics
    pub async fn get_cache_metrics(&self) -> CacheMetrics {
        let metrics = self.cache_metrics.read().await;
        let cache = self.embedding_cache.read().await;
        
        CacheMetrics {
            hits: metrics.hits,
            misses: metrics.misses,
            evictions: metrics.evictions,
            size_bytes: cache.len() as u64 * 384 * 4, // Approximate size
        }
    }

    /// Clear embedding cache
    pub async fn clear_cache(&self) {
        let mut cache = self.embedding_cache.write().await;
        cache.clear();
        info!("Embedding cache cleared");
    }

    /// Create cache key for a text
    fn create_cache_key(&self, text: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        text.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    /// Build registry of available models
    fn build_model_registry() -> HashMap<String, EmbeddingModelType> {
        let mut registry = HashMap::new();
        
        // Sentence Transformers models
        registry.insert("all-MiniLM-L6-v2".to_string(), 
                       EmbeddingModelType::SentenceTransformers("all-MiniLM-L6-v2".to_string()));
        registry.insert("all-mpnet-base-v2".to_string(), 
                       EmbeddingModelType::SentenceTransformers("all-mpnet-base-v2".to_string()));
        registry.insert("multi-qa-MiniLM-L6-cos-v1".to_string(), 
                       EmbeddingModelType::SentenceTransformers("multi-qa-MiniLM-L6-cos-v1".to_string()));

        // FastEmbed models  
        registry.insert("fast-bge-small".to_string(),
                       EmbeddingModelType::FastEmbed("BAAI/bge-small-en".to_string()));
        registry.insert("fast-gte-small".to_string(),
                       EmbeddingModelType::FastEmbed("thenlper/gte-small".to_string()));

        registry
    }

    /// Load a specific embedding model
    async fn load_model(
        model_name: &str, 
        registry: &HashMap<String, EmbeddingModelType>,
        config: &MLConfig
    ) -> Result<Box<dyn EmbeddingModel + Send + Sync>> {
        let model_type = registry.get(model_name)
            .ok_or_else(|| anyhow::anyhow!("Unknown model: {}", model_name))?;

        match model_type {
            EmbeddingModelType::SentenceTransformers(name) => {
                Ok(Box::new(SentenceTransformersModel::new(name, config).await?))
            }
            EmbeddingModelType::FastEmbed(name) => {
                Ok(Box::new(FastEmbedModel::new(name, config).await?))
            }
            EmbeddingModelType::ONNX(path) => {
                Ok(Box::new(ONNXEmbeddingModel::new(path, config).await?))
            }
            EmbeddingModelType::Candle(name) => {
                Ok(Box::new(CandleEmbeddingModel::new(name, config).await?))
            }
        }
    }
}

/// Sentence Transformers model implementation
#[derive(Debug)]
pub struct SentenceTransformersModel {
    model_name: String,
    dimension: usize,
    max_sequence_length: usize,
    // In a real implementation, this would hold the actual model
}

impl SentenceTransformersModel {
    pub async fn new(model_name: &str, _config: &MLConfig) -> Result<Self> {
        info!("Loading Sentence Transformers model: {}", model_name);
        
        // In a real implementation, we would load the actual model here
        // For now, we'll simulate with predefined dimensions
        let (dimension, max_length) = match model_name {
            "all-MiniLM-L6-v2" => (384, 256),
            "all-mpnet-base-v2" => (768, 384),
            "multi-qa-MiniLM-L6-cos-v1" => (384, 512),
            _ => (384, 256), // Default
        };

        Ok(Self {
            model_name: model_name.to_string(),
            dimension,
            max_sequence_length: max_length,
        })
    }
}

impl EmbeddingModel for SentenceTransformersModel {
    fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        // In a real implementation, this would use the actual sentence-transformers model
        // For now, we'll generate a mock embedding
        debug!("Generating embedding for text length: {}", text.len());
        
        let mut embedding = vec![0.0f32; self.dimension];
        
        // Simple hash-based mock embedding
        let text_hash = text.chars().map(|c| c as u32).sum::<u32>() as f32;
        for (i, value) in embedding.iter_mut().enumerate() {
            *value = ((text_hash + i as f32) * 0.001).sin();
        }

        // Normalize the embedding
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for value in &mut embedding {
                *value /= norm;
            }
        }

        Ok(embedding)
    }

    fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        texts.iter()
            .map(|text| self.generate_embedding(text))
            .collect()
    }

    fn embedding_dimension(&self) -> usize {
        self.dimension
    }

    fn model_info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_name.clone(),
            model_type: "sentence-transformers".to_string(),
            dimension: self.dimension,
            max_sequence_length: self.max_sequence_length,
            description: "Sentence Transformers model for semantic embeddings".to_string(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: 80.0, // Approximate
            average_inference_time_ms: 50.0,
        }
    }

    fn is_ready(&self) -> bool {
        true // In real implementation, check if model is loaded
    }
}

/// FastEmbed model implementation
#[derive(Debug)]
pub struct FastEmbedModel {
    model_name: String,
    dimension: usize,
    max_sequence_length: usize,
}

impl FastEmbedModel {
    pub async fn new(model_name: &str, _config: &MLConfig) -> Result<Self> {
        info!("Loading FastEmbed model: {}", model_name);
        
        let dimension = match model_name {
            "BAAI/bge-small-en" => 384,
            "thenlper/gte-small" => 384,
            _ => 384,
        };

        Ok(Self {
            model_name: model_name.to_string(),
            dimension,
            max_sequence_length: 512,
        })
    }
}

impl EmbeddingModel for FastEmbedModel {
    fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        // Mock implementation - in real code, use FastEmbed
        debug!("Generating FastEmbed embedding for text length: {}", text.len());
        
        let mut embedding = vec![0.0f32; self.dimension];
        let text_hash = text.len() as f32;
        
        for (i, value) in embedding.iter_mut().enumerate() {
            *value = ((text_hash * i as f32) * 0.01).cos();
        }

        // Normalize
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for value in &mut embedding {
                *value /= norm;
            }
        }

        Ok(embedding)
    }

    fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        texts.iter()
            .map(|text| self.generate_embedding(text))
            .collect()
    }

    fn embedding_dimension(&self) -> usize {
        self.dimension
    }

    fn model_info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_name.clone(),
            model_type: "fastembed".to_string(),
            dimension: self.dimension,
            max_sequence_length: self.max_sequence_length,
            description: "FastEmbed model for efficient embeddings".to_string(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: 60.0,
            average_inference_time_ms: 30.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }
}

/// ONNX model implementation for custom models
#[derive(Debug)]
pub struct ONNXEmbeddingModel {
    model_path: String,
    dimension: usize,
}

impl ONNXEmbeddingModel {
    pub async fn new(model_path: &str, _config: &MLConfig) -> Result<Self> {
        info!("Loading ONNX model from: {}", model_path);
        
        // In real implementation, load ONNX model here
        Ok(Self {
            model_path: model_path.to_string(),
            dimension: 384, // Would be determined from model
        })
    }
}

impl EmbeddingModel for ONNXEmbeddingModel {
    fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        // Mock implementation
        let mut embedding = vec![0.0f32; self.dimension];
        let text_bytes = text.as_bytes();
        
        for (i, value) in embedding.iter_mut().enumerate() {
            let byte_val = text_bytes.get(i % text_bytes.len()).unwrap_or(&0) as f32;
            *value = (byte_val * 0.01).tanh();
        }

        Ok(embedding)
    }

    fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        texts.iter()
            .map(|text| self.generate_embedding(text))
            .collect()
    }

    fn embedding_dimension(&self) -> usize {
        self.dimension
    }

    fn model_info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_path.clone(),
            model_type: "onnx".to_string(),
            dimension: self.dimension,
            max_sequence_length: 512,
            description: "Custom ONNX embedding model".to_string(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: 100.0,
            average_inference_time_ms: 40.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }
}

/// Candle-based model implementation
#[derive(Debug)]
pub struct CandleEmbeddingModel {
    model_name: String,
    dimension: usize,
}

impl CandleEmbeddingModel {
    pub async fn new(model_name: &str, _config: &MLConfig) -> Result<Self> {
        info!("Loading Candle model: {}", model_name);
        
        Ok(Self {
            model_name: model_name.to_string(),
            dimension: 384,
        })
    }
}

impl EmbeddingModel for CandleEmbeddingModel {
    fn generate_embedding(&self, text: &str) -> Result<Vec<f32>> {
        // Mock implementation
        let mut embedding = vec![0.0f32; self.dimension];
        let char_sum = text.chars().map(|c| c as u32).sum::<u32>() as f32;
        
        for (i, value) in embedding.iter_mut().enumerate() {
            *value = ((char_sum + i as f32) * 0.003).sin();
        }

        // Normalize
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for value in &mut embedding {
                *value /= norm;
            }
        }

        Ok(embedding)
    }

    fn generate_embeddings_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>> {
        texts.iter()
            .map(|text| self.generate_embedding(text))
            .collect()
    }

    fn embedding_dimension(&self) -> usize {
        self.dimension
    }

    fn model_info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_name.clone(),
            model_type: "candle".to_string(),
            dimension: self.dimension,
            max_sequence_length: 512,
            description: "Candle-based embedding model".to_string(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: 90.0,
            average_inference_time_ms: 45.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn create_test_embedding_engine() -> (EmbeddingEngine, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        
        let config = MLConfig {
            models_path: temp_dir.path().join("models"),
            default_embedding_model: "all-MiniLM-L6-v2".to_string(),
            embedding_cache_size_mb: 32,
            ..Default::default()
        };
        
        let engine = EmbeddingEngine::new(&config).await.unwrap();
        (engine, temp_dir)
    }

    #[tokio::test]
    async fn test_embedding_generation() {
        let (engine, _temp_dir) = create_test_embedding_engine().await;
        
        let embedding = engine.generate_embedding("Hello, world!").await.unwrap();
        assert_eq!(embedding.len(), 384); // all-MiniLM-L6-v2 dimension
        
        // Check normalization
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((norm - 1.0).abs() < 0.001); // Should be normalized
    }

    #[tokio::test]
    async fn test_batch_embedding_generation() {
        let (engine, _temp_dir) = create_test_embedding_engine().await;
        
        let texts = vec![
            "First text".to_string(),
            "Second text".to_string(),
            "Third text".to_string(),
        ];
        
        let embeddings = engine.generate_embeddings_batch(&texts).await.unwrap();
        assert_eq!(embeddings.len(), 3);
        
        for embedding in &embeddings {
            assert_eq!(embedding.len(), 384);
        }
    }

    #[tokio::test]
    async fn test_embedding_caching() {
        let (engine, _temp_dir) = create_test_embedding_engine().await;
        
        let text = "Test caching";
        
        // First call should miss cache
        let _embedding1 = engine.generate_embedding(text).await.unwrap();
        let metrics1 = engine.get_cache_metrics().await;
        assert_eq!(metrics1.misses, 1);
        assert_eq!(metrics1.hits, 0);
        
        // Second call should hit cache
        let _embedding2 = engine.generate_embedding(text).await.unwrap();
        let metrics2 = engine.get_cache_metrics().await;
        assert_eq!(metrics2.misses, 1);
        assert_eq!(metrics2.hits, 1);
    }

    #[tokio::test]
    async fn test_model_switching() {
        let (engine, _temp_dir) = create_test_embedding_engine().await;
        
        let initial_info = engine.get_model_info().await;
        assert_eq!(initial_info.name, "all-MiniLM-L6-v2");
        
        // Switch to different model
        engine.switch_model("all-mpnet-base-v2").await.unwrap();
        
        let new_info = engine.get_model_info().await;
        assert_eq!(new_info.name, "all-mpnet-base-v2");
        assert_eq!(new_info.dimension, 768); // Different dimension
    }
}