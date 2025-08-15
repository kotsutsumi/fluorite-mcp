#!/usr/bin/env node
/**
 * MCP Server entry point (separate from CLI)
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { 
  handleSpecResource,
  handleUpsertSpecTool,
  handleListSpecsTool,
  handleCatalogStatsTool,
  runSelfTest,
  runPerformanceTest,
  type UpsertSpecInput,
  type ListSpecsInput
} from "./core/handlers.js";
import { ensureCatalogDirectory, DEFAULT_CONFIG, type CatalogConfig } from "./core/catalog.js";
import { logger, createLogger, performanceMonitor } from "./core/logger.js";
import {
  handleStaticAnalysisTool,
  handleQuickValidateTool,
  handleRealTimeValidationTool,
  handleGetValidationRulesTool,
  type StaticAnalysisInput,
  type QuickValidateInput,
  type RealTimeValidationInput
} from "./core/static-analysis-handlers.js";
import {
  handleDiscoverSpikesTool,
  handlePreviewSpikeTool,
  handleApplySpikeTool,
  handleValidateSpikeTool,
  handleExplainSpikeTool,
  handleAutoSpikeTool,
  type DiscoverInput
} from "./core/spike-handlers.js";
import { getPackageVersion } from "./utils.js";

// Create server logger
const serverLogger = createLogger('server', 'fluorite-mcp');

// Allow environment override for testing
const config: CatalogConfig = {
  ...DEFAULT_CONFIG,
  baseDir: process.env.FLUORITE_CATALOG_DIR || DEFAULT_CONFIG.baseDir
};

// Initialize server with enhanced configuration
const server = new McpServer({ 
  name: "fluorite-mcp", 
  version: getPackageVersion()
});

server.registerResource(
  "spec",
  new ResourceTemplate("spec://{pkg}", { list: undefined }),
  {
    title: "Library Specification",
    description: "ライブラリ仕様の YAML/JSON を返します"
  },
  async (_uri, { pkg }) => {
    return await handleSpecResource(String(pkg), config);
  }
);

server.registerTool(
  "upsert-spec",
  {
    title: "Upsert library spec",
    description: "catalog にライブラリ仕様（YAML 文字列）を保存します",
    inputSchema: {
      pkg: z.string().min(1, "Package name is required").max(config.maxFilenameLength, "Package name too long"),
      yaml: z.string().min(1, "YAML content is required").max(config.maxFileSize, "Content too large")
    }
  },
  async ({ pkg, yaml }) => {
    const input: UpsertSpecInput = { pkg, yaml };
    return await handleUpsertSpecTool(input, config);
  }
);

server.registerTool(
  "list-specs",
  {
    title: "List library specs",
    description: "catalog 内の仕様ファイル一覧を返します",
    inputSchema: {
      filter: z.string().optional().describe("Optional filter pattern for package names")
    }
  },
  async ({ filter } = {}) => {
    const input: ListSpecsInput = { filter };
    return await handleListSpecsTool(input, config);
  }
);

server.registerTool(
  "catalog-stats",
  {
    title: "Get catalog statistics",
    description: "カタログの統計情報を表示します（診断用）",
    inputSchema: {}
  },
  async () => {
    return await handleCatalogStatsTool(config);
  }
);

server.registerTool(
  "self-test",
  {
    title: "Run self-test",
    description: "MCP サーバーの自己診断テストを実行します",
    inputSchema: {}
  },
  async () => {
    return {
      content: [{
        type: "text" as const,
        text: await runSelfTest(config) ? "✅ Self-test passed" : "❌ Self-test failed"
      }]
    };
  }
);

server.registerTool(
  "performance-test",
  {
    title: "Run performance test",
    description: "MCP サーバーのパフォーマンステストを実行します",
    inputSchema: {}
  },
  async () => {
    return {
      content: [{
        type: "text" as const,
        text: await runPerformanceTest(config) ? "✅ Performance test completed" : "❌ Performance test failed"
      }]
    };
  }
);

server.registerTool(
  "server-metrics",
  {
    title: "Get server metrics",
    description: "サーバーの観測可能性メトリクスを表示します（診断用）",
    inputSchema: {}
  },
  async () => {
    const metrics = performanceMonitor.getMetrics();
    return {
      content: [{
        type: "text" as const,
        text: `📊 Server Metrics:\n${JSON.stringify(metrics, null, 2)}`
      }]
    };
  }
);

// Static Analysis Tools
server.registerTool(
  "static-analysis",
  {
    title: "Static Analysis",
    description: "実行前に包括的な静的解析を実行し、潜在的な問題を検出します（特にNext.jsなどのフレームワーク向け）",
    inputSchema: {
      projectPath: z.string().describe("Project root directory path"),
      targetFiles: z.array(z.string()).optional().describe("Specific files to analyze"),
      framework: z.enum(["nextjs", "react", "vue"]).optional().describe("Target framework"),
      strictMode: z.boolean().optional().describe("Enable strict validation mode"),
      maxIssues: z.number().optional().describe("Maximum issues to report"),
      enabledRules: z.array(z.string()).optional().describe("Specific rules to enable"),
      disabledRules: z.array(z.string()).optional().describe("Specific rules to disable"),
      autoFix: z.boolean().optional().describe("Generate auto-fix suggestions"),
      analyzeDependencies: z.boolean().optional().describe("Analyze dependencies"),
      predictErrors: z.boolean().optional().describe("Enable error prediction")
    }
  },
  async (input) => {
    return await handleStaticAnalysisTool(input as StaticAnalysisInput);
  }
);

server.registerTool(
  "quick-validate",
  {
    title: "Quick Validate",
    description: "コードスニペットの迅速な検証を実行します",
    inputSchema: {
      code: z.string().describe("Code to validate"),
      language: z.enum(["typescript", "javascript", "jsx", "tsx"]).optional().describe("Code language"),
      framework: z.string().optional().describe("Target framework"),
      fileName: z.string().optional().describe("Optional file name for context")
    }
  },
  async (input) => {
    return await handleQuickValidateTool(input as QuickValidateInput);
  }
);

server.registerTool(
  "realtime-validation",
  {
    title: "Realtime Validation",
    description: "ファイルのリアルタイム検証を実行します",
    inputSchema: {
      file: z.string().describe("File path to validate"),
      content: z.string().optional().describe("File content (if not reading from disk)"),
      framework: z.string().optional().describe("Target framework"),
      watchMode: z.boolean().optional().describe("Enable watch mode for continuous validation")
    }
  },
  async (input) => {
    return await handleRealTimeValidationTool(input as RealTimeValidationInput);
  }
);

server.registerTool(
  "get-validation-rules",
  {
    title: "Get Validation Rules",
    description: "利用可能な検証ルールのリストを取得します",
    inputSchema: {}
  },
  async () => {
    return await handleGetValidationRulesTool();
  }
);

// Spike Development Tools
server.registerTool(
  "discover-spikes",
  {
    title: "Discover Spikes",
    description: "自然言語クエリからスパイク候補を検索します",
    inputSchema: {
      query: z.string().optional().describe("Optional natural language query"),
      limit: z.number().optional().describe("Limit number of results")
    }
  },
  async (input) => {
    return await handleDiscoverSpikesTool(input as DiscoverInput);
  }
);

server.registerTool(
  "auto-spike",
  {
    title: "Auto Spike Selector",
    description: "自然言語要件から最適なスパイクを選定し、次アクションを提示します",
    inputSchema: {
      task: z.string().describe("Natural language task description"),
      constraints: z.record(z.string()).optional().describe("Resolved parameters")
    }
  },
  async (input) => {
    return await handleAutoSpikeTool(input as { task: string; constraints?: Record<string, string> });
  }
);

server.registerTool(
  "preview-spike",
  {
    title: "Preview Spike",
    description: "スパイクテンプレートをプレビューします（適用前の確認）",
    inputSchema: {
      id: z.string().describe("Spike template ID"),
      params: z.record(z.string()).optional().describe("Template parameters")
    }
  },
  async (input) => {
    return await handlePreviewSpikeTool(input as { id: string; params?: Record<string, string> });
  }
);

server.registerTool(
  "apply-spike",
  {
    title: "Apply Spike",
    description: "スパイクテンプレートを適用し、ファイルまたはパッチを生成します",
    inputSchema: {
      id: z.string().describe("Spike template ID"),
      params: z.record(z.string()).optional().describe("Template parameters"),
      strategy: z.enum(["overwrite", "three_way_merge", "abort"]).optional().describe("Conflict resolution strategy")
    }
  },
  async (input) => {
    return await handleApplySpikeTool(input as { id: string; params?: Record<string, string>; strategy?: "overwrite" | "three_way_merge" | "abort" });
  }
);

server.registerTool(
  "validate-spike",
  {
    title: "Validate Spike",
    description: "適用されたスパイクの整合性と品質を検証します",
    inputSchema: {
      id: z.string().describe("Spike template ID"),
      params: z.record(z.string()).optional().describe("Template parameters")
    }
  },
  async (input) => {
    return await handleValidateSpikeTool(input as { id: string; params?: Record<string, string> });
  }
);

server.registerTool(
  "explain-spike",
  {
    title: "Explain Spike",
    description: "スパイクの目的、使用方法、ベストプラクティスを説明します",
    inputSchema: {
      id: z.string().describe("Spike template ID")
    }
  },
  async (input) => {
    return await handleExplainSpikeTool(input as { id: string });
  }
);

// Enhanced server startup with better error handling and logging
async function startServer(): Promise<void> {
  try {
    // Ensure catalog directory exists before starting
    await ensureCatalogDirectory(config);
    
    serverLogger.info('Fluorite MCP server started successfully');
    
    console.error(`fluorite-mcp server (stdio) running...`);
    console.error(`Catalog directory: ${config.baseDir}`);
    console.error(`Supported formats: ${config.supportedExtensions.join(', ')}`);
    console.error('Available tools:');
    console.error('  - Spec Management: upsert-spec, list-specs, catalog-stats');
    console.error('  - Diagnostics: self-test, performance-test, server-metrics');
    console.error('  - Static Analysis: static-analysis, quick-validate, realtime-validation, get-validation-rules');
    console.error('  - Spikes: discover-spikes, auto-spike, preview-spike, apply-spike, validate-spike, explain-spike');

  } catch (error) {
    serverLogger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  serverLogger.info('Received SIGINT, shutting down server gracefully');
  console.error('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  serverLogger.info('Received SIGTERM, shutting down server gracefully');
  console.error('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

// Connect to stdio transport
const transport = new StdioServerTransport();
server.connect(transport);