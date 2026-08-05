export interface NewsItem {
  id: string
  name: string
  description: string
  datetime_start: string
  district: string
  media_files: string[] | null
  video: string | null
  yazzh_type?: string[]
  municipality?: string | null
}

export interface DistrictsResponse {
  success: boolean
  data: string[]
}

export interface NewsPeriodResponse {
  count: number
  page: number
  size: number
  data: NewsItem[]
  district: string
  mo: string | null
}

export interface NewsQuery {
  startDate: string
  period: number
  page: number
  count: number
  district?: string
}
