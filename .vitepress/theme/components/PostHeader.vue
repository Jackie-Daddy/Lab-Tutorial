<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()

// Only render for posts (pages with a date in frontmatter)
const showHeader = computed(() => !!frontmatter.value.date)
</script>

<template>
  <div v-if="showHeader" class="post-header">
    <h1 class="title">{{ frontmatter.title }}</h1>
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
  margin: 0;
  color: var(--vp-c-text-1);
}
</style>
