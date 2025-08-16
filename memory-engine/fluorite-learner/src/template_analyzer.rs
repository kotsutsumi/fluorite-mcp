//! Template analysis and quality assessment
//! 
//! Provides comprehensive analysis of Spike templates including quality scoring,
//! complexity assessment, and structural analysis for learning optimization.

use std::collections::{HashMap, HashSet};

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::spike_parser::{SpikeTemplate, SpikeFile};

/// Template analyzer for quality and complexity assessment
#[derive(Debug)]
pub struct TemplateAnalyzer {
    learning_rate: f32,
    quality_metrics: QualityMetrics,
    complexity_calculator: ComplexityCalculator,
}

/// Template analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateAnalysis {
    /// Overall quality score (0.0 - 1.0)
    pub quality_score: f32,
    /// Complexity score (0.0 - 1.0)
    pub complexity_score: f32,
    /// Maintainability score (0.0 - 1.0)
    pub maintainability_score: f32,
    /// Reusability score (0.0 - 1.0)
    pub reusability_score: f32,
    /// Detected patterns
    pub patterns: Vec<String>,
    /// Quality issues found
    pub issues: Vec<QualityIssue>,
    /// Recommendations for improvement
    pub recommendations: Vec<String>,
    /// Detailed metrics
    pub metrics: AnalysisMetrics,
}

/// Quality issue detected in template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityIssue {
    /// Issue type
    pub issue_type: IssueType,
    /// Severity level
    pub severity: IssueSeverity,
    /// Issue description
    pub description: String,
    /// File where issue was found
    pub file_path: Option<String>,
    /// Line number if applicable
    pub line_number: Option<u32>,
    /// Suggested fix
    pub suggestion: Option<String>,
}

/// Types of quality issues
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum IssueType {
    /// Missing documentation
    Documentation,
    /// Security vulnerability
    Security,
    /// Performance issue
    Performance,
    /// Maintainability concern
    Maintainability,
    /// Code structure issue
    Structure,
    /// Dependency issue
    Dependency,
    /// Configuration issue
    Configuration,
    /// Testing issue
    Testing,
}

/// Issue severity levels
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum IssueSeverity {
    Low,
    Medium,
    High,
    Critical,
}

/// Detailed analysis metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisMetrics {
    /// Lines of code across all files
    pub total_lines: u32,
    /// Number of files
    pub file_count: u32,
    /// Number of dependencies
    pub dependency_count: u32,
    /// Cyclomatic complexity
    pub cyclomatic_complexity: f32,
    /// Documentation coverage (0.0 - 1.0)
    pub documentation_coverage: f32,
    /// Test coverage estimation (0.0 - 1.0)
    pub test_coverage_estimate: f32,
    /// Unique framework count
    pub framework_count: u32,
    /// Configuration complexity
    pub config_complexity: f32,
}

/// Quality metrics calculator
#[derive(Debug)]
pub struct QualityMetrics {
    weights: QualityWeights,
}

/// Weights for different quality aspects
#[derive(Debug, Clone)]
pub struct QualityWeights {
    pub documentation: f32,
    pub structure: f32,
    pub dependencies: f32,
    pub security: f32,
    pub performance: f32,
    pub maintainability: f32,
    pub testing: f32,
}

/// Complexity calculator
#[derive(Debug)]
pub struct ComplexityCalculator {
    language_weights: HashMap<String, f32>,
}

impl Default for QualityWeights {
    fn default() -> Self {
        Self {
            documentation: 0.15,
            structure: 0.20,
            dependencies: 0.15,
            security: 0.20,
            performance: 0.10,
            maintainability: 0.15,
            testing: 0.05,
        }
    }
}

impl TemplateAnalyzer {
    /// Create a new template analyzer
    pub fn new(learning_rate: f32) -> Self {
        Self {
            learning_rate,
            quality_metrics: QualityMetrics::new(),
            complexity_calculator: ComplexityCalculator::new(),
        }
    }

    /// Analyze a Spike template comprehensively
    pub async fn analyze(&self, template: &SpikeTemplate) -> Result<TemplateAnalysis> {
        tracing::debug!("Analyzing template: {}", template.name);

        // Calculate metrics
        let metrics = self.calculate_metrics(template).await?;
        
        // Assess quality aspects
        let quality_score = self.quality_metrics.calculate_quality(template, &metrics).await?;
        let complexity_score = self.complexity_calculator.calculate_complexity(template).await?;
        let maintainability_score = self.calculate_maintainability(template, &metrics).await?;
        let reusability_score = self.calculate_reusability(template, &metrics).await?;

        // Detect patterns
        let patterns = self.detect_patterns(template).await?;

        // Find quality issues
        let issues = self.find_quality_issues(template).await?;

        // Generate recommendations
        let recommendations = self.generate_recommendations(template, &issues).await?;

        let analysis = TemplateAnalysis {
            quality_score,
            complexity_score,
            maintainability_score,
            reusability_score,
            patterns,
            issues,
            recommendations,
            metrics,
        };

        tracing::debug!("Template analysis completed: quality={:.2}, complexity={:.2}", 
                       quality_score, complexity_score);
        
        Ok(analysis)
    }

    /// Calculate detailed metrics for the template
    async fn calculate_metrics(&self, template: &SpikeTemplate) -> Result<AnalysisMetrics> {
        let mut total_lines = 0;
        let mut has_tests = false;
        let mut documentation_files = 0;

        for file in &template.files {
            total_lines += file.content.lines().count() as u32;
            
            if file.path.contains("test") || file.path.contains("spec") {
                has_tests = true;
            }
            
            if file.path.ends_with(".md") || file.description.is_some() {
                documentation_files += 1;
            }
        }

        let documentation_coverage = if template.files.is_empty() {
            0.0
        } else {
            documentation_files as f32 / template.files.len() as f32
        };

        let test_coverage_estimate = if has_tests { 0.7 } else { 0.0 };

        let cyclomatic_complexity = self.calculate_cyclomatic_complexity(template).await?;
        let config_complexity = self.calculate_config_complexity(template).await?;

        Ok(AnalysisMetrics {
            total_lines,
            file_count: template.files.len() as u32,
            dependency_count: template.dependencies.len() as u32,
            cyclomatic_complexity,
            documentation_coverage,
            test_coverage_estimate,
            framework_count: template.frameworks.len() as u32,
            config_complexity,
        })
    }

    /// Calculate cyclomatic complexity
    async fn calculate_cyclomatic_complexity(&self, template: &SpikeTemplate) -> Result<f32> {
        let mut total_complexity = 0.0;
        let mut file_count = 0;

        for file in &template.files {
            if let Some(language) = &file.language {
                if matches!(language.as_str(), "ts" | "tsx" | "js" | "jsx" | "php") {
                    total_complexity += self.calculate_file_complexity(file);
                    file_count += 1;
                }
            }
        }

        Ok(if file_count > 0 {
            total_complexity / file_count as f32
        } else {
            1.0
        })
    }

    /// Calculate complexity for a single file
    fn calculate_file_complexity(&self, file: &SpikeFile) -> f32 {
        let mut complexity = 1.0; // Base complexity

        // Count control flow statements
        let control_keywords = [
            "if", "else", "while", "for", "switch", "case", "catch", "&&", "||", "?", ":"
        ];

        for keyword in &control_keywords {
            complexity += file.content.matches(keyword).count() as f32;
        }

        // Function definitions add complexity
        complexity += file.content.matches("function").count() as f32 * 0.5;
        complexity += file.content.matches("=>").count() as f32 * 0.3;

        complexity
    }

    /// Calculate configuration complexity
    async fn calculate_config_complexity(&self, template: &SpikeTemplate) -> Result<f32> {
        let mut complexity = 0.0;

        // Configuration files add complexity
        for file in &template.files {
            if file.path.ends_with(".json") || file.path.ends_with(".yaml") || 
               file.path.ends_with(".yml") || file.path.contains("config") {
                complexity += 0.5;
                
                // JSON/YAML complexity based on nesting
                let nesting_chars = file.content.matches('{').count() + 
                                   file.content.matches('[').count();
                complexity += nesting_chars as f32 * 0.1;
            }
        }

        // Environment variables add complexity
        if let Some(config) = &template.config {
            complexity += config.env_vars.len() as f32 * 0.1;
            complexity += config.build_commands.len() as f32 * 0.2;
        }

        Ok(complexity.min(5.0) / 5.0) // Normalize to 0-1
    }

    /// Calculate maintainability score
    async fn calculate_maintainability(&self, template: &SpikeTemplate, metrics: &AnalysisMetrics) -> Result<f32> {
        let mut score = 1.0;

        // Penalize high complexity
        if metrics.cyclomatic_complexity > 5.0 {
            score -= 0.2;
        }

        // Reward good documentation
        score += metrics.documentation_coverage * 0.3;

        // Penalize too many dependencies
        if metrics.dependency_count > 20 {
            score -= 0.2;
        }

        // Reward test presence
        score += metrics.test_coverage_estimate * 0.2;

        // Penalize large files
        if metrics.total_lines > 500 {
            score -= 0.1;
        }

        Ok(score.max(0.0).min(1.0))
    }

    /// Calculate reusability score
    async fn calculate_reusability(&self, template: &SpikeTemplate, metrics: &AnalysisMetrics) -> Result<f32> {
        let mut score = 0.5; // Base score

        // Generic templates are more reusable
        if template.name.contains("generic") || template.name.contains("base") {
            score += 0.2;
        }

        // Good documentation improves reusability
        score += metrics.documentation_coverage * 0.3;

        // Fewer dependencies improve reusability
        if metrics.dependency_count < 10 {
            score += 0.2;
        }

        // Multiple framework support improves reusability
        if metrics.framework_count > 1 {
            score += 0.1;
        }

        // Configuration options improve reusability
        if template.config.is_some() {
            score += 0.2;
        }

        Ok(score.max(0.0).min(1.0))
    }

    /// Detect patterns in the template
    async fn detect_patterns(&self, template: &SpikeTemplate) -> Result<Vec<String>> {
        let mut patterns = Vec::new();

        // Architectural patterns
        if self.has_mvc_pattern(template) {
            patterns.push("MVC Architecture".to_string());
        }

        if self.has_microservice_pattern(template) {
            patterns.push("Microservice".to_string());
        }

        if self.has_api_pattern(template) {
            patterns.push("RESTful API".to_string());
        }

        // Framework-specific patterns
        if template.frameworks.contains(&"nextjs".to_string()) {
            if self.has_ssr_pattern(template) {
                patterns.push("Server-Side Rendering".to_string());
            }
            
            if self.has_ssg_pattern(template) {
                patterns.push("Static Site Generation".to_string());
            }
        }

        // Security patterns
        if self.has_auth_pattern(template) {
            patterns.push("Authentication".to_string());
        }

        // Database patterns
        if self.has_database_pattern(template) {
            patterns.push("Database Integration".to_string());
        }

        Ok(patterns)
    }

    /// Find quality issues in the template
    async fn find_quality_issues(&self, template: &SpikeTemplate) -> Result<Vec<QualityIssue>> {
        let mut issues = Vec::new();

        // Check for missing documentation
        if template.description.is_empty() {
            issues.push(QualityIssue {
                issue_type: IssueType::Documentation,
                severity: IssueSeverity::Medium,
                description: "Template is missing description".to_string(),
                file_path: None,
                line_number: None,
                suggestion: Some("Add a clear description of what this template does".to_string()),
            });
        }

        // Check for security issues
        for file in &template.files {
            if self.has_hardcoded_secrets(&file.content) {
                issues.push(QualityIssue {
                    issue_type: IssueType::Security,
                    severity: IssueSeverity::Critical,
                    description: "Hardcoded secrets detected".to_string(),
                    file_path: Some(file.path.clone()),
                    line_number: None,
                    suggestion: Some("Use environment variables for sensitive data".to_string()),
                });
            }

            if self.has_sql_injection_risk(&file.content) {
                issues.push(QualityIssue {
                    issue_type: IssueType::Security,
                    severity: IssueSeverity::High,
                    description: "Potential SQL injection vulnerability".to_string(),
                    file_path: Some(file.path.clone()),
                    line_number: None,
                    suggestion: Some("Use parameterized queries or ORM".to_string()),
                });
            }
        }

        // Check for missing tests
        let has_tests = template.files.iter().any(|f| 
            f.path.contains("test") || f.path.contains("spec"));
        
        if !has_tests {
            issues.push(QualityIssue {
                issue_type: IssueType::Testing,
                severity: IssueSeverity::Medium,
                description: "No test files found".to_string(),
                file_path: None,
                line_number: None,
                suggestion: Some("Add unit tests for better reliability".to_string()),
            });
        }

        // Check for too many dependencies
        if template.dependencies.len() > 25 {
            issues.push(QualityIssue {
                issue_type: IssueType::Dependency,
                severity: IssueSeverity::Medium,
                description: "High number of dependencies".to_string(),
                file_path: None,
                line_number: None,
                suggestion: Some("Consider reducing dependencies to improve maintainability".to_string()),
            });
        }

        Ok(issues)
    }

    /// Generate recommendations for improvement
    async fn generate_recommendations(&self, template: &SpikeTemplate, issues: &[QualityIssue]) -> Result<Vec<String>> {
        let mut recommendations = Vec::new();

        // General recommendations based on issues
        let critical_issues = issues.iter().filter(|i| i.severity == IssueSeverity::Critical).count();
        let high_issues = issues.iter().filter(|i| i.severity == IssueSeverity::High).count();

        if critical_issues > 0 {
            recommendations.push(format!("Address {} critical security issues immediately", critical_issues));
        }

        if high_issues > 0 {
            recommendations.push(format!("Resolve {} high-priority issues", high_issues));
        }

        // Documentation recommendations
        if template.description.len() < 50 {
            recommendations.push("Expand template description with more detail".to_string());
        }

        // Framework-specific recommendations
        if template.frameworks.contains(&"nextjs".to_string()) {
            if !template.files.iter().any(|f| f.path.contains("_app.")) {
                recommendations.push("Consider adding a custom _app.tsx for better app configuration".to_string());
            }
        }

        // Performance recommendations
        if template.dependencies.len() > 15 {
            recommendations.push("Audit dependencies for unused packages".to_string());
        }

        // Testing recommendations
        if !template.files.iter().any(|f| f.path.contains("test")) {
            recommendations.push("Add unit tests to improve code quality and reliability".to_string());
        }

        Ok(recommendations)
    }

    // Pattern detection helpers
    fn has_mvc_pattern(&self, template: &SpikeTemplate) -> bool {
        let has_models = template.files.iter().any(|f| f.path.contains("model"));
        let has_views = template.files.iter().any(|f| f.path.contains("view") || f.path.contains("component"));
        let has_controllers = template.files.iter().any(|f| f.path.contains("controller"));
        
        has_models && has_views && has_controllers
    }

    fn has_microservice_pattern(&self, template: &SpikeTemplate) -> bool {
        template.files.iter().any(|f| 
            f.path.contains("service") && 
            (f.path.contains("api") || f.content.contains("express") || f.content.contains("fastify"))
        )
    }

    fn has_api_pattern(&self, template: &SpikeTemplate) -> bool {
        template.files.iter().any(|f| 
            f.path.contains("api") || 
            f.content.contains("router") ||
            f.content.contains("endpoint")
        )
    }

    fn has_ssr_pattern(&self, template: &SpikeTemplate) -> bool {
        template.files.iter().any(|f| f.content.contains("getServerSideProps"))
    }

    fn has_ssg_pattern(&self, template: &SpikeTemplate) -> bool {
        template.files.iter().any(|f| f.content.contains("getStaticProps"))
    }

    fn has_auth_pattern(&self, template: &SpikeTemplate) -> bool {
        template.files.iter().any(|f| 
            f.content.contains("auth") || 
            f.content.contains("login") ||
            f.content.contains("jwt") ||
            f.path.contains("auth")
        )
    }

    fn has_database_pattern(&self, template: &SpikeTemplate) -> bool {
        template.dependencies.iter().any(|d| 
            d.name.contains("sequelize") ||
            d.name.contains("mongoose") ||
            d.name.contains("prisma") ||
            d.name.contains("typeorm")
        ) || template.files.iter().any(|f| 
            f.content.contains("database") ||
            f.content.contains("db.") ||
            f.path.contains("model")
        )
    }

    // Security issue detectors
    fn has_hardcoded_secrets(&self, content: &str) -> bool {
        let secret_patterns = [
            r"password\s*=\s*['\"][^'\"]+['\"]",
            r"api_key\s*=\s*['\"][^'\"]+['\"]",
            r"secret\s*=\s*['\"][^'\"]+['\"]",
            r"token\s*=\s*['\"][a-zA-Z0-9]{20,}['\"]",
        ];

        secret_patterns.iter().any(|pattern| {
            regex::Regex::new(pattern).map_or(false, |re| re.is_match(content))
        })
    }

    fn has_sql_injection_risk(&self, content: &str) -> bool {
        content.contains("query(") && content.contains("${") ||
        content.contains("execute(") && content.contains("${") ||
        (content.contains("SELECT") && content.contains("${"))
    }
}

impl QualityMetrics {
    pub fn new() -> Self {
        Self {
            weights: QualityWeights::default(),
        }
    }

    pub async fn calculate_quality(&self, template: &SpikeTemplate, metrics: &AnalysisMetrics) -> Result<f32> {
        let mut score = 0.0;

        // Documentation score
        let doc_score = metrics.documentation_coverage;
        score += doc_score * self.weights.documentation;

        // Structure score (based on file organization)
        let structure_score = self.calculate_structure_score(template);
        score += structure_score * self.weights.structure;

        // Dependency score (fewer is better, but not too few)
        let dep_score = self.calculate_dependency_score(metrics.dependency_count);
        score += dep_score * self.weights.dependencies;

        // Security score (basic heuristics)
        let security_score = self.calculate_security_score(template);
        score += security_score * self.weights.security;

        // Performance score
        let perf_score = 1.0 - (metrics.cyclomatic_complexity / 10.0).min(1.0);
        score += perf_score * self.weights.performance;

        // Maintainability score
        let maint_score = 1.0 - (metrics.total_lines as f32 / 1000.0).min(1.0);
        score += maint_score * self.weights.maintainability;

        // Testing score
        let test_score = metrics.test_coverage_estimate;
        score += test_score * self.weights.testing;

        Ok(score.max(0.0).min(1.0))
    }

    fn calculate_structure_score(&self, template: &SpikeTemplate) -> f32 {
        let has_organized_structure = template.files.iter().any(|f| {
            f.path.contains("/") // Has directory structure
        });

        if has_organized_structure { 0.8 } else { 0.4 }
    }

    fn calculate_dependency_score(&self, dep_count: u32) -> f32 {
        match dep_count {
            0..=5 => 0.6,
            6..=15 => 1.0,
            16..=25 => 0.8,
            _ => 0.4,
        }
    }

    fn calculate_security_score(&self, template: &SpikeTemplate) -> f32 {
        let mut score = 1.0;

        for file in &template.files {
            if file.content.contains("eval(") {
                score -= 0.3;
            }
            if file.content.contains("innerHTML") {
                score -= 0.1;
            }
        }

        score.max(0.0)
    }
}

impl ComplexityCalculator {
    pub fn new() -> Self {
        let mut language_weights = HashMap::new();
        language_weights.insert("typescript".to_string(), 1.0);
        language_weights.insert("javascript".to_string(), 0.8);
        language_weights.insert("tsx".to_string(), 1.2);
        language_weights.insert("jsx".to_string(), 1.0);
        language_weights.insert("php".to_string(), 0.9);
        language_weights.insert("json".to_string(), 0.3);

        Self { language_weights }
    }

    pub async fn calculate_complexity(&self, template: &SpikeTemplate) -> Result<f32> {
        let mut total_complexity = 0.0;
        let mut weighted_files = 0.0;

        for file in &template.files {
            if let Some(language) = &file.language {
                let weight = self.language_weights.get(language).unwrap_or(&1.0);
                let file_complexity = self.calculate_file_complexity(file);
                total_complexity += file_complexity * weight;
                weighted_files += weight;
            }
        }

        let avg_complexity = if weighted_files > 0.0 {
            total_complexity / weighted_files
        } else {
            0.0
        };

        Ok((avg_complexity / 10.0).min(1.0)) // Normalize to 0-1
    }

    fn calculate_file_complexity(&self, file: &SpikeFile) -> f32 {
        let line_count = file.content.lines().count() as f32;
        let function_count = file.content.matches("function").count() as f32;
        let class_count = file.content.matches("class ").count() as f32;
        
        // Basic complexity calculation
        (line_count / 50.0) + (function_count * 0.5) + (class_count * 1.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::spike_parser::{SpikeFile, SpikeDependency};

    fn create_test_template() -> SpikeTemplate {
        SpikeTemplate {
            name: "test-template".to_string(),
            description: "A comprehensive test template for analysis".to_string(),
            frameworks: vec!["nextjs".to_string()],
            dependencies: vec![
                SpikeDependency {
                    name: "next".to_string(),
                    version: Some("^13.0.0".to_string()),
                    dep_type: None,
                    registry: None,
                    optional: None,
                },
            ],
            files: vec![
                SpikeFile {
                    path: "pages/index.tsx".to_string(),
                    content: "export default function Home() { return <div>Hello World</div>; }".to_string(),
                    language: Some("tsx".to_string()),
                    description: Some("Main page component".to_string()),
                    executable: None,
                    permissions: None,
                    variables: vec![],
                },
            ],
            tags: vec!["web".to_string()],
            config: None,
            environment: None,
            examples: vec![],
            metadata: std::collections::HashMap::new(),
        }
    }

    #[tokio::test]
    async fn test_template_analysis() {
        let template = create_test_template();
        let analyzer = TemplateAnalyzer::new(0.1);

        let analysis = analyzer.analyze(&template).await.unwrap();

        assert!(analysis.quality_score >= 0.0 && analysis.quality_score <= 1.0);
        assert!(analysis.complexity_score >= 0.0 && analysis.complexity_score <= 1.0);
        assert!(analysis.maintainability_score >= 0.0 && analysis.maintainability_score <= 1.0);
        assert!(analysis.reusability_score >= 0.0 && analysis.reusability_score <= 1.0);
    }

    #[tokio::test]
    async fn test_metrics_calculation() {
        let template = create_test_template();
        let analyzer = TemplateAnalyzer::new(0.1);

        let metrics = analyzer.calculate_metrics(&template).await.unwrap();

        assert_eq!(metrics.file_count, 1);
        assert_eq!(metrics.dependency_count, 1);
        assert_eq!(metrics.framework_count, 1);
        assert!(metrics.total_lines > 0);
    }

    #[tokio::test]
    async fn test_quality_issues_detection() {
        let mut template = create_test_template();
        // Add a file with security issues
        template.files.push(SpikeFile {
            path: "config.js".to_string(),
            content: "const password = 'hardcoded123'; const query = `SELECT * FROM users WHERE id = ${userId}`;".to_string(),
            language: Some("js".to_string()),
            description: None,
            executable: None,
            permissions: None,
            variables: vec![],
        });

        let analyzer = TemplateAnalyzer::new(0.1);
        let issues = analyzer.find_quality_issues(&template).await.unwrap();

        assert!(!issues.is_empty());
        assert!(issues.iter().any(|i| i.issue_type == IssueType::Security));
    }

    #[test]
    fn test_pattern_detection() {
        let mut template = create_test_template();
        template.files.push(SpikeFile {
            path: "pages/api/auth.ts".to_string(),
            content: "export default function handler(req, res) { /* auth logic */ }".to_string(),
            language: Some("ts".to_string()),
            description: None,
            executable: None,
            permissions: None,
            variables: vec![],
        });

        let analyzer = TemplateAnalyzer::new(0.1);
        assert!(analyzer.has_auth_pattern(&template));
        assert!(analyzer.has_api_pattern(&template));
    }
}