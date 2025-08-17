// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'

const sharedNavigation = [
  { text: 'Home', link: '/' },
  { text: 'Features', link: '/features' },
  { text: 'Getting Started', link: '/getting-started' },
  { text: 'Spike Templates', link: '/spike-templates' },
  { text: 'Specs', link: '/specs/' },
  { text: 'API', link: '/API' }
]

const japaneseNavigation = [
  { text: 'ホーム', link: '/ja/' },
  { text: '機能', link: '/ja/features' },
  { text: 'はじめに', link: '/ja/getting-started' },
  { text: 'スパイクテンプレート', link: '/ja/spike-templates' },
  { text: '仕様', link: '/specs/' },
  { text: 'API', link: '/ja/API' }
]

const englishSidebar = {
  '/': [
    {
      text: '🚀 Getting Started',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/' },
        { text: 'Quick Start (5 min)', link: '/getting-started' },
        { text: 'Installation Guide', link: '/installation' },
        { text: 'Your First Project', link: '/introduction' }
      ]
    },
    {
      text: '⚡ Core Features',
      collapsed: false,
      items: [
        { text: '🤖 Complete Feature Guide', link: '/features' },
        { text: '🧪 Spike Templates (1,842+)', link: '/spike-templates' },
        { text: '🔍 Static Analysis & Validation', link: '/static-analysis' },
        { text: '📚 Library Specifications (86+)', link: '/specs/' },
        { text: '🎯 /fl: Command Integration', link: '/fl-commands' },
        { text: '⚡ Performance Optimization', link: '/performance' }
      ]
    },
    {
      text: '📖 Practical Guides',
      collapsed: false,
      items: [
        { text: 'Complete Command Reference', link: '/commands' },
        { text: '/fl: Commands Detailed', link: '/fl-commands-detailed' },
        { text: 'Real-world Use Cases', link: '/use-cases-examples' },
        { text: 'Template Creation Guide', link: '/template-creation' }
      ]
    },
    {
      text: '🔧 Integration & Development',
      collapsed: false,
      items: [
        { text: 'Claude Code CLI Integration', link: '/integration-guide' },
        { text: 'Developer API Reference', link: '/API' },
        { text: 'Function Reference', link: '/function-reference' },
        { text: 'Advanced Customization', link: '/developer' }
      ]
    },
    {
      text: '🏗️ Architecture',
      collapsed: true,
      items: [
        { text: 'System Design Overview', link: '/architecture/' },
        { text: 'MCP Integration Architecture', link: '/architecture/claude-cli-integration' },
        { text: 'Command Mapping Specification', link: '/architecture/command-mapping-spec' },
        { text: 'Template System Design', link: '/architecture/spike-template-expansion-plan' },
        { text: 'Testing Strategy', link: '/architecture/testing-strategy' },
        { text: 'Deployment Planning', link: '/architecture/deployment-plan' }
      ]
    },
    {
      text: '📚 Specifications & Catalog',
      collapsed: false,
      items: [
        { text: 'Complete Library Catalog', link: '/specs/' },
        { text: 'Frontend UI Innovation', link: '/specs/frontend-ui-innovation' },
        { text: 'Modern Backend/Serverless', link: '/specs/modern-backend-serverless' },
        { text: 'AI/ML & LLM Integration', link: '/specs/ai-ml-llm-comprehensive' },
        { text: 'Cloud Native Infrastructure', link: '/specs/cloud-native-infrastructure' },
        { text: 'Language Ecosystems', link: '/specs/langs' }
      ]
    },
    {
      text: '🆘 Support',
      collapsed: true,
      items: [
        { text: 'Troubleshooting', link: '/troubleshooting' },
        { text: 'Common Issues & Solutions', link: '/troubleshooting#common-issues' },
        { text: 'GitHub Issues', link: 'https://github.com/kotsutsumi/fluorite-mcp/issues' },
        { text: 'Community Discussions', link: 'https://github.com/kotsutsumi/fluorite-mcp/discussions' }
      ]
    }
  ]
}

const japaneseSidebar = {
  '/ja/': [
    {
      text: '🚀 はじめに',
      collapsed: false,
      items: [
        { text: 'Fluorite MCPとは', link: '/ja/' },
        { text: '5分でセットアップ', link: '/ja/getting-started' },
        { text: 'インストールガイド', link: '/ja/installation' },
        { text: '最初のプロジェクト', link: '/ja/introduction' }
      ]
    },
    {
      text: '⚡ 核心機能',
      collapsed: false,
      items: [
        { text: '🧪 スパイクテンプレート (1,842+)', link: '/ja/spike-templates' },
        { text: '🔍 静的解析・検証', link: '/ja/static-analysis' },
        { text: '📚 ライブラリ仕様 (86+)', link: '/specs/' },
        { text: '🎯 /fl: コマンド統合', link: '/ja/fl-commands' },
        { text: '🤖 MCPサーバー機能', link: '/ja/features' }
      ]
    },
    {
      text: '📖 実用ガイド',
      collapsed: false,
      items: [
        { text: 'コマンド完全リファレンス', link: '/ja/commands' },
        { text: '/fl: コマンド詳細解説', link: '/ja/fl-commands-detailed' },
        { text: '実践的使用例・パターン', link: '/ja/use-cases-examples' },
        { text: 'パフォーマンス最適化', link: '/ja/performance' }
      ]
    },
    {
      text: '🔧 統合・開発',
      collapsed: false,
      items: [
        { text: 'Claude Code CLI統合', link: '/ja/integration-guide' },
        { text: 'カスタムテンプレート作成', link: '/ja/template-creation' },
        { text: '開発者向けAPI', link: '/ja/API' },
        { text: '高度なカスタマイズ', link: '/ja/developer' }
      ]
    },
    {
      text: '🏗️ アーキテクチャ',
      collapsed: true,
      items: [
        { text: 'システム設計概要', link: '/ja/architecture/' },
        { text: 'MCP統合アーキテクチャ', link: '/ja/architecture/claude-cli-integration' },
        { text: 'コマンドマッピング仕様', link: '/ja/architecture/command-mapping-spec' },
        { text: 'テンプレートシステム', link: '/ja/architecture/spike-template-expansion-plan' },
        { text: 'テスト戦略', link: '/ja/architecture/testing-strategy' },
        { text: 'デプロイメント計画', link: '/ja/architecture/deployment-plan' }
      ]
    },
    {
      text: '📚 仕様・カタログ',
      collapsed: false,
      items: [
        { text: '全ライブラリ一覧', link: '/specs/' },
        { text: 'フロントエンド・UI革新', link: '/specs/frontend-ui-innovation' },
        { text: 'モダンバックエンド', link: '/specs/modern-backend-serverless' },
        { text: 'AI・ML・LLM', link: '/specs/ai-ml-llm-comprehensive' },
        { text: 'クラウドネイティブ', link: '/specs/cloud-native-infrastructure' },
        { text: '言語エコシステム', link: '/specs/langs' }
      ]
    },
    {
      text: '🆘 サポート',
      collapsed: true,
      items: [
        { text: 'トラブルシューティング', link: '/ja/troubleshooting' },
        { text: 'よくある質問・解決策', link: '/ja/troubleshooting#common-issues' },
        { text: 'GitHub Issues', link: 'https://github.com/kotsutsumi/fluorite-mcp/issues' },
        { text: 'コミュニティディスカッション', link: 'https://github.com/kotsutsumi/fluorite-mcp/discussions' }
      ]
    }
  ]
}

const specsSidebar = {
  '/specs/': [
    { 
      text: '📋 Library Catalog', 
      link: '/specs/',
      items: []
    },
    {
      text: '🌟 Comprehensive Ecosystems',
      collapsed: false,
      items: [
        { text: 'Expo/React Native', link: '/specs/expo-react-native-comprehensive' },
        { text: 'AI/ML・LLM Integration', link: '/specs/ai-ml-llm-comprehensive' },
        { text: 'Frontend UI Innovation', link: '/specs/frontend-ui-innovation' },
        { text: 'Modern Backend/Serverless', link: '/specs/modern-backend-serverless' },
        { text: 'Development Efficiency', link: '/specs/development-efficiency-dx' },
        { text: 'Data Processing & Analytics', link: '/specs/data-processing-analytics' },
        { text: 'Cloud Native Infrastructure', link: '/specs/cloud-native-infrastructure' },
        { text: 'Testing & DB & Visualization', link: '/specs/additional-modern-technologies' }
      ]
    },
    {
      text: '💻 Language Ecosystems',
      collapsed: true,
      items: [
        { text: '7 Language Ecosystems', link: '/specs/langs' },
        { text: 'Laravel/PHP', link: '/specs/laravel' },
        { text: 'FastAPI/Python', link: '/specs/fastapi' },
        { text: 'Rust/Tauri', link: '/specs/rust-tauri' },
        { text: 'Ruby on Rails', link: '/specs/ruby-rails' },
        { text: 'Shell/DevOps Tools', link: '/specs/shell-tools' }
      ]
    },
    {
      text: '🎨 Frontend & UI',
      collapsed: true,
      items: [
        { text: 'React DnD TreeView', link: '/specs/react-dnd-treeview' },
        { text: 'UI Component Quality', link: '/specs/ui-component-quality' },
        { text: 'Vue Ecosystem', link: '/specs/vue' },
        { text: 'Nuxt Ecosystem', link: '/specs/nuxt' },
        { text: 'VitePress/Documentation', link: '/specs/vitepress' }
      ]
    },
    {
      text: '🚀 Development & Infrastructure',
      collapsed: true,
      items: [
        { text: 'Spike Development', link: '/specs/spike-development' },
        { text: 'Cloud Platforms', link: '/specs/cloud-platforms' },
        { text: 'DevOps Operations', link: '/specs/devops' },
        { text: 'WebRTC/Streaming', link: '/specs/webrtc-streaming' }
      ]
    },
    {
      text: '📱 Mobile & Native',
      collapsed: true,
      items: [
        { text: 'Mobile Native (iOS/Android)', link: '/specs/mobile-native' },
        { text: 'Expo/React Native', link: '/specs/expo-react-native' }
      ]
    }
  ]
}

export default defineConfig({
  title: 'Fluorite MCP',
  description: 'Comprehensive Model Context Protocol server for Claude Code CLI - Library specifications, static analysis, and rapid prototyping',
  base: '/fluorite-mcp/',
  ignoreDeadLinks: true,
  cleanUrls: true,
  
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Fluorite MCP',
      description: 'Comprehensive Model Context Protocol server for Claude Code CLI',
      themeConfig: {
        nav: sharedNavigation,
        sidebar: {
          ...englishSidebar,
          ...specsSidebar
        },
        editLink: {
          pattern: 'https://github.com/kotsutsumi/fluorite-mcp/edit/main/docs/:path',
          text: 'Edit this page on GitHub'
        },
        outline: {
          level: [2, 3],
          label: 'On this page'
        }
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      title: 'Fluorite MCP',
      description: 'Claude Code CLI用の包括的なモデルコンテキストプロトコルサーバー',
      themeConfig: {
        nav: japaneseNavigation,
        sidebar: japaneseSidebar,
        editLink: {
          pattern: 'https://github.com/kotsutsumi/fluorite-mcp/edit/main/docs/:path',
          text: 'GitHubでこのページを編集'
        },
        outline: {
          level: [2, 3],
          label: 'このページ内'
        },
        docFooter: {
          prev: '前のページ',
          next: '次のページ'
        },
        darkModeSwitchLabel: 'ダークモード',
        sidebarMenuLabel: 'メニュー',
        returnToTopLabel: 'トップに戻る',
        langMenuLabel: '言語を変更',
        externalLinkIcon: true
      }
    }
  },

  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kotsutsumi/fluorite-mcp' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          ja: {
            translations: {
              button: {
                buttonText: '検索',
                buttonAriaLabel: 'ドキュメントを検索'
              },
              modal: {
                displayDetails: '詳細を表示',
                resetButtonTitle: 'リセット',
                backButtonTitle: '戻る',
                noResultsText: '結果が見つかりません',
                footer: {
                  selectText: '選択',
                  navigateText: 'ナビゲート',
                  closeText: '閉じる'
                }
              }
            }
          }
        }
      }
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Fluorite MCP Contributors'
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/fluorite-mcp/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Fluorite MCP | Comprehensive Model Context Protocol server' }],
    ['meta', { property: 'og:site_name', content: 'Fluorite MCP' }],
    ['meta', { property: 'og:image', content: 'https://kotsutsumi.github.io/fluorite-mcp/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://kotsutsumi.github.io/fluorite-mcp/' }]
  ],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins if needed
    }
  }
})
