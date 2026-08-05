import { computed, nextTick, ref } from 'vue'
import { defineStore } from 'pinia'
import { getDistricts, getNews } from '@/api/news'
import type { NewsItem } from '@/types/news'
import { districtsCacheKey, getCached, newsCacheKey, setCached } from '@/utils/cache'
import { todayStartDate } from '@/utils/format'

export const PAGE_SIZE = 10

async function scrollToTop() {
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const useNewsStore = defineStore('news', () => {
  const period = ref(2)
  /** null = все районы */
  const selectedDistrict = ref<string | null>(null)
  const page = ref(1)

  const districts = ref<string[]>([])
  const districtsLoading = ref(false)
  const districtsError = ref<string | null>(null)

  const items = ref<NewsItem[]>([])
  const totalCount = ref(0)
  const newsLoading = ref(false)
  const newsError = ref<string | null>(null)

  const isAllDistricts = computed(() => selectedDistrict.value === null)
  const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))
  const startDate = computed(() => todayStartDate())

  async function loadDistricts(force = false) {
    districtsLoading.value = true
    districtsError.value = null

    try {
      const key = districtsCacheKey()
      if (!force) {
        const cached = getCached<string[]>(key)
        if (cached) {
          districts.value = cached.data
          return
        }
      }

      const response = await getDistricts()
      districts.value = response.data
      setCached(key, response.data)
    } catch (err) {
      districtsError.value = err instanceof Error ? err.message : 'Не удалось загрузить районы'
    } finally {
      districtsLoading.value = false
    }
  }

  async function loadNews(force = false) {
    newsLoading.value = true
    newsError.value = null
    items.value = []

    // let Vue paint the loader before sync cache / network
    await nextTick()

    const districtsKey = selectedDistrict.value ?? 'all'

    try {
      const cacheKey = newsCacheKey({
        startDate: startDate.value,
        period: period.value,
        districtsKey,
        page: page.value,
      })

      if (!force) {
        const cached = getCached<{ items: NewsItem[]; total: number }>(cacheKey)
        if (cached) {
          items.value = cached.data.items
          totalCount.value = cached.data.total
          return
        }
      }

      const response = await getNews({
        startDate: startDate.value,
        period: period.value,
        page: page.value,
        count: PAGE_SIZE,
        district: selectedDistrict.value ?? undefined,
      })

      items.value = response.data
      totalCount.value = response.count
      setCached(cacheKey, { items: response.data, total: response.count })
    } catch (err) {
      newsError.value = err instanceof Error ? err.message : 'Не удалось загрузить новости'
      items.value = []
      totalCount.value = 0
    } finally {
      newsLoading.value = false
    }
  }

  async function applyFiltersAndReload(run: () => void) {
    run()
    await loadNews()
    // after cache or network — content is mounted, then scroll (smooth not cancelled by layout)
    await scrollToTop()
  }

  function setPeriod(value: number) {
    if (period.value === value) return
    void applyFiltersAndReload(() => {
      period.value = value
      page.value = 1
    })
  }

  function selectAllDistricts() {
    if (selectedDistrict.value === null) return
    void applyFiltersAndReload(() => {
      selectedDistrict.value = null
      page.value = 1
    })
  }

  function selectDistrict(name: string) {
    if (selectedDistrict.value === name) return
    void applyFiltersAndReload(() => {
      selectedDistrict.value = name
      page.value = 1
    })
  }

  function resetDistrictFilter() {
    selectAllDistricts()
  }

  function setPage(next: number) {
    if (next < 1 || next === page.value) return
    void applyFiltersAndReload(() => {
      page.value = next
    })
  }

  async function init() {
    await loadDistricts()
    await loadNews()
  }

  function retryDistricts() {
    void loadDistricts(true)
  }

  function retryNews() {
    void loadNews(true)
  }

  return {
    period,
    selectedDistrict,
    page,
    districts,
    districtsLoading,
    districtsError,
    items,
    totalCount,
    newsLoading,
    newsError,
    isAllDistricts,
    totalPages,
    startDate,
    init,
    loadDistricts,
    loadNews,
    setPeriod,
    selectAllDistricts,
    selectDistrict,
    resetDistrictFilter,
    setPage,
    retryDistricts,
    retryNews,
  }
})
