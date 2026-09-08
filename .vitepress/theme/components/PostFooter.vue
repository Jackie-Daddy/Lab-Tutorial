<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as zhPosts } from '../loaders/zh-posts.data'
import { data as enPosts } from '../loaders/en-posts.data'
import { postCategory, postPath } from '../post-utils'
import PostNav from './PostNav.vue'

const { page, lang, frontmatter } = useData()
const locale = computed(() => lang.value.startsWith('zh') ? 'zh' : 'en')
const posts = computed(() => locale.value === 'zh' ? zhPosts : enPosts)
const currentPath = computed(() => postPath(`/${page.value.relativePath}`))
const index = computed(() => posts.value.findIndex(post => postPath(post.url) === currentPath.value))
const current = computed(() => posts.value[index.value])
const prev = computed(() => index.value > 0 ? posts.value[index.value - 1] : null)
const next = computed(() => index.value >= 0 ? posts.value[index.value + 1] || null : null)
const related = computed(() => {
  if (!current.value) return []
  const meaningfulTags = current.value.tags.filter(tag => !['tutorial', 'server', 'terminal'].includes(tag))
  return posts.value.filter(post => postPath(post.url) !== currentPath.value)
    .map(post => ({ post, score: post.tags.filter(tag => meaningfulTags.includes(tag)).length * 2 + Number(postCategory(post) === postCategory(current.value)) }))
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, 3).map(item => item.post)
})
const reviewed = computed(() => frontmatter.value.reviewed ? String(frontmatter.value.reviewed).slice(0, 10) : '')
const editUrl = computed(() => `https://github.com/Dual-Pointers/Lab-Tutorial/edit/main/${page.value.relativePath}`)
</script>

<template>
  <div v-if="current" class="post-footer">
    <div class="post-review-info">
      <p v-if="frontmatter.scope">{{ locale === 'zh' ? '适用范围：' : 'Scope: ' }}{{ frontmatter.scope }}</p>
      <p v-if="reviewed">{{ locale === 'zh' ? '官方文档核对：' : 'Documentation reviewed: ' }}<time :datetime="reviewed">{{ reviewed }}</time></p>
      <a :href="editUrl" target="_blank" rel="noopener">{{ locale === 'zh' ? '在 GitHub 上改进本文 ↗' : 'Improve this tutorial on GitHub ↗' }}</a>
    </div>
    <PostNav :prev="prev" :next="next" :lang="locale" />
    <aside class="related-posts" :aria-label="locale === 'zh' ? '相关教程' : 'Related tutorials'">
      <h2>{{ locale === 'zh' ? '继续阅读' : 'Keep reading' }}</h2>
      <ul>
        <li v-for="post in related" :key="post.url"><a :href="withBase(post.url)">{{ post.title }}</a></li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.post-footer { margin-top: 2rem; }
.post-review-info { font-size: 0.85rem; line-height: 1.7; color: var(--vp-c-text-2); }
.post-review-info p { margin: 0.3rem 0; }
.post-review-info a { display: inline-block; margin-top: 0.6rem; text-decoration: underline; text-underline-offset: 3px; }
.related-posts { margin-top: 2rem; border-top: 1px solid var(--vp-c-divider); padding-top: 1.25rem; }
.related-posts h2 { font-size: 1.15rem; margin: 0 0 0.75rem; }
.related-posts ul { padding-left: 1.25rem; }
.related-posts li { margin: 0.6rem 0; }
.related-posts a { font-size: 0.95rem; text-decoration: underline; text-underline-offset: 3px; }
</style>
