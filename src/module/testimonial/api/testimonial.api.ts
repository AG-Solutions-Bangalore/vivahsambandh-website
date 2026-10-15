import { apiFetch } from '@/lib/api/apiClient'
import type { TestimonialResponse } from '../types'

export async function getTestimonialsBySlug(
  slug: string = 'home',
): Promise<TestimonialResponse> {
  const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
  return apiFetch<TestimonialResponse>(`/getTestimonial/${safeSlug}`)
}
