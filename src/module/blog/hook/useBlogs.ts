import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  getBlogBySlug,
  getBlogs,
  getFeaturedBlogs,
  getFrontBlogs,
} from '../api/blog.api'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'
import type { BlogItem, BlogListResponse, SingleBlogResponse } from '../types'

import { useAppLanguage } from '../../../i18n/useAppLanguage'
import { translateText } from '../../../lib/dynamicTranslate'

export const blogKeys = {
  all: (lang: string = 'en') => ['blogs', lang] as const,
  front: (lang: string = 'en') => ['blogs', 'front', lang] as const,
  featured: (lang: string = 'en') => ['blogs', 'featured', lang] as const,
  detail: (slug: string, lang: string = 'en') => ['blogs', 'detail', slug, lang] as const,
}

export function useFrontBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  const { lang } = useAppLanguage()
  return useQuery({
    queryKey: blogKeys.front(lang),
    queryFn: async () => {
      const res = await getFrontBlogs()
      if (lang === 'hi' && res.data && res.data.length > 0) {
        const translatedData = await Promise.all(
          res.data.map(async (b) => ({
            ...b,
            blog_title: b.blog_title ? await translateText(b.blog_title, 'hi') : b.blog_title,
            blog_short_description: b.blog_short_description
              ? await translateText(b.blog_short_description, 'hi')
              : b.blog_short_description,
            categories: b.categories ? await translateText(b.categories, 'hi') : b.categories,
          }))
        )
        return { ...res, data: translatedData }
      }
      return res
    },
    ...options,
  })
}

export function useFeaturedBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  const { lang } = useAppLanguage()
  return useQuery({
    queryKey: blogKeys.featured(lang),
    queryFn: async () => {
      const res = await getFeaturedBlogs()
      if (lang === 'hi' && res.data && res.data.length > 0) {
        const translatedData = await Promise.all(
          res.data.map(async (b) => ({
            ...b,
            blog_title: b.blog_title ? await translateText(b.blog_title, 'hi') : b.blog_title,
            blog_short_description: b.blog_short_description
              ? await translateText(b.blog_short_description, 'hi')
              : b.blog_short_description,
            categories: b.categories ? await translateText(b.categories, 'hi') : b.categories,
          }))
        )
        return { ...res, data: translatedData }
      }
      return res
    },
    ...options,
  })
}

export function useBlogsQuery(
  options?: Omit<UseQueryOptions<BlogListResponse>, 'queryKey' | 'queryFn'>,
) {
  const { lang } = useAppLanguage()
  return useQuery({
    queryKey: blogKeys.all(lang),
    queryFn: async () => {
      const res = await getBlogs()
      if (lang === 'hi' && res.data && res.data.length > 0) {
        const translatedData = await Promise.all(
          res.data.map(async (b) => ({
            ...b,
            blog_title: b.blog_title ? await translateText(b.blog_title, 'hi') : b.blog_title,
            blog_short_description: b.blog_short_description
              ? await translateText(b.blog_short_description, 'hi')
              : b.blog_short_description,
            categories: b.categories ? await translateText(b.categories, 'hi') : b.categories,
          }))
        )
        return { ...res, data: translatedData }
      }
      return res
    },
    ...options,
  })
}

export function useBlogBySlugQuery(
  slug: string,
  options?: Omit<UseQueryOptions<SingleBlogResponse>, 'queryKey' | 'queryFn'>,
) {
  const { lang } = useAppLanguage()
  return useQuery({
    queryKey: blogKeys.detail(slug, lang),
    queryFn: async () => {
      const res = await getBlogBySlug(slug)
      if (lang === 'hi' && res.data) {
        const b = res.data
        const [blog_title, blog_short_description, categories, blog_description] = await Promise.all([
          b.blog_title ? translateText(b.blog_title, 'hi') : Promise.resolve(b.blog_title),
          b.blog_short_description ? translateText(b.blog_short_description, 'hi') : Promise.resolve(b.blog_short_description),
          b.categories ? translateText(b.categories, 'hi') : Promise.resolve(b.categories),
          b.blog_description ? translateText(b.blog_description, 'hi') : Promise.resolve(b.blog_description),
        ])
        let previous = res.previous
        if (res.previous?.blog_title) {
          previous = {
            ...res.previous,
            blog_title: await translateText(res.previous.blog_title, 'hi'),
          }
        }
        let next = res.next
        if (res.next?.blog_title) {
          next = {
            ...res.next,
            blog_title: await translateText(res.next.blog_title, 'hi'),
          }
        }
        return {
          ...res,
          data: {
            ...b,
            blog_title,
            blog_short_description,
            categories,
            blog_description,
          },
          previous,
          next,
        }
      }
      return res
    },
    enabled: Boolean(slug && slug.trim()),
    ...options,
  })
}

/**
 * Detail-page path for a blog post, language-aware (`/blogs/:slug`).
 */
export function blogDetailPath(item: Pick<BlogItem, 'blog_slug' | 'id'>, lang: AppLang): string {
  const slug = item.blog_slug?.trim() || String(item.id)
  return pagePath(`/blogs/${encodeURIComponent(slug)}`, lang)
}

/**
 * Formats YYYY-MM-DD into a localized friendly date string (e.g. "28 Sep 2026").
 */
export function formatBlogDate(dateStr: string | null | undefined, lang: AppLang = 'en'): string | null {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim())
  if (!m) return dateStr.trim()
  const enMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  const hiMonths = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
  ]
  const months = lang === 'hi' ? hiMonths : enMonths
  const month = months[Math.min(11, Math.max(0, parseInt(m[2], 10) - 1))]
  const day = parseInt(m[3], 10)
  const year = m[1]
  return `${day} ${month} ${year}`
}
