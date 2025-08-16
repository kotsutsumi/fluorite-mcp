//! Spike template parser and data structures
//! 
//! Handles parsing of Spike templates from JSON files, extracting metadata,
//! dependencies, and code patterns for learning analysis.

use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::fs;

/// Spike template structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeTemplate {
    /// Template name/identifier
    pub name: String,
    /// Human-readable description
    pub description: String,
    /// Target frameworks
    pub frameworks: Vec<String>,
    /// Template dependencies
    pub dependencies: Vec<SpikeDependency>,
    /// Files to be generated
    pub files: Vec<SpikeFile>,
    /// Metadata tags
    pub tags: Vec<String>,
    /// Configuration options
    pub config: Option<SpikeConfig>,
    /// Environment requirements
    pub environment: Option<SpikeEnvironment>,
    /// Examples and usage
    pub examples: Vec<SpikeExample>,
    /// Custom metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Dependency specification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeDependency {
    /// Package name
    pub name: String,
    /// Version constraint
    pub version: Option<String>,
    /// Dependency type (runtime, dev, peer)
    #[serde(rename = "type")]
    pub dep_type: Option<String>,
    /// Registry or source
    pub registry: Option<String>,
    /// Optional flag
    pub optional: Option<bool>,
}

/// File specification in template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeFile {
    /// File path (relative to project root)
    pub path: String,
    /// File content or template
    pub content: String,
    /// File type/language
    pub language: Option<String>,
    /// File description
    pub description: Option<String>,
    /// Whether file is executable
    pub executable: Option<bool>,
    /// File permissions (Unix style)
    pub permissions: Option<String>,
    /// Template variables used in this file
    pub variables: Vec<String>,
}

/// Configuration options for the template
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeConfig {
    /// Required Node.js version
    pub node_version: Option<String>,
    /// Required package manager
    pub package_manager: Option<String>,
    /// Build commands
    pub build_commands: Vec<String>,
    /// Development commands
    pub dev_commands: Vec<String>,
    /// Test commands
    pub test_commands: Vec<String>,
    /// Environment variables
    pub env_vars: HashMap<String, String>,
    /// Custom configuration
    pub custom: HashMap<String, serde_json::Value>,
}

/// Environment requirements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeEnvironment {
    /// Operating system requirements
    pub os: Vec<String>,
    /// Architecture requirements
    pub arch: Vec<String>,
    /// Required tools
    pub tools: Vec<String>,
    /// Environment variables
    pub variables: HashMap<String, String>,
    /// Port requirements
    pub ports: Vec<u16>,
}

/// Usage example
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpikeExample {
    /// Example name
    pub name: String,
    /// Description
    pub description: String,
    /// Command to run
    pub command: String,
    /// Expected output
    pub output: Option<String>,
    /// Additional notes
    pub notes: Option<String>,
}

/// Spike template parser
#[derive(Debug)]
pub struct SpikeParser {
    /// Parser configuration
    config: ParserConfig,
}

/// Parser configuration
#[derive(Debug, Clone)]
pub struct ParserConfig {
    /// Validate templates during parsing
    pub validate: bool,
    /// Extract code patterns
    pub extract_patterns: bool,
    /// Maximum file size to process (bytes)
    pub max_file_size: usize,
}

impl Default for ParserConfig {
    fn default() -> Self {
        Self {
            validate: true,
            extract_patterns: true,
            max_file_size: 1024 * 1024, // 1MB
        }
    }
}

impl SpikeParser {
    /// Create a new Spike parser
    pub fn new() -> Self {
        Self {
            config: ParserConfig::default(),
        }
    }

    /// Create parser with custom configuration
    pub fn with_config(config: ParserConfig) -> Self {
        Self { config }
    }

    /// Parse a Spike template from file
    pub async fn parse_spike_file(&self, file_path: &Path) -> Result<SpikeTemplate> {
        tracing::debug!("Parsing Spike template: {}", file_path.display());

        // Check file size
        let metadata = fs::metadata(file_path).await
            .context("Failed to read file metadata")?;
        
        if metadata.len() > self.config.max_file_size as u64 {
            return Err(anyhow::anyhow!(
                "File too large: {} bytes (max: {})", 
                metadata.len(), 
                self.config.max_file_size
            ));
        }

        // Read and parse file
        let content = fs::read_to_string(file_path).await
            .context("Failed to read Spike template file")?;

        let mut spike_template: SpikeTemplate = serde_json::from_str(&content)
            .context("Failed to parse Spike template JSON")?;

        // Set name from filename if not specified
        if spike_template.name.is_empty() {
            if let Some(stem) = file_path.file_stem() {
                spike_template.name = stem.to_string_lossy().to_string();
            }
        }

        // Validate template if enabled
        if self.config.validate {
            self.validate_template(&spike_template)
                .context("Template validation failed")?;
        }

        // Extract additional metadata
        self.enhance_template_metadata(&mut spike_template).await?;

        tracing::debug!("Successfully parsed Spike template: {}", spike_template.name);
        Ok(spike_template)
    }

    /// Parse Spike template from string content
    pub async fn parse_spike_content(&self, content: &str, name: Option<String>) -> Result<SpikeTemplate> {
        let mut spike_template: SpikeTemplate = serde_json::from_str(content)
            .context("Failed to parse Spike template JSON")?;

        // Set name if provided
        if let Some(name) = name {
            spike_template.name = name;
        }

        // Validate template if enabled
        if self.config.validate {
            self.validate_template(&spike_template)
                .context("Template validation failed")?;
        }

        // Extract additional metadata
        self.enhance_template_metadata(&mut spike_template).await?;

        Ok(spike_template)
    }

    /// Extract framework information from template
    pub fn extract_frameworks(&self, template: &SpikeTemplate) -> Vec<String> {
        let mut frameworks = template.frameworks.clone();

        // Infer frameworks from dependencies
        for dep in &template.dependencies {
            match dep.name.as_str() {
                "next" | "@next/core" => {
                    if !frameworks.contains(&"nextjs".to_string()) {
                        frameworks.push("nextjs".to_string());
                    }
                }
                "react" | "react-dom" => {
                    if !frameworks.contains(&"react".to_string()) {
                        frameworks.push("react".to_string());
                    }
                }
                "express" => {
                    if !frameworks.contains(&"express".to_string()) {
                        frameworks.push("express".to_string());
                    }
                }
                "fastify" => {
                    if !frameworks.contains(&"fastify".to_string()) {
                        frameworks.push("fastify".to_string());
                    }
                }
                "hono" => {
                    if !frameworks.contains(&"hono".to_string()) {
                        frameworks.push("hono".to_string());
                    }
                }
                "vue" => {
                    if !frameworks.contains(&"vue".to_string()) {
                        frameworks.push("vue".to_string());
                    }
                }
                _ => {}
            }
        }

        // Infer from file patterns
        for file in &template.files {
            if file.path.contains("pages/") || file.path.contains("app/") {
                if file.language.as_deref() == Some("tsx") || file.language.as_deref() == Some("jsx") {
                    if !frameworks.contains(&"nextjs".to_string()) {
                        frameworks.push("nextjs".to_string());
                    }
                }
            }

            if file.path.ends_with(".php") || file.content.contains("<?php") {
                if !frameworks.contains(&"laravel".to_string()) {
                    frameworks.push("laravel".to_string());
                }
            }
        }

        frameworks
    }

    /// Extract patterns from template files
    pub fn extract_file_patterns(&self, template: &SpikeTemplate) -> Vec<FilePattern> {
        let mut patterns = Vec::new();

        for file in &template.files {
            let pattern = self.analyze_file_pattern(file);
            patterns.push(pattern);
        }

        patterns
    }

    /// Get template complexity score
    pub fn calculate_complexity(&self, template: &SpikeTemplate) -> f32 {
        let mut complexity = 0.0;

        // Base complexity from file count
        complexity += template.files.len() as f32 * 0.1;

        // Dependency complexity
        complexity += template.dependencies.len() as f32 * 0.05;

        // Framework complexity
        complexity += template.frameworks.len() as f32 * 0.2;

        // File content complexity
        for file in &template.files {
            complexity += self.calculate_file_complexity(file);
        }

        // Normalize to 0-1 range
        (complexity / 10.0).min(1.0)
    }

    /// Validate template structure and content
    fn validate_template(&self, template: &SpikeTemplate) -> Result<()> {
        // Check required fields
        if template.name.is_empty() {
            return Err(anyhow::anyhow!("Template name is required"));
        }

        if template.description.is_empty() {
            return Err(anyhow::anyhow!("Template description is required"));
        }

        if template.frameworks.is_empty() {
            return Err(anyhow::anyhow!("At least one framework must be specified"));
        }

        // Validate files
        for file in &template.files {
            if file.path.is_empty() {
                return Err(anyhow::anyhow!("File path cannot be empty"));
            }

            if file.content.is_empty() {
                return Err(anyhow::anyhow!("File content cannot be empty for path: {}", file.path));
            }
        }

        // Validate dependencies
        for dep in &template.dependencies {
            if dep.name.is_empty() {
                return Err(anyhow::anyhow!("Dependency name cannot be empty"));
            }
        }

        Ok(())
    }

    /// Enhance template with additional metadata
    async fn enhance_template_metadata(&self, template: &mut SpikeTemplate) -> Result<()> {
        // Extract frameworks if not explicitly set
        if template.frameworks.is_empty() {
            template.frameworks = self.extract_frameworks(template);
        }

        // Add complexity metadata
        let complexity = self.calculate_complexity(template);
        template.metadata.insert(
            "complexity_score".to_string(),
            serde_json::Value::Number(serde_json::Number::from_f64(complexity as f64).unwrap())
        );

        // Add file count metadata
        template.metadata.insert(
            "file_count".to_string(),
            serde_json::Value::Number(serde_json::Number::from(template.files.len()))
        );

        // Add dependency count metadata
        template.metadata.insert(
            "dependency_count".to_string(),
            serde_json::Value::Number(serde_json::Number::from(template.dependencies.len()))
        );

        Ok(())
    }

    /// Analyze file pattern
    fn analyze_file_pattern(&self, file: &SpikeFile) -> FilePattern {
        let mut pattern_type = FilePatternType::Generic;
        let mut features = Vec::new();

        // Determine pattern type from path and content
        if file.path.contains("pages/") || file.path.contains("app/") {
            pattern_type = FilePatternType::Page;
        } else if file.path.contains("components/") {
            pattern_type = FilePatternType::Component;
        } else if file.path.contains("api/") {
            pattern_type = FilePatternType::ApiRoute;
        } else if file.path.ends_with(".config.js") || file.path.ends_with(".config.ts") {
            pattern_type = FilePatternType::Configuration;
        }

        // Extract features from content
        if file.content.contains("export default") {
            features.push("default_export".to_string());
        }
        if file.content.contains("getServerSideProps") {
            features.push("ssr".to_string());
        }
        if file.content.contains("getStaticProps") {
            features.push("ssg".to_string());
        }
        if file.content.contains("useState") {
            features.push("react_hooks".to_string());
        }
        if file.content.contains("async") {
            features.push("async".to_string());
        }

        FilePattern {
            file_path: file.path.clone(),
            pattern_type,
            features,
            language: file.language.clone(),
            complexity: self.calculate_file_complexity(file),
        }
    }

    /// Calculate complexity of a single file
    fn calculate_file_complexity(&self, file: &SpikeFile) -> f32 {
        let mut complexity = 0.0;

        // Line count complexity
        let line_count = file.content.lines().count();
        complexity += (line_count as f32 / 100.0).min(1.0);

        // Feature complexity
        let feature_keywords = [
            "async", "await", "Promise", "useEffect", "useState", "getServerSideProps",
            "getStaticProps", "fetch", "api", "database", "auth"
        ];

        for keyword in &feature_keywords {
            if file.content.contains(keyword) {
                complexity += 0.1;
            }
        }

        complexity.min(2.0) / 2.0 // Normalize to 0-1
    }
}

/// File pattern information
#[derive(Debug, Clone)]
pub struct FilePattern {
    pub file_path: String,
    pub pattern_type: FilePatternType,
    pub features: Vec<String>,
    pub language: Option<String>,
    pub complexity: f32,
}

/// Types of file patterns
#[derive(Debug, Clone, PartialEq)]
pub enum FilePatternType {
    /// React/Next.js page component
    Page,
    /// Reusable component
    Component,
    /// API route handler
    ApiRoute,
    /// Configuration file
    Configuration,
    /// Database model
    Model,
    /// Utility/helper function
    Utility,
    /// Test file
    Test,
    /// Generic file
    Generic,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;
    use tokio::io::AsyncWriteExt;

    #[tokio::test]
    async fn test_parse_spike_template() {
        let spike_content = r#"{
            "name": "test-spike",
            "description": "Test spike template",
            "frameworks": ["nextjs"],
            "dependencies": [
                {"name": "next", "version": "^13.0.0"},
                {"name": "react", "version": "^18.0.0"}
            ],
            "files": [
                {
                    "path": "pages/index.tsx",
                    "content": "export default function Home() { return <div>Hello</div>; }",
                    "language": "tsx",
                    "variables": []
                }
            ],
            "tags": ["web", "frontend"],
            "examples": []
        }"#;

        let parser = SpikeParser::new();
        let template = parser.parse_spike_content(spike_content, None).await.unwrap();

        assert_eq!(template.name, "test-spike");
        assert_eq!(template.frameworks, vec!["nextjs"]);
        assert_eq!(template.dependencies.len(), 2);
        assert_eq!(template.files.len(), 1);
    }

    #[tokio::test]
    async fn test_framework_extraction() {
        let spike_content = r#"{
            "name": "test",
            "description": "Test",
            "frameworks": [],
            "dependencies": [
                {"name": "next", "version": "^13.0.0"},
                {"name": "express", "version": "^4.0.0"}
            ],
            "files": [],
            "tags": [],
            "examples": []
        }"#;

        let parser = SpikeParser::new();
        let template = parser.parse_spike_content(spike_content, None).await.unwrap();

        let frameworks = parser.extract_frameworks(&template);
        assert!(frameworks.contains(&"nextjs".to_string()));
        assert!(frameworks.contains(&"express".to_string()));
    }

    #[tokio::test]
    async fn test_complexity_calculation() {
        let spike_content = r#"{
            "name": "complex-spike",
            "description": "Complex spike template",
            "frameworks": ["nextjs", "react"],
            "dependencies": [
                {"name": "next", "version": "^13.0.0"},
                {"name": "react", "version": "^18.0.0"},
                {"name": "typescript", "version": "^4.0.0"}
            ],
            "files": [
                {
                    "path": "pages/index.tsx",
                    "content": "import React, { useState, useEffect } from 'react';\nexport default function Home() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('/api/data').then(res => res.json()).then(setData);\n  }, []);\n  return <div>{data}</div>;\n}",
                    "language": "tsx",
                    "variables": []
                },
                {
                    "path": "pages/api/data.ts",
                    "content": "export default async function handler(req, res) {\n  const data = await fetchData();\n  res.json(data);\n}",
                    "language": "ts",
                    "variables": []
                }
            ],
            "tags": [],
            "examples": []
        }"#;

        let parser = SpikeParser::new();
        let template = parser.parse_spike_content(spike_content, None).await.unwrap();

        let complexity = parser.calculate_complexity(&template);
        assert!(complexity > 0.0);
        assert!(complexity <= 1.0);
    }

    #[tokio::test]
    async fn test_file_pattern_analysis() {
        let file = SpikeFile {
            path: "pages/index.tsx".to_string(),
            content: "export default function Home() { return <div>Hello</div>; }".to_string(),
            language: Some("tsx".to_string()),
            description: None,
            executable: None,
            permissions: None,
            variables: vec![],
        };

        let parser = SpikeParser::new();
        let pattern = parser.analyze_file_pattern(&file);

        assert_eq!(pattern.pattern_type, FilePatternType::Page);
        assert!(pattern.features.contains(&"default_export".to_string()));
    }
}