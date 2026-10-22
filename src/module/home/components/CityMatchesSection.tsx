import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { CITIES } from '../data/cities'

export default function CityMatchesSection() {
  const { t } = useTranslation()

  // Two identical blocks of cities so when track translates -50%, it seamlessly resets with 0 jump and 0 empty gap.
  const citiesTrack = [...CITIES, ...CITIES]
  const marqueeCities = [...citiesTrack, ...citiesTrack]

  return (
    <section id="search" className="relative overflow-hidden bg-cream-50 py-12 sm:py-16">
      <div className="section-pad relative z-10">
        {/* ============================================================== */}
        {/* Section Header: Eyebrow, Title, Subtitle, and View All link    */}
        {/* ============================================================== */}
        <Reveal variant="up">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2">
                <span className="text-gold-600 text-sm font-bold" aria-hidden="true">
                  ☸
                </span>
                <span data-eyebrow className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-700">
                  {t('cities.eyebrow')}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950">
                {t('cities.title')}
              </h2>

              {/* Subtitle */}
              <p className="mt-1.5 text-xs sm:text-sm text-ink-600 font-medium">
                {t('cities.subtitle')}
              </p>
            </div>

            {/* "View All Cities →" link */}
            <div>
              <a
                href="#all-cities"
                title={t('cities.viewAll')}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-maroon-700 transition hover:text-maroon-800"
              >
                <span>{t('cities.viewAll')}</span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============================================================== */}
      {/* Infinite Auto-Scroll Marquee: pre-filled on load with 0 gaps   */}
      {/* Pauses automatically on hover so cards are easily clickable     */}
      {/* ============================================================== */}
      <div className="relative mt-8 sm:mt-10 overflow-hidden py-3">
        {/* Left & Right Edge Vignette Gradient Masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-12 sm:w-24 md:w-32 bg-gradient-to-r from-cream-50 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-12 sm:w-24 md:w-32 bg-gradient-to-l from-cream-50 to-transparent"
          aria-hidden="true"
        />

        {/* Continuous Horizontal Ribbon — pre-filled across entire viewport on load */}
        <div className="cities-marquee flex gap-4 px-4 sm:gap-6">
          {marqueeCities.map((city, idx) => {
            const cityName = t(city.nameKey, { defaultValue: city.defaultName })

            return (
              <div
                key={`${city.id}-${idx}`}
                title={cityName}
                className="group flex-shrink-0 w-44 sm:w-52 md:w-60 flex flex-col overflow-hidden rounded-2xl border border-gold-500/30 bg-white p-1.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-lg sm:p-2"
              >
                {/* City Monument Image (Aspect 4/3 with rounded corners) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gold-50">
                  <img
                    src={city.image}
                    srcSet={`${city.imageSm} 640w, ${city.image} 1200w`}
                    sizes="(max-width: 480px) 44vw, (max-width: 768px) 30vw, 240px"
                    width={1200}
                    height={896}
                    alt={cityName}
                    title={cityName}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* City Label & Profile Count matching design */}
                <div className="px-1 pt-2.5 pb-1 text-center">
                  <h3 className="font-display truncate text-xs font-bold text-navy-950 transition-colors group-hover:text-maroon-700 sm:text-sm">
                    {cityName}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-semibold text-sky-700 sm:text-[11px]">
                    {city.count} {t('cities.profiles')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
