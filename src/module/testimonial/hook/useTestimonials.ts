import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getTestimonialsForPage, getTestimonialSlugChain } from '../api/testimonial.api'
import type { TestimonialItem, TestimonialResponse } from '../types'

import { useAppLanguage } from '../../../i18n/useAppLanguage'
import { translateText } from '../../../lib/dynamicTranslate'

export const testimonialKey = (slug: string, lang: string = 'en') => ['testimonials', slug.toLowerCase(), lang] as const

export interface UseTestimonialsOptions
  extends Omit<UseQueryOptions<TestimonialResponse>, 'queryKey' | 'queryFn'> {
  /**
   * Canonical route of the page ("about", "download", ...). The CRM slug
   * chain is derived from it, so the rail only ever shows this page's own
   * reviews.
   */
  page?: string
  /**
   * Naming aliases of the **same** page (e.g. `about` -> `about-us`).
   * Never another page's slug.
   */
  slugAliases?: Array<string | null | undefined>
}

export function useTestimonialsQuery(
  slug: string = 'home',
  options?: UseTestimonialsOptions,
) {
  const { lang } = useAppLanguage()
  const { page, slugAliases, ...rest } = options ?? {}
  const chain = page ? getTestimonialSlugChain(page) : [slug.trim().toLowerCase() || 'home']
  const aliases = slugAliases ?? chain.slice(1)
  const primary = chain[0]

  return useQuery({
    queryKey: [...testimonialKey(primary, lang), ...aliases],
    queryFn: async () => {
      const res = await getTestimonialsForPage(primary, aliases)
      if (lang === 'hi' && res.data && res.data.length > 0) {
        const translatedData = await Promise.all(
          res.data.map(async (item) => ({
            ...item,
            testimonial_client_name: item.testimonial_client_name
              ? await translateText(item.testimonial_client_name, 'hi')
              : item.testimonial_client_name,
            testimonial_description: item.testimonial_description
              ? await translateText(item.testimonial_description, 'hi')
              : item.testimonial_description,
          }))
        )
        return { ...res, data: translatedData }
      }
      return res
    },
    ...rest,
  })
}

/**
 * Safely parses rating to a number between 1 and 5 (defaults to 5).
 */
export function parseRating(rating: string | number | undefined): number {
  if (rating == null) return 5
  const num = typeof rating === 'number' ? rating : parseFloat(rating)
  return isNaN(num) ? 5 : Math.min(5, Math.max(1, Math.round(num)))
}

/**
 * Strips wrapping smart quotes for uniform UI styling.
 */
export function cleanTestimonialQuote(text: string | undefined): string {
  if (!text) return ''
  return text.trim().replace(/^[“"']+|[”"']+$/g, '')
}

export type { TestimonialItem }
