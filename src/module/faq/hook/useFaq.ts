import { useMemo } from 'react'
import { useQuery, type QueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { buildFaqSlugChain, getFaqWithFallback } from '../api/faq.api'
import type { FaqFallbackItem, FaqItem, FaqResponse, GroupedFaqs } from '../types'

export const FAQ_DEFAULT_SLUG = 'home'

/**
 * Query key for FAQs. Includes the full fallback chain so
 * `membership → home` and `membership` (no fallback) never collide.
 * Single-arg calls keep the legacy `['faq', slug]` shape.
 */
export const faqQueryKey = (slug: string, fallbackSlugs?: Array<string | null | undefined>) => {
  const chain = buildFaqSlugChain(slug, fallbackSlugs)
  return ['faq', ...chain] as const
}

export interface UseFaqQueryOptions extends Omit<UseQueryOptions<FaqResponse>, 'queryKey' | 'queryFn'> {
  /**
   * Fallback slugs tried in order when the primary slug returns no rows.
   * Default (omitted / `null` / `[]`): query the primary slug only.
   * Pass e.g. `['home']` to explicitly opt into a fallback chain.
   */
  fallbackSlugs?: Array<string | null | undefined> | null
}

export function useFaqQuery(slug: string = FAQ_DEFAULT_SLUG, options?: UseFaqQueryOptions) {
  const { fallbackSlugs, enabled, ...rest } = options ?? {}
  const chain = buildFaqSlugChain(slug, fallbackSlugs ?? [])
  const [primary, ...fallbacks] = chain

  return useQuery({
    queryKey: faqQueryKey(primary, fallbacks),
    queryFn: () => getFaqWithFallback(primary, fallbackSlugs ?? []),
    enabled: primary.length > 0 && (enabled ?? true),
    ...rest,
  })
}

/** Prefetch helper — keeps HomePage mount fast while data resolves early. */
export function prefetchFaqQuery(
  queryClient: QueryClient,
  slug: string = FAQ_DEFAULT_SLUG,
  fallbackSlugs?: Array<string | null | undefined> | null,
) {
  const chain = buildFaqSlugChain(slug, fallbackSlugs ?? [])
  const [primary, ...fallbacks] = chain
  return queryClient.prefetchQuery({
    queryKey: faqQueryKey(primary, fallbacks),
    queryFn: () => getFaqWithFallback(primary, fallbackSlugs ?? []),
  })
}

/** Normalizes whitespace: trims and collapses internal runs to one space. */
function cleanHeading(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const cleaned = String(value).trim().replace(/\s+/g, ' ')
  return cleaned || null
}

/**
 * Normalizes question string across API (`faq_que`) and fallback (`question`) schemas.
 */
export function getFaqQuestion(item: FaqItem | FaqFallbackItem): string {
  if (item && typeof item === 'object' && 'q' in item && typeof (item as { q?: unknown }).q === 'string') {
    return ((item as { q: string }).q ?? '').trim()
  }
  const raw = (item as FaqItem)?.faq_que ?? (item as FaqItem)?.question
  return (raw == null ? '' : String(raw)).trim()
}

/**
 * Normalizes answer string across API (`faq_ans`) and fallback (`answer`) schemas.
 */
export function getFaqAnswer(item: FaqItem | FaqFallbackItem): string {
  if (item && typeof item === 'object' && 'a' in item && typeof (item as { a?: unknown }).a === 'string') {
    return ((item as { a: string }).a ?? '').trim()
  }
  const raw = (item as FaqItem)?.faq_ans ?? (item as FaqItem)?.answer
  return (raw == null ? '' : String(raw)).trim()
}

/** True when an item has both a usable question and answer. */
export function isValidFaqItem(item: FaqItem | FaqFallbackItem): boolean {
  return Boolean(getFaqQuestion(item) && getFaqAnswer(item))
}

function faqSortValue(item: FaqItem | FaqFallbackItem): number {
  const raw = (item as FaqItem)?.faq_sort
  if (raw == null || raw === '') return Number.MAX_SAFE_INTEGER
  const num = Number(raw)
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER
}

/**
 * Sorts FAQ items numerically by `faq_sort` (ascending).
 * Unsortable / missing values sink to the end; ties keep input order (stable).
 */
export function sortFaqs<T extends FaqItem | FaqFallbackItem>(items: T[]): T[] {
  return [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const diff = faqSortValue(a.item) - faqSortValue(b.item)
      return diff !== 0 ? diff : a.index - b.index
    })
    .map(({ item }) => item)
}

/**
 * Groups FAQs by their `faq_heading` category, preserving `faq_sort` order.
 * Empty (`null`) headings inherit the previous group's heading so APIs that
 * only set `faq_heading` on the first row of a section still render together.
 */
export function groupFaqsByHeading<T extends FaqItem | FaqFallbackItem>(items: T[]): GroupedFaqs[] {
  const sorted = sortFaqs(items.filter(isValidFaqItem))
  const result: Array<{ heading: string | null; items: T[] }> = []

  for (const item of sorted) {
    const rawHeading = cleanHeading((item as FaqItem)?.faq_heading)
    const last = result[result.length - 1]

    if (rawHeading) {
      if (last && last.heading === rawHeading) {
        last.items.push(item)
      } else {
        result.push({ heading: rawHeading, items: [item] })
      }
    } else if (last) {
      // No heading on this row -> belongs to previous group (forward-fill).
      last.items.push(item)
    } else {
      result.push({ heading: null, items: [item] })
    }
  }

  return result as GroupedFaqs[]
}

/** Converts `fallbackItems` (either shape) into `FaqItem[]` for grouping. */
export function toFaqItems(items: FaqFallbackItem[] | undefined): FaqItem[] {
  if (!items || items.length === 0) return []
  return items.map((f) => {
    if (f && typeof f === 'object' && 'q' in f) {
      const qa = f as { q: string; a: string }
      return { question: qa.q, answer: qa.a } as FaqItem
    }
    return f as FaqItem
  })
}

export interface UseGroupedFaqsOptions {
  fallbackSlugs?: Array<string | null | undefined> | null
  fallbackItems?: FaqFallbackItem[]
  enabled?: boolean
}

/**
 * Convenience hook: fetches (with slug fallbacks), validates, sorts and
 * groups FAQs in one memoized step for `FaqSection`.
 */
export function useGroupedFaqs(slug: string = FAQ_DEFAULT_SLUG, options?: UseGroupedFaqsOptions) {
  const { fallbackSlugs, fallbackItems, enabled } = options ?? {}
  const query = useFaqQuery(slug, {
    fallbackSlugs,
    enabled,
  })

  const groups = useMemo(() => {
    const apiItems = (query.data?.data ?? []).filter(isValidFaqItem)
    if (apiItems.length > 0) return groupFaqsByHeading(apiItems)
    const fb = toFaqItems(fallbackItems).filter(isValidFaqItem)
    if (fb.length > 0) return groupFaqsByHeading(fb)
    return [] as GroupedFaqs[]
  }, [query.data, fallbackItems])

  return {
    ...query,
    groups,
    resolvedSlug: query.data?.resolvedSlug ?? null,
    isEmpty: groups.length === 0,
  }
}
