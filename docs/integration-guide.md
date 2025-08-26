# Integration Guide - Advanced Usage Patterns

Comprehensive guide for integrating Fluorite MCP with development workflows, CI/CD pipelines, and custom applications.

> **🎯 Quick Links**: For detailed real-world scenarios and examples, see [Use Cases & Examples Guide](./use-cases-examples.md)

## 📖 Table of Contents

- [Claude Code CLI Integration](#claude-code-cli-integration)
- [Development Workflow Integration](#development-workflow-integration)
- [CI/CD Pipeline Integration](#cicd-pipeline-integration)
- [IDE and Editor Integration](#ide-and-editor-integration)
- [Custom Application Integration](#custom-application-integration)
- [Team Collaboration Patterns](#team-collaboration-patterns)
- [Enterprise Deployment](#enterprise-deployment)
- [Monitoring and Observability](#monitoring-and-observability)

---

## Claude Code CLI Integration

### Basic Setup and Configuration

#### Standard Installation
```bash
# Install Fluorite MCP globally
npm install -g fluorite-mcp

# Add to Claude Code CLI with correct server binary
claude mcp add fluorite-mcp -- fluorite-mcp

# Verify installation
claude mcp list
claude mcp status fluorite
```

#### Advanced Configuration
```bash
# Custom catalog directory
export FLUORITE_CATALOG_DIR="/path/to/custom/specs"

# Performance optimization
export NODE_OPTIONS="--max-old-space-size=4096"
export FLUORITE_CACHE_TTL="3600"

# Development mode with verbose logging
export FLUORITE_LOG_LEVEL="debug"
export FLUORITE_LOG_FILE="/path/to/fluorite.log"
```

### Natural Language Integration Patterns

#### Library-Specific Requests
```
# Automatic specification access
"Create a form component using react-hook-form with Zod validation"
→ Accesses: spec://react-hook-form, spec://zod

"Build a Next.js API route with Prisma and authentication"
→ Accesses: spec://nextjs, spec://prisma, spec://nextauth

"Set up Playwright testing with accessibility checks"
→ Accesses: spec://playwright, spec://playwright-axe-accessibility
```

#### Framework-Aware Development
```
# Next.js development
"Analyze this Next.js component for hydration issues"
→ Uses: static-analysis with nextjs framework rules

"Create a Next.js middleware for authentication"
→ Uses: spike templates + static analysis validation

# React development
"Optimize this React component for performance"
→ Uses: react-specific analysis rules + performance recommendations
```

### Workflow Optimization

#### Pre-Development Setup
```bash
# Project initialization with validation
claude-code "Analyze my project structure and suggest improvements"

# Framework-specific setup
claude-code "Set up TypeScript configuration for Next.js with strict mode"
```

#### Active Development
```bash
# Real-time validation during development
claude-code "Enable real-time validation for this component"

# Quick code validation
claude-code "Check this hook implementation for React best practices"
```

#### Pre-Commit Integration
```bash
# Static analysis before commits
claude-code "Run comprehensive static analysis on changed files"

# Spike validation
claude-code "Validate that this spike implementation follows best practices"
```

---

## Development Workflow Integration

### Git Workflow Integration

#### Pre-Commit Hooks
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running Fluorite MCP analysis..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|vue)$')

if [ ! -z "$STAGED_FILES" ]; then
  # Run static analysis on staged files
  claude-code "Analyze these staged files for issues: $STAGED_FILES"
  
  # Check exit code
  if [ $? -ne 0 ]; then
    echo "❌ Static analysis found issues. Please fix before committing."
    exit 1
  fi
fi

echo "✅ Static analysis passed"
```

#### Pull Request Validation
```yaml
# .github/workflows/pr-validation.yml
name: PR Validation with Fluorite MCP

on:
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Fluorite MCP
        run: npm install -g fluorite-mcp
        
      - name: Run Static Analysis
        run: |
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework nextjs \
            --predict-errors \
            --max-issues 50
            
      - name: Validate Spike Templates
        run: |
          fluorite-mcp --validate-spikes \
            --check-integrity \
            --verify-dependencies
```

### Code Review Enhancement

#### Automated Code Review
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
      // Static analysis for each file
      const analysis = await this.client.callTool('static-analysis', {
        targetFiles: [file],
        framework: this.detectFramework(file),
        predictErrors: true,
        autoFix: true
      });
      
      results.push({
        file,
        analysis: analysis.content[0].text,
        severity: this.calculateSeverity(analysis)
      });
    }
    
    return this.generateReviewSummary(results);
  }
  
  private detectFramework(file: string): string {
    if (file.includes('app/') || file.includes('pages/')) return 'nextjs';
    if (file.includes('.vue')) return 'vue';
    if (file.includes('.tsx') || file.includes('.jsx')) return 'react';
    return 'typescript';
  }
  
  private calculateSeverity(analysis: any): 'low' | 'medium' | 'high' {
    const text = analysis.content[0].text;
    if (text.includes('❌') || text.includes('error')) return 'high';
    if (text.includes('⚠️') || text.includes('warning')) return 'medium';
    return 'low';
  }
  
  private generateReviewSummary(results: any[]): string {
    const highSeverity = results.filter(r => r.severity === 'high').length;
    const mediumSeverity = results.filter(r => r.severity === 'medium').length;
    
    return `
## 🤖 Automated Code Review Summary

📊 **Analysis Results:**
- Files analyzed: ${results.length}
- High severity issues: ${highSeverity}
- Medium severity issues: ${mediumSeverity}

${results.map(r => `
### 📄 ${r.file}
**Severity:** ${r.severity.toUpperCase()}

${r.analysis}
`).join('\n')}

---
*Generated by Fluorite MCP v${process.env.npm_package_version}*
    `.trim();
  }
}

// Usage in GitHub Actions or local scripts
const reviewer = new FluoriteCodeReview();
const changedFiles = process.argv.slice(2);
reviewer.reviewPullRequest(changedFiles)
  .then(summary => console.log(summary))
  .catch(console.error);
```

---

## CI/CD Pipeline Integration

### GitHub Actions Integration

#### Complete CI/CD Pipeline
```yaml
# .github/workflows/fluorite-enhanced-ci.yml
name: Enhanced CI with Fluorite MCP

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  FLUORITE_LOG_LEVEL: 'info'
  FLUORITE_CACHE_TTL: '3600'

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      changed-files: ${{ steps.changed-files.outputs.files }}
      framework: ${{ steps.detect-framework.outputs.framework }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Get changed files
        id: changed-files
        run: |
          if [ "${{ github.event_name }}" == "push" ]; then
            FILES=$(git diff --name-only ${{ github.event.before }} ${{ github.event.after }})
          else
            FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD)
          fi
          echo "files<<EOF" >> $GITHUB_OUTPUT
          echo "$FILES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
          
      - name: Detect Framework
        id: detect-framework
        run: |
          if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
            echo "framework=nextjs" >> $GITHUB_OUTPUT
          elif [ -f "vue.config.js" ] || [ -f "vite.config.ts" ]; then
            echo "framework=vue" >> $GITHUB_OUTPUT
          elif [ -f "package.json" ] && grep -q "react" package.json; then
            echo "framework=react" >> $GITHUB_OUTPUT
          else
            echo "framework=typescript" >> $GITHUB_OUTPUT
          fi

  static-analysis:
    runs-on: ubuntu-latest
    needs: setup
    if: needs.setup.outputs.changed-files != ''
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Fluorite MCP
        run: npm install -g fluorite-mcp
        
      - name: Run Comprehensive Static Analysis
        run: |
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework ${{ needs.setup.outputs.framework }} \
            --predict-errors true \
            --analyze-dependencies true \
            --auto-fix true \
            --max-issues 100 \
            --strict-mode true
            
      - name: Validate Changed Files
        if: needs.setup.outputs.changed-files != ''
        run: |
          echo "${{ needs.setup.outputs.changed-files }}" | while read file; do
            if [[ "$file" =~ \.(ts|tsx|js|jsx|vue)$ ]]; then
              echo "Validating $file..."
              fluorite-mcp --quick-validate \
                --file "$file" \
                --language "typescript" \
                --framework ${{ needs.setup.outputs.framework }}
            fi
          done

  spike-validation:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.message, '[spike]') || contains(github.event.pull_request.title, '[spike]')
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install Fluorite MCP
        run: npm install -g fluorite-mcp
        
      - name: Discover Applied Spikes
        run: |
          fluorite-mcp --discover-spikes \
            --query "detect applied templates" \
            --validate-integrity
            
      - name: Validate Spike Implementation
        run: |
          # Extract spike IDs from commit message or PR description
          SPIKE_IDS=$(echo "${{ github.event.head_commit.message }}" | grep -oP 'spike:\K[^\s]+' || echo "")
          
          if [ ! -z "$SPIKE_IDS" ]; then
            for spike_id in $SPIKE_IDS; do
              echo "Validating spike: $spike_id"
              fluorite-mcp --validate-spike \
                --id "$spike_id" \
                --check-integrity \
                --verify-best-practices
            done
          fi

  performance-analysis:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install Fluorite MCP
        run: npm install -g fluorite-mcp
        
      - name: Performance Testing
        run: |
          fluorite-mcp --performance-test
          fluorite-mcp --server-metrics
          
      - name: Bundle Analysis
        if: needs.setup.outputs.framework == 'nextjs'
        run: |
          npm run build
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework nextjs \
            --focus performance \
            --analyze-bundle-size

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Install Fluorite MCP
        run: npm install -g fluorite-mcp
        
      - name: Security Analysis
        run: |
          fluorite-mcp --static-analysis \
            --project-path . \
            --framework ${{ needs.setup.outputs.framework }} \
            --focus security \
            --strict-mode true \
            --enabled-rules security-xss-prevention,security-injection,security-auth-patterns
            
      - name: Dependency Security Check
        run: |
          fluorite-mcp --static-analysis \
            --analyze-dependencies true \
            --security-scan true

  generate-report:
    runs-on: ubuntu-latest
    needs: [static-analysis, spike-validation, performance-analysis, security-scan]
    if: always()
    steps:
      - name: Generate Analysis Report
        run: |
          echo "# 📊 Fluorite MCP Analysis Report" > analysis-report.md
          echo "" >> analysis-report.md
          echo "## Summary" >> analysis-report.md
          echo "- Framework: ${{ needs.setup.outputs.framework }}" >> analysis-report.md
          echo "- Files analyzed: $(echo '${{ needs.setup.outputs.changed-files }}' | wc -l)" >> analysis-report.md
          echo "- Static Analysis: ${{ needs.static-analysis.result }}" >> analysis-report.md
          echo "- Spike Validation: ${{ needs.spike-validation.result }}" >> analysis-report.md
          echo "- Performance: ${{ needs.performance-analysis.result }}" >> analysis-report.md
          echo "- Security: ${{ needs.security-scan.result }}" >> analysis-report.md
          
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: fluorite-analysis-report
          path: analysis-report.md
```

### Jenkins Integration

#### Declarative Pipeline
```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        FLUORITE_LOG_LEVEL = 'info'
        FLUORITE_CACHE_DIR = "${WORKSPACE}/.fluorite-cache"
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install -g fluorite-mcp'
                sh 'fluorite-mcp --version'
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    def healthCheck = sh(
                        script: 'fluorite-mcp --self-test',
                        returnStatus: true
                    )
                    
                    if (healthCheck != 0) {
                        error('Fluorite MCP health check failed')
                    }
                }
            }
        }
        
        stage('Static Analysis') {
            parallel {
                stage('Framework Analysis') {
                    steps {
                        sh '''
                            fluorite-mcp --static-analysis \
                                --project-path . \
                                --framework nextjs \
                                --predict-errors true \
                                --strict-mode true
                        '''
                    }
                }
                
                stage('Security Scan') {
                    steps {
                        sh '''
                            fluorite-mcp --static-analysis \
                                --focus security \
                                --enabled-rules security-xss-prevention,security-injection \
                                --max-issues 50
                        '''
                    }
                }
                
                stage('Performance Analysis') {
                    steps {
                        sh '''
                            fluorite-mcp --static-analysis \
                                --focus performance \
                                --analyze-dependencies true
                        '''
                    }
                }
            }
        }
        
        stage('Spike Validation') {
            when {
                anyOf {
                    changeset "spikes/**"
                    changeset "**/*.spike.json"
                }
            }
            steps {
                sh '''
                    fluorite-mcp --discover-spikes \
                        --validate-integrity \
                        --check-dependencies
                '''
            }
        }
        
        stage('Performance Testing') {
            steps {
                sh 'fluorite-mcp --performance-test'
                sh 'fluorite-mcp --server-metrics'
            }
        }
        
        stage('Generate Reports') {
            steps {
                sh '''
                    fluorite-mcp --catalog-stats > catalog-report.txt
                    fluorite-mcp --server-metrics > metrics-report.json
                '''
                
                archiveArtifacts artifacts: '*-report.*', fingerprint: true
                
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.',
                    reportFiles: 'catalog-report.txt',
                    reportName: 'Fluorite MCP Report'
                ])
            }
        }
    }
    
    post {
        always {
            sh 'fluorite-mcp --server-metrics'
        }
        
        failure {
            emailext(
                subject: "Fluorite MCP Analysis Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "The Fluorite MCP analysis failed. Please check the build logs.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
        
        success {
            slackSend(
                channel: '#dev-notifications',
                color: 'good',
                message: "✅ Fluorite MCP analysis passed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
            )
        }
    }
}
```

---

## IDE and Editor Integration

### Visual Studio Code Integration

#### Extension Development
```typescript
// vscode-fluorite-extension/src/extension.ts
import * as vscode from 'vscode';
import { MCPClient } from '@modelcontextprotocol/sdk';

export function activate(context: vscode.ExtensionContext) {
    const client = new MCPClient({
        command: 'fluorite-mcp',
        args: []
    });
    
    // Real-time validation on save
    const onSave = vscode.workspace.onDidSaveTextDocument(async (document) => {
        if (document.languageId === 'typescript' || document.languageId === 'javascript') {
            await validateDocument(document);
        }
    });
    
    // Command for manual analysis
    const analyzeCommand = vscode.commands.registerCommand(
        'fluorite.analyzeFile',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await validateDocument(editor.document);
            }
        }
    );
    
    // Spike template insertion
    const insertSpikeCommand = vscode.commands.registerCommand(
        'fluorite.insertSpike',
        async () => {
            const quickPick = vscode.window.createQuickPick();
            quickPick.placeholder = 'Search for spike templates...';
            
            quickPick.onDidChangeValue(async (value) => {
                if (value.length > 2) {
                    const spikes = await client.callTool('discover-spikes', {
                        query: value,
                        limit: 10
                    });
                    
                    quickPick.items = parseSpikes(spikes);
                }
            });
            
            quickPick.onDidAccept(async () => {
                const selected = quickPick.selectedItems[0];
                if (selected) {
                    await applySpikeTemplate(selected.label);
                }
                quickPick.dispose();
            });
            
            quickPick.show();
        }
    );
    
    context.subscriptions.push(onSave, analyzeCommand, insertSpikeCommand);
    
    async function validateDocument(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        
        try {
            const result = await client.callTool('quick-validate', {
                code: document.getText(),
                language: document.languageId as any,
                fileName: document.fileName,
                framework: detectFramework(document.fileName)
            });
            
            const issues = parseValidationResult(result);
            
            for (const issue of issues) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(issue.line - 1, 0, issue.line - 1, 100),
                    issue.message,
                    issue.severity === 'error' 
                        ? vscode.DiagnosticSeverity.Error 
                        : vscode.DiagnosticSeverity.Warning
                );
                
                diagnostics.push(diagnostic);
            }
        } catch (error) {
            console.error('Fluorite MCP validation failed:', error);
        }
        
        const collection = vscode.languages.createDiagnosticCollection('fluorite');
        collection.set(document.uri, diagnostics);
    }
    
    function detectFramework(fileName: string): string {
        if (fileName.includes('app/') || fileName.includes('pages/')) return 'nextjs';
        if (fileName.endsWith('.vue')) return 'vue';
        if (fileName.includes('.tsx') || fileName.includes('.jsx')) return 'react';
        return 'typescript';
    }
    
    function parseValidationResult(result: any): Array<{line: number, message: string, severity: string}> {
        // Parse the validation result text and extract issues
        const text = result.content[0].text;
        const issues: Array<{line: number, message: string, severity: string}> = [];
        
        const lines = text.split('\n');
        for (const line of lines) {
            const errorMatch = line.match(/❌.*Line (\d+):\s*(.+)/);
            const warningMatch = line.match(/⚠️.*Line (\d+):\s*(.+)/);
            
            if (errorMatch) {
                issues.push({
                    line: parseInt(errorMatch[1]),
                    message: errorMatch[2],
                    severity: 'error'
                });
            } else if (warningMatch) {
                issues.push({
                    line: parseInt(warningMatch[1]),
                    message: warningMatch[2],
                    severity: 'warning'
                });
            }
        }
        
        return issues;
    }
    
    function parseSpikes(result: any): vscode.QuickPickItem[] {
        const text = result.content[0].text;
        const items: vscode.QuickPickItem[] = [];
        
        // Parse spike templates from result text
        const lines = text.split('\n');
        for (const line of lines) {
            const match = line.match(/\d+\.\s*🔐\s*([^\s]+)/);
            if (match) {
                items.push({
                    label: match[1],
                    description: line.split('•')[1]?.trim() || ''
                });
            }
        }
        
        return items;
    }
    
    async function applySpikeTemplate(templateId: string) {
        // Apply spike template to current workspace
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (workspacePath) {
            try {
                await client.callTool('apply-spike', {
                    id: templateId,
                    params: {
                        app_name: vscode.workspace.name || 'my-app'
                    }
                });
                
                vscode.window.showInformationMessage(
                    `Spike template '${templateId}' applied successfully!`
                );
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Failed to apply spike template: ${error}`
                );
            }
        }
    }
}
```

#### Settings Configuration
```json
// .vscode/settings.json
{
  "fluorite.enableRealTimeValidation": true,
  "fluorite.framework": "nextjs",
  "fluorite.analysisLevel": "strict",
  "fluorite.autoFixEnabled": true,
  "fluorite.spikeTemplatesPath": "./spikes",
  "fluorite.customRules": [
    "team-naming-convention",
    "custom-accessibility-rules"
  ],
  "fluorite.excludePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**"
  ]
}
```

### Neovim Integration

#### Lua Plugin Configuration
```lua
-- ~/.config/nvim/lua/fluorite.lua
local M = {}
local uv = vim.loop
local api = vim.api

-- MCP client implementation for Neovim
M.client = {
  process = nil,
  
  start = function(self)
    if self.process then
      return
    end
    
    self.process = uv.spawn('fluorite-mcp', {
      stdio = {nil, nil, nil}
    }, function(code, signal)
      print("Fluorite MCP server exited with code " .. code)
      self.process = nil
    end)
  end,
  
  stop = function(self)
    if self.process then
      self.process:kill()
      self.process = nil
    end
  end,
  
  call_tool = function(self, tool, params, callback)
    -- Implementation of MCP tool calling
    local request = {
      id = math.random(1000000),
      method = "tools/call",
      params = {
        name = tool,
        arguments = params
      }
    }
    
    -- Send request and handle response
    -- (Implementation details omitted for brevity)
  end
}

-- Real-time validation on buffer write
M.setup = function(opts)
  opts = opts or {}
  
  -- Start MCP server
  M.client:start()
  
  -- Set up autocommands
  local group = api.nvim_create_augroup("FluoriteMCP", { clear = true })
  
  -- Validate on save
  api.nvim_create_autocmd("BufWritePost", {
    group = group,
    pattern = {"*.ts", "*.tsx", "*.js", "*.jsx", "*.vue"},
    callback = function()
      M.validate_buffer()
    end,
  })
  
  -- Clean up on exit
  api.nvim_create_autocmd("VimLeavePre", {
    group = group,
    callback = function()
      M.client:stop()
    end,
  })
end

M.validate_buffer = function()
  local buf = api.nvim_get_current_buf()
  local filename = api.nvim_buf_get_name(buf)
  local content = table.concat(api.nvim_buf_get_lines(buf, 0, -1, false), "\n")
  
  M.client:call_tool("quick-validate", {
    code = content,
    language = M.detect_language(filename),
    fileName = filename,
    framework = M.detect_framework(filename)
  }, function(result)
    M.display_diagnostics(result)
  end)
end

M.detect_language = function(filename)
  if filename:match("%.tsx$") then return "tsx"
  elseif filename:match("%.ts$") then return "typescript"
  elseif filename:match("%.jsx$") then return "jsx"
  elseif filename:match("%.js$") then return "javascript"
  elseif filename:match("%.vue$") then return "vue"
  else return "typescript" end
end

M.detect_framework = function(filename)
  if filename:match("app/") or filename:match("pages/") then return "nextjs"
  elseif filename:match("%.vue$") then return "vue"
  elseif filename:match("%.tsx$") or filename:match("%.jsx$") then return "react"
  else return "typescript" end
end

M.display_diagnostics = function(result)
  -- Parse validation result and show diagnostics
  local diagnostics = {}
  local content = result.content[1].text
  
  for line in content:gmatch("[^\r\n]+") do
    local line_num, message = line:match("Line (%d+):%s*(.+)")
    if line_num and message then
      table.insert(diagnostics, {
        lnum = tonumber(line_num) - 1,
        col = 0,
        text = message,
        type = line:match("❌") and "E" or "W"
      })
    end
  end
  
  vim.diagnostic.set(
    vim.api.nvim_create_namespace("fluorite"),
    0,
    diagnostics
  )
end

-- Commands
M.commands = {
  analyze_file = function()
    M.validate_buffer()
  end,
  
  discover_spikes = function()
    vim.ui.input({ prompt = "Search spike templates: " }, function(query)
      if query then
        M.client:call_tool("discover-spikes", {
          query = query,
          limit = 10
        }, function(result)
          M.show_spike_picker(result)
        end)
      end
    end)
  end,
  
  apply_spike = function()
    M.commands.discover_spikes()
  end
}

M.show_spike_picker = function(result)
  local content = result.content[1].text
  local spikes = {}
  
  for line in content:gmatch("[^\r\n]+") do
    local id = line:match("🔐%s*([^%s]+)")
    if id then
      table.insert(spikes, id)
    end
  end
  
  vim.ui.select(spikes, {
    prompt = "Select spike template:",
  }, function(choice)
    if choice then
      M.client:call_tool("apply-spike", {
        id = choice,
        params = {
          app_name = vim.fn.fnamemodify(vim.fn.getcwd(), ":t")
        }
      }, function(result)
        print("Spike applied: " .. choice)
      end)
    end
  end)
end

return M
```

---

## Custom Application Integration

### Programmatic Usage

#### Node.js Application Integration
```typescript
// fluorite-integration.ts
import { MCPClient } from '@modelcontextprotocol/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class FluoriteIntegration {
  private client: MCPClient;
  private transport: StdioClientTransport;
  
  constructor() {
    this.transport = new StdioClientTransport({
      command: 'fluorite-mcp',
      args: []
    });
    
    this.client = new MCPClient(
      {
        name: "my-app",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );
  }
  
  async initialize(): Promise<void> {
    try {
      await this.client.connect(this.transport);
      console.log('Fluorite MCP client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Fluorite MCP client:', error);
      throw error;
    }
  }
  
  async analyzeProject(projectPath: string, framework?: string): Promise<AnalysisResult> {
    try {
      const result = await this.client.callTool('static-analysis', {
        projectPath,
        framework,
        predictErrors: true,
        analyzeDependencies: true,
        autoFix: true
      });
      
      return this.parseAnalysisResult(result);
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw error;
    }
  }
  
  async validateCode(code: string, language: string, framework?: string): Promise<ValidationResult> {
    try {
      const result = await this.client.callTool('quick-validate', {
        code,
        language,
        framework
      });
      
      return this.parseValidationResult(result);
    } catch (error) {
      console.error('Code validation failed:', error);
      throw error;
    }
  }
  
  async discoverSpikes(query: string): Promise<SpikeTemplate[]> {
    try {
      const result = await this.client.callTool('discover-spikes', {
        query,
        limit: 20
      });
      
      return this.parseSpikeTemplates(result);
    } catch (error) {
      console.error('Spike discovery failed:', error);
      throw error;
    }
  }
  
  async autoSelectSpike(task: string, constraints?: Record<string, string>): Promise<SpikeRecommendation> {
    try {
      const result = await this.client.callTool('auto-spike', {
        task,
        constraints
      });
      
      return this.parseSpikeRecommendation(result);
    } catch (error) {
      console.error('Auto spike selection failed:', error);
      throw error;
    }
  }
  
  async applySpike(id: string, params?: Record<string, string>, strategy?: ConflictResolutionStrategy): Promise<ApplicationResult> {
    try {
      const result = await this.client.callTool('apply-spike', {
        id,
        params,
        strategy
      });
      
      return this.parseApplicationResult(result);
    } catch (error) {
      console.error('Spike application failed:', error);
      throw error;
    }
  }
  
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const [selfTest, performance, metrics] = await Promise.all([
        this.client.callTool('self-test', {}),
        this.client.callTool('performance-test', {}),
        this.client.callTool('server-metrics', {})
      ]);
      
      return {
        healthy: selfTest.content[0].text.includes('✅'),
        performance: performance.content[0].text.includes('✅'),
        metrics: JSON.parse(metrics.content[0].text.split('📊 Server Metrics:\n')[1])
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return { healthy: false, performance: false, metrics: null };
    }
  }
  
  async cleanup(): Promise<void> {
    try {
      await this.client.close();
      console.log('Fluorite MCP client closed successfully');
    } catch (error) {
      console.error('Failed to close Fluorite MCP client:', error);
    }
  }
  
  private parseAnalysisResult(result: any): AnalysisResult {
    const text = result.content[0].text;
    const errors = (text.match(/❌/g) || []).length;
    const warnings = (text.match(/⚠️/g) || []).length;
    const predictions = (text.match(/🔮/g) || []).length;
    
    return {
      summary: {
        errors,
        warnings,
        predictions,
        filesAnalyzed: this.extractNumber(text, /Files analyzed: (\d+)/)
      },
      issues: this.extractIssues(text),
      predictions: this.extractPredictions(text),
      recommendations: this.extractRecommendations(text)
    };
  }
  
  private parseValidationResult(result: any): ValidationResult {
    const text = result.content[0].text;
    const isValid = !text.includes('❌');
    
    return {
      valid: isValid,
      issues: this.extractIssues(text),
      suggestions: this.extractSuggestions(text)
    };
  }
  
  private parseSpikeTemplates(result: any): SpikeTemplate[] {
    const text = result.content[0].text;
    const templates: SpikeTemplate[] = [];
    
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/\d+\.\s*🔐\s*([^\s]+)/);
      if (match) {
        const parts = line.split('•');
        templates.push({
          id: match[1],
          name: parts[1]?.trim() || '',
          description: parts[2]?.trim() || '',
          stack: parts[3]?.trim().split(', ') || [],
          difficulty: this.extractDifficulty(line)
        });
      }
    }
    
    return templates;
  }
  
  private parseSpikeRecommendation(result: any): SpikeRecommendation {
    const text = result.content[0].text;
    
    return {
      selectedTemplate: this.extractValue(text, /Best Match Selected: ([^\n]+)/),
      confidence: this.extractNumber(text, /Match confidence: (\d+)%/) / 100,
      reasoning: this.extractSection(text, '📊 Selection Reasoning:', '🏗️'),
      nextSteps: this.extractSection(text, '📋 Suggested Next Steps:', '🔗'),
      estimatedTime: this.extractValue(text, /Estimated setup time: ([^\n]+)/)
    };
  }
  
  private parseApplicationResult(result: any): ApplicationResult {
    const text = result.content[0].text;
    const success = text.includes('✅ Spike Applied Successfully');
    
    return {
      success,
      filesCreated: this.extractFileList(text),
      configuration: this.extractConfiguration(text),
      nextSteps: this.extractSection(text, '📋 Next Steps:', '💡')
    };
  }
  
  // Helper methods
  private extractNumber(text: string, pattern: RegExp): number {
    const match = text.match(pattern);
    return match ? parseInt(match[1]) : 0;
  }
  
  private extractValue(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }
  
  private extractSection(text: string, start: string, end: string): string {
    const startIndex = text.indexOf(start);
    if (startIndex === -1) return '';
    
    const endIndex = text.indexOf(end, startIndex);
    const sectionText = endIndex === -1 
      ? text.substring(startIndex + start.length)
      : text.substring(startIndex + start.length, endIndex);
    
    return sectionText.trim();
  }
  
  private extractIssues(text: string): Issue[] {
    const issues: Issue[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const errorMatch = line.match(/❌\s*(.+)/);
      const warningMatch = line.match(/⚠️\s*(.+)/);
      
      if (errorMatch) {
        issues.push({
          severity: 'error',
          message: errorMatch[1].trim(),
          type: 'static-analysis'
        });
      } else if (warningMatch) {
        issues.push({
          severity: 'warning',
          message: warningMatch[1].trim(),
          type: 'static-analysis'
        });
      }
    }
    
    return issues;
  }
  
  private extractPredictions(text: string): Prediction[] {
    const predictions: Prediction[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/🔮\s*(.+)/);
      if (match) {
        const prediction = match[1].trim();
        const probability = this.extractNumber(prediction, /(\d+)%/);
        
        predictions.push({
          type: this.extractValue(prediction, /^([^(]+)/),
          probability: probability / 100,
          description: prediction
        });
      }
    }
    
    return predictions;
  }
  
  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('💡') || line.includes('✅')) {
        recommendations.push(line.replace(/[💡✅]\s*/, '').trim());
      }
    }
    
    return recommendations;
  }
  
  private extractSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('Suggestion') || line.includes('Fix:')) {
        suggestions.push(line.trim());
      }
    }
    
    return suggestions;
  }
  
  private extractDifficulty(line: string): 'beginner' | 'intermediate' | 'advanced' {
    if (line.includes('Beginner')) return 'beginner';
    if (line.includes('Advanced')) return 'advanced';
    return 'intermediate';
  }
  
  private extractFileList(text: string): string[] {
    const files: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/[├└].*✅\s*([^\s]+)/);
      if (match) {
        files.push(match[1]);
      }
    }
    
    return files;
  }
  
  private extractConfiguration(text: string): Record<string, string> {
    const config: Record<string, string> = {};
    const configSection = this.extractSection(text, '🔧 Configuration Applied:', '📋');
    
    const lines = configSection.split('\n');
    for (const line of lines) {
      const match = line.match(/•\s*([^:]+):\s*(.+)/);
      if (match) {
        config[match[1].trim()] = match[2].trim();
      }
    }
    
    return config;
  }
}

// Type definitions
export interface AnalysisResult {
  summary: {
    errors: number;
    warnings: number;
    predictions: number;
    filesAnalyzed: number;
  };
  issues: Issue[];
  predictions: Prediction[];
  recommendations: string[];
}

export interface ValidationResult {
  valid: boolean;
  issues: Issue[];
  suggestions: string[];
}

export interface SpikeTemplate {
  id: string;
  name: string;
  description: string;
  stack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SpikeRecommendation {
  selectedTemplate: string;
  confidence: number;
  reasoning: string;
  nextSteps: string;
  estimatedTime: string;
}

export interface ApplicationResult {
  success: boolean;
  filesCreated: string[];
  configuration: Record<string, string>;
  nextSteps: string;
}

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  type: string;
  file?: string;
  line?: number;
}

export interface Prediction {
  type: string;
  probability: number;
  description: string;
}

export interface HealthStatus {
  healthy: boolean;
  performance: boolean;
  metrics: any;
}

export type ConflictResolutionStrategy = 'overwrite' | 'three_way_merge' | 'abort';

// Usage example
async function example() {
  const fluorite = new FluoriteIntegration();
  
  try {
    await fluorite.initialize();
    
    // Analyze a project
    const analysis = await fluorite.analyzeProject('./my-project', 'nextjs');
    console.log('Analysis results:', analysis);
    
    // Discover and apply a spike
    const recommendation = await fluorite.autoSelectSpike(
      'Create a Next.js app with authentication'
    );
    
    console.log('Recommended template:', recommendation.selectedTemplate);
    
    const application = await fluorite.applySpike(
      recommendation.selectedTemplate,
      { app_name: 'my-app' }
    );
    
    console.log('Application results:', application);
    
  } finally {
    await fluorite.cleanup();
  }
}
```

### Web Application Integration

#### Express.js Middleware
```typescript
// express-fluorite-middleware.ts
import express from 'express';
import { FluoriteIntegration } from './fluorite-integration';

export interface FluoriteMiddlewareOptions {
  enableAnalysis?: boolean;
  enableValidation?: boolean;
  enableSpikes?: boolean;
  projectPath?: string;
  framework?: string;
}

export function createFluoriteMiddleware(options: FluoriteMiddlewareOptions = {}) {
  const fluorite = new FluoriteIntegration();
  let initialized = false;
  
  const initializeOnce = async () => {
    if (!initialized) {
      await fluorite.initialize();
      initialized = true;
    }
  };
  
  const router = express.Router();
  
  // Health check endpoint
  router.get('/health', async (req, res) => {
    try {
      await initializeOnce();
      const health = await fluorite.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: 'Health check failed', details: error.message });
    }
  });
  
  // Static analysis endpoint
  if (options.enableAnalysis) {
    router.post('/analyze', async (req, res) => {
      try {
        await initializeOnce();
        const { projectPath, framework } = req.body;
        
        const result = await fluorite.analyzeProject(
          projectPath || options.projectPath || process.cwd(),
          framework || options.framework
        );
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Analysis failed', details: error.message });
      }
    });
  }
  
  // Code validation endpoint
  if (options.enableValidation) {
    router.post('/validate', async (req, res) => {
      try {
        await initializeOnce();
        const { code, language, framework } = req.body;
        
        if (!code || !language) {
          return res.status(400).json({ 
            error: 'Missing required fields: code, language' 
          });
        }
        
        const result = await fluorite.validateCode(
          code,
          language,
          framework || options.framework
        );
        
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Validation failed', details: error.message });
      }
    });
  }
  
  // Spike operations endpoints
  if (options.enableSpikes) {
    router.get('/spikes/discover', async (req, res) => {
      try {
        await initializeOnce();
        const { query } = req.query;
        
        const templates = await fluorite.discoverSpikes(query as string || '');
        res.json(templates);
      } catch (error) {
        res.status(500).json({ error: 'Spike discovery failed', details: error.message });
      }
    });
    
    router.post('/spikes/auto-select', async (req, res) => {
      try {
        await initializeOnce();
        const { task, constraints } = req.body;
        
        if (!task) {
          return res.status(400).json({ error: 'Missing required field: task' });
        }
        
        const recommendation = await fluorite.autoSelectSpike(task, constraints);
        res.json(recommendation);
      } catch (error) {
        res.status(500).json({ error: 'Auto selection failed', details: error.message });
      }
    });
    
    router.post('/spikes/apply', async (req, res) => {
      try {
        await initializeOnce();
        const { id, params, strategy } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Missing required field: id' });
        }
        
        const result = await fluorite.applySpike(id, params, strategy);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Spike application failed', details: error.message });
      }
    });
  }
  
  // Error handling middleware
  router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Fluorite middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });
  
  return router;
}

// Usage example
const app = express();

app.use(express.json());

app.use('/api/fluorite', createFluoriteMiddleware({
  enableAnalysis: true,
  enableValidation: true,
  enableSpikes: true,
  projectPath: process.cwd(),
  framework: 'nextjs'
}));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Fluorite endpoints:');
  console.log('  GET  /api/fluorite/health');
  console.log('  POST /api/fluorite/analyze');
  console.log('  POST /api/fluorite/validate');
  console.log('  GET  /api/fluorite/spikes/discover');
  console.log('  POST /api/fluorite/spikes/auto-select');
  console.log('  POST /api/fluorite/spikes/apply');
});
```

---

## Team Collaboration Patterns

### Shared Configuration

#### Team Specifications Repository
```yaml
# .fluorite/team-config.yml
team:
  name: "MyTeam Development"
  standards_version: "1.2.0"
  
custom_specifications:
  - name: "team-component-library"
    path: "./specs/component-library.yaml"
    version: "2.1.0"
  - name: "team-api-standards"
    path: "./specs/api-standards.yaml"
    version: "1.5.0"

validation_rules:
  enabled:
    - team-naming-convention
    - team-file-structure
    - team-component-patterns
    - team-api-standards
  disabled:
    - generic-naming-rules
  
spike_templates:
  custom_repository: "https://github.com/myteam/fluorite-templates"
  auto_update: true
  
frameworks:
  primary: "nextjs"
  supported: ["nextjs", "react", "vue"]
  
quality_gates:
  error_threshold: 0
  warning_threshold: 5
  performance_threshold: "95%"
  
integrations:
  slack:
    webhook_url: "${SLACK_WEBHOOK_URL}"
    notify_on: ["analysis_complete", "spike_applied", "errors_found"]
  
  jira:
    project_key: "DEV"
    auto_create_tickets: true
    severity_mapping:
      error: "High"
      warning: "Medium"
      info: "Low"
```

#### Team Specification Example
```yaml
# specs/team-component-library.yaml
name: Team Component Library Standards
version: 2.1.0
description: Internal component library specifications and patterns
category: team-standards
maintainer: frontend-team@company.com

standards:
  naming_convention:
    pattern: "^[A-Z][a-zA-Z0-9]*Component$"
    examples:
      - ButtonComponent
      - DataTableComponent
      - UserProfileComponent
    
  file_structure:
    component_directory: "src/components"
    test_directory: "src/components/__tests__"
    story_directory: "src/components/__stories__"
    
  required_files:
    - index.ts
    - ComponentName.tsx
    - ComponentName.test.tsx
    - ComponentName.stories.tsx
    - ComponentName.types.ts

props_standards:
  typescript_required: true
  prop_validation: "zod"
  default_props: "object_syntax"
  
accessibility:
  aria_required: true
  semantic_html: true
  keyboard_navigation: true
  
testing:
  unit_tests: "required"
  integration_tests: "recommended"
  visual_regression: "required"
  accessibility_tests: "required"

examples:
  basic_component: |
    import React from 'react';
    import { z } from 'zod';
    
    const ButtonComponentPropsSchema = z.object({
      variant: z.enum(['primary', 'secondary', 'danger']).default('primary'),
      size: z.enum(['sm', 'md', 'lg']).default('md'),
      disabled: z.boolean().default(false),
      children: z.string(),
      onClick: z.function().optional()
    });
    
    export type ButtonComponentProps = z.infer<typeof ButtonComponentPropsSchema>;
    
    export const ButtonComponent: React.FC<ButtonComponentProps> = ({
      variant = 'primary',
      size = 'md',
      disabled = false,
      children,
      onClick
    }) => {
      return (
        <button
          className={`btn btn-${variant} btn-${size}`}
          disabled={disabled}
          onClick={onClick}
          aria-label={children}
        >
          {children}
        </button>
      );
    };
    
  test_example: |
    import { render, screen, fireEvent } from '@testing-library/react';
    import { ButtonComponent } from './ButtonComponent';
    
    describe('ButtonComponent', () => {
      it('renders with correct text', () => {
        render(<ButtonComponent>Click me</ButtonComponent>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
      });
      
      it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<ButtonComponent onClick={handleClick}>Click me</ButtonComponent>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

best_practices:
  - Use TypeScript for all component definitions
  - Implement proper prop validation with Zod
  - Include comprehensive test coverage
  - Follow team naming conventions
  - Ensure accessibility compliance
  - Document component usage in Storybook
```

### Collaborative Workflows

#### Code Review Integration
```bash
#!/bin/bash
# scripts/team-review.sh

set -e

echo "🔍 Running team code review with Fluorite MCP..."

# Get changed files in PR
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)
echo "Files to review: $CHANGED_FILES"

# Run team-specific analysis
echo "📊 Running team standards analysis..."
fluorite-mcp --static-analysis \
  --project-path . \
  --framework nextjs \
  --custom-rules team-naming-convention,team-component-patterns \
  --team-config .fluorite/team-config.yml \
  --max-issues 0

# Generate review report
echo "📝 Generating review report..."
REPORT_FILE="review-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# 🔍 Team Code Review Report

## Overview
- **Date**: $(date)
- **Reviewer**: Fluorite MCP Team Standards
- **Files Analyzed**: $(echo "$CHANGED_FILES" | wc -l)
- **Standards Version**: $(grep standards_version .fluorite/team-config.yml | cut -d: -f2 | tr -d ' "')

## Files Reviewed
$(echo "$CHANGED_FILES" | sed 's/^/- /')

## Analysis Results
$(fluorite-mcp --static-analysis --output-format markdown)

## Team Standards Compliance
$(fluorite-mcp --validate-team-standards --output-format markdown)

## Recommendations
$(fluorite-mcp --generate-recommendations --team-context)

---
*Generated by Fluorite MCP Team Integration*
EOF

echo "✅ Review report generated: $REPORT_FILE"

# Post to Slack if configured
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
  echo "📢 Posting to Slack..."
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Code review completed for '"$GITHUB_HEAD_REF"'. See attached report."}' \
    "$SLACK_WEBHOOK_URL"
fi

echo "🎉 Team review completed!"
```

#### Spike Template Sharing
```bash
#!/bin/bash
# scripts/sync-team-templates.sh

TEAM_REPO="https://github.com/myteam/fluorite-templates"
LOCAL_DIR="$HOME/.fluorite/team-templates"

echo "🔄 Syncing team spike templates..."

# Clone or update team templates
if [ -d "$LOCAL_DIR" ]; then
  echo "📥 Updating existing templates..."
  cd "$LOCAL_DIR"
  git pull origin main
else
  echo "📦 Cloning team templates..."
  git clone "$TEAM_REPO" "$LOCAL_DIR"
fi

# Register templates with Fluorite MCP
echo "📋 Registering templates..."
cd "$LOCAL_DIR"

for template in *.json; do
  if [ -f "$template" ]; then
    echo "  - Registering $template"
    fluorite-mcp --register-spike --file "$template" --team-context
  fi
done

echo "✅ Team templates synced successfully!"
echo "📊 Available templates:"
fluorite-mcp --list-spikes --team-only
```

---

## Enterprise Deployment

### Production Configuration

#### Docker Deployment
```dockerfile
# Dockerfile.fluorite-mcp
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache git curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Fluorite MCP globally
RUN npm install -g fluorite-mcp@latest

# Create non-root user
RUN addgroup -g 1001 -S fluorite && \
    adduser -S fluorite -u 1001

# Create directories
RUN mkdir -p /app/catalog /app/cache /app/logs && \
    chown -R fluorite:fluorite /app

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV FLUORITE_CATALOG_DIR=/app/catalog
ENV FLUORITE_CACHE_DIR=/app/cache
ENV FLUORITE_LOG_DIR=/app/logs
ENV FLUORITE_LOG_LEVEL=info

# Switch to non-root user
USER fluorite

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD fluorite-mcp --self-test || exit 1

# Expose port (if running HTTP interface)
EXPOSE 3000

# Start the MCP server
CMD ["fluorite-mcp"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  fluorite-mcp:
    build:
      context: .
      dockerfile: Dockerfile.fluorite-mcp
    container_name: fluorite-mcp
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - FLUORITE_CATALOG_DIR=/app/catalog
      - FLUORITE_CACHE_DIR=/app/cache
      - FLUORITE_LOG_LEVEL=info
      - FLUORITE_MAX_MEMORY=4096
    volumes:
      - ./catalog:/app/catalog:ro
      - fluorite-cache:/app/cache
      - fluorite-logs:/app/logs
    networks:
      - fluorite-network
    healthcheck:
      test: ["CMD", "fluorite-mcp", "--self-test"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  fluorite-web:
    build:
      context: .
      dockerfile: Dockerfile.web
    container_name: fluorite-web-interface
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      fluorite-mcp:
        condition: service_healthy
    environment:
      - FLUORITE_MCP_HOST=fluorite-mcp
      - FLUORITE_MCP_PORT=8080
    networks:
      - fluorite-network

  fluorite-proxy:
    image: nginx:alpine
    container_name: fluorite-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
    depends_on:
      - fluorite-web
    networks:
      - fluorite-network

volumes:
  fluorite-cache:
    driver: local
  fluorite-logs:
    driver: local

networks:
  fluorite-network:
    driver: bridge
```

#### Kubernetes Deployment
```yaml
# k8s/fluorite-mcp-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fluorite-mcp
  namespace: development-tools
  labels:
    app: fluorite-mcp
    version: v1.0.0
spec:
  replicas: 3
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
        image: myregistry/fluorite-mcp:1.0.0
        ports:
        - containerPort: 8080
          name: mcp-port
        - containerPort: 3000
          name: http-port
        env:
        - name: NODE_ENV
          value: "production"
        - name: FLUORITE_CATALOG_DIR
          value: "/app/catalog"
        - name: FLUORITE_CACHE_DIR
          value: "/app/cache"
        - name: FLUORITE_LOG_LEVEL
          value: "info"
        - name: FLUORITE_MAX_MEMORY
          value: "4096"
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        volumeMounts:
        - name: catalog-volume
          mountPath: /app/catalog
          readOnly: true
        - name: cache-volume
          mountPath: /app/cache
        - name: logs-volume
          mountPath: /app/logs
        livenessProbe:
          exec:
            command:
            - fluorite-mcp
            - --self-test
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          exec:
            command:
            - fluorite-mcp
            - --performance-test
          initialDelaySeconds: 15
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
      volumes:
      - name: catalog-volume
        configMap:
          name: fluorite-catalog
      - name: cache-volume
        emptyDir:
          sizeLimit: "1Gi"
      - name: logs-volume
        emptyDir:
          sizeLimit: "500Mi"
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001

---
apiVersion: v1
kind: Service
metadata:
  name: fluorite-mcp-service
  namespace: development-tools
  labels:
    app: fluorite-mcp
spec:
  selector:
    app: fluorite-mcp
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: mcp
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  type: ClusterIP

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluorite-catalog
  namespace: development-tools
data:
  # Catalog specifications as ConfigMap data
  # (Specifications would be loaded here)
```

### Load Balancing and Scaling

#### HAProxy Configuration
```
# haproxy.cfg
global
    daemon
    maxconn 4096
    log stdout local0

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog

frontend fluorite_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/fluorite.pem
    redirect scheme https if !{ ssl_fc }
    default_backend fluorite_backend

backend fluorite_backend
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    
    server fluorite1 fluorite-mcp-1:3000 check
    server fluorite2 fluorite-mcp-2:3000 check
    server fluorite3 fluorite-mcp-3:3000 check

listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
```

---

## Monitoring and Observability

### Prometheus Metrics

#### Metrics Collection
```typescript
// monitoring/prometheus-integration.ts
import prometheus from 'prom-client';
import { FluoriteIntegration } from '../fluorite-integration';

export class FluoritePrometheusMetrics {
  private registry: prometheus.Registry;
  private fluorite: FluoriteIntegration;
  
  // Metrics definitions
  private requestDuration = new prometheus.Histogram({
    name: 'fluorite_request_duration_seconds',
    help: 'Duration of Fluorite MCP requests in seconds',
    labelNames: ['tool', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });
  
  private requestCount = new prometheus.Counter({
    name: 'fluorite_requests_total',
    help: 'Total number of Fluorite MCP requests',
    labelNames: ['tool', 'status']
  });
  
  private activeConnections = new prometheus.Gauge({
    name: 'fluorite_active_connections',
    help: 'Number of active MCP connections'
  });
  
  private cacheHitRate = new prometheus.Gauge({
    name: 'fluorite_cache_hit_rate',
    help: 'Cache hit rate for Fluorite operations'
  });
  
  private analysisErrors = new prometheus.Counter({
    name: 'fluorite_analysis_errors_total',
    help: 'Total number of analysis errors',
    labelNames: ['error_type', 'framework']
  });
  
  private spikeApplications = new prometheus.Counter({
    name: 'fluorite_spike_applications_total',
    help: 'Total number of spike template applications',
    labelNames: ['template_id', 'status']
  });
  
  constructor() {
    this.registry = new prometheus.Registry();
    this.fluorite = new FluoriteIntegration();
    
    // Register metrics
    this.registry.registerMetric(this.requestDuration);
    this.registry.registerMetric(this.requestCount);
    this.registry.registerMetric(this.activeConnections);
    this.registry.registerMetric(this.cacheHitRate);
    this.registry.registerMetric(this.analysisErrors);
    this.registry.registerMetric(this.spikeApplications);
    
    // Collect default metrics
    prometheus.collectDefaultMetrics({ register: this.registry });
    
    // Start collecting Fluorite-specific metrics
    this.startMetricsCollection();
  }
  
  private async startMetricsCollection() {
    await this.fluorite.initialize();
    
    // Collect metrics every 30 seconds
    setInterval(async () => {
      try {
        const health = await this.fluorite.getHealthStatus();
        
        if (health.metrics) {
          // Update cache hit rate
          this.cacheHitRate.set(health.metrics.cache?.hitRate || 0);
          
          // Update active connections (if available)
          this.activeConnections.set(health.metrics.connections || 0);
        }
      } catch (error) {
        console.error('Failed to collect Fluorite metrics:', error);
      }
    }, 30000);
  }
  
  public instrumentRequest(tool: string) {
    const end = this.requestDuration.startTimer({ tool });
    
    return {
      success: () => {
        end({ status: 'success' });
        this.requestCount.inc({ tool, status: 'success' });
      },
      error: (errorType?: string) => {
        end({ status: 'error' });
        this.requestCount.inc({ tool, status: 'error' });
        
        if (tool === 'static-analysis' && errorType) {
          this.analysisErrors.inc({ error_type: errorType, framework: 'unknown' });
        }
      }
    };
  }
  
  public recordSpikeApplication(templateId: string, success: boolean) {
    this.spikeApplications.inc({
      template_id: templateId,
      status: success ? 'success' : 'failure'
    });
  }
  
  public getMetrics(): string {
    return this.registry.metrics();
  }
  
  public getRegistry(): prometheus.Registry {
    return this.registry;
  }
}

// Express endpoint for metrics
export function createMetricsEndpoint() {
  const metrics = new FluoritePrometheusMetrics();
  
  return async (req: any, res: any) => {
    try {
      res.set('Content-Type', prometheus.register.contentType);
      res.end(await metrics.getMetrics());
    } catch (error) {
      res.status(500).end('Error collecting metrics');
    }
  };
}
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "Fluorite MCP Monitoring",
    "tags": ["fluorite", "mcp", "development"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fluorite_requests_total[5m])",
            "legendFormat": "{{tool}} - {{status}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Request Duration",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(fluorite_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(fluorite_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "id": 3,
        "title": "Cache Hit Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "fluorite_cache_hit_rate",
            "format": "percent"
          }
        ]
      },
      {
        "id": 4,
        "title": "Active Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "fluorite_active_connections"
          }
        ]
      },
      {
        "id": 5,
        "title": "Analysis Errors",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fluorite_analysis_errors_total[5m])",
            "legendFormat": "{{error_type}} - {{framework}}"
          }
        ]
      },
      {
        "id": 6,
        "title": "Spike Applications",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(fluorite_spike_applications_total[5m])",
            "legendFormat": "{{template_id}} - {{status}}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### Logging and Alerting

#### Structured Logging
```typescript
// monitoring/structured-logging.ts
import winston from 'winston';
import { FluoriteIntegration } from '../fluorite-integration';

export class FluoriteLogger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'fluorite-mcp',
        version: process.env.npm_package_version
      },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
    
    // Add request correlation IDs
    this.logger.add(new winston.transports.File({
      filename: 'audit.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }));
  }
  
  public logRequest(tool: string, params: any, correlationId: string) {
    this.logger.info('MCP request started', {
      tool,
      params: this.sanitizeParams(params),
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
  
  public logResponse(tool: string, success: boolean, duration: number, correlationId: string) {
    this.logger.info('MCP request completed', {
      tool,
      success,
      duration,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
  
  public logError(tool: string, error: Error, correlationId: string) {
    this.logger.error('MCP request failed', {
      tool,
      error: error.message,
      stack: error.stack,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
  
  public logAnalysisResult(result: any, framework: string, correlationId: string) {
    this.logger.info('Analysis completed', {
      framework,
      errorsFound: result.summary?.errors || 0,
      warningsFound: result.summary?.warnings || 0,
      filesAnalyzed: result.summary?.filesAnalyzed || 0,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
  
  public logSpikeApplication(templateId: string, success: boolean, correlationId: string) {
    this.logger.info('Spike template applied', {
      templateId,
      success,
      correlationId,
      timestamp: new Date().toISOString()
    });
  }
  
  private sanitizeParams(params: any): any {
    const sanitized = { ...params };
    
    // Remove sensitive data
    if (sanitized.code && sanitized.code.length > 1000) {
      sanitized.code = sanitized.code.substring(0, 1000) + '... (truncated)';
    }
    
    return sanitized;
  }
}

// Usage with Fluorite Integration
export class MonitoredFluoriteIntegration extends FluoriteIntegration {
  private logger: FluoriteLogger;
  private metrics: FluoritePrometheusMetrics;
  
  constructor() {
    super();
    this.logger = new FluoriteLogger();
    this.metrics = new FluoritePrometheusMetrics();
  }
  
  public async analyzeProject(projectPath: string, framework?: string): Promise<any> {
    const correlationId = this.generateCorrelationId();
    const timer = this.metrics.instrumentRequest('static-analysis');
    
    this.logger.logRequest('static-analysis', { projectPath, framework }, correlationId);
    
    try {
      const start = Date.now();
      const result = await super.analyzeProject(projectPath, framework);
      const duration = Date.now() - start;
      
      this.logger.logResponse('static-analysis', true, duration, correlationId);
      this.logger.logAnalysisResult(result, framework || 'unknown', correlationId);
      timer.success();
      
      return result;
    } catch (error) {
      this.logger.logError('static-analysis', error as Error, correlationId);
      timer.error(error.constructor.name);
      throw error;
    }
  }
  
  public async applySpike(id: string, params?: Record<string, string>, strategy?: any): Promise<any> {
    const correlationId = this.generateCorrelationId();
    const timer = this.metrics.instrumentRequest('apply-spike');
    
    this.logger.logRequest('apply-spike', { id, params, strategy }, correlationId);
    
    try {
      const start = Date.now();
      const result = await super.applySpike(id, params, strategy);
      const duration = Date.now() - start;
      
      this.logger.logResponse('apply-spike', result.success, duration, correlationId);
      this.logger.logSpikeApplication(id, result.success, correlationId);
      this.metrics.recordSpikeApplication(id, result.success);
      timer.success();
      
      return result;
    } catch (error) {
      this.logger.logError('apply-spike', error as Error, correlationId);
      this.metrics.recordSpikeApplication(id, false);
      timer.error(error.constructor.name);
      throw error;
    }
  }
  
  private generateCorrelationId(): string {
    return `fluorite-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
```

#### Alerting Rules
```yaml
# alerting/fluorite-alerts.yml
groups:
  - name: fluorite-mcp
    rules:
      - alert: FluoriteMCPHighErrorRate
        expr: rate(fluorite_requests_total{status="error"}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
          service: fluorite-mcp
        annotations:
          summary: "High error rate in Fluorite MCP"
          description: "Error rate is {{ $value }} errors per second"
          
      - alert: FluoriteMCPSlowRequests
        expr: histogram_quantile(0.95, rate(fluorite_request_duration_seconds_bucket[5m])) > 10
        for: 5m
        labels:
          severity: warning
          service: fluorite-mcp
        annotations:
          summary: "Slow requests in Fluorite MCP"
          description: "95th percentile latency is {{ $value }} seconds"
          
      - alert: FluoriteMCPDown
        expr: up{job="fluorite-mcp"} == 0
        for: 1m
        labels:
          severity: critical
          service: fluorite-mcp
        annotations:
          summary: "Fluorite MCP is down"
          description: "Fluorite MCP has been down for more than 1 minute"
          
      - alert: FluoriteMCPLowCacheHitRate
        expr: fluorite_cache_hit_rate < 0.5
        for: 10m
        labels:
          severity: info
          service: fluorite-mcp
        annotations:
          summary: "Low cache hit rate in Fluorite MCP"
          description: "Cache hit rate is {{ $value }}, consider reviewing cache configuration"
          
      - alert: FluoriteMCPHighMemoryUsage
        expr: (process_resident_memory_bytes{job="fluorite-mcp"} / 1024 / 1024 / 1024) > 4
        for: 5m
        labels:
          severity: warning
          service: fluorite-mcp
        annotations:
          summary: "High memory usage in Fluorite MCP"
          description: "Memory usage is {{ $value }}GB"
```

---

## Quick Integration Examples

### 5-Minute Team Setup

**Scenario**: Get a small development team up and running with Fluorite MCP in 5 minutes.

```bash
#!/bin/bash
# quick-team-setup.sh

echo "🚀 5-Minute Fluorite MCP Team Setup"
echo "=================================="

# 1. Install for team lead
npm install -g fluorite-mcp
claude mcp add fluorite-mcp -- fluorite-mcp

# 2. Verify installation
echo "✅ Testing installation..."
fluorite-mcp --self-test

# 3. Create team configuration
mkdir -p .fluorite
cat > .fluorite/team-config.yml << EOF
team:
  name: "Development Team"
  size: "small"
  
frameworks:
  primary: ["nextjs", "react"]
  
quality_gates:
  error_threshold: 3
  warning_threshold: 10
EOF

# 4. Test with sample project
echo "🧪 Testing with sample component..."
echo 'import React from "react"; export const Button = () => <button>Click me</button>;' > sample.tsx

# Use Claude Code CLI to analyze
echo "Sample analysis result:"
claude-code "Analyze this React component for best practices and suggest improvements" < sample.tsx

echo "✅ Setup complete! Share these commands with your team:"
echo "  npm install -g fluorite-mcp"
echo "  claude mcp add fluorite-mcp -- fluorite-mcp"
```

### Instant Project Analysis

**Scenario**: Quickly analyze any project for issues and improvements.

```bash
# instant-analysis.sh
#!/bin/bash

PROJECT_PATH=${1:-.}
FRAMEWORK=${2:-auto-detect}

echo "🔍 Instant Project Analysis"
echo "=========================="
echo "Path: $PROJECT_PATH"
echo "Framework: $FRAMEWORK"
echo ""

# Quick validation
fluorite-mcp --static-analysis \
  --project-path "$PROJECT_PATH" \
  --framework "$FRAMEWORK" \
  --max-issues 20 \
  --output-format summary

echo ""
echo "📊 Performance test:"
time fluorite-mcp --performance-test

echo ""
echo "💡 To see full analysis, run:"
echo "  fluorite-mcp --static-analysis --project-path \"$PROJECT_PATH\" --framework \"$FRAMEWORK\""
```

### Spike Template Discovery

**Scenario**: Find and apply the perfect template for your project quickly.

```javascript
// quick-spike-finder.js
const { FluoriteIntegration } = require('./lib/fluorite-integration');

async function quickSpikeFinder(userQuery) {
  const fluorite = new FluoriteIntegration();
  await fluorite.initialize();
  
  console.log(`🔍 Finding templates for: "${userQuery}"`);
  
  // Discover templates
  const templates = await fluorite.discoverSpikes(userQuery);
  
  if (templates.length === 0) {
    console.log('❌ No templates found. Try a broader search term.');
    return;
  }
  
  console.log(`✅ Found ${templates.length} templates:`);
  
  templates.slice(0, 5).forEach((template, index) => {
    console.log(`${index + 1}. 🔐 ${template.id}`);
    console.log(`   📝 ${template.description}`);
    console.log(`   🏗️ Stack: ${template.stack.join(', ')}`);
    console.log('');
  });
  
  // Auto-select best match
  const recommendation = await fluorite.autoSelectSpike(userQuery);
  
  if (recommendation.selectedTemplate) {
    console.log(`🎯 Best match: ${recommendation.selectedTemplate}`);
    console.log(`📊 Confidence: ${Math.round(recommendation.confidence * 100)}%`);
    console.log(`💭 Reasoning: ${recommendation.reasoning}`);
    
    console.log('\n🚀 To apply this template, run:');
    console.log(`fluorite-mcp --apply-spike ${recommendation.selectedTemplate}`);
  }
}

// Usage examples
if (require.main === module) {
  const query = process.argv[2] || 'React form with validation';
  quickSpikeFinder(query).catch(console.error);
}

// Run with: node quick-spike-finder.js "Next.js API with authentication"
```

### Common Integration Patterns

#### Pattern 1: Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🔍 Running Fluorite MCP pre-commit checks..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|vue|py)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No relevant files to check"
  exit 0
fi

# Quick validation
fluorite-mcp --quick-validate \
  --files "$STAGED_FILES" \
  --framework auto-detect \
  --fast-mode

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit validation failed. Please fix issues before committing."
  exit 1
fi

echo "✅ Pre-commit validation passed"
```

#### Pattern 2: VS Code Task
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Fluorite: Analyze Current File",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--quick-validate",
        "--file", "${file}",
        "--framework", "auto-detect"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": []
    },
    {
      "label": "Fluorite: Project Analysis",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--static-analysis",
        "--project-path", "${workspaceFolder}",
        "--framework", "auto-detect"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "new"
      }
    },
    {
      "label": "Fluorite: Apply Spike Template",
      "type": "shell",
      "command": "fluorite-mcp",
      "args": [
        "--discover-spikes",
        "--query", "${input:spikeQuery}"
      ],
      "group": "build"
    }
  ],
  "inputs": [
    {
      "id": "spikeQuery",
      "description": "What kind of template are you looking for?",
      "default": "React component",
      "type": "promptString"
    }
  ]
}
```

#### Pattern 3: Package.json Scripts
```json
{
  "scripts": {
    "fluorite:analyze": "fluorite-mcp --static-analysis --project-path . --framework auto-detect",
    "fluorite:validate": "fluorite-mcp --quick-validate --framework auto-detect",
    "fluorite:performance": "fluorite-mcp --performance-test",
    "fluorite:health": "fluorite-mcp --self-test",
    "fluorite:spikes": "fluorite-mcp --discover-spikes",
    "precommit": "fluorite-mcp --quick-validate --staged-files",
    "prebuild": "npm run fluorite:validate",
    "test:quality": "npm run fluorite:analyze && npm run test"
  }
}
```

## Framework-Specific Integration Examples

### Next.js Integration

```typescript
// next.config.js enhancement
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Add Fluorite MCP development integration
      config.plugins.push(
        new (class FluoriteMCPPlugin {
          apply(compiler) {
            compiler.hooks.afterCompile.tap('FluoriteMCP', (compilation) => {
              // Run quick validation on changed files
              const changedFiles = Array.from(compilation.fileDependencies)
                .filter(file => file.includes('/src/') && file.match(/\.(ts|tsx|js|jsx)$/));
              
              if (changedFiles.length > 0) {
                // Background validation (non-blocking)
                setImmediate(() => {
                  import('./tools/fluorite-validator').then(({ validateFiles }) => {
                    validateFiles(changedFiles).catch(console.error);
                  });
                });
              }
            });
          }
        })()
      );
    }
    
    return config;
  }
};

module.exports = nextConfig;
```

### React Development

```typescript
// tools/react-dev-integration.ts
import { FluoriteIntegration } from './fluorite-integration';

export class ReactDevIntegration {
  private fluorite: FluoriteIntegration;
  
  constructor() {
    this.fluorite = new FluoriteIntegration();
  }
  
  async setupDevelopmentMode() {
    await this.fluorite.initialize();
    
    // Watch for component changes
    if (process.env.NODE_ENV === 'development') {
      this.watchComponentChanges();
    }
  }
  
  private watchComponentChanges() {
    const chokidar = require('chokidar');
    
    chokidar.watch('src/**/*.{tsx,jsx}').on('change', async (filePath) => {
      console.log(`🔍 Validating ${filePath}...`);
      
      try {
        const validation = await this.fluorite.validateCode(
          require('fs').readFileSync(filePath, 'utf8'),
          'tsx',
          'react'
        );
        
        if (!validation.valid) {
          console.warn(`⚠️ Issues found in ${filePath}:`);
          validation.issues.forEach(issue => {
            console.warn(`  - ${issue.message}`);
          });
        }
      } catch (error) {
        console.error(`❌ Validation failed for ${filePath}:`, error.message);
      }
    });
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  const integration = new ReactDevIntegration();
  integration.setupDevelopmentMode();
}
```

### FastAPI Integration

```python
# tools/fastapi_fluorite_integration.py
import asyncio
import subprocess
import json
from typing import Dict, List
from fastapi import FastAPI, BackgroundTasks
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class FluoriteFileHandler(FileSystemEventHandler):
    def __init__(self, app: FastAPI):
        self.app = app
        
    def on_modified(self, event):
        if event.is_directory:
            return
            
        if event.src_path.endswith('.py'):
            # Run validation in background
            asyncio.create_task(self.validate_file(event.src_path))
    
    async def validate_file(self, file_path: str):
        try:
            # Run Fluorite MCP validation
            result = subprocess.run([
                'fluorite-mcp', '--quick-validate',
                '--file', file_path,
                '--language', 'python',
                '--framework', 'fastapi'
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"⚠️ Validation issues in {file_path}:")
                print(result.stdout)
                
        except Exception as e:
            print(f"❌ Validation failed for {file_path}: {e}")

def setup_fluorite_integration(app: FastAPI):
    """Setup Fluorite MCP integration for FastAPI development"""
    
    if not app.debug:
        return
    
    # Watch for file changes
    event_handler = FluoriteFileHandler(app)
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=True)
    observer.start()
    
    @app.on_event("startup")
    async def startup_validation():
        print("🔍 Running startup validation with Fluorite MCP...")
        
        try:
            result = subprocess.run([
                'fluorite-mcp', '--static-analysis',
                '--project-path', '.',
                '--framework', 'fastapi',
                '--max-issues', '10'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Startup validation passed")
            else:
                print("⚠️ Validation issues found:")
                print(result.stdout)
                
        except Exception as e:
            print(f"❌ Startup validation failed: {e}")
    
    @app.on_event("shutdown")
    def shutdown_cleanup():
        observer.stop()
        observer.join()

# Usage in main.py
from fastapi import FastAPI
from tools.fastapi_fluorite_integration import setup_fluorite_integration

app = FastAPI()

# Setup Fluorite integration in development
if __name__ == "__main__":
    import os
    if os.getenv("ENV") == "development":
        setup_fluorite_integration(app)
```

## Troubleshooting Common Integration Issues

### Issue 1: Claude Code CLI Connection Problems

**Symptoms**: "Server not found" or connection timeout errors

**Diagnosis**:
```bash
# Check MCP server registration
claude mcp list | grep fluorite

# Check server status
claude mcp status fluorite

# Test server directly
fluorite-mcp --self-test

# Check logs
claude mcp logs fluorite --tail 50
```

**Solutions**:
```bash
# Remove and re-add server
claude mcp remove fluorite
claude mcp add fluorite-mcp -- fluorite-mcp

# Check for port conflicts
lsof -i :3000

# Verify Node.js version
node --version  # Should be >= 18.0

# Check permissions
ls -la $(which fluorite-mcp)
```

### Issue 2: Performance Problems

**Symptoms**: Slow analysis, high memory usage, timeouts

**Diagnosis**:
```bash
# Check system resources
top -p $(pgrep fluorite-mcp)

# Monitor memory usage
watch -n 5 'ps aux | grep fluorite-mcp'

# Check analysis performance
time fluorite-mcp --performance-test
```

**Solutions**:
```bash
# Increase memory allocation
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable caching
export FLUORITE_ENABLE_CACHE=true
export FLUORITE_CACHE_TTL=3600

# Optimize for your framework
export FLUORITE_PRIMARY_FRAMEWORK=nextjs

# Exclude large directories
export FLUORITE_IGNORE_PATTERNS="node_modules/**,dist/**,build/**"
```

### Issue 3: False Positives in Analysis

**Symptoms**: Incorrect error reports, warnings for valid code

**Solutions**:
```bash
# Update to latest version
npm update -g fluorite-mcp

# Configure custom rules
cat > .fluorite.json << EOF
{
  "rules": {
    "react-hooks-dependencies": "warning",
    "nextjs-client-server-boundary": "error"
  },
  "ignorePatterns": [
    "**/*.test.ts",
    "**/legacy/**"
  ],
  "framework": "nextjs",
  "strictMode": false
}
EOF

# Disable specific rules temporarily
export FLUORITE_DISABLED_RULES="rule-id-1,rule-id-2"
```

---

This comprehensive integration guide provides detailed patterns for integrating Fluorite MCP across development workflows, CI/CD pipelines, team collaboration, and enterprise deployment scenarios. Each section includes practical examples and production-ready configurations that can be adapted to specific organizational needs.

*Integration Guide v0.20.1 - Last updated: January 2025*