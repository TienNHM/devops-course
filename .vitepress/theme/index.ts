import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HeroCode from './HeroCode.vue'
import HomeContent from './HomeContent.vue'
import HomeStart from './HomeStart.vue'
import LessonProgress from './LessonProgress.vue'
import LessonDone from './LessonDone.vue'
import SidebarProgress from './SidebarProgress.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h(HeroCode),
      'home-hero-after': () => h(HomeStart),
      'doc-before': () => h(LessonProgress),
      'doc-after': () => h(LessonDone),
      'layout-bottom': () => h(SidebarProgress),
    }),
  enhanceApp({ app }) {
    app.component('HomeContent', HomeContent)
  },
} satisfies Theme
