<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()
const route = useRoute()

// Only render for posts (pages with a date in frontmatter)
const showHeader = computed(() => !!frontmatter.value.date)
</script>

<template>
  <div v-if="showHeader" class="post-header">
    <h1 class="title">{{ frontmatter.title }}</h1>
    <div class="meta">
      <span class="date">{{ frontmatter.date }}</span>
      <span class="separator" />
      <span class="reading-time">Lab Tutorial</span>
    </div>
  </div>
</template>

<style scoped>
.post-header {
  margin-bottom: 2.5rem;
}

.post-header .title {
  font-family: 'Lora', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin-bottom: 0.75rem;
  color: var(--vp-c-text-1);
}

.post-header .meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}

.post-header .meta .separator {
  width: 4px;
  height: 4px;
  background: var(--vp-c-text-3);
  border-radius: 50%;
}
</style>
