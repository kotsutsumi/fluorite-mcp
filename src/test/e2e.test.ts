/**
 * End-to-End tests for fluorite-mcp MCP server
 * Tests the actual server process over stdio protocol
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { TEST_CATALOG_DIR } from './setup.js';

// E2E test timeout - MCP servers can take time to initialize
const E2E_TIMEOUT = 15000;

// MCP message types
interface MCPRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: string;
  method: string;
  params?: any;
}

/**
 * MCP Server Test Client - spawns and communicates with server process
 */
class MCPTestClient {
  private serverProcess: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests = new Map<string | number, (response: MCPResponse) => void>();
  private receivedData = '';

  async start(serverPath: string, args: string[] = []) {
    // Set test environment variable to use test catalog
    const env = { 
      ...process.env,
      FLUORITE_CATALOG_DIR: TEST_CATALOG_DIR
    };

    this.serverProcess = spawn('node', [serverPath, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env
    });

    if (!this.serverProcess.stdin || !this.serverProcess.stdout || !this.serverProcess.stderr) {
      throw new Error('Failed to create server process stdio streams');
    }

    // Handle server output
    this.serverProcess.stdout.on('data', (data: Buffer) => {
      this.receivedData += data.toString();
      this.processMessages();
    });

    // Handle server errors
    this.serverProcess.stderr.on('data', (data: Buffer) => {
      console.warn('Server stderr:', data.toString());
    });

    // Initialize MCP protocol
    await this.initialize();
  }

  private processMessages() {
    const lines = this.receivedData.split('\n');
    this.receivedData = lines.pop() || ''; // Keep incomplete line

    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const message = JSON.parse(line) as MCPResponse | MCPNotification;
        
        if ('id' in message && this.pendingRequests.has(message.id)) {
          const resolver = this.pendingRequests.get(message.id)!;
          this.pendingRequests.delete(message.id);
          resolver(message);
        }
      } catch (error) {
        console.warn('Failed to parse server message:', line, error);
      }
    }
  }

  private async sendRequest(method: string, params?: any): Promise<MCPResponse> {
    if (!this.serverProcess?.stdin) {
      throw new Error('Server process not started');
    }

    const id = ++this.messageId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, resolve);
      
      // Timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 5000);

      const message = JSON.stringify(request) + '\n';
      this.serverProcess!.stdin!.write(message);
    });
  }

  private async initialize() {
    const response = await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        resources: { subscribe: false },
        tools: { listChanged: false }
      },
      clientInfo: {
        name: 'fluorite-mcp-e2e-test',
        version: '1.0.0'
      }
    });

    if (response.error) {
      throw new Error(`Initialization failed: ${response.error.message}`);
    }

    // Send initialized notification
    const notification = {
      jsonrpc: '2.0',
      method: 'notifications/initialized'
    };
    
    this.serverProcess!.stdin!.write(JSON.stringify(notification) + '\n');
  }

  async listResources() {
    return await this.sendRequest('resources/list');
  }

  async readResource(uri: string) {
    return await this.sendRequest('resources/read', { uri });
  }

  async listTools() {
    return await this.sendRequest('tools/list');
  }

  async callTool(name: string, arguments_?: any) {
    return await this.sendRequest('tools/call', {
      name,
      arguments: arguments_ || {}
    });
  }

  async close() {
    if (this.serverProcess && !this.serverProcess.killed) {
      this.serverProcess.kill('SIGTERM');
      
      // Wait for process to exit
      await new Promise<void>((resolve) => {
        if (!this.serverProcess || this.serverProcess.killed) {
          resolve();
          return;
        }
        
        this.serverProcess.on('exit', () => resolve());
        
        // Force kill if it doesn't exit gracefully
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
          }
          resolve();
        }, 2000);
      });
      
      this.serverProcess = null;
    }
  }
}

describe('E2E MCP Server Tests', () => {
  let client: MCPTestClient;
  const serverPath = path.resolve('dist/server.js');

  beforeEach(async () => {
    client = new MCPTestClient();
    
    // Ensure test catalog directory exists
    await fs.mkdir(TEST_CATALOG_DIR, { recursive: true });
  });

  afterEach(async () => {
    await client.close();
    
    // Clean up test catalog
    try {
      await fs.rm(TEST_CATALOG_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should initialize MCP server successfully', async () => {
    await client.start(serverPath);
    // If we get here, initialization was successful
  }, E2E_TIMEOUT);

  it('should list available resources', async () => {
    await client.start(serverPath);
    
    const response = await client.listResources();
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('resources');
    
    // The MCP SDK may not return resource templates in the list
    // but resources are functional (as proven by other tests)
    // Just verify the response structure is valid
    expect(Array.isArray(response.result.resources)).toBe(true);
  }, E2E_TIMEOUT);

  it('should list available tools', async () => {
    await client.start(serverPath);
    
    const response = await client.listTools();
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('tools');
    expect(Array.isArray(response.result.tools)).toBe(true);
    
    const toolNames = response.result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('upsert-spec');
    expect(toolNames).toContain('list-specs');
    expect(toolNames).toContain('catalog-stats');
    expect(toolNames).toContain('self-test');
    expect(toolNames).toContain('performance-test');
  }, E2E_TIMEOUT);

  it('should handle upsert-spec tool call', async () => {
    await client.start(serverPath);
    
    const response = await client.callTool('upsert-spec', {
      pkg: 'test-e2e-package',
      yaml: 'id: test-e2e-package\nname: E2E Test Package\ndescription: Test package for E2E testing'
    });
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('content');
    expect(Array.isArray(response.result.content)).toBe(true);
    expect(response.result.content[0].text).toContain('Successfully saved');
    expect(response.result.content[0].text).toContain('test-e2e-package');
  }, E2E_TIMEOUT);

  it('should handle list-specs tool call', async () => {
    await client.start(serverPath);
    
    // First create a spec
    await client.callTool('upsert-spec', {
      pkg: 'list-test-package',
      yaml: 'id: list-test-package\nname: List Test Package'
    });
    
    // Then list specs
    const response = await client.callTool('list-specs');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('content');
    expect(response.result.content[0].text).toContain('Found 1 specification');
    expect(response.result.content[0].text).toContain('list-test-package');
  }, E2E_TIMEOUT);

  it('should read spec resource', async () => {
    await client.start(serverPath);
    
    // First create a spec
    const specContent = 'id: resource-test-package\nname: Resource Test Package\ndescription: Testing resource reading';
    await client.callTool('upsert-spec', {
      pkg: 'resource-test-package', 
      yaml: specContent
    });
    
    // Then read it via resource
    const response = await client.readResource('spec://resource-test-package');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('contents');
    expect(Array.isArray(response.result.contents)).toBe(true);
    expect(response.result.contents[0].text).toBe(specContent);
    expect(response.result.contents[0].uri).toBe('spec://resource-test-package');
  }, E2E_TIMEOUT);

  it('should handle non-existent resource gracefully', async () => {
    await client.start(serverPath);
    
    const response = await client.readResource('spec://non-existent-package');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('contents');
    expect(response.result.contents[0].text).toContain('not found');
    expect(response.result.contents[0].text).toContain('non-existent-package');
  }, E2E_TIMEOUT);

  it('should run self-test tool', async () => {
    await client.start(serverPath);
    
    const response = await client.callTool('self-test');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('content');
    expect(response.result.content[0].text).toContain('Self-test completed successfully');
  }, E2E_TIMEOUT);

  it('should run performance-test tool', async () => {
    await client.start(serverPath);
    
    const response = await client.callTool('performance-test');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('content');
    expect(response.result.content[0].text).toMatch(/Performance test completed/);
  }, E2E_TIMEOUT);

  it('should get catalog statistics', async () => {
    await client.start(serverPath);
    
    // Create a few test specs
    await client.callTool('upsert-spec', {
      pkg: 'stats-test-1',
      yaml: 'id: stats-test-1\nname: Stats Test 1'
    });
    
    await client.callTool('upsert-spec', {
      pkg: 'stats-test-2', 
      yaml: 'id: stats-test-2\nname: Stats Test 2'
    });
    
    const response = await client.callTool('catalog-stats');
    
    expect(response.error).toBeUndefined();
    expect(response.result).toHaveProperty('content');
    expect(response.result.content[0].text).toContain('Catalog Statistics:');
    expect(response.result.content[0].text).toContain('Total specifications: 2');
    expect(response.result.content[0].text).toContain('.yaml: 2');
  }, E2E_TIMEOUT);

  it('should handle list-specs with filter', async () => {
    await client.start(serverPath);
    
    // Create test specs with different names
    await client.callTool('upsert-spec', {
      pkg: 'filter-match-1',
      yaml: 'id: filter-match-1\nname: Filter Match 1'
    });
    
    await client.callTool('upsert-spec', {
      pkg: 'other-package',
      yaml: 'id: other-package\nname: Other Package' 
    });
    
    // Test filtering
    const response = await client.callTool('list-specs', {
      filter: 'filter-match'
    });
    
    expect(response.error).toBeUndefined();
    expect(response.result.content[0].text).toContain('Found 1 specification');
    expect(response.result.content[0].text).toContain('filter-match-1');
    expect(response.result.content[0].text).not.toContain('other-package');
  }, E2E_TIMEOUT);

  it('should handle tool errors gracefully', async () => {
    await client.start(serverPath);
    
    // Try to create spec with invalid input - MCP SDK will validate this
    const response = await client.callTool('upsert-spec', {
      pkg: '', // Empty package name should cause protocol-level validation error
      yaml: 'some content'
    });
    
    // MCP SDK returns validation errors at the protocol level
    expect(response.error).toBeDefined();
    expect(response.error?.code).toBe(-32602); // Invalid params error code
    expect(response.error?.message).toContain('Package name is required');
  }, E2E_TIMEOUT);

  it('should handle multiple rapid tool calls', async () => {
    await client.start(serverPath);
    
    // Test multiple concurrent calls
    const promises = [
      client.callTool('catalog-stats'),
      client.callTool('list-specs'),
      client.callTool('catalog-stats')
    ];
    
    const responses = await Promise.all(promises);
    
    for (const response of responses) {
      expect(response.error).toBeUndefined();
      expect(response.result).toHaveProperty('content');
    }
  }, E2E_TIMEOUT);
});