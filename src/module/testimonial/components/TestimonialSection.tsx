/**
 * @file src/module/testimonial/components/TestimonialSection.tsx
 * Infinite auto-scroll Testimonial Marquee component without images.
 * Matches exact card design: 5 gold stars, quote mark, line-clamped review,
 * dark navy avatar circle with golden initials, name, and verified badge.
 * Renders ONLY when the API returns reviews for this page; otherwise hides completely.
 */

import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { Bar, Text } from '../../../components/skeletons/skeletonShapes'
import { parseRating, useTestimonialsQuery } from '../hook/useTestimonials'
import { useAppLanguage } from '../../../i18n/useAppLanguage'
import type { AppLang } from '../../../i18n'
import type { TestimonialItem } from '../types'

export interface TestimonialSectionProps {
  /**
   * Canonical route of the page ("about", "download", ...). The CRM slug
   * chain is derived from it, so the rail only shows this page's own reviews.
   */
  page?: string
  /** Explicit CRM slug — used when `page` is not given. */
  slug?: string
  titleA?: string
  titleB?: string
  subtitle?: string
  eyebrow?: string
  id?: string
  tone?: 'navy' | 'cream' | 'paper'
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#D4A34B]" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function getCardInitials(rawName: string): string {
  if (!rawName) return 'VS'
  const nameOnly = rawName.split(',')[0].trim()
  if (nameOnly.includes('&')) {
    const firstWord = nameOnly.split('&')[0].trim()
    return `${firstWord[0] || 'V'}&`
  }
  const parts = nameOnly.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return nameOnly.slice(0, 2).toUpperCase()
}

function formatDateUpper(dateStr?: string, lang: AppLang = 'en'): string {
  if (!dateStr) return lang === 'hi' ? '25 सितम्बर 2026' : '25 SEP 2026'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim())
  if (!m) return dateStr.toUpperCase()
  const enMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const hiMonths = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
  const months = lang === 'hi' ? hiMonths : enMonths
  const month = months[Math.min(11, Math.max(0, parseInt(m[2], 10) - 1))]
  const day = parseInt(m[3], 10)
  const year = m[1]
  return `${day} ${month} ${year}`
}

function TestimonialCard({ item, lang }: { item: TestimonialItem; lang: AppLang }) {
  const { t } = useTranslation()
  const rawName = (item.testimonial_client_name || '').trim()
  const initials = getCardInitials(rawName)
  const cleanQuote = (item.testimonial_description || '').trim().replace(/^[“"']+|[”"']+$/g, '')
  const dateFormatted = formatDateUpper(item.testimonial_created_date, lang)
  const rating = parseRating(item.testimonial_rating)

  return (
    <div className="w-[320px] sm:w-[360px] md:w-[390px] shrink-0 rounded-2xl bg-white p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1">
      {/* Top Row: Stars + Quote Mark */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#D4A34B]" aria-label={`${rating} star rating`}>
            {Array.from({ length: rating }).map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <span className="font-serif text-3xl font-black leading-none text-[#E8DCC4] select-none" aria-hidden="true">
            “
          </span>
        </div>

        {/* Quote Description */}
        <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed text-[#4A5568] line-clamp-3 min-h-[64px]">
          &ldquo;{cleanQuote}&rdquo;
        </p>
      </div>

      {/* Divider & Author */}
      <div className="mt-6 border-t border-slate-100 pt-4 flex items-center gap-3">
        {/* Dark Navy Avatar Circle with Gold Initials */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B1A30] text-xs font-bold text-[#E5B558] shadow-inner select-none">
          {initials}
        </div>

        {/* Name, Location & Verified Checkmark */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold text-sm text-[#0F172A] leading-tight">
              {rawName}
            </p>
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00A86B] text-white shadow-xs"
              title="Verified Client"
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.2l2.2 2.2 4.8-4.8" />
              </svg>
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-[#94A3B8] uppercase tracking-wide">
            {t('stories.verifiedClient', 'Verified Client')} · {dateFormatted}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Placeholder for the review rail while the API call is in flight.
 *
 * Without it the section rendered nothing at all, so the page collapsed to
 * zero height and jumped once the cards landed.
 */
function TestimonialSkeleton({ tone }: { tone: 'navy' | 'cream' | 'paper' }) {
  const dark = tone === 'navy'
  const bgCls =
    tone === 'navy'
      ? 'bg-[#0B1526]'
      : tone === 'cream'
        ? 'bg-[#FFFBF2]'
        : 'bg-cream-50'
  const tone_ = dark ? ('dark' as const) : ('light' as const)

  return (
    <section
      aria-busy="true"
      role="status"
      aria-label="Loading reviews"
      className={`relative overflow-hidden py-14 sm:py-16 md:py-20 ${bgCls}`}
    >
      <div className="section-pad relative z-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Bar tone={tone_} className="mx-auto h-3 w-28 rounded-full bg-gold-200/80" />
          <Bar tone={tone_} className="mx-auto h-9 w-3/4 rounded-lg sm:h-11" />
          <Bar tone={tone_} className="mx-auto h-3.5 w-3/4 rounded" />
        </div>
      </div>

      <div className="relative mt-10 sm:mt-12 overflow-hidden py-4">
        <div className="flex gap-6 px-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-[320px] shrink-0 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] sm:w-[360px] sm:p-7 md:w-[390px]"
            >
              <Bar className="h-4 w-24" />
              <Text lines={3} />
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <Bar className="size-11 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Bar className="h-3.5 w-28" />
                  <Bar className="h-2.5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function TestimonialSection({
  page,
  slug = 'home',
  titleA,
  titleB,
  subtitle,
  eyebrow,
  id = 'testimonials',
  tone = 'navy',
}: TestimonialSectionProps) {
  const { t } = useTranslation()
  const { lang } = useAppLanguage()
  const { data: apiResponse, isPending } = useTestimonialsQuery(slug, {
    page,
  })

  // Strictly the API rows for this page — no mock data, no other page's reviews.
  const apiItems = apiResponse?.data?.filter(
    (item) => item.testimonial_description || item.testimonial_client_name,
  )

  const items = apiItems ?? []

  // If no data comes for this slug, hide the component completely (do not render default mock data)
  if (!items || items.length === 0) {
    // Still loading: hold the section's place with a placeholder instead of
    // collapsing it — the page must not jump when the reviews arrive.
    return isPending ? <TestimonialSkeleton tone={tone} /> : null
  }

  // Duplicate items for seamless 50% infinite translation loop
  const marqueeItems = items.length >= 4 ? [...items, ...items] : [...items, ...items, ...items, ...items]

  const bgCls =
    tone === 'navy'
      ? 'bg-[#0B1526] text-white'
      : tone === 'cream'
        ? 'bg-[#FFFBF2] text-navy-900'
        : 'bg-cream-50 text-navy-900'

  const maskGradient =
    tone === 'navy'
      ? {
          from: 'from-[#0B1526]',
          via: 'via-[#0B1526]/80',
        }
      : tone === 'cream'
        ? {
            from: 'from-[#FFFBF2]',
            via: 'via-[#FFFBF2]/80',
          }
        : {
            from: 'from-[#fffbf2]',
            via: 'via-[#fffbf2]/80',
          }

  return (
    <section id={id} className={`relative overflow-hidden py-14 sm:py-16 md:py-20 ${bgCls}`}>
      <div className="relative z-10">
        {/* Section Header */}
        <div className="section-pad">
          <Reveal variant="up" className="mx-auto max-w-2xl text-center">
            <div className="eyebrow mx-auto justify-center">
              <span className="text-gold-500">✦</span>
              <span>{eyebrow || t('stories.eyebrow', 'Words of Trust & Warmth')}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              <span className={tone === 'navy' ? 'text-white' : 'text-navy-900'}>
                {titleA || t('stories.titleA', 'Cherished Experiences,')}{' '}
              </span>
              <span className="text-gold-500">
                {titleB || t('stories.titleB', 'Real Stories.')}
              </span>
            </h2>

            <p className={`mt-3 text-sm leading-relaxed sm:text-base ${
              tone === 'navy' ? 'text-white/75' : 'text-ink-600'
            }`}>
              {subtitle ||
                t(
                  'stories.subtitle',
                  'Discover how our thoughtful guidance and dedicated support have helped families connect with trust.',
                )}
            </p>
          </Reveal>
        </div>

        {/* Infinite Auto-Scroll Marquee */}
        <div className="relative mt-10 sm:mt-12 overflow-hidden py-4">
          {/* Left & Right Edge Vignette Gradient Masks */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-16 sm:w-28 md:w-40 bg-gradient-to-r ${maskGradient.from} ${maskGradient.via} to-transparent`}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-16 sm:w-28 md:w-40 bg-gradient-to-l ${maskGradient.from} ${maskGradient.via} to-transparent`}
            aria-hidden="true"
          />

          {/* Continuous Horizontal Ribbon */}
          <div className="testimonial-marquee flex gap-6 px-4">
            {marqueeItems.map((item, index) => (
              <TestimonialCard key={`${item.testimonial_client_name}-${index}`} item={item} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
