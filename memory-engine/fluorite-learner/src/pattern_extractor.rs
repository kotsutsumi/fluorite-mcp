//! Pattern extraction from Spike templates
//! 
//! Extracts meaningful patterns from Spike templates including code patterns,
//! architectural patterns, dependency patterns, and framework-specific patterns.

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use anyhow::Result;
use regex::Regex;
use serde::{Deserialize, Serialize};

use crate::spike_parser::{SpikeTemplate, SpikeFile, SpikeDependency};

/// Pattern extractor for analyzing Spike templates
#[derive(Debug)]
pub struct PatternExtractor {
    target_frameworks: HashSet<String>,
    code_analyzers: HashMap<String, Arc<dyn CodeAnalyzer + Send + Sync>>,
    dependency_analyzer: DependencyAnalyzer,
    architectural_analyzer: ArchitecturalAnalyzer,
}

/// Extracted pattern information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtractedPattern {
    pub id: String,
    pub pattern_type: PatternType,
    pub name: String,
    pub description: String,
    pub frameworks: Vec<String>,
    pub confidence: f32,
    pub frequency: u64,
    pub examples: Vec<PatternExample>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Types of patterns
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum PatternType {
    /// Code structure patterns
    CodeStructure,
    /// Architectural patterns
    Architecture,
    /// Dependency patterns
    Dependency,
    /// Configuration patterns
    Configuration,
    /// File organization patterns
    FileOrganization,
    /// Integration patterns
    Integration,
    /// Security patterns
    Security,
    /// Performance patterns
    Performance,
    /// Testing patterns
    Testing,
}

/// Pattern example with context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternExample {
    pub source_file: String,
    pub code_snippet: String,
    pub context: String,
    pub line_range: Option<(u32, u32)>,
}

/// Code analyzer trait for language-specific analysis
pub trait CodeAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>>;
    fn supported_languages(&self) -> Vec<String>;
}

/// Code pattern detected in files
#[derive(Debug, Clone)]
pub struct CodePattern {
    pub pattern_name: String,
    pub pattern_type: String,
    pub confidence: f32,
    pub location: PatternLocation,
    pub variables: Vec<String>,
    pub dependencies: Vec<String>,
}

/// Location of a pattern in code
#[derive(Debug, Clone)]
pub struct PatternLocation {
    pub file_path: String,
    pub start_line: u32,
    pub end_line: u32,
    pub start_column: u32,
    pub end_column: u32,
}

/// Dependency pattern analyzer
#[derive(Debug)]
pub struct DependencyAnalyzer {
    common_patterns: HashMap<String, DependencyPattern>,
}

/// Architectural pattern analyzer
#[derive(Debug)]
pub struct ArchitecturalAnalyzer {
    known_patterns: HashMap<String, ArchitecturalPattern>,
}

/// Dependency pattern information
#[derive(Debug, Clone)]
pub struct DependencyPattern {
    pub name: String,
    pub packages: Vec<String>,
    pub description: String,
    pub frameworks: Vec<String>,
    pub common_combinations: Vec<Vec<String>>,
}

/// Architectural pattern information
#[derive(Debug, Clone)]
pub struct ArchitecturalPattern {
    pub name: String,
    pub description: String,
    pub file_patterns: Vec<String>,
    pub structure_indicators: Vec<String>,
    pub frameworks: Vec<String>,
}

impl PatternExtractor {
    /// Create a new pattern extractor
    pub fn new(target_frameworks: &[String]) -> Self {
        let mut code_analyzers: HashMap<String, Arc<dyn CodeAnalyzer + Send + Sync>> = HashMap::new();
        
        // Add language-specific analyzers
        code_analyzers.insert("typescript".to_string(), Arc::new(TypeScriptAnalyzer::new()));
        code_analyzers.insert("javascript".to_string(), Arc::new(JavaScriptAnalyzer::new()));
        code_analyzers.insert("tsx".to_string(), Arc::new(ReactAnalyzer::new()));
        code_analyzers.insert("jsx".to_string(), Arc::new(ReactAnalyzer::new()));
        code_analyzers.insert("php".to_string(), Arc::new(PhpAnalyzer::new()));
        code_analyzers.insert("json".to_string(), Arc::new(JsonAnalyzer::new()));

        Self {
            target_frameworks: target_frameworks.iter().cloned().collect(),
            code_analyzers,
            dependency_analyzer: DependencyAnalyzer::new(),
            architectural_analyzer: ArchitecturalAnalyzer::new(),
        }
    }

    /// Extract all patterns from a Spike template
    pub async fn extract_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let mut patterns = Vec::new();

        // Extract code patterns from files
        let code_patterns = self.extract_code_patterns(template).await?;
        patterns.extend(code_patterns);

        // Extract dependency patterns
        let dependency_patterns = self.extract_dependency_patterns(template).await?;
        patterns.extend(dependency_patterns);

        // Extract architectural patterns
        let architectural_patterns = self.extract_architectural_patterns(template).await?;
        patterns.extend(architectural_patterns);

        // Extract file organization patterns
        let organization_patterns = self.extract_file_organization_patterns(template).await?;
        patterns.extend(organization_patterns);

        // Extract integration patterns (framework combinations)
        let integration_patterns = self.extract_integration_patterns(template).await?;
        patterns.extend(integration_patterns);

        // Sort patterns by confidence
        patterns.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap_or(std::cmp::Ordering::Equal));

        Ok(patterns)
    }

    /// Extract code patterns from template files
    async fn extract_code_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let mut patterns = Vec::new();

        for file in &template.files {
            if let Some(language) = &file.language {
                if let Some(analyzer) = self.code_analyzers.get(language) {
                    let code_patterns = analyzer.analyze_code(&file.content, &file.path)?;
                    
                    for code_pattern in code_patterns {
                        let pattern = ExtractedPattern {
                            id: format!("code-{}-{}", language, code_pattern.pattern_name),
                            pattern_type: PatternType::CodeStructure,
                            name: code_pattern.pattern_name.clone(),
                            description: format!("{} pattern in {}", code_pattern.pattern_name, language),
                            frameworks: template.frameworks.clone(),
                            confidence: code_pattern.confidence,
                            frequency: 1,
                            examples: vec![PatternExample {
                                source_file: file.path.clone(),
                                code_snippet: self.extract_code_snippet(&file.content, &code_pattern.location),
                                context: file.description.clone().unwrap_or_default(),
                                line_range: Some((code_pattern.location.start_line, code_pattern.location.end_line)),
                            }],
                            metadata: {
                                let mut metadata = HashMap::new();
                                metadata.insert("language".to_string(), serde_json::Value::String(language.clone()));
                                metadata.insert("variables".to_string(), serde_json::Value::Array(
                                    code_pattern.variables.iter().map(|v| serde_json::Value::String(v.clone())).collect()
                                ));
                                metadata
                            },
                        };
                        patterns.push(pattern);
                    }
                }
            }
        }

        Ok(patterns)
    }

    /// Extract dependency patterns
    async fn extract_dependency_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let patterns = self.dependency_analyzer.analyze_dependencies(&template.dependencies, &template.frameworks)?;
        
        let mut extracted_patterns = Vec::new();
        for pattern in patterns {
            extracted_patterns.push(ExtractedPattern {
                id: format!("dep-{}", pattern.name),
                pattern_type: PatternType::Dependency,
                name: pattern.name.clone(),
                description: pattern.description.clone(),
                frameworks: pattern.frameworks.clone(),
                confidence: 0.8, // High confidence for dependency patterns
                frequency: 1,
                examples: vec![],
                metadata: {
                    let mut metadata = HashMap::new();
                    metadata.insert("packages".to_string(), serde_json::Value::Array(
                        pattern.packages.iter().map(|p| serde_json::Value::String(p.clone())).collect()
                    ));
                    metadata
                },
            });
        }

        Ok(extracted_patterns)
    }

    /// Extract architectural patterns
    async fn extract_architectural_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let patterns = self.architectural_analyzer.analyze_architecture(template)?;
        
        let mut extracted_patterns = Vec::new();
        for pattern in patterns {
            extracted_patterns.push(ExtractedPattern {
                id: format!("arch-{}", pattern.name),
                pattern_type: PatternType::Architecture,
                name: pattern.name.clone(),
                description: pattern.description.clone(),
                frameworks: pattern.frameworks.clone(),
                confidence: 0.7,
                frequency: 1,
                examples: vec![],
                metadata: HashMap::new(),
            });
        }

        Ok(extracted_patterns)
    }

    /// Extract file organization patterns
    async fn extract_file_organization_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let mut patterns = Vec::new();

        // Analyze directory structure
        let directories = self.extract_directory_structure(template);
        
        // Common Next.js patterns
        if template.frameworks.contains(&"nextjs".to_string()) {
            if directories.contains("pages") {
                patterns.push(ExtractedPattern {
                    id: "org-nextjs-pages".to_string(),
                    pattern_type: PatternType::FileOrganization,
                    name: "Next.js Pages Directory".to_string(),
                    description: "Next.js pages-based routing structure".to_string(),
                    frameworks: vec!["nextjs".to_string()],
                    confidence: 0.95,
                    frequency: 1,
                    examples: vec![],
                    metadata: HashMap::new(),
                });
            }

            if directories.contains("app") {
                patterns.push(ExtractedPattern {
                    id: "org-nextjs-app".to_string(),
                    pattern_type: PatternType::FileOrganization,
                    name: "Next.js App Directory".to_string(),
                    description: "Next.js app directory routing structure".to_string(),
                    frameworks: vec!["nextjs".to_string()],
                    confidence: 0.95,
                    frequency: 1,
                    examples: vec![],
                    metadata: HashMap::new(),
                });
            }
        }

        // Common component organization
        if directories.contains("components") {
            patterns.push(ExtractedPattern {
                id: "org-components".to_string(),
                pattern_type: PatternType::FileOrganization,
                name: "Components Directory".to_string(),
                description: "Organized component structure".to_string(),
                frameworks: template.frameworks.clone(),
                confidence: 0.8,
                frequency: 1,
                examples: vec![],
                metadata: HashMap::new(),
            });
        }

        Ok(patterns)
    }

    /// Extract integration patterns between frameworks
    async fn extract_integration_patterns(&self, template: &SpikeTemplate) -> Result<Vec<ExtractedPattern>> {
        let mut patterns = Vec::new();

        // Check for Next.js + Laravel integration
        if template.frameworks.contains(&"nextjs".to_string()) && 
           template.frameworks.contains(&"laravel".to_string()) {
            patterns.push(ExtractedPattern {
                id: "integration-nextjs-laravel".to_string(),
                pattern_type: PatternType::Integration,
                name: "Next.js + Laravel Integration".to_string(),
                description: "Frontend-backend integration pattern".to_string(),
                frameworks: vec!["nextjs".to_string(), "laravel".to_string()],
                confidence: 0.9,
                frequency: 1,
                examples: vec![],
                metadata: {
                    let mut metadata = HashMap::new();
                    metadata.insert("integration_type".to_string(), 
                        serde_json::Value::String("frontend-backend".to_string()));
                    metadata
                },
            });
        }

        // Check for API integration patterns
        let has_api_files = template.files.iter().any(|f| f.path.contains("api/"));
        if has_api_files {
            patterns.push(ExtractedPattern {
                id: "integration-api".to_string(),
                pattern_type: PatternType::Integration,
                name: "API Integration".to_string(),
                description: "API endpoint integration pattern".to_string(),
                frameworks: template.frameworks.clone(),
                confidence: 0.8,
                frequency: 1,
                examples: vec![],
                metadata: HashMap::new(),
            });
        }

        Ok(patterns)
    }

    /// Extract directory structure from template
    fn extract_directory_structure(&self, template: &SpikeTemplate) -> HashSet<String> {
        let mut directories = HashSet::new();
        
        for file in &template.files {
            if let Some(parent) = std::path::Path::new(&file.path).parent() {
                let path_str = parent.to_string_lossy();
                if !path_str.is_empty() && path_str != "." {
                    directories.insert(path_str.split('/').next().unwrap_or("").to_string());
                }
            }
        }

        directories
    }

    /// Extract code snippet around a pattern location
    fn extract_code_snippet(&self, content: &str, location: &PatternLocation) -> String {
        let lines: Vec<&str> = content.lines().collect();
        let start = (location.start_line as usize).saturating_sub(1);
        let end = (location.end_line as usize).min(lines.len());
        
        lines[start..end].join("\n")
    }
}

/// TypeScript code analyzer
#[derive(Debug)]
pub struct TypeScriptAnalyzer {
    patterns: Vec<Regex>,
}

impl TypeScriptAnalyzer {
    pub fn new() -> Self {
        let mut patterns = Vec::new();
        
        // Common TypeScript patterns
        patterns.push(Regex::new(r"export\s+default\s+function\s+(\w+)").unwrap());
        patterns.push(Regex::new(r"export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>").unwrap());
        patterns.push(Regex::new(r"interface\s+(\w+)").unwrap());
        patterns.push(Regex::new(r"type\s+(\w+)\s*=").unwrap());
        patterns.push(Regex::new(r"async\s+function\s+(\w+)").unwrap());
        
        Self { patterns }
    }
}

impl CodeAnalyzer for TypeScriptAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();
        
        // Export default function pattern
        if let Some(cap) = Regex::new(r"export\s+default\s+function\s+(\w+)")?.find(content) {
            patterns.push(CodePattern {
                pattern_name: "default-export-function".to_string(),
                pattern_type: "export".to_string(),
                confidence: 0.9,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1, // Simplified - would calculate actual lines
                    end_line: 1,
                    start_column: cap.start() as u32,
                    end_column: cap.end() as u32,
                },
                variables: vec![],
                dependencies: vec![],
            });
        }

        // Interface pattern
        if content.contains("interface") {
            patterns.push(CodePattern {
                pattern_name: "typescript-interface".to_string(),
                pattern_type: "type-definition".to_string(),
                confidence: 1.0,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec![],
            });
        }

        Ok(patterns)
    }

    fn supported_languages(&self) -> Vec<String> {
        vec!["typescript".to_string(), "ts".to_string()]
    }
}

/// JavaScript code analyzer
#[derive(Debug)]
pub struct JavaScriptAnalyzer;

impl JavaScriptAnalyzer {
    pub fn new() -> Self {
        Self
    }
}

impl CodeAnalyzer for JavaScriptAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();

        if content.contains("module.exports") {
            patterns.push(CodePattern {
                pattern_name: "commonjs-export".to_string(),
                pattern_type: "export".to_string(),
                confidence: 0.8,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec![],
            });
        }

        Ok(patterns)
    }

    fn supported_languages(&self) -> Vec<String> {
        vec!["javascript".to_string(), "js".to_string()]
    }
}

/// React code analyzer
#[derive(Debug)]
pub struct ReactAnalyzer;

impl ReactAnalyzer {
    pub fn new() -> Self {
        Self
    }
}

impl CodeAnalyzer for ReactAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();

        if content.contains("useState") {
            patterns.push(CodePattern {
                pattern_name: "react-useState".to_string(),
                pattern_type: "hook".to_string(),
                confidence: 1.0,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec!["react".to_string()],
            });
        }

        if content.contains("useEffect") {
            patterns.push(CodePattern {
                pattern_name: "react-useEffect".to_string(),
                pattern_type: "hook".to_string(),
                confidence: 1.0,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec!["react".to_string()],
            });
        }

        Ok(patterns)
    }

    fn supported_languages(&self) -> Vec<String> {
        vec!["tsx".to_string(), "jsx".to_string()]
    }
}

/// PHP code analyzer
#[derive(Debug)]
pub struct PhpAnalyzer;

impl PhpAnalyzer {
    pub fn new() -> Self {
        Self
    }
}

impl CodeAnalyzer for PhpAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();

        if content.contains("class") && content.contains("Controller") {
            patterns.push(CodePattern {
                pattern_name: "laravel-controller".to_string(),
                pattern_type: "controller".to_string(),
                confidence: 0.9,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec!["laravel".to_string()],
            });
        }

        Ok(patterns)
    }

    fn supported_languages(&self) -> Vec<String> {
        vec!["php".to_string()]
    }
}

/// JSON configuration analyzer
#[derive(Debug)]
pub struct JsonAnalyzer;

impl JsonAnalyzer {
    pub fn new() -> Self {
        Self
    }
}

impl CodeAnalyzer for JsonAnalyzer {
    fn analyze_code(&self, content: &str, file_path: &str) -> Result<Vec<CodePattern>> {
        let mut patterns = Vec::new();

        if file_path.contains("package.json") {
            patterns.push(CodePattern {
                pattern_name: "package-json".to_string(),
                pattern_type: "configuration".to_string(),
                confidence: 1.0,
                location: PatternLocation {
                    file_path: file_path.to_string(),
                    start_line: 1,
                    end_line: 1,
                    start_column: 0,
                    end_column: 0,
                },
                variables: vec![],
                dependencies: vec![],
            });
        }

        Ok(patterns)
    }

    fn supported_languages(&self) -> Vec<String> {
        vec!["json".to_string()]
    }
}

impl DependencyAnalyzer {
    pub fn new() -> Self {
        let mut common_patterns = HashMap::new();
        
        // Next.js patterns
        common_patterns.insert("nextjs-basic".to_string(), DependencyPattern {
            name: "Next.js Basic Setup".to_string(),
            packages: vec!["next".to_string(), "react".to_string(), "react-dom".to_string()],
            description: "Basic Next.js application setup".to_string(),
            frameworks: vec!["nextjs".to_string()],
            common_combinations: vec![],
        });

        // Express patterns
        common_patterns.insert("express-basic".to_string(), DependencyPattern {
            name: "Express Basic Setup".to_string(),
            packages: vec!["express".to_string()],
            description: "Basic Express.js server setup".to_string(),
            frameworks: vec!["express".to_string()],
            common_combinations: vec![],
        });

        Self { common_patterns }
    }

    pub fn analyze_dependencies(&self, dependencies: &[SpikeDependency], frameworks: &[String]) -> Result<Vec<DependencyPattern>> {
        let mut patterns = Vec::new();
        let package_names: HashSet<String> = dependencies.iter().map(|d| d.name.clone()).collect();

        // Check for known patterns
        for pattern in self.common_patterns.values() {
            let pattern_packages: HashSet<String> = pattern.packages.iter().cloned().collect();
            
            if pattern_packages.is_subset(&package_names) && 
               pattern.frameworks.iter().any(|f| frameworks.contains(f)) {
                patterns.push(pattern.clone());
            }
        }

        Ok(patterns)
    }
}

impl ArchitecturalAnalyzer {
    pub fn new() -> Self {
        let mut known_patterns = HashMap::new();
        
        known_patterns.insert("mvc".to_string(), ArchitecturalPattern {
            name: "MVC Pattern".to_string(),
            description: "Model-View-Controller architecture".to_string(),
            file_patterns: vec!["models/".to_string(), "views/".to_string(), "controllers/".to_string()],
            structure_indicators: vec!["Controller".to_string(), "Model".to_string()],
            frameworks: vec!["laravel".to_string(), "express".to_string()],
        });

        Self { known_patterns }
    }

    pub fn analyze_architecture(&self, template: &SpikeTemplate) -> Result<Vec<ArchitecturalPattern>> {
        let mut patterns = Vec::new();
        
        let file_paths: Vec<String> = template.files.iter().map(|f| f.path.clone()).collect();
        
        for pattern in self.known_patterns.values() {
            let mut matches = 0;
            
            for file_pattern in &pattern.file_patterns {
                if file_paths.iter().any(|path| path.contains(file_pattern)) {
                    matches += 1;
                }
            }
            
            if matches >= pattern.file_patterns.len() / 2 && 
               pattern.frameworks.iter().any(|f| template.frameworks.contains(f)) {
                patterns.push(pattern.clone());
            }
        }

        Ok(patterns)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pattern_extraction() {
        let mut template = SpikeTemplate {
            name: "test-template".to_string(),
            description: "Test template".to_string(),
            frameworks: vec!["nextjs".to_string()],
            dependencies: vec![
                SpikeDependency {
                    name: "next".to_string(),
                    version: Some("^13.0.0".to_string()),
                    dep_type: None,
                    registry: None,
                    optional: None,
                },
                SpikeDependency {
                    name: "react".to_string(),
                    version: Some("^18.0.0".to_string()),
                    dep_type: None,
                    registry: None,
                    optional: None,
                },
            ],
            files: vec![],
            tags: vec![],
            config: None,
            environment: None,
            examples: vec![],
            metadata: HashMap::new(),
        };

        let extractor = PatternExtractor::new(&["nextjs".to_string()]);
        let patterns = extractor.extract_patterns(&template).await.unwrap();

        // Should find dependency patterns
        assert!(!patterns.is_empty());
        assert!(patterns.iter().any(|p| p.name.contains("Next.js")));
    }

    #[test]
    fn test_typescript_analyzer() {
        let analyzer = TypeScriptAnalyzer::new();
        let code = "export default function Component() { return <div>Hello</div>; }";
        let patterns = analyzer.analyze_code(code, "test.tsx").unwrap();

        assert!(!patterns.is_empty());
        assert!(patterns.iter().any(|p| p.pattern_name == "default-export-function"));
    }

    #[test]
    fn test_react_analyzer() {
        let analyzer = ReactAnalyzer::new();
        let code = "import { useState } from 'react'; const [state, setState] = useState(null);";
        let patterns = analyzer.analyze_code(code, "test.tsx").unwrap();

        assert!(!patterns.is_empty());
        assert!(patterns.iter().any(|p| p.pattern_name == "react-useState"));
    }
}