import { computed, nextTick, ref } from 'vue'
import { defineStore } from 'pinia'
import { getMarketingNews } from '@/api/news'
import type {
  MarketingNewsItem,
  MarketingSortField,
  MarketingSortOrder,
} from '@/types/news'
import { getCached, newsCacheKey, setCached } from '@/utils/cache'

export const PAGE_SIZE = 25
export const DEFAULT_SORT_FIELD: MarketingSortField = 'date'
export const DEFAULT_SORT_ORDER: MarketingSortOrder = 'desc'

async function scrollToTop() {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const useNewsStore = defineStore('news', () => {
  const page = ref(1)
  const sortField = ref<MarketingSortField>(DEFAULT_SORT_FIELD)
  const sortOrder = ref<MarketingSortOrder>(DEFAULT_SORT_ORDER)

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
        sortField: sortField.value,
        sortOrder: sortOrder.value,
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
        sort_field: sortField.value,
        sort_order: sortOrder.value,
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

  function setSort(field: MarketingSortField) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    } else {
      sortField.value = field
      sortOrder.value = DEFAULT_SORT_ORDER
    }
    page.value = 1
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
    sortField,
    sortOrder,
    items,
    totalCount,
    newsLoading,
    newsError,
    totalPages,
    init,
    loadNews,
    setPage,
    setSort,
    retryNews,
  }
})
