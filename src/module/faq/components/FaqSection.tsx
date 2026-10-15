import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { refreshScrollTriggers } from '../../../lib/gsap-setup'
import { useFaqQuery } from '../hook/useFaq'

export interface FaqSectionProps {
  slug?: string
  title?: string
  subtitle?: string
  eyebrow?: string
  ctaText?: string
  ctaHref?: string
  fallbackItems?: Array<{ q: string; a: string }>
  tone?: 'cream' | 'paper' | 'navy'
  id?: string
  showCta?: boolean
}

export default function FaqSection({
  slug = 'home',
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
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { data: faqData } = useFaqQuery(slug)

  useEffect(() => {
    const cancel = refreshScrollTriggers(350)
    return cancel
  }, [openIndex])

  const apiItems = faqData?.data
    ?.map((f) => ({
      q: f.faq_que || f.question || '',
      a: f.faq_ans || f.answer || '',
    }))
    .filter((f) => f.q && f.a)

  // Strictly only show if data comes from API or explicitly passed fallbackItems
  const items = apiItems && apiItems.length > 0 ? apiItems : (fallbackItems ?? [])

  // If no FAQ data comes for this slug, hide the component completely
  if (!items || items.length === 0) {
    return null
  }

  const toggle = (i: number) => {
    setOpenIndex((curr) => (curr === i ? null : i))
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

          {/* Right Column: Accordion Questions */}
          <Reveal variant="right" delay={0.1} className="space-y-3 lg:col-span-7">
            {items.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={`${item.q}-${i}`}
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
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition sm:p-5 cursor-pointer"
                  >
                    <span className={`font-display text-sm font-bold sm:text-base ${
                      tone === 'navy' ? 'text-white' : 'text-navy-900'
                    }`}>
                      {item.q}
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
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
