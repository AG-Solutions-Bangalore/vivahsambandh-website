import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { refreshScrollTriggers } from '../../../lib/gsap-setup'
import type { QuickAnswer } from '../types'

/**
 * "Quick Answers" accordion (same interaction pattern as the home FAQ:
 * grid-rows animation + ScrollTrigger refresh after toggle).
 */
export default function QuickAnswers() {
  const { t } = useTranslation()
  const items = (t('contactPage.qa', { returnObjects: true }) as QuickAnswer[]) || []
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const cancel = refreshScrollTriggers(350)
    return cancel
  }, [openIndex])

  return (
    <Reveal variant="up" delay={0.14}>
      <article className="card-ring p-6 sm:p-7">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
          {t('contactPage.qaTitle')}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-600">
          {t('contactPage.qaBody')}
        </p>

        <div className="mx-auto mt-5 grid max-w-3xl items-start gap-2.5 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-xl border transition-all duration-300 ${
                  isOpen
                    ? 'border-gold-500 bg-gold-50/60 shadow-xs'
                    : 'border-navy-100 bg-white hover:border-gold-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex((curr) => (curr === i ? null : i))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 p-3.5 text-left cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-navy-900">{item.q}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isOpen ? 'bg-navy-900 text-gold-300' : 'bg-gold-100 text-navy-900'
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-gold-500/20 px-3.5 pb-3.5 pt-2.5 text-xs leading-relaxed text-ink-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </article>
    </Reveal>
  )
}
