/**
 * @file src/module/blog/pages/BlogDetailPage.tsx
 * Blog detail page — full article with CKEditor rich HTML body.
 * The backend-authored HTML is sanitized with DOMPurify before render
 * (strips scripts, event handlers and unsafe embeds) and styled via
 * the `.blog-rich` block in `src/index.css`.
 */

import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import PageParallax from '../../../components/motion/PageParallax'
import { resolveImageUrl } from '../../../lib/api/apiClient'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'
import { blogDetailPath, formatBlogDate, useBlogBySlugQuery, useFeaturedBlogsQuery } from '../hook/useBlogs'
import type { BlogItem } from '../types'
import BlogCard from '../components/BlogCard'

/** Sanitize CMS HTML: allow video embeds, harden links + iframes. */
function sanitizeRichHtml(dirty: string): string {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IFRAME') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    }
  });
  try {
    return DOMPurify.sanitize(dirty, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes');
  }
}

function PrevNextCard({
  item,
  label,
  imageBase,
  lang,
}: {
  item: BlogItem
  label: string
  imageBase?: { image_for: string; image_url: string }[]
  lang: AppLang
}) {
  const thumb = resolveImageUrl(item.blog_banner_image, imageBase, 'blog')
  return (
    <Link
      to={blogDetailPath(item, lang)}
      title={item.blog_title}
      className="group flex items-center gap-4 rounded-2xl border border-[#EADDC3] bg-white p-4 shadow-[0_2px_10px_rgba(16,24,40,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-[0_16px_40px_rgba(16,24,40,0.12)]"
    >
      {thumb && (
        <img
          src={thumb}
          alt={item.blog_banner_image_alt || item.blog_title}
          loading="lazy"
          decoding="async"
          className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
        />
      )}
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-600">
          {label}
        </span>
        <span className="font-display mt-1 line-clamp-2 block text-sm font-bold leading-snug text-navy-900 transition-colors group-hover:text-maroon-700 sm:text-base">
          {item.blog_title}
        </span>
      </span>
    </Link>
  )
}

export default function BlogDetailPage() {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const { slug = '' } = useParams<{ slug: string }>()

  const { data, isPending, isError } = useBlogBySlugQuery(slug)
  const featuredQuery = useFeaturedBlogsQuery()

  const post = data?.data
  const imageBase = data?.image_url

  const cleanHtml = useMemo(() => {
    const dirty = post?.blog_description?.trim() || ''
    if (!dirty) return ''
    return sanitizeRichHtml(dirty)
  }, [post?.blog_description])

  const banner = resolveImageUrl(post?.blog_banner_image, imageBase, 'blog')
  const date = formatBlogDate(post?.blog_created_date ?? post?.blog_updated_date)

  const related = useMemo(() => {
    const pool = (data?.featured?.length ? data.featured : (featuredQuery.data?.data ?? [])).filter(
      (b) => b.blog_slug !== post?.blog_slug && b.blog_title?.trim(),
    )
    return pool.slice(0, 3)
  }, [data, featuredQuery.data, post?.blog_slug])

  if (isPending) {
    return (
      <div className="section-pad animate-pulse py-14 sm:py-20" aria-hidden="true">
        <div className="mx-auto max-w-3xl">
          <div className="h-4 w-1/4 rounded bg-slate-200" />
          <div className="mt-4 h-8 w-3/4 rounded bg-slate-200" />
          <div className="mt-6 aspect-[16/8] rounded-2xl bg-slate-100" />
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-full rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="section-pad py-14 sm:py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-xl font-bold text-navy-900">
            {t('blogsPage.notFoundTitle', 'Article not found')}
          </p>
          <p className="mt-2 text-sm text-ink-600">
            {t('blogsPage.notFoundDesc', 'This article may have been moved or removed.')}
          </p>
          <Link
            to={pagePath('/blogs', lang)}
            className="btn-primary mt-5 inline-flex !px-6 !py-2.5"
          >
            ← {t('blogsPage.backToBlogs', 'All blogs')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-[#FFFBF2]">
      <PageParallax />

      <article className="section-pad relative z-10 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          {/* Back + meta */}
          <Link
            to={pagePath('/blogs', lang)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-maroon-700 sm:text-sm"
          >
            <span aria-hidden="true">←</span>
            {t('blogsPage.backToBlogs', 'All blogs')}
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
            {post.categories && <span className="text-gold-600">{post.categories}</span>}
            {post.categories && date && (
              <span className="text-slate-300" aria-hidden="true">
                •
              </span>
            )}
            {date && <span className="font-semibold text-slate-500">{date}</span>}
            {post.created_by && (
              <span className="font-semibold normal-case tracking-normal text-slate-500">
                · {t('blogsPage.byAuthor', 'By')} {post.created_by}
              </span>
            )}
          </div>

          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-navy-900 sm:text-4xl lg:text-[44px]">
            {post.blog_title}
          </h1>

          {post.blog_short_description && (
            <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
              {post.blog_short_description.replace(/<[^>]*>/g, '').trim()}
            </p>
          )}

          {/* Banner */}
          {banner && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#EADDC3] shadow-[0_2px_10px_rgba(16,24,40,0.06)]">
              <img
                src={banner}
                alt={post.blog_banner_image_alt || post.blog_title}
                title={post.blog_title}
                loading="eager"
                decoding="async"
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
          )}

          {/* Sanitized CKEditor body */}
          {cleanHtml ? (
            <div
              className="blog-rich mt-8 rounded-2xl border border-[#EADDC3] bg-white p-5 shadow-[0_2px_10px_rgba(16,24,40,0.06)] sm:p-8"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          ) : (
            post.blog_short_description && (
              <p className="mt-8 text-sm leading-relaxed text-ink-600 sm:text-base">
                {post.blog_short_description.replace(/<[^>]*>/g, '').trim()}
              </p>
            )
          )}

          {/* Prev / Next */}
          {(data.previous || data.next) && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {data.previous ? (
                <PrevNextCard
                  item={data.previous}
                  label={t('blogsPage.prevArticle', 'Previous')}
                  imageBase={imageBase}
                  lang={lang}
                />
              ) : (
                <span />
              )}
              {data.next && (
                <PrevNextCard
                  item={data.next}
                  label={t('blogsPage.nextArticle', 'Next')}
                  imageBase={imageBase}
                  lang={lang}
                />
              )}
            </div>
          )}
        </div>

        {/* Related reads */}
        {related.length > 0 && (
          <div className="mx-auto mt-14 max-w-6xl">
            <h2 className="font-display text-center text-2xl font-bold text-navy-900 sm:text-3xl">
              {t('blogsPage.relatedTitle', 'Related reads')}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {related.map((item) => (
                <BlogCard key={item.blog_slug || item.id} item={item} imageBase={featuredQuery.data?.image_url} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
