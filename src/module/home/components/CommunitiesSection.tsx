import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { cn } from 'cn'
import Reveal from '../../../components/motion/Reveal'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'

interface CommunityInfo {
  id: string
  name: string
  tag: string
  gotras: string
  count: string
  heritage: string
  ctaText: string
}

export default function CommunitiesSection() {
  const { t, i18n } = useTranslation()
  const lang: AppLang =
    i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const registerHref = pagePath('/register', lang)

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)

  const communities: CommunityInfo[] = [
    {
      id: 'agarwal',
      name: t('communities.list.0.name', { defaultValue: 'Agarwal' }),
      tag: t('communities.list.0.tag', { defaultValue: '18 Sacred Gotras' }),
      gotras: t('communities.list.0.gotras', {
        defaultValue: 'Bansal, Mittal, Jindal, Singhal, Garg, Goyal, Kansal & more',
      }),
      count: t('communities.list.0.count', { defaultValue: '22,000+ Profiles' }),
      heritage: t('communities.list.0.heritage', {
        defaultValue: 'Maharaja Agrasen Lineage & Heritage',
      }),
      ctaText: t('communities.explore', { defaultValue: 'Explore Agarwal Matches' }),
    },
    {
      id: 'jain',
      name: t('communities.list.1.name', { defaultValue: 'Jain' }),
      tag: t('communities.list.1.tag', {
        defaultValue: 'Digambar & Svetambar Traditions',
      }),
      gotras: t('communities.list.1.gotras', {
        defaultValue: 'Murtipujak, Terapanthi, Sthanakvasi & Deravasi',
      }),
      count: t('communities.list.1.count', { defaultValue: '12,000+ Profiles' }),
      heritage: t('communities.list.1.heritage', {
        defaultValue: 'Ahimsa, Simplicity & Spiritual Values',
      }),
      ctaText: t('communities.explore', { defaultValue: 'Explore Jain Matches' }),
    },
    {
      id: 'khandelwal',
      name: t('communities.list.2.name', { defaultValue: 'Khandelwal' }),
      tag: t('communities.list.2.tag', { defaultValue: 'Vaishya Heritage' }),
      gotras: t('communities.list.2.gotras', {
        defaultValue: 'Kulshreshtha, Dhamani, Dangayach, Rawat, Dusad & more',
      }),
      count: t('communities.list.2.count', { defaultValue: '8,500+ Profiles' }),
      heritage: t('communities.list.2.heritage', {
        defaultValue: 'Sage Khandela Lineage & Business Ethics',
      }),
      ctaText: t('communities.explore', {
        defaultValue: 'Explore Khandelwal Matches',
      }),
    },
    {
      id: 'maheshwari',
      name: t('communities.list.3.name', { defaultValue: 'Maheshwari' }),
      tag: t('communities.list.3.tag', { defaultValue: '72 Sacred Khams' }),
      gotras: t('communities.list.3.gotras', {
        defaultValue: 'Didwana & Marwari Lineage, Deep Cultural Values',
      }),
      count: t('communities.list.3.count', { defaultValue: '9,500+ Profiles' }),
      heritage: t('communities.list.3.heritage', {
        defaultValue: 'Lord Mahesh Heritage & Philanthropy',
      }),
      ctaText: t('communities.explore', {
        defaultValue: 'Explore Maheshwari Matches',
      }),
    },
  ]

  const handleToggle = (id: string) => {
    setSelectedCommunity((prev) => (prev === id ? null : id))
  }

  return (
    <section
      id="communities"
      aria-label="Communities We Serve"
      className="relative overflow-hidden bg-cream-50 pt-8 pb-12 sm:pt-10 sm:pb-16"
    >
      <div className="section-pad relative z-10">
        {/* ============================================================== */}
        {/* Section Header: Eyebrow, Title, Subtitle                       */}
        {/* ============================================================== */}
        <Reveal variant="up">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2">
                <span className="text-gold-600 text-sm font-bold" aria-hidden="true">
                  ☸
                </span>
                <span
                  data-eyebrow
                  className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-700"
                >
                  {t('communities.eyebrow', { defaultValue: 'Browse by community' })}
                </span>
                <div
                  className="inline-flex items-center gap-1 text-gold-500/80"
                  aria-hidden="true"
                >
                  <span className="h-px w-8 sm:w-12 bg-gold-500/60" />
                  <span className="text-[10px]">◆</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950">
                {t('communities.title', { defaultValue: 'Find Matches by Community' })}
              </h2>

              {/* Subtitle */}
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-ink-600 font-medium">
                {t('communities.subtitle', {
                  defaultValue:
                    'Explore verified matrimonial profiles across Agarwal, Jain, Khandelwal, and Maheshwari families.',
                })}
              </p>
            </div>

            {/* Quick CTA */}
            <div className="shrink-0">
              <Link
                to={registerHref}
                title={t('communities.register', { defaultValue: 'Register Free Bio-Data' })}
                className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-maroon-700 transition hover:text-maroon-800"
              >
                <span>
                  {t('communities.register', { defaultValue: 'Register Free Bio-Data' })}
                </span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ============================================================== */}
        {/* 4 Community Pills: Exactly Matching Design Mockup              */}
        {/* ============================================================== */}
        <Reveal variant="up" delay={0.1}>
          <div
            role="group"
            aria-label="Community selection pills"
            className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3 sm:gap-3.5"
          >
            {communities.map((comm) => {
              const isSelected = selectedCommunity === comm.id

              return (
                <button
                  key={comm.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggle(comm.id)}
                  className={cn(
                    'group inline-flex items-center gap-2 rounded-full px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold transition-all duration-300 outline-none cursor-pointer select-none',
                    'focus-visible:ring-2 focus-visible:ring-gold-500/60',
                    isSelected
                      ? 'bg-navy-950 text-white border border-navy-950 shadow-md ring-2 ring-gold-500/50 -translate-y-0.5'
                      : 'border border-[#E8DFC8] bg-[#FAF6EE] text-navy-950 hover:border-gold-500 hover:bg-gold-50/70 hover:shadow-xs hover:-translate-y-0.5 active:scale-95',
                  )}
                >
                  <span
                    className={cn(
                      'text-base sm:text-lg font-bold transition-colors leading-none',
                      isSelected ? 'text-gold-400' : 'text-navy-950 group-hover:text-gold-700',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span>{comm.name}</span>
                </button>
              )
            })}

            {selectedCommunity && (
              <button
                type="button"
                onClick={() => setSelectedCommunity(null)}
                className="text-xs font-semibold text-ink-600 underline hover:text-navy-950 transition cursor-pointer ml-1"
              >
                {t('communities.clearFilter', { defaultValue: 'Show All' })}
              </button>
            )}
          </div>
        </Reveal>

        {/* ============================================================== */}
        {/* Community Cards Grid: Visual Representation of the 4          */}
        {/* ============================================================== */}
        <Reveal variant="up" delay={0.18}>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {communities.map((comm) => {
              const isSelected = selectedCommunity === comm.id
              const isFilteredOut = selectedCommunity !== null && !isSelected

              return (
                <div
                  key={comm.id}
                  className={cn(
                    'relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-300',
                    isSelected
                      ? 'border-gold-500 ring-2 ring-gold-500/40 shadow-xl -translate-y-1 bg-gradient-to-b from-gold-50/40 via-white to-white'
                      : 'border-gold-500/25 hover:border-gold-500/60 hover:shadow-lg hover:-translate-y-1',
                    isFilteredOut ? 'opacity-40 grayscale-[25%]' : 'opacity-100',
                  )}
                >
                  {/* Top: Header & Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-bold tracking-wide text-gold-700 border border-gold-500/20">
                        {comm.count}
                      </span>
                      <span className="text-gold-600 font-display text-sm font-bold">
                        ✦
                      </span>
                    </div>

                    <h3 className="font-display mt-3 text-xl sm:text-2xl font-bold text-navy-950">
                      {comm.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-gold-700">
                      {comm.tag}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-ink-600 font-medium">
                      {comm.heritage}
                    </p>

                    {/* Key Gotras / Subgroups */}
                    <div className="mt-3 rounded-xl bg-cream-50/80 border border-gold-500/15 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-navy-800">
                        {t('communities.gotrasLabel', { defaultValue: 'Key Gotras / Traditions' })}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-700 leading-snug">
                        {comm.gotras}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Direct Action */}
                  <div className="mt-5 pt-3 border-t border-cream-200">
                    <Link
                      to={registerHref}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200',
                        isSelected
                          ? 'bg-navy-950 text-white shadow-xs hover:bg-navy-900'
                          : 'bg-gold-50 text-navy-950 hover:bg-gold-100 hover:text-navy-900',
                      )}
                    >
                      <span>
                        {t('communities.findMatches', {
                          defaultValue: `Find ${comm.name} Matches`,
                          name: comm.name,
                        })}
                      </span>
                      <span aria-hidden="true" className="text-gold-600 font-bold">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
