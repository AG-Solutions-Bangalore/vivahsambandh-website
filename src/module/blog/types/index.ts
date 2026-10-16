import type { ImageUrlEntry } from '@/lib/api/types'
import type { FaqItem } from '@/module/faq/types'

export interface BlogItem {
  id: number
  blog_index?: string | number | null
  blog_meta_title?: string | null
  blog_meta_description?: string | null
  blog_meta_keywords?: string | null
  blog_slug: string
  blog_title: string
  blog_short_description?: string | null
  blog_description?: string | null
  blog_banner_image?: string | null
  blog_banner_image_alt?: string | null
  blog_created_date?: string | null
  blog_updated_date?: string | null
  created_by?: string | null
  blog_categories_ids?: string | null
  categories?: string | null
  blog_front?: number | string | null
  blog_featured?: number | string | null
}

export interface BlogListResponse {
  data: BlogItem[]
  image_url?: ImageUrlEntry[]
}

export interface SingleBlogResponse {
  data: BlogItem
  image_url?: ImageUrlEntry[]
  featured?: BlogItem[]
  faq?: FaqItem[]
  previous?: BlogItem | null
  next?: BlogItem | null
}
