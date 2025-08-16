//! MCP Protocol Adapter
//! 
//! Handles integration with the Model Context Protocol (MCP) used by
//! the existing fluorite-mcp Node.js system. Provides message routing,
//! protocol translation, and request/response handling.

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use tokio::sync::{mpsc, oneshot};
use tracing::{info, debug, warn, error};
use uuid::Uuid;

/// MCP message types supported by the adapter
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MCPMessage {
    /// Request for memory operations
    MemoryRequest {
        id: String,
        method: String,
        params: serde_json::Value,
    },
    /// Response to memory operations
    MemoryResponse {
        id: String,
        result: Option<serde_json::Value>,
        error: Option<MCPError>,
    },
    /// Learning pipeline operations
    LearningRequest {
        id: String,
        operation: String,
        parameters: serde_json::Value,
    },
    /// Learning pipeline response
    LearningResponse {
        id: String,
        result: serde_json::Value,
        status: String,
    },
    /// ML engine operations
    MLRequest {
        id: String,
        operation: String,
        data: serde_json::Value,
    },
    /// ML engine response
    MLResponse {
        id: String,
        result: serde_json::Value,
        metrics: Option<serde_json::Value>,
    },
    /// Notification messages (one-way)
    Notification {
        method: String,
        params: serde_json::Value,
    },
    /// Heartbeat for connection monitoring
    Heartbeat {
        timestamp: chrono::DateTime<chrono::Utc>,
        status: String,
    },
}

/// MCP error structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

/// Protocol adapter for MCP integration
#[derive(Debug)]
pub struct ProtocolAdapter {
    /// Channel for incoming messages
    message_tx: Option<mpsc::UnboundedSender<MCPMessage>>,
    message_rx: Option<mpsc::UnboundedReceiver<MCPMessage>>,
    
    /// Pending requests waiting for responses
    pending_requests: HashMap<String, oneshot::Sender<MCPMessage>>,
    
    /// Connection state
    connection_state: ConnectionState,
    
    /// Protocol configuration
    config: ProtocolConfig,
    
    /// Message handler registry
    handlers: HashMap<String, Box<dyn MessageHandler + Send + Sync>>,
}

/// Connection state with the MCP server
#[derive(Debug, Clone, PartialEq)]
pub enum ConnectionState {
    Disconnected,
    Connecting,
    Connected,
    Error(String),
}

/// Protocol configuration
#[derive(Debug, Clone)]
pub struct ProtocolConfig {
    /// Maximum message size in bytes
    pub max_message_size: usize,
    /// Request timeout in seconds
    pub request_timeout: u64,
    /// Heartbeat interval in seconds
    pub heartbeat_interval: u64,
    /// Enable message compression
    pub enable_compression: bool,
    /// Enable message encryption
    pub enable_encryption: bool,
}

impl Default for ProtocolConfig {
    fn default() -> Self {
        Self {
            max_message_size: 1024 * 1024, // 1MB
            request_timeout: 30,
            heartbeat_interval: 60,
            enable_compression: true,
            enable_encryption: false,
        }
    }
}

/// Message handler trait
pub trait MessageHandler {
    /// Handle an incoming MCP message
    fn handle_message(&self, message: &MCPMessage) -> Result<Option<MCPMessage>, ProtocolError>;
    
    /// Get handler name for registration
    fn name(&self) -> &str;
}

/// Protocol adapter errors
#[derive(Debug, thiserror::Error)]
pub enum ProtocolError {
    #[error("Connection error: {0}")]
    Connection(String),
    
    #[error("Message serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Message too large: {size} bytes (max: {max})")]
    MessageTooLarge { size: usize, max: usize },
    
    #[error("Request timeout: {id}")]
    RequestTimeout { id: String },
    
    #[error("Invalid message format: {0}")]
    InvalidMessage(String),
    
    #[error("Handler not found: {method}")]
    HandlerNotFound { method: String },
    
    #[error("Protocol violation: {0}")]
    ProtocolViolation(String),
}

impl ProtocolAdapter {
    /// Create a new protocol adapter
    pub fn new() -> Self {
        let (message_tx, message_rx) = mpsc::unbounded_channel();
        
        Self {
            message_tx: Some(message_tx),
            message_rx: Some(message_rx),
            pending_requests: HashMap::new(),
            connection_state: ConnectionState::Disconnected,
            config: ProtocolConfig::default(),
            handlers: HashMap::new(),
        }
    }
    
    /// Create adapter with custom configuration
    pub fn with_config(config: ProtocolConfig) -> Self {
        let mut adapter = Self::new();
        adapter.config = config;
        adapter
    }
    
    /// Register a message handler
    pub fn register_handler(&mut self, handler: Box<dyn MessageHandler + Send + Sync>) {
        let name = handler.name().to_string();
        self.handlers.insert(name, handler);
        debug!("Registered MCP message handler: {}", handler.name());
    }
    
    /// Send a message and wait for response
    pub async fn send_request(&mut self, message: MCPMessage) -> Result<MCPMessage, ProtocolError> {
        let request_id = self.extract_message_id(&message)?;
        
        // Create a one-shot channel for the response
        let (response_tx, response_rx) = oneshot::channel();
        self.pending_requests.insert(request_id.clone(), response_tx);
        
        // Send the message
        self.send_message(message).await?;
        
        // Wait for response with timeout
        let timeout = tokio::time::Duration::from_secs(self.config.request_timeout);
        match tokio::time::timeout(timeout, response_rx).await {
            Ok(Ok(response)) => Ok(response),
            Ok(Err(_)) => {
                self.pending_requests.remove(&request_id);
                Err(ProtocolError::RequestTimeout { id: request_id })
            }
            Err(_) => {
                self.pending_requests.remove(&request_id);
                Err(ProtocolError::RequestTimeout { id: request_id })
            }
        }
    }
    
    /// Send a message without waiting for response
    pub async fn send_message(&self, message: MCPMessage) -> Result<(), ProtocolError> {
        // Validate message size
        let serialized = serde_json::to_vec(&message)?;
        if serialized.len() > self.config.max_message_size {
            return Err(ProtocolError::MessageTooLarge {
                size: serialized.len(),
                max: self.config.max_message_size,
            });
        }
        
        // Send through channel
        if let Some(ref tx) = self.message_tx {
            tx.send(message).map_err(|e| {
                ProtocolError::Connection(format!("Failed to send message: {}", e))
            })?;
        }
        
        Ok(())
    }
    
    /// Send a notification (one-way message)
    pub async fn send_notification(&self, method: String, params: serde_json::Value) -> Result<(), ProtocolError> {
        let message = MCPMessage::Notification { method, params };
        self.send_message(message).await
    }
    
    /// Process incoming messages
    pub async fn process_messages(&mut self) -> Result<(), ProtocolError> {
        if let Some(mut rx) = self.message_rx.take() {
            while let Some(message) = rx.recv().await {
                self.handle_incoming_message(message).await?;
            }
        }
        Ok(())
    }
    
    /// Handle an incoming message
    async fn handle_incoming_message(&mut self, message: MCPMessage) -> Result<(), ProtocolError> {
        debug!("Received MCP message: {:?}", message);
        
        // Check if this is a response to a pending request
        if let Ok(message_id) = self.extract_message_id(&message) {
            if let Some(response_tx) = self.pending_requests.remove(&message_id) {
                if response_tx.send(message).is_err() {
                    warn!("Failed to send response for request: {}", message_id);
                }
                return Ok(());
            }
        }
        
        // Handle with registered handlers
        let handler_name = self.get_handler_name(&message);
        if let Some(handler) = self.handlers.get(&handler_name) {
            match handler.handle_message(&message) {
                Ok(Some(response)) => {
                    self.send_message(response).await?;
                }
                Ok(None) => {
                    // No response needed
                }
                Err(e) => {
                    error!("Handler error for {}: {}", handler_name, e);
                    
                    // Send error response if this was a request
                    if let Ok(request_id) = self.extract_message_id(&message) {
                        let error_response = self.create_error_response(
                            request_id,
                            MCPError {
                                code: -32603,
                                message: e.to_string(),
                                data: None,
                            },
                        );
                        self.send_message(error_response).await?;
                    }
                }
            }
        } else {
            warn!("No handler found for message type: {}", handler_name);
            
            // Send method not found error if this was a request
            if let Ok(request_id) = self.extract_message_id(&message) {
                let error_response = self.create_error_response(
                    request_id,
                    MCPError {
                        code: -32601,
                        message: format!("Method not found: {}", handler_name),
                        data: None,
                    },
                );
                self.send_message(error_response).await?;
            }
        }
        
        Ok(())
    }
    
    /// Extract message ID for request/response matching
    fn extract_message_id(&self, message: &MCPMessage) -> Result<String, ProtocolError> {
        match message {
            MCPMessage::MemoryRequest { id, .. } => Ok(id.clone()),
            MCPMessage::MemoryResponse { id, .. } => Ok(id.clone()),
            MCPMessage::LearningRequest { id, .. } => Ok(id.clone()),
            MCPMessage::LearningResponse { id, .. } => Ok(id.clone()),
            MCPMessage::MLRequest { id, .. } => Ok(id.clone()),
            MCPMessage::MLResponse { id, .. } => Ok(id.clone()),
            _ => Err(ProtocolError::InvalidMessage("No ID found in message".to_string())),
        }
    }
    
    /// Get handler name for message routing
    fn get_handler_name(&self, message: &MCPMessage) -> String {
        match message {
            MCPMessage::MemoryRequest { method, .. } => format!("memory.{}", method),
            MCPMessage::LearningRequest { operation, .. } => format!("learning.{}", operation),
            MCPMessage::MLRequest { operation, .. } => format!("ml.{}", operation),
            MCPMessage::Notification { method, .. } => format!("notification.{}", method),
            MCPMessage::Heartbeat { .. } => "heartbeat".to_string(),
            _ => "unknown".to_string(),
        }
    }
    
    /// Create error response message
    fn create_error_response(&self, request_id: String, error: MCPError) -> MCPMessage {
        MCPMessage::MemoryResponse {
            id: request_id,
            result: None,
            error: Some(error),
        }
    }
    
    /// Start heartbeat monitoring
    pub async fn start_heartbeat(&self) -> Result<(), ProtocolError> {
        let interval = tokio::time::Duration::from_secs(self.config.heartbeat_interval);
        let tx = self.message_tx.clone();
        
        tokio::spawn(async move {
            let mut interval_timer = tokio::time::interval(interval);
            
            loop {
                interval_timer.tick().await;
                
                let heartbeat = MCPMessage::Heartbeat {
                    timestamp: chrono::Utc::now(),
                    status: "alive".to_string(),
                };
                
                if let Some(ref tx) = tx {
                    if tx.send(heartbeat).is_err() {
                        break; // Channel closed, exit heartbeat
                    }
                } else {
                    break;
                }
            }
        });
        
        Ok(())
    }
    
    /// Get connection state
    pub fn connection_state(&self) -> &ConnectionState {
        &self.connection_state
    }
    
    /// Set connection state
    pub fn set_connection_state(&mut self, state: ConnectionState) {
        self.connection_state = state;
        info!("MCP connection state changed to: {:?}", self.connection_state);
    }
    
    /// Create a memory request message
    pub fn create_memory_request(&self, method: String, params: serde_json::Value) -> MCPMessage {
        MCPMessage::MemoryRequest {
            id: Uuid::new_v4().to_string(),
            method,
            params,
        }
    }
    
    /// Create a learning request message
    pub fn create_learning_request(&self, operation: String, parameters: serde_json::Value) -> MCPMessage {
        MCPMessage::LearningRequest {
            id: Uuid::new_v4().to_string(),
            operation,
            parameters,
        }
    }
    
    /// Create an ML request message
    pub fn create_ml_request(&self, operation: String, data: serde_json::Value) -> MCPMessage {
        MCPMessage::MLRequest {
            id: Uuid::new_v4().to_string(),
            operation,
            data,
        }
    }
    
    /// Get protocol statistics
    pub fn get_statistics(&self) -> ProtocolStatistics {
        ProtocolStatistics {
            pending_requests: self.pending_requests.len(),
            registered_handlers: self.handlers.len(),
            connection_state: format!("{:?}", self.connection_state),
            max_message_size: self.config.max_message_size,
            request_timeout: self.config.request_timeout,
        }
    }
}

/// Protocol statistics for monitoring
#[derive(Debug, Serialize, Deserialize)]
pub struct ProtocolStatistics {
    pub pending_requests: usize,
    pub registered_handlers: usize,
    pub connection_state: String,
    pub max_message_size: usize,
    pub request_timeout: u64,
}

/// Example memory handler implementation
pub struct MemoryHandler;

impl MessageHandler for MemoryHandler {
    fn handle_message(&self, message: &MCPMessage) -> Result<Option<MCPMessage>, ProtocolError> {
        match message {
            MCPMessage::MemoryRequest { id, method, params } => {
                debug!("Handling memory request: {} with params: {:?}", method, params);
                
                // Create mock response
                let result = serde_json::json!({
                    "success": true,
                    "method": method,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                });
                
                Ok(Some(MCPMessage::MemoryResponse {
                    id: id.clone(),
                    result: Some(result),
                    error: None,
                }))
            }
            _ => Ok(None),
        }
    }
    
    fn name(&self) -> &str {
        "memory"
    }
}

/// Example learning handler implementation
pub struct LearningHandler;

impl MessageHandler for LearningHandler {
    fn handle_message(&self, message: &MCPMessage) -> Result<Option<MCPMessage>, ProtocolError> {
        match message {
            MCPMessage::LearningRequest { id, operation, parameters } => {
                debug!("Handling learning request: {} with params: {:?}", operation, parameters);
                
                let result = serde_json::json!({
                    "operation": operation,
                    "status": "completed",
                    "timestamp": chrono::Utc::now().to_rfc3339()
                });
                
                Ok(Some(MCPMessage::LearningResponse {
                    id: id.clone(),
                    result,
                    status: "success".to_string(),
                }))
            }
            _ => Ok(None),
        }
    }
    
    fn name(&self) -> &str {
        "learning"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_protocol_adapter_creation() {
        let adapter = ProtocolAdapter::new();
        assert_eq!(adapter.connection_state, ConnectionState::Disconnected);
        assert_eq!(adapter.pending_requests.len(), 0);
    }
    
    #[test]
    fn test_message_id_extraction() {
        let adapter = ProtocolAdapter::new();
        
        let message = MCPMessage::MemoryRequest {
            id: "test-123".to_string(),
            method: "get_chunk".to_string(),
            params: serde_json::json!({}),
        };
        
        let id = adapter.extract_message_id(&message).unwrap();
        assert_eq!(id, "test-123");
    }
    
    #[test]
    fn test_handler_registration() {
        let mut adapter = ProtocolAdapter::new();
        let handler = Box::new(MemoryHandler);
        
        adapter.register_handler(handler);
        assert_eq!(adapter.handlers.len(), 1);
        assert!(adapter.handlers.contains_key("memory"));
    }
    
    #[test]
    fn test_handler_name_mapping() {
        let adapter = ProtocolAdapter::new();
        
        let message = MCPMessage::MemoryRequest {
            id: "test".to_string(),
            method: "store".to_string(),
            params: serde_json::json!({}),
        };
        
        let handler_name = adapter.get_handler_name(&message);
        assert_eq!(handler_name, "memory.store");
    }
    
    #[tokio::test]
    async fn test_memory_handler() {
        let handler = MemoryHandler;
        
        let message = MCPMessage::MemoryRequest {
            id: "test-request".to_string(),
            method: "get_chunk".to_string(),
            params: serde_json::json!({"chunk_id": "123"}),
        };
        
        let response = handler.handle_message(&message).unwrap();
        assert!(response.is_some());
        
        if let Some(MCPMessage::MemoryResponse { id, result, error }) = response {
            assert_eq!(id, "test-request");
            assert!(result.is_some());
            assert!(error.is_none());
        }
    }
    
    #[test]
    fn test_protocol_config() {
        let config = ProtocolConfig {
            max_message_size: 2048,
            request_timeout: 60,
            heartbeat_interval: 30,
            enable_compression: false,
            enable_encryption: true,
        };
        
        let adapter = ProtocolAdapter::with_config(config);
        assert_eq!(adapter.config.max_message_size, 2048);
        assert_eq!(adapter.config.request_timeout, 60);
        assert!(!adapter.config.enable_compression);
        assert!(adapter.config.enable_encryption);
    }
}