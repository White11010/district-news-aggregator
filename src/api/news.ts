import { apiGet } from './client'
import type { MarketingNewsQuery, MarketingNewsResponse } from '@/types/news'

export function getMarketingNews(query: MarketingNewsQuery) {
  return apiGet<MarketingNewsResponse>('/news/marketing/', {
    page: query.page,
    count: query.count,
  })
}
