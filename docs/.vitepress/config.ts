import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Fluorite MCP',
  description: 'AIとLLMを活用した次世代開発ツール - Next-generation development tools powered by AI and LLM',
  base: '/fluorite-mcp/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/fluorite-mcp/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'ja_JP' }],
    ['meta', { name: 'og:site_name', content: 'Fluorite MCP' }],
  ],

  locales: {
    root: {
      label: '日本語',
      lang: 'ja',
      title: 'Fluorite MCP',
      description: 'AIとLLMを活用した次世代開発ツール',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: 'ガイド', link: '/ja/getting-started' },
          { text: 'コマンド', link: '/ja/fl-commands' },
          { text: 'API', link: '/ja/API' },
          {
            text: 'v0.20.8',
            items: [
              { text: '変更履歴', link: '/ja/CHANGELOG' },
              { text: 'リリースノート', link: 'https://github.com/kotsutsumi/fluorite-mcp/releases' }
            ]
          }
        ],
        sidebar: {
          '/ja/': [
            {
              text: 'はじめに',
              collapsed: false,
              items: [
                { text: 'イントロダクション', link: '/ja/index' },
                { text: 'クイックスタート', link: '/ja/getting-started' },
                { text: 'インストール', link: '/ja/installation' },
              ]
            },
            {
              text: 'ユーザーガイド',
              collapsed: false,
              items: [
                { text: 'FLコマンド', link: '/ja/fl-commands' },
                { text: 'FLコマンド詳細', link: '/ja/fl-commands-detailed' },
                { text: '機能一覧', link: '/ja/features' },
                { text: 'スパイクテンプレート', link: '/ja/spike-templates' },
              ]
            },
            {
              text: '開発者向け',
              collapsed: false,
              items: [
                { text: 'API リファレンス', link: '/ja/API' },
                { text: 'アーキテクチャ', link: '/ja/architecture/' },
                { text: 'コントリビューション', link: '/ja/CONTRIBUTING' },
                { text: 'セキュリティ', link: '/ja/SECURITY' },
              ]
            },
            {
              text: '仕様書',
              collapsed: false,
              items: [
                { text: 'FastAPI', link: '/ja/specs/fastapi' },
                { text: 'Next.js', link: '/ja/specs/nextjs' },
                { text: 'Nuxt', link: '/ja/specs/nuxt' },
                { text: 'React Native', link: '/ja/specs/expo-react-native' },
                { text: 'Ruby on Rails', link: '/ja/specs/ruby-rails' },
                { text: 'Rust Tauri', link: '/ja/specs/rust-tauri' },
                { text: 'VitePress', link: '/ja/specs/vitepress' },
                { text: 'プログラミング言語', link: '/ja/specs/langs' },
                { text: 'シェルツール', link: '/ja/specs/shell-tools' },
                { text: 'UIコンポーネント品質', link: '/ja/specs/ui-component-quality' },
                { text: 'スパイク開発', link: '/ja/specs/spike-development' },
                { text: 'モバイルネイティブ', link: '/ja/specs/mobile-native' },
              ]
            },
            {
              text: 'その他',
              collapsed: false,
              items: [
                { text: 'トラブルシューティング', link: '/ja/troubleshooting' },
                { text: 'FAQ', link: '/ja/faq' },
                { text: '変更履歴', link: '/ja/CHANGELOG' },
                { text: 'ライセンス', link: '/ja/LICENSE' },
              ]
            }
          ]
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'Fluorite MCP',
      description: 'Next-generation development tools powered by AI and LLM',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/getting-started' },
          { text: 'Commands', link: '/fl-commands' },
          { text: 'API', link: '/API' },
          {
            text: 'v0.20.8',
            items: [
              { text: 'Changelog', link: '/CHANGELOG' },
              { text: 'Releases', link: 'https://github.com/kotsutsumi/fluorite-mcp/releases' }
            ]
          }
        ],
        sidebar: {
          '/': [
            {
              text: 'Getting Started',
              collapsed: false,
              items: [
                { text: 'Introduction', link: '/index' },
                { text: 'Quick Start', link: '/getting-started' },
                { text: 'Installation', link: '/installation' },
              ]
            },
            {
              text: 'User Guide',
              collapsed: false,
              items: [
                { text: 'FL Commands', link: '/fl-commands' },
                { text: 'FL Commands Detailed', link: '/fl-commands-detailed' },
                { text: 'Features', link: '/features' },
                { text: 'Spike Templates', link: '/spike-templates' },
              ]
            },
            {
              text: 'Developer Resources',
              collapsed: false,
              items: [
                { text: 'API Reference', link: '/API' },
                { text: 'Architecture', link: '/architecture/' },
                { text: 'Contributing', link: '/CONTRIBUTING' },
                { text: 'Security', link: '/SECURITY' },
              ]
            },
            {
              text: 'Specifications',
              collapsed: false,
              items: [
                { text: 'FastAPI', link: '/specs/fastapi' },
                { text: 'Next.js', link: '/specs/nextjs' },
                { text: 'Nuxt', link: '/specs/nuxt' },
                { text: 'React Native', link: '/specs/expo-react-native-comprehensive' },
                { text: 'Ruby on Rails', link: '/specs/ruby-rails' },
                { text: 'Rust Tauri', link: '/specs/rust-tauri' },
                { text: 'VitePress', link: '/specs/vitepress' },
                { text: 'Programming Languages', link: '/specs/langs' },
                { text: 'Shell Tools', link: '/specs/shell-tools' },
                { text: 'UI Component Quality', link: '/specs/ui-component-quality' },
                { text: 'Spike Development', link: '/specs/spike-development' },
                { text: 'Mobile Native', link: '/specs/mobile-native' },
              ]
            },
            {
              text: 'More',
              collapsed: false,
              items: [
                { text: 'Troubleshooting', link: '/troubleshooting' },
                { text: 'FAQ', link: '/faq' },
                { text: 'Changelog', link: '/CHANGELOG' },
                { text: 'License', link: '/LICENSE' },
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    
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
                buttonAriaLabel: '検索'
              },
              modal: {
                noResultsText: '結果が見つかりませんでした',
                resetButtonTitle: 'クリアする',
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
      copyright: 'Copyright © 2024-present Fluorite MCP Contributors'
    },

    editLink: {
      pattern: 'https://github.com/kotsutsumi/fluorite-mcp/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    docFooter: {
      prev: '前のページ',
      next: '次のページ'
    },

    outline: {
      label: '目次',
      level: [2, 3]
    },

    lastUpdated: {
      text: '最終更新日',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },

    langMenuLabel: '言語を変更',
    returnToTopLabel: 'トップに戻る',
    sidebarMenuLabel: 'サイドバー',
    darkModeSwitchLabel: 'ダークモード',
    lightModeSwitchTitle: 'ライトモードに切り替え',
    darkModeSwitchTitle: 'ダークモードに切り替え'
  }
})