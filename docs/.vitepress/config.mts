// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'fluorite-mcp',
  description: 'Library spec MCP server + docs',
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Specs', link: '/specs/' }
    ],
    sidebar: {
      '/specs/': [
        { text: 'Intro', link: '/specs/' },
        { text: 'React DnD TreeView', link: '/specs/react-dnd-treeview' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/fluorite-mcp' }
    ]
  }
})
