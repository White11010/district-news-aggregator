import { createRouter, createWebHistory } from 'vue-router'
import NewsPage from '@/views/NewsPage.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'news',
      component: NewsPage,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
