<script setup lang="ts">
interface PostLink {
  url: string
  title: string
}

defineProps<{
  prev: PostLink | null
  next: PostLink | null
  lang: 'zh' | 'en'
}>()
</script>

<template>
  <nav v-if="prev || next" class="post-nav">
    <a v-if="prev" :href="prev.url">
      ← {{ lang === 'zh' ? '上一篇' : 'Previous' }}<br />
      <span style="font-weight: 400; font-size: 0.85rem;">{{ prev.title }}</span>
    </a>
    <span v-else></span>
    <a v-if="next" :href="next.url" style="text-align: right;">
      {{ lang === 'zh' ? '下一篇' : 'Next' }} →<br />
      <span style="font-weight: 400; font-size: 0.85rem;">{{ next.title }}</span>
    </a>
  </nav>
</template>
