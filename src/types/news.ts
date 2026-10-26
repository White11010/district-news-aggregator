export interface MarketingNewsItem {
  id: string
  community_id: number
  community_name: string
  community_category: string
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

export interface MarketingNewsQuery {
  page: number
  count: number
}
