import { useTranslation } from 'react-i18next'

interface AppFeatureItem {
  title: string
  desc: string
}

function FeatureIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
  }
}

export default function DownloadFeatures() {
  const { t } = useTranslation()
  const rawFeatures = (t('downloadPage.features', { returnObjects: true }) as AppFeatureItem[]) || []

  return (
    <section className="relative bg-white py-16 sm:py-24 border-t border-gold-500/20">
      <div className="section-pad">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-800">
            <span>✦</span>
            <span>{t('downloadPage.featuresEyebrow')}</span>
          </div>
          <h2 className="font-display mt-3 text-2xl font-bold text-navy-900 sm:text-3xl lg:text-4xl">
            {t('downloadPage.featuresTitle')}
          </h2>
          <p className="mt-3 text-sm text-ink-600 sm:text-base">
            {t('downloadPage.featuresSubtitle')}
          </p>
        </div>

        {/* Feature Cards Grid (Always visible, ultra-fast CSS transitions) */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rawFeatures.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative rounded-3xl border border-gold-500/25 bg-gradient-to-b from-[#FFFDF9] to-white p-6 sm:p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:shadow-[0_12px_30px_rgba(212,175,55,0.12)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-maroon-700 transition-colors duration-300 group-hover:bg-maroon-600 group-hover:text-white shadow-xs">
                <FeatureIcon index={i} />
              </div>
              <h3 className="font-display mt-5 text-base font-bold text-navy-900 sm:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-600 sm:text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
