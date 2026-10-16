/**
 * @file src/module/blog/pages/BlogsPage.tsx
 * Blogs listing page — fetches the full directory via `getBlogs`
 * and renders every article as a card grid.
 */

import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import PageParallax from '../../../components/motion/PageParallax'
import { useBlogsQuery } from '../hook/useBlogs'
import BlogCard from '../components/BlogCard'

function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="aspect-[16/10] bg-slate-100" />
          <div className="space-y-2 p-5 sm:p-6">
            <div className="h-3 w-1/3 rounded bg-slate-100" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BlogsPage() {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useBlogsQuery()

  const items = (data?.data ?? []).filter((b) => b.blog_title?.trim())
  const imageBase = data?.image_url

  return (
    <div className="relative overflow-hidden bg-[#FFFBF2]">
      <PageParallax />

      {/* Hero */}
      <section className="section-pad relative z-10 pt-10 pb-4 text-center sm:pt-14">
        <Reveal variant="up" className="mx-auto max-w-2xl">
          <div className="eyebrow mx-auto justify-center">
            <span className="text-gold-500">✦</span>
            <span>{t('blogsPage.eyebrow', 'Our blog')}</span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
            <span>{t('blogsPage.titleA', 'All')} </span>
            <span className="text-gold-500">{t('blogsPage.titleB', 'Stories & Articles.')}</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
            {t('blogsPage.subtitle', 'Browse every article, guide and community update from VivahSambandh.')}
          </p>
        </Reveal>
      </section>

      {/* Listing */}
      <section className="section-pad relative z-10 py-10 sm:py-14">
        {isPending ? (
          <ListingSkeleton />
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900">
              {t('blogsPage.loadErrorTitle', 'Could not load blogs')}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {t('blogsPage.loadErrorDesc', 'Something went wrong while fetching articles. Please try again.')}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="btn-primary mt-5 inline-flex !px-6 !py-2.5 cursor-pointer"
            >
              {t('blogsPage.retry', 'Try again')}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900">
              {t('blogsPage.emptyTitle', 'No articles yet')}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              {t('blogsPage.emptyDesc', 'New stories are on the way — please check back soon.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {items.map((item) => (
              <BlogCard key={item.blog_slug || item.id} item={item} imageBase={imageBase} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
