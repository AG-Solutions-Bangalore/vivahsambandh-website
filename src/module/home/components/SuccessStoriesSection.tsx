import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, A11y } from 'swiper/modules'
import Reveal from '../../../components/motion/Reveal'
import { prefersReducedMotion } from '../../../lib/gsap-setup'

import 'swiper/css'
import 'swiper/css/pagination'

const STORY_IMAGES = [
  {
    src: '/images/home/radiant-indian-wedding-portrait.webp',
    srcSet:
      '/images/home/radiant-indian-wedding-portrait-640.webp 640w, /images/home/radiant-indian-wedding-portrait.webp 1693w',
    width: 1693,
    height: 929,
  },
  {
    src: '/images/home/romantic-indian-wedding-portrait.webp',
    srcSet:
      '/images/home/romantic-indian-wedding-portrait-640.webp 640w, /images/home/romantic-indian-wedding-portrait.webp 1650w',
    width: 1650,
    height: 953,
  },
  {
    src: '/images/home/navy-and-gold-wedding-romance.webp',
    srcSet:
      '/images/home/navy-and-gold-wedding-romance-640.webp 640w, /images/home/navy-and-gold-wedding-romance.webp 1504w',
    width: 1504,
    height: 1046,
  },
]

export default function SuccessStoriesSection() {
  const { t } = useTranslation()
  const rawItems = (t('stories.items', { returnObjects: true }) as Array<{ quote: string; name: string; city: string }>) || []

  const items = rawItems.map((item, idx) => ({
    ...item,
    img: STORY_IMAGES[idx % STORY_IMAGES.length],
  }))

  // Duplicate so the 3-card loop slider always has slides to advance to
  const slides = items.length > 3 ? items : [...items, ...items]

  // Autoplay is motion: freeze the carousel for reduced-motion users
  // (static slider remains fully swipeable).
  const autoplay = prefersReducedMotion()
    ? false
    : { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }

  // "Real Happiness." → Real (navy) + Happiness. (maroon); locale-safe
  const titleB = t('stories.titleB')
  const titleBWords = titleB.trim().split(/\s+/)
  const titleBLast = titleBWords.pop() ?? ''
  const titleBFirst = titleBWords.join(' ')

  return (
    <section className="relative overflow-hidden bg-[#FFFAF2] py-14 sm:py-16">
      {/* soft gold glow accents like the reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(700px 280px at 8% 20%, rgba(211,154,43,0.10), transparent 60%), radial-gradient(700px 300px at 95% 85%, rgba(211,154,43,0.08), transparent 60%)',
        }}
      />

      <div className="section-pad relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          {/* ========================================================== */}
          {/* Left Column: Eyebrow, Heading, Subtitle, CTA               */}
          {/* ========================================================== */}
          <Reveal variant="left" className="lg:col-span-5 xl:col-span-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              <span aria-hidden="true" className="text-sm leading-none">✦</span>
              <span data-eyebrow>{t('stories.eyebrow')}</span>
            </div>

            <h2 className="font-display mt-3 text-4xl font-bold leading-[1.12] text-navy-900 sm:text-5xl lg:text-[44px] xl:text-[52px]">
              <span className="block lg:whitespace-nowrap">{t('stories.titleA')}</span>
              <span className="block lg:whitespace-nowrap">
                {titleBFirst ? `${titleBFirst} ` : ''}<span className="text-maroon-600">{titleBLast}</span>
              </span>
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-navy-900/65 sm:text-base">
              {t('stories.subtitle')}
            </p>

            <div className="mt-7">
              <a
                href="#stories"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-7 py-3 text-[13px] font-bold text-white shadow-lift transition hover:bg-navy-700 active:scale-[0.98]"
              >
                <span>{t('stories.cta')}</span>
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </Reveal>

          {/* ========================================================== */}
          {/* Right Column: Swiper.js 3-card slider                      */}
          {/* NOTE: intentionally NOT wrapped in a GSAP Reveal — same    */}
          {/* reason as CityMatches: Swiper owns its transform loop.    */}
          {/* ========================================================== */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* No data-lenis-prevent: flat Swiper wrapper, see CityMatches. */}
            <div className="group/stories relative" id="stories">
              <Swiper
                modules={[Pagination, Autoplay, A11y]}
                pagination={{ el: '.stories-pagination', clickable: true }}
                // Self-correct when slide content mutates after init (locale
                // switch EN↔HI, lazy images, GSAP reveal transforms above).
                observer={true}
                observeParents={true}
                observeSlideChildren={true}
                loop={slides.length > 3}
                speed={600}
                watchOverflow={true}
                grabCursor={true}
                autoplay={autoplay}
                spaceBetween={16}
                slidesPerView={1.15}
                slidesPerGroup={1}
                breakpoints={{
                  560: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 18 },
                  1024: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 20 },
                  1280: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 20 },
                }}
                className="!py-2"
              >
                {slides.map((story, i) => (
                  <SwiperSlide key={`${story.name}-${i}`} className="!h-auto">
                    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-gold-500/25 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 hover:shadow-lift">
                      {/* Couple photo */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gold-100">
                        <img
                          src={story.img.src}
                          srcSet={story.img.srcSet}
                          sizes="(max-width: 560px) 75vw, (max-width: 1280px) 40vw, 25vw"
                          width={story.img.width}
                          height={story.img.height}
                          alt={story.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Quote + couple info */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <p className="text-sm leading-[1.7] text-navy-900/80 sm:text-[15px]">
                          &ldquo;{story.quote}&rdquo;
                        </p>
                        <div className="mt-4">
                          <h3 className="flex items-center gap-1.5 text-[15px] font-bold text-navy-900">
                            <span aria-hidden="true" className="text-base leading-none text-maroon-500">♥</span>
                            <span>{story.name}</span>
                          </h3>
                           <p className="mt-1 pl-[24px] text-xs font-medium text-ink-500">{story.city}</p>
                        </div>
                      </div>
                    </article>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Pagination dots — centered below cards like the reference */}
              <div className="stories-pagination mt-5 flex items-center justify-center gap-1.5" />
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
