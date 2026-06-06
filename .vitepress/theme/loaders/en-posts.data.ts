import { createContentLoader } from 'vitepress'

function toISODate(d: unknown): string {
  if (!d) return ''
  if (d instanceof Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const s = String(d)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const pd = new Date(s)
  if (!isNaN(pd.getTime())) {
    return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`
  }
  return s
}

export default createContentLoader('en/posts/*.md', {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(raw) {
    return raw
      .map((page) => ({
        url: page.url,
        title: page.frontmatter.title,
        date: toISODate(page.frontmatter.date),
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
