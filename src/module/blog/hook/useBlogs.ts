import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  getBlogBySlug,
  getBlogs,
  getFeaturedBlogs,
  getFrontBlogs,
} from '../api/blog.api'
import type { BlogListResponse, SingleBlogResponse } from '../types'

export const blogKeys = {
  all: ['blogs'] as const,
  front: ['blogs', 'front'] as const,
  featured: ['blogs', 'featured'] as const,
  detail: (slug: string) => ['blogs', 'detail', slug] as const,
}

export function useFrontBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: blogKeys.front,
    queryFn: getFrontBlogs,
    ...options,
  })
}

export function useFeaturedBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: blogKeys.featured,
    queryFn: getFeaturedBlogs,
    ...options,
  })
}

export function useBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: blogKeys.all,
    queryFn: getBlogs,
    ...options,
  })
}

export function useBlogBySlugQuery(
  slug: string,
  options?: Omit<UseQueryOptions<SingleBlogResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: blogKeys.detail(slug),
    queryFn: () => getBlogBySlug(slug),
    enabled: Boolean(slug && slug.trim()),
    ...options,
  })
}

/**
 * Formats YYYY-MM-DD into a localized friendly date string (e.g. "28 Sep 2026").
 */
export function formatBlogDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim())
  if (!m) return dateStr.trim()
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  const month = months[Math.min(11, Math.max(0, parseInt(m[2], 10) - 1))]
  const day = parseInt(m[3], 10)
  const year = m[1]
  return `${day} ${month} ${year}`
}
