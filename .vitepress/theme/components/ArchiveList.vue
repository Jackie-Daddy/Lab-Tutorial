<script setup lang="ts">
import { computed } from 'vue'

interface Post {
  url: string
  title: string
  date: string
}

const props = defineProps<{
  posts: Post[]
}>()

const groupedByYear = computed(() => {
  const groups: Record<string, Post[]> = {}
  for (const post of props.posts) {
    const year = post.date ? post.date.slice(0, 4) : 'Unknown'
    if (!groups[year]) groups[year] = []
    groups[year].push(post)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}
</script>

<template>
  <div class="archive-list">
    <template v-for="[year, yearPosts] in groupedByYear" :key="year">
      <h2 class="archive-year">{{ year }} <span style="font-size: 0.9rem; font-weight: 400; color: var(--vp-c-text-3);">({{ yearPosts.length }})</span></h2>
      <div v-for="post in yearPosts" :key="post.url" class="archive-post">
        <span class="archive-post-date">{{ formatDate(post.date) }}</span>
        <span class="archive-post-title">
          <a :href="post.url">{{ post.title }}</a>
        </span>
      </div>
    </template>
  </div>
</template>
