import { apiFetch } from '@/lib/api/apiClient'
import type { FaqResponse } from '../types'

export async function getFaqBySlug(slug: string = 'home'): Promise<FaqResponse> {
  const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
  return apiFetch<FaqResponse>(`/getFAQBySlug/${safeSlug}`)
}
