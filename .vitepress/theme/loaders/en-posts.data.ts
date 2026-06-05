import { createContentLoader } from 'vitepress'

export default createContentLoader('en/posts/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(raw) {
    return raw
      .map((page) => ({
        url: page.url,
        title: page.frontmatter.title,
        date: String(page.frontmatter.date || ''),
        tags: page.frontmatter.tags || [],
        description: page.frontmatter.description || '',
      }))
      .sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return b.date.localeCompare(a.date)
      })
  },
})
