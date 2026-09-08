<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { lang, frontmatter } = useData()
const locale = computed(() => lang.value.startsWith('zh') ? 'zh' : 'en')
</script>

<template>
  <div class="post-tags-section">
    <span class="label">{{ locale === 'zh' ? '标签：' : 'Tags:' }}</span>
    <a v-for="tag in frontmatter.tags" :key="tag" class="tag-pill" :href="withBase(`/${locale}/?tag=${encodeURIComponent(tag)}`)">{{ tag }}</a>
  </div>
</template>
