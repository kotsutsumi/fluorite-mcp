//! LRU cache implementation for hot data storage
//! 
//! Provides an intelligent caching layer that keeps frequently accessed chunks
//! in memory for fast retrieval, with automatic eviction based on memory limits
//! and access patterns.

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};

use anyhow::Result;
use parking_lot::RwLock;
use tokio::sync::RwLock as AsyncRwLock;

use crate::chunk::{ChunkId, LearningChunk};

/// Node in the doubly-linked list for LRU tracking
#[derive(Debug)]
struct CacheNode {
    chunk_id: ChunkId,
    chunk: LearningChunk,
    size: usize,
    access_count: u64,
    last_accessed: Instant,
    prev: Option<ChunkId>,
    next: Option<ChunkId>,
}

impl CacheNode {
    fn new(chunk: LearningChunk) -> Self {
        let chunk_id = chunk.id.clone();
        let size = chunk.estimated_size();
        
        Self {
            chunk_id,
            chunk,
            size,
            access_count: 1,
            last_accessed: Instant::now(),
            prev: None,
            next: None,
        }
    }
}

/// Configuration for the LRU cache
#[derive(Debug, Clone)]
pub struct CacheConfig {
    /// Maximum number of chunks to store
    pub max_chunks: usize,
    /// Maximum memory size in bytes
    pub max_size_bytes: usize,
    /// TTL for cache entries
    pub ttl: Duration,
    /// Enable access frequency tracking
    pub track_frequency: bool,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            max_chunks: 10000,
            max_size_bytes: 512 * 1024 * 1024, // 512 MB
            ttl: Duration::from_secs(3600), // 1 hour
            track_frequency: true,
        }
    }
}

/// LRU cache with intelligent eviction policies
#[derive(Debug)]
pub struct LruCache {
    config: CacheConfig,
    // Fast lookup map
    chunks: Arc<RwLock<HashMap<ChunkId, CacheNode>>>,
    // LRU list tracking (head = most recent, tail = least recent)
    head: Arc<RwLock<Option<ChunkId>>>,
    tail: Arc<RwLock<Option<ChunkId>>>,
    // Statistics
    stats: Arc<RwLock<CacheStats>>,
}

/// Cache statistics
#[derive(Debug, Default, Clone)]
pub struct CacheStats {
    pub hits: u64,
    pub misses: u64,
    pub evictions: u64,
    pub current_size: usize,
    pub current_chunks: usize,
    pub memory_usage_bytes: usize,
    pub hit_ratio: f64,
}

impl LruCache {
    /// Create a new LRU cache with the given configuration
    pub fn new(max_chunks: usize, max_size_bytes: usize) -> Self {
        let config = CacheConfig {
            max_chunks,
            max_size_bytes,
            ..Default::default()
        };

        Self {
            config,
            chunks: Arc::new(RwLock::new(HashMap::new())),
            head: Arc::new(RwLock::new(None)),
            tail: Arc::new(RwLock::new(None)),
            stats: Arc::new(RwLock::new(CacheStats::default())),
        }
    }

    /// Insert or update a chunk in the cache
    pub async fn insert(&self, chunk_id: ChunkId, chunk: LearningChunk) {
        let mut chunks = self.chunks.write();
        let mut stats = self.stats.write();

        // Check if chunk already exists
        if let Some(existing_node) = chunks.get_mut(&chunk_id) {
            // Update existing chunk
            existing_node.chunk = chunk;
            existing_node.access_count += 1;
            existing_node.last_accessed = Instant::now();
            
            // Move to head (most recently used)
            drop(chunks);
            drop(stats);
            self.move_to_head(&chunk_id).await;
            return;
        }

        // Create new node
        let new_node = CacheNode::new(chunk);
        let node_size = new_node.size;
        
        chunks.insert(chunk_id.clone(), new_node);
        stats.current_chunks += 1;
        stats.memory_usage_bytes += node_size;

        drop(chunks);
        drop(stats);

        // Add to head of LRU list
        self.add_to_head(&chunk_id).await;

        // Check if eviction is needed
        self.enforce_limits().await;
    }

    /// Get a chunk from the cache
    pub async fn get(&self, chunk_id: &ChunkId) -> Option<LearningChunk> {
        let mut chunks = self.chunks.write();
        let mut stats = self.stats.write();

        if let Some(node) = chunks.get_mut(chunk_id) {
            // Update access statistics
            node.access_count += 1;
            node.last_accessed = Instant::now();
            
            stats.hits += 1;
            stats.hit_ratio = stats.hits as f64 / (stats.hits + stats.misses) as f64;
            
            let chunk = node.chunk.clone();
            drop(chunks);
            drop(stats);

            // Move to head (most recently used)
            self.move_to_head(chunk_id).await;
            
            Some(chunk)
        } else {
            stats.misses += 1;
            stats.hit_ratio = stats.hits as f64 / (stats.hits + stats.misses) as f64;
            None
        }
    }

    /// Remove a specific chunk from the cache
    pub async fn remove(&self, chunk_id: &ChunkId) -> bool {
        let mut chunks = self.chunks.write();
        
        if let Some(node) = chunks.remove(chunk_id) {
            let mut stats = self.stats.write();
            stats.current_chunks = stats.current_chunks.saturating_sub(1);
            stats.memory_usage_bytes = stats.memory_usage_bytes.saturating_sub(node.size);
            
            drop(chunks);
            drop(stats);

            // Remove from LRU list
            self.remove_from_list(chunk_id).await;
            true
        } else {
            false
        }
    }

    /// Clear all entries from the cache
    pub async fn clear(&self) {
        {
            let mut chunks = self.chunks.write();
            chunks.clear();
        }
        
        {
            let mut head = self.head.write();
            *head = None;
        }
        
        {
            let mut tail = self.tail.write();
            *tail = None;
        }

        {
            let mut stats = self.stats.write();
            *stats = CacheStats::default();
        }
    }

    /// Get current cache statistics
    pub fn get_stats(&self) -> CacheStats {
        self.stats.read().clone()
    }

    /// Check if the cache contains a specific chunk
    pub fn contains(&self, chunk_id: &ChunkId) -> bool {
        self.chunks.read().contains_key(chunk_id)
    }

    /// Get all chunk IDs currently in cache
    pub fn get_chunk_ids(&self) -> Vec<ChunkId> {
        self.chunks.read().keys().cloned().collect()
    }

    /// Clean up expired entries based on TTL
    pub async fn cleanup_expired(&self) {
        let now = Instant::now();
        let ttl = self.config.ttl;
        
        let expired_ids: Vec<ChunkId> = {
            let chunks = self.chunks.read();
            chunks.iter()
                .filter(|(_, node)| now.duration_since(node.last_accessed) > ttl)
                .map(|(id, _)| id.clone())
                .collect()
        };

        for chunk_id in expired_ids {
            self.remove(&chunk_id).await;
        }
    }

    /// Get memory pressure (0.0 = no pressure, 1.0 = at limit)
    pub fn get_memory_pressure(&self) -> f64 {
        let stats = self.stats.read();
        let size_pressure = stats.memory_usage_bytes as f64 / self.config.max_size_bytes as f64;
        let count_pressure = stats.current_chunks as f64 / self.config.max_chunks as f64;
        
        size_pressure.max(count_pressure).min(1.0)
    }

    /// Force eviction to free up space
    pub async fn evict_lru(&self, target_free_bytes: usize) -> usize {
        let mut freed_bytes = 0;
        
        while freed_bytes < target_free_bytes {
            let tail_id = {
                let tail_guard = self.tail.read();
                tail_guard.clone()
            };
            
            if let Some(chunk_id) = tail_id {
                let node_size = {
                    let chunks = self.chunks.read();
                    chunks.get(&chunk_id).map(|node| node.size).unwrap_or(0)
                };
                
                if self.remove(&chunk_id).await {
                    freed_bytes += node_size;
                    
                    let mut stats = self.stats.write();
                    stats.evictions += 1;
                } else {
                    break; // Avoid infinite loop
                }
            } else {
                break; // Cache is empty
            }
        }
        
        freed_bytes
    }

    /// Enforce cache size and count limits
    async fn enforce_limits(&self) {
        let (over_size, over_count) = {
            let stats = self.stats.read();
            (
                stats.memory_usage_bytes > self.config.max_size_bytes,
                stats.current_chunks > self.config.max_chunks
            )
        };

        if over_size || over_count {
            // Calculate how much to free
            let target_free_bytes = if over_size {
                let stats = self.stats.read();
                stats.memory_usage_bytes - (self.config.max_size_bytes * 80 / 100) // Free to 80% capacity
            } else {
                self.config.max_size_bytes / 10 // Free some space anyway
            };

            self.evict_lru(target_free_bytes).await;
        }
    }

    /// Add chunk to head of LRU list
    async fn add_to_head(&self, chunk_id: &ChunkId) {
        let old_head = {
            let mut head = self.head.write();
            let old_head = head.clone();
            *head = Some(chunk_id.clone());
            old_head
        };

        // Update the new head node
        {
            let mut chunks = self.chunks.write();
            if let Some(node) = chunks.get_mut(chunk_id) {
                node.next = old_head.clone();
                node.prev = None;
            }
        }

        // Update the old head node if it exists
        if let Some(old_head_id) = old_head {
            let mut chunks = self.chunks.write();
            if let Some(old_head_node) = chunks.get_mut(&old_head_id) {
                old_head_node.prev = Some(chunk_id.clone());
            }
        } else {
            // This was the first node, so it's also the tail
            let mut tail = self.tail.write();
            *tail = Some(chunk_id.clone());
        }
    }

    /// Move chunk to head of LRU list
    async fn move_to_head(&self, chunk_id: &ChunkId) {
        // Remove from current position
        self.remove_from_list(chunk_id).await;
        
        // Add to head
        self.add_to_head(chunk_id).await;
    }

    /// Remove chunk from LRU list
    async fn remove_from_list(&self, chunk_id: &ChunkId) {
        let (prev_id, next_id) = {
            let chunks = self.chunks.read();
            if let Some(node) = chunks.get(chunk_id) {
                (node.prev.clone(), node.next.clone())
            } else {
                return; // Node not found
            }
        };

        // Update previous node's next pointer
        if let Some(prev_id) = prev_id {
            let mut chunks = self.chunks.write();
            if let Some(prev_node) = chunks.get_mut(&prev_id) {
                prev_node.next = next_id.clone();
            }
        } else {
            // This was the head, update head pointer
            let mut head = self.head.write();
            *head = next_id.clone();
        }

        // Update next node's previous pointer
        if let Some(next_id) = next_id {
            let mut chunks = self.chunks.write();
            if let Some(next_node) = chunks.get_mut(&next_id) {
                next_node.prev = prev_id;
            }
        } else {
            // This was the tail, update tail pointer
            let mut tail = self.tail.write();
            *tail = prev_id;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::chunk::{ChunkContent, ChunkMetadata, ChunkType};

    fn create_test_chunk(id: &str, size_multiplier: usize) -> LearningChunk {
        LearningChunk {
            id: ChunkId::new(id),
            chunk_type: ChunkType::Pattern,
            content: ChunkContent::Code {
                language: "javascript".to_string(),
                code: "x".repeat(size_multiplier * 100), // Variable size content
                framework: Some("node".to_string()),
            },
            metadata: ChunkMetadata::default(),
            embedding: None,
            relationships: vec![],
            quality_score: 0.8,
        }
    }

    #[tokio::test]
    async fn test_cache_insert_and_get() {
        let cache = LruCache::new(100, 1024 * 1024);
        let chunk = create_test_chunk("test1", 1);
        let chunk_id = chunk.id.clone();

        // Insert chunk
        cache.insert(chunk_id.clone(), chunk.clone()).await;

        // Retrieve chunk
        let retrieved = cache.get(&chunk_id).await;
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().id, chunk.id);

        // Check stats
        let stats = cache.get_stats();
        assert_eq!(stats.hits, 1);
        assert_eq!(stats.misses, 0);
        assert_eq!(stats.current_chunks, 1);
    }

    #[tokio::test]
    async fn test_cache_miss() {
        let cache = LruCache::new(100, 1024 * 1024);
        let non_existent_id = ChunkId::new("non-existent");

        let retrieved = cache.get(&non_existent_id).await;
        assert!(retrieved.is_none());

        let stats = cache.get_stats();
        assert_eq!(stats.hits, 0);
        assert_eq!(stats.misses, 1);
    }

    #[tokio::test]
    async fn test_cache_eviction_by_count() {
        let cache = LruCache::new(2, 1024 * 1024); // Max 2 chunks

        // Insert 3 chunks
        let chunk1 = create_test_chunk("chunk1", 1);
        let chunk2 = create_test_chunk("chunk2", 1);
        let chunk3 = create_test_chunk("chunk3", 1);

        cache.insert(chunk1.id.clone(), chunk1.clone()).await;
        cache.insert(chunk2.id.clone(), chunk2.clone()).await;
        cache.insert(chunk3.id.clone(), chunk3.clone()).await;

        // Should have evicted the least recently used (chunk1)
        assert!(!cache.contains(&chunk1.id));
        assert!(cache.contains(&chunk2.id));
        assert!(cache.contains(&chunk3.id));

        let stats = cache.get_stats();
        assert_eq!(stats.current_chunks, 2);
        assert!(stats.evictions > 0);
    }

    #[tokio::test]
    async fn test_cache_lru_order() {
        let cache = LruCache::new(3, 1024 * 1024);

        let chunk1 = create_test_chunk("chunk1", 1);
        let chunk2 = create_test_chunk("chunk2", 1);
        let chunk3 = create_test_chunk("chunk3", 1);

        // Insert chunks
        cache.insert(chunk1.id.clone(), chunk1.clone()).await;
        cache.insert(chunk2.id.clone(), chunk2.clone()).await;
        cache.insert(chunk3.id.clone(), chunk3.clone()).await;

        // Access chunk1 to make it most recently used
        cache.get(&chunk1.id).await;

        // Insert another chunk, should evict chunk2 (least recently used)
        let chunk4 = create_test_chunk("chunk4", 1);
        cache.insert(chunk4.id.clone(), chunk4.clone()).await;

        assert!(cache.contains(&chunk1.id)); // Recently accessed
        assert!(!cache.contains(&chunk2.id)); // Should be evicted
        assert!(cache.contains(&chunk3.id));
        assert!(cache.contains(&chunk4.id));
    }

    #[tokio::test]
    async fn test_cache_remove() {
        let cache = LruCache::new(100, 1024 * 1024);
        let chunk = create_test_chunk("test", 1);
        let chunk_id = chunk.id.clone();

        // Insert and verify
        cache.insert(chunk_id.clone(), chunk).await;
        assert!(cache.contains(&chunk_id));

        // Remove and verify
        let removed = cache.remove(&chunk_id).await;
        assert!(removed);
        assert!(!cache.contains(&chunk_id));
    }

    #[tokio::test]
    async fn test_cache_clear() {
        let cache = LruCache::new(100, 1024 * 1024);
        
        let chunk1 = create_test_chunk("chunk1", 1);
        let chunk2 = create_test_chunk("chunk2", 1);

        cache.insert(chunk1.id.clone(), chunk1).await;
        cache.insert(chunk2.id.clone(), chunk2).await;

        // Verify chunks exist
        assert_eq!(cache.get_stats().current_chunks, 2);

        // Clear cache
        cache.clear().await;

        // Verify cache is empty
        let stats = cache.get_stats();
        assert_eq!(stats.current_chunks, 0);
        assert_eq!(stats.memory_usage_bytes, 0);
    }

    #[tokio::test]
    async fn test_memory_pressure() {
        let cache = LruCache::new(100, 1000); // Small memory limit

        let pressure_before = cache.get_memory_pressure();
        assert_eq!(pressure_before, 0.0);

        // Insert large chunk
        let large_chunk = create_test_chunk("large", 50); // Large content
        cache.insert(large_chunk.id.clone(), large_chunk).await;

        let pressure_after = cache.get_memory_pressure();
        assert!(pressure_after > 0.0);
    }
}