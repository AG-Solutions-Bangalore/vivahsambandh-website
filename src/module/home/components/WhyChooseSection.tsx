import { useTranslation } from 'react-i18next'
import type { WhyFeature } from '../types'

function FeatureIcon({ index }: { index: number }) {
  // 6 distinctive gold badges matching the design's feature icons
  switch (index) {
    case 0:
      // Verified & Genuine Profiles
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 1:
      // Community Based Matching
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 2:
      // Advanced Search Filters
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      )
    case 3:
      // Personalized Match Suggestions
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 4:
      // Family Involvement Options
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    default:
      // Safe & Secure Communication
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-gold-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
  }
}

export default function WhyChooseSection() {
  const { t } = useTranslation()
  const rawFeatures = (t('why.features', { returnObjects: true }) as WhyFeature[]) || []

  return (
    <section className="py-16 lg:py-24">
      <div className="section-pad">
        <div className="bg-navy-pattern rounded-[2rem] p-8 shadow-lift md:p-12 lg:p-16">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content Column */}
            <div className="lg:col-span-5">
              <div className="eyebrow !text-gold-400">
                <span>✦</span>
                <span>{t('why.eyebrow')}</span>
              </div>

              <h2 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t('why.title')}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                {t('why.subtitle')}
              </p>

              <div className="mt-8">
                <a
                  href="#explore-features"
                  className="btn-gold !bg-gold-500 !text-navy-950 !border-gold-400 font-bold hover:!bg-gold-400"
                >
                  {t('why.cta')}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            {/* Right 2x3 Feature Cards Grid */}
            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {rawFeatures.map((f, i) => (
                  <div
                    key={f.title}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-gold-500/20 bg-white p-4.5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 sm:p-5"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-50">
                        <FeatureIcon index={i} />
                      </div>
                      <h3 className="text-sm font-bold text-navy-900 group-hover:text-maroon-700 transition-colors">
                        {f.title}
                      </h3>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-gold-600 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
