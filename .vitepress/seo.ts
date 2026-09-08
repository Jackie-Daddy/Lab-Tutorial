import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { HeadConfig, PageData } from 'vitepress'

export const siteUrl = 'https://dual-pointers.github.io/Lab-Tutorial/'
const root = fileURLToPath(new URL('../', import.meta.url))

function route(file: string): string {
  return file.replace(/index\.md$/, '').replace(/\.md$/, '')
}

function date(value: unknown): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export function pageHead(page: PageData): HeadConfig[] {
  const file = page.relativePath
  const alias = file === 'index.md' || file === 'about.md'
  const target = file === 'index.md' ? 'zh/' : file === 'about.md' ? 'zh/about' : route(file)
  const url = new URL(target, siteUrl).href
  const en = file.startsWith('en/')
  const locale = en ? 'en-US' : 'zh-CN'
  const title = page.title === 'Lab Tutorial' ? page.title : `${page.title} | Lab Tutorial`
  const description = page.description || (en ? 'Practical tutorials for terminals, remote development, and AI coding.' : '终端工具、远程开发与 AI 编程的实用教程。')
  const image = `${siteUrl}images/social-card.png`
  const article = /^(zh|en)\/posts\/.+\.md$/.test(file)
  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:type', content: article ? 'article' : 'website' }],
    ['meta', { property: 'og:site_name', content: 'Lab Tutorial' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:locale', content: en ? 'en_US' : 'zh_CN' }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'Lab Tutorial — practical lab guides' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
  ]
  if (alias || file === '404.md') head.push(['meta', { name: 'robots', content: 'noindex, follow' }])
  if (/^(zh|en)\//.test(file)) {
    const sibling = file.replace(/^(zh|en)\//, en ? 'zh/' : 'en/')
    if (existsSync(`${root}${sibling}`)) {
      for (const lang of ['zh', 'en']) {
        head.push(['link', { rel: 'alternate', hreflang: lang === 'zh' ? 'zh-CN' : 'en', href: new URL(route(file.replace(/^(zh|en)\//, `${lang}/`)), siteUrl).href }])
      }
      head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: new URL(route(file.replace(/^(zh|en)\//, 'zh/')), siteUrl).href }])
    }
  }
  if (article) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: page.title,
      description,
      inLanguage: locale,
      url,
      mainEntityOfPage: url,
      image,
      datePublished: date(page.frontmatter.date),
      dateModified: date(page.frontmatter.reviewed || page.frontmatter.date),
    }
    head.push(['script', { type: 'application/ld+json' }, JSON.stringify(data).replace(/</g, '\\u003c')])
  }
  return head
}
