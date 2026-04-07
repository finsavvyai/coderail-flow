import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'CodeRailFlow Docs',
  description: 'Browser automation with visual overlays and narration',
  appearance: 'force-dark',
  srcDir: 'src',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started/' },
      { text: 'API', link: '/api/' },
      { text: 'Steps', link: '/steps/' },
      { text: 'Pricing', link: 'https://flow.coderail.dev/pricing' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/getting-started/' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Step Types', link: '/steps/' },
          { text: 'API Reference', link: '/api/' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/finsavvyai/coderail-flow' },
    ],

    footer: {
      message: 'Built on Cloudflare',
    },
  },
})
