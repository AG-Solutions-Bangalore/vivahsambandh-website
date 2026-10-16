import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { refreshScrollTriggers } from '../../../lib/gsap-setup'
import type { FaqFallbackItem } from '../types'
import { getFaqAnswer, getFaqQuestion, useGroupedFaqs } from '../hook/useFaq'

export interface FaqSectionProps {
  slug?: string
  /**
   * Fallback slugs tried when `slug` returns no rows.
   * Default: none — only `slug` is queried (pass `['home']` to opt in).
   */
  fallbackSlugs?: Array<string | null | undefined> | null
  title?: string
  subtitle?: string
  eyebrow?: string
  ctaText?: string
  ctaHref?: string
  fallbackItems?: FaqFallbackItem[]
  tone?: 'cream' | 'paper' | 'navy'
  id?: string
  showCta?: boolean
}

function FaqSkeleton({ tone }: { tone: 'cream' | 'paper' | 'navy' }) {
  const row =
    tone === 'navy'
      ? 'border-white/10 bg-white/5'
      : 'border-gold-500/20 bg-white/95'
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`animate-pulse overflow-hidden rounded-xl border ${row} p-4 sm:p-5`}>
          <div className="h-4 w-3/4 rounded bg-current opacity-10" />
          <div className="mt-2 h-3 w-1/2 rounded bg-current opacity-5" />
        </div>
      ))}
    </div>
  )
}

export default function FaqSection({
  slug = 'home',
  fallbackSlugs,
  title,
  subtitle,
  eyebrow,
  ctaText,
  ctaHref = '#contact',
  fallbackItems,
  tone = 'cream',
  id = 'faq',
  showCta = true,
}: FaqSectionProps) {
  const { t } = useTranslation()
  const [openKey, setOpenKey] = useState<string | null>('0-0')
  const { groups, isPending, isEmpty } = useGroupedFaqs(slug, {
    fallbackSlugs,
    fallbackItems,
  })

  // Note: `openKey` is positional (`gi-ii`). If the slug changes to a
  // shorter list the key simply matches nothing (all closed) — no reset
  // effect needed, which also avoids a set-state-in-effect render cascade.
  useEffect(() => {
    const cancel = refreshScrollTriggers(350)
    return cancel
  }, [openKey, groups.length])

  // Hide the section entirely when the slug chain + fallbackItems yield
  // nothing (preserves legacy behavior for pages without FAQs).
  if (!isPending && isEmpty) {
    return null
  }

  const toggle = (key: string) => {
    setOpenKey((curr) => (curr === key ? null : key))
  }

  const bgCls =
    tone === 'paper'
      ? 'bg-white'
      : tone === 'navy'
        ? 'bg-navy-900 text-white'
        : 'bg-[#FFFBF2]'

  return (
    <section id={id} className={`relative overflow-hidden ${bgCls} py-14 sm:py-16 md:py-20`}>
      {/* Background Architectural Temple Arch Artwork */}
      {tone !== 'navy' && (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-[0.16]" aria-hidden="true">
            <img
              src="/images/home/elegant-temple-wedding-banner.webp"
              srcSet="/images/home/elegant-temple-wedding-banner-1024.webp 1024w, /images/home/elegant-temple-wedding-banner.webp 2170w"
              sizes="100vw"
              width={2170}
              height={725}
              alt="Decorative temple wedding banner"
              title="Decorative temple wedding banner"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-bottom"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[#FFFBF2]/45" />
        </>
      )}

      <div className="section-pad relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Heading & CTA */}
          <Reveal variant="left" className="lg:col-span-5">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{eyebrow || t('faq.eyebrow')}</span>
            </div>

            <h2 className={`font-display mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl ${
              tone === 'navy' ? 'text-white' : 'text-navy-900'
            }`}>
              {title || t('faq.title')}
            </h2>

            <p className={`mt-4 text-sm leading-relaxed sm:text-base ${
              tone === 'navy' ? 'text-white/75' : 'text-ink-600'
            }`}>
              {subtitle || t('faq.subtitle')}
            </p>

            {showCta && (
              <div className="mt-8">
                <a
                  href={ctaHref}
                  title={ctaText || t('faq.cta')}
                  className="btn-primary !px-7 !py-3 inline-flex items-center gap-2"
                >
                  {ctaText || t('faq.cta')}
                  <span className="text-gold-300" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>
            )}
          </Reveal>

          {/* Right Column: Accordion Questions, grouped by faq_heading */}
          <Reveal variant="right" delay={0.1} className="space-y-6 lg:col-span-7">
            {isPending && isEmpty ? (
              <FaqSkeleton tone={tone} />
            ) : (
              groups.map((group, gi) => (
                <div key={`${group.heading ?? 'general'}-${gi}`} className="space-y-3">
                  {group.heading && (
                    <h3
                      className={`font-display text-base font-bold sm:text-lg ${
                        tone === 'navy' ? 'text-gold-300' : 'text-navy-900'
                      }`}
                    >
                      {group.heading}
                    </h3>
                  )}
                  {group.items.map((f, ii) => {
                    const q = getFaqQuestion(f)
                    const a = getFaqAnswer(f)
                    const key = `${gi}-${ii}`
                    const isOpen = openKey === key
                    const itemId = (f as { id?: unknown })?.id
                    const panelId = `${id}-panel-${gi}-${ii}`
                    const buttonId = `${id}-button-${gi}-${ii}`
                    return (
                      <div
                        key={itemId != null ? `faq-${String(itemId)}` : `${q}-${key}`}
                        className={`card-ring overflow-hidden backdrop-blur transition-all duration-300 ${
                          tone === 'navy'
                            ? isOpen
                              ? 'border-gold-500/60 bg-white/10 ring-1 ring-gold-500/30 text-white'
                              : 'border-white/10 bg-white/5 hover:border-gold-500/40 text-white'
                            : isOpen
                              ? 'border-gold-500 bg-white/95 shadow-md ring-1 ring-gold-500/30'
                              : 'border-gold-500/20 bg-white/95 hover:border-gold-400'
                        }`}
                      >
                        <button
                          id={buttonId}
                          type="button"
                          onClick={() => toggle(key)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="flex w-full items-center justify-between gap-4 p-4 text-left transition sm:p-5 cursor-pointer"
                        >
                          <span className={`font-display text-sm font-bold sm:text-base ${
                            tone === 'navy' ? 'text-white' : 'text-navy-900'
                          }`}>
                            {q}
                          </span>
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 ${
                              isOpen
                                ? 'bg-navy-900 text-gold-300 rotate-180'
                                : tone === 'navy'
                                  ? 'bg-gold-500 text-navy-950'
                                  : 'bg-gold-100 text-navy-900'
                            }`}
                            aria-hidden="true"
                          >
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>

                        {/* Animated answer */}
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className={`border-t px-4 pb-4 pt-3 text-xs leading-relaxed sm:px-5 sm:pb-5 sm:text-sm ${
                              tone === 'navy'
                                ? 'border-white/10 bg-black/20 text-white/80'
                                : 'border-gold-500/20 bg-cream-50/50 text-ink-600'
                            }`}>
                              <p>{a}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
