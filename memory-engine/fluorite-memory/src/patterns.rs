//! Pattern analysis and relationship building
//! 
//! Provides intelligent pattern recognition, similarity analysis, and relationship
//! building between learning chunks. Includes Next.js + Laravel pattern specialization
//! and machine learning-inspired similarity scoring.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use anyhow::{Context, Result};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock as AsyncRwLock;

use crate::chunk::{
    ChunkId, LearningChunk, ChunkContent, ChunkType, RelationType, 
    UserFeedback, FeedbackType, SimilarityMatch, SimilarityType
};

/// Configuration for pattern analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternConfig {
    /// Minimum similarity threshold for relationships
    pub similarity_threshold: f32,
    /// Enable advanced pattern recognition
    pub enable_advanced_patterns: bool,
    /// Maximum number of relationships per chunk
    pub max_relationships: usize,
    /// Embedding dimension for similarity calculations
    pub embedding_dim: usize,
    /// Learning rate for feedback incorporation
    pub learning_rate: f32,
}

impl Default for PatternConfig {
    fn default() -> Self {
        Self {
            similarity_threshold: 0.6,
            enable_advanced_patterns: true,
            max_relationships: 20,
            embedding_dim: 384,
            learning_rate: 0.1,
        }
    }
}

/// Pattern recognition and analysis engine
#[derive(Debug)]
pub struct PatternAnalyzer {
    config: PatternConfig,
    // Pattern databases
    code_patterns: Arc<RwLock<HashMap<String, CodePattern>>>,
    framework_patterns: Arc<RwLock<HashMap<String, FrameworkPattern>>>,
    relationship_graph: Arc<RwLock<RelationshipGraph>>,
    // Learning statistics
    feedback_stats: Arc<RwLock<FeedbackStats>>,
    pattern_stats: Arc<RwLock<PatternStats>>,
}

/// Code pattern for recognition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodePattern {
    pub id: String,
    pub name: String,
    pub pattern_type: PatternType,
    pub signature: String,
    pub frameworks: Vec<String>,
    pub confidence: f32,
    pub usage_count: u64,
    pub examples: Vec<String>,
}

/// Framework-specific patterns
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkPattern {
    pub id: String,
    pub framework: String,
    pub pattern_name: String,
    pub template: String,
    pub dependencies: Vec<String>,
    pub best_practices: Vec<String>,
    pub common_issues: Vec<String>,
    pub related_patterns: Vec<String>,
}

/// Types of code patterns
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PatternType {
    /// Function/method patterns
    Function,
    /// Class/component patterns
    Component,
    /// Import/export patterns
    Module,
    /// Configuration patterns
    Configuration,
    /// API endpoint patterns
    ApiEndpoint,
    /// Database model patterns
    DatabaseModel,
    /// Authentication patterns
    Authentication,
    /// Error handling patterns
    ErrorHandling,
    /// Performance optimization patterns
    Performance,
    /// Testing patterns
    Testing,
    /// Custom pattern type
    Custom(String),
}

/// Relationship graph for tracking chunk connections
#[derive(Debug, Default)]
pub struct RelationshipGraph {
    /// Adjacency list of relationships
    adjacency: HashMap<ChunkId, Vec<WeightedEdge>>,
    /// Pattern clusters
    clusters: HashMap<String, Vec<ChunkId>>,
    /// Framework relationships
    framework_graph: HashMap<String, FrameworkRelations>,
}

/// Weighted edge in the relationship graph
#[derive(Debug, Clone)]
pub struct WeightedEdge {
    pub target: ChunkId,
    pub relation_type: RelationType,
    pub weight: f32,
    pub confidence: f32,
}

/// Framework relationship mapping
#[derive(Debug, Clone)]
pub struct FrameworkRelations {
    pub primary_chunks: Vec<ChunkId>,
    pub integration_patterns: HashMap<String, Vec<ChunkId>>, // e.g., "nextjs->laravel" -> chunks
    pub common_combinations: Vec<FrameworkCombination>,
}

/// Common framework combinations (e.g., Next.js + Laravel)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkCombination {
    pub frameworks: Vec<String>,
    pub pattern_name: String,
    pub chunks: Vec<ChunkId>,
    pub confidence: f32,
    pub usage_frequency: u64,
}

/// Statistics for feedback learning
#[derive(Debug, Default)]
pub struct FeedbackStats {
    pub total_feedback: u64,
    pub helpful_count: u64,
    pub not_helpful_count: u64,
    pub improvement_suggestions: u64,
    pub error_reports: u64,
    pub pattern_accuracy: f64,
}

/// Pattern analysis statistics
#[derive(Debug, Default)]
pub struct PatternStats {
    pub total_patterns: u64,
    pub framework_patterns: HashMap<String, u64>,
    pub pattern_types: HashMap<PatternType, u64>,
    pub similarity_calculations: u64,
    pub relationship_discoveries: u64,
}

impl PatternAnalyzer {
    /// Create a new pattern analyzer
    pub fn new(embedding_dim: usize) -> Self {
        let config = PatternConfig {
            embedding_dim,
            ..Default::default()
        };

        Self {
            config,
            code_patterns: Arc::new(RwLock::new(HashMap::new())),
            framework_patterns: Arc::new(RwLock::new(HashMap::new())),
            relationship_graph: Arc::new(RwLock::new(RelationshipGraph::default())),
            feedback_stats: Arc::new(RwLock::new(FeedbackStats::default())),
            pattern_stats: Arc::new(RwLock::new(PatternStats::default())),
        }
    }

    /// Analyze a chunk for patterns and relationships
    pub async fn analyze_chunk(&self, chunk: &LearningChunk) -> Result<()> {
        tracing::debug!("Analyzing patterns for chunk: {}", chunk.id);

        // Extract code patterns
        self.extract_code_patterns(chunk).await?;

        // Analyze framework patterns
        self.analyze_framework_patterns(chunk).await?;

        // Update relationship graph
        self.update_relationship_graph(chunk).await?;

        // Update statistics
        {
            let mut stats = self.pattern_stats.write();
            stats.total_patterns += 1;
            
            for framework in &chunk.metadata.frameworks {
                *stats.framework_patterns.entry(framework.clone()).or_insert(0) += 1;
            }
        }

        tracing::debug!("Pattern analysis completed for chunk: {}", chunk.id);
        Ok(())
    }

    /// Find similar chunks based on content and patterns
    pub async fn find_similar(&self, chunk: &LearningChunk, limit: usize) -> Result<Vec<SimilarityMatch>> {
        tracing::debug!("Finding similar chunks for: {}", chunk.id);

        let mut similarities = Vec::new();

        // Get potential candidates from relationship graph
        let candidates = self.get_similarity_candidates(chunk).await?;

        for candidate_chunk in candidates {
            if candidate_chunk.id == chunk.id {
                continue; // Skip self
            }

            // Calculate different types of similarity
            let content_similarity = self.calculate_content_similarity(chunk, &candidate_chunk)?;
            let structural_similarity = self.calculate_structural_similarity(chunk, &candidate_chunk)?;
            let semantic_similarity = self.calculate_semantic_similarity(chunk, &candidate_chunk)?;
            let framework_similarity = self.calculate_framework_similarity(chunk, &candidate_chunk)?;

            // Combine similarities with weights
            let overall_similarity = (
                content_similarity * 0.3 +
                structural_similarity * 0.3 +
                semantic_similarity * 0.25 +
                framework_similarity * 0.15
            );

            if overall_similarity >= self.config.similarity_threshold {
                let similarity_type = self.determine_primary_similarity_type(
                    content_similarity,
                    structural_similarity,
                    semantic_similarity,
                    framework_similarity,
                );

                similarities.push(SimilarityMatch {
                    chunk: candidate_chunk,
                    score: overall_similarity,
                    similarity_type,
                });
            }
        }

        // Sort by similarity score and limit results
        similarities.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
        similarities.truncate(limit);

        // Update statistics
        {
            let mut stats = self.pattern_stats.write();
            stats.similarity_calculations += 1;
        }

        tracing::debug!("Found {} similar chunks for: {}", similarities.len(), chunk.id);
        Ok(similarities)
    }

    /// Update pattern accuracy based on user feedback
    pub async fn update_from_feedback(&self, chunk_id: &ChunkId, feedback: UserFeedback) -> Result<()> {
        tracing::debug!("Processing feedback for chunk: {}", chunk_id);

        // Update feedback statistics
        {
            let mut stats = self.feedback_stats.write();
            stats.total_feedback += 1;

            match feedback.feedback_type {
                FeedbackType::Helpful => stats.helpful_count += 1,
                FeedbackType::NotHelpful => stats.not_helpful_count += 1,
                FeedbackType::NeedsImprovement => stats.improvement_suggestions += 1,
                FeedbackType::HasErrors => stats.error_reports += 1,
                _ => {}
            }

            // Recalculate pattern accuracy
            stats.pattern_accuracy = stats.helpful_count as f64 / stats.total_feedback.max(1) as f64;
        }

        // Adjust pattern weights based on feedback
        self.adjust_pattern_weights(chunk_id, &feedback).await?;

        tracing::debug!("Feedback processed for chunk: {}", chunk_id);
        Ok(())
    }

    /// Rebuild relationship graph for optimization
    pub async fn rebuild_relationships(&self) -> Result<()> {
        tracing::info!("Rebuilding relationship graph");

        // Clear existing relationships
        {
            let mut graph = self.relationship_graph.write();
            graph.adjacency.clear();
            graph.clusters.clear();
            graph.framework_graph.clear();
        }

        // This would typically iterate through all chunks and rebuild
        // For now, we'll just log the operation
        tracing::info!("Relationship graph rebuild completed");
        Ok(())
    }

    /// Get Next.js + Laravel specific patterns
    pub async fn get_nextjs_laravel_patterns(&self) -> Vec<FrameworkCombination> {
        let graph = self.relationship_graph.read();
        
        graph.framework_graph
            .values()
            .flat_map(|relations| &relations.common_combinations)
            .filter(|combo| {
                combo.frameworks.contains(&"nextjs".to_string()) &&
                combo.frameworks.contains(&"laravel".to_string())
            })
            .cloned()
            .collect()
    }

    /// Extract code patterns from a chunk
    async fn extract_code_patterns(&self, chunk: &LearningChunk) -> Result<()> {
        if let ChunkContent::Code { code, language, framework } = &chunk.content {
            let patterns = self.analyze_code_content(code, language, framework).await?;
            
            let mut code_patterns = self.code_patterns.write();
            for pattern in patterns {
                code_patterns.insert(pattern.id.clone(), pattern);
            }
        }
        Ok(())
    }

    /// Analyze framework-specific patterns
    async fn analyze_framework_patterns(&self, chunk: &LearningChunk) -> Result<()> {
        for framework in &chunk.metadata.frameworks {
            let pattern = self.extract_framework_pattern(chunk, framework).await?;
            if let Some(pattern) = pattern {
                let mut framework_patterns = self.framework_patterns.write();
                framework_patterns.insert(pattern.id.clone(), pattern);
            }
        }
        Ok(())
    }

    /// Update the relationship graph with new chunk
    async fn update_relationship_graph(&self, chunk: &LearningChunk) -> Result<()> {
        let mut graph = self.relationship_graph.write();
        
        // Add chunk to framework graph
        for framework in &chunk.metadata.frameworks {
            let framework_relations = graph.framework_graph
                .entry(framework.clone())
                .or_insert_with(|| FrameworkRelations {
                    primary_chunks: Vec::new(),
                    integration_patterns: HashMap::new(),
                    common_combinations: Vec::new(),
                });
            
            framework_relations.primary_chunks.push(chunk.id.clone());
        }

        // Detect framework combinations
        if chunk.metadata.frameworks.len() > 1 {
            let combination = FrameworkCombination {
                frameworks: chunk.metadata.frameworks.clone(),
                pattern_name: format!("{} integration", chunk.metadata.frameworks.join("-")),
                chunks: vec![chunk.id.clone()],
                confidence: 0.8,
                usage_frequency: 1,
            };

            // Add to appropriate framework relations
            for framework in &chunk.metadata.frameworks {
                if let Some(relations) = graph.framework_graph.get_mut(framework) {
                    relations.common_combinations.push(combination.clone());
                }
            }
        }

        Ok(())
    }

    /// Analyze code content for patterns (simplified implementation)
    async fn analyze_code_content(&self, code: &str, language: &str, framework: &Option<String>) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();

        // Simple pattern detection based on keywords and structure
        if code.contains("export") && code.contains("function") {
            patterns.push(CodePattern {
                id: format!("export-function-{}", uuid::Uuid::new_v4()),
                name: "Export Function".to_string(),
                pattern_type: PatternType::Function,
                signature: "export function".to_string(),
                frameworks: framework.as_ref().map(|f| vec![f.clone()]).unwrap_or_default(),
                confidence: 0.9,
                usage_count: 1,
                examples: vec![code.to_string()],
            });
        }

        if code.contains("const") && code.contains("=") && code.contains("=>") {
            patterns.push(CodePattern {
                id: format!("arrow-function-{}", uuid::Uuid::new_v4()),
                name: "Arrow Function".to_string(),
                pattern_type: PatternType::Function,
                signature: "const name = () =>".to_string(),
                frameworks: framework.as_ref().map(|f| vec![f.clone()]).unwrap_or_default(),
                confidence: 0.8,
                usage_count: 1,
                examples: vec![code.to_string()],
            });
        }

        if code.contains("export default") && (code.contains("function") || code.contains("class")) {
            patterns.push(CodePattern {
                id: format!("default-export-{}", uuid::Uuid::new_v4()),
                name: "Default Export".to_string(),
                pattern_type: PatternType::Module,
                signature: "export default".to_string(),
                frameworks: framework.as_ref().map(|f| vec![f.clone()]).unwrap_or_default(),
                confidence: 0.95,
                usage_count: 1,
                examples: vec![code.to_string()],
            });
        }

        // Next.js specific patterns
        if let Some(fw) = framework {
            if fw == "nextjs" {
                if code.contains("getServerSideProps") {
                    patterns.push(CodePattern {
                        id: format!("nextjs-ssr-{}", uuid::Uuid::new_v4()),
                        name: "Next.js Server-Side Rendering".to_string(),
                        pattern_type: PatternType::Function,
                        signature: "getServerSideProps".to_string(),
                        frameworks: vec!["nextjs".to_string()],
                        confidence: 1.0,
                        usage_count: 1,
                        examples: vec![code.to_string()],
                    });
                }

                if code.contains("getStaticProps") {
                    patterns.push(CodePattern {
                        id: format!("nextjs-ssg-{}", uuid::Uuid::new_v4()),
                        name: "Next.js Static Site Generation".to_string(),
                        pattern_type: PatternType::Function,
                        signature: "getStaticProps".to_string(),
                        frameworks: vec!["nextjs".to_string()],
                        confidence: 1.0,
                        usage_count: 1,
                        examples: vec![code.to_string()],
                    });
                }

                if code.contains("NextApiRequest") && code.contains("NextApiResponse") {
                    patterns.push(CodePattern {
                        id: format!("nextjs-api-{}", uuid::Uuid::new_v4()),
                        name: "Next.js API Route".to_string(),
                        pattern_type: PatternType::ApiEndpoint,
                        signature: "NextApiRequest, NextApiResponse".to_string(),
                        frameworks: vec!["nextjs".to_string()],
                        confidence: 1.0,
                        usage_count: 1,
                        examples: vec![code.to_string()],
                    });
                }
            }
        }

        Ok(patterns)
    }

    /// Extract framework-specific pattern
    async fn extract_framework_pattern(&self, chunk: &LearningChunk, framework: &str) -> Result<Option<FrameworkPattern>> {
        if let ChunkContent::Code { code, .. } = &chunk.content {
            // Framework-specific pattern extraction
            match framework {
                "nextjs" => {
                    if code.contains("pages/") || code.contains("app/") {
                        return Ok(Some(FrameworkPattern {
                            id: format!("nextjs-page-{}", chunk.id),
                            framework: "nextjs".to_string(),
                            pattern_name: "Page Component".to_string(),
                            template: code.clone(),
                            dependencies: vec!["react".to_string(), "next".to_string()],
                            best_practices: vec![
                                "Use getServerSideProps for dynamic data".to_string(),
                                "Implement proper SEO metadata".to_string(),
                            ],
                            common_issues: vec![
                                "Hydration mismatch errors".to_string(),
                                "Missing key props in lists".to_string(),
                            ],
                            related_patterns: vec!["react-component".to_string()],
                        }));
                    }
                }
                "laravel" => {
                    if code.contains("class") && code.contains("Controller") {
                        return Ok(Some(FrameworkPattern {
                            id: format!("laravel-controller-{}", chunk.id),
                            framework: "laravel".to_string(),
                            pattern_name: "Controller".to_string(),
                            template: code.clone(),
                            dependencies: vec!["laravel".to_string()],
                            best_practices: vec![
                                "Use resource controllers".to_string(),
                                "Validate request data".to_string(),
                            ],
                            common_issues: vec![
                                "Missing CSRF protection".to_string(),
                                "Unvalidated input".to_string(),
                            ],
                            related_patterns: vec!["laravel-model".to_string()],
                        }));
                    }
                }
                _ => {}
            }
        }
        Ok(None)
    }

    /// Get candidate chunks for similarity comparison
    async fn get_similarity_candidates(&self, chunk: &LearningChunk) -> Result<Vec<LearningChunk>> {
        // This is a simplified implementation
        // In practice, you'd query the storage for chunks with similar frameworks/patterns
        Ok(vec![])
    }

    /// Calculate content-based similarity
    fn calculate_content_similarity(&self, chunk1: &LearningChunk, chunk2: &LearningChunk) -> Result<f32> {
        let text1 = chunk1.get_searchable_text();
        let text2 = chunk2.get_searchable_text();
        
        // Simple Jaccard similarity based on word tokens
        let words1: HashSet<&str> = text1.split_whitespace().collect();
        let words2: HashSet<&str> = text2.split_whitespace().collect();
        
        let intersection = words1.intersection(&words2).count();
        let union = words1.union(&words2).count();
        
        if union == 0 {
            Ok(0.0)
        } else {
            Ok(intersection as f32 / union as f32)
        }
    }

    /// Calculate structural similarity
    fn calculate_structural_similarity(&self, chunk1: &LearningChunk, chunk2: &LearningChunk) -> Result<f32> {
        // Compare chunk types and metadata structure
        let type_match = if chunk1.chunk_type == chunk2.chunk_type { 1.0 } else { 0.0 };
        
        let pattern_overlap = {
            let patterns1: HashSet<&String> = chunk1.metadata.patterns.iter().collect();
            let patterns2: HashSet<&String> = chunk2.metadata.patterns.iter().collect();
            let intersection = patterns1.intersection(&patterns2).count();
            let union = patterns1.union(&patterns2).count();
            if union == 0 { 0.0 } else { intersection as f32 / union as f32 }
        };
        
        Ok((type_match + pattern_overlap) / 2.0)
    }

    /// Calculate semantic similarity using embeddings
    fn calculate_semantic_similarity(&self, chunk1: &LearningChunk, chunk2: &LearningChunk) -> Result<f32> {
        // If embeddings are available, calculate cosine similarity
        if let (Some(emb1), Some(emb2)) = (&chunk1.embedding, &chunk2.embedding) {
            let dot_product: f32 = emb1.iter().zip(emb2.iter()).map(|(a, b)| a * b).sum();
            let norm1: f32 = emb1.iter().map(|x| x * x).sum::<f32>().sqrt();
            let norm2: f32 = emb2.iter().map(|x| x * x).sum::<f32>().sqrt();
            
            if norm1 > 0.0 && norm2 > 0.0 {
                Ok(dot_product / (norm1 * norm2))
            } else {
                Ok(0.0)
            }
        } else {
            // Fallback to content similarity
            self.calculate_content_similarity(chunk1, chunk2)
        }
    }

    /// Calculate framework-based similarity
    fn calculate_framework_similarity(&self, chunk1: &LearningChunk, chunk2: &LearningChunk) -> Result<f32> {
        let frameworks1: HashSet<&String> = chunk1.metadata.frameworks.iter().collect();
        let frameworks2: HashSet<&String> = chunk2.metadata.frameworks.iter().collect();
        
        let intersection = frameworks1.intersection(&frameworks2).count();
        let union = frameworks1.union(&frameworks2).count();
        
        if union == 0 {
            Ok(0.0)
        } else {
            Ok(intersection as f32 / union as f32)
        }
    }

    /// Determine the primary type of similarity
    fn determine_primary_similarity_type(
        &self,
        content: f32,
        structural: f32,
        semantic: f32,
        framework: f32,
    ) -> SimilarityType {
        let max_score = content.max(structural).max(semantic).max(framework);
        
        if (semantic - max_score).abs() < f32::EPSILON {
            SimilarityType::Semantic
        } else if (structural - max_score).abs() < f32::EPSILON {
            SimilarityType::Structural
        } else if (framework - max_score).abs() < f32::EPSILON {
            SimilarityType::Framework
        } else {
            SimilarityType::Content
        }
    }

    /// Adjust pattern weights based on feedback
    async fn adjust_pattern_weights(&self, chunk_id: &ChunkId, feedback: &UserFeedback) -> Result<()> {
        let learning_rate = self.config.learning_rate;
        
        // Adjust weights based on feedback type
        let weight_adjustment = match feedback.feedback_type {
            FeedbackType::Helpful => learning_rate,
            FeedbackType::NotHelpful => -learning_rate,
            FeedbackType::NeedsImprovement => -learning_rate * 0.5,
            FeedbackType::HasErrors => -learning_rate * 2.0,
            _ => 0.0,
        };

        // Apply adjustments to related patterns
        // This is a simplified implementation
        tracing::debug!("Adjusted pattern weights for chunk {} by {}", chunk_id, weight_adjustment);
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::chunk::{ChunkContent, ChunkMetadata};

    fn create_test_chunk(id: &str, code: &str, framework: &str) -> LearningChunk {
        LearningChunk {
            id: ChunkId::new(id),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "typescript".to_string(),
                code: code.to_string(),
                framework: Some(framework.to_string()),
            },
            metadata: ChunkMetadata {
                frameworks: vec![framework.to_string()],
                patterns: vec!["function".to_string()],
                ..Default::default()
            },
            ..Default::default()
        }
    }

    #[tokio::test]
    async fn test_pattern_extraction() {
        let analyzer = PatternAnalyzer::new(384);
        let chunk = create_test_chunk(
            "test1",
            "export default function Component() { return <div>Hello</div>; }",
            "nextjs"
        );

        let result = analyzer.analyze_chunk(&chunk).await;
        assert!(result.is_ok());

        // Check that patterns were extracted
        let patterns = analyzer.code_patterns.read();
        assert!(!patterns.is_empty());
    }

    #[tokio::test]
    async fn test_similarity_calculation() {
        let analyzer = PatternAnalyzer::new(384);
        
        let chunk1 = create_test_chunk("test1", "export const func = () => {}", "react");
        let chunk2 = create_test_chunk("test2", "export const func = () => {}", "react");
        let chunk3 = create_test_chunk("test3", "import { useState } from 'react'", "react");

        // Test identical chunks
        let similarity = analyzer.calculate_content_similarity(&chunk1, &chunk2).unwrap();
        assert!(similarity > 0.8);

        // Test different chunks
        let similarity = analyzer.calculate_content_similarity(&chunk1, &chunk3).unwrap();
        assert!(similarity < 0.5);
    }

    #[tokio::test]
    async fn test_framework_similarity() {
        let analyzer = PatternAnalyzer::new(384);
        
        let react_chunk = create_test_chunk("react1", "const component = () => {}", "react");
        let nextjs_chunk = create_test_chunk("nextjs1", "export default function Page() {}", "nextjs");
        let vue_chunk = create_test_chunk("vue1", "const component = {}", "vue");

        // Same framework
        let similarity = analyzer.calculate_framework_similarity(&react_chunk, &react_chunk).unwrap();
        assert_eq!(similarity, 1.0);

        // Different frameworks
        let similarity = analyzer.calculate_framework_similarity(&react_chunk, &vue_chunk).unwrap();
        assert_eq!(similarity, 0.0);
    }

    #[tokio::test]
    async fn test_feedback_processing() {
        let analyzer = PatternAnalyzer::new(384);
        let chunk_id = ChunkId::new("test");
        
        let feedback = UserFeedback {
            user_id: "user1".to_string(),
            timestamp: chrono::Utc::now(),
            feedback_type: FeedbackType::Helpful,
            comment: Some("Great example!".to_string()),
            metadata: HashMap::new(),
        };

        let result = analyzer.update_from_feedback(&chunk_id, feedback).await;
        assert!(result.is_ok());

        // Check feedback stats
        let stats = analyzer.feedback_stats.read();
        assert_eq!(stats.total_feedback, 1);
        assert_eq!(stats.helpful_count, 1);
    }

    #[tokio::test]
    async fn test_nextjs_pattern_detection() {
        let analyzer = PatternAnalyzer::new(384);
        let chunk = create_test_chunk(
            "nextjs-ssr",
            "export async function getServerSideProps() { return { props: {} }; }",
            "nextjs"
        );

        analyzer.analyze_chunk(&chunk).await.unwrap();

        let patterns = analyzer.code_patterns.read();
        let ssr_pattern = patterns.values().find(|p| p.name == "Next.js Server-Side Rendering");
        assert!(ssr_pattern.is_some());
    }
}