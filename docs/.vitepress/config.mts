// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'

const sharedNavigation = [
  { text: 'Home', link: '/' },
  { text: 'Getting Started', link: '/getting-started' },
  { text: 'Spike Templates', link: '/spike-templates' },
  { text: 'Specs', link: '/specs/' },
  { text: 'API', link: '/API' }
]

const japaneseNavigation = [
  { text: 'ホーム', link: '/ja/' },
  { text: 'はじめに', link: '/ja/getting-started' },
  { text: 'スパイクテンプレート', link: '/ja/spike-templates' },
  { text: '仕様', link: '/specs/' },
  { text: 'API', link: '/API' }
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
      text: '📖 User Guides',
      collapsed: false,
      items: [
        { text: 'Command Reference', link: '/commands' },
        { text: '/fl: Commands', link: '/fl-commands' },
        { text: '/fl: Commands Detailed', link: '/fl-commands-detailed' },
        { text: 'Use Cases & Examples', link: '/use-cases-examples' }
      ]
    },
    {
      text: '🧪 Advanced Features',
      collapsed: false,
      items: [
        { text: 'Spike Templates Guide', link: '/spike-templates' },
        { text: 'Template Creation', link: '/template-creation' },
        { text: 'Static Analysis', link: '/STATIC_ANALYSIS' }
      ]
    },
    {
      text: '🛠️ Developer Resources',
      collapsed: false,
      items: [
        { text: 'Developer Guide', link: '/developer' },
        { 
          text: 'Architecture',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Fluorite Wrapper Design', link: '/architecture/fluorite-wrapper-design' },
            { text: 'Implementation Roadmap', link: '/architecture/implementation-roadmap' },
            { text: 'Command Mapping Spec', link: '/architecture/command-mapping-spec' },
            { text: 'Claude CLI Integration', link: '/architecture/claude-cli-integration' },
            { text: 'Spike Template Expansion', link: '/architecture/spike-template-expansion-plan' },
            { text: 'Testing Strategy', link: '/architecture/testing-strategy' },
            { text: 'Deployment Plan', link: '/architecture/deployment-plan' }
          ]
        },
        { text: 'Integration Guide', link: '/integration-guide' },
        { text: 'Performance', link: '/performance' },
        { text: 'Function Reference', link: '/function-reference' }
      ]
    },
    {
      text: '🆘 Help & Support',
      collapsed: true,
      items: [
        { text: 'Troubleshooting', link: '/troubleshooting' },
        { text: 'API Reference', link: '/API' },
        { text: 'GitHub Issues', link: 'https://github.com/kotsutsumi/fluorite-mcp/issues' }
      ]
    }
  ]
}

const japaneseSidebar = {
  '/ja/': [
    {
      text: '🚀 クイックスタート',
      collapsed: false,
      items: [
        { text: 'Fluorite MCPとは', link: '/ja/' },
        { text: '5分で始める', link: '/ja/getting-started' },
        { text: 'インストール', link: '/ja/installation' },
        { text: '最初のプロジェクト', link: '/ja/introduction' }
      ]
    },
    {
      text: '⚡ 主要機能',
      collapsed: false,
      items: [
        { text: '✨ スパイクテンプレート (1,359+)', link: '/ja/spike-templates' },
        { text: '🔍 静的解析エンジン', link: '/ja/static-analysis' },
        { text: '📚 ライブラリ仕様カタログ', link: '/specs/' },
        { text: '🎯 /fl: コマンドシステム', link: '/ja/fl-commands' }
      ]
    },
    {
      text: '📖 ユーザーガイド',
      collapsed: false,
      items: [
        { text: 'コマンドリファレンス', link: '/ja/commands' },
        { text: '/fl: コマンド詳細', link: '/ja/fl-commands-detailed' },
        { text: '実際の使用例', link: '/ja/use-cases-examples' },
        { text: 'テンプレート作成ガイド', link: '/ja/template-creation' }
      ]
    },
    {
      text: '🧪 高度な使い方',
      collapsed: false,
      items: [
        { text: '機能の詳細解説', link: '/ja/features' },
        { text: 'スパイクテンプレート詳細', link: '/ja/spike-templates-detailed' },
        { text: 'パフォーマンス最適化', link: '/ja/performance' },
        { text: '統合ガイド', link: '/ja/integration-guide' }
      ]
    },
    {
      text: '🛠️ 開発者向け',
      collapsed: true,
      items: [
        { text: '開発者ガイド', link: '/ja/developer' },
        { text: 'アーキテクチャ概要', link: '/ARCHITECTURE_SUMMARY.ja' },
        { 
          text: '詳細設計ドキュメント',
          collapsed: true,
          items: [
            { text: 'システム設計', link: '/ja/architecture/' },
            { text: 'MCPサーバー設計', link: '/ja/architecture/fluorite-wrapper-design' },
            { text: '実装計画', link: '/ja/architecture/implementation-roadmap' },
            { text: 'コマンドマッピング', link: '/ja/architecture/command-mapping-spec' },
            { text: 'Claude CLI統合', link: '/ja/architecture/claude-cli-integration' },
            { text: 'テンプレート拡張', link: '/ja/architecture/spike-template-expansion-plan' },
            { text: 'テスト戦略', link: '/ja/architecture/testing-strategy' },
            { text: 'デプロイ計画', link: '/ja/architecture/deployment-plan' }
          ]
        },
        { text: '関数リファレンス', link: '/function-reference.ja' }
      ]
    },
    {
      text: '📋 仕様カタログ',
      collapsed: false,
      items: [
        { text: '📚 ライブラリ一覧', link: '/specs/' },
        { text: '🌟 包括的エコシステム', link: '/specs/ai-ml-llm-comprehensive' },
        { text: '💻 言語別エコシステム', link: '/specs/langs' },
        { text: '🎨 フロントエンド・UI', link: '/specs/frontend-ui-innovation' },
        { text: '🚀 バックエンド・インフラ', link: '/specs/modern-backend-serverless' }
      ]
    },
    {
      text: '🆘 ヘルプ',
      collapsed: true,
      items: [
        { text: 'トラブルシューティング', link: '/ja/troubleshooting' },
        { text: 'APIリファレンス', link: '/API' },
        { text: 'GitHub Issues', link: 'https://github.com/kotsutsumi/fluorite-mcp/issues' },
        { text: 'コミュニティ', link: 'https://github.com/kotsutsumi/fluorite-mcp/discussions' }
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
