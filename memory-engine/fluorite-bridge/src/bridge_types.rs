//! Bridge type definitions and conversions
//! 
//! Provides type definitions and conversion utilities for bridging
//! between Rust and Node.js representations of data structures.

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use napi::bindgen_prelude::*;
use napi_derive::napi;

/// Result type for bridge operations
pub type BridgeResult<T> = Result<T, BridgeError>;

/// Bridge-specific error types
#[derive(Debug, thiserror::Error)]
pub enum BridgeError {
    #[error("Initialization error: {0}")]
    Initialization(String),
    
    #[error("Conversion error: {0}")]
    Conversion(String),
    
    #[error("Memory engine error: {0}")]
    MemoryEngine(#[from] fluorite_memory::MemoryError),
    
    #[error("Learning pipeline error: {0}")]
    LearningPipeline(#[from] fluorite_learner::LearningError),
    
    #[error("ML engine error: {0}")]
    MLEngine(#[from] fluorite_ml::MLError),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

impl From<BridgeError> for napi::Error {
    fn from(err: BridgeError) -> Self {
        napi::Error::from_reason(err.to_string())
    }
}

/// Configuration validation result
#[napi(object)]
pub struct ConfigValidation {
    pub is_valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

/// Framework relationship data
#[napi(object)]
pub struct FrameworkRelationship {
    pub from_framework: String,
    pub to_framework: String,
    pub relationship_type: String,
    pub confidence: f64,
    pub examples: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Pattern recommendation
#[napi(object)]
pub struct PatternRecommendation {
    pub pattern_id: String,
    pub pattern_name: String,
    pub description: String,
    pub confidence: f64,
    pub code_template: String,
    pub required_dependencies: Vec<String>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, String>,
}

/// Learning progress update
#[napi(object)]
pub struct LearningProgress {
    pub stage: String,
    pub progress_percentage: f64,
    pub current_operation: String,
    pub estimated_time_remaining_seconds: Option<f64>,
    pub templates_processed: u32,
    pub patterns_discovered: u32,
    pub errors: u32,
}

/// System health status
#[napi(object)]
pub struct SystemHealth {
    pub status: String, // "healthy", "warning", "error"
    pub memory_usage_mb: f64,
    pub cache_hit_rate: f64,
    pub learning_pipeline_status: String,
    pub ml_engine_status: String,
    pub last_updated: String,
    pub issues: Vec<String>,
}

/// Batch operation result
#[napi(object)]
pub struct BatchOperationResult {
    pub total_items: u32,
    pub successful_items: u32,
    pub failed_items: u32,
    pub errors: Vec<String>,
    pub duration_seconds: f64,
}

/// Advanced search options
#[napi(object)]
pub struct SearchOptions {
    pub query: String,
    pub frameworks: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub min_quality_score: Option<f64>,
    pub max_results: Option<u32>,
    pub include_metadata: Option<bool>,
    pub sort_by: Option<String>, // "relevance", "quality", "date"
    pub sort_order: Option<String>, // "asc", "desc"
}

/// Advanced search result with enhanced metadata
#[napi(object)]
pub struct EnhancedSearchResult {
    pub chunk: super::MemoryChunk,
    pub relevance_score: f64,
    pub similarity_score: f64,
    pub framework_match_score: f64,
    pub related_chunks: Vec<String>, // IDs of related chunks
    pub explanation: String, // Why this result was returned
}

/// Framework integration pattern
#[napi(object)]
pub struct IntegrationPattern {
    pub id: String,
    pub name: String,
    pub description: String,
    pub frameworks: Vec<String>,
    pub pattern_type: String, // "data_flow", "authentication", "api_integration", etc.
    pub complexity_level: String, // "beginner", "intermediate", "advanced"
    pub code_examples: HashMap<String, String>, // framework -> code
    pub best_practices: Vec<String>,
    pub common_pitfalls: Vec<String>,
    pub quality_score: f64,
    pub usage_frequency: u32,
    pub last_updated: String,
}

/// Validation utilities for bridge types
impl ConfigValidation {
    pub fn new() -> Self {
        Self {
            is_valid: true,
            errors: Vec::new(),
            warnings: Vec::new(),
        }
    }
    
    pub fn add_error(&mut self, error: String) {
        self.errors.push(error);
        self.is_valid = false;
    }
    
    pub fn add_warning(&mut self, warning: String) {
        self.warnings.push(warning);
    }
}

/// Type conversion utilities
pub mod conversions {
    use super::*;
    use fluorite_memory::{LearningChunk, ChunkType, ChunkContent, ChunkMetadata};
    
    /// Convert Rust LearningChunk to Node.js MemoryChunk
    pub fn learning_chunk_to_memory_chunk(chunk: &LearningChunk) -> super::super::MemoryChunk {
        let content_str = match &chunk.content {
            ChunkContent::Text(text) => text.clone(),
            ChunkContent::Data { data, .. } => data.to_string(),
            ChunkContent::Binary(_) => "[Binary Data]".to_string(),
        };

        let metadata: HashMap<String, String> = chunk.metadata.properties
            .iter()
            .map(|(k, v)| (k.clone(), v.to_string()))
            .collect();

        super::super::MemoryChunk {
            id: chunk.id.to_string(),
            chunk_type: format!("{:?}", chunk.chunk_type),
            content: content_str,
            metadata,
            quality_score: chunk.quality_score as f64,
            frameworks: chunk.metadata.frameworks.clone(),
            tags: chunk.metadata.tags.clone(),
        }
    }
    
    /// Convert Node.js MemoryChunk to Rust LearningChunk
    pub fn memory_chunk_to_learning_chunk(chunk: &super::super::MemoryChunk) -> Result<LearningChunk, BridgeError> {
        use fluorite_memory::ChunkId;
        
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
            tags: chunk.tags.clone(),
            frameworks: chunk.frameworks.clone(),
            patterns: vec![],
            file_path: None,
            created_at: chrono::Utc::now(),
            last_accessed: chrono::Utc::now(),
            dependencies: vec![],
            properties: chunk.metadata.iter()
                .map(|(k, v)| (k.clone(), serde_json::Value::String(v.clone())))
                .collect(),
            ..Default::default()
        };

        Ok(LearningChunk {
            id: chunk_id,
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
        })
    }
    
    /// Validate framework name
    pub fn validate_framework(framework: &str) -> bool {
        const SUPPORTED_FRAMEWORKS: &[&str] = &[
            "nextjs", "react", "vue", "angular", "svelte",
            "laravel", "symfony", "express", "fastify", "koa",
            "django", "flask", "rails", "spring", "aspnet",
            "hono", "elysia", "bun", "deno"
        ];
        
        SUPPORTED_FRAMEWORKS.contains(&framework.to_lowercase().as_str())
    }
    
    /// Validate quality score
    pub fn validate_quality_score(score: f64) -> bool {
        score >= 0.0 && score <= 1.0
    }
    
    /// Sanitize text input
    pub fn sanitize_text(text: &str) -> String {
        // Remove potential security risks
        text.chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace() || ".,;:!?-_()[]{}\"'<>/\\@#$%^&*+=|~`".contains(*c))
            .collect::<String>()
            .trim()
            .to_string()
    }
}

/// Default implementations
impl Default for SystemHealth {
    fn default() -> Self {
        Self {
            status: "healthy".to_string(),
            memory_usage_mb: 0.0,
            cache_hit_rate: 0.0,
            learning_pipeline_status: "ready".to_string(),
            ml_engine_status: "ready".to_string(),
            last_updated: chrono::Utc::now().to_rfc3339(),
            issues: Vec::new(),
        }
    }
}

impl Default for LearningProgress {
    fn default() -> Self {
        Self {
            stage: "idle".to_string(),
            progress_percentage: 0.0,
            current_operation: "waiting".to_string(),
            estimated_time_remaining_seconds: None,
            templates_processed: 0,
            patterns_discovered: 0,
            errors: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::conversions::*;
    
    #[test]
    fn test_validate_framework() {
        assert!(validate_framework("nextjs"));
        assert!(validate_framework("laravel"));
        assert!(validate_framework("react"));
        assert!(!validate_framework("unknown_framework"));
        assert!(!validate_framework(""));
    }
    
    #[test]
    fn test_validate_quality_score() {
        assert!(validate_quality_score(0.0));
        assert!(validate_quality_score(0.5));
        assert!(validate_quality_score(1.0));
        assert!(!validate_quality_score(-0.1));
        assert!(!validate_quality_score(1.1));
    }
    
    #[test]
    fn test_sanitize_text() {
        assert_eq!(sanitize_text("Hello World!"), "Hello World!");
        assert_eq!(sanitize_text("  test  "), "test");
        // Test that normal code characters are preserved
        assert_eq!(sanitize_text("function() { return 'hello'; }"), "function() { return 'hello'; }");
    }
    
    #[test]
    fn test_config_validation() {
        let mut validation = ConfigValidation::new();
        assert!(validation.is_valid);
        assert!(validation.errors.is_empty());
        
        validation.add_warning("Test warning".to_string());
        assert!(validation.is_valid);
        assert_eq!(validation.warnings.len(), 1);
        
        validation.add_error("Test error".to_string());
        assert!(!validation.is_valid);
        assert_eq!(validation.errors.len(), 1);
    }
}