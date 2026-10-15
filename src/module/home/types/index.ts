import type { ImageUrlEntry } from '@/lib/api/types'

export interface CityProfile {
  name: string
  count: string
  image?: string
}

export interface WhyFeature {
  title: string
  icon?: string
}

export interface SuccessStory {
  quote: string
  name: string
  city: string
  image: string
}

export interface AppFeature {
  title: string
  desc: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

export interface CategorySubData {
  id: number
  category_id: number
  category_sub_name: string
  category_sub_description?: string | null
  category_sub_image?: string | null
}

export interface CategoryData {
  id: number
  category_slug: string
  category_name: string
  category_description?: string | null
  category_meta_title?: string | null
  category_meta_description?: string | null
  category_meta_primary_keywords?: string | null
  category_meta_secondary_keywords?: string | null
  category_banner_image?: string | null
  category_subs?: CategorySubData[]
}

export interface CategoryResponse {
  data: CategoryData[]
  image_url?: ImageUrlEntry[]
}

export interface ClientData {
  clients_name?: string
  clients_image?: string
  client_name?: string
  client_image?: string
}

export interface ClientResponse {
  data: ClientData[]
  image_url?: ImageUrlEntry[]
}
