import { apiFetch } from '@/lib/api/apiClient'
import { getPageSlugAliases } from '@/lib/page-slug'
import type { TestimonialResponse } from '../types'

export async function getTestimonialsBySlug(
  slug: string = 'home',
): Promise<TestimonialResponse> {
  const safeSlug = encodeURIComponent(slug.trim().toLowerCase())
  return apiFetch<TestimonialResponse>(`/getTestimonial/${safeSlug}`)
}

/**
 * Fetches testimonials for one page.
 *
 * `slugAliases` may only contain naming aliases of the SAME page (the CRM
 * stores `/about` as `about-us`, `/stories` as `gallery`, ...). Another
 * page's slug is never tried, so a page without its own reviews renders no
 * review rail instead of repeating another page's testimonials.
 */
export async function getTestimonialsForPage(
  slug: string,
  slugAliases: Array<string | null | undefined> = [],
): Promise<TestimonialResponse> {
  const primary = slug.trim().toLowerCase() || 'home'
  const chain = [primary, ...slugAliases]
    .map((s) => (s ?? '').trim().toLowerCase())
    .filter((s, i, arr) => s.length > 0 && arr.indexOf(s) === i)

  for (const candidate of chain) {
    const res = await getTestimonialsBySlug(candidate)
    if (res.data && res.data.length > 0) return res
  }
  return { data: [] }
}

/** All CRM slugs that may hold the testimonials of a page, primary first. */
export function getTestimonialSlugChain(page: string): string[] {
  return getPageSlugAliases(page)
}
