/**
 * @file src/module/blog/components/BlogSection.tsx
 * Reusable homepage blog rail. Same card UI for both variants —
 * only the data source differs (`featured` vs `front`).
 * Single horizontal scroll row (never a multi-row grid).
 * Hides completely when neither API nor fallbackItems yield items.
 */

import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, A11y } from 'swiper/modules'
import Reveal from '../../../components/motion/Reveal'
import { resolveImageUrl } from '../../../lib/api/apiClient'
import { formatBlogDate, useFeaturedBlogsQuery, useFrontBlogsQuery } from '../hook/useBlogs'
import type { BlogItem } from '../types'

import 'swiper/css'
import 'swiper/css/navigation'

export interface BlogSectionProps {
  variant: 'featured' | 'front'
  id?: string
  titleA?: string
  titleB?: string
  subtitle?: string
  eyebrow?: string
  tone?: 'cream' | 'paper' | 'navy'
  fallbackItems?: BlogItem[]
  maxItems?: number
}

function BlogCard({ item, imageBase }: { item: BlogItem; imageBase?: { image_for: string; image_url: string }[] }) {
  const imgSrc = resolveImageUrl(item.blog_banner_image, imageBase, 'blog')
  const date = formatBlogDate(item.blog_created_date ?? item.blog_updated_date)
  const excerpt = (item.blog_short_description || item.blog_description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EADDC3] bg-white shadow-[0_2px_10px_rgba(16,24,40,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-[0_16px_40px_rgba(16,24,40,0.12)]">
      {/* Gold top accent revealed on hover */}
      <div
        className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-transform duration-300 group-hover:scale-x-100"
        aria-hidden="true"
      />

      {/* Cover image with soft zoom + bottom fade */}
      {imgSrc ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-50">
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
        </div>
      ) : (
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gold-100 via-cream-50 to-gold-50">
          <span className="font-display text-4xl font-bold text-gold-500/60" aria-hidden="true">
            ✦
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Category · date meta */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
          {item.categories && (
            <span className="truncate text-gold-600">{item.categories}</span>
          )}
          {item.categories && date && (
            <span className="text-slate-300" aria-hidden="true">
              •
            </span>
          )}
          {date && <span className="shrink-0 font-semibold text-slate-500">{date}</span>}
        </div>

        <h3 className="font-display mt-2.5 line-clamp-2 min-h-[3.25rem] text-[17px] font-bold leading-snug text-navy-900 transition-colors duration-300 group-hover:text-maroon-700 sm:min-h-[3.5rem] sm:text-lg">
          {item.blog_title}
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-3 min-h-[3.9rem] text-[13px] leading-relaxed text-slate-500 sm:text-sm">
            {excerpt}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold text-maroon-700 sm:text-sm">
          Read More
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </div>
    </article>
  )
}

export default function BlogSection({
  variant,
  id = variant === 'featured' ? 'blogs-featured' : 'blogs-front',
  titleA,
  titleB,
  subtitle,
  eyebrow,
  tone = variant === 'featured' ? 'cream' : 'paper',
  fallbackItems,
  maxItems = 6,
}: BlogSectionProps) {
  const { t } = useTranslation()
  const featuredQuery = useFeaturedBlogsQuery({ enabled: variant === 'featured' })
  const frontQuery = useFrontBlogsQuery({ enabled: variant === 'front' })

  const query = variant === 'featured' ? featuredQuery : frontQuery
  const apiItems = (query.data?.data ?? []).filter((b) => b.blog_title?.trim())
  const imageBase = query.data?.image_url
  const items = apiItems.length > 0 ? apiItems : (fallbackItems ?? [])
  const visible = items.slice(0, maxItems)

  if (!visible || visible.length === 0) {
    return null
  }

  const defaults =
    variant === 'featured'
      ? {
          eyebrow: 'Featured insights',
          titleA: 'Featured',
          titleB: 'Stories & Guidance.',
          subtitle: 'Handpicked reads on relationships, weddings and family values.',
        }
      : {
          eyebrow: 'From our blog',
          titleA: 'Latest',
          titleB: 'Updates & Stories.',
          subtitle: 'Fresh articles, tips and community updates from VivahSambandh.',
        }

  const bgCls =
    tone === 'navy'
      ? 'bg-[#0B1526] text-white'
      : tone === 'cream'
        ? 'bg-[#FFFBF2] text-navy-900'
        : 'bg-cream-50 text-navy-900'

  return (
    <section id={id} className={`relative overflow-hidden py-12 ${bgCls}`}>
      <div className="section-pad relative z-10">
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <div className="eyebrow mx-auto justify-center">
            <span className="text-gold-500">✦</span>
            <span>{eyebrow || t(`blogs.${variant}.eyebrow`, defaults.eyebrow)}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            <span className={tone === 'navy' ? 'text-white' : 'text-navy-900'}>
              {titleA || t(`blogs.${variant}.titleA`, defaults.titleA)}{' '}
            </span>
            <span className="text-gold-500">
              {titleB || t(`blogs.${variant}.titleB`, defaults.titleB)}
            </span>
          </h2>
          <p className={`mt-3 text-sm leading-relaxed sm:text-base ${tone === 'navy' ? 'text-white/75' : 'text-ink-600'}`}>
            {subtitle || t(`blogs.${variant}.subtitle`, defaults.subtitle)}
          </p>
        </Reveal>

        {/* Swiper single-row rail (same pattern as CityMatchesSection).
            NOTE: slides intentionally NOT wrapped in GSAP Reveal — Swiper
            runs its own transform loop and a GSAP ancestor causes glitches. */}
        <div className="group/blogs relative mt-8 sm:mt-10 px-10 sm:px-12">
          <button
            type="button"
            aria-label={`Previous ${variant} blogs`}
            className={`blog-prev-${variant} absolute left-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/blogs:visible group-hover/blogs:opacity-100 focus-visible:visible focus-visible:opacity-100`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            aria-label={`Next ${variant} blogs`}
            className={`blog-next-${variant} absolute right-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/blogs:visible group-hover/blogs:opacity-100 focus-visible:visible focus-visible:opacity-100`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-600 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <Swiper
            modules={[Navigation, A11y]}
            navigation={{
              prevEl: `.blog-prev-${variant}`,
              nextEl: `.blog-next-${variant}`,
            }}
            observer={true}
            observeParents={true}
            observeSlideChildren={true}
            loop={visible.length > 3}
            speed={600}
            watchOverflow={true}
            grabCursor={true}
            spaceBetween={20}
            slidesPerView={1.15}
            slidesPerGroup={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 24,
              },
            }}
            className="!py-2"
          >
            {visible.map((item) => (
              <SwiperSlide key={item.blog_slug || item.id} className="!h-auto">
                <BlogCard item={item} imageBase={imageBase} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
