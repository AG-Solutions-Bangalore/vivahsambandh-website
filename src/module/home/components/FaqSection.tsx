import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FaqItem } from '../types'

export default function FaqSection() {
  const { t } = useTranslation()
  const rawItems = (t('faq.items', { returnObjects: true }) as FaqItem[]) || []
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (i: number) => {
    setOpenIndex((curr) => (curr === i ? null : i))
  }

  return (
    <section className="relative overflow-hidden bg-[#FFFBF2] py-12">
      {/* Background Architectural Temple Arch Artwork — soft, visible, text stays readable */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.16]">
        <img
          src="/images/home/Elegant Temple Wedding Banner.webp"
          alt=""
          className="h-full w-full object-cover object-bottom"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#FFFBF2]/45" />

      <div className="section-pad relative">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-5">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t('faq.eyebrow')}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              {t('faq.title')}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
              {t('faq.subtitle')}
            </p>

            <div className="mt-8">
              <a href="#all-faq" className="btn-primary !px-7 !py-3">
                {t('faq.cta')}
                <span className="text-gold-300" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Accordion Questions */}
          <div className="space-y-3 lg:col-span-7">
            {rawItems.map((item, i) => {
              const isOpen = openIndex === i
              return (
                <div
                  key={item.q}
                  className={`card-ring overflow-hidden bg-white/95 backdrop-blur transition-all duration-300 ${
                    isOpen ? 'border-gold-500 shadow-md ring-1 ring-gold-500/30' : 'hover:border-gold-400'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition sm:p-5"
                  >
                    <span className="font-display text-sm font-bold text-navy-900 sm:text-base">
                      {item.q}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 ${
                        isOpen ? 'bg-navy-900 text-gold-300 rotate-180' : 'bg-gold-100 text-navy-900'
                      }`}
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {/* Animated answer — grid-rows transition, no layout jump */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-gold-500/20 bg-cream-50/50 px-4 pb-4 pt-3 text-xs leading-relaxed text-ink-600 sm:px-5 sm:pb-5 sm:text-sm">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
