import { useTranslation } from 'react-i18next'
import { COMPANY } from '../../../constants/company'
import type { AppFeature } from '../types'

function AppFeatureIcon({ index }: { index: number }) {
  switch (index) {
    case 0:
      // Instant Notifications (Bell)
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    case 1:
      // Smart Search Filters (Filter)
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      )
    case 2:
      // Profile Management (User profile)
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 3:
      // Secure Communication (Lock/chat)
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    default:
      // User Friendly Interface (Sparkle / Interface)
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
        </svg>
      )
  }
}

export default function AppDownloadSection() {
  const { t } = useTranslation()
  const rawFeatures = (t('app.features', { returnObjects: true }) as AppFeature[]) || []

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="section-pad">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading, Copy & App Store Buttons */}
          <div className="lg:col-span-4">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t('app.eyebrow')}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              {t('app.title')}
            </h2>

            <p className="mt-5 text-sm leading-relaxed text-ink-600 sm:text-base">
              {t('app.body')}
            </p>

            {/* Store Download Buttons */}
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <a
                href={COMPANY.apps.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl border border-navy-900 bg-navy-900 px-4 py-2.5 text-white shadow-md transition hover:bg-navy-800"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white" aria-hidden="true">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a1.996 1.996 0 01-.61-1.428V3.242c0-.555.226-1.057.61-1.428zM15.207 13.414l2.766 2.766-11.83 6.829 9.064-9.595zm0-2.828L6.143 1.056l11.83 6.758-2.766 2.772zm1.414 1.414l3.879-2.222a1.498 1.498 0 010 2.607l-3.879 2.222-1.414-1.303 1.414-1.304z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70">GET IT ON</span>
                  <span className="block text-xs font-bold text-white sm:text-sm">Google Play</span>
                </div>
              </a>

              <a
                href={COMPANY.apps.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl border border-navy-900 bg-navy-900 px-4 py-2.5 text-white shadow-md transition hover:bg-navy-800"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.16.67-2.82 1.44-.58.67-1.09 1.76-.95 2.83 1.12.09 2.19-.57 2.81-1.32z" />
                </svg>
                <div className="text-left leading-none">
                  <span className="block text-[9px] uppercase tracking-wider text-white/70">Download on the</span>
                  <span className="block text-xs font-bold text-white sm:text-sm">App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Center Column: Mobile App Showcase Mockup */}
          <div className="flex justify-center lg:col-span-5">
            <div className="relative mx-auto max-w-[340px] drop-shadow-2xl transition-transform duration-700 hover:scale-105 sm:max-w-[400px]">
              <img
                src="/images/home/VivahSambandh Matrimony Showcase.webp"
                alt={`${COMPANY.name} Mobile App Interface`}
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Column: 5 Features List with Maroon Circular Badges */}
          <div className="space-y-3.5 lg:col-span-3">
            {rawFeatures.map((f, i) => (
              <div
                key={f.title}
                className="card-ring flex items-center gap-3.5 bg-white/95 p-3.5 shadow-sm transition-all duration-300 hover:border-gold-500 hover:shadow-card"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon-600 text-white shadow-xs">
                  <AppFeatureIcon index={i} />
                </div>
                <div className="leading-tight">
                  <h3 className="text-xs font-bold text-navy-900 sm:text-sm">{f.title}</h3>
                  <p className="mt-0.5 text-[11px] text-ink-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
