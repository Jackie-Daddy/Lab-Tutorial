import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import ArchiveList from './components/ArchiveList.vue'
import PostNav from './components/PostNav.vue'
import PostHeader from './components/PostHeader.vue'
import TutorialDiagram from './components/TutorialDiagram.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PostHeader),
    })
  },
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('ArchiveList', ArchiveList)
    app.component('PostNav', PostNav)
    app.component('TutorialDiagram', TutorialDiagram)
  },
}
