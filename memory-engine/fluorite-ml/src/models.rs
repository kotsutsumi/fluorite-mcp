//! Model management and ONNX integration
//! 
//! Provides model loading, switching, and lifecycle management with
//! ONNX Runtime integration for cross-platform CPU inference.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, debug, warn};

use crate::{MLConfig, ModelInfo};

/// Model manager for handling multiple ML models
#[derive(Debug)]
pub struct ModelManager {
    config: MLConfig,
    loaded_models: Arc<RwLock<HashMap<String, Box<dyn MLModel + Send + Sync>>>>,
    current_model_name: Arc<RwLock<String>>,
    model_registry: ModelRegistry,
    model_cache: Arc<RwLock<ModelCache>>,
}

/// Trait for ML model implementations
pub trait MLModel {
    /// Get model information
    fn info(&self) -> ModelInfo;
    
    /// Check if model is loaded and ready
    fn is_ready(&self) -> bool;
    
    /// Get memory usage in bytes
    fn memory_usage(&self) -> usize;
    
    /// Unload model to free memory
    fn unload(&mut self) -> Result<()>;
    
    /// Perform model-specific inference (if applicable)
    fn infer(&self, input: &[f32]) -> Result<Vec<f32>>;
}

/// Registry of available models
#[derive(Debug)]
pub struct ModelRegistry {
    models: HashMap<String, ModelConfig>,
}

/// Configuration for a specific model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub name: String,
    pub model_type: ModelType,
    pub path: PathBuf,
    pub dimension: usize,
    pub max_sequence_length: usize,
    pub description: String,
    pub supported_tasks: Vec<String>,
    pub memory_requirement_mb: usize,
    pub performance_metrics: Option<PerformanceMetrics>,
}

/// Types of models supported
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelType {
    ONNX,
    Candle,
    SentenceTransformers,
    FastEmbed,
    Custom,
}

/// Performance metrics for a model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub average_inference_time_ms: f64,
    pub throughput_tokens_per_second: f64,
    pub memory_usage_mb: f64,
    pub accuracy_score: Option<f64>,
}

/// Model cache for managing loaded models
#[derive(Debug)]
struct ModelCache {
    max_size_mb: usize,
    current_size_mb: usize,
    models: HashMap<String, CachedModel>,
    access_order: Vec<String>,
}

/// Cached model entry
#[derive(Debug)]
struct CachedModel {
    model: Box<dyn MLModel + Send + Sync>,
    size_mb: usize,
    last_accessed: std::time::Instant,
    access_count: u64,
}

impl ModelManager {
    /// Create a new model manager
    pub async fn new(config: &MLConfig) -> Result<Self> {
        info!("Initializing model manager");

        let model_registry = ModelRegistry::new(&config.models_path).await?;
        let model_cache = ModelCache::new(512); // 512MB cache by default

        let manager = Self {
            config: config.clone(),
            loaded_models: Arc::new(RwLock::new(HashMap::new())),
            current_model_name: Arc::new(RwLock::new(config.default_embedding_model.clone())),
            model_registry,
            model_cache: Arc::new(RwLock::new(model_cache)),
        };

        // Load default model
        manager.load_model(&config.default_embedding_model).await?;

        info!("Model manager initialized");
        Ok(manager)
    }

    /// Load a model by name
    pub async fn load_model(&self, model_name: &str) -> Result<()> {
        info!("Loading model: {}", model_name);

        // Check if model is already loaded
        {
            let loaded_models = self.loaded_models.read().await;
            if loaded_models.contains_key(model_name) {
                debug!("Model {} already loaded", model_name);
                return Ok(());
            }
        }

        // Get model configuration
        let model_config = self.model_registry.get_model_config(model_name)
            .ok_or_else(|| anyhow::anyhow!("Unknown model: {}", model_name))?;

        // Create model instance
        let model = self.create_model_instance(&model_config).await?;

        // Add to cache
        {
            let mut cache = self.model_cache.write().await;
            cache.add_model(model_name.to_string(), model, model_config.memory_requirement_mb)?;
        }

        // Add to loaded models
        {
            let mut loaded_models = self.loaded_models.write().await;
            let cached_model = {
                let cache = self.model_cache.read().await;
                cache.get_model(model_name).unwrap()
            };
            loaded_models.insert(model_name.to_string(), cached_model);
        }

        info!("Model {} loaded successfully", model_name);
        Ok(())
    }

    /// Switch to a different model
    pub async fn switch_model(&self, model_name: &str) -> Result<()> {
        info!("Switching to model: {}", model_name);

        // Load the model if not already loaded
        self.load_model(model_name).await?;

        // Update current model
        {
            let mut current_model_name = self.current_model_name.write().await;
            *current_model_name = model_name.to_string();
        }

        info!("Successfully switched to model: {}", model_name);
        Ok(())
    }

    /// Get current model information
    pub async fn get_current_model_info(&self) -> Result<ModelInfo> {
        let current_model_name = self.current_model_name.read().await.clone();
        let loaded_models = self.loaded_models.read().await;
        
        let model = loaded_models.get(&current_model_name)
            .ok_or_else(|| anyhow::anyhow!("Current model {} not loaded", current_model_name))?;

        Ok(model.info())
    }

    /// List all available models
    pub async fn list_models(&self) -> Result<Vec<ModelInfo>> {
        let model_configs = self.model_registry.list_models();
        let mut model_infos = Vec::new();

        for config in model_configs {
            let model_info = ModelInfo {
                name: config.name.clone(),
                model_type: format!("{:?}", config.model_type),
                dimension: config.dimension,
                max_sequence_length: config.max_sequence_length,
                description: config.description.clone(),
                supported_languages: vec!["en".to_string()], // Default
                model_size_mb: config.memory_requirement_mb as f64,
                average_inference_time_ms: config.performance_metrics
                    .as_ref()
                    .map(|m| m.average_inference_time_ms)
                    .unwrap_or(50.0),
            };
            model_infos.push(model_info);
        }

        Ok(model_infos)
    }

    /// Get model performance metrics
    pub async fn get_model_metrics(&self, model_name: &str) -> Result<PerformanceMetrics> {
        let config = self.model_registry.get_model_config(model_name)
            .ok_or_else(|| anyhow::anyhow!("Model not found: {}", model_name))?;

        config.performance_metrics
            .ok_or_else(|| anyhow::anyhow!("No performance metrics available for model: {}", model_name))
    }

    /// Unload a model to free memory
    pub async fn unload_model(&self, model_name: &str) -> Result<()> {
        info!("Unloading model: {}", model_name);

        {
            let mut loaded_models = self.loaded_models.write().await;
            if let Some(mut model) = loaded_models.remove(model_name) {
                model.unload()?;
            }
        }

        {
            let mut cache = self.model_cache.write().await;
            cache.remove_model(model_name);
        }

        info!("Model {} unloaded", model_name);
        Ok(())
    }

    /// Clean up all loaded models
    pub async fn cleanup(&self) -> Result<()> {
        info!("Cleaning up model manager");

        let model_names: Vec<String> = {
            let loaded_models = self.loaded_models.read().await;
            loaded_models.keys().cloned().collect()
        };

        for model_name in model_names {
            self.unload_model(&model_name).await?;
        }

        info!("Model manager cleanup completed");
        Ok(())
    }

    /// Create a model instance based on configuration
    async fn create_model_instance(&self, config: &ModelConfig) -> Result<Box<dyn MLModel + Send + Sync>> {
        match config.model_type {
            ModelType::ONNX => {
                Ok(Box::new(ONNXModel::new(&config.path, config).await?))
            }
            ModelType::Candle => {
                Ok(Box::new(CandleModel::new(&config.path, config).await?))
            }
            ModelType::SentenceTransformers => {
                Ok(Box::new(SentenceTransformersMLModel::new(&config.name, config).await?))
            }
            ModelType::FastEmbed => {
                Ok(Box::new(FastEmbedMLModel::new(&config.name, config).await?))
            }
            ModelType::Custom => {
                Err(anyhow::anyhow!("Custom model type not implemented"))
            }
        }
    }
}

impl ModelRegistry {
    /// Create a new model registry
    async fn new(models_path: &Path) -> Result<Self> {
        let mut models = HashMap::new();

        // Add default models
        models.insert("all-MiniLM-L6-v2".to_string(), ModelConfig {
            name: "all-MiniLM-L6-v2".to_string(),
            model_type: ModelType::SentenceTransformers,
            path: models_path.join("sentence-transformers").join("all-MiniLM-L6-v2"),
            dimension: 384,
            max_sequence_length: 256,
            description: "Efficient sentence transformer model".to_string(),
            supported_tasks: vec!["embedding".to_string()],
            memory_requirement_mb: 80,
            performance_metrics: Some(PerformanceMetrics {
                average_inference_time_ms: 50.0,
                throughput_tokens_per_second: 1000.0,
                memory_usage_mb: 80.0,
                accuracy_score: Some(0.85),
            }),
        });

        models.insert("all-mpnet-base-v2".to_string(), ModelConfig {
            name: "all-mpnet-base-v2".to_string(),
            model_type: ModelType::SentenceTransformers,
            path: models_path.join("sentence-transformers").join("all-mpnet-base-v2"),
            dimension: 768,
            max_sequence_length: 384,
            description: "High-quality sentence transformer model".to_string(),
            supported_tasks: vec!["embedding".to_string()],
            memory_requirement_mb: 120,
            performance_metrics: Some(PerformanceMetrics {
                average_inference_time_ms: 80.0,
                throughput_tokens_per_second: 600.0,
                memory_usage_mb: 120.0,
                accuracy_score: Some(0.90),
            }),
        });

        // Add custom ONNX models if they exist
        let onnx_dir = models_path.join("onnx");
        if onnx_dir.exists() {
            if let Ok(entries) = tokio::fs::read_dir(&onnx_dir).await {
                let mut entries = entries;
                while let Ok(Some(entry)) = entries.next_entry().await {
                    if let Some(file_name) = entry.file_name().to_str() {
                        if file_name.ends_with(".onnx") {
                            let model_name = file_name.strip_suffix(".onnx").unwrap();
                            models.insert(model_name.to_string(), ModelConfig {
                                name: model_name.to_string(),
                                model_type: ModelType::ONNX,
                                path: entry.path(),
                                dimension: 384, // Would be determined from model
                                max_sequence_length: 512,
                                description: format!("Custom ONNX model: {}", model_name),
                                supported_tasks: vec!["embedding".to_string()],
                                memory_requirement_mb: 100,
                                performance_metrics: None,
                            });
                        }
                    }
                }
            }
        }

        Ok(Self { models })
    }

    /// Get model configuration by name
    fn get_model_config(&self, name: &str) -> Option<&ModelConfig> {
        self.models.get(name)
    }

    /// List all available models
    fn list_models(&self) -> Vec<&ModelConfig> {
        self.models.values().collect()
    }
}

impl ModelCache {
    fn new(max_size_mb: usize) -> Self {
        Self {
            max_size_mb,
            current_size_mb: 0,
            models: HashMap::new(),
            access_order: Vec::new(),
        }
    }

    fn add_model(
        &mut self, 
        name: String, 
        model: Box<dyn MLModel + Send + Sync>, 
        size_mb: usize
    ) -> Result<()> {
        // Evict models if necessary
        while self.current_size_mb + size_mb > self.max_size_mb && !self.models.is_empty() {
            self.evict_least_recently_used();
        }

        if size_mb > self.max_size_mb {
            return Err(anyhow::anyhow!("Model too large for cache: {}MB > {}MB", size_mb, self.max_size_mb));
        }

        let cached_model = CachedModel {
            model,
            size_mb,
            last_accessed: std::time::Instant::now(),
            access_count: 1,
        };

        self.models.insert(name.clone(), cached_model);
        self.access_order.push(name);
        self.current_size_mb += size_mb;

        Ok(())
    }

    fn get_model(&self, name: &str) -> Option<Box<dyn MLModel + Send + Sync>> {
        // In a real implementation, this would clone or return a reference
        // For now, we'll return None to indicate this needs proper implementation
        None
    }

    fn remove_model(&mut self, name: &str) {
        if let Some(cached_model) = self.models.remove(name) {
            self.current_size_mb -= cached_model.size_mb;
            self.access_order.retain(|n| n != name);
        }
    }

    fn evict_least_recently_used(&mut self) {
        if let Some(lru_name) = self.access_order.first().cloned() {
            self.remove_model(&lru_name);
        }
    }
}

/// ONNX model implementation
#[derive(Debug)]
pub struct ONNXModel {
    model_path: PathBuf,
    config: ModelConfig,
    // In a real implementation, this would hold the ONNX runtime session
}

impl ONNXModel {
    async fn new(model_path: &Path, config: &ModelConfig) -> Result<Self> {
        info!("Loading ONNX model from: {}", model_path.display());
        
        // In a real implementation, we would initialize the ONNX runtime here
        Ok(Self {
            model_path: model_path.to_path_buf(),
            config: config.clone(),
        })
    }
}

impl MLModel for ONNXModel {
    fn info(&self) -> ModelInfo {
        ModelInfo {
            name: self.config.name.clone(),
            model_type: "ONNX".to_string(),
            dimension: self.config.dimension,
            max_sequence_length: self.config.max_sequence_length,
            description: self.config.description.clone(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: self.config.memory_requirement_mb as f64,
            average_inference_time_ms: self.config.performance_metrics
                .as_ref()
                .map(|m| m.average_inference_time_ms)
                .unwrap_or(60.0),
        }
    }

    fn is_ready(&self) -> bool {
        self.model_path.exists()
    }

    fn memory_usage(&self) -> usize {
        self.config.memory_requirement_mb * 1024 * 1024
    }

    fn unload(&mut self) -> Result<()> {
        // In a real implementation, we would cleanup ONNX runtime resources
        Ok(())
    }

    fn infer(&self, input: &[f32]) -> Result<Vec<f32>> {
        // Mock implementation
        let mut output = vec![0.0f32; self.config.dimension];
        for (i, value) in output.iter_mut().enumerate() {
            let input_val = input.get(i % input.len()).unwrap_or(&0.0);
            *value = (input_val * (i as f32 + 1.0) * 0.01).tanh();
        }
        Ok(output)
    }
}

/// Candle model implementation
#[derive(Debug)]
pub struct CandleModel {
    model_path: PathBuf,
    config: ModelConfig,
}

impl CandleModel {
    async fn new(model_path: &Path, config: &ModelConfig) -> Result<Self> {
        info!("Loading Candle model from: {}", model_path.display());
        
        Ok(Self {
            model_path: model_path.to_path_buf(),
            config: config.clone(),
        })
    }
}

impl MLModel for CandleModel {
    fn info(&self) -> ModelInfo {
        ModelInfo {
            name: self.config.name.clone(),
            model_type: "Candle".to_string(),
            dimension: self.config.dimension,
            max_sequence_length: self.config.max_sequence_length,
            description: self.config.description.clone(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: self.config.memory_requirement_mb as f64,
            average_inference_time_ms: 45.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }

    fn memory_usage(&self) -> usize {
        self.config.memory_requirement_mb * 1024 * 1024
    }

    fn unload(&mut self) -> Result<()> {
        Ok(())
    }

    fn infer(&self, input: &[f32]) -> Result<Vec<f32>> {
        // Mock implementation using Candle-style operations
        let mut output = vec![0.0f32; self.config.dimension];
        for (i, value) in output.iter_mut().enumerate() {
            let input_sum = input.iter().sum::<f32>();
            *value = ((input_sum + i as f32) * 0.005).cos();
        }
        Ok(output)
    }
}

/// Sentence Transformers ML model wrapper
#[derive(Debug)]
pub struct SentenceTransformersMLModel {
    model_name: String,
    config: ModelConfig,
}

impl SentenceTransformersMLModel {
    async fn new(model_name: &str, config: &ModelConfig) -> Result<Self> {
        Ok(Self {
            model_name: model_name.to_string(),
            config: config.clone(),
        })
    }
}

impl MLModel for SentenceTransformersMLModel {
    fn info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_name.clone(),
            model_type: "SentenceTransformers".to_string(),
            dimension: self.config.dimension,
            max_sequence_length: self.config.max_sequence_length,
            description: self.config.description.clone(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: self.config.memory_requirement_mb as f64,
            average_inference_time_ms: 50.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }

    fn memory_usage(&self) -> usize {
        self.config.memory_requirement_mb * 1024 * 1024
    }

    fn unload(&mut self) -> Result<()> {
        Ok(())
    }

    fn infer(&self, input: &[f32]) -> Result<Vec<f32>> {
        // Mock sentence transformer inference
        let mut output = vec![0.0f32; self.config.dimension];
        for (i, value) in output.iter_mut().enumerate() {
            let hash = input.iter().enumerate().map(|(j, x)| x * (j as f32 + 1.0)).sum::<f32>();
            *value = ((hash + i as f32) * 0.002).sin();
        }
        
        // Normalize
        let norm: f32 = output.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for value in &mut output {
                *value /= norm;
            }
        }
        
        Ok(output)
    }
}

/// FastEmbed ML model wrapper
#[derive(Debug)]
pub struct FastEmbedMLModel {
    model_name: String,
    config: ModelConfig,
}

impl FastEmbedMLModel {
    async fn new(model_name: &str, config: &ModelConfig) -> Result<Self> {
        Ok(Self {
            model_name: model_name.to_string(),
            config: config.clone(),
        })
    }
}

impl MLModel for FastEmbedMLModel {
    fn info(&self) -> ModelInfo {
        ModelInfo {
            name: self.model_name.clone(),
            model_type: "FastEmbed".to_string(),
            dimension: self.config.dimension,
            max_sequence_length: self.config.max_sequence_length,
            description: self.config.description.clone(),
            supported_languages: vec!["en".to_string()],
            model_size_mb: self.config.memory_requirement_mb as f64,
            average_inference_time_ms: 30.0,
        }
    }

    fn is_ready(&self) -> bool {
        true
    }

    fn memory_usage(&self) -> usize {
        self.config.memory_requirement_mb * 1024 * 1024
    }

    fn unload(&mut self) -> Result<()> {
        Ok(())
    }

    fn infer(&self, input: &[f32]) -> Result<Vec<f32>> {
        // Mock FastEmbed inference  
        let mut output = vec![0.0f32; self.config.dimension];
        for (i, value) in output.iter_mut().enumerate() {
            let weighted_sum = input.iter().enumerate().map(|(j, x)| x * ((j + 1) as f32).sqrt()).sum::<f32>();
            *value = (weighted_sum * (i as f32 + 1.0) * 0.003).tanh();
        }
        Ok(output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn create_test_model_manager() -> (ModelManager, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        
        let config = MLConfig {
            models_path: temp_dir.path().join("models"),
            default_embedding_model: "all-MiniLM-L6-v2".to_string(),
            ..Default::default()
        };
        
        tokio::fs::create_dir_all(&config.models_path).await.unwrap();
        
        let manager = ModelManager::new(&config).await.unwrap();
        (manager, temp_dir)
    }

    #[tokio::test]
    async fn test_model_manager_initialization() {
        let (_manager, _temp_dir) = create_test_model_manager().await;
        // Test passes if no panic occurs during initialization
    }

    #[tokio::test]
    async fn test_model_loading() {
        let (manager, _temp_dir) = create_test_model_manager().await;
        
        // Default model should already be loaded
        let current_info = manager.get_current_model_info().await.unwrap();
        assert_eq!(current_info.name, "all-MiniLM-L6-v2");
    }

    #[tokio::test]
    async fn test_model_switching() {
        let (manager, _temp_dir) = create_test_model_manager().await;
        
        // Switch to a different model
        manager.switch_model("all-mpnet-base-v2").await.unwrap();
        
        let current_info = manager.get_current_model_info().await.unwrap();
        assert_eq!(current_info.name, "all-mpnet-base-v2");
        assert_eq!(current_info.dimension, 768);
    }

    #[tokio::test]
    async fn test_list_models() {
        let (manager, _temp_dir) = create_test_model_manager().await;
        
        let models = manager.list_models().await.unwrap();
        assert!(!models.is_empty());
        
        let model_names: Vec<String> = models.iter().map(|m| m.name.clone()).collect();
        assert!(model_names.contains(&"all-MiniLM-L6-v2".to_string()));
        assert!(model_names.contains(&"all-mpnet-base-v2".to_string()));
    }

    #[tokio::test]
    async fn test_model_unloading() {
        let (manager, _temp_dir) = create_test_model_manager().await;
        
        // Load a second model
        manager.load_model("all-mpnet-base-v2").await.unwrap();
        
        // Unload it
        manager.unload_model("all-mpnet-base-v2").await.unwrap();
        
        // Should still have the default model
        let current_info = manager.get_current_model_info().await.unwrap();
        assert_eq!(current_info.name, "all-MiniLM-L6-v2");
    }

    #[test]
    fn test_model_cache() {
        let mut cache = ModelCache::new(100); // 100MB cache
        assert_eq!(cache.current_size_mb, 0);
        assert_eq!(cache.models.len(), 0);
    }
}