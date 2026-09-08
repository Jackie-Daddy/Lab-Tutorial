import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import ArchiveList from './components/ArchiveList.vue'
import PostNav from './components/PostNav.vue'
import PostHeader from './components/PostHeader.vue'
import PostFooter from './components/PostFooter.vue'
import PostTags from './components/PostTags.vue'
import TutorialDiagram from './components/TutorialDiagram.vue'
import '@fontsource-variable/lora'
import '@fontsource-variable/lora/wght-italic.css'
import '@fontsource-variable/fira-code'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PostHeader),
      'doc-after': () => h(PostFooter),
    })
  },
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('ArchiveList', ArchiveList)
    app.component('PostNav', PostNav)
    app.component('PostTags', PostTags)
    app.component('TutorialDiagram', TutorialDiagram)
  },
}
