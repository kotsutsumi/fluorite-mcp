//! Hybrid storage backend using sled database with compression
//! 
//! Provides persistent storage for learning chunks with automatic compression,
//! indexing, and efficient retrieval. Uses sled for ACID transactions and
//! lz4 compression for space efficiency.

use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use sled::{Db, Tree};
use tokio::sync::RwLock as AsyncRwLock;

use crate::chunk::{ChunkId, LearningChunk, ChunkType};

/// Prefix for different data types in the database
const CHUNK_PREFIX: &[u8] = b"chunk:";
const INDEX_PREFIX: &[u8] = b"index:";
const META_PREFIX: &[u8] = b"meta:";
const FRAMEWORK_PREFIX: &[u8] = b"framework:";
const PATTERN_PREFIX: &[u8] = b"pattern:";

/// Database metadata for tracking statistics and versions
#[derive(Debug, Clone, Serialize, Deserialize)]
struct DatabaseMetadata {
    version: String,
    created_at: DateTime<Utc>,
    last_optimized: Option<DateTime<Utc>>,
    total_chunks: u64,
    compression_stats: CompressionStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct CompressionStats {
    total_uncompressed_bytes: u64,
    total_compressed_bytes: u64,
    compression_ratio: f64,
}

impl Default for CompressionStats {
    fn default() -> Self {
        Self {
            total_uncompressed_bytes: 0,
            total_compressed_bytes: 0,
            compression_ratio: 1.0,
        }
    }
}

/// Hybrid storage backend that combines sled database with compression
#[derive(Debug)]
pub struct HybridStorage {
    db: Db,
    compression_level: u32,
    metadata: Arc<RwLock<DatabaseMetadata>>,
    // Cached trees for different data types
    chunks_tree: Tree,
    framework_index: Tree,
    pattern_index: Tree,
    metadata_tree: Tree,
}

impl HybridStorage {
    /// Create a new hybrid storage instance
    pub async fn new(storage_path: &Path, compression_level: u32) -> Result<Self> {
        tracing::info!("Initializing hybrid storage at: {:?}", storage_path);

        let db = sled::open(storage_path)
            .context("Failed to open sled database")?;

        // Open different trees for organized data storage
        let chunks_tree = db.open_tree("chunks")
            .context("Failed to open chunks tree")?;
        
        let framework_index = db.open_tree("framework_index")
            .context("Failed to open framework index tree")?;
        
        let pattern_index = db.open_tree("pattern_index")
            .context("Failed to open pattern index tree")?;
        
        let metadata_tree = db.open_tree("metadata")
            .context("Failed to open metadata tree")?;

        // Load or create database metadata
        let metadata = Arc::new(RwLock::new(
            Self::load_or_create_metadata(&metadata_tree).await?
        ));

        let storage = Self {
            db,
            compression_level,
            metadata,
            chunks_tree,
            framework_index,
            pattern_index,
            metadata_tree,
        };

        tracing::info!("Hybrid storage initialized successfully");
        Ok(storage)
    }

    /// Store a learning chunk with compression
    pub async fn store_chunk(&self, chunk: &LearningChunk) -> Result<()> {
        tracing::debug!("Storing chunk: {}", chunk.id);

        // Serialize and compress the chunk
        let serialized = bincode::serialize(chunk)
            .context("Failed to serialize chunk")?;

        let compressed = lz4_flex::compress_prepend_size(&serialized);
        
        // Store in chunks tree
        let key = self.make_chunk_key(&chunk.id);
        self.chunks_tree.insert(&key, compressed.as_slice())
            .context("Failed to insert chunk into database")?;

        // Update framework index
        for framework in &chunk.metadata.frameworks {
            self.add_to_framework_index(framework, &chunk.id).await?;
        }

        // Update pattern index
        for pattern in &chunk.metadata.patterns {
            self.add_to_pattern_index(pattern, &chunk.id).await?;
        }

        // Update metadata and statistics
        {
            let mut metadata = self.metadata.write();
            metadata.total_chunks += 1;
            metadata.compression_stats.total_uncompressed_bytes += serialized.len() as u64;
            metadata.compression_stats.total_compressed_bytes += compressed.len() as u64;
            metadata.compression_stats.compression_ratio = 
                metadata.compression_stats.total_compressed_bytes as f64 / 
                metadata.compression_stats.total_uncompressed_bytes as f64;
        }

        // Persist metadata
        self.save_metadata().await?;

        tracing::debug!("Chunk stored successfully: {}", chunk.id);
        Ok(())
    }

    /// Retrieve a learning chunk by ID
    pub async fn get_chunk(&self, chunk_id: &ChunkId) -> Result<Option<LearningChunk>> {
        tracing::debug!("Retrieving chunk: {}", chunk_id);

        let key = self.make_chunk_key(chunk_id);
        
        if let Some(compressed_data) = self.chunks_tree.get(&key)
            .context("Failed to query database")? {
            
            // Decompress the data
            let decompressed = lz4_flex::decompress_size_prepended(&compressed_data)
                .context("Failed to decompress chunk data")?;
            
            // Deserialize the chunk
            let chunk: LearningChunk = bincode::deserialize(&decompressed)
                .context("Failed to deserialize chunk")?;
            
            tracing::debug!("Chunk retrieved successfully: {}", chunk_id);
            Ok(Some(chunk))
        } else {
            tracing::debug!("Chunk not found: {}", chunk_id);
            Ok(None)
        }
    }

    /// Get all chunks associated with a specific framework
    pub async fn get_chunks_by_framework(&self, framework: &str) -> Result<Vec<LearningChunk>> {
        tracing::debug!("Getting chunks for framework: {}", framework);

        let framework_key = format!("framework:{}", framework);
        
        if let Some(chunk_ids_data) = self.framework_index.get(&framework_key)
            .context("Failed to query framework index")? {
            
            let chunk_ids: Vec<ChunkId> = bincode::deserialize(&chunk_ids_data)
                .context("Failed to deserialize framework index")?;
            
            let mut chunks = Vec::new();
            for chunk_id in chunk_ids {
                if let Some(chunk) = self.get_chunk(&chunk_id).await? {
                    chunks.push(chunk);
                }
            }
            
            tracing::debug!("Retrieved {} chunks for framework: {}", chunks.len(), framework);
            Ok(chunks)
        } else {
            Ok(vec![])
        }
    }

    /// Get chunks by pattern
    pub async fn get_chunks_by_pattern(&self, pattern: &str) -> Result<Vec<LearningChunk>> {
        let pattern_key = format!("pattern:{}", pattern);
        
        if let Some(chunk_ids_data) = self.pattern_index.get(&pattern_key)
            .context("Failed to query pattern index")? {
            
            let chunk_ids: Vec<ChunkId> = bincode::deserialize(&chunk_ids_data)
                .context("Failed to deserialize pattern index")?;
            
            let mut chunks = Vec::new();
            for chunk_id in chunk_ids {
                if let Some(chunk) = self.get_chunk(&chunk_id).await? {
                    chunks.push(chunk);
                }
            }
            
            Ok(chunks)
        } else {
            Ok(vec![])
        }
    }

    /// Get recently accessed chunks for cache warmup
    pub async fn get_recent_chunks(&self, limit: usize) -> Result<Vec<LearningChunk>> {
        tracing::debug!("Getting {} recent chunks", limit);

        let mut chunks = Vec::new();
        let mut count = 0;

        // Iterate through chunks and collect recent ones
        for result in self.chunks_tree.iter().rev() {
            if count >= limit {
                break;
            }

            let (key, compressed_data) = result.context("Failed to iterate chunks")?;
            
            if !key.starts_with(CHUNK_PREFIX) {
                continue;
            }

            // Decompress and deserialize
            if let Ok(decompressed) = lz4_flex::decompress_size_prepended(&compressed_data) {
                if let Ok(chunk) = bincode::deserialize::<LearningChunk>(&decompressed) {
                    chunks.push(chunk);
                    count += 1;
                }
            }
        }

        // Sort by last accessed time
        chunks.sort_by(|a, b| b.metadata.last_accessed.cmp(&a.metadata.last_accessed));
        chunks.truncate(limit);

        tracing::debug!("Retrieved {} recent chunks", chunks.len());
        Ok(chunks)
    }

    /// Update an existing chunk
    pub async fn update_chunk(&self, chunk: &LearningChunk) -> Result<()> {
        // Remove old indexes first
        self.remove_from_indexes(&chunk.id).await?;
        
        // Store the updated chunk
        self.store_chunk(chunk).await
    }

    /// Delete a chunk and its indexes
    pub async fn delete_chunk(&self, chunk_id: &ChunkId) -> Result<bool> {
        tracing::debug!("Deleting chunk: {}", chunk_id);

        let key = self.make_chunk_key(chunk_id);
        
        // Remove from main storage
        let existed = self.chunks_tree.remove(&key)
            .context("Failed to remove chunk from database")?
            .is_some();

        if existed {
            // Remove from indexes
            self.remove_from_indexes(chunk_id).await?;

            // Update metadata
            {
                let mut metadata = self.metadata.write();
                metadata.total_chunks = metadata.total_chunks.saturating_sub(1);
            }
            self.save_metadata().await?;
        }

        tracing::debug!("Chunk deletion result: {}, existed: {}", chunk_id, existed);
        Ok(existed)
    }

    /// Compact the database to reclaim space
    pub async fn compact(&self) -> Result<()> {
        tracing::info!("Starting database compaction");

        // Trigger sled compaction
        let size_before = self.db.size_on_disk().context("Failed to get database size")?;
        
        // Sled automatically compacts, but we can force a flush
        self.db.flush_async().await.context("Failed to flush database")?;

        let size_after = self.db.size_on_disk().context("Failed to get database size after compaction")?;

        tracing::info!(
            "Database compaction completed. Size before: {} bytes, after: {} bytes, saved: {} bytes",
            size_before,
            size_after,
            size_before.saturating_sub(size_after)
        );

        // Update metadata
        {
            let mut metadata = self.metadata.write();
            metadata.last_optimized = Some(Utc::now());
        }
        self.save_metadata().await?;

        Ok(())
    }

    /// Get storage statistics
    pub fn get_stats(&self) -> StorageStats {
        let metadata = self.metadata.read();
        let db_size = self.db.size_on_disk().unwrap_or(0);

        StorageStats {
            total_chunks: metadata.total_chunks,
            database_size_bytes: db_size,
            compression_ratio: metadata.compression_stats.compression_ratio,
            uncompressed_bytes: metadata.compression_stats.total_uncompressed_bytes,
            compressed_bytes: metadata.compression_stats.total_compressed_bytes,
            last_optimized: metadata.last_optimized,
        }
    }

    /// Create a storage key for a chunk
    fn make_chunk_key(&self, chunk_id: &ChunkId) -> Vec<u8> {
        let mut key = Vec::with_capacity(CHUNK_PREFIX.len() + chunk_id.as_str().len());
        key.extend_from_slice(CHUNK_PREFIX);
        key.extend_from_slice(chunk_id.as_str().as_bytes());
        key
    }

    /// Add chunk ID to framework index
    async fn add_to_framework_index(&self, framework: &str, chunk_id: &ChunkId) -> Result<()> {
        let framework_key = format!("framework:{}", framework);
        
        let mut chunk_ids: Vec<ChunkId> = if let Some(existing) = self.framework_index.get(&framework_key)? {
            bincode::deserialize(&existing).unwrap_or_default()
        } else {
            Vec::new()
        };

        if !chunk_ids.contains(chunk_id) {
            chunk_ids.push(chunk_id.clone());
            let serialized = bincode::serialize(&chunk_ids)
                .context("Failed to serialize framework index")?;
            
            self.framework_index.insert(&framework_key, serialized)
                .context("Failed to update framework index")?;
        }

        Ok(())
    }

    /// Add chunk ID to pattern index
    async fn add_to_pattern_index(&self, pattern: &str, chunk_id: &ChunkId) -> Result<()> {
        let pattern_key = format!("pattern:{}", pattern);
        
        let mut chunk_ids: Vec<ChunkId> = if let Some(existing) = self.pattern_index.get(&pattern_key)? {
            bincode::deserialize(&existing).unwrap_or_default()
        } else {
            Vec::new()
        };

        if !chunk_ids.contains(chunk_id) {
            chunk_ids.push(chunk_id.clone());
            let serialized = bincode::serialize(&chunk_ids)
                .context("Failed to serialize pattern index")?;
            
            self.pattern_index.insert(&pattern_key, serialized)
                .context("Failed to update pattern index")?;
        }

        Ok(())
    }

    /// Remove chunk from all indexes
    async fn remove_from_indexes(&self, chunk_id: &ChunkId) -> Result<()> {
        // This is a simplified version - in a full implementation,
        // you'd need to track which indexes a chunk belongs to
        // For now, we'll iterate through all framework and pattern indexes
        
        // Remove from framework indexes
        for result in self.framework_index.iter() {
            let (key, value) = result.context("Failed to iterate framework index")?;
            let mut chunk_ids: Vec<ChunkId> = bincode::deserialize(&value)
                .unwrap_or_default();
            
            if let Some(pos) = chunk_ids.iter().position(|id| id == chunk_id) {
                chunk_ids.remove(pos);
                let serialized = bincode::serialize(&chunk_ids)?;
                self.framework_index.insert(&key, serialized)?;
            }
        }

        // Remove from pattern indexes
        for result in self.pattern_index.iter() {
            let (key, value) = result.context("Failed to iterate pattern index")?;
            let mut chunk_ids: Vec<ChunkId> = bincode::deserialize(&value)
                .unwrap_or_default();
            
            if let Some(pos) = chunk_ids.iter().position(|id| id == chunk_id) {
                chunk_ids.remove(pos);
                let serialized = bincode::serialize(&chunk_ids)?;
                self.pattern_index.insert(&key, serialized)?;
            }
        }

        Ok(())
    }

    /// Load or create database metadata
    async fn load_or_create_metadata(metadata_tree: &Tree) -> Result<DatabaseMetadata> {
        if let Some(metadata_bytes) = metadata_tree.get("database_metadata")? {
            bincode::deserialize(&metadata_bytes)
                .context("Failed to deserialize metadata")
        } else {
            Ok(DatabaseMetadata {
                version: "1.0.0".to_string(),
                created_at: Utc::now(),
                last_optimized: None,
                total_chunks: 0,
                compression_stats: CompressionStats::default(),
            })
        }
    }

    /// Save metadata to database
    async fn save_metadata(&self) -> Result<()> {
        let metadata = self.metadata.read().clone();
        let serialized = bincode::serialize(&metadata)
            .context("Failed to serialize metadata")?;
        
        self.metadata_tree.insert("database_metadata", serialized)
            .context("Failed to save metadata")?;

        Ok(())
    }
}

/// Storage statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StorageStats {
    pub total_chunks: u64,
    pub database_size_bytes: u64,
    pub compression_ratio: f64,
    pub uncompressed_bytes: u64,
    pub compressed_bytes: u64,
    pub last_optimized: Option<DateTime<Utc>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::chunk::{ChunkContent, ChunkMetadata, ChunkType};
    use tempfile::TempDir;

    async fn create_test_storage() -> (HybridStorage, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let storage = HybridStorage::new(temp_dir.path(), 6).await.unwrap();
        (storage, temp_dir)
    }

    fn create_test_chunk(id: &str, framework: &str) -> LearningChunk {
        LearningChunk {
            id: ChunkId::new(id),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "typescript".to_string(),
                code: "export const test = () => {};".to_string(),
                framework: Some(framework.to_string()),
            },
            metadata: ChunkMetadata {
                frameworks: vec![framework.to_string()],
                patterns: vec!["export-function".to_string()],
                ..Default::default()
            },
            ..Default::default()
        }
    }

    #[tokio::test]
    async fn test_store_and_retrieve_chunk() {
        let (storage, _temp_dir) = create_test_storage().await;
        let chunk = create_test_chunk("test-chunk", "react");

        // Store chunk
        storage.store_chunk(&chunk).await.unwrap();

        // Retrieve chunk
        let retrieved = storage.get_chunk(&chunk.id).await.unwrap();
        assert!(retrieved.is_some());
        
        let retrieved_chunk = retrieved.unwrap();
        assert_eq!(retrieved_chunk.id, chunk.id);
        assert_eq!(retrieved_chunk.content, chunk.content);
    }

    #[tokio::test]
    async fn test_framework_indexing() {
        let (storage, _temp_dir) = create_test_storage().await;
        
        let chunk1 = create_test_chunk("react-1", "react");
        let chunk2 = create_test_chunk("react-2", "react");
        let chunk3 = create_test_chunk("vue-1", "vue");

        storage.store_chunk(&chunk1).await.unwrap();
        storage.store_chunk(&chunk2).await.unwrap();
        storage.store_chunk(&chunk3).await.unwrap();

        // Get React chunks
        let react_chunks = storage.get_chunks_by_framework("react").await.unwrap();
        assert_eq!(react_chunks.len(), 2);

        // Get Vue chunks
        let vue_chunks = storage.get_chunks_by_framework("vue").await.unwrap();
        assert_eq!(vue_chunks.len(), 1);
    }

    #[tokio::test]
    async fn test_compression() {
        let (storage, _temp_dir) = create_test_storage().await;
        
        // Create a chunk with substantial content
        let mut chunk = create_test_chunk("large-chunk", "nextjs");
        if let ChunkContent::Code { ref mut code, .. } = chunk.content {
            *code = "a".repeat(10000); // Large content to test compression
        }

        storage.store_chunk(&chunk).await.unwrap();

        let stats = storage.get_stats();
        assert!(stats.compression_ratio < 1.0); // Should be compressed
        assert!(stats.total_chunks == 1);
    }

    #[tokio::test]
    async fn test_delete_chunk() {
        let (storage, _temp_dir) = create_test_storage().await;
        let chunk = create_test_chunk("delete-test", "react");

        // Store and verify
        storage.store_chunk(&chunk).await.unwrap();
        assert!(storage.get_chunk(&chunk.id).await.unwrap().is_some());

        // Delete and verify
        let deleted = storage.delete_chunk(&chunk.id).await.unwrap();
        assert!(deleted);
        assert!(storage.get_chunk(&chunk.id).await.unwrap().is_none());
    }
}