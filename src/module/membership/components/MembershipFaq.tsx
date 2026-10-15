import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'
import type { MembershipFaqItem } from '../types'

export default function MembershipFaq() {
  const { t } = useTranslation()
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const faqs = (t('membershipPage.faq.items', { returnObjects: true }) as MembershipFaqItem[]) || []

  const toggle = (i: number) => {
    setOpenIdx((curr) => (curr === i ? null : i))
  }

  return (
    <section className="relative overflow-hidden bg-[#FFFBF2] py-14 sm:py-16">
      <div className="section-pad max-w-4xl mx-auto">
        <Reveal variant="up" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
            <span>✦</span>
            <span>{t('membershipPage.faq.eyebrow')}</span>
          </div>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900">
            {t('membershipPage.faq.title')}
          </h2>
        </Reveal>

        <RevealGroup className="space-y-3.5">
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx
            return (
              <Reveal
                key={idx}
                variant="up"
                delay={idx * 0.06}
                className="overflow-hidden rounded-2xl border border-gold-500/25 bg-white shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-display text-sm sm:text-base font-bold text-navy-900 transition hover:bg-gold-50/40 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{f.q}</span>
                  <span
                    className={`ml-4 text-gold-600 transition-transform duration-300 font-bold ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-ink-600 leading-relaxed border-t border-gold-500/10 pt-3">
                    {f.a}
                  </div>
                )}
              </Reveal>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
