import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import PostList from './components/PostList.vue'
import ArchiveList from './components/ArchiveList.vue'
import PostNav from './components/PostNav.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // Custom slots can be added here if needed
    })
  },
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('ArchiveList', ArchiveList)
    app.component('PostNav', PostNav)
  },
}
