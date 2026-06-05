import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Lab Tutorial',
  description: '一些小技巧 · Lab Tips',
  base: '/Lab-Tutorial/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: false,

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Fira+Code:wght@400;500&display=swap' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#141413"/><circle cx="16" cy="16" r="6" fill="#d97757"/></svg>')}` }],
  ],

  srcExclude: ['source/**', 'themes/**', 'scaffolds/**', '_config.yml', 'CLAUDE.md', 'README.md', 'node_modules/**'],

  locales: {
    zh: {
      label: '中文',
      lang: 'zh-CN',
      title: 'Lab Tutorial',
      description: '在共享/远程实验室服务器上干活时攒下的小技巧，每篇都是独立、可直接上手的短教程。',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '归档', link: '/zh/archives' },
          { text: '关于', link: '/about' },
        ],
        outline: { label: '目录', level: [2, 3] },
        docFooter: { prev: '上一篇', next: '下一篇' },
        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '语言',
        notFound: {
          title: '页面未找到',
          quote: '也许你可以看看其他教程？',
          linkLabel: '返回首页',
          linkText: '回到首页',
        },
        footer: {
          message: '一些小技巧 · Lab Tips',
          copyright: '© Lab Team',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Lab Tutorial',
      description: 'Short, standalone, hands-on tutorials from working on shared/remote lab servers.',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Archives', link: '/en/archives' },
          { text: 'About', link: '/about' },
        ],
        outline: { label: 'On this page', level: [2, 3] },
        docFooter: { prev: 'Previous', next: 'Next' },
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        langMenuLabel: 'Language',
        notFound: {
          title: 'Page Not Found',
          quote: 'Maybe check out our other tutorials?',
          linkLabel: 'Back to home',
          linkText: 'Back to home',
        },
        footer: {
          message: 'Lab Tips',
          copyright: '© Lab Team',
        },
      },
    },
  },

  themeConfig: {
    logo: '/images/logo.svg',
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Dual-Pointers/Lab-Tutorial' },
    ],
  },
})
