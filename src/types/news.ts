export interface MarketingNewsItem {
  id: string
  community_id: number
  community_name: string
  community_category: string
  /** Район источника, если отдаёт backend */
  district?: string | null
  vk_post_id: number
  yazzh_type: string[] | null
  text: string | null
  date: string | null
  time: string | null
  url: string | null
  media_files: string[] | null
  video: string | null
  likes_count: number | null
  comments_count: number | null
  reposts_count: number | null
  views_count: number | null
  err: number | null
}

export interface MarketingNewsResponse {
  count: number
  page: number
  size: number
  data: MarketingNewsItem[]
}

export type MarketingSortField =
  | 'date'
  | 'district'
  | 'likes_count'
  | 'comments_count'
  | 'reposts_count'
  | 'views_count'
  | 'err'

export type MarketingSortOrder = 'asc' | 'desc'

export interface MarketingNewsQuery {
  page: number
  count: number
  sort_field?: MarketingSortField
  sort_order?: MarketingSortOrder
}
