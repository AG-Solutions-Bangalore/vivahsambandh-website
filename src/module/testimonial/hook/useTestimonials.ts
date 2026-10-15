import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { getTestimonialsBySlug } from '../api/testimonial.api'
import type { TestimonialItem, TestimonialResponse } from '../types'

export const testimonialKey = (slug: string) => ['testimonials', slug.toLowerCase()] as const

export function useTestimonialsQuery(
  slug: string = 'home',
  options?: Omit<UseQueryOptions<TestimonialResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: testimonialKey(slug),
    queryFn: () => getTestimonialsBySlug(slug),
    ...options,
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
