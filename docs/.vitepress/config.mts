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
      { text: 'Specs', link: '/specs/' }
    ],
    sidebar: {
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
            { text: 'React DnD TreeView', link: '/specs/react-dnd-treeview' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kotsutsumi/fluorite-mcp' }
    ]
  }
})
