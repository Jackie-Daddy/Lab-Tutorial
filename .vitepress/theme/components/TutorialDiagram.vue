<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import diagrams from '../diagrams.generated.json'

const props = defineProps<{ name: string }>()
const { lang, isDark, page } = useData()
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const locale = computed(() => lang.value.startsWith('zh') ? 'zh' : 'en')
const diagram = computed(() => diagrams[locale.value][props.name as keyof typeof diagrams.zh])
// Match the server-rendered light image during hydration, then apply the saved theme.
const asset = computed(() => diagram.value[mounted.value && isDark.value ? 'dark' : 'light'])
const hint = computed(() => locale.value === 'zh'
  ? '点击放大查看'
  : 'Click to zoom')
const opened = ref(false)
const viewer = ref<HTMLDialogElement>()
const trigger = ref<HTMLAnchorElement>()
const zoom = ref(1)
const fitWidth = ref(0)
let previousOverflow = ''

async function openViewer(event: MouseEvent) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  fitWidth.value = Math.min(asset.value.width, window.innerWidth - 64, 1136)
  zoom.value = 1
  previousOverflow = document.body.style.overflow
  opened.value = true
  await nextTick()
  if (!viewer.value) return
  viewer.value.showModal()
  document.body.style.overflow = 'hidden'
}

function closeViewer(restoreFocus = true) {
  if (!opened.value) return
  viewer.value?.close()
  opened.value = false
  document.body.style.overflow = previousOverflow
  if (restoreFocus) trigger.value?.focus({ preventScroll: true })
}

watch(() => page.value.relativePath, () => closeViewer(false))
onBeforeUnmount(() => closeViewer(false))
</script>

<template>
  <figure class="tutorial-diagram">
    <figcaption>
      <span>{{ diagram.title }}</span>
      <small>{{ hint }}</small>
    </figcaption>
    <div class="tutorial-diagram-scroll" tabindex="0" role="region" :aria-label="diagram.title">
      <a
        ref="trigger"
        :href="withBase(asset.url)"
        target="_blank"
        rel="noopener"
        :aria-label="`${diagram.title} — ${hint}`"
        :style="{
          '--diagram-width': `${asset.width}px`,
        }"
        @click="openViewer"
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
  <Teleport v-if="opened" to="body">
    <dialog ref="viewer" class="diagram-viewer" :aria-label="diagram.title" @cancel.prevent="closeViewer()" @close="closeViewer()" @click="event => { if (event.target === viewer) closeViewer() }">
      <div class="diagram-viewer-toolbar">
        <strong>{{ diagram.title }}</strong>
        <div class="diagram-viewer-controls">
          <button type="button" :disabled="zoom <= 1" :aria-label="locale === 'zh' ? '缩小' : 'Zoom out'" @click="zoom = Math.max(1, zoom - 0.5)">−</button>
          <button type="button" :aria-label="locale === 'zh' ? '适应窗口' : 'Fit to window'" @click="zoom = 1">{{ Math.round(zoom * 100) }}%</button>
          <button type="button" data-action="zoom-in" :disabled="zoom >= 4" :aria-label="locale === 'zh' ? '放大' : 'Zoom in'" @click="zoom = Math.min(4, zoom + 0.5)">+</button>
          <a :href="withBase(asset.url)" target="_blank" rel="noopener">{{ locale === 'zh' ? '原图 ↗' : 'Original ↗' }}</a>
          <button type="button" autofocus @click="closeViewer()">{{ locale === 'zh' ? '关闭' : 'Close' }} <kbd>Esc</kbd></button>
        </div>
      </div>
      <div class="diagram-viewer-content" tabindex="0" :aria-label="locale === 'zh' ? '放大后的示意图，可滚动查看' : 'Zoomed diagram, scroll to explore'">
        <img :src="withBase(asset.url)" :alt="diagram.description" :style="{ width: `${fitWidth * zoom}px` }">
      </div>
    </dialog>
  </Teleport>
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
  max-width: var(--diagram-width);
  margin: 0 auto;
  cursor: zoom-in;
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
.diagram-viewer {
  width: calc(100vw - 2rem);
  max-width: 1200px;
  max-height: calc(100dvh - 2rem);
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: #faf9f5;
  color: var(--vp-c-text-1);
  margin: auto;
}
.dark .diagram-viewer { background: #1e1d1c; }
.diagram-viewer[open] { display: flex; flex-direction: column; }
.diagram-viewer::backdrop { background: rgba(0, 0, 0, 0.7); }
.diagram-viewer-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.85rem 1rem; border-bottom: 1px solid var(--vp-c-divider); }
.diagram-viewer-toolbar strong { font-size: 0.9rem; }
.diagram-viewer-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
.diagram-viewer-controls button, .diagram-viewer-controls a { min-height: 40px; padding: 0.35rem 0.65rem; border-radius: 5px; border: 1px solid var(--vp-c-divider); font-size: 0.8rem; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); }
.diagram-viewer-controls button:disabled { opacity: 0.45; cursor: default; }
.diagram-viewer-controls kbd { font-size: 0.7rem; color: var(--vp-c-text-2); margin-left: 0.25rem; }
.diagram-viewer-content { padding: 1rem; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.diagram-viewer-content img { display: block; max-width: none; height: auto; margin: 0 auto; }
</style>
