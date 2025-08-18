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
  { text: '仕様', link: '/ja/specs/' },
  { text: 'API', link: '/ja/API' }
]

const englishSidebar = {
  '/': [
    {
      text: '🚀 Getting Started',
      collapsed: false,
      items: [
        { text: 'Overview', link: '/' },
        { text: 'Installation', link: '/installation' },
        { text: 'Quick Start Guide', link: '/getting-started' },
        { text: 'First Template', link: '/introduction' }
      ]
    },
    {
      text: '⚡ Core Features',
      collapsed: false,
      items: [
        { text: '🧪 Spike Templates (3,100+)', link: '/spike-templates' },
        { text: '🎯 /fl: Commands', link: '/fl-commands' },
        { text: '🔍 Static Analysis', link: '/static-analysis' },
        { text: '📚 Library Specs', link: '/specs/' },
        { text: '🤖 MCP Server', link: '/features' },
        { text: '⚡ Performance', link: '/performance' }
      ]
    },
    {
      text: '📖 Documentation',
      collapsed: false,
      items: [
        { text: 'Command Reference', link: '/commands' },
        { text: 'API Reference', link: '/API' },
        { text: 'Function Reference', link: '/function-reference' },
        { text: 'Use Cases', link: '/use-cases-examples' },
        { text: 'Template Creation', link: '/template-creation' },
        { text: 'Developer Guide', link: '/developer' }
      ]
    },
    {
      text: '📚 Technology Catalog',
      collapsed: true,
      items: [
        { text: 'Overview', link: '/specs/' },
        { text: 'Frontend & UI', link: '/specs/frontend-ui-innovation' },
        { text: 'Backend & Serverless', link: '/specs/modern-backend-serverless' },
        { text: 'AI/ML & LLM', link: '/specs/ai-ml-llm-comprehensive' },
        { text: 'Cloud Infrastructure', link: '/specs/cloud-native-infrastructure' },
        { text: 'Language Ecosystems', link: '/specs/langs' }
      ]
    },
    {
      text: '🏗️ Architecture',
      collapsed: true,
      items: [
        { text: 'Overview', link: '/architecture/' },
        { text: 'MCP Integration', link: '/architecture/claude-cli-integration' },
        { text: 'Command Mapping', link: '/architecture/command-mapping-spec' },
        { text: 'Template System', link: '/architecture/spike-template-expansion-plan' },
        { text: 'Testing Strategy', link: '/architecture/testing-strategy' },
        { text: 'Deployment Plan', link: '/architecture/deployment-plan' }
      ]
    },
    {
      text: '🆘 Support',
      collapsed: true,
      items: [
        { text: 'Troubleshooting', link: '/troubleshooting' },
        { text: 'Common Issues', link: '/troubleshooting#common-issues' }
      ]
    }
  ]
}

const japaneseSpecsSidebar = {
  '/ja/specs/': [
    { 
      text: '📋 ライブラリカタログ', 
      link: '/ja/specs/',
      items: []
    },
    {
      text: '🌟 包括的エコシステム',
      collapsed: false,
      items: [
        { text: '🎨 フロントエンドUI革新', link: '/ja/specs/frontend-ui-innovation' },
        { text: '🚀 モダンバックエンド・サーバーレス', link: '/ja/specs/modern-backend-serverless' },
        { text: '🤖 AI/ML・LLM統合', link: '/ja/specs/ai-ml-llm-comprehensive' },
        { text: '📱 Expo/React Native', link: '/ja/specs/expo-react-native-comprehensive' },
        { text: '⚡ 開発効率・DX', link: '/ja/specs/development-efficiency-dx' },
        { text: '📊 データ処理・分析', link: '/ja/specs/data-processing-analytics' },
        { text: '☁️ クラウドネイティブインフラ', link: '/ja/specs/cloud-native-infrastructure' },
        { text: '🔧 テスティング・DB・可視化', link: '/ja/specs/additional-modern-technologies' }
      ]
    },
    {
      text: '💻 言語エコシステム',
      collapsed: true,
      items: [
        { text: '7つの言語エコシステム', link: '/ja/specs/langs' },
        { text: 'Laravel/PHP', link: '/ja/specs/laravel' },
        { text: 'FastAPI/Python', link: '/ja/specs/fastapi' },
        { text: 'Rust/Tauri', link: '/ja/specs/rust-tauri' },
        { text: 'Ruby on Rails', link: '/ja/specs/ruby-rails' },
        { text: 'シェル・DevOpsツール', link: '/ja/specs/shell-tools' }
      ]
    },
    {
      text: '🎨 フロントエンド・UI',
      collapsed: true,
      items: [
        { text: 'React DnD TreeView', link: '/ja/specs/react-dnd-treeview' },
        { text: 'UIコンポーネント品質', link: '/ja/specs/ui-component-quality' },
        { text: 'Vue エコシステム', link: '/ja/specs/vue' },
        { text: 'Nuxt エコシステム', link: '/ja/specs/nuxt' },
        { text: 'VitePress・ドキュメント', link: '/ja/specs/vitepress' }
      ]
    },
    {
      text: '🚀 開発・インフラ',
      collapsed: true,
      items: [
        { text: 'スパイク開発', link: '/ja/specs/spike-development' },
        { text: 'クラウドプラットフォーム', link: '/ja/specs/cloud-platforms' },
        { text: 'DevOps運用', link: '/ja/specs/devops' },
        { text: 'WebRTC・ストリーミング', link: '/ja/specs/webrtc-streaming' }
      ]
    },
    {
      text: '📱 モバイル・ネイティブ',
      collapsed: true,
      items: [
        { text: 'モバイルネイティブ (iOS/Android)', link: '/ja/specs/mobile-native' },
        { text: 'Expo/React Native', link: '/ja/specs/expo-react-native' }
      ]
    }
  ]
}

const japaneseSidebar = {
  '/ja/': [
    {
      text: '🚀 スタートガイド',
      collapsed: false,
      items: [
        { text: '概要', link: '/ja/' },
        { text: 'インストール', link: '/ja/installation' },
        { text: 'クイックスタート', link: '/ja/getting-started' },
        { text: '初めてのテンプレート', link: '/ja/introduction' }
      ]
    },
    {
      text: '⚡ コア機能',
      collapsed: false,
      items: [
        { text: '🧪 スパイクテンプレート (3,100+)', link: '/ja/spike-templates' },
        { text: '🎯 /fl: コマンド', link: '/ja/fl-commands' },
        { text: '🔍 静的解析', link: '/ja/static-analysis' },
        { text: '📚 ライブラリ仕様', link: '/ja/specs/' },
        { text: '🤖 MCPサーバー', link: '/ja/features' },
        { text: '⚡ パフォーマンス', link: '/ja/performance' }
      ]
    },
    {
      text: '📖 ドキュメント',
      collapsed: false,
      items: [
        { text: 'コマンドリファレンス', link: '/ja/commands' },
        { text: 'APIリファレンス', link: '/ja/API' },
        { text: '関数リファレンス', link: '/ja/function-reference' },
        { text: '使用事例', link: '/ja/use-cases-examples' },
        { text: 'テンプレート作成', link: '/ja/template-creation' },
        { text: '開発者ガイド', link: '/ja/developer' }
      ]
    },
    {
      text: '📚 技術カタログ',
      collapsed: true,
      items: [
        { text: '概要', link: '/ja/specs/' },
        { text: 'フロントエンド・UI', link: '/ja/specs/frontend-ui-innovation' },
        { text: 'バックエンド・サーバーレス', link: '/ja/specs/modern-backend-serverless' },
        { text: 'AI/ML・LLM', link: '/ja/specs/ai-ml-llm-comprehensive' },
        { text: 'クラウドインフラ', link: '/ja/specs/cloud-native-infrastructure' },
        { text: '言語エコシステム', link: '/ja/specs/langs' }
      ]
    },
    {
      text: '🏗️ アーキテクチャ',
      collapsed: true,
      items: [
        { text: '概要', link: '/ja/architecture/' },
        { text: 'MCP統合', link: '/ja/architecture/claude-cli-integration' },
        { text: 'コマンドマッピング', link: '/ja/architecture/command-mapping-spec' },
        { text: 'テンプレートシステム', link: '/ja/architecture/spike-template-expansion-plan' },
        { text: 'テスト戦略', link: '/ja/architecture/testing-strategy' },
        { text: 'デプロイプラン', link: '/ja/architecture/deployment-plan' }
      ]
    },
    {
      text: '🆘 サポート',
      collapsed: true,
      items: [
        { text: 'トラブルシューティング', link: '/ja/troubleshooting' },
        { text: 'よくある問題', link: '/ja/troubleshooting#common-issues' }
      ]
    }
  ]
}

const specsSidebar = {
  '/specs/': [
    { 
      text: '📋 Technology Catalog Overview', 
      link: '/specs/',
      items: []
    },
    {
      text: '🚀 Popular Tech Stacks',
      collapsed: false,
      items: [
        { text: '🎨 Frontend & UI Innovation', link: '/specs/frontend-ui-innovation' },
        { text: '⚡ Modern Backend & Serverless', link: '/specs/modern-backend-serverless' },
        { text: '🤖 AI/ML & LLM Integration', link: '/specs/ai-ml-llm-comprehensive' },
        { text: '☁️ Cloud Native Infrastructure', link: '/specs/cloud-native-infrastructure' },
        { text: '💻 Language Ecosystems (7 Languages)', link: '/specs/langs' },
        { text: '🛠️ Development Efficiency & DX', link: '/specs/development-efficiency-dx' }
      ]
    },
    {
      text: '🎨 Frontend & UI Frameworks',
      collapsed: false,
      items: [
        { text: 'Vue Ecosystem (Vue 3, Pinia, Composition API)', link: '/specs/vue' },
        { text: 'React DnD TreeView (Drag & Drop)', link: '/specs/react-dnd-treeview' },
        { text: 'Nuxt Ecosystem (SSR, Static Generation)', link: '/specs/nuxt' },
        { text: 'UI Component Quality & Design Systems', link: '/specs/ui-component-quality' },
        { text: 'VitePress & Documentation Sites', link: '/specs/vitepress' }
      ]
    },
    {
      text: '🌟 Comprehensive Ecosystems',
      collapsed: true,
      items: [
        { text: 'Expo/React Native Mobile Development', link: '/specs/expo-react-native-comprehensive' },
        { text: 'Data Processing & Analytics', link: '/specs/data-processing-analytics' },
        { text: 'Testing, Database & Visualization', link: '/specs/additional-modern-technologies' },
        { text: 'WebRTC & Real-time Streaming', link: '/specs/webrtc-streaming' }
      ]
    },
    {
      text: '💻 Backend & Language Ecosystems',
      collapsed: true,
      items: [
        { text: 'FastAPI & Python Ecosystem', link: '/specs/fastapi' },
        { text: 'Laravel & PHP Ecosystem', link: '/specs/laravel' },
        { text: 'Rust & Tauri Desktop Apps', link: '/specs/rust-tauri' },
        { text: 'Ruby on Rails Ecosystem', link: '/specs/ruby-rails' },
        { text: 'Shell Scripting & DevOps Tools', link: '/specs/shell-tools' }
      ]
    },
    {
      text: '🚀 Infrastructure & Operations',
      collapsed: true,
      items: [
        { text: 'Spike Development Workflow', link: '/specs/spike-development' },
        { text: 'Cloud Platforms (AWS, GCP, Azure)', link: '/specs/cloud-platforms' },
        { text: 'DevOps & CI/CD Operations', link: '/specs/devops' }
      ]
    },
    {
      text: '📱 Mobile Development',
      collapsed: true,
      items: [
        { text: 'Mobile Native (iOS/Android)', link: '/specs/mobile-native' },
        { text: 'Expo/React Native (Cross-platform)', link: '/specs/expo-react-native' }
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
        sidebar: {
          ...japaneseSidebar,
          ...japaneseSpecsSidebar
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
    socialLinks: [],

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
    ['meta', { property: 'og:image', content: '' }],
    ['meta', { property: 'og:url', content: '' }]
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
