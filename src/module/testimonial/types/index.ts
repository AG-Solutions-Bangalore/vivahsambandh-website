import type { ImageUrlEntry } from '@/lib/api/types'

export interface TestimonialItem {
  testimonial_for?: string
  testimonial_client_name?: string
  testimonial_description?: string
  testimonial_created_date?: string
  testimonial_rating?: string | number
}

export interface TestimonialResponse {
  data: TestimonialItem[]
  image_url?: ImageUrlEntry[]
}
