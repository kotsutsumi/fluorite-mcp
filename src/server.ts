#!/usr/bin/env node
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
  version: "0.1.0"
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
    title: "Catalog Statistics",
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

async function main() {
  try {
    // Check for command line arguments
    const args = process.argv.slice(2);
    
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
      availableTools: ['upsert-spec', 'list-specs', 'catalog-stats', 'self-test', 'performance-test', 'server-metrics']
    });
    
    // Only log to stderr in stdio mode to avoid interfering with MCP protocol
    console.error("fluorite-mcp server (stdio) running...");
    console.error(`Catalog directory: ${config.baseDir}`);
    console.error(`Supported formats: ${config.supportedExtensions.join(", ")}`);
    console.error("Available tools: upsert-spec, list-specs, catalog-stats, self-test, performance-test, server-metrics");
    
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
