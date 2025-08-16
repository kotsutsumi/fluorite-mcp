//! Clustering algorithms for pattern organization
//! 
//! Provides various clustering algorithms to organize embeddings and patterns
//! into meaningful groups for better knowledge organization and retrieval.

use std::collections::HashMap;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use rayon::prelude::*;

use crate::{MLConfig, SimilarityEngine, SimilarityMetric};

/// Clustering engine for organizing embeddings
#[derive(Debug)]
pub struct ClusteringEngine {
    config: MLConfig,
    algorithm: ClusteringAlgorithm,
    similarity_engine: SimilarityEngine,
}

/// Available clustering algorithms
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ClusteringAlgorithm {
    /// K-means clustering
    KMeans,
    /// DBSCAN (density-based clustering)
    DBSCAN,
    /// Hierarchical clustering
    Hierarchical,
    /// Spectral clustering
    Spectral,
}

/// Configuration for clustering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringConfig {
    /// Number of clusters (for algorithms that require it)
    pub num_clusters: usize,
    /// Maximum iterations for iterative algorithms
    pub max_iterations: usize,
    /// Convergence tolerance
    pub tolerance: f32,
    /// Minimum cluster size
    pub min_cluster_size: usize,
    /// Distance threshold for DBSCAN
    pub eps: f32,
    /// Minimum points for DBSCAN core points
    pub min_points: usize,
    /// Use parallel processing
    pub parallel: bool,
}

impl Default for ClusteringConfig {
    fn default() -> Self {
        Self {
            num_clusters: 5,
            max_iterations: 100,
            tolerance: 1e-4,
            min_cluster_size: 2,
            eps: 0.3,
            min_points: 3,
            parallel: true,
        }
    }
}

/// Result of clustering operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringResult {
    /// Cluster assignments for each embedding
    pub assignments: Vec<ClusterAssignment>,
    /// Cluster centers (centroids)
    pub centers: Vec<Vec<f32>>,
    /// Cluster statistics
    pub statistics: ClusteringStatistics,
    /// Algorithm used
    pub algorithm: String,
    /// Configuration used
    pub config: ClusteringConfig,
}

/// Assignment of an embedding to a cluster
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterAssignment {
    /// Index of the original embedding
    pub embedding_index: usize,
    /// Assigned cluster ID (-1 for noise in DBSCAN)
    pub cluster_id: i32,
    /// Distance to cluster center
    pub distance_to_center: f32,
    /// Confidence score for the assignment
    pub confidence: f32,
}

/// Statistics about the clustering result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringStatistics {
    /// Number of clusters found
    pub num_clusters: usize,
    /// Number of noise points (for DBSCAN)
    pub num_noise_points: usize,
    /// Average cluster size
    pub avg_cluster_size: f32,
    /// Silhouette score (clustering quality metric)
    pub silhouette_score: f32,
    /// Within-cluster sum of squares
    pub wcss: f32,
    /// Between-cluster sum of squares
    pub bcss: f32,
    /// Total computation time in milliseconds
    pub computation_time_ms: f64,
}

/// Individual cluster information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterInfo {
    /// Cluster ID
    pub id: i32,
    /// Number of points in cluster
    pub size: usize,
    /// Cluster centroid
    pub center: Vec<f32>,
    /// Average distance to center
    pub avg_distance_to_center: f32,
    /// Cluster density
    pub density: f32,
    /// Representative embeddings (closest to center)
    pub representatives: Vec<usize>,
}

impl ClusteringEngine {
    /// Create a new clustering engine
    pub async fn new(config: &MLConfig) -> Result<Self> {
        let mut similarity_engine = SimilarityEngine::new(config).await?;
        similarity_engine.set_similarity_metric(SimilarityMetric::Cosine);

        Ok(Self {
            config: config.clone(),
            algorithm: ClusteringAlgorithm::KMeans,
            similarity_engine,
        })
    }

    /// Cluster embeddings using the configured algorithm
    pub async fn cluster_embeddings(
        &self,
        embeddings: &[Vec<f32>],
        num_clusters: usize,
    ) -> Result<ClusteringResult> {
        let config = ClusteringConfig {
            num_clusters,
            ..Default::default()
        };

        self.cluster_embeddings_with_config(embeddings, &config).await
    }

    /// Cluster embeddings with custom configuration
    pub async fn cluster_embeddings_with_config(
        &self,
        embeddings: &[Vec<f32>],
        config: &ClusteringConfig,
    ) -> Result<ClusteringResult> {
        if embeddings.is_empty() {
            return Err(anyhow::anyhow!("Cannot cluster empty embedding set"));
        }

        let start_time = std::time::Instant::now();

        let result = match self.algorithm {
            ClusteringAlgorithm::KMeans => {
                self.kmeans_clustering(embeddings, config).await?
            }
            ClusteringAlgorithm::DBSCAN => {
                self.dbscan_clustering(embeddings, config).await?
            }
            ClusteringAlgorithm::Hierarchical => {
                self.hierarchical_clustering(embeddings, config).await?
            }
            ClusteringAlgorithm::Spectral => {
                self.spectral_clustering(embeddings, config).await?
            }
        };

        let computation_time = start_time.elapsed().as_millis() as f64;

        let mut final_result = result;
        final_result.statistics.computation_time_ms = computation_time;
        final_result.algorithm = format!("{:?}", self.algorithm);
        final_result.config = config.clone();

        Ok(final_result)
    }

    /// Set clustering algorithm
    pub fn set_algorithm(&mut self, algorithm: ClusteringAlgorithm) {
        self.algorithm = algorithm;
    }

    /// Analyze cluster quality
    pub async fn analyze_cluster_quality(&self, result: &ClusteringResult, embeddings: &[Vec<f32>]) -> Result<ClusterQualityReport> {
        let silhouette_score = self.calculate_silhouette_score(embeddings, &result.assignments).await?;
        let cluster_cohesion = self.calculate_cluster_cohesion(embeddings, &result.assignments, &result.centers).await?;
        let cluster_separation = self.calculate_cluster_separation(&result.centers).await?;

        Ok(ClusterQualityReport {
            silhouette_score,
            cluster_cohesion,
            cluster_separation,
            num_clusters: result.statistics.num_clusters,
            avg_cluster_size: result.statistics.avg_cluster_size,
            noise_ratio: result.statistics.num_noise_points as f32 / embeddings.len() as f32,
        })
    }

    /// Get detailed cluster information
    pub async fn get_cluster_info(&self, result: &ClusteringResult, embeddings: &[Vec<f32>]) -> Result<Vec<ClusterInfo>> {
        let mut cluster_infos = Vec::new();

        // Group assignments by cluster
        let mut clusters: HashMap<i32, Vec<usize>> = HashMap::new();
        for assignment in &result.assignments {
            if assignment.cluster_id >= 0 {
                clusters.entry(assignment.cluster_id)
                    .or_insert_with(Vec::new)
                    .push(assignment.embedding_index);
            }
        }

        for (cluster_id, member_indices) in clusters {
            let center = &result.centers[cluster_id as usize];
            
            // Calculate average distance to center
            let mut total_distance = 0.0;
            for &idx in &member_indices {
                let distance = self.similarity_engine.calculate_similarity(&embeddings[idx], center)?;
                total_distance += 1.0 - distance; // Convert similarity to distance
            }
            let avg_distance = total_distance / member_indices.len() as f32;

            // Find representative embeddings (closest to center)
            let mut distances: Vec<(usize, f32)> = member_indices.iter()
                .map(|&idx| {
                    let similarity = self.similarity_engine.calculate_similarity(&embeddings[idx], center).unwrap_or(0.0);
                    (idx, 1.0 - similarity) // Convert to distance
                })
                .collect();
            distances.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
            
            let representatives: Vec<usize> = distances.into_iter()
                .take(3.min(member_indices.len())) // Top 3 representatives
                .map(|(idx, _)| idx)
                .collect();

            // Calculate cluster density (average pairwise similarity)
            let mut pairwise_similarities = Vec::new();
            for i in 0..member_indices.len() {
                for j in i+1..member_indices.len() {
                    let sim = self.similarity_engine.calculate_similarity(
                        &embeddings[member_indices[i]], 
                        &embeddings[member_indices[j]]
                    )?;
                    pairwise_similarities.push(sim);
                }
            }
            let density = if pairwise_similarities.is_empty() {
                1.0
            } else {
                pairwise_similarities.iter().sum::<f32>() / pairwise_similarities.len() as f32
            };

            cluster_infos.push(ClusterInfo {
                id: cluster_id,
                size: member_indices.len(),
                center: center.clone(),
                avg_distance_to_center: avg_distance,
                density,
                representatives,
            });
        }

        // Sort by cluster size (descending)
        cluster_infos.sort_by(|a, b| b.size.cmp(&a.size));

        Ok(cluster_infos)
    }

    /// K-means clustering implementation
    async fn kmeans_clustering(&self, embeddings: &[Vec<f32>], config: &ClusteringConfig) -> Result<ClusteringResult> {
        let k = config.num_clusters;
        let dimension = embeddings[0].len();
        
        // Initialize centroids randomly
        let mut centroids = self.initialize_centroids(embeddings, k);
        let mut assignments = vec![ClusterAssignment {
            embedding_index: 0,
            cluster_id: 0,
            distance_to_center: 0.0,
            confidence: 0.0,
        }; embeddings.len()];

        let mut converged = false;
        let mut iteration = 0;

        while !converged && iteration < config.max_iterations {
            // Assignment step
            if config.parallel && embeddings.len() > 100 {
                assignments.par_iter_mut().enumerate().for_each(|(i, assignment)| {
                    let (best_cluster, best_distance, confidence) = self.assign_to_cluster(&embeddings[i], &centroids);
                    assignment.embedding_index = i;
                    assignment.cluster_id = best_cluster;
                    assignment.distance_to_center = best_distance;
                    assignment.confidence = confidence;
                });
            } else {
                for (i, assignment) in assignments.iter_mut().enumerate() {
                    let (best_cluster, best_distance, confidence) = self.assign_to_cluster(&embeddings[i], &centroids);
                    assignment.embedding_index = i;
                    assignment.cluster_id = best_cluster;
                    assignment.distance_to_center = best_distance;
                    assignment.confidence = confidence;
                }
            }

            // Update step
            let new_centroids = self.update_centroids(embeddings, &assignments, k, dimension);
            
            // Check convergence
            converged = self.check_convergence(&centroids, &new_centroids, config.tolerance);
            centroids = new_centroids;
            iteration += 1;
        }

        // Calculate statistics
        let statistics = self.calculate_clustering_statistics(&assignments, &centroids, embeddings).await?;

        Ok(ClusteringResult {
            assignments,
            centers: centroids,
            statistics,
            algorithm: "KMeans".to_string(),
            config: config.clone(),
        })
    }

    /// DBSCAN clustering implementation
    async fn dbscan_clustering(&self, embeddings: &[Vec<f32>], config: &ClusteringConfig) -> Result<ClusteringResult> {
        let n = embeddings.len();
        let mut assignments = vec![ClusterAssignment {
            embedding_index: 0,
            cluster_id: -1, // -1 indicates unassigned/noise
            distance_to_center: 0.0,
            confidence: 0.0,
        }; n];

        let mut visited = vec![false; n];
        let mut cluster_id = 0;

        // Calculate distance matrix
        let distance_matrix = self.calculate_distance_matrix(embeddings).await?;

        for i in 0..n {
            if visited[i] {
                continue;
            }
            visited[i] = true;

            // Find neighbors
            let neighbors = self.find_neighbors(i, &distance_matrix, config.eps);

            if neighbors.len() < config.min_points {
                // Mark as noise
                assignments[i].cluster_id = -1;
            } else {
                // Start new cluster
                self.expand_cluster(i, &neighbors, cluster_id, &mut assignments, &mut visited, &distance_matrix, config);
                cluster_id += 1;
            }
        }

        // Update assignment metadata
        for (i, assignment) in assignments.iter_mut().enumerate() {
            assignment.embedding_index = i;
            assignment.confidence = if assignment.cluster_id >= 0 { 0.8 } else { 0.0 };
        }

        // Calculate cluster centers
        let centers = self.calculate_cluster_centers_from_assignments(embeddings, &assignments, cluster_id as usize);
        
        // Update distances to centers
        for assignment in &mut assignments {
            if assignment.cluster_id >= 0 {
                let center = &centers[assignment.cluster_id as usize];
                assignment.distance_to_center = 1.0 - self.similarity_engine
                    .calculate_similarity(&embeddings[assignment.embedding_index], center)?;
            }
        }

        let statistics = self.calculate_clustering_statistics(&assignments, &centers, embeddings).await?;

        Ok(ClusteringResult {
            assignments,
            centers,
            statistics,
            algorithm: "DBSCAN".to_string(),
            config: config.clone(),
        })
    }

    /// Hierarchical clustering (placeholder)
    async fn hierarchical_clustering(&self, embeddings: &[Vec<f32>], config: &ClusteringConfig) -> Result<ClusteringResult> {
        // For now, fall back to K-means
        // In a real implementation, this would use hierarchical clustering algorithms
        tracing::warn!("Hierarchical clustering not yet implemented, falling back to K-means");
        self.kmeans_clustering(embeddings, config).await
    }

    /// Spectral clustering (placeholder)
    async fn spectral_clustering(&self, embeddings: &[Vec<f32>], config: &ClusteringConfig) -> Result<ClusteringResult> {
        // For now, fall back to K-means
        // In a real implementation, this would use spectral clustering algorithms
        tracing::warn!("Spectral clustering not yet implemented, falling back to K-means");
        self.kmeans_clustering(embeddings, config).await
    }

    /// Initialize centroids using k-means++ algorithm
    fn initialize_centroids(&self, embeddings: &[Vec<f32>], k: usize) -> Vec<Vec<f32>> {
        use rand::seq::SliceRandom;
        use rand::thread_rng;

        let mut centroids = Vec::new();
        let mut rng = thread_rng();

        // Choose first centroid randomly
        if let Some(first) = embeddings.choose(&mut rng) {
            centroids.push(first.clone());
        }

        // Choose remaining centroids using k-means++ initialization
        for _ in 1..k {
            let mut distances = Vec::new();
            let mut total_distance = 0.0;

            for embedding in embeddings {
                let min_distance = centroids.iter()
                    .map(|centroid| {
                        1.0 - self.similarity_engine.calculate_similarity(embedding, centroid).unwrap_or(0.0)
                    })
                    .fold(f32::INFINITY, f32::min);
                let squared_distance = min_distance * min_distance;
                distances.push(squared_distance);
                total_distance += squared_distance;
            }

            // Choose next centroid with probability proportional to squared distance
            let threshold = rng.gen::<f32>() * total_distance;
            let mut cumulative = 0.0;
            for (i, &distance) in distances.iter().enumerate() {
                cumulative += distance;
                if cumulative >= threshold {
                    centroids.push(embeddings[i].clone());
                    break;
                }
            }
        }

        centroids
    }

    /// Assign an embedding to the closest cluster
    fn assign_to_cluster(&self, embedding: &[f32], centroids: &[Vec<f32>]) -> (i32, f32, f32) {
        let mut best_cluster = 0;
        let mut best_distance = f32::INFINITY;
        let mut distances = Vec::new();

        for (i, centroid) in centroids.iter().enumerate() {
            let similarity = self.similarity_engine.calculate_similarity(embedding, centroid).unwrap_or(0.0);
            let distance = 1.0 - similarity;
            distances.push(distance);
            
            if distance < best_distance {
                best_distance = distance;
                best_cluster = i as i32;
            }
        }

        // Calculate confidence as relative difference from second-best
        distances.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        let confidence = if distances.len() > 1 {
            (distances[1] - distances[0]) / distances[1]
        } else {
            1.0
        };

        (best_cluster, best_distance, confidence.max(0.0).min(1.0))
    }

    /// Update centroids based on current assignments
    fn update_centroids(&self, embeddings: &[Vec<f32>], assignments: &[ClusterAssignment], k: usize, dimension: usize) -> Vec<Vec<f32>> {
        let mut centroids = vec![vec![0.0; dimension]; k];
        let mut counts = vec![0; k];

        // Sum embeddings for each cluster
        for assignment in assignments {
            let cluster_id = assignment.cluster_id as usize;
            if cluster_id < k {
                for (i, &value) in embeddings[assignment.embedding_index].iter().enumerate() {
                    centroids[cluster_id][i] += value;
                }
                counts[cluster_id] += 1;
            }
        }

        // Average the sums
        for (i, count) in counts.iter().enumerate() {
            if *count > 0 {
                for value in &mut centroids[i] {
                    *value /= *count as f32;
                }
            }
        }

        centroids
    }

    /// Check if centroids have converged
    fn check_convergence(&self, old_centroids: &[Vec<f32>], new_centroids: &[Vec<f32>], tolerance: f32) -> bool {
        for (old, new) in old_centroids.iter().zip(new_centroids.iter()) {
            let similarity = self.similarity_engine.calculate_similarity(old, new).unwrap_or(0.0);
            if 1.0 - similarity > tolerance {
                return false;
            }
        }
        true
    }

    /// Calculate distance matrix for DBSCAN
    async fn calculate_distance_matrix(&self, embeddings: &[Vec<f32>]) -> Result<Vec<Vec<f32>>> {
        let n = embeddings.len();
        let mut matrix = vec![vec![0.0; n]; n];

        for i in 0..n {
            for j in i..n {
                let similarity = self.similarity_engine.calculate_similarity(&embeddings[i], &embeddings[j])?;
                let distance = 1.0 - similarity;
                matrix[i][j] = distance;
                matrix[j][i] = distance;
            }
        }

        Ok(matrix)
    }

    /// Find neighbors within eps distance
    fn find_neighbors(&self, point: usize, distance_matrix: &[Vec<f32>], eps: f32) -> Vec<usize> {
        distance_matrix[point].iter()
            .enumerate()
            .filter_map(|(i, &distance)| if distance <= eps { Some(i) } else { None })
            .collect()
    }

    /// Expand cluster for DBSCAN
    fn expand_cluster(
        &self,
        point: usize,
        neighbors: &[usize],
        cluster_id: i32,
        assignments: &mut [ClusterAssignment],
        visited: &mut [bool],
        distance_matrix: &[Vec<f32>],
        config: &ClusteringConfig,
    ) {
        assignments[point].cluster_id = cluster_id;
        let mut queue = neighbors.to_vec();
        let mut i = 0;

        while i < queue.len() {
            let q = queue[i];
            
            if !visited[q] {
                visited[q] = true;
                let q_neighbors = self.find_neighbors(q, distance_matrix, config.eps);
                
                if q_neighbors.len() >= config.min_points {
                    for &neighbor in &q_neighbors {
                        if !queue.contains(&neighbor) {
                            queue.push(neighbor);
                        }
                    }
                }
            }
            
            if assignments[q].cluster_id == -1 {
                assignments[q].cluster_id = cluster_id;
            }
            
            i += 1;
        }
    }

    /// Calculate cluster centers from assignments
    fn calculate_cluster_centers_from_assignments(
        &self,
        embeddings: &[Vec<f32>],
        assignments: &[ClusterAssignment],
        num_clusters: usize,
    ) -> Vec<Vec<f32>> {
        let dimension = embeddings[0].len();
        let mut centers = vec![vec![0.0; dimension]; num_clusters];
        let mut counts = vec![0; num_clusters];

        for assignment in assignments {
            if assignment.cluster_id >= 0 {
                let cluster_id = assignment.cluster_id as usize;
                if cluster_id < num_clusters {
                    for (i, &value) in embeddings[assignment.embedding_index].iter().enumerate() {
                        centers[cluster_id][i] += value;
                    }
                    counts[cluster_id] += 1;
                }
            }
        }

        for (i, count) in counts.iter().enumerate() {
            if *count > 0 {
                for value in &mut centers[i] {
                    *value /= *count as f32;
                }
            }
        }

        centers
    }

    /// Calculate clustering statistics
    async fn calculate_clustering_statistics(
        &self,
        assignments: &[ClusterAssignment],
        centers: &[Vec<f32>],
        embeddings: &[Vec<f32>],
    ) -> Result<ClusteringStatistics> {
        let mut cluster_sizes = HashMap::new();
        let mut noise_count = 0;

        for assignment in assignments {
            if assignment.cluster_id >= 0 {
                *cluster_sizes.entry(assignment.cluster_id).or_insert(0) += 1;
            } else {
                noise_count += 1;
            }
        }

        let num_clusters = cluster_sizes.len();
        let avg_cluster_size = if num_clusters > 0 {
            cluster_sizes.values().sum::<usize>() as f32 / num_clusters as f32
        } else {
            0.0
        };

        // Calculate WCSS (Within-Cluster Sum of Squares)
        let mut wcss = 0.0;
        for assignment in assignments {
            if assignment.cluster_id >= 0 {
                wcss += assignment.distance_to_center * assignment.distance_to_center;
            }
        }

        // Calculate silhouette score (simplified)
        let silhouette_score = self.calculate_silhouette_score(embeddings, assignments).await?;

        Ok(ClusteringStatistics {
            num_clusters,
            num_noise_points: noise_count,
            avg_cluster_size,
            silhouette_score,
            wcss,
            bcss: 0.0, // Would need to calculate between-cluster sum of squares
            computation_time_ms: 0.0, // Set by caller
        })
    }

    /// Calculate silhouette score
    async fn calculate_silhouette_score(&self, embeddings: &[Vec<f32>], assignments: &[ClusterAssignment]) -> Result<f32> {
        // Simplified silhouette calculation
        let mut silhouette_scores = Vec::new();

        for (i, assignment) in assignments.iter().enumerate() {
            if assignment.cluster_id < 0 {
                continue; // Skip noise points
            }

            // Calculate average distance to points in same cluster
            let mut intra_cluster_distances = Vec::new();
            let mut inter_cluster_distances = HashMap::new();

            for (j, other_assignment) in assignments.iter().enumerate() {
                if i == j {
                    continue;
                }

                let similarity = self.similarity_engine.calculate_similarity(&embeddings[i], &embeddings[j])?;
                let distance = 1.0 - similarity;

                if other_assignment.cluster_id == assignment.cluster_id {
                    intra_cluster_distances.push(distance);
                } else if other_assignment.cluster_id >= 0 {
                    inter_cluster_distances.entry(other_assignment.cluster_id)
                        .or_insert_with(Vec::new)
                        .push(distance);
                }
            }

            let a = if intra_cluster_distances.is_empty() {
                0.0
            } else {
                intra_cluster_distances.iter().sum::<f32>() / intra_cluster_distances.len() as f32
            };

            let b = inter_cluster_distances.values()
                .map(|distances| distances.iter().sum::<f32>() / distances.len() as f32)
                .fold(f32::INFINITY, f32::min);

            let silhouette = if a.max(b) > 0.0 {
                (b - a) / a.max(b)
            } else {
                0.0
            };

            silhouette_scores.push(silhouette);
        }

        Ok(if silhouette_scores.is_empty() {
            0.0
        } else {
            silhouette_scores.iter().sum::<f32>() / silhouette_scores.len() as f32
        })
    }

    /// Calculate cluster cohesion
    async fn calculate_cluster_cohesion(&self, embeddings: &[Vec<f32>], assignments: &[ClusterAssignment], centers: &[Vec<f32>]) -> Result<f32> {
        let mut total_cohesion = 0.0;
        let mut count = 0;

        for assignment in assignments {
            if assignment.cluster_id >= 0 {
                let cluster_id = assignment.cluster_id as usize;
                if cluster_id < centers.len() {
                    let similarity = self.similarity_engine.calculate_similarity(
                        &embeddings[assignment.embedding_index],
                        &centers[cluster_id]
                    )?;
                    total_cohesion += similarity;
                    count += 1;
                }
            }
        }

        Ok(if count > 0 {
            total_cohesion / count as f32
        } else {
            0.0
        })
    }

    /// Calculate cluster separation
    async fn calculate_cluster_separation(&self, centers: &[Vec<f32>]) -> Result<f32> {
        if centers.len() < 2 {
            return Ok(1.0);
        }

        let mut total_separation = 0.0;
        let mut count = 0;

        for i in 0..centers.len() {
            for j in i+1..centers.len() {
                let similarity = self.similarity_engine.calculate_similarity(&centers[i], &centers[j])?;
                total_separation += 1.0 - similarity; // Convert to distance
                count += 1;
            }
        }

        Ok(if count > 0 {
            total_separation / count as f32
        } else {
            0.0
        })
    }
}

/// Cluster quality analysis report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterQualityReport {
    /// Silhouette score (-1 to 1, higher is better)
    pub silhouette_score: f32,
    /// Average cluster cohesion (0 to 1, higher is better)
    pub cluster_cohesion: f32,
    /// Average cluster separation (0 to 1, higher is better)
    pub cluster_separation: f32,
    /// Number of clusters
    pub num_clusters: usize,
    /// Average cluster size
    pub avg_cluster_size: f32,
    /// Ratio of noise points
    pub noise_ratio: f32,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::MLConfig;

    async fn create_test_clustering_engine() -> ClusteringEngine {
        let config = MLConfig::default();
        ClusteringEngine::new(&config).await.unwrap()
    }

    #[tokio::test]
    async fn test_kmeans_clustering() {
        let engine = create_test_clustering_engine().await;
        
        // Create test embeddings with clear clusters
        let embeddings = vec![
            vec![1.0, 0.0, 0.0], // Cluster 1
            vec![0.9, 0.1, 0.0],
            vec![0.8, 0.2, 0.0],
            vec![0.0, 1.0, 0.0], // Cluster 2
            vec![0.1, 0.9, 0.0],
            vec![0.2, 0.8, 0.0],
        ];

        let result = engine.cluster_embeddings(&embeddings, 2).await.unwrap();
        
        assert_eq!(result.assignments.len(), 6);
        assert_eq!(result.centers.len(), 2);
        assert_eq!(result.statistics.num_clusters, 2);
        assert!(result.statistics.silhouette_score >= 0.0);
    }

    #[tokio::test]
    async fn test_dbscan_clustering() {
        let mut engine = create_test_clustering_engine().await;
        engine.set_algorithm(ClusteringAlgorithm::DBSCAN);
        
        let embeddings = vec![
            vec![1.0, 0.0, 0.0], // Dense cluster
            vec![0.9, 0.1, 0.0],
            vec![0.8, 0.2, 0.0],
            vec![0.0, 1.0, 0.0], // Another dense cluster
            vec![0.1, 0.9, 0.0],
            vec![0.2, 0.8, 0.0],
            vec![0.5, 0.5, 0.5], // Potential outlier
        ];

        let config = ClusteringConfig {
            eps: 0.5,
            min_points: 2,
            ..Default::default()
        };

        let result = engine.cluster_embeddings_with_config(&embeddings, &config).await.unwrap();
        
        assert_eq!(result.assignments.len(), 7);
        // DBSCAN might find different number of clusters or mark some as noise
        assert!(result.statistics.num_clusters <= 3);
    }

    #[tokio::test]
    async fn test_cluster_quality_analysis() {
        let engine = create_test_clustering_engine().await;
        
        let embeddings = vec![
            vec![1.0, 0.0, 0.0],
            vec![0.9, 0.1, 0.0],
            vec![0.0, 1.0, 0.0],
            vec![0.1, 0.9, 0.0],
        ];

        let result = engine.cluster_embeddings(&embeddings, 2).await.unwrap();
        let quality = engine.analyze_cluster_quality(&result, &embeddings).await.unwrap();
        
        assert!(quality.silhouette_score >= -1.0 && quality.silhouette_score <= 1.0);
        assert!(quality.cluster_cohesion >= 0.0 && quality.cluster_cohesion <= 1.0);
        assert!(quality.cluster_separation >= 0.0);
        assert_eq!(quality.num_clusters, 2);
    }

    #[tokio::test]
    async fn test_cluster_info() {
        let engine = create_test_clustering_engine().await;
        
        let embeddings = vec![
            vec![1.0, 0.0, 0.0],
            vec![0.9, 0.1, 0.0],
            vec![0.8, 0.2, 0.0],
            vec![0.0, 1.0, 0.0],
            vec![0.1, 0.9, 0.0],
        ];

        let result = engine.cluster_embeddings(&embeddings, 2).await.unwrap();
        let cluster_infos = engine.get_cluster_info(&result, &embeddings).await.unwrap();
        
        assert_eq!(cluster_infos.len(), 2);
        
        for info in &cluster_infos {
            assert!(info.size > 0);
            assert!(info.density >= 0.0 && info.density <= 1.0);
            assert!(!info.representatives.is_empty());
            assert_eq!(info.center.len(), embeddings[0].len());
        }
    }
}