import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'
import { img } from '../../../lib/image'

interface StoryGridItem {
  id: string
  cityKey: string
  names: string
  gotras: string
  city: string
  weddingDate: string
  quote: string
  story: string
  image: string
  badge: string
}

interface FilterItem {
  id: string
  label: string
}

export default function StoriesGrid() {
  const { t } = useTranslation()
  const [activeCity, setActiveCity] = useState<string>('all')

  const filters = (t('storiesPage.grid.filters', { returnObjects: true }) as FilterItem[]) || []
  const allStories = (t('storiesPage.grid.items', { returnObjects: true }) as StoryGridItem[]) || []

  const filtered = allStories.filter((item) => {
    if (activeCity === 'all') return true
    return item.cityKey === activeCity
  })

  return (
    <section className="relative overflow-hidden bg-[#FFFBF2] py-14 sm:py-16 lg:py-20">
      <div className="section-pad">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
              <span>✦</span>
              <span>{t('storiesPage.grid.eyebrow')}</span>
            </div>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900">
              {t('storiesPage.grid.title')}
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCity(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeCity === c.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white border border-gold-500/30 text-navy-900 hover:bg-gold-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <Reveal
              key={item.id}
              variant="up"
              delay={idx * 0.07}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gold-500/25 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-950">
                <img
                  src={img(item.image)}
                  width={640}
                  height={400}
                  alt={item.names}
                  title={item.names}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 rounded-full bg-navy-900/80 px-3 py-1 text-[11px] font-bold text-gold-300 backdrop-blur-xs">
                  {item.badge}
                </div>
              </div>

              <div className="p-5 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gold-700 font-semibold mb-2">
                    <span className="rounded-md bg-gold-50 px-2.5 py-0.5 border border-gold-500/30">
                      {item.gotras}
                    </span>
                    <span className="text-ink-600 font-medium">
                      {item.city}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-navy-900 mb-1">
                    {item.names}
                  </h3>

                  <p className="text-[11px] text-gold-700 font-semibold mb-3">
                    {item.weddingDate}
                  </p>

                  <p className="text-xs sm:text-sm text-ink-600 italic leading-relaxed border-l-2 border-gold-400 pl-3 mb-3">
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  <p className="text-xs text-ink-600 leading-relaxed line-clamp-3">
                    {item.story}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gold-500/15 flex items-center justify-between text-xs text-gold-700 font-bold">
                  <span className="flex items-center gap-1">
                    <span>♥</span>
                    <span>VivahSambandh Union</span>
                  </span>
                  <span className="text-navy-900 font-semibold">100% Verified</span>
                </div>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
