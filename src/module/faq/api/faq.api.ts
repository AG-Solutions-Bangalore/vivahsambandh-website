import { apiFetch } from '@/lib/api/apiClient'
import type { FaqItem, FaqResponse } from '../types'

/**
 * Normalizes a slug for the FAQ endpoint: trims, lowercases, falls back
 * to `'home'` when empty. Never returns an empty string.
 */
export function normalizeFaqSlug(slug: unknown, fallback = 'home'): string {
  const cleaned = String(slug ?? '').trim().toLowerCase()
  return cleaned || fallback
}

/**
 * Normalizes the backend wire format into a guaranteed `{ data: [] }`
 * shape. Tolerates `{ data: [...] }`, a bare array, `null`, or an
 *Envelope with non-array `data`.
 */
export function normalizeFaqResponse(raw: unknown, resolvedSlug?: string): FaqResponse {
  let data: FaqItem[] = []
  if (Array.isArray(raw)) {
    data = raw as FaqItem[]
  } else if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: unknown }).data)) {
    data = (raw as { data: FaqItem[] }).data
  }
  // Drop non-object rows defensively; keep the rest untouched for sort/group.
  data = data.filter((item) => item && typeof item === 'object')
  return resolvedSlug == null ? { data } : { data, resolvedSlug }
}

/**
 * Builds the ordered slug chain tried by the query: primary first, then
 * unique normalized fallbacks (e.g. `['membership', 'services']`).
 */
export function buildFaqSlugChain(slug: string, fallbackSlugs?: Array<string | null | undefined>): string[] {
  const primary = normalizeFaqSlug(slug)
  const chain = [primary]
  for (const fb of fallbackSlugs ?? []) {
    const cleaned = String(fb ?? '').trim().toLowerCase()
    if (cleaned && !chain.includes(cleaned)) chain.push(cleaned)
  }
  return chain
}

export async function getFaqBySlug(slug: string = 'home'): Promise<FaqResponse> {
  const normalized = normalizeFaqSlug(slug)
  const safeSlug = encodeURIComponent(normalized)
  const raw = await apiFetch<unknown>(`/getFAQBySlug/${safeSlug}`)
  return normalizeFaqResponse(raw, normalized)
}

/**
 * Tries each slug in order and returns the first non-empty FAQ list.
 *
 * The chain must only contain naming aliases of the SAME page — a page with
 * no FAQs of its own never inherits another page's questions. By default only
 * the primary slug is queried; pass explicit `fallbackSlugs` (same-page
 * aliases such as `['about']` for `about-us`) to opt in.
 * Never throws for empty data — returns `{ data: [], resolvedSlug: null }`
 * so the section can hide gracefully. Network errors still reject so
 * React Query can retry / surface `isError`.
 */
export async function getFaqWithFallback(
  slug: string = 'home',
  fallbackSlugs?: Array<string | null | undefined> | null,
): Promise<FaqResponse> {
  const chain = buildFaqSlugChain(slug, fallbackSlugs ?? [])

  for (const candidate of chain) {
    const res = await getFaqBySlug(candidate)
    if (res.data.length > 0) return res
  }
  return { data: [], resolvedSlug: null }
}
