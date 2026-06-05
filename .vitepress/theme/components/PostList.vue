<script setup lang="ts">
interface Post {
  url: string
  title: string
  date: string
  tags: string[]
  description: string
}

defineProps<{
  posts: Post[]
  lang: 'zh' | 'en'
}>()

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<template>
  <div class="post-list">
    <article v-for="post in posts" :key="post.url" class="post-card">
      <div class="post-card-meta">
        <span class="accent-dot"></span>
        <time>{{ formatDate(post.date) }}</time>
      </div>
      <h2 class="post-card-title">
        <a :href="post.url">{{ post.title }}</a>
      </h2>
      <p class="post-card-excerpt">{{ post.description }}</p>
      <div class="post-card-tags">
        <span v-for="tag in post.tags" :key="tag" class="tag-pill">{{ tag }}</span>
      </div>
      <a :href="post.url" class="post-card-readmore">
        {{ lang === 'zh' ? '阅读全文 →' : 'Read more →' }}
      </a>
    </article>
  </div>
</template>
