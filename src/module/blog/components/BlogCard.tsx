/**
 * @file src/module/blog/components/BlogCard.tsx
 * Shared blog card used by the homepage rails, the blogs listing page
 * and related-posts grids. "Read More" deep-links to `/blogs/:slug`.
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { resolveImageUrl } from '../../../lib/api/apiClient'
import type { AppLang } from '../../../i18n'
import { blogDetailPath, formatBlogDate } from '../hook/useBlogs'
import type { BlogItem } from '../types'

export interface BlogCardProps {
  item: BlogItem
  imageBase?: { image_for: string; image_url: string }[]
}

export default function BlogCard({ item, imageBase }: BlogCardProps) {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const imgSrc = resolveImageUrl(item.blog_banner_image, imageBase, 'blog')
  const date = formatBlogDate(item.blog_created_date ?? item.blog_updated_date, lang)
  const excerpt = (item.blog_short_description || item.blog_description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
  const href = blogDetailPath(item, lang)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EADDC3] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-[0_16px_40px_rgba(16,24,40,0.12)]">
      {/* Cover image with soft zoom + category/date badge overlay */}
      <Link to={href} title={item.blog_title} tabIndex={-1} aria-hidden="true">
        {imgSrc ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream-50">
            <img
              src={imgSrc}
              alt={item.blog_banner_image_alt || item.blog_title}
              title={item.blog_title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />
            {(item.categories || date) && (
              <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-md backdrop-blur">
                {item.categories && (
                  <span className="truncate text-gold-600">{item.categories}</span>
                )}
                {item.categories && date && (
                  <span className="shrink-0 text-slate-300" aria-hidden="true">
                    •
                  </span>
                )}
                {date && <span className="shrink-0 font-semibold text-slate-500">{date}</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gold-100 via-cream-50 to-gold-50">
            <span className="font-display text-4xl font-bold text-gold-500/60" aria-hidden="true">
              ✦
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display line-clamp-2 min-h-[3.25rem] text-[17px] font-bold leading-snug text-navy-900 transition-colors duration-300 group-hover:text-maroon-700 sm:min-h-[3.5rem] sm:text-lg">
          <Link to={href} title={item.blog_title}>
            {item.blog_title}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-3 min-h-[3.9rem] text-[13px] leading-relaxed text-slate-500 sm:text-sm">
            {excerpt}
          </p>
        )}

        <Link
          to={href}
          title={item.blog_title}
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold text-maroon-700 sm:text-sm"
        >
          {t('blogs.readMore', 'Read More')}
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  )
}
