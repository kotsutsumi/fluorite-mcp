//! Python Bridge for ML Models
//! 
//! Integrates Python-based ML models using PyO3 for CPU-only inference
//! and training. Supports transformers, sentence-transformers, and custom models.

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Result, Context};
use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList, PyFloat, PyString};
use pyo3_asyncio;
use numpy::{PyArray1, PyArray2};
use tokio::sync::Mutex;
use tracing::{info, debug, error};

/// Python ML model wrapper for CPU-only operations
pub struct PythonMLBridge {
    /// Python runtime
    runtime: Arc<Mutex<Python<'static>>>,
    /// Loaded models cache
    models: Arc<Mutex<HashMap<String, PyObject>>>,
    /// Model configuration
    config: PythonMLConfig,
}

#[derive(Clone, Debug)]
pub struct PythonMLConfig {
    /// Path to Python models
    pub models_path: PathBuf,
    /// Python virtual environment path (optional)
    pub venv_path: Option<PathBuf>,
    /// Model cache directory
    pub cache_dir: PathBuf,
    /// Use CPU-only mode
    pub cpu_only: bool,
    /// Number of threads for inference
    pub num_threads: usize,
}

impl Default for PythonMLConfig {
    fn default() -> Self {
        Self {
            models_path: PathBuf::from("./models"),
            venv_path: None,
            cache_dir: PathBuf::from("./cache"),
            cpu_only: true,
            num_threads: num_cpus::get(),
        }
    }
}

impl PythonMLBridge {
    /// Create a new Python ML bridge
    pub async fn new(config: PythonMLConfig) -> Result<Self> {
        info!("Initializing Python ML Bridge");
        
        // Initialize Python runtime
        pyo3::prepare_freethreaded_python();
        
        let bridge = Self {
            runtime: Arc::new(Mutex::new(unsafe { Python::assume_gil_acquired() })),
            models: Arc::new(Mutex::new(HashMap::new())),
            config,
        };
        
        // Initialize Python environment
        bridge.initialize_python_env().await?;
        
        Ok(bridge)
    }
    
    /// Initialize Python environment and install required packages
    async fn initialize_python_env(&self) -> Result<()> {
        Python::with_gil(|py| {
            // Set environment variables for CPU-only mode
            py.run(r#"
import os
os.environ['CUDA_VISIBLE_DEVICES'] = ''
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['OMP_NUM_THREADS'] = '{}'
            "#.replace("{}", &self.config.num_threads.to_string()), None, None)?;
            
            // Import essential libraries
            py.run(r#"
import sys
import numpy as np
import json
from typing import List, Dict, Any, Optional

# Try to import ML libraries (with fallback)
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    print("sentence-transformers not available")

try:
    from transformers import pipeline, AutoTokenizer, AutoModel
    import torch
    torch.set_num_threads({})
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False
    print("transformers not available")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("scikit-learn not available")

# Simple fallback embedding using TF-IDF if no transformers available
class SimpleTfidfEmbedder:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=768) if HAS_SKLEARN else None
        self.fitted = False
    
    def encode(self, texts: List[str]) -> np.ndarray:
        if not HAS_SKLEARN:
            # Return random embeddings as last resort
            return np.random.randn(len(texts), 768).astype(np.float32)
        
        if not self.fitted:
            self.vectorizer.fit(texts)
            self.fitted = True
        
        sparse_matrix = self.vectorizer.transform(texts)
        dense_matrix = sparse_matrix.toarray()
        
        # Pad or truncate to 768 dimensions
        if dense_matrix.shape[1] < 768:
            padding = np.zeros((dense_matrix.shape[0], 768 - dense_matrix.shape[1]))
            dense_matrix = np.hstack([dense_matrix, padding])
        elif dense_matrix.shape[1] > 768:
            dense_matrix = dense_matrix[:, :768]
        
        return dense_matrix.astype(np.float32)

# Global model cache
MODEL_CACHE = {}
            "#.replace("{}", &self.config.num_threads.to_string()), None, None)?;
            
            Ok::<(), PyErr>(())
        })?;
        
        info!("Python environment initialized");
        Ok(())
    }
    
    /// Load a sentence transformer model
    pub async fn load_sentence_transformer(&self, model_name: &str) -> Result<()> {
        Python::with_gil(|py| {
            let code = format!(r#"
if HAS_SENTENCE_TRANSFORMERS:
    if '{}' not in MODEL_CACHE:
        MODEL_CACHE['{}'] = SentenceTransformer('{}', device='cpu')
    model = MODEL_CACHE['{}']
else:
    # Fallback to simple embedder
    if 'simple_embedder' not in MODEL_CACHE:
        MODEL_CACHE['simple_embedder'] = SimpleTfidfEmbedder()
    model = MODEL_CACHE['simple_embedder']
            "#, model_name, model_name, model_name, model_name);
            
            py.run(&code, None, None)?;
            Ok(())
        })
    }
    
    /// Generate embeddings for text
    pub async fn generate_embeddings(&self, texts: Vec<String>) -> Result<Vec<Vec<f32>>> {
        Python::with_gil(|py| {
            // Convert texts to Python list
            let py_texts = PyList::new(py, texts.iter().map(|t| t.as_str()));
            
            // Get or create embedder
            let locals = PyDict::new(py);
            locals.set_item("texts", py_texts)?;
            
            py.run(r#"
# Use the first available model or create simple embedder
if MODEL_CACHE:
    model = list(MODEL_CACHE.values())[0]
else:
    MODEL_CACHE['simple_embedder'] = SimpleTfidfEmbedder()
    model = MODEL_CACHE['simple_embedder']

# Generate embeddings
embeddings = model.encode(texts)
            "#, None, Some(locals))?;
            
            // Extract embeddings
            let embeddings = locals.get_item("embeddings")
                .ok_or_else(|| anyhow::anyhow!("Failed to get embeddings"))?;
            
            let np_array: &PyArray2<f32> = embeddings.downcast()?;
            let shape = np_array.shape();
            let data = np_array.to_vec()?;
            
            // Reshape to Vec<Vec<f32>>
            let mut result = Vec::new();
            for i in 0..shape[0] {
                let start = i * shape[1];
                let end = start + shape[1];
                result.push(data[start..end].to_vec());
            }
            
            Ok(result)
        })
    }
    
    /// Compute similarity between embeddings
    pub async fn compute_similarity(&self, embedding1: Vec<f32>, embedding2: Vec<f32>) -> Result<f32> {
        Python::with_gil(|py| {
            let locals = PyDict::new(py);
            
            // Convert to numpy arrays
            let arr1 = PyArray1::from_vec(py, embedding1);
            let arr2 = PyArray1::from_vec(py, embedding2);
            
            locals.set_item("emb1", arr1)?;
            locals.set_item("emb2", arr2)?;
            
            py.run(r#"
import numpy as np
from numpy.linalg import norm

# Compute cosine similarity
similarity = np.dot(emb1, emb2) / (norm(emb1) * norm(emb2))
            "#, None, Some(locals))?;
            
            let similarity: f32 = locals.get_item("similarity")
                .ok_or_else(|| anyhow::anyhow!("Failed to get similarity"))?
                .extract()?;
            
            Ok(similarity)
        })
    }
    
    /// Perform clustering on embeddings
    pub async fn cluster_embeddings(&self, embeddings: Vec<Vec<f32>>, n_clusters: usize) -> Result<Vec<usize>> {
        Python::with_gil(|py| {
            let locals = PyDict::new(py);
            
            // Convert embeddings to numpy array
            let flat_embeddings: Vec<f32> = embeddings.iter().flatten().cloned().collect();
            let n_samples = embeddings.len();
            let n_features = embeddings[0].len();
            
            let np_embeddings = PyArray2::from_vec(py, flat_embeddings, (n_samples, n_features))?;
            
            locals.set_item("embeddings", np_embeddings)?;
            locals.set_item("n_clusters", n_clusters)?;
            
            py.run(r#"
if HAS_SKLEARN:
    from sklearn.cluster import KMeans
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(embeddings)
else:
    # Simple clustering based on distance to random centers
    import numpy as np
    centers = embeddings[np.random.choice(len(embeddings), n_clusters, replace=False)]
    labels = []
    for emb in embeddings:
        distances = [np.linalg.norm(emb - center) for center in centers]
        labels.append(np.argmin(distances))
    labels = np.array(labels)
            "#, None, Some(locals))?;
            
            let labels = locals.get_item("labels")
                .ok_or_else(|| anyhow::anyhow!("Failed to get cluster labels"))?;
            
            let np_labels: &PyArray1<i64> = labels.downcast()?;
            let labels_vec = np_labels.to_vec()?;
            
            Ok(labels_vec.into_iter().map(|l| l as usize).collect())
        })
    }
    
    /// Train a simple classifier (for pattern recognition)
    pub async fn train_classifier(&self, texts: Vec<String>, labels: Vec<String>) -> Result<()> {
        Python::with_gil(|py| {
            let locals = PyDict::new(py);
            
            let py_texts = PyList::new(py, texts.iter().map(|t| t.as_str()));
            let py_labels = PyList::new(py, labels.iter().map(|l| l.as_str()));
            
            locals.set_item("texts", py_texts)?;
            locals.set_item("labels", py_labels)?;
            
            py.run(r#"
if HAS_SKLEARN:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    
    # Create and train pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000)),
        ('classifier', MultinomialNB())
    ])
    
    pipeline.fit(texts, labels)
    MODEL_CACHE['classifier'] = pipeline
else:
    # Store simple mapping for fallback
    text_label_map = dict(zip(texts, labels))
    MODEL_CACHE['classifier'] = text_label_map
            "#, None, Some(locals))?;
            
            Ok(())
        })
    }
    
    /// Predict using trained classifier
    pub async fn predict(&self, texts: Vec<String>) -> Result<Vec<String>> {
        Python::with_gil(|py| {
            let locals = PyDict::new(py);
            
            let py_texts = PyList::new(py, texts.iter().map(|t| t.as_str()));
            locals.set_item("texts", py_texts)?;
            
            py.run(r#"
if 'classifier' in MODEL_CACHE:
    classifier = MODEL_CACHE['classifier']
    
    if HAS_SKLEARN and hasattr(classifier, 'predict'):
        predictions = classifier.predict(texts)
    else:
        # Fallback: return most common label or first label
        if isinstance(classifier, dict) and classifier:
            default_label = list(classifier.values())[0]
            predictions = [classifier.get(text, default_label) for text in texts]
        else:
            predictions = ['unknown'] * len(texts)
else:
    predictions = ['unknown'] * len(texts)

predictions = list(predictions)
            "#, None, Some(locals))?;
            
            let predictions = locals.get_item("predictions")
                .ok_or_else(|| anyhow::anyhow!("Failed to get predictions"))?;
            
            let py_list: &PyList = predictions.downcast()?;
            let mut result = Vec::new();
            
            for item in py_list.iter() {
                let pred: String = item.extract()?;
                result.push(pred);
            }
            
            Ok(result)
        })
    }
    
    /// Shutdown and cleanup
    pub async fn shutdown(&self) -> Result<()> {
        Python::with_gil(|py| {
            py.run(r#"
# Clear model cache
MODEL_CACHE.clear()
            "#, None, None)?;
            Ok(())
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_python_bridge_creation() {
        let config = PythonMLConfig::default();
        let bridge = PythonMLBridge::new(config).await;
        assert!(bridge.is_ok());
    }
    
    #[tokio::test]
    async fn test_embeddings_generation() {
        let config = PythonMLConfig::default();
        let bridge = PythonMLBridge::new(config).await.unwrap();
        
        let texts = vec![
            "Hello world".to_string(),
            "Machine learning".to_string(),
        ];
        
        let embeddings = bridge.generate_embeddings(texts).await;
        assert!(embeddings.is_ok());
        
        let emb = embeddings.unwrap();
        assert_eq!(emb.len(), 2);
        assert!(!emb[0].is_empty());
    }
    
    #[tokio::test]
    async fn test_similarity_computation() {
        let config = PythonMLConfig::default();
        let bridge = PythonMLBridge::new(config).await.unwrap();
        
        let emb1 = vec![1.0; 768];
        let emb2 = vec![1.0; 768];
        
        let similarity = bridge.compute_similarity(emb1, emb2).await;
        assert!(similarity.is_ok());
        assert!((similarity.unwrap() - 1.0).abs() < 0.01);
    }
}