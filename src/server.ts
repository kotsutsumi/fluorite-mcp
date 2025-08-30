#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createRequire } from 'node:module';
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
  handleListSpikePacksTool,
  handleAutoSpikeTool,
  type DiscoverInput
} from "./core/spike-handlers.js";
import { getSpikeStats } from "./core/spike-stats.js";
import { handleListGeneratedSpikesTool } from "./core/generated-spike-handlers.js";

// Resolve package version from package.json at runtime
function getPackageVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');
    return typeof pkg?.version === 'string' ? pkg.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

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

// Spike tools: discover/auto/preview/apply/validate/explain
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
    return await handleAutoSpikeTool(input as any);
  }
);

server.registerTool(
  "preview-spike",
  {
    title: "Preview Spike",
    description: "スパイク適用前に生成ファイルとパッチ差分をプレビュー",
    inputSchema: {
      id: z.string().describe("Spike id"),
      params: z.record(z.string()).optional().describe("Template parameters")
    }
  },
  async (input) => {
    return await handlePreviewSpikeTool(input as any);
  }
);

server.registerTool(
  "apply-spike",
  {
    title: "Apply Spike",
    description: "スパイクの差分適用プランを提示（現時点ではdiff返却のみ）",
    inputSchema: {
      id: z.string().describe("Spike id"),
      params: z.record(z.string()).optional().describe("Template parameters"),
      strategy: z.enum(['overwrite','three_way_merge','abort']).optional().describe("Conflict strategy")
    }
  },
  async (input) => {
    return await handleApplySpikeTool(input as any);
  }
);

server.registerTool(
  "validate-spike",
  {
    title: "Validate Spike",
    description: "スパイク適用後の簡易検証（スタブ）",
    inputSchema: {
      id: z.string().describe("Spike id"),
      params: z.record(z.string()).optional().describe("Template parameters")
    }
  },
  async (input) => {
    return await handleValidateSpikeTool(input as any);
  }
);

server.registerTool(
  "explain-spike",
  {
    title: "Explain Spike",
    description: "スパイクの目的と構成を説明",
    inputSchema: { id: z.string().describe("Spike id") }
  },
  async (input) => {
    return await handleExplainSpikeTool(input as any);
  }
);
server.registerTool(
  "list-spike-packs",
  {
    title: "List Spike Packs",
    description: "用途別テンプレート・パック一覧を返します",
    inputSchema: {}
  },
  async () => {
    return await handleListSpikePacksTool();
  }
);

// List generated spike IDs (strike/gen) with filters
server.registerTool(
  "list-generated-spikes",
  {
    title: "List Generated Spikes",
    description: "ライブラリ/パターン/スタイル/言語でフィルタした生成スパイクID（strike/gen）を列挙します",
    inputSchema: {
      libs: z.array(z.string()).optional().describe("Libraries to include"),
      patterns: z.array(z.string()).optional().describe("Patterns to include"),
      styles: z.array(z.string()).optional().describe("Styles to include"),
      langs: z.array(z.string()).optional().describe("Languages to include"),
      limit: z.number().optional().describe("Max number of ids"),
      prefix: z.enum(['strike','gen','any']).optional().describe("ID prefix filter")
    }
  },
  async (input) => {
    return await handleListGeneratedSpikesTool(input as any);
  }
);

server.registerTool(
  "catalog-stats",
  {
    title: "Catalog Statistics",
    description: "カタログの統計情報を表示します（診断用）",
    inputSchema: {}
  },
  async () => {
    return await handleCatalogStatsTool(config);
  }
);

server.registerTool(
  "spike-stats",
  {
    title: "Spike Statistics",
    description: "スパイクの統計情報（総数、生成/ファイル別、重複チェック）",
    inputSchema: {}
  },
  async () => {
    const stats = await getSpikeStats();
    const text = [
      `Spikes: total=${stats.total}, generated=${stats.generated_count}, files=${stats.files_count}`,
      stats.duplicates.length ? `duplicates: ${stats.duplicates.join(', ')}` : 'duplicates: none',
      `sample: ${stats.sample.join(', ')}`
    ].join('\n');
    return { content: [{ type: 'text', text }], metadata: stats } as any;
  }
);

server.registerTool(
  "self-test",
  {
    title: "Self Test",
    description: "MCP サーバーの自己診断テストを実行します",
    inputSchema: {}
  },
  async () => {
    const success = await runSelfTest(config);
    return {
      content: [{
        type: "text",
        text: success 
          ? "✅ Self-test completed successfully!" 
          : "❌ Self-test failed. Check server logs for details."
      }]
    };
  }
);

server.registerTool(
  "performance-test",
  {
    title: "Performance Test",
    description: "MCP サーバーのパフォーマンステストを実行します",
    inputSchema: {}
  },
  async () => {
    const success = await runPerformanceTest(config);
    return {
      content: [{
        type: "text",
        text: success 
          ? "⚡ Performance test completed successfully!" 
          : "⚠️ Performance test completed with warnings. Check server logs for details."
      }]
    };
  }
);

server.registerTool(
  "server-metrics",
  {
    title: "Server Metrics",
    description: "サーバーの観測可能性メトリクスを表示します（診断用）",
    inputSchema: {}
  },
  async () => {
    try {
      const loggerMetrics = logger.getMetrics();
      const performanceMetrics = performanceMonitor.getMetrics();
      
      const result = [
        "🔍 Server Observability Metrics:",
        "",
        "📊 System Metrics:",
        `• Uptime: ${Math.round(loggerMetrics.uptime / 1000 / 60)}m ${Math.round((loggerMetrics.uptime / 1000) % 60)}s`,
        `• Operations: ${loggerMetrics.operationCount}`,
        `• Errors: ${loggerMetrics.errorCount} (rate: ${(loggerMetrics.errorRate * 100).toFixed(2)}%)`,
        `• Memory Usage: ${loggerMetrics.memory.heapUsed}MB heap / ${loggerMetrics.memory.rss}MB RSS`,
        "",
        "⚡ Performance Metrics:",
        ...Object.entries(performanceMetrics).map(([operation, stats]) => 
          `• ${operation}: avg ${stats.avg}ms (${stats.count} ops, max ${stats.max}ms, min ${stats.min}ms)`
        ),
        "",
        "🛠️ Configuration:",
        `• Log Level: ${process.env.FLUORITE_LOG_LEVEL || 'info'}`,
        `• Structured Logging: ${process.env.FLUORITE_LOG_FORMAT === 'json' ? 'enabled' : 'disabled'}`,
        `• Debug Mode: ${process.env.NODE_ENV === 'development' || process.env.DEBUG ? 'enabled' : 'disabled'}`,
        `• Catalog Directory: ${config.baseDir}`
      ].join("\n");
      
      serverLogger.info("Server metrics requested", {
        operation: 'server-metrics',
        metrics: {
          ...loggerMetrics,
          performanceOps: Object.keys(performanceMetrics).length
        }
      });
      
      return {
        content: [{
          type: "text",
          text: result
        }]
      };
    } catch (error) {
      serverLogger.error("Failed to retrieve server metrics", error as Error);
      return {
        content: [{
          type: "text",
          text: "❌ Failed to retrieve server metrics. Check server logs for details."
        }],
        isError: true
      };
    }
  }
);

// Register static analysis tools
server.registerTool(
  "static-analysis",
  {
    title: "Comprehensive Static Analysis",
    description: "実行前に包括的な静的解析を実行し、潜在的な問題を検出します（特にNext.jsなどのフレームワーク向け）",
    inputSchema: {
      projectPath: z.string().describe("Project root directory path"),
      targetFiles: z.array(z.string()).optional().describe("Specific files to analyze"),
      framework: z.enum(['nextjs', 'react', 'vue']).optional().describe("Target framework"),
      enabledRules: z.array(z.string()).optional().describe("Specific rules to enable"),
      disabledRules: z.array(z.string()).optional().describe("Specific rules to disable"),
      strictMode: z.boolean().optional().describe("Enable strict validation mode"),
      autoFix: z.boolean().optional().describe("Generate auto-fix suggestions"),
      predictErrors: z.boolean().optional().describe("Enable error prediction"),
      analyzeDependencies: z.boolean().optional().describe("Analyze dependencies"),
      maxIssues: z.number().optional().describe("Maximum issues to report")
    }
  },
  async (input) => {
    return await handleStaticAnalysisTool(input as StaticAnalysisInput);
  }
);

server.registerTool(
  "quick-validate",
  {
    title: "Quick Code Validation",
    description: "コードスニペットの迅速な検証を実行します",
    inputSchema: {
      code: z.string().describe("Code to validate"),
      language: z.enum(['typescript', 'javascript', 'jsx', 'tsx']).optional().describe("Code language"),
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
    title: "Real-time File Validation",
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
    title: "Get Available Validation Rules",
    description: "利用可能な検証ルールのリストを取得します",
    inputSchema: {}
  },
  async () => {
    return await handleGetValidationRulesTool();
  }
);

async function main() {
  try {
    // Check for command line arguments
    const args = process.argv.slice(2);
    
    // Handle version flags early and exit
    if (args.includes('-v') || args.includes('--version')) {
      console.log(`fluorite-mcp ${getPackageVersion()}`);
      process.exit(0);
    }
    
    // Handle self-test mode
    if (args.includes('--self-test') || args.includes('--test')) {
      serverLogger.info("Starting fluorite-mcp in self-test mode", {
        operation: 'startup',
        mode: 'self-test'
      });
      console.log("🧪 Running fluorite-mcp in self-test mode...");
      await ensureCatalogDirectory(config);
      
      const selfTestResult = await runSelfTest(config);
      const perfTestResult = await runPerformanceTest(config);
      
      if (selfTestResult && perfTestResult) {
        serverLogger.info("All tests passed", {
          operation: 'startup',
          mode: 'self-test',
          result: 'success'
        });
        console.log("🎉 All tests passed!");
        process.exit(0);
      } else {
        serverLogger.error("Some tests failed", undefined, {
          operation: 'startup',
          mode: 'self-test',
          result: 'failure',
          selfTestResult,
          perfTestResult
        });
        console.log("❌ Some tests failed!");
        process.exit(1);
      }
    }
    
    // Handle performance test only mode  
    if (args.includes('--perf-test')) {
      serverLogger.info("Starting fluorite-mcp in performance test mode", {
        operation: 'startup',
        mode: 'performance-test'
      });
      console.log("⚡ Running fluorite-mcp performance test...");
      await ensureCatalogDirectory(config);
      
      const perfTestResult = await runPerformanceTest(config);
      serverLogger.info("Performance test completed", {
        operation: 'startup',
        mode: 'performance-test',
        result: perfTestResult ? 'success' : 'failure'
      });
      process.exit(perfTestResult ? 0 : 1);
    }
    
    // Normal server mode
    await ensureCatalogDirectory(config);
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    serverLogger.info("Fluorite MCP server started successfully", {
      operation: 'startup',
      mode: 'stdio',
      catalogDirectory: config.baseDir,
      supportedFormats: config.supportedExtensions,
      availableTools: [
        'upsert-spec', 'list-specs', 'catalog-stats', 
        'self-test', 'performance-test', 'server-metrics',
        'static-analysis', 'quick-validate', 'realtime-validation', 'get-validation-rules',
        'discover-spikes', 'auto-spike', 'preview-spike', 'apply-spike', 'validate-spike', 'explain-spike', 'list-spike-packs',
        'list-generated-spikes'
      ]
    });
    
    // Only log to stderr in stdio mode to avoid interfering with MCP protocol
    console.error("fluorite-mcp server (stdio) running...");
    console.error(`Catalog directory: ${config.baseDir}`);
    console.error(`Supported formats: ${config.supportedExtensions.join(", ")}`);
    console.error("Available tools:");
    console.error("  - Spec Management: upsert-spec, list-specs, catalog-stats");
    console.error("  - Diagnostics: self-test, performance-test, server-metrics");
    console.error("  - Static Analysis: static-analysis, quick-validate, realtime-validation, get-validation-rules");
    console.error("  - Spikes: discover-spikes, auto-spike, preview-spike, apply-spike, validate-spike, explain-spike, list-spike-packs, list-generated-spikes");
    
    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      serverLogger.info("Received SIGINT, shutting down server", {
        operation: 'shutdown',
        signal: 'SIGINT'
      });
      console.error("\nShutting down server...");
      await server.close();
      process.exit(0);
    });
    
    process.on("SIGTERM", async () => {
      serverLogger.info("Received SIGTERM, shutting down server gracefully", {
        operation: 'shutdown',
        signal: 'SIGTERM'
      });
      console.error("\nReceived SIGTERM, shutting down gracefully...");
      await server.close();
      process.exit(0);
    });
    
  } catch (error) {
    serverLogger.fatal("Failed to start server", error as Error, {
      operation: 'startup',
      mode: 'stdio'
    });
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main().catch(err => {
  serverLogger.fatal("Unhandled error in main process", err as Error, {
    operation: 'startup'
  });
  console.error("Unhandled error:", err);
  process.exit(1);
});
