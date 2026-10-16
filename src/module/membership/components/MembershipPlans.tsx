import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'
import type { MembershipPlan } from '../types'

export default function MembershipPlans() {
  const { t } = useTranslation()
  const plans = (t('membershipPage.plans', { returnObjects: true }) as MembershipPlan[]) || []

  return (
    <section className="relative overflow-hidden bg-cream-50 py-14 sm:py-16 lg:py-20">
      <div className="section-pad">
        <Reveal variant="up" className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
            <span>✦</span>
            <span>{t('membershipPage.plansHeader.eyebrow')}</span>
            <span>✦</span>
          </div>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-navy-900">
            {t('membershipPage.plansHeader.title')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-ink-600">
            {t('membershipPage.plansHeader.subtitle')}
          </p>
        </Reveal>

        <RevealGroup className="grid gap-8 lg:grid-cols-3 items-stretch max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <Reveal
              key={plan.id}
              variant="up"
              delay={idx * 0.1}
              className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 transition-all duration-300 ${
                plan.isPopular
                  ? 'border-gold-500 bg-white shadow-2xl ring-2 ring-gold-500/30 -translate-y-2 lg:-translate-y-4'
                  : 'border-gold-500/30 bg-white/95 shadow-md hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {plan.isPopular && plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-navy-900 px-4 py-1 text-xs font-bold text-gold-300 shadow-md border border-gold-500/40">
                  ★ {plan.badge} ★
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-navy-900">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-ink-600 mt-0.5">{plan.tagline}</p>
                </div>
                {!plan.isPopular && plan.badge && (
                  <span className="rounded-full bg-gold-50 border border-gold-500/30 px-3 py-0.5 text-[11px] font-bold text-gold-700">
                    {plan.badge}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-2 border-b border-gold-500/20 pb-6">
                <span className="font-display text-4xl sm:text-5xl font-bold text-navy-950">
                  {plan.price}
                </span>
                <span className="text-xs font-semibold text-ink-600">
                  / {plan.duration}
                </span>
              </div>

              {/* Feature List */}
              <ul className="mt-6 space-y-3.5 text-xs sm:text-sm flex-1">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5">
                    {feat.included ? (
                      <span className="text-gold-600 font-bold shrink-0 mt-0.5">✓</span>
                    ) : (
                      <span className="text-gray-300 font-bold shrink-0 mt-0.5">✕</span>
                    )}
                    <span
                      className={`${
                        feat.included
                          ? feat.highlight
                            ? 'font-bold text-navy-950'
                            : 'text-navy-900'
                          : 'text-gray-400 line-through'
                      }`}
                    >
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-8 pt-4">
                <a
                  href="#register"
                  title={plan.ctaText}
                  className={`w-full inline-flex items-center justify-center rounded-full py-3 text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 ${
                    plan.isPopular
                      ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-navy-950/20'
                      : 'border border-gold-500/80 bg-gold-50/80 text-navy-900 hover:bg-gold-100'
                  }`}
                >
                  {plan.ctaText} →
                </a>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
