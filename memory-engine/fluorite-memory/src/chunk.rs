//! Learning chunk data structures and utilities
//! 
//! Defines the core data structures for storing, organizing, and relating
//! code patterns, templates, and learning data in the memory engine.

use std::collections::HashMap;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Unique identifier for learning chunks
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ChunkId(String);

impl ChunkId {
    pub fn new(id: &str) -> Self {
        Self(id.to_string())
    }

    pub fn generate() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for ChunkId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<String> for ChunkId {
    fn from(s: String) -> Self {
        Self(s)
    }
}

impl From<&str> for ChunkId {
    fn from(s: &str) -> Self {
        Self(s.to_string())
    }
}

/// Types of learning chunks
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ChunkType {
    /// Spike templates from the repository
    SpikeTemplate,
    /// Generated code patterns
    Pattern,
    /// API integration examples
    ApiIntegration,
    /// Component templates
    Component,
    /// Full application examples
    Application,
    /// Configuration templates
    Configuration,
    /// Best practices and guidelines
    BestPractice,
    /// Error patterns and solutions
    ErrorSolution,
    /// Performance optimizations
    Performance,
    /// Security patterns
    Security,
    /// Test patterns
    Testing,
    /// Documentation templates
    Documentation,
}

/// Content stored in a learning chunk
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum ChunkContent {
    /// Source code with metadata
    Code {
        language: String,
        code: String,
        framework: Option<String>,
    },
    /// Configuration data
    Config {
        format: String, // json, yaml, toml, etc.
        content: String,
        schema: Option<String>,
    },
    /// Documentation content
    Documentation {
        format: String, // markdown, html, text
        content: String,
        language: Option<String>, // for i18n
    },
    /// Structured data (JSON, etc.)
    Data {
        format: String,
        data: serde_json::Value,
    },
    /// Binary or opaque content
    Binary {
        mime_type: String,
        data: Vec<u8>,
    },
}

/// Metadata associated with a learning chunk
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkMetadata {
    /// Source of the chunk (user, system, import, etc.)
    pub source: String,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Associated frameworks
    pub frameworks: Vec<String>,
    /// Identified patterns
    pub patterns: Vec<String>,
    /// Usage statistics
    pub usage_count: u64,
    /// Last access time
    pub last_accessed: DateTime<Utc>,
    /// Creation time
    pub created_at: DateTime<Utc>,
    /// Original file path (if applicable)
    pub file_path: Option<String>,
    /// Line range in original file
    pub line_range: Option<(u32, u32)>,
    /// Dependencies on other chunks
    pub dependencies: Vec<ChunkId>,
    /// Custom properties
    pub properties: HashMap<String, serde_json::Value>,
}

impl Default for ChunkMetadata {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            source: "unknown".to_string(),
            tags: vec![],
            frameworks: vec![],
            patterns: vec![],
            usage_count: 0,
            last_accessed: now,
            created_at: now,
            file_path: None,
            line_range: None,
            dependencies: vec![],
            properties: HashMap::new(),
        }
    }
}

/// Relationship between chunks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkRelation {
    /// Target chunk ID
    pub target: ChunkId,
    /// Type of relationship
    pub relation_type: RelationType,
    /// Strength of the relationship (0.0 - 1.0)
    pub strength: f32,
    /// Additional metadata about the relationship
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Types of relationships between chunks
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum RelationType {
    /// One chunk depends on another
    DependsOn,
    /// Chunks are similar in content or purpose
    Similar,
    /// One chunk extends or builds upon another
    Extends,
    /// Chunks are alternatives to each other
    Alternative,
    /// One chunk is a component of another
    PartOf,
    /// Chunks are used together frequently
    UsedWith,
    /// One chunk replaces another (versioning)
    Replaces,
    /// Custom relationship type
    Custom(String),
}

/// Main learning chunk structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningChunk {
    /// Unique identifier
    pub id: ChunkId,
    /// Type of chunk
    pub chunk_type: ChunkType,
    /// Content data
    pub content: ChunkContent,
    /// Associated metadata
    pub metadata: ChunkMetadata,
    /// Vector embedding for similarity search
    pub embedding: Option<Vec<f32>>,
    /// Relationships to other chunks
    pub relationships: Vec<ChunkRelation>,
    /// Quality score (0.0 - 1.0) based on usage and feedback
    pub quality_score: f32,
}

impl Default for LearningChunk {
    fn default() -> Self {
        Self {
            id: ChunkId::generate(),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "text".to_string(),
                code: String::new(),
                framework: None,
            },
            metadata: ChunkMetadata::default(),
            embedding: None,
            relationships: vec![],
            quality_score: 0.5,
        }
    }
}

impl LearningChunk {
    /// Create a new learning chunk with the given ID and content
    pub fn new(id: ChunkId, chunk_type: ChunkType, content: ChunkContent) -> Self {
        Self {
            id,
            chunk_type,
            content,
            metadata: ChunkMetadata::default(),
            embedding: None,
            relationships: vec![],
            quality_score: 0.5,
        }
    }

    /// Get the text content for indexing and search
    pub fn get_searchable_text(&self) -> String {
        let mut text = Vec::new();
        
        // Add tags and frameworks
        text.extend(self.metadata.tags.iter().cloned());
        text.extend(self.metadata.frameworks.iter().cloned());
        text.extend(self.metadata.patterns.iter().cloned());
        
        // Add content based on type
        match &self.content {
            ChunkContent::Code { code, language, framework } => {
                text.push(code.clone());
                text.push(language.clone());
                if let Some(fw) = framework {
                    text.push(fw.clone());
                }
            }
            ChunkContent::Config { content, format, .. } => {
                text.push(content.clone());
                text.push(format.clone());
            }
            ChunkContent::Documentation { content, format, language } => {
                text.push(content.clone());
                text.push(format.clone());
                if let Some(lang) = language {
                    text.push(lang.clone());
                }
            }
            ChunkContent::Data { data, format } => {
                text.push(data.to_string());
                text.push(format.clone());
            }
            ChunkContent::Binary { mime_type, .. } => {
                text.push(mime_type.clone());
            }
        }
        
        // Add file path if available
        if let Some(path) = &self.metadata.file_path {
            text.push(path.clone());
        }
        
        text.join(" ")
    }

    /// Get the size in bytes for memory management
    pub fn estimated_size(&self) -> usize {
        let mut size = std::mem::size_of::<Self>();
        
        // Add content size
        size += match &self.content {
            ChunkContent::Code { code, language, framework } => {
                code.len() + language.len() + framework.as_ref().map_or(0, |f| f.len())
            }
            ChunkContent::Config { content, format, schema } => {
                content.len() + format.len() + schema.as_ref().map_or(0, |s| s.len())
            }
            ChunkContent::Documentation { content, format, language } => {
                content.len() + format.len() + language.as_ref().map_or(0, |l| l.len())
            }
            ChunkContent::Data { data, format } => {
                data.to_string().len() + format.len()
            }
            ChunkContent::Binary { mime_type, data } => {
                mime_type.len() + data.len()
            }
        };
        
        // Add metadata size estimates
        size += self.metadata.tags.iter().map(|t| t.len()).sum::<usize>();
        size += self.metadata.frameworks.iter().map(|f| f.len()).sum::<usize>();
        size += self.metadata.patterns.iter().map(|p| p.len()).sum::<usize>();
        size += self.metadata.file_path.as_ref().map_or(0, |p| p.len());
        
        // Add embedding size
        if let Some(ref embedding) = self.embedding {
            size += embedding.len() * std::mem::size_of::<f32>();
        }
        
        // Add relationships size
        size += self.relationships.len() * std::mem::size_of::<ChunkRelation>();
        
        size
    }

    /// Update usage statistics
    pub fn mark_accessed(&mut self) {
        self.metadata.usage_count += 1;
        self.metadata.last_accessed = Utc::now();
    }

    /// Add a relationship to another chunk
    pub fn add_relationship(&mut self, target: ChunkId, relation_type: RelationType, strength: f32) {
        self.relationships.push(ChunkRelation {
            target,
            relation_type,
            strength,
            metadata: HashMap::new(),
        });
    }

    /// Get all chunks this chunk depends on
    pub fn get_dependencies(&self) -> Vec<&ChunkId> {
        self.relationships.iter()
            .filter(|r| matches!(r.relation_type, RelationType::DependsOn))
            .map(|r| &r.target)
            .collect()
    }

    /// Get all chunks similar to this one
    pub fn get_similar(&self) -> Vec<&ChunkId> {
        self.relationships.iter()
            .filter(|r| matches!(r.relation_type, RelationType::Similar))
            .map(|r| &r.target)
            .collect()
    }

    /// Check if this chunk is related to a specific framework
    pub fn is_framework_related(&self, framework: &str) -> bool {
        self.metadata.frameworks.contains(&framework.to_string()) ||
        match &self.content {
            ChunkContent::Code { framework: Some(fw), .. } => fw == framework,
            _ => false,
        }
    }
}

/// User feedback for improving chunk quality and relationships
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFeedback {
    /// User who provided feedback
    pub user_id: String,
    /// Timestamp of feedback
    pub timestamp: DateTime<Utc>,
    /// Type of feedback
    pub feedback_type: FeedbackType,
    /// Optional comment
    pub comment: Option<String>,
    /// Associated metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Types of user feedback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FeedbackType {
    /// Chunk was helpful
    Helpful,
    /// Chunk was not helpful
    NotHelpful,
    /// Chunk needs improvement
    NeedsImprovement,
    /// Chunk is outdated
    Outdated,
    /// Chunk has errors
    HasErrors,
    /// Custom feedback type
    Custom(String),
}

/// Result of similarity matching
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimilarityMatch {
    /// The matching chunk
    pub chunk: LearningChunk,
    /// Similarity score (0.0 - 1.0)
    pub score: f32,
    /// Type of similarity detected
    pub similarity_type: SimilarityType,
}

/// Types of similarity between chunks
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SimilarityType {
    /// Content-based similarity (text/code similarity)
    Content,
    /// Structural similarity (same patterns/templates)
    Structural,
    /// Semantic similarity (embeddings)
    Semantic,
    /// Usage pattern similarity
    Usage,
    /// Framework/technology similarity
    Framework,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chunk_id_creation() {
        let id1 = ChunkId::new("test-id");
        let id2 = ChunkId::from("test-id");
        let id3 = ChunkId::generate();
        
        assert_eq!(id1, id2);
        assert_ne!(id1, id3);
        assert_eq!(id1.as_str(), "test-id");
    }

    #[test]
    fn test_learning_chunk_creation() {
        let chunk = LearningChunk::new(
            ChunkId::new("test"),
            ChunkType::SpikeTemplate,
            ChunkContent::Code {
                language: "javascript".to_string(),
                code: "console.log('hello');".to_string(),
                framework: Some("node".to_string()),
            }
        );

        assert_eq!(chunk.id.as_str(), "test");
        assert_eq!(chunk.chunk_type, ChunkType::SpikeTemplate);
        assert_eq!(chunk.quality_score, 0.5);
    }

    #[test]
    fn test_searchable_text() {
        let mut chunk = LearningChunk::new(
            ChunkId::new("test"),
            ChunkType::Pattern,
            ChunkContent::Code {
                language: "typescript".to_string(),
                code: "export const test = () => {};".to_string(),
                framework: Some("react".to_string()),
            }
        );

        chunk.metadata.tags = vec!["function".to_string(), "export".to_string()];
        chunk.metadata.frameworks = vec!["react".to_string()];

        let text = chunk.get_searchable_text();
        assert!(text.contains("function"));
        assert!(text.contains("export"));
        assert!(text.contains("react"));
        assert!(text.contains("typescript"));
        assert!(text.contains("export const test"));
    }

    #[test]
    fn test_relationships() {
        let mut chunk = LearningChunk::default();
        
        chunk.add_relationship(
            ChunkId::new("dependency"),
            RelationType::DependsOn,
            0.9
        );
        
        chunk.add_relationship(
            ChunkId::new("similar"),
            RelationType::Similar,
            0.8
        );

        assert_eq!(chunk.relationships.len(), 2);
        assert_eq!(chunk.get_dependencies().len(), 1);
        assert_eq!(chunk.get_similar().len(), 1);
    }

    #[test]
    fn test_framework_detection() {
        let chunk = LearningChunk::new(
            ChunkId::new("test"),
            ChunkType::Component,
            ChunkContent::Code {
                language: "tsx".to_string(),
                code: "export default function Page() {}".to_string(),
                framework: Some("nextjs".to_string()),
            }
        );

        assert!(chunk.is_framework_related("nextjs"));
        assert!(!chunk.is_framework_related("vue"));
    }
}