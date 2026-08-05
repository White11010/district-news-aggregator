import { apiGet } from './client'
import type { DistrictsResponse, NewsPeriodResponse, NewsQuery } from '@/types/news'

export function getDistricts() {
  return apiGet<DistrictsResponse>('/news/districts/')
}

export function getNews(query: NewsQuery) {
  return apiGet<NewsPeriodResponse>('/news/districts_period/', {
    start_date: query.startDate,
    period: query.period,
    page: query.page,
    count: query.count,
    district: query.district,
  })
}
