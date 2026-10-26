import { computed, nextTick, ref } from 'vue'
import { defineStore } from 'pinia'
import { getMarketingNews } from '@/api/news'
import type { MarketingNewsItem } from '@/types/news'
import { getCached, newsCacheKey, setCached } from '@/utils/cache'

export const PAGE_SIZE = 25

async function scrollToTop() {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const useNewsStore = defineStore('news', () => {
  const page = ref(1)

  const items = ref<MarketingNewsItem[]>([])
  const totalCount = ref(0)
  const newsLoading = ref(false)
  const newsError = ref<string | null>(null)

  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))

  async function loadNews(force = false) {
    newsLoading.value = true
    newsError.value = null
    items.value = []

    await nextTick()

    try {
      const cacheKey = newsCacheKey({
        page: page.value,
        count: PAGE_SIZE,
      })

      if (!force) {
        const cached = getCached<{ items: MarketingNewsItem[]; total: number }>(cacheKey)
        if (cached) {
          items.value = cached.data.items
          totalCount.value = cached.data.total
          return
        }
      }

      const response = await getMarketingNews({
        page: page.value,
        count: PAGE_SIZE,
      })

      items.value = response.data ?? []
      totalCount.value = response.count ?? 0
      setCached(cacheKey, { items: items.value, total: totalCount.value })
    } catch (err) {
      newsError.value = err instanceof Error ? err.message : 'Не удалось загрузить публикации'
      items.value = []
      totalCount.value = 0
    } finally {
      newsLoading.value = false
    }
  }

  function setPage(next: number) {
    if (next < 1 || next === page.value) return
    if (totalPages.value > 0 && next > totalPages.value) return
    page.value = next
    void loadNews().then(() => scrollToTop())
  }

  async function init() {
    await loadNews()
  }

  function retryNews() {
    void loadNews(true)
  }

  return {
    page,
    items,
    totalCount,
    newsLoading,
    newsError,
    totalPages,
    init,
    loadNews,
    setPage,
    retryNews,
  }
})
