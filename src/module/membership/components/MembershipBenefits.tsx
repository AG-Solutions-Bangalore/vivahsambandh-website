import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'
import type { MembershipBenefitItem } from '../types'

export default function MembershipBenefits() {
  const { t } = useTranslation()
  const benefits = (t('membershipPage.benefits.items', { returnObjects: true }) as MembershipBenefitItem[]) || []

  return (
    <section className="relative overflow-hidden bg-cream-50 py-14 sm:py-16 lg:py-20">
      <div className="section-pad">
        <Reveal variant="up" className="mx-auto max-w-2xl text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
            <span>✦</span>
            <span>{t('membershipPage.benefits.eyebrow')}</span>
            <span>✦</span>
          </div>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900">
            {t('membershipPage.benefits.title')}
          </h2>
        </Reveal>

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {benefits.map((b, idx) => (
            <Reveal
              key={idx}
              variant="up"
              delay={idx * 0.08}
              className="flex flex-col rounded-2xl border border-gold-500/25 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-display text-lg font-bold text-navy-900 mb-2">
                {b.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed flex-1">
                {b.desc}
              </p>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
