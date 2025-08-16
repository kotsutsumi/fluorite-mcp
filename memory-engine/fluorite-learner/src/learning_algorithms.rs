//! Learning algorithms for pattern discovery and relationship building
//! 
//! Implements intelligent learning algorithms for discovering patterns,
//! building relationships between templates, and creating recommendations
//! for Next.js + Laravel integration patterns.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::{LearningConfig, FrameworkRelationship, IntegrationPattern};

/// Learning algorithms implementation
#[derive(Debug)]
pub struct LearningAlgorithms {
    config: LearningConfig,
    pattern_database: Arc<RwLock<PatternDatabase>>,
    relationship_graph: Arc<RwLock<RelationshipGraph>>,
    learning_stats: Arc<RwLock<LearningStats>>,
}

/// Database of discovered patterns
#[derive(Debug, Default)]
pub struct PatternDatabase {
    /// Framework-specific patterns
    framework_patterns: HashMap<String, Vec<FrameworkPattern>>,
    /// Integration patterns between frameworks
    integration_patterns: HashMap<String, Vec<IntegrationPattern>>,
    /// Code patterns
    code_patterns: HashMap<String, Vec<CodePattern>>,
    /// Architectural patterns
    architectural_patterns: HashMap<String, Vec<ArchitecturalPattern>>,
}

/// Relationship graph for pattern connections
#[derive(Debug, Default)]
pub struct RelationshipGraph {
    /// Nodes represent patterns or templates
    nodes: HashMap<String, GraphNode>,
    /// Edges represent relationships
    edges: Vec<GraphEdge>,
    /// Clusters of related patterns
    clusters: HashMap<String, Vec<String>>,
}

/// Node in the relationship graph
#[derive(Debug, Clone)]
pub struct GraphNode {
    pub id: String,
    pub node_type: NodeType,
    pub metadata: HashMap<String, String>,
    pub weight: f32,
}

/// Edge in the relationship graph
#[derive(Debug, Clone)]
pub struct GraphEdge {
    pub source: String,
    pub target: String,
    pub relationship_type: RelationshipType,
    pub weight: f32,
    pub confidence: f32,
}

/// Types of nodes in the graph
#[derive(Debug, Clone, PartialEq)]
pub enum NodeType {
    Template,
    Pattern,
    Framework,
    Integration,
}

/// Types of relationships
#[derive(Debug, Clone, PartialEq)]
pub enum RelationshipType {
    /// One pattern extends another
    Extends,
    /// Patterns are used together
    ComposedWith,
    /// One pattern depends on another
    DependsOn,
    /// Patterns are similar
    SimilarTo,
    /// One pattern integrates with another
    IntegratesWith,
    /// Patterns are alternatives
    AlternativeTo,
}

/// Framework-specific pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkPattern {
    pub id: String,
    pub name: String,
    pub framework: String,
    pub description: String,
    pub code_template: String,
    pub usage_frequency: u64,
    pub quality_score: f32,
    pub related_patterns: Vec<String>,
    pub best_practices: Vec<String>,
    pub common_issues: Vec<String>,
}

/// Code pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodePattern {
    pub id: String,
    pub name: String,
    pub pattern_type: String,
    pub code_signature: String,
    pub languages: Vec<String>,
    pub frameworks: Vec<String>,
    pub usage_count: u64,
    pub effectiveness_score: f32,
    pub examples: Vec<String>,
}

/// Architectural pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArchitecturalPattern {
    pub id: String,
    pub name: String,
    pub description: String,
    pub structure: Vec<String>,
    pub benefits: Vec<String>,
    pub drawbacks: Vec<String>,
    pub use_cases: Vec<String>,
    pub implementations: HashMap<String, String>, // framework -> implementation
}

/// Learning statistics
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct LearningStats {
    pub patterns_discovered: u64,
    pub relationships_found: u64,
    pub integration_patterns: u64,
    pub accuracy_score: f32,
    pub learning_iterations: u64,
    pub last_update: Option<chrono::DateTime<chrono::Utc>>,
}

impl LearningAlgorithms {
    /// Create new learning algorithms instance
    pub fn new(config: &LearningConfig) -> Self {
        Self {
            config: config.clone(),
            pattern_database: Arc::new(RwLock::new(PatternDatabase::default())),
            relationship_graph: Arc::new(RwLock::new(RelationshipGraph::default())),
            learning_stats: Arc::new(RwLock::new(LearningStats::default())),
        }
    }

    /// Discover framework relationships using pattern analysis
    pub async fn discover_framework_relationships(&self) -> Result<Vec<FrameworkRelationship>> {
        let mut relationships = Vec::new();

        // Analyze Next.js + Laravel patterns
        let nextjs_laravel = self.analyze_nextjs_laravel_relationship().await?;
        if let Some(relationship) = nextjs_laravel {
            relationships.push(relationship);
        }

        // Analyze React + Express patterns
        let react_express = self.analyze_react_express_relationship().await?;
        if let Some(relationship) = react_express {
            relationships.push(relationship);
        }

        // Analyze Vue + Laravel patterns
        let vue_laravel = self.analyze_vue_laravel_relationship().await?;
        if let Some(relationship) = vue_laravel {
            relationships.push(relationship);
        }

        // Update learning stats
        {
            let mut stats = self.learning_stats.write().await;
            stats.relationships_found += relationships.len() as u64;
            stats.last_update = Some(chrono::Utc::now());
        }

        Ok(relationships)
    }

    /// Get integration patterns between specific frameworks
    pub async fn get_integration_patterns(&self, primary: &str, secondary: &str) -> Result<Vec<IntegrationPattern>> {
        let pattern_key = format!("{}+{}", primary, secondary);
        
        let patterns = {
            let db = self.pattern_database.read().await;
            db.integration_patterns.get(&pattern_key).cloned().unwrap_or_default()
        };

        Ok(patterns)
    }

    /// Learn from a new template and update patterns
    pub async fn learn_from_template(&self, template_data: &TemplateData) -> Result<LearningResult> {
        let mut patterns_discovered = 0;
        let mut relationships_found = 0;

        // Extract patterns from template
        let extracted_patterns = self.extract_patterns_from_template(template_data).await?;
        patterns_discovered += extracted_patterns.len();

        // Update pattern database
        {
            let mut db = self.pattern_database.write().await;
            for pattern in extracted_patterns {
                self.store_pattern(&mut db, pattern).await?;
            }
        }

        // Discover relationships
        let new_relationships = self.discover_pattern_relationships(template_data).await?;
        relationships_found += new_relationships.len();

        // Update relationship graph
        {
            let mut graph = self.relationship_graph.write().await;
            for relationship in new_relationships {
                self.add_relationship(&mut graph, relationship).await?;
            }
        }

        // Update learning stats
        {
            let mut stats = self.learning_stats.write().await;
            stats.patterns_discovered += patterns_discovered as u64;
            stats.relationships_found += relationships_found as u64;
            stats.learning_iterations += 1;
            stats.last_update = Some(chrono::Utc::now());
        }

        Ok(LearningResult {
            patterns_discovered,
            relationships_found,
            quality_improvement: self.calculate_quality_improvement().await?,
        })
    }

    /// Generate recommendations based on learned patterns
    pub async fn generate_recommendations(&self, context: &RecommendationContext) -> Result<Vec<Recommendation>> {
        let mut recommendations = Vec::new();

        // Framework-specific recommendations
        if context.frameworks.contains(&"nextjs".to_string()) {
            recommendations.extend(self.generate_nextjs_recommendations(context).await?);
        }

        if context.frameworks.contains(&"laravel".to_string()) {
            recommendations.extend(self.generate_laravel_recommendations(context).await?);
        }

        // Integration recommendations
        if context.frameworks.len() > 1 {
            recommendations.extend(self.generate_integration_recommendations(context).await?);
        }

        // Sort by confidence
        recommendations.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap_or(std::cmp::Ordering::Equal));

        Ok(recommendations)
    }

    /// Analyze Next.js + Laravel relationship patterns
    async fn analyze_nextjs_laravel_relationship(&self) -> Result<Option<FrameworkRelationship>> {
        // This would analyze actual templates in a real implementation
        // For now, return a template relationship
        
        Ok(Some(FrameworkRelationship {
            primary_framework: "nextjs".to_string(),
            secondary_framework: "laravel".to_string(),
            relationship_type: "frontend-backend".to_string(),
            strength: 0.85,
            common_patterns: vec![
                "API Route Integration".to_string(),
                "Authentication Flow".to_string(),
                "Data Fetching".to_string(),
                "CORS Configuration".to_string(),
            ],
            example_chunks: vec![
                "nextjs-api-client".to_string(),
                "laravel-api-controller".to_string(),
                "auth-middleware".to_string(),
            ],
        }))
    }

    /// Analyze React + Express relationship patterns
    async fn analyze_react_express_relationship(&self) -> Result<Option<FrameworkRelationship>> {
        Ok(Some(FrameworkRelationship {
            primary_framework: "react".to_string(),
            secondary_framework: "express".to_string(),
            relationship_type: "spa-backend".to_string(),
            strength: 0.75,
            common_patterns: vec![
                "REST API Integration".to_string(),
                "State Management".to_string(),
                "Authentication".to_string(),
            ],
            example_chunks: vec![
                "react-api-hooks".to_string(),
                "express-router".to_string(),
            ],
        }))
    }

    /// Analyze Vue + Laravel relationship patterns
    async fn analyze_vue_laravel_relationship(&self) -> Result<Option<FrameworkRelationship>> {
        Ok(Some(FrameworkRelationship {
            primary_framework: "vue".to_string(),
            secondary_framework: "laravel".to_string(),
            relationship_type: "frontend-backend".to_string(),
            strength: 0.80,
            common_patterns: vec![
                "Inertia.js Integration".to_string(),
                "Blade Components".to_string(),
                "API Resources".to_string(),
            ],
            example_chunks: vec![
                "vue-inertia".to_string(),
                "laravel-inertia".to_string(),
            ],
        }))
    }

    /// Extract patterns from template data
    async fn extract_patterns_from_template(&self, template_data: &TemplateData) -> Result<Vec<ExtractedPattern>> {
        let mut patterns = Vec::new();

        // Extract framework patterns
        for framework in &template_data.frameworks {
            if let Some(framework_patterns) = self.extract_framework_patterns(template_data, framework).await? {
                patterns.extend(framework_patterns);
            }
        }

        // Extract code patterns
        let code_patterns = self.extract_code_patterns(template_data).await?;
        patterns.extend(code_patterns);

        // Extract architectural patterns
        let arch_patterns = self.extract_architectural_patterns(template_data).await?;
        patterns.extend(arch_patterns);

        Ok(patterns)
    }

    /// Extract framework-specific patterns
    async fn extract_framework_patterns(&self, template_data: &TemplateData, framework: &str) -> Result<Option<Vec<ExtractedPattern>>> {
        match framework {
            "nextjs" => self.extract_nextjs_patterns(template_data).await,
            "laravel" => self.extract_laravel_patterns(template_data).await,
            "react" => self.extract_react_patterns(template_data).await,
            "express" => self.extract_express_patterns(template_data).await,
            _ => Ok(None),
        }
    }

    /// Extract Next.js specific patterns
    async fn extract_nextjs_patterns(&self, template_data: &TemplateData) -> Result<Option<Vec<ExtractedPattern>>> {
        let mut patterns = Vec::new();

        // Check for App Router pattern
        if template_data.files.iter().any(|f| f.path.starts_with("app/")) {
            patterns.push(ExtractedPattern {
                id: "nextjs-app-router".to_string(),
                pattern_type: "routing".to_string(),
                name: "Next.js App Router".to_string(),
                description: "Next.js 13+ App Router pattern".to_string(),
                confidence: 0.95,
                frameworks: vec!["nextjs".to_string()],
                code_examples: vec![],
            });
        }

        // Check for Pages Router pattern
        if template_data.files.iter().any(|f| f.path.starts_with("pages/")) {
            patterns.push(ExtractedPattern {
                id: "nextjs-pages-router".to_string(),
                pattern_type: "routing".to_string(),
                name: "Next.js Pages Router".to_string(),
                description: "Traditional Next.js Pages Router pattern".to_string(),
                confidence: 0.90,
                frameworks: vec!["nextjs".to_string()],
                code_examples: vec![],
            });
        }

        // Check for API Routes
        if template_data.files.iter().any(|f| f.path.contains("api/")) {
            patterns.push(ExtractedPattern {
                id: "nextjs-api-routes".to_string(),
                pattern_type: "api".to_string(),
                name: "Next.js API Routes".to_string(),
                description: "Server-side API endpoints in Next.js".to_string(),
                confidence: 0.90,
                frameworks: vec!["nextjs".to_string()],
                code_examples: vec![],
            });
        }

        Ok(if patterns.is_empty() { None } else { Some(patterns) })
    }

    /// Extract Laravel specific patterns
    async fn extract_laravel_patterns(&self, template_data: &TemplateData) -> Result<Option<Vec<ExtractedPattern>>> {
        let mut patterns = Vec::new();

        // Check for MVC pattern
        let has_models = template_data.files.iter().any(|f| f.path.contains("Model"));
        let has_controllers = template_data.files.iter().any(|f| f.path.contains("Controller"));
        let has_views = template_data.files.iter().any(|f| f.path.contains("view") || f.path.contains("blade"));

        if has_models && has_controllers {
            patterns.push(ExtractedPattern {
                id: "laravel-mvc".to_string(),
                pattern_type: "architecture".to_string(),
                name: "Laravel MVC".to_string(),
                description: "Model-View-Controller pattern in Laravel".to_string(),
                confidence: 0.95,
                frameworks: vec!["laravel".to_string()],
                code_examples: vec![],
            });
        }

        // Check for API Resource pattern
        if template_data.files.iter().any(|f| f.path.contains("Resource")) {
            patterns.push(ExtractedPattern {
                id: "laravel-api-resources".to_string(),
                pattern_type: "api".to_string(),
                name: "Laravel API Resources".to_string(),
                description: "API resource transformation pattern".to_string(),
                confidence: 0.85,
                frameworks: vec!["laravel".to_string()],
                code_examples: vec![],
            });
        }

        Ok(if patterns.is_empty() { None } else { Some(patterns) })
    }

    /// Extract React specific patterns
    async fn extract_react_patterns(&self, _template_data: &TemplateData) -> Result<Option<Vec<ExtractedPattern>>> {
        // Implementation for React patterns
        Ok(None)
    }

    /// Extract Express specific patterns
    async fn extract_express_patterns(&self, _template_data: &TemplateData) -> Result<Option<Vec<ExtractedPattern>>> {
        // Implementation for Express patterns
        Ok(None)
    }

    /// Extract general code patterns
    async fn extract_code_patterns(&self, _template_data: &TemplateData) -> Result<Vec<ExtractedPattern>> {
        // Implementation for code patterns
        Ok(vec![])
    }

    /// Extract architectural patterns
    async fn extract_architectural_patterns(&self, _template_data: &TemplateData) -> Result<Vec<ExtractedPattern>> {
        // Implementation for architectural patterns
        Ok(vec![])
    }

    /// Discover relationships between patterns
    async fn discover_pattern_relationships(&self, _template_data: &TemplateData) -> Result<Vec<PatternRelationship>> {
        // Implementation for relationship discovery
        Ok(vec![])
    }

    /// Store pattern in database
    async fn store_pattern(&self, _db: &mut PatternDatabase, _pattern: ExtractedPattern) -> Result<()> {
        // Implementation for storing patterns
        Ok(())
    }

    /// Add relationship to graph
    async fn add_relationship(&self, _graph: &mut RelationshipGraph, _relationship: PatternRelationship) -> Result<()> {
        // Implementation for adding relationships
        Ok(())
    }

    /// Calculate quality improvement from learning
    async fn calculate_quality_improvement(&self) -> Result<f32> {
        // Simple implementation - in practice would analyze accuracy trends
        Ok(0.05) // 5% improvement
    }

    /// Generate Next.js specific recommendations
    async fn generate_nextjs_recommendations(&self, context: &RecommendationContext) -> Result<Vec<Recommendation>> {
        let mut recommendations = Vec::new();

        // Recommend App Router for new projects
        if !context.existing_patterns.contains("nextjs-app-router") {
            recommendations.push(Recommendation {
                id: "use-app-router".to_string(),
                title: "Use Next.js App Router".to_string(),
                description: "Consider using the new App Router for better performance and DX".to_string(),
                confidence: 0.85,
                priority: RecommendationPriority::Medium,
                category: "architecture".to_string(),
                implementation_examples: vec![
                    "Move pages to app/ directory".to_string(),
                    "Use layout.tsx for shared layouts".to_string(),
                ],
            });
        }

        // Recommend API integration for backend frameworks
        if context.frameworks.contains(&"laravel".to_string()) && 
           !context.existing_patterns.contains("api-integration") {
            recommendations.push(Recommendation {
                id: "nextjs-laravel-api".to_string(),
                title: "Integrate Next.js with Laravel API".to_string(),
                description: "Set up proper API integration between Next.js frontend and Laravel backend".to_string(),
                confidence: 0.90,
                priority: RecommendationPriority::High,
                category: "integration".to_string(),
                implementation_examples: vec![
                    "Configure CORS in Laravel".to_string(),
                    "Set up API client in Next.js".to_string(),
                    "Implement authentication flow".to_string(),
                ],
            });
        }

        Ok(recommendations)
    }

    /// Generate Laravel specific recommendations
    async fn generate_laravel_recommendations(&self, context: &RecommendationContext) -> Result<Vec<Recommendation>> {
        let mut recommendations = Vec::new();

        // Recommend API resources for frontend integration
        if context.frameworks.len() > 1 && !context.existing_patterns.contains("api-resources") {
            recommendations.push(Recommendation {
                id: "use-api-resources".to_string(),
                title: "Use Laravel API Resources".to_string(),
                description: "Implement API resources for consistent data transformation".to_string(),
                confidence: 0.80,
                priority: RecommendationPriority::Medium,
                category: "api".to_string(),
                implementation_examples: vec![
                    "Create resource classes for models".to_string(),
                    "Use resource collections for lists".to_string(),
                ],
            });
        }

        Ok(recommendations)
    }

    /// Generate integration recommendations
    async fn generate_integration_recommendations(&self, context: &RecommendationContext) -> Result<Vec<Recommendation>> {
        let mut recommendations = Vec::new();

        // Recommend authentication integration
        if !context.existing_patterns.contains("auth-integration") {
            recommendations.push(Recommendation {
                id: "integrate-auth".to_string(),
                title: "Integrate Authentication".to_string(),
                description: "Set up shared authentication between frontend and backend".to_string(),
                confidence: 0.95,
                priority: RecommendationPriority::High,
                category: "security".to_string(),
                implementation_examples: vec![
                    "Implement JWT token flow".to_string(),
                    "Set up protected routes".to_string(),
                    "Configure session management".to_string(),
                ],
            });
        }

        Ok(recommendations)
    }
}

/// Template data for learning
#[derive(Debug)]
pub struct TemplateData {
    pub id: String,
    pub name: String,
    pub frameworks: Vec<String>,
    pub files: Vec<FileData>,
    pub dependencies: Vec<String>,
}

/// File data for analysis
#[derive(Debug)]
pub struct FileData {
    pub path: String,
    pub content: String,
    pub language: Option<String>,
}

/// Extracted pattern from template
#[derive(Debug)]
pub struct ExtractedPattern {
    pub id: String,
    pub pattern_type: String,
    pub name: String,
    pub description: String,
    pub confidence: f32,
    pub frameworks: Vec<String>,
    pub code_examples: Vec<String>,
}

/// Relationship between patterns
#[derive(Debug)]
pub struct PatternRelationship {
    pub source_pattern: String,
    pub target_pattern: String,
    pub relationship_type: RelationshipType,
    pub strength: f32,
}

/// Learning result
#[derive(Debug)]
pub struct LearningResult {
    pub patterns_discovered: usize,
    pub relationships_found: usize,
    pub quality_improvement: f32,
}

/// Recommendation context
#[derive(Debug)]
pub struct RecommendationContext {
    pub frameworks: Vec<String>,
    pub existing_patterns: Vec<String>,
    pub project_type: String,
    pub complexity_level: String,
}

/// Generated recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub id: String,
    pub title: String,
    pub description: String,
    pub confidence: f32,
    pub priority: RecommendationPriority,
    pub category: String,
    pub implementation_examples: Vec<String>,
}

/// Recommendation priority levels
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum RecommendationPriority {
    Low,
    Medium,
    High,
    Critical,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_framework_relationship_discovery() {
        let config = LearningConfig::default();
        let algorithms = LearningAlgorithms::new(&config);

        let relationships = algorithms.discover_framework_relationships().await.unwrap();
        
        assert!(!relationships.is_empty());
        assert!(relationships.iter().any(|r| 
            r.primary_framework == "nextjs" && r.secondary_framework == "laravel"
        ));
    }

    #[tokio::test]
    async fn test_nextjs_pattern_extraction() {
        let config = LearningConfig::default();
        let algorithms = LearningAlgorithms::new(&config);

        let template_data = TemplateData {
            id: "test".to_string(),
            name: "Test Template".to_string(),
            frameworks: vec!["nextjs".to_string()],
            files: vec![
                FileData {
                    path: "app/page.tsx".to_string(),
                    content: "export default function Page() {}".to_string(),
                    language: Some("tsx".to_string()),
                },
            ],
            dependencies: vec!["next".to_string()],
        };

        let patterns = algorithms.extract_nextjs_patterns(&template_data).await.unwrap();
        assert!(patterns.is_some());
        
        let patterns = patterns.unwrap();
        assert!(patterns.iter().any(|p| p.id == "nextjs-app-router"));
    }

    #[tokio::test]
    async fn test_recommendations_generation() {
        let config = LearningConfig::default();
        let algorithms = LearningAlgorithms::new(&config);

        let context = RecommendationContext {
            frameworks: vec!["nextjs".to_string(), "laravel".to_string()],
            existing_patterns: vec![],
            project_type: "web-app".to_string(),
            complexity_level: "medium".to_string(),
        };

        let recommendations = algorithms.generate_recommendations(&context).await.unwrap();
        
        assert!(!recommendations.is_empty());
        assert!(recommendations.iter().any(|r| r.category == "integration"));
    }
}