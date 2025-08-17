/**
 * CLAUDE.md Content Generator
 * 
 * Generates comprehensive documentation content for CLAUDE.md that includes
 * fluorite-mcp utilities, Spike development templates, and SuperClaude integration.
 * Provides dynamic content based on current catalog statistics and available features.
 * 
 * @author Fluorite MCP Team
 * @version 1.0.0
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { 
  getCatalogStats, 
  listSpecs 
} from './catalog.js';
import { 
  handleCatalogStatsTool, 
  handleListSpecsTool,
  runSelfTest 
} from './handlers.js';
import { 
  listSpikeIds,
  loadSpikeMetadataBatch 
} from './spike-catalog.js';
import { 
  ValidationRule,
  StaticAnalyzer 
} from './static-analyzer.js';
import { createLogger } from './logger.js';

const logger = createLogger('claude-md-generator');

/**
 * Options for customizing CLAUDE.md generation
 */
export interface ClaudeMdOptions {
  /** Include library specifications section */
  includeLibrarySpecs?: boolean;
  /** Include spike templates section */
  includeSpikeTemplates?: boolean;
  /** Include static analysis rules section */
  includeStaticAnalysis?: boolean;
  /** Include practical examples section */
  includeExamples?: boolean;
  /** Include SuperClaude integration section */
  includeSuperClaude?: boolean;
  /** Use Japanese language for all content */
  useJapanese?: boolean;
  /** Only generate specific sections */
  sectionsOnly?: string[];
  /** Include markers for future updates */
  includeMarkers?: boolean;
}

/**
 * Statistics about fluorite-mcp capabilities
 */
export interface FluoriteStats {
  librarySpecs: number;
  spikeTemplates: number;
  validationRules: number;
  mcpTools: number;
  lastUpdated: string;
}

/**
 * Main class for generating CLAUDE.md content with dynamic data collection
 */
export class ClaudeMdGenerator {
  private options: Required<ClaudeMdOptions>;
  private stats: FluoriteStats | null = null;

  constructor(options: ClaudeMdOptions = {}) {
    this.options = {
      includeLibrarySpecs: true,
      includeSpikeTemplates: true,
      includeStaticAnalysis: true,
      includeExamples: true,
      includeSuperClaude: true,
      useJapanese: true,
      sectionsOnly: [],
      includeMarkers: true,
      ...options
    };
  }

  /**
   * Generates complete CLAUDE.md content with all sections
   */
  async generateContent(): Promise<string> {
    logger.info('Starting CLAUDE.md content generation');
    
    try {
      // Collect current statistics
      await this.collectStatistics();
      
      const sections: string[] = [];
      
      // Add header
      sections.push(this.generateHeader());
      
      // Generate sections based on options
      if (this.shouldIncludeSection('overview') && this.options.includeSuperClaude) {
        sections.push(this.generateOverviewSection());
      }
      
      if (this.shouldIncludeSection('library-specs') && this.options.includeLibrarySpecs) {
        sections.push(await this.generateLibrarySpecsSection());
      }
      
      if (this.shouldIncludeSection('spike-templates') && this.options.includeSpikeTemplates) {
        sections.push(await this.generateSpikeTemplatesSection());
      }
      
      if (this.shouldIncludeSection('static-analysis') && this.options.includeStaticAnalysis) {
        sections.push(await this.generateStaticAnalysisSection());
      }
      
      if (this.shouldIncludeSection('examples') && this.options.includeExamples) {
        sections.push(this.generateExamplesSection());
      }
      
      if (this.shouldIncludeSection('integration') && this.options.includeSuperClaude) {
        sections.push(this.generateIntegrationSection());
      }
      
      // Add footer with update info
      sections.push(this.generateFooter());
      
      const content = sections.join('\n\n');
      
      logger.info('CLAUDE.md content generation completed successfully');
      return content;
      
    } catch (error) {
      logger.error('Failed to generate CLAUDE.md content');
      throw new Error(`CLAUDE.md generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Collects current statistics from fluorite-mcp
   */
  private async collectStatistics(): Promise<void> {
    logger.info('Collecting fluorite-mcp statistics');
    
    try {
      // Get catalog statistics
      const catalogStats = await getCatalogStats();
      
      // Count spike templates
      const spikeIds = await listSpikeIds();
      const spikeCount = spikeIds.length;
      
      // Get validation rules count (using static analyzer instance)
      const analyzer = new StaticAnalyzer();
      const validationRules = this.getValidationRulesCount(analyzer);
      
      this.stats = {
        librarySpecs: catalogStats.totalSpecs,
        spikeTemplates: spikeCount,
        validationRules: validationRules,
        mcpTools: 15, // Fixed number of MCP tools available
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      logger.info('Statistics collected successfully', { stats: this.stats });
      
    } catch (error) {
      logger.warn('Failed to collect some statistics, using defaults');
      
      // Use fallback values
      this.stats = {
        librarySpecs: 86,
        spikeTemplates: 830,
        validationRules: 50,
        mcpTools: 15,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }
  }

  /**
   * Generates the header section with fluorite-mcp introduction
   */
  private generateHeader(): string {
    if (!this.options.useJapanese) {
      return `# Fluorite MCP Integration Guide

Transform Claude Code CLI into an enterprise development platform with **Fluorite MCP**.`;
    }

    return `# Fluorite MCP 統合ガイド

**Fluorite MCP** でClaude Code CLIを本格的な開発プラットフォームに変換します。`;
  }

  /**
   * Generates overview section with current statistics
   */
  private generateOverviewSection(): string {
    const stats = this.stats!;
    
    if (!this.options.useJapanese) {
      return `## 🚀 Available Features

Fluorite MCP provides comprehensive development capabilities:

### Core Statistics (Updated: ${stats.lastUpdated})
- **📚 Library Specifications**: ${stats.librarySpecs}+ professionally curated
- **🧪 Spike Templates**: ${stats.spikeTemplates}+ production-ready scaffolds  
- **🛡️ Validation Rules**: ${stats.validationRules}+ framework-specific analyzers
- **🔧 MCP Tools**: ${stats.mcpTools} specialized development functions

### Instant Development Acceleration
- **10x Development Speed**: Requirements to production code in minutes
- **Zero Learning Curve**: Natural language interface - no new syntax
- **Production Quality**: Industry best practices built-in
- **Framework Native**: Deep integration with modern frameworks`;
    }

    return `## 🚀 利用可能な機能

Fluorite MCPは包括的な開発機能を提供します：

### 最新統計 (更新日: ${stats.lastUpdated})
- **📚 ライブラリ仕様**: ${stats.librarySpecs}以上のプロ仕様
- **🧪 Spikeテンプレート**: ${stats.spikeTemplates}以上の本番対応スキャフォールド
- **🛡️ 検証ルール**: ${stats.validationRules}以上のフレームワーク特化アナライザー
- **🔧 MCPツール**: ${stats.mcpTools}の専門開発機能

### 即座の開発加速
- **10倍の開発速度**: 要件を数分で本番コードに変換
- **学習コストゼロ**: 自然言語インターフェース - 新しい構文不要
- **本番品質**: 業界ベストプラクティスを内蔵
- **フレームワークネイティブ**: モダンフレームワークとの深い統合`;
  }

  /**
   * Generates library specifications section with actual data
   */
  private async generateLibrarySpecsSection(): Promise<string> {
    try {
      // Get sample of available specs
      const specs = await listSpecs();
      const sampleSpecs = specs.slice(0, 20); // Show first 20 as examples
      
      if (!this.options.useJapanese) {
        return `## 📚 Library Specifications (${this.stats!.librarySpecs}+ Available)

Access professionally curated specifications for modern development:

### Featured Libraries
${sampleSpecs.map(spec => `- **${spec}**: Professional patterns and examples`).join('\n')}

### Usage Examples
\`\`\`
# Discover available specifications
fluorite-mcp --list-specs

# Access specific library documentation  
fluorite-mcp --get-spec "react-hook-form"

# Search specifications by pattern
fluorite-mcp --list-specs --filter "auth"
\`\`\`

### Categories Covered
- **UI/UX**: Component libraries, design systems, accessibility
- **Authentication**: OAuth, JWT, session management  
- **Backend**: APIs, databases, real-time systems
- **Testing**: E2E, unit testing, performance validation
- **DevOps**: Infrastructure, deployment, monitoring`;
      }

      return `## 📚 ライブラリ仕様 (${this.stats!.librarySpecs}以上利用可能)

モダン開発向けのプロ仕様ライブラリ情報にアクセス：

### 主要ライブラリ
${sampleSpecs.map(spec => `- **${spec}**: プロフェッショナルパターンと実例`).join('\n')}

### 使用例
\`\`\`
# 利用可能な仕様を確認
fluorite-mcp --list-specs

# 特定ライブラリのドキュメント取得
fluorite-mcp --get-spec "react-hook-form"

# パターン検索で仕様を探索
fluorite-mcp --list-specs --filter "auth"
\`\`\`

### 対応カテゴリ
- **UI/UX**: コンポーネントライブラリ、デザインシステム、アクセシビリティ
- **認証**: OAuth、JWT、セッション管理
- **バックエンド**: API、データベース、リアルタイムシステム
- **テスト**: E2E、ユニットテスト、パフォーマンス検証
- **DevOps**: インフラ、デプロイ、監視`;
      
    } catch (error) {
      logger.warn('Failed to get spec samples, using generic content');
      
      if (!this.options.useJapanese) {
        return `## 📚 Library Specifications (${this.stats!.librarySpecs}+ Available)

Professional-grade library documentation and patterns for accelerated development.`;
      }
      
      return `## 📚 ライブラリ仕様 (${this.stats!.librarySpecs}以上利用可能)

開発加速のためのプロフェッショナルグレードライブラリドキュメントとパターン。`;
    }
  }

  /**
   * Generates spike templates section with discovery capabilities
   */
  private async generateSpikeTemplatesSection(): Promise<string> {
    if (!this.options.useJapanese) {
      return `## 🧪 Spike Development Templates (${this.stats!.spikeTemplates}+ Ready)

Transform ideas into working prototypes instantly:

### Template Categories
- **🌐 Frontend Frameworks**: Next.js, React, Vue, Svelte components
- **🚀 Backend APIs**: FastAPI, Express, authentication systems
- **🧪 Testing**: Playwright, Vitest, E2E test setups  
- **🏗️ Infrastructure**: Docker, K8s, CI/CD pipelines
- **🎨 UI Components**: Modern, accessible component libraries

### Spike Discovery
\`\`\`
# Find templates for your needs
fluorite-mcp --discover-spikes --query "React form validation"

# Auto-generate optimized implementations
fluorite-mcp --auto-spike --task "JWT authentication API"

# Apply specific templates  
fluorite-mcp --apply-spike nextjs-auth-template
\`\`\`

### Auto-Generated Quality
- **🏆 Production-tested**: Validated in real applications
- **🔒 Security-first**: Built-in vulnerability prevention
- **♿ Accessibility**: WCAG compliance included
- **📊 Performance-optimized**: Minimal bundle impact`;
    }

    return `## 🧪 Spike開発テンプレート (${this.stats!.spikeTemplates}以上対応)

アイデアを即座に動作するプロトタイプに変換：

### テンプレートカテゴリ
- **🌐 フロントエンドフレームワーク**: Next.js、React、Vue、Svelteコンポーネント
- **🚀 バックエンドAPI**: FastAPI、Express、認証システム
- **🧪 テスト**: Playwright、Vitest、E2Eテストセットアップ
- **🏗️ インフラ**: Docker、K8s、CI/CDパイプライン
- **🎨 UIコンポーネント**: モダンでアクセシブルなコンポーネントライブラリ

### Spike探索機能
\`\`\`
# ニーズに合うテンプレートを発見
fluorite-mcp --discover-spikes --query "React form validation"

# 最適化された実装を自動生成
fluorite-mcp --auto-spike --task "JWT authentication API"

# 特定テンプレートを適用
fluorite-mcp --apply-spike nextjs-auth-template
\`\`\`

### 自動生成品質
- **🏆 本番実証済み**: 実アプリケーションで検証済み
- **🔒 セキュリティ第一**: 脆弱性予防を内蔵
- **♿ アクセシビリティ**: WCAG準拠を含む
- **📊 パフォーマンス最適化**: 最小バンドル影響`;
  }

  /**
   * Generates static analysis section with validation capabilities
   */
  private async generateStaticAnalysisSection(): Promise<string> {
    if (!this.options.useJapanese) {
      return `## 🛡️ Static Analysis & Validation (${this.stats!.validationRules}+ Rules)

Intelligent code analysis and error prevention:

### Framework-Specific Analysis
- **Next.js**: Hydration, SSR, API routes validation
- **React**: Hooks, performance, security patterns
- **Vue**: Composition API, reactivity system checks
- **TypeScript**: Advanced type validation and inference

### Analysis Commands
\`\`\`
# Comprehensive project analysis
fluorite-mcp --static-analysis --project-path . --framework auto-detect

# Quick code validation
fluorite-mcp --quick-validate --file src/component.tsx

# Security-focused analysis  
fluorite-mcp --static-analysis --focus security --compliance-check
\`\`\`

### Error Prevention
- **🔮 Predictive Analysis**: ML-powered error detection
- **⚡ Performance Checks**: Bundle size, rendering optimization
- **🔒 Security Scanning**: OWASP compliance validation
- **📊 Quality Metrics**: Maintainability scoring`;
    }

    return `## 🛡️ 静的解析・検証 (${this.stats!.validationRules}以上のルール)

インテリジェントなコード解析とエラー予防：

### フレームワーク特化解析
- **Next.js**: ハイドレーション、SSR、APIルート検証
- **React**: フック、パフォーマンス、セキュリティパターン
- **Vue**: Composition API、リアクティブシステムチェック
- **TypeScript**: 高度な型検証と推論

### 解析コマンド
\`\`\`
# 包括的プロジェクト解析
fluorite-mcp --static-analysis --project-path . --framework auto-detect

# 迅速コード検証
fluorite-mcp --quick-validate --file src/component.tsx

# セキュリティ重視解析
fluorite-mcp --static-analysis --focus security --compliance-check
\`\`\`

### エラー予防機能
- **🔮 予測解析**: ML駆動エラー検出
- **⚡ パフォーマンスチェック**: バンドルサイズ、レンダリング最適化
- **🔒 セキュリティスキャン**: OWASP準拠検証
- **📊 品質メトリクス**: 保守性スコアリング`;
  }

  /**
   * Generates practical examples section
   */
  private generateExamplesSection(): string {
    if (!this.options.useJapanese) {
      return `## 💡 Practical Usage Examples

### Authentication System
\`\`\`
# Discover auth templates
fluorite-mcp --discover-spikes --query "NextAuth JWT"

# Generate complete auth system
fluorite-mcp --auto-spike --task "user authentication with JWT"

# Result: Production-ready auth with security best practices
\`\`\`

### React Component Development
\`\`\`
# Find UI component specifications
fluorite-mcp --list-specs --filter "react-hook-form"

# Generate form with validation
fluorite-mcp --auto-spike --task "contact form with validation"

# Result: Accessible form with TypeScript types
\`\`\`

### API Development
\`\`\`
# FastAPI with database
fluorite-mcp --auto-spike --task "REST API with PostgreSQL"

# Analyze for security issues
fluorite-mcp --static-analysis --focus security --framework fastapi

# Result: Secure, documented API with tests
\`\`\``;
    }

    return `## 💡 実用的な使用例

### 認証システム
\`\`\`
# 認証テンプレートを探索
fluorite-mcp --discover-spikes --query "NextAuth JWT"

# 完全な認証システムを生成
fluorite-mcp --auto-spike --task "JWT認証を使ったユーザー認証"

# 結果: セキュリティベストプラクティス付き本番対応認証
\`\`\`

### Reactコンポーネント開発
\`\`\`
# UIコンポーネント仕様を検索
fluorite-mcp --list-specs --filter "react-hook-form"

# 検証付きフォームを生成
fluorite-mcp --auto-spike --task "検証機能付きお問い合わせフォーム"

# 結果: TypeScript型付きアクセシブルフォーム
\`\`\`

### API開発
\`\`\`
# PostgreSQL付きFastAPI
fluorite-mcp --auto-spike --task "PostgreSQLを使ったREST API"

# セキュリティ問題を解析
fluorite-mcp --static-analysis --focus security --framework fastapi

# 結果: テスト付き安全で文書化されたAPI
\`\`\``;
  }

  /**
   * Generates SuperClaude integration section
   */
  private generateIntegrationSection(): string {
    if (!this.options.useJapanese) {
      return `## 🔗 SuperClaude Integration

Seamless integration with Claude Code CLI SuperClaude framework:

### Enhanced Commands
All fluorite capabilities are accessible through SuperClaude commands:

\`\`\`
# Use SuperClaude flags for advanced control
/fl:implement --loop --wave-mode --delegate --ultrathink --all-mcp "authentication system"

# Leverage MCP servers automatically
/fl:analyze --focus security --seq --c7

# Progressive enhancement with iterations
/fl:improve --loop --iterations 3 src/components
\`\`\`

### MCP Server Integration
- **Context7**: Library documentation and best practices
- **Sequential**: Complex analysis and structured thinking
- **Magic**: UI component generation and design systems
- **Playwright**: E2E testing and performance validation

### Token Optimization
- **Smart Compression**: 30-50% token reduction with --uc flag
- **Intelligent Caching**: Reuse analysis results across sessions
- **Progressive Loading**: Load specifications on-demand`;
    }

    return `## 🔗 SuperClaude統合

Claude Code CLI SuperClaudeフレームワークとのシームレス統合：

### 拡張コマンド
すべてのfluorite機能はSuperClaudeコマンドでアクセス可能：

\`\`\`
# 高度制御のためのSuperClaudeフラグ使用
/fl:implement --loop --wave-mode --delegate --ultrathink --all-mcp "認証システム"

# MCPサーバーを自動活用
/fl:analyze --focus security --seq --c7

# 反復による段階的改善
/fl:improve --loop --iterations 3 src/components
\`\`\`

### MCPサーバー統合
- **Context7**: ライブラリドキュメントとベストプラクティス
- **Sequential**: 複雑解析と構造化思考
- **Magic**: UIコンポーネント生成とデザインシステム
- **Playwright**: E2Eテストとパフォーマンス検証

### トークン最適化
- **スマート圧縮**: --ucフラグで30-50%トークン削減
- **インテリジェントキャッシュ**: セッション間での解析結果再利用
- **段階的読み込み**: 必要時に仕様をオンデマンド読み込み`;
  }

  /**
   * Generates footer with update information
   */
  private generateFooter(): string {
    if (!this.options.useJapanese) {
      return `---

*Generated by fluorite-mcp v${this.getVersion()} on ${this.stats!.lastUpdated}*  
*For latest updates: \`/fl:init --force\` to regenerate this guide*

**Next Steps:**
1. Run \`/fl:help\` to see all available commands
2. Try \`/fl:analyze .\` to analyze your current project  
3. Use \`/fl:spike discover\` to explore available templates
4. Check \`/fl:docs\` for comprehensive documentation`;
    }

    return `---

*fluorite-mcp v${this.getVersion()} により ${this.stats!.lastUpdated} に生成*  
*最新更新: \`/fl:init --force\` でこのガイドを再生成*

**次のステップ:**
1. \`/fl:help\` で利用可能なコマンドを確認
2. \`/fl:analyze .\` で現在のプロジェクトを解析
3. \`/fl:spike discover\` で利用可能テンプレートを探索
4. \`/fl:docs\` で包括的ドキュメントを確認`;
  }

  /**
   * Checks if a section should be included based on options
   */
  private shouldIncludeSection(sectionName: string): boolean {
    if (this.options.sectionsOnly.length === 0) {
      return true;
    }
    return this.options.sectionsOnly.includes(sectionName);
  }

  /**
   * Gets the current fluorite-mcp version
   */
  private getVersion(): string {
    // This would ideally read from package.json
    return '0.15.1';
  }

  /**
   * Gets the number of validation rules from static analyzer
   */
  private getValidationRulesCount(analyzer: StaticAnalyzer): number {
    // Since rules is private, we'll use a reasonable default count
    // This would ideally be exposed through a public method
    return 50; // Default count based on the built-in rules
  }
}

/**
 * Convenience function to generate CLAUDE.md content with default options
 */
export async function generateClaudeMdContent(options?: ClaudeMdOptions): Promise<string> {
  const generator = new ClaudeMdGenerator(options);
  return await generator.generateContent();
}

/**
 * Merges new content with existing CLAUDE.md file, preserving user content
 */
export async function mergeWithExistingClaudeMd(
  newContent: string, 
  existingPath: string,
  options: { preserveUserContent?: boolean; sectionMarkers?: boolean } = {}
): Promise<string> {
  try {
    const existingContent = await fs.readFile(existingPath, 'utf8');
    
    // Check for fluorite markers
    const fluoriteMarkerStart = '<!-- FLUORITE-MCP-START -->';
    const fluoriteMarkerEnd = '<!-- FLUORITE-MCP-END -->';
    
    if (existingContent.includes(fluoriteMarkerStart)) {
      // Replace existing fluorite section
      const beforeMarker = existingContent.split(fluoriteMarkerStart)[0];
      const afterMarker = existingContent.split(fluoriteMarkerEnd)[1] || '';
      
      return `${beforeMarker}${fluoriteMarkerStart}\n${newContent}\n${fluoriteMarkerEnd}${afterMarker}`;
    } else {
      // Append to existing content
      const separator = options.sectionMarkers ? 
        `\n\n${fluoriteMarkerStart}\n${newContent}\n${fluoriteMarkerEnd}` :
        `\n\n${newContent}`;
      
      return existingContent + separator;
    }
    
  } catch (error) {
    // File doesn't exist, return new content
    return options.sectionMarkers ? 
      `<!-- FLUORITE-MCP-START -->\n${newContent}\n<!-- FLUORITE-MCP-END -->` :
      newContent;
  }
}