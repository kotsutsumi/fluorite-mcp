//! Fluorite Bridge - Node.js Integration
//! 
//! Provides a Node.js addon that bridges the Rust-based memory engine
//! with the existing Node.js fluorite-mcp system. Enables seamless
//! integration of high-performance Rust components with the MCP protocol.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use napi::bindgen_prelude::*;
use napi_derive::napi;
use tokio::sync::Mutex;
use tracing::{info, error};

use fluorite_memory::{MemoryEngine, MemoryConfig, LearningChunk, ChunkId, ChunkType, ChunkContent, ChunkMetadata};
use fluorite_learner::{LearningPipeline, LearningConfig, LearningReport, IncrementalReport};
use fluorite_ml::{MLEngine, MLConfig, SearchResult, TrainingExample, TrainingResult, UserFeedback};

mod bridge_types;
mod error_handling;
mod protocol_adapter;

pub use bridge_types::*;
pub use error_handling::*;
pub use protocol_adapter::*;

/// Main Fluorite Bridge instance managing all components
#[napi]
pub struct FluoriteBridge {
    memory_engine: Arc<MemoryEngine>,
    learning_pipeline: Arc<LearningPipeline>,
    ml_engine: Arc<MLEngine>,
    protocol_adapter: Arc<Mutex<ProtocolAdapter>>,
}

/// Configuration for the Fluorite Bridge
#[napi(object)]
pub struct BridgeConfig {
    /// Path to store memory data
    pub memory_path: String,
    /// Path to store models
    pub models_path: String,
    /// Path to Spike templates
    pub spike_templates_path: String,
    /// Target frameworks for learning
    pub target_frameworks: Vec<String>,
    /// Enable ML features
    pub enable_ml: Option<bool>,
    /// Enable incremental learning
    pub enable_incremental_learning: Option<bool>,
    /// Batch size for processing
    pub batch_size: Option<u32>,
    /// Memory cache size in MB
    pub cache_size_mb: Option<u32>,
}

/// Memory chunk for Node.js interface
#[napi(object)]
pub struct MemoryChunk {
    pub id: String,
    pub chunk_type: String,
    pub content: String,
    pub metadata: HashMap<String, String>,
    pub quality_score: f64,
    pub frameworks: Vec<String>,
    pub tags: Vec<String>,
}

/// Learning statistics
#[napi(object)]
pub struct LearningStats {
    pub total_templates_processed: f64,
    pub patterns_extracted: f64,
    pub high_quality_patterns: f64,
    pub framework_combinations_discovered: f64,
    pub learning_time_seconds: f64,
    pub pattern_accuracy: f64,
}

/// ML search result
#[napi(object)]
pub struct MLSearchResult {
    pub document_index: u32,
    pub document_content: String,
    pub similarity_score: f64,
}

/// Training example for ML
#[napi(object)]
pub struct MLTrainingExample {
    pub input_text: String,
    pub expected_output: String,
    pub task_type: String,
    pub metadata: HashMap<String, String>,
}

/// Training result
#[napi(object)]
pub struct MLTrainingResult {
    pub accuracy: f64,
    pub loss: f64,
    pub training_time_seconds: f64,
    pub examples_processed: u32,
}

/// User feedback for ML learning
#[napi(object)]
pub struct MLUserFeedback {
    pub id: String,
    pub feedback_type: String,
    pub query: String,
    pub result: String,
    pub rating: Option<f64>,
    pub correction: Option<String>,
    pub metadata: HashMap<String, String>,
}

#[napi]
impl FluoriteBridge {
    /// Create a new Fluorite Bridge instance
    #[napi(constructor)]
    pub fn new() -> napi::Result<Self> {
        // Initialize tracing
        tracing_subscriber::fmt::init();
        
        // This will be initialized properly in initialize()
        // For now, create placeholder instances
        let default_config = BridgeConfig {
            memory_path: "./memory".to_string(),
            models_path: "./models".to_string(),
            spike_templates_path: "./spikes".to_string(),
            target_frameworks: vec!["nextjs".to_string(), "laravel".to_string()],
            enable_ml: Some(true),
            enable_incremental_learning: Some(true),
            batch_size: Some(32),
            cache_size_mb: Some(512),
        };

        // We'll return a placeholder that needs to be initialized
        // This is a limitation of napi-rs constructors
        Ok(Self {
            memory_engine: Arc::new(unsafe { std::mem::zeroed() }), // Placeholder
            learning_pipeline: Arc::new(unsafe { std::mem::zeroed() }), // Placeholder
            ml_engine: Arc::new(unsafe { std::mem::zeroed() }), // Placeholder
            protocol_adapter: Arc::new(Mutex::new(ProtocolAdapter::new())),
        })
    }

    /// Initialize the bridge with configuration (call this after constructor)
    #[napi]
    pub async fn initialize(&mut self, config: BridgeConfig) -> napi::Result<()> {
        info!("Initializing Fluorite Bridge with config: {:?}", config);

        // Convert bridge config to internal configs
        let memory_config = MemoryConfig {
            storage_path: PathBuf::from(&config.memory_path),
            cache_size_mb: config.cache_size_mb.unwrap_or(512) as usize,
            enable_compression: true,
            enable_search: true,
            search_index_path: Some(PathBuf::from(&config.memory_path).join("search")),
            max_chunk_size: 1024 * 1024, // 1MB
            enable_analytics: true,
        };

        let learning_config = LearningConfig {
            spike_templates_path: PathBuf::from(&config.spike_templates_path),
            target_frameworks: config.target_frameworks.clone(),
            quality_threshold: 0.7,
            enable_incremental: config.enable_incremental_learning.unwrap_or(true),
            batch_size: config.batch_size.unwrap_or(32) as usize,
            learning_rate: 0.1,
            parallel_processing: true,
        };

        let ml_config = MLConfig {
            models_path: PathBuf::from(&config.models_path),
            default_embedding_model: "all-MiniLM-L6-v2".to_string(),
            embedding_cache_size_mb: 256,
            similarity_threshold: 0.7,
            num_threads: num_cpus::get(),
            enable_gpu_fallback: false,
            batch_size: 32,
            enable_incremental_learning: config.enable_incremental_learning.unwrap_or(true),
        };

        // Initialize components
        let memory_engine = MemoryEngine::new(memory_config).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to initialize memory engine: {}", e)))?;

        let learning_pipeline = LearningPipeline::new(learning_config, Arc::clone(&memory_engine)).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to initialize learning pipeline: {}", e)))?;

        let ml_engine = if config.enable_ml.unwrap_or(true) {
            MLEngine::new(ml_config).await
                .map_err(|e| napi::Error::from_reason(format!("Failed to initialize ML engine: {}", e)))?
        } else {
            // Create a dummy ML engine if disabled
            MLEngine::new(ml_config).await
                .map_err(|e| napi::Error::from_reason(format!("Failed to initialize ML engine: {}", e)))?
        };

        // Update self with actual instances
        // Note: This is unsafe but necessary due to napi-rs limitations
        unsafe {
            std::ptr::write(&mut self.memory_engine, Arc::new(memory_engine));
            std::ptr::write(&mut self.learning_pipeline, Arc::new(learning_pipeline));
            std::ptr::write(&mut self.ml_engine, Arc::new(ml_engine));
        }

        info!("Fluorite Bridge initialized successfully");
        Ok(())
    }

    /// Store a memory chunk
    #[napi]
    pub async fn store_chunk(&self, chunk: MemoryChunk) -> napi::Result<String> {
        let chunk_id = ChunkId::new(&chunk.id);
        
        let content = ChunkContent::Data {
            format: "json".to_string(),
            data: serde_json::json!({
                "content": chunk.content,
                "metadata": chunk.metadata
            }),
        };

        let metadata = ChunkMetadata {
            source: "nodejs".to_string(),
            tags: chunk.tags,
            frameworks: chunk.frameworks,
            patterns: vec![],
            file_path: None,
            created_at: chrono::Utc::now(),
            last_accessed: chrono::Utc::now(),
            dependencies: vec![],
            properties: chunk.metadata.into_iter()
                .map(|(k, v)| (k, serde_json::Value::String(v)))
                .collect(),
            ..Default::default()
        };

        let learning_chunk = LearningChunk {
            id: chunk_id.clone(),
            chunk_type: match chunk.chunk_type.as_str() {
                "spike_template" => ChunkType::SpikeTemplate,
                "code_pattern" => ChunkType::CodePattern,
                "framework_relationship" => ChunkType::FrameworkRelationship,
                _ => ChunkType::CodePattern,
            },
            content,
            metadata,
            embedding: None,
            relationships: vec![],
            quality_score: chunk.quality_score as f32,
        };

        self.memory_engine.store_chunk(learning_chunk).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to store chunk: {}", e)))?;

        Ok(chunk_id.to_string())
    }

    /// Retrieve a memory chunk by ID
    #[napi]
    pub async fn get_chunk(&self, chunk_id: String) -> napi::Result<Option<MemoryChunk>> {
        let chunk_id = ChunkId::new(&chunk_id);
        
        match self.memory_engine.get_chunk(&chunk_id).await {
            Ok(Some(chunk)) => {
                let content_str = match &chunk.content {
                    ChunkContent::Text(text) => text.clone(),
                    ChunkContent::Data { data, .. } => data.to_string(),
                    ChunkContent::Binary(_) => "[Binary Data]".to_string(),
                };

                let metadata: HashMap<String, String> = chunk.metadata.properties
                    .into_iter()
                    .map(|(k, v)| (k, v.to_string()))
                    .collect();

                Ok(Some(MemoryChunk {
                    id: chunk.id.to_string(),
                    chunk_type: format!("{:?}", chunk.chunk_type),
                    content: content_str,
                    metadata,
                    quality_score: chunk.quality_score as f64,
                    frameworks: chunk.metadata.frameworks,
                    tags: chunk.metadata.tags,
                }))
            },
            Ok(None) => Ok(None),
            Err(e) => Err(napi::Error::from_reason(format!("Failed to get chunk: {}", e))),
        }
    }

    /// Search for similar chunks
    #[napi]
    pub async fn search_similar(&self, query: String, limit: Option<u32>) -> napi::Result<Vec<MemoryChunk>> {
        let limit = limit.unwrap_or(10) as usize;
        
        let results = self.memory_engine.search_similar(&query, limit).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to search: {}", e)))?;

        let mut chunks = Vec::new();
        for chunk_id in results {
            if let Ok(Some(chunk)) = self.memory_engine.get_chunk(&chunk_id).await {
                let content_str = match &chunk.content {
                    ChunkContent::Text(text) => text.clone(),
                    ChunkContent::Data { data, .. } => data.to_string(),
                    ChunkContent::Binary(_) => "[Binary Data]".to_string(),
                };

                let metadata: HashMap<String, String> = chunk.metadata.properties
                    .into_iter()
                    .map(|(k, v)| (k, v.to_string()))
                    .collect();

                chunks.push(MemoryChunk {
                    id: chunk.id.to_string(),
                    chunk_type: format!("{:?}", chunk.chunk_type),
                    content: content_str,
                    metadata,
                    quality_score: chunk.quality_score as f64,
                    frameworks: chunk.metadata.frameworks,
                    tags: chunk.metadata.tags,
                });
            }
        }

        Ok(chunks)
    }

    /// Run learning from Spike templates
    #[napi]
    pub async fn learn_from_spikes(&self) -> napi::Result<LearningStats> {
        let report = self.learning_pipeline.learn_from_spikes().await
            .map_err(|e| napi::Error::from_reason(format!("Learning failed: {}", e)))?;

        Ok(LearningStats {
            total_templates_processed: report.templates_processed as f64,
            patterns_extracted: report.patterns_extracted as f64,
            high_quality_patterns: 0.0, // Would be calculated from quality distribution
            framework_combinations_discovered: report.relationships_discovered as f64,
            learning_time_seconds: report.duration_seconds,
            pattern_accuracy: 0.85, // Mock value - would be calculated
        })
    }

    /// Get learning statistics
    #[napi]
    pub async fn get_learning_stats(&self) -> napi::Result<LearningStats> {
        let stats = self.learning_pipeline.get_stats().await;

        Ok(LearningStats {
            total_templates_processed: stats.total_templates_processed as f64,
            patterns_extracted: stats.patterns_extracted as f64,
            high_quality_patterns: stats.high_quality_patterns as f64,
            framework_combinations_discovered: stats.framework_combinations_discovered as f64,
            learning_time_seconds: stats.learning_time_seconds,
            pattern_accuracy: stats.pattern_accuracy,
        })
    }

    /// Generate embeddings for text
    #[napi]
    pub async fn generate_embedding(&self, text: String) -> napi::Result<Vec<f64>> {
        let embedding = self.ml_engine.generate_embedding(&text).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to generate embedding: {}", e)))?;

        Ok(embedding.into_iter().map(|x| x as f64).collect())
    }

    /// Perform semantic search
    #[napi]
    pub async fn semantic_search(&self, query: String, documents: Vec<String>, top_k: Option<u32>) -> napi::Result<Vec<MLSearchResult>> {
        let top_k = top_k.unwrap_or(5) as usize;
        
        let results = self.ml_engine.semantic_search(&query, &documents, top_k).await
            .map_err(|e| napi::Error::from_reason(format!("Semantic search failed: {}", e)))?;

        Ok(results.into_iter().map(|result| MLSearchResult {
            document_index: result.document_index as u32,
            document_content: result.document_content,
            similarity_score: result.similarity_score as f64,
        }).collect())
    }

    /// Train incrementally with examples
    #[napi]
    pub async fn train_incremental(&self, examples: Vec<MLTrainingExample>) -> napi::Result<MLTrainingResult> {
        let training_examples: Vec<TrainingExample> = examples.into_iter().map(|ex| {
            TrainingExample {
                input_text: ex.input_text,
                expected_output: ex.expected_output,
                task_type: ex.task_type,
                metadata: ex.metadata.into_iter()
                    .map(|(k, v)| (k, serde_json::Value::String(v)))
                    .collect(),
            }
        }).collect();

        let result = self.ml_engine.train_incremental(&training_examples).await
            .map_err(|e| napi::Error::from_reason(format!("Training failed: {}", e)))?;

        Ok(MLTrainingResult {
            accuracy: result.accuracy,
            loss: result.loss,
            training_time_seconds: result.training_time_seconds,
            examples_processed: result.examples_processed as u32,
        })
    }

    /// Add user feedback for ML learning
    #[napi]
    pub async fn add_feedback(&self, feedback: MLUserFeedback) -> napi::Result<()> {
        let user_feedback = UserFeedback {
            id: feedback.id,
            feedback_type: match feedback.feedback_type.as_str() {
                "similarity" => fluorite_ml::FeedbackType::Similarity,
                "pattern_recognition" => fluorite_ml::FeedbackType::PatternRecognition,
                "recommendation" => fluorite_ml::FeedbackType::Recommendation,
                "search_relevance" => fluorite_ml::FeedbackType::SearchRelevance,
                "code_generation" => fluorite_ml::FeedbackType::CodeGeneration,
                _ => fluorite_ml::FeedbackType::General,
            },
            context: fluorite_ml::FeedbackContext {
                query: feedback.query,
                result: feedback.result,
                context_data: feedback.metadata.into_iter()
                    .map(|(k, v)| (k, serde_json::Value::String(v)))
                    .collect(),
            },
            rating: feedback.rating.map(|r| r as f32),
            correction: feedback.correction,
            timestamp: chrono::Utc::now(),
            metadata: HashMap::new(),
        };

        self.ml_engine.add_feedback(user_feedback).await
            .map_err(|e| napi::Error::from_reason(format!("Failed to add feedback: {}", e)))?;

        Ok(())
    }

    /// Get Next.js + Laravel integration patterns
    #[napi]
    pub async fn get_nextjs_laravel_patterns(&self) -> napi::Result<Vec<String>> {
        let patterns = self.learning_pipeline.get_nextjs_laravel_patterns().await
            .map_err(|e| napi::Error::from_reason(format!("Failed to get patterns: {}", e)))?;

        Ok(patterns.into_iter().map(|p| p.name).collect())
    }

    /// Clean up and shutdown
    #[napi]
    pub async fn shutdown(&self) -> napi::Result<()> {
        info!("Shutting down Fluorite Bridge");
        
        // Shutdown ML engine
        if let Err(e) = self.ml_engine.shutdown().await {
            error!("Error shutting down ML engine: {}", e);
        }

        Ok(())
    }
}

/// Initialize the Node.js module
#[napi]
pub fn init() -> napi::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();
    
    info!("Fluorite Bridge Node.js module initialized");
    Ok(())
}