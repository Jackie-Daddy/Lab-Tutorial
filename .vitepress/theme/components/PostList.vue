<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { postCategory, type Post } from '../post-utils'

const props = defineProps<{
  posts: Post[]
  lang: 'zh' | 'en'
}>()

const category = ref('all')
const tag = ref('')
const query = ref('')
const router = useRouter()
let previousRouteChange: typeof router.onAfterRouteChange
let ready = false
const zh = computed(() => props.lang === 'zh')
const categories = computed(() => [
  { id: 'all', label: zh.value ? '全部' : 'All' },
  { id: 'terminal', label: zh.value ? '终端工具' : 'Terminal tools' },
  { id: 'remote', label: zh.value ? '远程开发' : 'Remote development' },
  { id: 'ai', label: zh.value ? 'AI 编程' : 'AI coding' },
])
const filtered = computed(() => {
  const terms = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return props.posts.filter(post => {
    const haystack = [post.title, post.description, ...post.tags].join(' ').toLocaleLowerCase()
    return (category.value === 'all' || postCategory(post) === category.value)
      && (!tag.value || post.tags.includes(tag.value))
      && terms.every(term => haystack.includes(term))
  })
})
const active = computed(() => category.value !== 'all' || tag.value || query.value)

function reset() {
  category.value = 'all'
  tag.value = ''
  query.value = ''
}

function selectCategory(value: string) {
  category.value = value
  tag.value = ''
}

function selectTag(value: string) {
  category.value = 'all'
  tag.value = tag.value === value ? '' : value
}

function readLocation() {
  const params = new URLSearchParams(window.location.search)
  const value = params.get('category') || 'all'
  category.value = categories.value.some(item => item.id === value) ? value : 'all'
  tag.value = params.get('tag') || ''
  query.value = params.get('q') || ''
}

async function syncAfterRouteChange(to: string) {
  await previousRouteChange?.(to)
  if (ready) readLocation()
}

onMounted(() => {
  readLocation()
  ready = true
  previousRouteChange = router.onAfterRouteChange
  router.onAfterRouteChange = syncAfterRouteChange
  window.addEventListener('popstate', readLocation)
})
onBeforeUnmount(() => {
  ready = false
  window.removeEventListener('popstate', readLocation)
  if (router.onAfterRouteChange === syncAfterRouteChange) router.onAfterRouteChange = previousRouteChange
})
watch(() => props.lang, () => { if (ready) readLocation() })
watch([category, tag, query], () => {
  if (!ready) return
  const url = new URL(window.location.href)
  for (const [key, value] of [['category', category.value === 'all' ? '' : category.value], ['tag', tag.value], ['q', query.value]]) {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }
  window.history.replaceState(window.history.state, '', url)
})

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return ''
  return dateStr.slice(0, 10) // "YYYY-MM-DD"
}
</script>

<template>
  <section class="post-discovery" :aria-label="zh ? '查找教程' : 'Find tutorials'">
    <div class="post-discovery-heading">
      <h1>{{ zh ? '教程目录' : 'Tutorials' }}</h1>
      <label class="post-search-label">
        <span class="sr-only">{{ zh ? '按标题、标签或关键词筛选' : 'Filter by title, tag, or keyword' }}</span>
        <input v-model="query" class="post-filter-search" type="search" :placeholder="zh ? '筛选标题、标签、关键词…' : 'Filter titles, tags, keywords…'">
      </label>
    </div>
    <div class="post-categories" :aria-label="zh ? '教程分类' : 'Tutorial categories'">
      <button v-for="item in categories" :key="item.id" type="button" :data-category="item.id" :aria-pressed="category === item.id" @click="selectCategory(item.id)">
        {{ item.label }}
        <span>{{ item.id === 'all' ? posts.length : posts.filter(post => postCategory(post) === item.id).length }}</span>
      </button>
    </div>
    <p class="learning-path">
      <span>{{ zh ? '新手路线' : 'Start here' }}</span>
      <a :href="withBase(`/${lang}/posts/how-to-use-tmux`)">{{ zh ? '保持会话' : 'Keep sessions running' }}</a>
      <span aria-hidden="true">→</span>
      <a :href="withBase(`/${lang}/posts/remote-debug`)">{{ zh ? '远程调试' : 'Debug remotely' }}</a>
      <span aria-hidden="true">→</span>
      <a :href="withBase(`/${lang}/posts/claude-code-guide`)">{{ zh ? 'AI 编程' : 'Code with AI' }}</a>
    </p>
    <div class="post-filter-status">
      <span role="status" aria-live="polite">{{ zh ? `显示 ${filtered.length} / ${posts.length} 篇` : `${filtered.length} of ${posts.length} tutorials` }}<span v-if="tag"> · #{{ tag }}</span></span>
      <button v-if="active" type="button" data-action="reset-filters" @click="reset">{{ zh ? '清除筛选' : 'Clear filters' }}</button>
    </div>
  </section>
  <div class="post-list">
    <p v-if="!filtered.length" class="post-empty">{{ zh ? '没有找到匹配的教程，试试其他关键词或清除筛选。' : 'No matching tutorials. Try another keyword or clear the filters.' }}</p>
    <article v-for="post in filtered" :key="post.url" class="post-card">
      <div class="post-card-meta">
        <span class="accent-dot"></span>
        <time :datetime="formatDate(post.date)">{{ formatDate(post.date) }}</time>
      </div>
      <h2 class="post-card-title">
        <a :href="withBase(post.url)">{{ post.title }}</a>
      </h2>
      <p class="post-card-excerpt">{{ post.description }}</p>
      <div class="post-card-tags">
        <button v-for="item in post.tags" :key="item" class="tag-pill" type="button" :data-tag="item" :aria-pressed="tag === item" :aria-label="zh ? `按标签 ${item} 筛选` : `Filter by tag ${item}`" @click="selectTag(item)">{{ item }}</button>
      </div>
      <a :href="withBase(post.url)" class="post-card-readmore">
        {{ lang === 'zh' ? '阅读全文 →' : 'Read more →' }}
      </a>
    </article>
  </div>
</template>

<style scoped>
.post-discovery { margin-bottom: 1.75rem; }
.post-discovery-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.post-discovery h1 { font-size: 1.65rem; margin: 0; }
.post-search-label { width: min(100%, 340px); }
.post-filter-search { width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-elv); color: var(--vp-c-text-1); font: inherit; font-size: 0.85rem; }
.post-categories { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.post-categories button { padding: 0.45rem 0.8rem; border: 1px solid var(--vp-c-divider); border-radius: 6px; font: inherit; font-size: 0.85rem; }
.post-categories button[aria-pressed='true'] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); color: var(--vp-c-text-1); }
.post-categories button span { margin-left: 0.4rem; color: var(--vp-c-text-2); font-size: 0.75rem; }
.learning-path { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.45rem; margin: 1rem 0; font-size: 0.8rem; color: var(--vp-c-text-2); }
.learning-path > span:first-child { margin-right: 0.25rem; }
.learning-path a { text-decoration: underline; text-underline-offset: 3px; }
.post-filter-status { display: flex; gap: 1rem; justify-content: space-between; font-size: 0.8rem; color: var(--vp-c-text-2); }
.post-filter-status button { text-decoration: underline; text-underline-offset: 3px; }
.post-empty { padding: 2rem 0; color: var(--vp-c-text-2); }
.tag-pill[aria-pressed='true'] { background: var(--vp-c-brand-soft); outline: 1px solid var(--vp-c-brand-1); }
@media (max-width: 640px) {
  .post-discovery-heading { align-items: stretch; flex-direction: column; }
  .post-search-label { width: 100%; }
  .post-categories { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .post-categories button { display: flex; justify-content: space-between; }
}
</style>
