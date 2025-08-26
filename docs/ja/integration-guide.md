# 統合ガイド - 高度な使用パターン

開発ワークフロー、CI/CDパイプライン、カスタムアプリケーションとのFluorite MCP統合に関する包括的なガイドです。

> **🎯 クイックリンク**: 詳細な実世界のシナリオと例については、[使用例・ケーススタディガイド](./use-cases-examples.md)を参照してください

## 📖 目次

- [Claude Code CLI統合](#claude-code-cli統合)
- [開発ワークフロー統合](#開発ワークフロー統合)
- [CI/CDパイプライン統合](#cicdパイプライン統合)
- [IDEとエディタ統合](#ideとエディタ統合)
- [カスタムアプリケーション統合](#カスタムアプリケーション統合)
- [チームコラボレーションパターン](#チームコラボレーションパターン)
- [エンタープライズデプロイ](#エンタープライズデプロイ)
- [監視とオブザーバビリティ](#監視とオブザーバビリティ)

---

## Claude Code CLI統合

### 基本セットアップと設定

#### 標準インストール
```bash
# Fluorite MCPをグローバルインストール
npm install -g fluorite-mcp

# 正しいサーバーバイナリでClaude Code CLIに追加
claude mcp add fluorite-mcp -- fluorite-mcp

# インストール確認
claude mcp list
claude mcp status fluorite
```

#### 高度な設定
```bash
# カスタムカタログディレクトリ
export FLUORITE_CATALOG_DIR="/path/to/custom/specs"

# パフォーマンス最適化
export NODE_OPTIONS="--max-old-space-size=4096"
export FLUORITE_CACHE_TTL="3600"

# 詳細ログ付き開発モード
export FLUORITE_LOG_LEVEL="debug"
export FLUORITE_LOG_FILE="/path/to/fluorite.log"
```

### 自然言語統合パターン

#### ライブラリ特有のリクエスト
```
# 自動仕様アクセス
"Zod検証付きreact-hook-formを使用したフォームコンポーネントを作成"
→ アクセス: spec://react-hook-form, spec://zod

"PrismaとJWT認証付きNext.js APIルートを構築"
→ アクセス: spec://nextjs, spec://prisma, spec://nextauth

"アクセシビリティチェック付きPlaywrightテストをセットアップ"
→ アクセス: spec://playwright, spec://playwright-axe-accessibility
```

#### フレームワーク対応開発
```
# Next.js開発
"このNext.jsコンポーネントをハイドレーション問題について解析"
→ 使用: nextjsフレームワークルール付き静的解析

"認証用Next.jsミドルウェアを作成"
→ 使用: spikeテンプレート + 静的解析検証

# React開発
"このReactコンポーネントをパフォーマンス向上のため最適化"
→ 使用: React特有の解析ルール + パフォーマンス推奨
```

### ワークフロー最適化

#### 開発前セットアップ
```bash
# 検証付きプロジェクト初期化
claude-code "プロジェクト構造を解析し改善点を提案"

# フレームワーク特有のセットアップ
claude-code "strictモード付きNext.js用TypeScript設定をセットアップ"
```

#### アクティブ開発
```bash
# 開発中のリアルタイム検証
claude-code "このコンポーネントのリアルタイム検証を有効化"

# クイックコード検証
claude-code "このhook実装をReactベストプラクティスでチェック"
```

#### プリコミット統合
```bash
# コミット前の静的解析
claude-code "変更されたファイルに包括的な静的解析を実行"

# Spike検証
claude-code "このspike実装がベストプラクティスに従っているか検証"
```

---

## 開発ワークフロー統合

### Gitワークフロー統合

#### プリコミットフック
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Fluorite MCP解析を実行中..."

# ステージングされたファイルのリストを取得
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|vue)$')

if [ ! -z "$STAGED_FILES" ]; then
  # ステージングされたファイルの静的解析を実行
  claude-code "これらのステージングファイルの問題を解析: $STAGED_FILES"
  
  # 終了コードをチェック
  if [ $? -ne 0 ]; then
    echo "❌ 静的解析で問題が見つかりました。コミット前に修正してください。"
    exit 1
  fi
fi

echo "✅ 静的解析が通過しました"
```

#### プルリクエスト検証
```yaml
# .github/workflows/pr-validation.yml
name: Fluorite MCPによるPR検証

on:
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Node.jsセットアップ
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Fluorite MCPインストール
        run: npm install -g fluorite-mcp
        
      - name: 静的解析実行
        run: |
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework nextjs \
            --predict-errors \
            --max-issues 50
            
      - name: Spikeテンプレート検証
        run: |
          fluorite-mcp --validate-spikes \
            --check-integrity \
            --verify-dependencies
```

### コードレビュー強化

#### 自動コードレビュー
```typescript
// scripts/code-review.ts
import { MCPClient } from '@modelcontextprotocol/sdk';

class FluoriteCodeReview {
  private client: MCPClient;
  
  constructor() {
    this.client = new MCPClient({
      command: 'fluorite-mcp',
      args: []
    });
  }
  
  async reviewPullRequest(files: string[]) {
    const results = [];
    
    for (const file of files) {
      // 各ファイルの静的解析
      const analysis = await this.client.callTool('static-analysis', {
        targetFiles: [file],
        framework: this.detectFramework(file),
        predictErrors: true
      });
      
      // Spikeパターンマッチング
      const patterns = await this.client.callTool('spike-patterns-match', {
        file: file,
        context: 'code-review'
      });
      
      results.push({
        file,
        analysis: analysis.content,
        patterns: patterns.content,
        recommendations: await this.generateRecommendations(file, analysis)
      });
    }
    
    return this.generateReviewReport(results);
  }
  
  private async generateRecommendations(file: string, analysis: any) {
    // ファイル固有の改善推奨を生成
    return await this.client.callTool('code-improvement-suggestions', {
      file,
      analysisResults: analysis,
      focus: ['performance', 'security', 'maintainability']
    });
  }
}
```

### 自動品質ゲート

#### 品質メトリクス追跡
```typescript
// scripts/quality-gates.ts
interface QualityMetrics {
  codeComplexity: number;
  testCoverage: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityIndex: number;
}

class QualityGateValidator {
  private thresholds = {
    codeComplexity: 10,      // 最大循環複雑度
    testCoverage: 80,        // 最小テストカバレッジ（%）
    securityScore: 7,        // 最小セキュリティスコア（1-10）
    performanceScore: 8,     // 最小パフォーマンススコア（1-10）
    maintainabilityIndex: 70 // 最小保守性インデックス
  };
  
  async validateQualityGates(projectPath: string): Promise<boolean> {
    const metrics = await this.calculateMetrics(projectPath);
    const violations = this.checkThresholds(metrics);
    
    if (violations.length > 0) {
      console.log('❌ 品質ゲート失敗:');
      violations.forEach(v => console.log(`  - ${v}`));
      return false;
    }
    
    console.log('✅ すべての品質ゲートが通過しました');
    return true;
  }
  
  private async calculateMetrics(projectPath: string): Promise<QualityMetrics> {
    // Fluorite MCPツールを使用してメトリクスを計算
    const analysis = await this.client.callTool('static-analysis', {
      projectPath,
      includeMetrics: true,
      calculateComplexity: true
    });
    
    return {
      codeComplexity: analysis.metrics.averageComplexity,
      testCoverage: analysis.metrics.testCoverage,
      securityScore: analysis.security.overallScore,
      performanceScore: analysis.performance.overallScore,
      maintainabilityIndex: analysis.maintainability.index
    };
  }
}
```

---

## CI/CDパイプライン統合

### GitHub Actions統合

#### 完全なCI/CDワークフロー
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD with Fluorite MCP

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  FLUORITE_LOG_LEVEL: 'info'

jobs:
  quality-analysis:
    name: コード品質解析
    runs-on: ubuntu-latest
    outputs:
      analysis-results: ${{ steps.analysis.outputs.results }}
    
    steps:
      - name: コードチェックアウト
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Node.jsセットアップ
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: 依存関係インストール
        run: |
          npm ci
          npm install -g fluorite-mcp
      
      - name: フレームワーク検出
        id: framework
        run: |
          FRAMEWORK=$(fluorite-mcp --detect-framework .)
          echo "framework=$FRAMEWORK" >> $GITHUB_OUTPUT
      
      - name: 静的解析実行
        id: analysis
        run: |
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework ${{ steps.framework.outputs.framework }} \
            --output-format json \
            --predict-errors \
            --max-issues 100 > analysis-results.json
          
          echo "results=$(cat analysis-results.json)" >> $GITHUB_OUTPUT
      
      - name: セキュリティスキャン
        run: |
          fluorite-mcp --security-scan \
            --check-dependencies \
            --scan-secrets \
            --validate-configs
      
      - name: パフォーマンス解析
        run: |
          fluorite-mcp --performance-analysis \
            --check-bundle-size \
            --analyze-runtime \
            --suggest-optimizations
      
      - name: 解析結果をアーティファクトとして保存
        uses: actions/upload-artifact@v3
        with:
          name: analysis-results
          path: analysis-results.json

  spike-validation:
    name: Spikeテンプレート検証
    runs-on: ubuntu-latest
    needs: quality-analysis
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Fluorite MCPセットアップ
        run: npm install -g fluorite-mcp
      
      - name: Spikeパターン検証
        run: |
          fluorite-mcp --validate-spikes \
            --check-integrity \
            --verify-dependencies \
            --validate-patterns
      
      - name: テンプレート使用法解析
        run: |
          fluorite-mcp --analyze-spike-usage \
            --project-path . \
            --suggest-improvements

  build-and-test:
    name: ビルドとテスト
    runs-on: ubuntu-latest
    needs: [quality-analysis, spike-validation]
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Node.js ${{ matrix.node-version }}セットアップ
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: 依存関係インストール
        run: npm ci
      
      - name: Fluorite MCP強化ビルド
        run: |
          npm install -g fluorite-mcp
          fluorite-mcp --enhanced-build \
            --optimize-bundle \
            --validate-types \
            --check-compatibility
      
      - name: テスト実行（Fluorite推奨付き）
        run: |
          fluorite-mcp --enhance-tests \
            --generate-missing-tests \
            --validate-coverage
          npm test

  deployment:
    name: デプロイ
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: デプロイ前検証
        run: |
          npm install -g fluorite-mcp
          fluorite-mcp --pre-deployment-check \
            --validate-environment \
            --check-dependencies \
            --verify-configs
      
      - name: 本番デプロイ
        run: |
          # あなたのデプロイスクリプト
          echo "Fluorite MCP検証済みデプロイを実行"
```

### Jenkins統合

#### Jenkinsパイプライン
```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        FLUORITE_LOG_LEVEL = 'info'
    }
    
    stages {
        stage('セットアップ') {
            steps {
                sh 'nvm use ${NODE_VERSION}'
                sh 'npm install -g fluorite-mcp'
                sh 'npm ci'
            }
        }
        
        stage('品質解析') {
            parallel {
                stage('静的解析') {
                    steps {
                        script {
                            def framework = sh(
                                script: 'fluorite-mcp --detect-framework .',
                                returnStdout: true
                            ).trim()
                            
                            sh """
                                fluorite-mcp --static-analysis \\
                                    --project-path . \\
                                    --framework ${framework} \\
                                    --output-format junit \\
                                    --output-file static-analysis.xml
                            """
                        }
                        
                        publishTestResults testResultsPattern: 'static-analysis.xml'
                    }
                }
                
                stage('セキュリティスキャン') {
                    steps {
                        sh """
                            fluorite-mcp --security-scan \\
                                --output-format sarif \\
                                --output-file security-results.sarif
                        """
                        
                        publishSecurityResults(
                            tool: 'sarif',
                            pattern: 'security-results.sarif'
                        )
                    }
                }
                
                stage('Spike検証') {
                    steps {
                        sh 'fluorite-mcp --validate-spikes --check-integrity'
                    }
                }
            }
        }
        
        stage('ビルドとテスト') {
            steps {
                sh """
                    fluorite-mcp --enhanced-build \\
                        --optimize-bundle \\
                        --validate-types
                """
                sh 'npm test'
            }
            
            post {
                always {
                    publishTestResults testResultsPattern: 'test-results.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'カバレッジレポート'
                    ])
                }
            }
        }
        
        stage('デプロイ') {
            when {
                branch 'main'
            }
            steps {
                sh 'fluorite-mcp --pre-deployment-check'
                // デプロイスクリプト
                sh './deploy.sh'
            }
        }
    }
    
    post {
        always {
            sh 'fluorite-mcp --generate-report --output-file fluorite-report.html'
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'fluorite-report.html',
                reportName: 'Fluorite MCP レポート'
            ])
        }
        
        failure {
            sh 'fluorite-mcp --failure-analysis --output-file failure-analysis.json'
        }
    }
}
```

### GitLab CI統合

#### GitLab CI設定
```yaml
# .gitlab-ci.yml
stages:
  - analysis
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"
  FLUORITE_LOG_LEVEL: "info"

.fluorite_setup: &fluorite_setup
  before_script:
    - npm install -g fluorite-mcp
    - fluorite-mcp --version

quality_analysis:
  stage: analysis
  image: node:${NODE_VERSION}
  <<: *fluorite_setup
  script:
    - FRAMEWORK=$(fluorite-mcp --detect-framework .)
    - |
      fluorite-mcp --static-analysis \
        --project-path . \
        --framework $FRAMEWORK \
        --output-format gitlab \
        --output-file gl-code-quality-report.json
    - |
      fluorite-mcp --security-scan \
        --output-format gitlab-sast \
        --output-file gl-sast-report.json
  artifacts:
    reports:
      codequality: gl-code-quality-report.json
      sast: gl-sast-report.json
    expire_in: 1 week

spike_validation:
  stage: analysis
  image: node:${NODE_VERSION}
  <<: *fluorite_setup
  script:
    - fluorite-mcp --validate-spikes --check-integrity
    - fluorite-mcp --analyze-spike-usage --project-path .

build_project:
  stage: build
  image: node:${NODE_VERSION}
  <<: *fluorite_setup
  script:
    - npm ci
    - |
      fluorite-mcp --enhanced-build \
        --optimize-bundle \
        --validate-types \
        --check-compatibility
    - npm run build
  artifacts:
    paths:
      - dist/
      - build/
    expire_in: 1 hour

test_suite:
  stage: test
  image: node:${NODE_VERSION}
  <<: *fluorite_setup
  dependencies:
    - build_project
  script:
    - npm ci
    - |
      fluorite-mcp --enhance-tests \
        --generate-missing-tests \
        --validate-coverage
    - npm test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      junit: test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

deploy_production:
  stage: deploy
  image: node:${NODE_VERSION}
  <<: *fluorite_setup
  dependencies:
    - build_project
  only:
    - main
  script:
    - |
      fluorite-mcp --pre-deployment-check \
        --validate-environment \
        --check-dependencies \
        --verify-configs
    - ./deploy.sh
  environment:
    name: production
    url: https://your-app.com
```

---

## IDEとエディタ統合

### Visual Studio Code統合

#### VS Code拡張機能設定
```json
// .vscode/settings.json
{
  "fluorite-mcp.enableRealTimeAnalysis": true,
  "fluorite-mcp.autoFixOnSave": true,
  "fluorite-mcp.framework": "auto-detect",
  "fluorite-mcp.analysisLevel": "comprehensive",
  "fluorite-mcp.showSpikeRecommendations": true,
  "fluorite-mcp.securityScanOnSave": true,
  "fluorite-mcp.performanceHints": true,
  
  "editor.codeActionsOnSave": {
    "source.fixAll.fluorite": true,
    "source.organizeImports.fluorite": true
  },
  
  "fluorite-mcp.customRules": [
    {
      "name": "react-performance",
      "enabled": true,
      "severity": "warning"
    },
    {
      "name": "security-patterns",
      "enabled": true,
      "severity": "error"
    }
  ]
}
```

#### タスク設定
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fluorite: 完全解析",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--static-analysis",
        "--project-path", "${workspaceFolder}",
        "--comprehensive"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": "$fluorite-mcp"
    },
    {
      "label": "Fluorite: Spike検証",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--validate-spikes",
        "--check-integrity",
        "--project-path", "${workspaceFolder}"
      ],
      "group": "test"
    },
    {
      "label": "Fluorite: パフォーマンス解析",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--performance-analysis",
        "--project-path", "${workspaceFolder}",
        "--suggest-optimizations"
      ],
      "group": "build"
    }
  ]
}
```

### JetBrains IDE統合

#### WebStorm/IntelliJ設定
```xml
<!-- .idea/fluorite-mcp.xml -->
<component name="FluoriteMCPConfiguration">
  <option name="enableRealTimeAnalysis" value="true" />
  <option name="autoDetectFramework" value="true" />
  <option name="analysisScope" value="PROJECT" />
  <option name="securityScanLevel" value="COMPREHENSIVE" />
  
  <inspectionProfiles>
    <profile name="Fluorite Default">
      <inspection name="FluoriteSecurityPatterns" enabled="true" level="ERROR" />
      <inspection name="FluoritePerformanceHints" enabled="true" level="WARNING" />
      <inspection name="FluoriteSpikeRecommendations" enabled="true" level="INFO" />
    </profile>
  </inspectionProfiles>
  
  <externalTools>
    <tool name="Fluorite Analysis">
      <command>fluorite-mcp</command>
      <parameters>--static-analysis --project-path $ProjectFileDir$</parameters>
      <workingDirectory>$ProjectFileDir$</workingDirectory>
    </tool>
  </externalTools>
</component>
```

### Vim/Neovim統合

#### Vim設定
```vim
" ~/.vimrc または ~/.config/nvim/init.vim

" Fluorite MCP統合
let g:fluorite_mcp_enabled = 1
let g:fluorite_mcp_auto_analysis = 1
let g:fluorite_mcp_framework = 'auto'

" 自動コマンド
augroup FluoriteMCP
    autocmd!
    " ファイル保存時の解析
    autocmd BufWritePost *.ts,*.tsx,*.js,*.jsx,*.vue call FluoriteAnalyze()
    " ファイル開く時のSpike推奨
    autocmd BufReadPost *.ts,*.tsx,*.js,*.jsx,*.vue call FluoriteSpikeRecommendations()
augroup END

" カスタム関数
function! FluoriteAnalyze()
    if g:fluorite_mcp_enabled
        silent execute '!fluorite-mcp --quick-analysis --file ' . expand('%:p')
        redraw!
    endif
endfunction

function! FluoriteSpikeRecommendations()
    if g:fluorite_mcp_enabled
        let output = system('fluorite-mcp --spike-recommendations --file ' . expand('%:p'))
        if v:shell_error == 0 && len(output) > 0
            echo "Fluorite推奨: " . output
        endif
    endif
endfunction

" キーマッピング
nnoremap <leader>fa :call FluoriteAnalyze()<CR>
nnoremap <leader>fs :call FluoriteSpikeRecommendations()<CR>
nnoremap <leader>fv :!fluorite-mcp --validate-spikes --project-path %:p:h<CR>
```

---

## カスタムアプリケーション統合

### Node.js SDK統合

#### 基本統合例
```typescript
// fluorite-integration.ts
import { MCPClient } from '@modelcontextprotocol/sdk';
import { ChildProcess } from 'child_process';

export class FluoriteMCPIntegration {
  private client: MCPClient;
  private isConnected = false;

  constructor(private config: FluoriteConfig = {}) {
    this.client = new MCPClient({
      command: 'fluorite-mcp',
      args: this.buildServerArgs()
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Fluorite MCPに接続しました');
    } catch (error) {
      console.error('❌ Fluorite MCP接続エラー:', error);
      throw error;
    }
  }

  async analyzeProject(projectPath: string, options: AnalysisOptions = {}): Promise<AnalysisResult> {
    if (!this.isConnected) {
      throw new Error('Fluorite MCPに接続されていません');
    }

    const framework = options.framework || await this.detectFramework(projectPath);
    
    const analysisResult = await this.client.callTool('static-analysis', {
      projectPath,
      framework,
      predictErrors: options.predictErrors ?? true,
      maxIssues: options.maxIssues ?? 100,
      includeMetrics: options.includeMetrics ?? true
    });

    return {
      framework,
      issues: analysisResult.issues,
      metrics: analysisResult.metrics,
      recommendations: analysisResult.recommendations,
      timestamp: new Date().toISOString()
    };
  }

  async findSpikeTemplates(query: string, context?: string): Promise<SpikeTemplate[]> {
    const result = await this.client.callTool('spike-templates-search', {
      query,
      context: context || 'general',
      includeMetadata: true
    });

    return result.templates.map((template: any) => ({
      name: template.name,
      description: template.description,
      category: template.category,
      framework: template.framework,
      complexity: template.complexity,
      estimatedTimeMinutes: template.estimatedTime,
      dependencies: template.dependencies
    }));
  }

  async generateCode(templateName: string, parameters: Record<string, any>): Promise<GeneratedCode> {
    const result = await this.client.callTool('spike-generate', {
      templateName,
      parameters,
      includeTests: true,
      includeDocs: true
    });

    return {
      files: result.files,
      tests: result.tests,
      documentation: result.documentation,
      installationInstructions: result.installation,
      nextSteps: result.nextSteps
    };
  }

  async validateCode(filePaths: string[]): Promise<ValidationResult> {
    const result = await this.client.callTool('code-validation', {
      files: filePaths,
      checkSecurity: true,
      checkPerformance: true,
      checkAccessibility: true
    });

    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      suggestions: result.suggestions,
      securityScore: result.security.score,
      performanceScore: result.performance.score,
      accessibilityScore: result.accessibility.score
    };
  }

  private async detectFramework(projectPath: string): Promise<string> {
    const result = await this.client.callTool('detect-framework', {
      projectPath
    });
    return result.framework;
  }

  private buildServerArgs(): string[] {
    const args = [];
    
    if (this.config.catalogDir) {
      args.push('--catalog-dir', this.config.catalogDir);
    }
    
    if (this.config.logLevel) {
      args.push('--log-level', this.config.logLevel);
    }
    
    if (this.config.cacheEnabled) {
      args.push('--enable-cache');
    }
    
    return args;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      console.log('🔌 Fluorite MCPから切断しました');
    }
  }
}

// 型定義
interface FluoriteConfig {
  catalogDir?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheEnabled?: boolean;
}

interface AnalysisOptions {
  framework?: string;
  predictErrors?: boolean;
  maxIssues?: number;
  includeMetrics?: boolean;
}

interface AnalysisResult {
  framework: string;
  issues: Issue[];
  metrics: ProjectMetrics;
  recommendations: Recommendation[];
  timestamp: string;
}

interface SpikeTemplate {
  name: string;
  description: string;
  category: string;
  framework: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeMinutes: number;
  dependencies: string[];
}

interface GeneratedCode {
  files: GeneratedFile[];
  tests: GeneratedFile[];
  documentation: string;
  installationInstructions: string[];
  nextSteps: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: string[];
  securityScore: number;
  performanceScore: number;
  accessibilityScore: number;
}
```

### 使用例

#### Webアプリケーション統合
```typescript
// app.ts - Express.jsアプリケーション例
import express from 'express';
import { FluoriteMCPIntegration } from './fluorite-integration';

const app = express();
const fluorite = new FluoriteMCPIntegration({
  logLevel: 'info',
  cacheEnabled: true
});

app.use(express.json());

// プロジェクト解析エンドポイント
app.post('/api/analyze', async (req, res) => {
  try {
    const { projectPath, options } = req.body;
    const result = await fluorite.analyzeProject(projectPath, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spikeテンプレート検索エンドポイント
app.get('/api/templates/search', async (req, res) => {
  try {
    const { query, context } = req.query;
    const templates = await fluorite.findSpikeTemplates(query as string, context as string);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// コード生成エンドポイント
app.post('/api/generate', async (req, res) => {
  try {
    const { templateName, parameters } = req.body;
    const generatedCode = await fluorite.generateCode(templateName, parameters);
    res.json(generatedCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// コード検証エンドポイント
app.post('/api/validate', async (req, res) => {
  try {
    const { files } = req.body;
    const validationResult = await fluorite.validateCode(files);
    res.json(validationResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// サーバー起動
app.listen(3000, async () => {
  await fluorite.initialize();
  console.log('🚀 サーバーがポート3000で起動しました');
});

// グレースフルシャットダウン
process.on('SIGINT', async () => {
  await fluorite.disconnect();
  process.exit(0);
});
```

---

## チームコラボレーションパターン

### 共有設定とテンプレート

#### チーム設定ファイル
```yaml
# .fluorite/team-config.yml
team:
  name: "development-team"
  standards:
    codeQuality:
      minCoverage: 80
      maxComplexity: 10
      enforceLinting: true
    
    security:
      scanLevel: "comprehensive"
      blockHighRisk: true
      requireReview: true
    
    performance:
      bundleSizeLimit: "500KB"
      loadTimeTarget: "3s"
      enableMonitoring: true

frameworks:
  primary: "nextjs"
  secondary: ["react", "fastapi"]
  
  standards:
    nextjs:
      typescript: "strict"
      linting: "strict"
      testing: "jest"
    
    react:
      hooks: "recommended"
      accessibility: "wcag-aa"
      performance: "optimized"

templates:
  approved:
    - "nextjs-typescript-tailwind"
    - "react-component-library"
    - "fastapi-jwt-auth"
    - "prisma-postgres-crud"
  
  custom:
    directory: ".fluorite/team-templates"
    autoSync: true

workflows:
  preCommit:
    - "static-analysis"
    - "security-scan"
    - "spike-validation"
  
  prValidation:
    - "comprehensive-analysis"
    - "performance-check"
    - "accessibility-audit"
  
  deployment:
    - "pre-deployment-check"
    - "security-validation"
    - "performance-verification"
```

#### カスタムSpike テンプレート
```yaml
# .fluorite/team-templates/team-react-component.yml
name: "team-react-component"
description: "チーム標準のReactコンポーネントテンプレート"
category: "react-components"
version: "1.2.0"
author: "development-team"

metadata:
  complexity: "simple"
  estimatedTime: 15
  lastUpdated: "2024-01-15"

parameters:
  - name: "componentName"
    type: "string"
    required: true
    pattern: "^[A-Z][a-zA-Z0-9]*$"
    description: "PascalCaseのコンポーネント名"
  
  - name: "hasProps"
    type: "boolean"
    default: true
    description: "コンポーネントがpropsを受け取るか"
  
  - name: "includeStorybook"
    type: "boolean"
    default: true
    description: "Storybookストーリーを含めるか"
  
  - name: "includeTests"
    type: "boolean"
    default: true
    description: "テストファイルを含めるか"

dependencies:
  required:
    - "react"
    - "@types/react"
  
  optional:
    - "@storybook/react"
    - "@testing-library/react"
    - "@testing-library/jest-dom"

files:
  - path: "src/components/{{componentName}}/{{componentName}}.tsx"
    template: |
      import React from 'react';
      import { {{componentName}}Props } from './{{componentName}}.types';
      import styles from './{{componentName}}.module.css';
      
      /**
       * {{componentName}}コンポーネント
       * 
       * @param props - コンポーネントのプロパティ
       * @returns JSX要素
       */
      export const {{componentName}}: React.FC<{{componentName}}Props> = ({
        {{#if hasProps}}
        className,
        children,
        ...props
        {{/if}}
      }) => {
        return (
          <div 
            className={`${styles.{{componentName | lowercase}} ${className || ''}`}
            {{#if hasProps}}...props{{/if}}
          >
            {children || '{{componentName}}コンポーネント'}
          </div>
        );
      };
      
      {{componentName}}.displayName = '{{componentName}}';

  - path: "src/components/{{componentName}}/{{componentName}}.types.ts"
    template: |
      import { ReactNode, HTMLAttributes } from 'react';
      
      export interface {{componentName}}Props extends HTMLAttributes<HTMLDivElement> {
        /** 子要素 */
        children?: ReactNode;
        /** 追加のCSSクラス */
        className?: string;
      }

  - path: "src/components/{{componentName}}/{{componentName}}.module.css"
    template: |
      .{{componentName | lowercase}} {
        /* {{componentName}}のベーススタイル */
        display: block;
      }

  - path: "src/components/{{componentName}}/index.ts"
    template: |
      export { {{componentName}} } from './{{componentName}}';
      export type { {{componentName}}Props } from './{{componentName}}.types';

  - path: "src/components/{{componentName}}/{{componentName}}.stories.tsx"
    condition: "includeStorybook"
    template: |
      import type { Meta, StoryObj } from '@storybook/react';
      import { {{componentName}} } from './{{componentName}}';
      
      const meta: Meta<typeof {{componentName}}> = {
        title: 'Components/{{componentName}}',
        component: {{componentName}},
        parameters: {
          docs: {
            description: {
              component: '{{componentName}}コンポーネントの説明'
            }
          }
        },
        argTypes: {
          children: {
            control: 'text',
            description: '表示するコンテンツ'
          },
          className: {
            control: 'text',
            description: '追加のCSSクラス'
          }
        }
      };
      
      export default meta;
      type Story = StoryObj<typeof {{componentName}}>;
      
      export const Default: Story = {
        args: {
          children: 'デフォルトの{{componentName}}'
        }
      };
      
      export const WithCustomClass: Story = {
        args: {
          children: 'カスタムクラス付き{{componentName}}',
          className: 'custom-class'
        }
      };

  - path: "src/components/{{componentName}}/{{componentName}}.test.tsx"
    condition: "includeTests"
    template: |
      import React from 'react';
      import { render, screen } from '@testing-library/react';
      import { {{componentName}} } from './{{componentName}}';
      
      describe('{{componentName}}', () => {
        it('デフォルトテキストをレンダリングする', () => {
          render(<{{componentName}} />);
          expect(screen.getByText('{{componentName}}コンポーネント')).toBeInTheDocument();
        });
        
        it('childrenプロパティを正しくレンダリングする', () => {
          const testText = 'テストテキスト';
          render(<{{componentName}}>{testText}</{{componentName}}>);
          expect(screen.getByText(testText)).toBeInTheDocument();
        });
        
        it('カスタムクラス名を適用する', () => {
          const customClass = 'custom-test-class';
          render(<{{componentName}} className={customClass} />);
          const element = screen.getByText('{{componentName}}コンポーネント');
          expect(element).toHaveClass(customClass);
        });
        
        it('追加のpropsを正しく渡す', () => {
          const testId = 'test-component';
          render(<{{componentName}} data-testid={testId} />);
          expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
      });

validation:
  rules:
    - "typescript-strict"
    - "react-best-practices"
    - "accessibility-basic"
    - "team-naming-conventions"

postGeneration:
  - action: "format"
    tool: "prettier"
  
  - action: "validate"
    tool: "eslint"
  
  - action: "test"
    tool: "jest"
    condition: "includeTests"
```

### コードレビュープロセス

#### 自動レビューbot
```typescript
// .github/scripts/fluorite-review-bot.ts
import { Octokit } from '@octokit/rest';
import { FluoriteMCPIntegration } from '../lib/fluorite-integration';

export class FluoriteReviewBot {
  private octokit: Octokit;
  private fluorite: FluoriteMCPIntegration;

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.fluorite = new FluoriteMCPIntegration();
  }

  async reviewPullRequest(owner: string, repo: string, pullNumber: number): Promise<void> {
    await this.fluorite.initialize();

    try {
      // PRの変更ファイルを取得
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber
      });

      const relevantFiles = files
        .filter(file => file.status !== 'removed')
        .filter(file => /\.(ts|tsx|js|jsx|vue)$/.test(file.filename))
        .map(file => file.filename);

      if (relevantFiles.length === 0) {
        console.log('レビュー対象のファイルがありません');
        return;
      }

      // Fluorite MCPで解析
      const analysisResult = await this.fluorite.analyzeProject('.', {
        framework: 'auto',
        predictErrors: true,
        includeMetrics: true
      });

      // Spike推奨の確認
      const spikeRecommendations = await this.checkSpikeRecommendations(relevantFiles);

      // レビューコメントの生成
      const reviewComments = await this.generateReviewComments(
        relevantFiles,
        analysisResult,
        spikeRecommendations
      );

      // PRにレビューを投稿
      if (reviewComments.length > 0) {
        await this.octokit.pulls.createReview({
          owner,
          repo,
          pull_number: pullNumber,
          event: 'COMMENT',
          body: this.generateReviewSummary(analysisResult, spikeRecommendations),
          comments: reviewComments
        });
      }

      // ステータスチェックを設定
      await this.updateStatusCheck(owner, repo, pullNumber, analysisResult);

    } finally {
      await this.fluorite.disconnect();
    }
  }

  private async checkSpikeRecommendations(files: string[]): Promise<SpikeRecommendation[]> {
    const recommendations = [];

    for (const file of files) {
      const result = await this.fluorite.findSpikeTemplates(
        `similar patterns to ${file}`,
        'code-review'
      );

      if (result.length > 0) {
        recommendations.push({
          file,
          templates: result.slice(0, 3), // 上位3つの推奨
          reason: 'Similar patterns found in Spike templates'
        });
      }
    }

    return recommendations;
  }

  private async generateReviewComments(
    files: string[],
    analysis: any,
    spikes: SpikeRecommendation[]
  ): Promise<ReviewComment[]> {
    const comments: ReviewComment[] = [];

    // 重要な問題に対するコメント
    for (const issue of analysis.issues.filter(i => i.severity === 'error')) {
      comments.push({
        path: issue.file,
        line: issue.line,
        body: `🚨 **${issue.rule}**: ${issue.message}\n\n` +
              `**修正方法**: ${issue.suggestion || '詳細については開発チームにご相談ください'}`
      });
    }

    // パフォーマンスの警告
    for (const issue of analysis.issues.filter(i => i.category === 'performance')) {
      comments.push({
        path: issue.file,
        line: issue.line,
        body: `⚡ **パフォーマンス**: ${issue.message}\n\n` +
              `**影響**: ${issue.impact}\n` +
              `**推奨**: ${issue.suggestion}`
      });
    }

    // Spike推奨
    for (const spike of spikes) {
      const firstTemplate = spike.templates[0];
      comments.push({
        path: spike.file,
        line: 1,
        body: `💡 **Spikeテンプレート推奨**: \n\n` +
              `似たパターンがSpikeテンプレート「**${firstTemplate.name}**」にあります。\n` +
              `このテンプレートを使用することで、${firstTemplate.estimatedTimeMinutes}分程度の時間短縮が期待できます。\n\n` +
              `**説明**: ${firstTemplate.description}\n` +
              `**カテゴリ**: ${firstTemplate.category}`
      });
    }

    return comments;
  }

  private generateReviewSummary(analysis: any, spikes: SpikeRecommendation[]): string {
    const errorCount = analysis.issues.filter(i => i.severity === 'error').length;
    const warningCount = analysis.issues.filter(i => i.severity === 'warning').length;
    const spikeCount = spikes.length;

    let summary = '## 🤖 Fluorite MCP自動レビュー\n\n';
    
    if (errorCount > 0) {
      summary += `❌ **${errorCount}個のエラー**が見つかりました\n`;
    }
    
    if (warningCount > 0) {
      summary += `⚠️ **${warningCount}個の警告**が見つかりました\n`;
    }
    
    if (spikeCount > 0) {
      summary += `💡 **${spikeCount}個のSpikeテンプレート推奨**があります\n`;
    }
    
    if (errorCount === 0 && warningCount === 0) {
      summary += '✅ **問題は見つかりませんでした！**\n';
    }

    // メトリクス情報
    if (analysis.metrics) {
      summary += '\n### 📊 コード品質メトリクス\n\n';
      summary += `- **複雑度**: ${analysis.metrics.averageComplexity}/10\n`;
      summary += `- **テストカバレッジ**: ${analysis.metrics.testCoverage}%\n`;
      summary += `- **保守性インデックス**: ${analysis.metrics.maintainabilityIndex}/100\n`;
    }

    summary += '\n---\n*このレビューはFluorite MCPによって自動生成されました*';
    
    return summary;
  }

  private async updateStatusCheck(
    owner: string,
    repo: string,
    pullNumber: number,
    analysis: any
  ): Promise<void> {
    const { data: pr } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber
    });

    const errorCount = analysis.issues.filter(i => i.severity === 'error').length;
    const state = errorCount > 0 ? 'failure' : 'success';
    const description = errorCount > 0 
      ? `${errorCount}個のエラーが見つかりました` 
      : 'コード品質チェックが通過しました';

    await this.octokit.repos.createCommitStatus({
      owner,
      repo,
      sha: pr.head.sha,
      state,
      context: 'fluorite-mcp/code-quality',
      description,
      target_url: `https://github.com/${owner}/${repo}/pull/${pullNumber}/files`
    });
  }
}

interface SpikeRecommendation {
  file: string;
  templates: any[];
  reason: string;
}

interface ReviewComment {
  path: string;
  line: number;
  body: string;
}
```

---

## エンタープライズデプロイ

### 大規模デプロイアーキテクチャ

#### Kubernetes デプロイ
```yaml
# k8s/fluorite-mcp-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fluorite-mcp
  namespace: development-tools
  labels:
    app: fluorite-mcp
    version: v0.20.1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: fluorite-mcp
  template:
    metadata:
      labels:
        app: fluorite-mcp
    spec:
      containers:
      - name: fluorite-mcp
        image: fluorite-mcp:0.20.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: FLUORITE_LOG_LEVEL
          value: "info"
        - name: FLUORITE_CATALOG_DIR
          value: "/data/catalog"
        - name: NODE_OPTIONS
          value: "--max-old-space-size=2048"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: catalog-storage
          mountPath: /data/catalog
        - name: cache-storage
          mountPath: /data/cache
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
      volumes:
      - name: catalog-storage
        persistentVolumeClaim:
          claimName: fluorite-catalog-pvc
      - name: cache-storage
        emptyDir:
          sizeLimit: "1Gi"
---
apiVersion: v1
kind: Service
metadata:
  name: fluorite-mcp-service
  namespace: development-tools
spec:
  selector:
    app: fluorite-mcp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fluorite-catalog-pvc
  namespace: development-tools
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  storageClassName: fast-ssd
```

#### ロードバランサー設定
```yaml
# k8s/fluorite-mcp-ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fluorite-mcp-ingress
  namespace: development-tools
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - fluorite-mcp.company.com
    secretName: fluorite-mcp-tls
  rules:
  - host: fluorite-mcp.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fluorite-mcp-service
            port:
              number: 80
```

### 監視とログ

#### Prometheus監視設定
```yaml
# monitoring/prometheus-config.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fluorite-mcp'
    static_configs:
      - targets: ['fluorite-mcp-service:80']
    metrics_path: '/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s

rule_files:
  - "fluorite-mcp-alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### アラートルール
```yaml
# monitoring/fluorite-mcp-alerts.yml
groups:
- name: fluorite-mcp
  rules:
  - alert: FluoriteMCPHighMemoryUsage
    expr: fluorite_mcp_memory_usage_mb > 1500
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Fluorite MCP high memory usage"
      description: "Memory usage is {{ $value }}MB for 5 minutes"

  - alert: FluoriteMCPHighErrorRate
    expr: rate(fluorite_mcp_errors_total[5m]) > 0.01
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Fluorite MCP high error rate"
      description: "Error rate is {{ $value }} errors/sec"

  - alert: FluoriteMCPSlowResponse
    expr: fluorite_mcp_response_time_p95 > 200
    for: 3m
    labels:
      severity: warning
    annotations:
      summary: "Fluorite MCP slow response times"
      description: "95th percentile response time is {{ $value }}ms"
```

#### Grafana ダッシュボード
```json
{
  "dashboard": {
    "title": "Fluorite MCP Monitoring",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "fluorite_mcp_response_time_p50",
            "legendFormat": "P50"
          },
          {
            "expr": "fluorite_mcp_response_time_p95",
            "legendFormat": "P95"
          },
          {
            "expr": "fluorite_mcp_response_time_p99",
            "legendFormat": "P99"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "fluorite_mcp_memory_usage_mb",
            "legendFormat": "Memory (MB)"
          }
        ]
      },
      {
        "title": "Operation Count",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fluorite_mcp_operations_total[5m])",
            "legendFormat": "Operations/sec"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fluorite_mcp_errors_total[5m])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ]
  }
}
```

---

## 監視とオブザーバビリティ

### ログ集約

#### ELKスタック統合
```yaml
# logging/filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/fluorite-mcp/*.log
  fields:
    service: fluorite-mcp
    environment: production
  fields_under_root: true
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "fluorite-mcp-%{+yyyy.MM.dd}"

logging.level: info
```

#### Logstash設定
```ruby
# logging/logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [service] == "fluorite-mcp" {
    grok {
      match => { 
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} \[%{DATA:component}\] %{GREEDYDATA:msg}"
      }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
    
    if [msg] =~ /performance/ {
      mutate {
        add_tag => [ "performance" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "fluorite-mcp-%{+YYYY.MM.dd}"
  }
}
```

### メトリクス収集

#### カスタムメトリクス
```typescript
// monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class FluoriteMetrics {
  private readonly operationCounter = new Counter({
    name: 'fluorite_mcp_operations_total',
    help: 'Total number of operations',
    labelNames: ['operation_type', 'status']
  });

  private readonly responseTimeHistogram = new Histogram({
    name: 'fluorite_mcp_response_time_seconds',
    help: 'Response time in seconds',
    labelNames: ['operation_type'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
  });

  private readonly memoryGauge = new Gauge({
    name: 'fluorite_mcp_memory_usage_mb',
    help: 'Memory usage in MB'
  });

  private readonly activeConnectionsGauge = new Gauge({
    name: 'fluorite_mcp_active_connections',
    help: 'Number of active connections'
  });

  constructor() {
    // メモリ使用量の定期更新
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.memoryGauge.set(memUsage.heapUsed / 1024 / 1024);
    }, 5000);
  }

  recordOperation(type: string, status: 'success' | 'error'): void {
    this.operationCounter.inc({ operation_type: type, status });
  }

  recordResponseTime(type: string, durationMs: number): void {
    this.responseTimeHistogram
      .labels({ operation_type: type })
      .observe(durationMs / 1000);
  }

  setActiveConnections(count: number): void {
    this.activeConnectionsGauge.set(count);
  }

  getMetrics(): string {
    return register.metrics();
  }
}

// 使用例
const metrics = new FluoriteMetrics();

// 操作の測定
export function withMetrics<T>(
  operationType: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  return operation()
    .then((result) => {
      const duration = Date.now() - start;
      metrics.recordOperation(operationType, 'success');
      metrics.recordResponseTime(operationType, duration);
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - start;
      metrics.recordOperation(operationType, 'error');
      metrics.recordResponseTime(operationType, duration);
      throw error;
    });
}
```

### 分散トレーシング

#### Jaeger統合
```typescript
// tracing/tracer.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'fluorite-mcp',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.20.0',
  }),
  traceExporter: jaegerExporter,
});

export function initializeTracing(): void {
  sdk.start();
  console.log('🔍 分散トレーシングが初期化されました');
}

export function shutdownTracing(): Promise<void> {
  return sdk.shutdown();
}
```

### ヘルスチェックエンドポイント

#### 包括的ヘルスチェック
```typescript
// health/health-check.ts
import { performance } from 'perf_hooks';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      duration: number;
      details?: any;
    };
  };
}

export class HealthChecker {
  private startTime = Date.now();

  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: any = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // MCPサーバー接続チェック
    checks.mcpConnection = await this.checkMCPConnection();
    
    // ファイルシステムアクセスチェック
    checks.filesystem = await this.checkFilesystem();
    
    // メモリ使用量チェック
    checks.memory = await this.checkMemory();
    
    // 依存関係チェック
    checks.dependencies = await this.checkDependencies();
    
    // パフォーマンスチェック
    checks.performance = await this.checkPerformance();

    // 全体的なステータス決定
    const failedChecks = Object.values(checks).filter(c => c.status === 'fail');
    const warnChecks = Object.values(checks).filter(c => c.status === 'warn');

    if (failedChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (warnChecks.length > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks
    };
  }

  private async checkMCPConnection(): Promise<any> {
    const start = performance.now();
    
    try {
      // MCP接続の簡単なテスト
      await this.testMCPConnection();
      
      return {
        status: 'pass',
        duration: performance.now() - start,
        details: { message: 'MCP connection is working' }
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async checkFilesystem(): Promise<any> {
    const start = performance.now();
    
    try {
      const fs = require('fs').promises;
      await fs.access('./catalog', fs.constants.R_OK | fs.constants.W_OK);
      
      return {
        status: 'pass',
        duration: performance.now() - start,
        details: { message: 'Filesystem access is working' }
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async checkMemory(): Promise<any> {
    const start = performance.now();
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    
    if (heapUsedMB > 1500) {
      status = 'fail';
    } else if (heapUsedMB > 1000) {
      status = 'warn';
    }
    
    return {
      status,
      duration: performance.now() - start,
      details: {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
        rssMB: Math.round(memUsage.rss / 1024 / 1024)
      }
    };
  }

  private async checkDependencies(): Promise<any> {
    const start = performance.now();
    
    try {
      // 重要な依存関係の確認
      require('fs');
      require('path');
      require('yaml');
      
      return {
        status: 'pass',
        duration: performance.now() - start,
        details: { message: 'All dependencies are available' }
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async checkPerformance(): Promise<any> {
    const start = performance.now();
    
    try {
      // 簡単なパフォーマンステスト
      const testStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      const testDuration = performance.now() - testStart;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      
      if (testDuration > 100) {
        status = 'fail';
      } else if (testDuration > 50) {
        status = 'warn';
      }
      
      return {
        status,
        duration: performance.now() - start,
        details: {
          testDurationMs: Math.round(testDuration),
          message: `Performance test completed in ${Math.round(testDuration)}ms`
        }
      };
    } catch (error) {
      return {
        status: 'fail',
        duration: performance.now() - start,
        details: { error: error.message }
      };
    }
  }

  private async testMCPConnection(): Promise<void> {
    // 実際のMCP接続テストロジック
    return new Promise((resolve) => {
      setTimeout(resolve, 10); // シミュレーション
    });
  }
}
```

---

このガイドでは、Fluorite MCPの開発ワークフロー、CI/CD、IDE、カスタムアプリケーション、チームコラボレーション、エンタープライズデプロイ、監視の各分野での統合方法を詳しく説明しました。各セクションは実用的な例とベストプラクティスを提供し、様々な環境でFluorite MCPを効果的に活用するための包括的な指針となっています。

詳細情報については以下を参照:
- [使用例・ケーススタディ](./use-cases-examples.md) - 実世界の統合例
- [パフォーマンスガイド](./performance.md) - パフォーマンス最適化
- [トラブルシューティング](./troubleshooting.md) - 一般的な問題と解決策
- [開発者ガイド](./developer.md) - 開発とカスタマイゼーション