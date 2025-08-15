// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'fluorite-mcp',
  description: 'Library spec MCP server + docs',
  base: '/fluorite-mcp/',
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Spike Templates', link: '/spike-templates' },
      { text: 'Specs', link: '/specs/' },
      { text: 'API', link: '/API' }
    ],
    sidebar: {
      '/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Overview', link: '/' },
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Installation', link: '/installation' },
            { text: 'Commands', link: '/commands' },
            { text: '/fl: Commands', link: '/fl-commands' },
            { text: '/fl: Commands Detailed', link: '/fl-commands-detailed' },
            { text: 'Spike Templates', link: '/spike-templates' },
            { text: 'Developer Guide', link: '/developer' },
            { text: 'API Reference', link: '/API' }
          ]
        }
      ],
      '/specs/': [
        { text: 'Intro', link: '/specs/' },
        {
          text: '包括的エコシステム',
          collapsed: false,
          items: [
            { text: 'Expo/React Native', link: '/specs/expo-react-native-comprehensive' },
            { text: 'AI/ML・LLM統合', link: '/specs/ai-ml-llm-comprehensive' },
            { text: 'フロントエンドUI革新', link: '/specs/frontend-ui-innovation' },
            { text: 'モダンバックエンド', link: '/specs/modern-backend-serverless' },
            { text: '開発効率・DX', link: '/specs/development-efficiency-dx' },
            { text: 'データ処理・分析', link: '/specs/data-processing-analytics' },
            { text: 'クラウドネイティブ', link: '/specs/cloud-native-infrastructure' },
            { text: 'テスティング・DB・可視化', link: '/specs/additional-modern-technologies' }
          ]
        },
        {
          text: '言語エコシステム',
          collapsed: true,
          items: [
            { text: '7つの言語エコシステム', link: '/specs/langs' }
          ]
        },
        {
          text: 'UIコンポーネント',
          collapsed: true,
          items: [
            { text: 'React DnD TreeView', link: '/specs/react-dnd-treeview' },
            { text: 'UIコンポーネント品質', link: '/specs/ui-component-quality' }
          ]
        },
        {
          text: 'Spike開発',
          collapsed: false,
          items: [
            { text: 'Spike開発エコシステム', link: '/specs/spike-development' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kotsutsumi/fluorite-mcp' }
    ]
  }
})
