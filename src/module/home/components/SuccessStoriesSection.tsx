import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SuccessStory } from '../types'

const STORY_IMAGES = [
  '/images/home/Radiant Indian Wedding Portrait.webp',
  '/images/home/Romantic Indian Wedding Portrait.webp',
  '/images/home/Navy and Gold Wedding Romance.webp',
]

export default function SuccessStoriesSection() {
  const { t } = useTranslation()
  const rawItems = (t('stories.items', { returnObjects: true }) as Array<{ quote: string; name: string; city: string }>) || []
  const [activeIndex, setActiveIndex] = useState(0)

  const items: SuccessStory[] = rawItems.map((item, idx) => ({
    ...item,
    image: STORY_IMAGES[idx % STORY_IMAGES.length],
  }))

  const prev = () => setActiveIndex((curr) => (curr === 0 ? items.length - 1 : curr - 1))
  const next = () => setActiveIndex((curr) => (curr === items.length - 1 ? 0 : curr + 1))

  return (
    <section className="bg-cream-100/40 relative py-16 lg:py-24">
      <div className="section-pad">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Heading & Introduction */}
          <div className="lg:col-span-4">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t('stories.eyebrow')}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              <span>{t('stories.titleA')}</span>
              <span className="block text-maroon-600">{t('stories.titleB')}</span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
              {t('stories.subtitle')}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a href="#stories" className="btn-primary !px-7 !py-3">
                {t('stories.cta')}
                <span className="text-gold-300" aria-hidden="true">
                  →
                </span>
              </a>
            </div>

            {/* Slider navigation controls */}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous story"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-xs transition hover:bg-gold-50 hover:border-gold-500"
              >
                ←
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next story"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/40 bg-white text-navy-900 shadow-xs transition hover:bg-gold-50 hover:border-gold-500"
              >
                →
              </button>
              <div className="ml-3 flex gap-1.5">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-6 bg-maroon-600' : 'w-2 bg-gold-400/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3 Testimonial Cards */}
          <div className="lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {items.map((story, i) => (
                <div
                  key={story.name}
                  className={`card-ring relative flex flex-col overflow-hidden bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gold-500 ${
                    i === activeIndex ? 'ring-2 ring-gold-500/50' : 'opacity-90 sm:opacity-100'
                  }`}
                >
                  {/* Couple Image with warm wedding look */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-gold-100">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Testimonial Quote & Info */}
                  <div className="flex flex-1 flex-col justify-between p-4.5 sm:p-5">
                    <p className="text-xs leading-relaxed text-ink-600 italic">
                      &ldquo;{story.quote}&rdquo;
                    </p>

                    <div className="mt-4 border-t border-gold-500/20 pt-3">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                        <span className="text-maroon-600" aria-hidden="true">
                          ♥
                        </span>
                        <span>{story.name}</span>
                      </p>
                      <p className="text-[11px] font-semibold text-ink-400">{story.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
