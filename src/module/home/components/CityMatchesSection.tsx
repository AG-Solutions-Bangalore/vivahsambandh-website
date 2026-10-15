import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, A11y } from 'swiper/modules'
import Reveal from '../../../components/motion/Reveal'
import { prefersReducedMotion } from '../../../lib/gsap-setup'
import { CITIES } from '../data/cities'

import 'swiper/css'
import 'swiper/css/navigation'

export default function CityMatchesSection() {
  const { t } = useTranslation()
  // Autoplay is motion: freeze the carousel for reduced-motion users
  // (static slider remains fully swipeable).
  const autoplay = prefersReducedMotion()
    ? false
    : {
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }

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

        {/* ============================================================== */}
        {/* Swiper.js Slider: strictly 4 cards at a time on desktop       */}
        {/* NOTE: intentionally NOT wrapped in a GSAP Reveal. Swiper runs */}
        {/* its own transform loop; a GSAP-animated ancestor causes       */}
        {/* glitches (init measuring + per-frame style writes + autoplay  */}
        {/* motion stacking). Header above still reveals.                 */}
        {/* ============================================================== */}
        {/* data-lenis-prevent REMOVED here on purpose: it is only for nested
            scroll containers. On a flat Swiper wrapper it makes Lenis skip
            smoothing wheel events → instant unsmoothed jumps exactly over
            the carousel. Swiper drag works natively (syncTouch: false). */}
        <div className="group/cities relative mt-8 px-10 sm:mt-10 sm:px-12">
          {/* Custom Navigation Button: Prev (Left) — shows on hover */}
          <button
            type="button"
            aria-label="Previous cities"
            className="city-prev absolute left-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/cities:visible group-hover/cities:opacity-100 focus-visible:visible focus-visible:opacity-100"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-navy-900 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Custom Navigation Button: Next (Right) — shows on hover */}
          <button
            type="button"
            aria-label="Next cities"
            className="city-next absolute right-0 top-[38%] z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/40 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:border-gold-600 hover:bg-gold-50 active:scale-95 cursor-pointer sm:h-10 sm:w-10 invisible opacity-0 group-hover/cities:visible group-hover/cities:opacity-100 focus-visible:visible focus-visible:opacity-100"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-gold-600 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Swiper Container: max 4 visible cards, pages by 4 on desktop */}
          <Swiper
            modules={[Navigation, Autoplay, A11y]}
            navigation={{
              prevEl: '.city-prev',
              nextEl: '.city-next',
            }}
            // Self-correct when slide content mutates after init (locale
            // switch EN↔HI, lazy images, GSAP reveal transforms above).
            // Without this Swiper keeps stale measurements → visual glitches.
            observer={true}
            observeParents={true}
            observeSlideChildren={true}
            loop={CITIES.length > 4}
            speed={600}
            watchOverflow={true}
            grabCursor={true}
            autoplay={autoplay}
            spaceBetween={14}
            slidesPerView={1.2}
            slidesPerGroup={1}
            breakpoints={{
              480: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 22,
              },
              1280: {
                slidesPerView: 4,
                slidesPerGroup: 4,
                spaceBetween: 24,
              },
            }}
            className="!py-2"
          >
            {CITIES.map((city) => {
              const cityName = t(city.nameKey, { defaultValue: city.defaultName })

              return (
                <SwiperSlide key={city.id} className="!h-auto">
                  <a
                    href={`#city-${city.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gold-500/30 bg-white p-1.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-500 hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-gold-500 sm:p-2"
                  >
                    {/* City Monument Image (Aspect 4/3 with rounded corners) */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gold-50">
                      <img
                        src={city.image}
                        alt={cityName}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
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
                  </a>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
