//! Training and incremental learning capabilities
//! 
//! Provides incremental learning, model fine-tuning, and continuous 
//! improvement based on user feedback and new data patterns.

use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, debug, warn};

use crate::{MLConfig, TrainingExample, TrainingResult};

/// Training engine for incremental learning
#[derive(Debug)]
pub struct TrainingEngine {
    config: MLConfig,
    training_state: RwLock<TrainingState>,
    training_history: RwLock<TrainingHistory>,
    feedback_processor: FeedbackProcessor,
    pattern_learner: PatternLearner,
}

/// Current state of training
#[derive(Debug, Default)]
struct TrainingState {
    /// Current epoch
    current_epoch: u64,
    /// Learning rate schedule
    learning_rate: f32,
    /// Training examples buffer
    training_buffer: Vec<TrainingExample>,
    /// Validation examples
    validation_buffer: Vec<TrainingExample>,
    /// Current model metrics
    current_metrics: TrainingMetrics,
    /// Whether training is in progress
    is_training: bool,
}

/// Training history and statistics
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct TrainingHistory {
    /// Training sessions completed
    pub sessions_completed: u64,
    /// Total examples processed
    pub total_examples_processed: u64,
    /// Best accuracy achieved
    pub best_accuracy: f64,
    /// Training metrics over time
    pub metrics_history: Vec<TimestampedMetrics>,
    /// Learning curve data
    pub learning_curve: Vec<LearningCurvePoint>,
}

/// Training metrics for a specific session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingMetrics {
    /// Accuracy on training set
    pub training_accuracy: f64,
    /// Accuracy on validation set
    pub validation_accuracy: f64,
    /// Training loss
    pub training_loss: f64,
    /// Validation loss
    pub validation_loss: f64,
    /// Learning rate used
    pub learning_rate: f64,
    /// Number of examples in this session
    pub examples_count: usize,
    /// Training time in seconds
    pub training_time_seconds: f64,
}

/// Timestamped metrics entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimestampedMetrics {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metrics: TrainingMetrics,
    pub epoch: u64,
}

/// Learning curve data point
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningCurvePoint {
    pub epoch: u64,
    pub training_loss: f64,
    pub validation_loss: f64,
    pub training_accuracy: f64,
    pub validation_accuracy: f64,
}

/// Feedback processor for learning from user interactions
#[derive(Debug)]
pub struct FeedbackProcessor {
    feedback_buffer: RwLock<Vec<UserFeedback>>,
    feedback_weights: HashMap<FeedbackType, f32>,
}

/// User feedback for learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFeedback {
    /// Unique feedback ID
    pub id: String,
    /// Type of feedback
    pub feedback_type: FeedbackType,
    /// Context that generated the feedback
    pub context: FeedbackContext,
    /// User's rating or correction
    pub rating: Option<f32>, // 0.0 to 1.0
    pub correction: Option<String>,
    /// Timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
    /// Additional metadata
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Types of user feedback
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum FeedbackType {
    /// Similarity judgment (too similar/not similar enough)
    Similarity,
    /// Pattern recognition accuracy
    PatternRecognition,
    /// Recommendation quality
    Recommendation,
    /// Search result relevance
    SearchRelevance,
    /// Code generation quality
    CodeGeneration,
    /// General quality rating
    General,
}

/// Context for feedback
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackContext {
    /// Query or input that generated the result
    pub query: String,
    /// Result that was rated
    pub result: String,
    /// Additional context
    pub context_data: HashMap<String, serde_json::Value>,
}

/// Pattern learner for discovering new patterns
#[derive(Debug)]
pub struct PatternLearner {
    pattern_buffer: RwLock<Vec<DiscoveredPattern>>,
    pattern_frequency: RwLock<HashMap<String, u64>>,
    confidence_threshold: f32,
}

/// Newly discovered pattern
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredPattern {
    /// Pattern identifier
    pub id: String,
    /// Pattern name/description
    pub name: String,
    /// Pattern confidence score
    pub confidence: f32,
    /// Number of times observed
    pub frequency: u64,
    /// Examples of this pattern
    pub examples: Vec<String>,
    /// Pattern metadata
    pub metadata: HashMap<String, serde_json::Value>,
    /// When it was first discovered
    pub discovered_at: chrono::DateTime<chrono::Utc>,
    /// Last time it was observed
    pub last_seen: chrono::DateTime<chrono::Utc>,
}

impl TrainingEngine {
    /// Create a new training engine
    pub async fn new(config: &MLConfig) -> Result<Self> {
        info!("Initializing training engine for incremental learning");

        let feedback_processor = FeedbackProcessor::new();
        let pattern_learner = PatternLearner::new(0.7); // 70% confidence threshold

        Ok(Self {
            config: config.clone(),
            training_state: RwLock::new(TrainingState::default()),
            training_history: RwLock::new(TrainingHistory::default()),
            feedback_processor,
            pattern_learner,
        })
    }

    /// Add training examples for incremental learning
    pub async fn add_training_examples(&self, examples: &[TrainingExample]) -> Result<()> {
        let mut state = self.training_state.write().await;
        
        for example in examples {
            // Add to training buffer
            state.training_buffer.push(example.clone());
            
            // If buffer is large enough, trigger learning
            if state.training_buffer.len() >= self.config.batch_size {
                // Move some examples to validation set
                let validation_size = state.training_buffer.len() / 5; // 20% for validation
                for _ in 0..validation_size {
                    if let Some(example) = state.training_buffer.pop() {
                        state.validation_buffer.push(example);
                    }
                }
            }
        }

        debug!("Added {} training examples. Buffer size: {}", examples.len(), state.training_buffer.len());
        Ok(())
    }

    /// Perform incremental training
    pub async fn train_incremental(&self, examples: &[TrainingExample]) -> Result<TrainingResult> {
        info!("Starting incremental training with {} examples", examples.len());
        let start_time = std::time::Instant::now();

        // Add examples to training buffer
        self.add_training_examples(examples).await?;

        // Check if we have enough examples to train
        let (training_examples, validation_examples) = {
            let mut state = self.training_state.write().await;
            if state.training_buffer.len() < self.config.batch_size / 2 {
                // Not enough examples yet
                return Ok(TrainingResult {
                    accuracy: state.current_metrics.training_accuracy,
                    loss: state.current_metrics.training_loss,
                    training_time_seconds: start_time.elapsed().as_secs_f64(),
                    examples_processed: examples.len(),
                });
            }

            state.is_training = true;
            let training_examples = state.training_buffer.clone();
            let validation_examples = state.validation_buffer.clone();
            state.training_buffer.clear();
            
            (training_examples, validation_examples)
        };

        // Perform training
        let result = self.perform_training_step(&training_examples, &validation_examples).await?;

        // Update training state
        {
            let mut state = self.training_state.write().await;
            state.current_epoch += 1;
            state.current_metrics = TrainingMetrics {
                training_accuracy: result.accuracy,
                training_loss: result.loss,
                validation_accuracy: result.accuracy, // Simplified - would calculate separately
                validation_loss: result.loss,
                learning_rate: state.learning_rate as f64,
                examples_count: training_examples.len(),
                training_time_seconds: result.training_time_seconds,
            };
            state.is_training = false;
        }

        // Update training history
        {
            let mut history = self.training_history.write().await;
            history.sessions_completed += 1;
            history.total_examples_processed += training_examples.len() as u64;
            
            if result.accuracy > history.best_accuracy {
                history.best_accuracy = result.accuracy;
            }

            history.metrics_history.push(TimestampedMetrics {
                timestamp: chrono::Utc::now(),
                metrics: {
                    let state = self.training_state.read().await;
                    state.current_metrics.clone()
                },
                epoch: {
                    let state = self.training_state.read().await;
                    state.current_epoch
                },
            });

            history.learning_curve.push(LearningCurvePoint {
                epoch: {
                    let state = self.training_state.read().await;
                    state.current_epoch
                },
                training_loss: result.loss,
                validation_loss: result.loss, // Simplified
                training_accuracy: result.accuracy,
                validation_accuracy: result.accuracy, // Simplified
            });
        }

        info!("Incremental training completed. Accuracy: {:.3}, Loss: {:.3}", result.accuracy, result.loss);
        Ok(result)
    }

    /// Add user feedback for learning
    pub async fn add_feedback(&self, feedback: UserFeedback) -> Result<()> {
        self.feedback_processor.add_feedback(feedback).await?;
        
        // Process feedback if buffer is large enough
        let feedback_count = self.feedback_processor.get_feedback_count().await;
        if feedback_count >= 10 { // Process feedback every 10 entries
            self.process_feedback_batch().await?;
        }
        
        Ok(())
    }

    /// Learn new patterns from examples
    pub async fn discover_patterns(&self, examples: &[TrainingExample]) -> Result<Vec<DiscoveredPattern>> {
        self.pattern_learner.discover_patterns(examples).await
    }

    /// Get current training metrics
    pub async fn get_current_metrics(&self) -> TrainingMetrics {
        let state = self.training_state.read().await;
        state.current_metrics.clone()
    }

    /// Get training history
    pub async fn get_training_history(&self) -> TrainingHistory {
        self.training_history.read().await.clone()
    }

    /// Save training state to disk
    pub async fn save_training_state(&self, path: &Path) -> Result<()> {
        let history = self.get_training_history().await;
        let json = serde_json::to_string_pretty(&history)?;
        tokio::fs::write(path, json).await?;
        info!("Training state saved to: {}", path.display());
        Ok(())
    }

    /// Load training state from disk
    pub async fn load_training_state(&self, path: &Path) -> Result<()> {
        let content = tokio::fs::read_to_string(path).await?;
        let history: TrainingHistory = serde_json::from_str(&content)?;
        
        {
            let mut current_history = self.training_history.write().await;
            *current_history = history;
        }
        
        info!("Training state loaded from: {}", path.display());
        Ok(())
    }

    /// Perform a training step
    async fn perform_training_step(&self, training_examples: &[TrainingExample], validation_examples: &[TrainingExample]) -> Result<TrainingResult> {
        // Mock training implementation
        // In a real implementation, this would:
        // 1. Convert examples to model input format
        // 2. Perform gradient descent or other optimization
        // 3. Update model weights
        // 4. Calculate metrics on validation set

        let start_time = std::time::Instant::now();
        
        // Simulate training computation
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        // Mock accuracy improvement based on number of examples
        let accuracy_improvement = (training_examples.len() as f64 * 0.001).min(0.1);
        let current_accuracy = {
            let state = self.training_state.read().await;
            state.current_metrics.training_accuracy
        };
        let new_accuracy = (current_accuracy + accuracy_improvement).min(1.0);
        
        // Mock loss calculation
        let loss = 1.0 - new_accuracy + (rand::random::<f64>() * 0.1 - 0.05); // Add some noise
        
        let duration = start_time.elapsed().as_secs_f64();
        
        Ok(TrainingResult {
            accuracy: new_accuracy,
            loss: loss.max(0.0),
            training_time_seconds: duration,
            examples_processed: training_examples.len(),
        })
    }

    /// Process a batch of feedback
    async fn process_feedback_batch(&self) -> Result<()> {
        let feedback_batch = self.feedback_processor.get_and_clear_feedback().await;
        
        for feedback in feedback_batch {
            // Process each type of feedback
            match feedback.feedback_type {
                FeedbackType::Similarity => {
                    self.process_similarity_feedback(&feedback).await?;
                }
                FeedbackType::PatternRecognition => {
                    self.process_pattern_feedback(&feedback).await?;
                }
                FeedbackType::Recommendation => {
                    self.process_recommendation_feedback(&feedback).await?;
                }
                FeedbackType::SearchRelevance => {
                    self.process_search_feedback(&feedback).await?;
                }
                FeedbackType::CodeGeneration => {
                    self.process_code_generation_feedback(&feedback).await?;
                }
                FeedbackType::General => {
                    self.process_general_feedback(&feedback).await?;
                }
            }
        }

        Ok(())
    }

    /// Process similarity feedback
    async fn process_similarity_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would adjust similarity weights
        debug!("Processing similarity feedback: {:?}", feedback.rating);
        Ok(())
    }

    /// Process pattern recognition feedback
    async fn process_pattern_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would update pattern recognition models
        debug!("Processing pattern feedback: {:?}", feedback.rating);
        Ok(())
    }

    /// Process recommendation feedback
    async fn process_recommendation_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would improve recommendation algorithms
        debug!("Processing recommendation feedback: {:?}", feedback.rating);
        Ok(())
    }

    /// Process search relevance feedback
    async fn process_search_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would adjust search ranking
        debug!("Processing search feedback: {:?}", feedback.rating);
        Ok(())
    }

    /// Process code generation feedback
    async fn process_code_generation_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would improve code generation quality
        debug!("Processing code generation feedback: {:?}", feedback.rating);
        Ok(())
    }

    /// Process general feedback
    async fn process_general_feedback(&self, feedback: &UserFeedback) -> Result<()> {
        // In a real implementation, this would apply general improvements
        debug!("Processing general feedback: {:?}", feedback.rating);
        Ok(())
    }
}

impl FeedbackProcessor {
    /// Create a new feedback processor
    fn new() -> Self {
        let mut feedback_weights = HashMap::new();
        feedback_weights.insert(FeedbackType::Similarity, 1.0);
        feedback_weights.insert(FeedbackType::PatternRecognition, 1.2);
        feedback_weights.insert(FeedbackType::Recommendation, 0.8);
        feedback_weights.insert(FeedbackType::SearchRelevance, 1.0);
        feedback_weights.insert(FeedbackType::CodeGeneration, 1.5);
        feedback_weights.insert(FeedbackType::General, 0.5);

        Self {
            feedback_buffer: RwLock::new(Vec::new()),
            feedback_weights,
        }
    }

    /// Add feedback to the buffer
    async fn add_feedback(&self, feedback: UserFeedback) -> Result<()> {
        let mut buffer = self.feedback_buffer.write().await;
        buffer.push(feedback);
        Ok(())
    }

    /// Get feedback count
    async fn get_feedback_count(&self) -> usize {
        let buffer = self.feedback_buffer.read().await;
        buffer.len()
    }

    /// Get and clear feedback buffer
    async fn get_and_clear_feedback(&self) -> Vec<UserFeedback> {
        let mut buffer = self.feedback_buffer.write().await;
        std::mem::take(&mut *buffer)
    }
}

impl PatternLearner {
    /// Create a new pattern learner
    fn new(confidence_threshold: f32) -> Self {
        Self {
            pattern_buffer: RwLock::new(Vec::new()),
            pattern_frequency: RwLock::new(HashMap::new()),
            confidence_threshold,
        }
    }

    /// Discover patterns from training examples
    async fn discover_patterns(&self, examples: &[TrainingExample]) -> Result<Vec<DiscoveredPattern>> {
        let mut discovered = Vec::new();
        let now = chrono::Utc::now();

        // Group examples by task type
        let mut task_groups: HashMap<String, Vec<&TrainingExample>> = HashMap::new();
        for example in examples {
            task_groups.entry(example.task_type.clone())
                .or_insert_with(Vec::new)
                .push(example);
        }

        // Analyze patterns within each task type
        for (task_type, task_examples) in task_groups {
            if task_examples.len() < 3 {
                continue; // Need at least 3 examples to identify a pattern
            }

            // Simple pattern discovery based on common substrings
            let common_patterns = self.find_common_patterns(&task_examples);
            
            for (pattern_text, frequency) in common_patterns {
                if frequency as f32 / task_examples.len() as f32 >= self.confidence_threshold {
                    let pattern_id = format!("{}_{}", task_type, uuid::Uuid::new_v4());
                    
                    // Update frequency tracking
                    {
                        let mut freq_map = self.pattern_frequency.write().await;
                        *freq_map.entry(pattern_text.clone()).or_insert(0) += frequency;
                    }

                    let pattern = DiscoveredPattern {
                        id: pattern_id,
                        name: format!("{} pattern: {}", task_type, pattern_text),
                        confidence: frequency as f32 / task_examples.len() as f32,
                        frequency,
                        examples: task_examples.iter()
                            .filter(|ex| ex.input_text.contains(&pattern_text) || ex.expected_output.contains(&pattern_text))
                            .map(|ex| ex.input_text.clone())
                            .take(5) // Keep up to 5 examples
                            .collect(),
                        metadata: {
                            let mut metadata = HashMap::new();
                            metadata.insert("task_type".to_string(), serde_json::Value::String(task_type.clone()));
                            metadata.insert("pattern_text".to_string(), serde_json::Value::String(pattern_text));
                            metadata
                        },
                        discovered_at: now,
                        last_seen: now,
                    };

                    discovered.push(pattern);
                }
            }
        }

        // Add to pattern buffer
        {
            let mut buffer = self.pattern_buffer.write().await;
            buffer.extend(discovered.clone());
        }

        Ok(discovered)
    }

    /// Find common patterns in examples
    fn find_common_patterns(&self, examples: &[&TrainingExample]) -> HashMap<String, u64> {
        let mut pattern_counts = HashMap::new();

        // Extract common keywords/phrases
        for example in examples {
            let text = format!("{} {}", example.input_text, example.expected_output);
            let words: Vec<&str> = text.split_whitespace().collect();
            
            // Look for 2-3 word phrases
            for window_size in 2..=3 {
                for window in words.windows(window_size) {
                    let phrase = window.join(" ");
                    if phrase.len() > 5 { // Ignore very short phrases
                        *pattern_counts.entry(phrase).or_insert(0) += 1;
                    }
                }
            }
        }

        // Filter out patterns that appear only once
        pattern_counts.retain(|_, count| *count > 1);
        pattern_counts
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    async fn create_test_training_engine() -> (TrainingEngine, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        
        let config = MLConfig {
            models_path: temp_dir.path().join("models"),
            batch_size: 5,
            enable_incremental_learning: true,
            ..Default::default()
        };
        
        let engine = TrainingEngine::new(&config).await.unwrap();
        (engine, temp_dir)
    }

    #[tokio::test]
    async fn test_training_engine_initialization() {
        let (_engine, _temp_dir) = create_test_training_engine().await;
        // Test passes if no panic occurs during initialization
    }

    #[tokio::test]
    async fn test_add_training_examples() {
        let (engine, _temp_dir) = create_test_training_engine().await;
        
        let examples = vec![
            TrainingExample {
                input_text: "Create a React component".to_string(),
                expected_output: "function Component() { return <div>Hello</div>; }".to_string(),
                task_type: "code_generation".to_string(),
                metadata: HashMap::new(),
            },
        ];

        engine.add_training_examples(&examples).await.unwrap();
        
        // Training buffer should contain the example
        let state = engine.training_state.read().await;
        assert_eq!(state.training_buffer.len(), 1);
    }

    #[tokio::test]
    async fn test_incremental_training() {
        let (engine, _temp_dir) = create_test_training_engine().await;
        
        let examples = vec![
            TrainingExample {
                input_text: "Create a React component".to_string(),
                expected_output: "function Component() { return <div>Hello</div>; }".to_string(),
                task_type: "code_generation".to_string(),
                metadata: HashMap::new(),
            },
            TrainingExample {
                input_text: "Create a Vue component".to_string(),
                expected_output: "<template><div>Hello</div></template>".to_string(),
                task_type: "code_generation".to_string(),
                metadata: HashMap::new(),
            },
        ];

        let result = engine.train_incremental(&examples).await.unwrap();
        
        assert!(result.accuracy >= 0.0 && result.accuracy <= 1.0);
        assert!(result.loss >= 0.0);
        assert_eq!(result.examples_processed, examples.len());
    }

    #[tokio::test]
    async fn test_user_feedback() {
        let (engine, _temp_dir) = create_test_training_engine().await;
        
        let feedback = UserFeedback {
            id: "test_feedback_1".to_string(),
            feedback_type: FeedbackType::CodeGeneration,
            context: FeedbackContext {
                query: "Create a React component".to_string(),
                result: "function Component() {}".to_string(),
                context_data: HashMap::new(),
            },
            rating: Some(0.8),
            correction: None,
            timestamp: chrono::Utc::now(),
            metadata: HashMap::new(),
        };

        engine.add_feedback(feedback).await.unwrap();
        
        let feedback_count = engine.feedback_processor.get_feedback_count().await;
        assert_eq!(feedback_count, 1);
    }

    #[tokio::test]
    async fn test_pattern_discovery() {
        let (engine, _temp_dir) = create_test_training_engine().await;
        
        let examples = vec![
            TrainingExample {
                input_text: "Create React component for button".to_string(),
                expected_output: "function Button() { return <button>Click me</button>; }".to_string(),
                task_type: "react_component".to_string(),
                metadata: HashMap::new(),
            },
            TrainingExample {
                input_text: "Create React component for input".to_string(),
                expected_output: "function Input() { return <input type='text' />; }".to_string(),
                task_type: "react_component".to_string(),
                metadata: HashMap::new(),
            },
            TrainingExample {
                input_text: "Create React component for header".to_string(),
                expected_output: "function Header() { return <h1>Title</h1>; }".to_string(),
                task_type: "react_component".to_string(),
                metadata: HashMap::new(),
            },
        ];

        let patterns = engine.discover_patterns(&examples).await.unwrap();
        
        // Should discover patterns related to React components
        assert!(!patterns.is_empty());
        assert!(patterns.iter().any(|p| p.name.contains("React") || p.name.contains("react")));
    }

    #[tokio::test]
    async fn test_training_history() {
        let (engine, _temp_dir) = create_test_training_engine().await;
        
        let examples = vec![
            TrainingExample {
                input_text: "test input".to_string(),
                expected_output: "test output".to_string(),
                task_type: "test_task".to_string(),
                metadata: HashMap::new(),
            },
        ];

        // Perform training
        let _result = engine.train_incremental(&examples).await.unwrap();
        
        let history = engine.get_training_history().await;
        assert_eq!(history.sessions_completed, 1);
        assert_eq!(history.total_examples_processed, 1);
        assert!(!history.metrics_history.is_empty());
        assert!(!history.learning_curve.is_empty());
    }

    #[tokio::test]
    async fn test_save_and_load_training_state() {
        let (engine, temp_dir) = create_test_training_engine().await;
        
        // Train with some examples to create state
        let examples = vec![
            TrainingExample {
                input_text: "test".to_string(),
                expected_output: "test".to_string(),
                task_type: "test".to_string(),
                metadata: HashMap::new(),
            },
        ];
        let _result = engine.train_incremental(&examples).await.unwrap();
        
        // Save state
        let state_path = temp_dir.path().join("training_state.json");
        engine.save_training_state(&state_path).await.unwrap();
        
        // Create new engine and load state
        let config = MLConfig {
            models_path: temp_dir.path().join("models"),
            batch_size: 5,
            enable_incremental_learning: true,
            ..Default::default()
        };
        let new_engine = TrainingEngine::new(&config).await.unwrap();
        new_engine.load_training_state(&state_path).await.unwrap();
        
        let loaded_history = new_engine.get_training_history().await;
        assert_eq!(loaded_history.sessions_completed, 1);
    }
}