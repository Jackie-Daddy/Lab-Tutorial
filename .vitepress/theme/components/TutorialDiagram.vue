<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import diagrams from '../diagrams.generated.json'

const props = defineProps<{ name: string }>()
const { lang, isDark } = useData()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const locale = computed(() => lang.value.startsWith('zh') ? 'zh' : 'en')
const diagram = computed(() => diagrams[locale.value][props.name as keyof typeof diagrams.zh])
// Match the server-rendered light image during hydration, then apply the saved theme.
const asset = computed(() => diagram.value[mounted.value && isDark.value ? 'dark' : 'light'])
const hint = computed(() => locale.value === 'zh'
  ? '点击查看原图；窄屏可左右滑动'
  : 'Open full-size image; scroll sideways on narrow screens')
</script>

<template>
  <figure class="tutorial-diagram">
    <figcaption>
      <span>{{ diagram.title }}</span>
      <small>{{ hint }}</small>
    </figcaption>
    <div class="tutorial-diagram-scroll" tabindex="0" role="region" :aria-label="diagram.title">
      <a
        :href="withBase(asset.url)"
        target="_blank"
        rel="noopener"
        :aria-label="`${diagram.title} — ${hint}`"
        :style="{
          '--diagram-width': `${asset.width}px`,
          '--diagram-min-width': asset.width <= 560 ? '0px' : `${Math.min(asset.width, 720)}px`,
        }"
      >
        <img
          :src="withBase(asset.url)"
          :alt="diagram.description"
          :width="asset.width"
          :height="asset.height"
          loading="lazy"
          decoding="async"
        >
      </a>
    </div>
  </figure>
</template>

<style scoped>
.tutorial-diagram {
  min-width: 0;
  margin: 2rem 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: #faf9f5;
}
.dark .tutorial-diagram {
  background: #1e1d1c;
}
.tutorial-diagram-scroll {
  overflow-x: auto;
  overscroll-behavior-x: contain;
}
.tutorial-diagram-scroll:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}
.tutorial-diagram-scroll a {
  display: block;
  width: 100%;
  min-width: var(--diagram-min-width);
  max-width: var(--diagram-width);
  margin: 0 auto;
}
.tutorial-diagram img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
}
.tutorial-diagram figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-base);
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}
.tutorial-diagram small {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
</style>
