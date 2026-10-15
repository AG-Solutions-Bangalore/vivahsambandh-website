import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getFaqBySlug } from '../api/faq.api'
import type { FaqItem, FaqResponse, GroupedFaqs } from '../types'

export const faqQueryKey = (slug: string) => ['faq', slug.toLowerCase()] as const

export function useFaqQuery(
  slug: string = 'home',
  options?: Omit<UseQueryOptions<FaqResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: faqQueryKey(slug),
    queryFn: () => getFaqBySlug(slug),
    ...options,
  })
}

/**
 * Normalizes question string across API and fallback schemas.
 */
export function getFaqQuestion(item: FaqItem): string {
  return item.faq_que?.trim() || item.question?.trim() || ''
}

/**
 * Normalizes answer string across API and fallback schemas.
 */
export function getFaqAnswer(item: FaqItem): string {
  return item.faq_ans?.trim() || item.answer?.trim() || ''
}

/**
 * Sorts FAQ items numerically by `faq_sort` (ascending).
 */
export function sortFaqs(items: FaqItem[]): FaqItem[] {
  return [...items].sort((a, b) => {
    const sortA = a.faq_sort != null ? Number(a.faq_sort) : 999
    const sortB = b.faq_sort != null ? Number(b.faq_sort) : 999
    return sortA - sortB
  })
}

/**
 * Groups FAQs by their `faq_heading` category if provided.
 */
export function groupFaqsByHeading(items: FaqItem[]): GroupedFaqs[] {
  const sorted = sortFaqs(items)
  const map = new Map<string | null, FaqItem[]>()

  for (const item of sorted) {
    const heading = item.faq_heading?.trim() || null
    const existing = map.get(heading) ?? []
    existing.push(item)
    map.set(heading, existing)
  }

  const result: GroupedFaqs[] = []
  for (const [heading, list] of map.entries()) {
    result.push({ heading, items: list })
  }
  return result
}
