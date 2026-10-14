import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { CityProfile } from '../types'

// Stylized architectural SVG landmarks for Indian heritage cities matching the design's arched aesthetic
function CityMonumentIcon({ index }: { index: number }) {
  const styles = [
    // Fort / Minar (Delhi)
    'from-amber-500/20 via-orange-400/20 to-sky-300/30',
    // Gateway / Coastal arch (Mumbai)
    'from-sky-500/20 via-blue-400/20 to-indigo-300/30',
    // Memorial / Classical Dome (Kolkata)
    'from-emerald-500/20 via-teal-400/20 to-sky-300/30',
    // Palace / Dravidian Turret (Bengaluru)
    'from-rose-500/20 via-pink-400/20 to-purple-300/30',
    // Charminar / Heritage Pillars (Hyderabad)
    'from-amber-600/20 via-yellow-500/20 to-orange-300/30',
    // Wada / Historic Citadel (Pune)
    'from-blue-600/20 via-cyan-500/20 to-sky-300/30',
    // Stepwell / Havelis (Ahmedabad)
    'from-orange-500/20 via-amber-400/20 to-yellow-300/30',
    // Pan-India / International (Others)
    'from-gold-500/20 via-purple-400/20 to-pink-300/30',
  ]

  const bg = styles[index % styles.length]

  return (
    <div className={`relative flex h-32 w-full items-end justify-center overflow-hidden rounded-t-xl bg-gradient-to-t ${bg} p-2`}>
      {/* Decorative Palace Silhouettes */}
      <svg
        viewBox="0 0 120 90"
        className="h-24 w-auto text-gold-700/80 drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M60 4c-3 6-8 12-8 16h16c0-4-5-10-8-16zM50 20c-8 3-14 11-14 20h48c0-9-6-17-14-20H50z" />
        <path d="M30 40h60v44H30zM42 50h12v34H42zM66 50h12v34H66z" />
        <path d="M18 52h8v32h-8zM94 52h8v32h-8zM14 84h92v4H14z" />
        <path d="M22 36c-2 4-5 8-5 12h10c0-4-3-8-5-12zM98 36c-2 4-5 8-5 12h10c0-4-3-8-5-12z" />
      </svg>
      {/* Sun / Sky subtle glow */}
      <div className="absolute top-2 h-10 w-10 rounded-full bg-gold-400/30 blur-md pointer-events-none" />
    </div>
  )
}

export default function CityMatchesSection() {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  const rawCities = (t('cities.list', { returnObjects: true }) as CityProfile[]) || []

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-cream-100/60 relative py-16 lg:py-24">
      <div className="section-pad">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t('cities.eyebrow')}</span>
            </div>
            <h2 className="font-display mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
              {t('cities.title')}
            </h2>
            <p className="mt-2 text-sm text-ink-600 sm:text-base">
              {t('cities.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#all-cities"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-maroon-600 transition hover:text-maroon-700 hover:underline"
            >
              <span>{t('cities.viewAll')}</span>
              <span aria-hidden="true">→</span>
            </a>
            {/* Scroll Navigation Controls */}
            <div className="hidden gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Previous cities"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-xs transition hover:bg-gold-50"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Next cities"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-xs transition hover:bg-gold-50"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Cities Carousel */}
        <div
          ref={scrollRef}
          className="no-scrollbar mt-10 flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory"
        >
          {rawCities.map((city, idx) => (
            <a
              key={city.name}
              href={`#city-${city.name}`}
              className="group card-ring relative flex min-w-[170px] flex-col overflow-hidden text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-lift snap-start sm:min-w-[190px]"
            >
              {/* Arched Landmark Image Area */}
              <CityMonumentIcon index={idx} />

              <div className="p-3.5">
                <h3 className="font-display text-base font-bold text-navy-900 group-hover:text-maroon-600 transition-colors">
                  {city.name}
                </h3>
                <p className="mt-1 inline-block rounded-full bg-gold-100/70 px-2.5 py-0.5 text-[11px] font-semibold text-gold-800">
                  {city.count} {t('cities.profiles')}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
