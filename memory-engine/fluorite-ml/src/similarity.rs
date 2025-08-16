//! Similarity calculation and search algorithms
//! 
//! Provides multiple similarity metrics and efficient search algorithms
//! for finding related embeddings and performing semantic search.

use std::collections::BinaryHeap;
use std::cmp::Ordering;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use rayon::prelude::*;

use crate::{MLConfig, SimilarityResult};

/// Similarity calculation engine
#[derive(Debug)]
pub struct SimilarityEngine {
    config: MLConfig,
    similarity_metric: SimilarityMetric,
    search_algorithm: SearchAlgorithm,
}

/// Available similarity metrics
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SimilarityMetric {
    /// Cosine similarity (recommended for normalized embeddings)
    Cosine,
    /// Euclidean distance (converted to similarity)
    Euclidean,
    /// Manhattan distance (converted to similarity)
    Manhattan,
    /// Dot product similarity
    DotProduct,
    /// Angular distance
    Angular,
}

/// Search algorithms for finding similar embeddings
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SearchAlgorithm {
    /// Brute force linear search (exact results)
    BruteForce,
    /// Approximate search using LSH (faster for large datasets)
    LSH,
    /// Hierarchical navigable small world (HNSW) for very large datasets
    HNSW,
}

/// Configuration for similarity search
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchConfig {
    /// Maximum number of results to return
    pub max_results: usize,
    /// Minimum similarity threshold
    pub threshold: f32,
    /// Use parallel processing for large searches
    pub parallel: bool,
    /// Early termination when enough good results found
    pub early_termination: bool,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            max_results: 10,
            threshold: 0.0,
            parallel: true,
            early_termination: false,
        }
    }
}

/// Result of similarity search with additional metadata
#[derive(Debug, Clone)]
pub struct SearchResultWithMetadata {
    pub index: usize,
    pub score: f32,
    pub metadata: Option<SearchMetadata>,
}

/// Additional metadata for search results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchMetadata {
    pub distance: f32,
    pub algorithm_used: String,
    pub computation_time_ms: f64,
}

impl SimilarityEngine {
    /// Create a new similarity engine
    pub async fn new(config: &MLConfig) -> Result<Self> {
        Ok(Self {
            config: config.clone(),
            similarity_metric: SimilarityMetric::Cosine, // Default to cosine
            search_algorithm: SearchAlgorithm::BruteForce, // Start with exact search
        })
    }

    /// Calculate similarity between two embeddings
    pub fn calculate_similarity(&self, embedding1: &[f32], embedding2: &[f32]) -> Result<f32> {
        if embedding1.len() != embedding2.len() {
            return Err(anyhow::anyhow!(
                "Embedding dimensions mismatch: {} vs {}", 
                embedding1.len(), 
                embedding2.len()
            ));
        }

        let similarity = match self.similarity_metric {
            SimilarityMetric::Cosine => self.cosine_similarity(embedding1, embedding2),
            SimilarityMetric::Euclidean => self.euclidean_similarity(embedding1, embedding2),
            SimilarityMetric::Manhattan => self.manhattan_similarity(embedding1, embedding2),
            SimilarityMetric::DotProduct => self.dot_product_similarity(embedding1, embedding2),
            SimilarityMetric::Angular => self.angular_similarity(embedding1, embedding2),
        };

        Ok(similarity)
    }

    /// Find similar embeddings in a collection
    pub async fn find_similar(
        &self, 
        query_embedding: &[f32], 
        candidates: &[Vec<f32>], 
        top_k: usize
    ) -> Result<Vec<SimilarityResult>> {
        let search_config = SearchConfig {
            max_results: top_k,
            parallel: candidates.len() > 1000, // Use parallel for large collections
            ..Default::default()
        };

        self.find_similar_with_config(query_embedding, candidates, &search_config).await
    }

    /// Find similar embeddings with custom configuration
    pub async fn find_similar_with_config(
        &self,
        query_embedding: &[f32],
        candidates: &[Vec<f32>],
        config: &SearchConfig,
    ) -> Result<Vec<SimilarityResult>> {
        if candidates.is_empty() {
            return Ok(vec![]);
        }

        let start_time = std::time::Instant::now();

        let results = match self.search_algorithm {
            SearchAlgorithm::BruteForce => {
                self.brute_force_search(query_embedding, candidates, config)?
            }
            SearchAlgorithm::LSH => {
                self.lsh_search(query_embedding, candidates, config)?
            }
            SearchAlgorithm::HNSW => {
                self.hnsw_search(query_embedding, candidates, config)?
            }
        };

        let computation_time = start_time.elapsed().as_millis() as f64;
        tracing::debug!(
            "Similarity search completed: {} results in {:.2}ms using {:?}",
            results.len(),
            computation_time,
            self.search_algorithm
        );

        Ok(results)
    }

    /// Set similarity metric
    pub fn set_similarity_metric(&mut self, metric: SimilarityMetric) {
        self.similarity_metric = metric;
    }

    /// Set search algorithm
    pub fn set_search_algorithm(&mut self, algorithm: SearchAlgorithm) {
        self.search_algorithm = algorithm;
    }

    /// Calculate pairwise similarities between all embeddings
    pub async fn calculate_pairwise_similarities(&self, embeddings: &[Vec<f32>]) -> Result<Vec<Vec<f32>>> {
        let n = embeddings.len();
        let mut similarities = vec![vec![0.0f32; n]; n];

        // Use parallel processing for large matrices
        if n > 100 && self.config.parallel_processing {
            similarities.par_iter_mut().enumerate().for_each(|(i, row)| {
                for j in 0..n {
                    if i <= j {
                        let sim = self.calculate_similarity(&embeddings[i], &embeddings[j])
                            .unwrap_or(0.0);
                        row[j] = sim;
                        if i != j {
                            // Matrix is symmetric
                            similarities[j][i] = sim;
                        }
                    }
                }
            });
        } else {
            for i in 0..n {
                for j in i..n {
                    let similarity = self.calculate_similarity(&embeddings[i], &embeddings[j])?;
                    similarities[i][j] = similarity;
                    if i != j {
                        similarities[j][i] = similarity; // Symmetric matrix
                    }
                }
            }
        }

        Ok(similarities)
    }

    /// Brute force linear search (exact results)
    fn brute_force_search(
        &self,
        query: &[f32],
        candidates: &[Vec<f32>],
        config: &SearchConfig,
    ) -> Result<Vec<SimilarityResult>> {
        let calculate_similarity = |i: usize, candidate: &Vec<f32>| -> Result<(usize, f32)> {
            let similarity = self.calculate_similarity(query, candidate)?;
            Ok((i, similarity))
        };

        let similarities: Result<Vec<(usize, f32)>> = if config.parallel && candidates.len() > 100 {
            candidates
                .par_iter()
                .enumerate()
                .map(|(i, candidate)| calculate_similarity(i, candidate))
                .collect()
        } else {
            candidates
                .iter()
                .enumerate()
                .map(|(i, candidate)| calculate_similarity(i, candidate))
                .collect()
        };

        let mut similarities = similarities?;

        // Filter by threshold
        similarities.retain(|(_, score)| *score >= config.threshold);

        // Sort by similarity score (descending)
        similarities.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(Ordering::Equal));

        // Take top k results
        let results: Vec<SimilarityResult> = similarities
            .into_iter()
            .take(config.max_results)
            .map(|(index, score)| SimilarityResult { index, score })
            .collect();

        Ok(results)
    }

    /// LSH-based approximate search (faster for large datasets)
    fn lsh_search(
        &self,
        query: &[f32],
        candidates: &[Vec<f32>],
        config: &SearchConfig,
    ) -> Result<Vec<SimilarityResult>> {
        // For now, fall back to brute force
        // In a real implementation, this would use Locality Sensitive Hashing
        tracing::warn!("LSH search not yet implemented, falling back to brute force");
        self.brute_force_search(query, candidates, config)
    }

    /// HNSW-based search for very large datasets
    fn hnsw_search(
        &self,
        query: &[f32],
        candidates: &[Vec<f32>],
        config: &SearchConfig,
    ) -> Result<Vec<SimilarityResult>> {
        // For now, fall back to brute force
        // In a real implementation, this would use Hierarchical Navigable Small World
        tracing::warn!("HNSW search not yet implemented, falling back to brute force");
        self.brute_force_search(query, candidates, config)
    }

    /// Cosine similarity calculation
    fn cosine_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm_a == 0.0 || norm_b == 0.0 {
            0.0
        } else {
            dot_product / (norm_a * norm_b)
        }
    }

    /// Euclidean distance converted to similarity
    fn euclidean_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let distance: f32 = a.iter()
            .zip(b.iter())
            .map(|(x, y)| (x - y).powi(2))
            .sum::<f32>()
            .sqrt();

        // Convert distance to similarity (0 distance = 1 similarity)
        1.0 / (1.0 + distance)
    }

    /// Manhattan distance converted to similarity
    fn manhattan_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let distance: f32 = a.iter()
            .zip(b.iter())
            .map(|(x, y)| (x - y).abs())
            .sum();

        // Convert distance to similarity
        1.0 / (1.0 + distance)
    }

    /// Dot product similarity
    fn dot_product_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        a.iter().zip(b.iter()).map(|(x, y)| x * y).sum()
    }

    /// Angular distance converted to similarity
    fn angular_similarity(&self, a: &[f32], b: &[f32]) -> f32 {
        let cosine_sim = self.cosine_similarity(a, b);
        let angle = cosine_sim.acos();
        1.0 - (angle / std::f32::consts::PI)
    }
}

/// Efficient top-k heap for similarity search
#[derive(Debug)]
struct TopKHeap {
    heap: BinaryHeap<ScoredItem>,
    k: usize,
}

#[derive(Debug, Clone)]
struct ScoredItem {
    index: usize,
    score: f32,
}

impl PartialEq for ScoredItem {
    fn eq(&self, other: &Self) -> bool {
        self.score == other.score
    }
}

impl Eq for ScoredItem {}

impl PartialOrd for ScoredItem {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        // Reverse ordering to create a min-heap
        other.score.partial_cmp(&self.score)
    }
}

impl Ord for ScoredItem {
    fn cmp(&self, other: &Self) -> Ordering {
        self.partial_cmp(other).unwrap_or(Ordering::Equal)
    }
}

impl TopKHeap {
    fn new(k: usize) -> Self {
        Self {
            heap: BinaryHeap::new(),
            k,
        }
    }

    fn push(&mut self, index: usize, score: f32) {
        if self.heap.len() < self.k {
            self.heap.push(ScoredItem { index, score });
        } else if let Some(min_item) = self.heap.peek() {
            if score > min_item.score {
                self.heap.pop();
                self.heap.push(ScoredItem { index, score });
            }
        }
    }

    fn into_sorted_results(self) -> Vec<SimilarityResult> {
        let mut results: Vec<_> = self.heap
            .into_iter()
            .map(|item| SimilarityResult {
                index: item.index,
                score: item.score,
            })
            .collect();

        // Sort by score descending
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        results
    }
}

/// Similarity analysis utilities
pub struct SimilarityAnalyzer;

impl SimilarityAnalyzer {
    /// Analyze similarity distribution in a collection of embeddings
    pub fn analyze_similarity_distribution(similarities: &[Vec<f32>]) -> SimilarityDistribution {
        let mut all_scores = Vec::new();
        
        for (i, row) in similarities.iter().enumerate() {
            for (j, &score) in row.iter().enumerate() {
                if i < j { // Only consider upper triangle to avoid duplicates
                    all_scores.push(score);
                }
            }
        }

        if all_scores.is_empty() {
            return SimilarityDistribution::default();
        }

        all_scores.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Ordering::Equal));
        
        let len = all_scores.len();
        let mean = all_scores.iter().sum::<f32>() / len as f32;
        let median = if len % 2 == 0 {
            (all_scores[len / 2 - 1] + all_scores[len / 2]) / 2.0
        } else {
            all_scores[len / 2]
        };

        let variance = all_scores.iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f32>() / len as f32;
        let std_dev = variance.sqrt();

        SimilarityDistribution {
            min: *all_scores.first().unwrap_or(&0.0),
            max: *all_scores.last().unwrap_or(&0.0),
            mean,
            median,
            std_dev,
            percentile_25: all_scores[len / 4],
            percentile_75: all_scores[3 * len / 4],
            total_pairs: len,
        }
    }

    /// Find outliers in similarity scores
    pub fn find_similarity_outliers(
        similarities: &[Vec<f32>], 
        threshold_std_devs: f32
    ) -> Vec<(usize, usize, f32)> {
        let distribution = Self::analyze_similarity_distribution(similarities);
        let threshold_low = distribution.mean - threshold_std_devs * distribution.std_dev;
        let threshold_high = distribution.mean + threshold_std_devs * distribution.std_dev;

        let mut outliers = Vec::new();
        
        for (i, row) in similarities.iter().enumerate() {
            for (j, &score) in row.iter().enumerate() {
                if i < j && (score < threshold_low || score > threshold_high) {
                    outliers.push((i, j, score));
                }
            }
        }

        outliers
    }
}

/// Statistical distribution of similarity scores
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimilarityDistribution {
    pub min: f32,
    pub max: f32,
    pub mean: f32,
    pub median: f32,
    pub std_dev: f32,
    pub percentile_25: f32,
    pub percentile_75: f32,
    pub total_pairs: usize,
}

impl Default for SimilarityDistribution {
    fn default() -> Self {
        Self {
            min: 0.0,
            max: 0.0,
            mean: 0.0,
            median: 0.0,
            std_dev: 0.0,
            percentile_25: 0.0,
            percentile_75: 0.0,
            total_pairs: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_similarity_engine() -> SimilarityEngine {
        let config = MLConfig::default();
        SimilarityEngine::new(&config).await.unwrap()
    }

    #[test]
    fn test_cosine_similarity() {
        let engine = create_test_similarity_engine();
        
        // Test identical vectors
        let vec1 = vec![1.0, 0.0, 0.0];
        let vec2 = vec![1.0, 0.0, 0.0];
        let similarity = engine.cosine_similarity(&vec1, &vec2);
        assert!((similarity - 1.0).abs() < 1e-6);

        // Test orthogonal vectors
        let vec3 = vec![1.0, 0.0, 0.0];
        let vec4 = vec![0.0, 1.0, 0.0];
        let similarity = engine.cosine_similarity(&vec3, &vec4);
        assert!((similarity - 0.0).abs() < 1e-6);

        // Test opposite vectors
        let vec5 = vec![1.0, 0.0, 0.0];
        let vec6 = vec![-1.0, 0.0, 0.0];
        let similarity = engine.cosine_similarity(&vec5, &vec6);
        assert!((similarity + 1.0).abs() < 1e-6);
    }

    #[test]
    fn test_euclidean_similarity() {
        let engine = create_test_similarity_engine();
        
        // Test identical vectors (should give high similarity)
        let vec1 = vec![1.0, 2.0, 3.0];
        let vec2 = vec![1.0, 2.0, 3.0];
        let similarity = engine.euclidean_similarity(&vec1, &vec2);
        assert_eq!(similarity, 1.0);

        // Test different vectors (should give lower similarity)
        let vec3 = vec![1.0, 2.0, 3.0];
        let vec4 = vec![4.0, 5.0, 6.0];
        let similarity = engine.euclidean_similarity(&vec3, &vec4);
        assert!(similarity > 0.0 && similarity < 1.0);
    }

    #[tokio::test]
    async fn test_brute_force_search() {
        let mut engine = create_test_similarity_engine();
        engine.set_similarity_metric(SimilarityMetric::Cosine);

        let query = vec![1.0, 0.0, 0.0];
        let candidates = vec![
            vec![1.0, 0.0, 0.0],     // Perfect match
            vec![0.9, 0.1, 0.0],     // Very similar
            vec![0.0, 1.0, 0.0],     // Orthogonal
            vec![-1.0, 0.0, 0.0],    // Opposite
        ];

        let results = engine.find_similar(&query, &candidates, 2).await.unwrap();
        
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].index, 0); // Perfect match should be first
        assert_eq!(results[1].index, 1); // Very similar should be second
        assert!(results[0].score > results[1].score);
    }

    #[tokio::test]
    async fn test_search_with_threshold() {
        let mut engine = create_test_similarity_engine();
        engine.set_similarity_metric(SimilarityMetric::Cosine);

        let query = vec![1.0, 0.0, 0.0];
        let candidates = vec![
            vec![1.0, 0.0, 0.0],     // score = 1.0
            vec![0.5, 0.5, 0.0],     // score ≈ 0.707
            vec![0.0, 1.0, 0.0],     // score = 0.0
        ];

        let config = SearchConfig {
            max_results: 10,
            threshold: 0.5,
            ..Default::default()
        };

        let results = engine.find_similar_with_config(&query, &candidates, &config).await.unwrap();
        
        assert_eq!(results.len(), 2); // Only two results above threshold
        assert!(results.iter().all(|r| r.score >= 0.5));
    }

    #[tokio::test]
    async fn test_pairwise_similarities() {
        let engine = create_test_similarity_engine();
        
        let embeddings = vec![
            vec![1.0, 0.0, 0.0],
            vec![0.0, 1.0, 0.0],
            vec![0.0, 0.0, 1.0],
        ];

        let similarities = engine.calculate_pairwise_similarities(&embeddings).await.unwrap();
        
        assert_eq!(similarities.len(), 3);
        assert_eq!(similarities[0].len(), 3);
        
        // Diagonal should be 1.0 (self-similarity)
        for i in 0..3 {
            assert!((similarities[i][i] - 1.0).abs() < 1e-6);
        }
        
        // Matrix should be symmetric
        for i in 0..3 {
            for j in 0..3 {
                assert!((similarities[i][j] - similarities[j][i]).abs() < 1e-6);
            }
        }
    }

    #[test]
    fn test_similarity_distribution_analysis() {
        let similarities = vec![
            vec![1.0, 0.8, 0.6],
            vec![0.8, 1.0, 0.4],
            vec![0.6, 0.4, 1.0],
        ];

        let distribution = SimilarityAnalyzer::analyze_similarity_distribution(&similarities);
        
        assert!(distribution.total_pairs > 0);
        assert!(distribution.min <= distribution.max);
        assert!(distribution.mean >= distribution.min && distribution.mean <= distribution.max);
        assert!(distribution.std_dev >= 0.0);
    }

    #[test]
    fn test_top_k_heap() {
        let mut heap = TopKHeap::new(3);
        
        heap.push(0, 0.5);
        heap.push(1, 0.8);
        heap.push(2, 0.3);
        heap.push(3, 0.9); // Should replace 0.3
        heap.push(4, 0.2); // Should not be added

        let results = heap.into_sorted_results();
        assert_eq!(results.len(), 3);
        assert_eq!(results[0].index, 3); // Highest score
        assert_eq!(results[1].index, 1);
        assert_eq!(results[2].index, 0); // Lowest of the top 3
    }
}