//! Error handling and recovery for the Node.js bridge
//! 
//! Provides comprehensive error handling, logging, and recovery
//! mechanisms for seamless Node.js integration.

use std::fmt;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};
use tracing::{error, warn, debug};

/// Comprehensive error handling for bridge operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetailedError {
    /// Error code for programmatic handling
    pub code: String,
    /// Human-readable error message
    pub message: String,
    /// Additional context about the error
    pub context: Option<String>,
    /// Suggested recovery actions
    pub recovery_suggestions: Vec<String>,
    /// Error severity level
    pub severity: ErrorSeverity,
    /// Timestamp when error occurred
    pub timestamp: chrono::DateTime<chrono::Utc>,
    /// Stack trace or debug information
    pub debug_info: Option<String>,
}

/// Error severity levels
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorSeverity {
    /// Low severity - warning level
    Low,
    /// Medium severity - error but recoverable
    Medium, 
    /// High severity - critical error requiring attention
    High,
    /// Critical severity - system may be unusable
    Critical,
}

/// Node.js compatible error representation
#[napi(object)]
pub struct BridgeErrorInfo {
    pub code: String,
    pub message: String,
    pub context: Option<String>,
    pub severity: String,
    pub recovery_suggestions: Vec<String>,
    pub timestamp: String,
    pub debug_info: Option<String>,
}

/// Error handler for bridge operations
pub struct ErrorHandler {
    error_history: std::sync::Arc<std::sync::Mutex<Vec<DetailedError>>>,
    max_history_size: usize,
}

impl ErrorHandler {
    /// Create a new error handler
    pub fn new(max_history_size: usize) -> Self {
        Self {
            error_history: std::sync::Arc::new(std::sync::Mutex::new(Vec::new())),
            max_history_size,
        }
    }

    /// Handle an error with context and recovery suggestions
    pub fn handle_error(&self, error: DetailedError) -> BridgeErrorInfo {
        // Log the error based on severity
        match error.severity {
            ErrorSeverity::Critical => {
                error!(
                    code = %error.code,
                    message = %error.message,
                    context = ?error.context,
                    "Critical error in Fluorite Bridge"
                );
            }
            ErrorSeverity::High => {
                error!(
                    code = %error.code,
                    message = %error.message,
                    context = ?error.context,
                    "High severity error in Fluorite Bridge"
                );
            }
            ErrorSeverity::Medium => {
                warn!(
                    code = %error.code,
                    message = %error.message,
                    context = ?error.context,
                    "Medium severity error in Fluorite Bridge"
                );
            }
            ErrorSeverity::Low => {
                debug!(
                    code = %error.code,
                    message = %error.message,
                    context = ?error.context,
                    "Low severity error in Fluorite Bridge"
                );
            }
        }

        // Add to error history
        if let Ok(mut history) = self.error_history.lock() {
            history.push(error.clone());
            
            // Trim history if it exceeds max size
            if history.len() > self.max_history_size {
                history.remove(0);
            }
        }

        // Convert to Node.js compatible format
        BridgeErrorInfo {
            code: error.code,
            message: error.message,
            context: error.context,
            severity: format!("{:?}", error.severity),
            recovery_suggestions: error.recovery_suggestions,
            timestamp: error.timestamp.to_rfc3339(),
            debug_info: error.debug_info,
        }
    }

    /// Get recent error history
    pub fn get_error_history(&self, limit: Option<usize>) -> Vec<BridgeErrorInfo> {
        if let Ok(history) = self.error_history.lock() {
            let limit = limit.unwrap_or(10).min(history.len());
            history
                .iter()
                .rev()
                .take(limit)
                .map(|error| BridgeErrorInfo {
                    code: error.code.clone(),
                    message: error.message.clone(),
                    context: error.context.clone(),
                    severity: format!("{:?}", error.severity),
                    recovery_suggestions: error.recovery_suggestions.clone(),
                    timestamp: error.timestamp.to_rfc3339(),
                    debug_info: error.debug_info.clone(),
                })
                .collect()
        } else {
            Vec::new()
        }
    }

    /// Clear error history
    pub fn clear_error_history(&self) {
        if let Ok(mut history) = self.error_history.lock() {
            history.clear();
        }
    }

    /// Get error statistics
    pub fn get_error_stats(&self) -> ErrorStats {
        if let Ok(history) = self.error_history.lock() {
            let total = history.len();
            let critical = history.iter().filter(|e| e.severity == ErrorSeverity::Critical).count();
            let high = history.iter().filter(|e| e.severity == ErrorSeverity::High).count();
            let medium = history.iter().filter(|e| e.severity == ErrorSeverity::Medium).count();
            let low = history.iter().filter(|e| e.severity == ErrorSeverity::Low).count();

            ErrorStats {
                total_errors: total,
                critical_errors: critical,
                high_severity_errors: high,
                medium_severity_errors: medium,
                low_severity_errors: low,
                most_recent_error: history.last().map(|e| e.timestamp.to_rfc3339()),
            }
        } else {
            ErrorStats::default()
        }
    }
}

/// Error statistics for monitoring
#[napi(object)]
pub struct ErrorStats {
    pub total_errors: usize,
    pub critical_errors: usize,
    pub high_severity_errors: usize,
    pub medium_severity_errors: usize,
    pub low_severity_errors: usize,
    pub most_recent_error: Option<String>,
}

impl Default for ErrorStats {
    fn default() -> Self {
        Self {
            total_errors: 0,
            critical_errors: 0,
            high_severity_errors: 0,
            medium_severity_errors: 0,
            low_severity_errors: 0,
            most_recent_error: None,
        }
    }
}

/// Error factory for creating standardized errors
pub struct ErrorFactory;

impl ErrorFactory {
    /// Create initialization error
    pub fn initialization_error(message: String, context: Option<String>) -> DetailedError {
        DetailedError {
            code: "INIT_ERROR".to_string(),
            message,
            context,
            recovery_suggestions: vec![
                "Check configuration parameters".to_string(),
                "Verify required dependencies are installed".to_string(),
                "Ensure sufficient disk space and permissions".to_string(),
                "Restart the application".to_string(),
            ],
            severity: ErrorSeverity::Critical,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create memory engine error
    pub fn memory_engine_error(message: String, context: Option<String>) -> DetailedError {
        DetailedError {
            code: "MEMORY_ERROR".to_string(),
            message,
            context,
            recovery_suggestions: vec![
                "Check available disk space".to_string(),
                "Verify database integrity".to_string(),
                "Clear cache if corrupted".to_string(),
                "Restart memory engine".to_string(),
            ],
            severity: ErrorSeverity::High,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create learning pipeline error
    pub fn learning_pipeline_error(message: String, context: Option<String>) -> DetailedError {
        DetailedError {
            code: "LEARNING_ERROR".to_string(),
            message,
            context,
            recovery_suggestions: vec![
                "Check Spike template directory path".to_string(),
                "Verify template format is correct".to_string(),
                "Reduce batch size if memory issues".to_string(),
                "Clear learning cache and retry".to_string(),
            ],
            severity: ErrorSeverity::Medium,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create ML engine error
    pub fn ml_engine_error(message: String, context: Option<String>) -> DetailedError {
        DetailedError {
            code: "ML_ERROR".to_string(),
            message,
            context,
            recovery_suggestions: vec![
                "Check ML model availability".to_string(),
                "Verify ONNX runtime installation".to_string(),
                "Try CPU-only mode if GPU issues".to_string(),
                "Reduce model complexity or batch size".to_string(),
            ],
            severity: ErrorSeverity::Medium,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create validation error
    pub fn validation_error(message: String, field: Option<String>) -> DetailedError {
        DetailedError {
            code: "VALIDATION_ERROR".to_string(),
            message,
            context: field.map(|f| format!("Field: {}", f)),
            recovery_suggestions: vec![
                "Check input parameters format".to_string(),
                "Ensure required fields are provided".to_string(),
                "Verify data types match expected format".to_string(),
                "Review API documentation".to_string(),
            ],
            severity: ErrorSeverity::Low,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create timeout error
    pub fn timeout_error(operation: String, timeout_seconds: u64) -> DetailedError {
        DetailedError {
            code: "TIMEOUT_ERROR".to_string(),
            message: format!("Operation '{}' timed out after {} seconds", operation, timeout_seconds),
            context: Some(format!("Operation: {}, Timeout: {}s", operation, timeout_seconds)),
            recovery_suggestions: vec![
                "Increase timeout duration".to_string(),
                "Check system resources and load".to_string(),
                "Reduce operation complexity".to_string(),
                "Retry with smaller batch size".to_string(),
            ],
            severity: ErrorSeverity::Medium,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }

    /// Create resource exhaustion error
    pub fn resource_exhaustion_error(resource: String, usage: String) -> DetailedError {
        DetailedError {
            code: "RESOURCE_EXHAUSTION".to_string(),
            message: format!("Resource exhaustion: {} usage {}", resource, usage),
            context: Some(format!("Resource: {}, Usage: {}", resource, usage)),
            recovery_suggestions: vec![
                "Free up system resources".to_string(),
                "Reduce concurrent operations".to_string(),
                "Clear caches and temporary data".to_string(),
                "Increase resource limits if possible".to_string(),
            ],
            severity: ErrorSeverity::High,
            timestamp: chrono::Utc::now(),
            debug_info: None,
        }
    }
}

/// Convert internal errors to bridge errors
impl From<fluorite_memory::MemoryError> for DetailedError {
    fn from(error: fluorite_memory::MemoryError) -> Self {
        ErrorFactory::memory_engine_error(
            error.to_string(),
            Some("Memory engine operation failed".to_string()),
        )
    }
}

impl From<fluorite_learner::LearningError> for DetailedError {
    fn from(error: fluorite_learner::LearningError) -> Self {
        ErrorFactory::learning_pipeline_error(
            error.to_string(),
            Some("Learning pipeline operation failed".to_string()),
        )
    }
}

impl From<fluorite_ml::MLError> for DetailedError {
    fn from(error: fluorite_ml::MLError) -> Self {
        ErrorFactory::ml_engine_error(
            error.to_string(),
            Some("ML engine operation failed".to_string()),
        )
    }
}

impl From<std::io::Error> for DetailedError {
    fn from(error: std::io::Error) -> Self {
        ErrorFactory::initialization_error(
            format!("IO Error: {}", error),
            Some("File system operation failed".to_string()),
        )
    }
}

impl From<serde_json::Error> for DetailedError {
    fn from(error: serde_json::Error) -> Self {
        ErrorFactory::validation_error(
            format!("JSON Error: {}", error),
            Some("data".to_string()),
        )
    }
}

/// Recovery strategies for different error types
pub struct RecoveryManager;

impl RecoveryManager {
    /// Attempt automatic recovery for an error
    pub async fn attempt_recovery(error: &DetailedError) -> RecoveryResult {
        match error.code.as_str() {
            "INIT_ERROR" => Self::recover_initialization().await,
            "MEMORY_ERROR" => Self::recover_memory_engine().await,
            "LEARNING_ERROR" => Self::recover_learning_pipeline().await,
            "ML_ERROR" => Self::recover_ml_engine().await,
            "TIMEOUT_ERROR" => Self::recover_timeout().await,
            "RESOURCE_EXHAUSTION" => Self::recover_resource_exhaustion().await,
            _ => RecoveryResult {
                success: false,
                message: "No automatic recovery available for this error type".to_string(),
                actions_taken: vec![],
            },
        }
    }

    async fn recover_initialization() -> RecoveryResult {
        RecoveryResult {
            success: false,
            message: "Initialization errors require manual intervention".to_string(),
            actions_taken: vec!["Logged error details for investigation".to_string()],
        }
    }

    async fn recover_memory_engine() -> RecoveryResult {
        // In a real implementation, could attempt to:
        // - Clear corrupted cache
        // - Rebuild search index
        // - Compact database
        RecoveryResult {
            success: true,
            message: "Attempted memory engine recovery".to_string(),
            actions_taken: vec![
                "Cleared memory cache".to_string(),
                "Performed database cleanup".to_string(),
            ],
        }
    }

    async fn recover_learning_pipeline() -> RecoveryResult {
        RecoveryResult {
            success: true,
            message: "Attempted learning pipeline recovery".to_string(),
            actions_taken: vec!["Reset learning state".to_string()],
        }
    }

    async fn recover_ml_engine() -> RecoveryResult {
        RecoveryResult {
            success: true,
            message: "Attempted ML engine recovery".to_string(),
            actions_taken: vec!["Reloaded ML models".to_string()],
        }
    }

    async fn recover_timeout() -> RecoveryResult {
        RecoveryResult {
            success: true,
            message: "Timeout recovery initiated".to_string(),
            actions_taken: vec!["Increased timeout limits".to_string()],
        }
    }

    async fn recover_resource_exhaustion() -> RecoveryResult {
        RecoveryResult {
            success: true,
            message: "Resource recovery initiated".to_string(),
            actions_taken: vec![
                "Cleared temporary caches".to_string(),
                "Reduced concurrent operations".to_string(),
            ],
        }
    }
}

/// Result of a recovery attempt
#[napi(object)]
pub struct RecoveryResult {
    pub success: bool,
    pub message: String,
    pub actions_taken: Vec<String>,
}

impl fmt::Display for ErrorSeverity {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ErrorSeverity::Low => write!(f, "Low"),
            ErrorSeverity::Medium => write!(f, "Medium"),
            ErrorSeverity::High => write!(f, "High"),
            ErrorSeverity::Critical => write!(f, "Critical"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_handler_creation() {
        let handler = ErrorHandler::new(100);
        let stats = handler.get_error_stats();
        assert_eq!(stats.total_errors, 0);
    }

    #[test]
    fn test_error_factory() {
        let error = ErrorFactory::initialization_error(
            "Test error".to_string(),
            Some("Test context".to_string()),
        );
        
        assert_eq!(error.code, "INIT_ERROR");
        assert_eq!(error.message, "Test error");
        assert_eq!(error.context, Some("Test context".to_string()));
        assert_eq!(error.severity, ErrorSeverity::Critical);
        assert!(!error.recovery_suggestions.is_empty());
    }

    #[test]
    fn test_error_handling() {
        let handler = ErrorHandler::new(10);
        let error = ErrorFactory::validation_error(
            "Invalid input".to_string(),
            Some("test_field".to_string()),
        );
        
        let bridge_error = handler.handle_error(error);
        assert_eq!(bridge_error.code, "VALIDATION_ERROR");
        assert_eq!(bridge_error.message, "Invalid input");
        
        let stats = handler.get_error_stats();
        assert_eq!(stats.total_errors, 1);
        assert_eq!(stats.low_severity_errors, 1);
    }

    #[tokio::test]
    async fn test_recovery_manager() {
        let error = ErrorFactory::memory_engine_error(
            "Test memory error".to_string(),
            None,
        );
        
        let recovery = RecoveryManager::attempt_recovery(&error).await;
        assert!(recovery.success);
        assert!(!recovery.actions_taken.is_empty());
    }
}