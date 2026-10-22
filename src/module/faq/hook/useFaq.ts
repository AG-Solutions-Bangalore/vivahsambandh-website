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
import { useAppLanguage } from '../../../i18n/useAppLanguage'
import { translateText } from '../../../lib/dynamicTranslate'

export const faqQueryKey = (slug: string, fallbackSlugs?: Array<string | null | undefined>, lang: string = 'en') => {
  const chain = buildFaqSlugChain(slug, fallbackSlugs)
  return ['faq', ...chain, lang] as const
}

export interface UseFaqQueryOptions extends Omit<UseQueryOptions<FaqResponse>, 'queryKey' | 'queryFn'> {
  /**
   * Additional slugs tried, in order, when the primary slug returns no rows.
   *
   * These must be naming aliases of the **same** page (the CRM stores a page
   * under `about-us` while the route is `/about`, `gallery` vs `stories`,
   * `services` vs `membership`). Another page's slug is never allowed —
   * a page that has no FAQs of its own renders no FAQ section at all.
   *
   * Default (omitted / `null` / `[]`): query the primary slug only.
   */
  fallbackSlugs?: Array<string | null | undefined> | null
}

export function useFaqQuery(slug: string = FAQ_DEFAULT_SLUG, options?: UseFaqQueryOptions) {
  const { lang } = useAppLanguage()
  const { fallbackSlugs = null, enabled, ...rest } = options ?? {}
  const chain = buildFaqSlugChain(slug, fallbackSlugs ?? [])
  const [primary, ...fallbacks] = chain

  return useQuery({
    queryKey: faqQueryKey(primary, fallbacks, lang),
    queryFn: async () => {
      const res = await getFaqWithFallback(primary, fallbackSlugs ?? [])
      if (lang === 'hi' && res.data && res.data.length > 0) {
        const translatedData = await Promise.all(
          res.data.map(async (item) => ({
            ...item,
            faq_heading: item.faq_heading ? await translateText(item.faq_heading, 'hi') : item.faq_heading,
            faq_que: item.faq_que ? await translateText(item.faq_que, 'hi') : item.faq_que,
            faq_ans: item.faq_ans ? await translateText(item.faq_ans, 'hi') : item.faq_ans,
          }))
        )
        return { ...res, data: translatedData }
      }
      return res
    },
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

export interface UseGroupedFaqsOptions {
  /** Naming aliases of the same page (never another page's slug). */
  fallbackSlugs?: Array<string | null | undefined> | null
  enabled?: boolean
}

/**
 * Convenience hook: fetches (with same-page slug aliases), validates, sorts
 * and groups FAQs in one memoized step for `FaqSection`.
 *
 * The API is the single source of truth: when the requested page has no FAQ
 * rows the hook returns an empty group list and the section renders nothing.
 */
export function useGroupedFaqs(slug: string = FAQ_DEFAULT_SLUG, options?: UseGroupedFaqsOptions) {
  const { fallbackSlugs, enabled } = options ?? {}
  const query = useFaqQuery(slug, {
    fallbackSlugs,
    enabled,
  })

  const groups = useMemo(() => {
    const apiItems = (query.data?.data ?? []).filter(isValidFaqItem)
    if (apiItems.length > 0) return groupFaqsByHeading(apiItems)
    return [] as GroupedFaqs[]
  }, [query.data])

  return {
    ...query,
    groups,
    resolvedSlug: query.data?.resolvedSlug ?? null,
    isEmpty: groups.length === 0,
  }
}
