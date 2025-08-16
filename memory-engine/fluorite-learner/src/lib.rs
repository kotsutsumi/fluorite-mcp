//! Fluorite Learning Pipeline
//! 
//! Intelligent learning system for analyzing Spike templates, extracting patterns,
//! and building a comprehensive knowledge base for code generation. Specializes in
//! Next.js + Laravel patterns and cross-framework relationships.
//! 
//! Features:
//! - Spike template parsing and analysis
//! - Pattern extraction and validation
//! - Framework-specific learning algorithms
//! - Incremental learning from new templates
//! - Quality scoring and template ranking
//! - Cross-framework relationship discovery

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use fluorite_memory::{
    MemoryEngine, LearningChunk, ChunkId, ChunkType, ChunkContent, ChunkMetadata,
    RelationType, PatternAnalyzer,
};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, debug, warn};

pub mod spike_parser;
pub mod pattern_extractor;
pub mod template_analyzer;
pub mod learning_algorithms;
pub mod validation;

pub use spike_parser::*;
pub use pattern_extractor::*;
pub use template_analyzer::*;
pub use learning_algorithms::*;
pub use validation::*;

/// Configuration for the learning pipeline
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningConfig {
    /// Directory containing Spike templates
    pub spike_templates_path: PathBuf,
    /// Frameworks to focus learning on
    pub target_frameworks: Vec<String>,
    /// Minimum quality threshold for templates
    pub quality_threshold: f32,
    /// Enable incremental learning
    pub enable_incremental: bool,
    /// Maximum templates to process per batch
    pub batch_size: usize,
    /// Learning rate for pattern weights
    pub learning_rate: f32,
    /// Enable parallel processing
    pub parallel_processing: bool,
}

impl Default for LearningConfig {
    fn default() -> Self {
        Self {
            spike_templates_path: PathBuf::from("./src/spikes"),
            target_frameworks: vec![
                "nextjs".to_string(),
                "laravel".to_string(),
                "react".to_string(),
                "express".to_string(),
                "fastify".to_string(),
                "hono".to_string(),
            ],
            quality_threshold: 0.7,
            enable_incremental: true,
            batch_size: 50,
            learning_rate: 0.1,
            parallel_processing: true,
        }
    }
}

/// Main learning pipeline orchestrator
#[derive(Debug)]
pub struct LearningPipeline {
    config: LearningConfig,
    memory_engine: Arc<MemoryEngine>,
    spike_parser: Arc<SpikeParser>,
    pattern_extractor: Arc<PatternExtractor>,
    template_analyzer: Arc<TemplateAnalyzer>,
    learning_algorithms: Arc<LearningAlgorithms>,
    validator: Arc<TemplateValidator>,
    // Learning state
    learning_state: Arc<RwLock<LearningState>>,
    // Statistics
    stats: Arc<RwLock<LearningStats>>,
}

/// Current state of the learning pipeline
#[derive(Debug, Default)]
struct LearningState {
    processed_templates: HashMap<String, DateTime<Utc>>,
    discovered_patterns: HashMap<String, PatternInfo>,
    framework_relationships: HashMap<String, Vec<String>>,
    learning_epoch: u64,
    last_full_scan: Option<DateTime<Utc>>,
}

/// Information about discovered patterns
#[derive(Debug, Clone)]
struct PatternInfo {
    pattern_id: String,
    frequency: u64,
    quality_score: f32,
    frameworks: Vec<String>,
    examples: Vec<ChunkId>,
    last_seen: DateTime<Utc>,
}

/// Learning pipeline statistics
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct LearningStats {
    pub total_templates_processed: u64,
    pub patterns_extracted: u64,
    pub high_quality_patterns: u64,
    pub framework_combinations_discovered: u64,
    pub learning_time_seconds: f64,
    pub templates_per_framework: HashMap<String, u64>,
    pub pattern_accuracy: f64,
    pub last_learning_session: Option<DateTime<Utc>>,
}

impl LearningPipeline {
    /// Create a new learning pipeline
    pub async fn new(config: LearningConfig, memory_engine: Arc<MemoryEngine>) -> Result<Self> {
        info!("Initializing Fluorite Learning Pipeline");

        let spike_parser = Arc::new(SpikeParser::new());
        let pattern_extractor = Arc::new(PatternExtractor::new(&config.target_frameworks));
        let template_analyzer = Arc::new(TemplateAnalyzer::new(config.learning_rate));
        let learning_algorithms = Arc::new(LearningAlgorithms::new(&config));
        let validator = Arc::new(TemplateValidator::new(config.quality_threshold));

        let pipeline = Self {
            config,
            memory_engine,
            spike_parser,
            pattern_extractor,
            template_analyzer,
            learning_algorithms,
            validator,
            learning_state: Arc::new(RwLock::new(LearningState::default())),
            stats: Arc::new(RwLock::new(LearningStats::default())),
        };

        info!("Learning pipeline initialized successfully");
        Ok(pipeline)
    }

    /// Run a complete learning cycle on all Spike templates
    pub async fn learn_from_spikes(&self) -> Result<LearningReport> {
        info!("Starting complete learning cycle from Spike templates");
        let start_time = std::time::Instant::now();

        // Discover all Spike templates
        let templates = self.discover_spike_templates().await?;
        info!("Discovered {} Spike templates", templates.len());

        // Process templates in batches
        let mut processed_count = 0;
        let mut patterns_extracted = 0;
        let mut errors = Vec::new();

        let batches: Vec<_> = templates.chunks(self.config.batch_size).collect();
        
        for (batch_idx, batch) in batches.iter().enumerate() {
            info!("Processing batch {}/{}", batch_idx + 1, batches.len());
            
            let batch_result = if self.config.parallel_processing {
                self.process_template_batch_parallel(batch).await
            } else {
                self.process_template_batch_sequential(batch).await
            };

            match batch_result {
                Ok(batch_stats) => {
                    processed_count += batch_stats.processed;
                    patterns_extracted += batch_stats.patterns_found;
                }
                Err(e) => {
                    warn!("Error processing batch {}: {}", batch_idx + 1, e);
                    errors.push(format!("Batch {}: {}", batch_idx + 1, e));
                }
            }
        }

        // Analyze cross-framework relationships
        let relationships = self.analyze_cross_framework_relationships().await?;

        // Update learning state
        {
            let mut state = self.learning_state.write().await;
            state.learning_epoch += 1;
            state.last_full_scan = Some(Utc::now());
        }

        // Update statistics
        let duration = start_time.elapsed();
        {
            let mut stats = self.stats.write().await;
            stats.total_templates_processed += processed_count;
            stats.patterns_extracted += patterns_extracted;
            stats.framework_combinations_discovered += relationships.len() as u64;
            stats.learning_time_seconds += duration.as_secs_f64();
            stats.last_learning_session = Some(Utc::now());
        }

        let report = LearningReport {
            templates_processed: processed_count,
            patterns_extracted: patterns_extracted,
            relationships_discovered: relationships.len(),
            duration_seconds: duration.as_secs_f64(),
            errors,
            quality_distribution: self.get_quality_distribution().await?,
        };

        info!("Learning cycle completed: {:#?}", report);
        Ok(report)
    }

    /// Learn incrementally from new or modified templates
    pub async fn incremental_learn(&self, changed_files: Vec<PathBuf>) -> Result<IncrementalReport> {
        info!("Starting incremental learning for {} changed files", changed_files.len());
        let start_time = std::time::Instant::now();

        let mut processed = 0;
        let mut patterns_found = 0;
        let mut errors = Vec::new();

        for file_path in changed_files {
            match self.process_single_template(&file_path).await {
                Ok(template_result) => {
                    processed += 1;
                    patterns_found += template_result.patterns_count;
                    
                    // Update processed templates tracking
                    {
                        let mut state = self.learning_state.write().await;
                        state.processed_templates.insert(
                            file_path.to_string_lossy().to_string(),
                            Utc::now()
                        );
                    }
                }
                Err(e) => {
                    warn!("Error processing {}: {}", file_path.display(), e);
                    errors.push(format!("{}: {}", file_path.display(), e));
                }
            }
        }

        let duration = start_time.elapsed();

        let report = IncrementalReport {
            files_processed: processed,
            patterns_updated: patterns_found,
            duration_seconds: duration.as_secs_f64(),
            errors,
        };

        info!("Incremental learning completed: {:#?}", report);
        Ok(report)
    }

    /// Get learning statistics
    pub async fn get_stats(&self) -> LearningStats {
        self.stats.read().await.clone()
    }

    /// Get patterns for a specific framework
    pub async fn get_framework_patterns(&self, framework: &str) -> Result<Vec<PatternInfo>> {
        let state = self.learning_state.read().await;
        let patterns: Vec<PatternInfo> = state.discovered_patterns
            .values()
            .filter(|pattern| pattern.frameworks.contains(&framework.to_string()))
            .cloned()
            .collect();
        
        Ok(patterns)
    }

    /// Get Next.js + Laravel integration patterns
    pub async fn get_nextjs_laravel_patterns(&self) -> Result<Vec<IntegrationPattern>> {
        self.learning_algorithms.get_integration_patterns("nextjs", "laravel").await
    }

    /// Validate a new template against learned patterns
    pub async fn validate_template(&self, template_content: &str, framework: &str) -> Result<ValidationResult> {
        self.validator.validate(template_content, framework).await
    }

    /// Discover all Spike templates in the configured directory
    async fn discover_spike_templates(&self) -> Result<Vec<PathBuf>> {
        let spike_path = &self.config.spike_templates_path;
        
        if !spike_path.exists() {
            return Err(anyhow::anyhow!("Spike templates directory does not exist: {:?}", spike_path));
        }

        let mut templates = Vec::new();
        
        let walker = walkdir::WalkDir::new(spike_path)
            .follow_links(false)
            .into_iter();

        for entry in walker {
            let entry = entry.context("Failed to read directory entry")?;
            let path = entry.path();
            
            if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
                templates.push(path.to_path_buf());
            }
        }

        Ok(templates)
    }

    /// Process a batch of templates sequentially
    async fn process_template_batch_sequential(&self, templates: &[PathBuf]) -> Result<BatchResult> {
        let mut processed = 0;
        let mut patterns_found = 0;

        for template_path in templates {
            match self.process_single_template(template_path).await {
                Ok(result) => {
                    processed += 1;
                    patterns_found += result.patterns_count;
                }
                Err(e) => {
                    warn!("Error processing {}: {}", template_path.display(), e);
                }
            }
        }

        Ok(BatchResult {
            processed,
            patterns_found,
        })
    }

    /// Process a batch of templates in parallel
    async fn process_template_batch_parallel(&self, templates: &[PathBuf]) -> Result<BatchResult> {
        use rayon::prelude::*;
        
        let results: Vec<_> = templates.par_iter()
            .map(|template_path| {
                tokio::task::block_in_place(|| {
                    tokio::runtime::Handle::current().block_on(
                        self.process_single_template(template_path)
                    )
                })
            })
            .collect();

        let mut processed = 0;
        let mut patterns_found = 0;

        for result in results {
            match result {
                Ok(template_result) => {
                    processed += 1;
                    patterns_found += template_result.patterns_count;
                }
                Err(e) => {
                    warn!("Error in parallel processing: {}", e);
                }
            }
        }

        Ok(BatchResult {
            processed,
            patterns_found,
        })
    }

    /// Process a single template file
    async fn process_single_template(&self, template_path: &Path) -> Result<TemplateResult> {
        debug!("Processing template: {}", template_path.display());

        // Parse the Spike template
        let spike_template = self.spike_parser.parse_spike_file(template_path).await
            .context("Failed to parse Spike template")?;

        // Extract patterns
        let patterns = self.pattern_extractor.extract_patterns(&spike_template).await
            .context("Failed to extract patterns")?;

        // Analyze template quality
        let analysis = self.template_analyzer.analyze(&spike_template).await
            .context("Failed to analyze template")?;

        // Validate template
        let validation = self.validator.validate_spike(&spike_template).await
            .context("Failed to validate template")?;

        // Only store high-quality templates
        if validation.quality_score >= self.config.quality_threshold {
            // Convert to learning chunk and store
            let chunk = self.convert_to_learning_chunk(&spike_template, &analysis).await?;
            self.memory_engine.store_chunk(chunk).await
                .context("Failed to store learning chunk")?;

            // Update learning state
            {
                let mut state = self.learning_state.write().await;
                for pattern in &patterns {
                    let pattern_info = PatternInfo {
                        pattern_id: pattern.id.clone(),
                        frequency: pattern.frequency,
                        quality_score: pattern.confidence,
                        frameworks: pattern.frameworks.clone(),
                        examples: vec![], // Would be populated with chunk IDs
                        last_seen: Utc::now(),
                    };
                    state.discovered_patterns.insert(pattern.id.clone(), pattern_info);
                }
            }
        }

        Ok(TemplateResult {
            template_id: spike_template.name.clone(),
            patterns_count: patterns.len(),
            quality_score: validation.quality_score,
            frameworks: spike_template.frameworks.clone(),
        })
    }

    /// Convert Spike template to learning chunk
    async fn convert_to_learning_chunk(&self, spike: &SpikeTemplate, analysis: &TemplateAnalysis) -> Result<LearningChunk> {
        let chunk_id = ChunkId::new(&format!("spike-{}", spike.name));
        
        let content = ChunkContent::Data {
            format: "json".to_string(),
            data: serde_json::to_value(spike)
                .context("Failed to serialize spike template")?,
        };

        let metadata = ChunkMetadata {
            source: "spike-template".to_string(),
            tags: spike.tags.clone(),
            frameworks: spike.frameworks.clone(),
            patterns: analysis.patterns.iter().map(|p| p.clone()).collect(),
            file_path: Some(format!("spikes/{}.json", spike.name)),
            created_at: Utc::now(),
            last_accessed: Utc::now(),
            dependencies: vec![], // Could be derived from spike dependencies
            properties: {
                let mut props = std::collections::HashMap::new();
                props.insert("complexity".to_string(), serde_json::Value::Number(
                    serde_json::Number::from_f64(analysis.complexity_score as f64).unwrap()
                ));
                props.insert("framework_count".to_string(), serde_json::Value::Number(
                    serde_json::Number::from(spike.frameworks.len())
                ));
                props
            },
            ..Default::default()
        };

        Ok(LearningChunk {
            id: chunk_id,
            chunk_type: ChunkType::SpikeTemplate,
            content,
            metadata,
            embedding: None, // Will be generated by ML module
            relationships: vec![],
            quality_score: analysis.quality_score,
        })
    }

    /// Analyze cross-framework relationships
    async fn analyze_cross_framework_relationships(&self) -> Result<Vec<FrameworkRelationship>> {
        self.learning_algorithms.discover_framework_relationships().await
    }

    /// Get quality distribution of learned patterns
    async fn get_quality_distribution(&self) -> Result<QualityDistribution> {
        let state = self.learning_state.read().await;
        let mut high_quality = 0;
        let mut medium_quality = 0;
        let mut low_quality = 0;

        for pattern in state.discovered_patterns.values() {
            if pattern.quality_score >= 0.8 {
                high_quality += 1;
            } else if pattern.quality_score >= 0.6 {
                medium_quality += 1;
            } else {
                low_quality += 1;
            }
        }

        Ok(QualityDistribution {
            high_quality,
            medium_quality,
            low_quality,
        })
    }
}

/// Result of processing a template batch
#[derive(Debug)]
struct BatchResult {
    processed: u64,
    patterns_found: usize,
}

/// Result of processing a single template
#[derive(Debug)]
struct TemplateResult {
    template_id: String,
    patterns_count: usize,
    quality_score: f32,
    frameworks: Vec<String>,
}

/// Framework relationship discovery result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkRelationship {
    pub primary_framework: String,
    pub secondary_framework: String,
    pub relationship_type: String,
    pub strength: f32,
    pub common_patterns: Vec<String>,
    pub example_chunks: Vec<String>,
}

/// Integration pattern between frameworks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationPattern {
    pub name: String,
    pub frameworks: Vec<String>,
    pub description: String,
    pub template_chunks: Vec<String>,
    pub best_practices: Vec<String>,
    pub common_issues: Vec<String>,
}

/// Learning report for complete cycles
#[derive(Debug, Serialize, Deserialize)]
pub struct LearningReport {
    pub templates_processed: u64,
    pub patterns_extracted: usize,
    pub relationships_discovered: usize,
    pub duration_seconds: f64,
    pub errors: Vec<String>,
    pub quality_distribution: QualityDistribution,
}

/// Incremental learning report
#[derive(Debug, Serialize, Deserialize)]
pub struct IncrementalReport {
    pub files_processed: u64,
    pub patterns_updated: usize,
    pub duration_seconds: f64,
    pub errors: Vec<String>,
}

/// Quality distribution of patterns
#[derive(Debug, Serialize, Deserialize)]
pub struct QualityDistribution {
    pub high_quality: u64,   // >= 0.8
    pub medium_quality: u64, // 0.6 - 0.8
    pub low_quality: u64,    // < 0.6
}

#[cfg(test)]
mod tests {
    use super::*;
    use fluorite_memory::MemoryConfig;
    use tempfile::TempDir;

    async fn create_test_pipeline() -> (LearningPipeline, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        
        let memory_config = MemoryConfig {
            storage_path: temp_dir.path().join("memory"),
            cache_size_mb: 64,
            ..Default::default()
        };
        
        let memory_engine = Arc::new(MemoryEngine::new(memory_config).await.unwrap());
        
        let learning_config = LearningConfig {
            spike_templates_path: temp_dir.path().join("spikes"),
            ..Default::default()
        };
        
        tokio::fs::create_dir_all(&learning_config.spike_templates_path).await.unwrap();
        
        let pipeline = LearningPipeline::new(learning_config, memory_engine).await.unwrap();
        (pipeline, temp_dir)
    }

    #[tokio::test]
    async fn test_pipeline_initialization() {
        let (_pipeline, _temp_dir) = create_test_pipeline().await;
        // Test passes if no panic occurs during initialization
    }

    #[tokio::test]
    async fn test_discover_spike_templates() {
        let (pipeline, temp_dir) = create_test_pipeline().await;
        
        // Create a test spike template
        let spike_content = r#"{
            "name": "test-spike",
            "description": "Test spike template",
            "frameworks": ["nextjs"],
            "dependencies": [],
            "files": [],
            "tags": ["test"]
        }"#;
        
        let spike_path = temp_dir.path().join("spikes").join("test-spike.json");
        tokio::fs::write(&spike_path, spike_content).await.unwrap();
        
        let templates = pipeline.discover_spike_templates().await.unwrap();
        assert_eq!(templates.len(), 1);
        assert_eq!(templates[0], spike_path);
    }

    #[tokio::test]
    async fn test_learning_stats() {
        let (pipeline, _temp_dir) = create_test_pipeline().await;
        
        let stats = pipeline.get_stats().await;
        assert_eq!(stats.total_templates_processed, 0);
        assert_eq!(stats.patterns_extracted, 0);
    }
}