import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPANY } from '../../../constants/company'
import Reveal from '../../../components/motion/Reveal'
import { lockPageScroll, unlockPageScroll } from '../../../lib/scroll'

export default function AboutSection() {
  const { t } = useTranslation()
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  // Modal open → stop Lenis + lock background scroll (restored on close).
  useEffect(() => {
    if (!isVideoOpen) return
    lockPageScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unlockPageScroll()
    }
  }, [isVideoOpen])

  return (
    <section id="about" className="relative isolate overflow-hidden bg-cream-50 pt-4 sm:pt-6 lg:pt-8 pb-16 sm:pb-20 lg:pb-24">
      {/* ============================================================== */}
      {/* Decorative Floral Vines: small, behind content, edge-anchored   */}
      {/* ============================================================== */}
      <img
        src="/images/home/flower3_image.webp"
        alt=""
        className="pointer-events-none absolute left-0 bottom-0 z-0 w-24 sm:w-28 md:w-36 lg:w-44 xl:w-52 max-w-[16vw] h-auto object-contain object-left-bottom select-none opacity-95"
        loading="lazy"
        aria-hidden="true"
      />
      <img
        src="/images/home/flower4_image.webp"
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 z-0 w-24 sm:w-28 md:w-36 lg:w-44 xl:w-52 max-w-[16vw] h-auto object-contain object-right-bottom select-none opacity-95"
        loading="lazy"
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* Main Content Container: Clean, fresh layout and balanced gaps  */}
      {/* ============================================================== */}
      <div className="section-pad relative z-10">
        <div className="grid items-center gap-8 sm:gap-10 mx-4 sm:mx-8 lg:mx-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* ========================================================== */}
          {/* Left Column: Ornate Mandap Visual with Play & Community   */}
          {/* ========================================================== */}
          <Reveal variant="scale" className="relative lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none">
              {/* Ornate Mandap Arch PNG */}
              <div className="relative overflow-visible">
                <img
                  src="/images/home/Mandap_image.webp"
                  alt={`${COMPANY.name} Wedding Mandap`}
                  className="w-full h-auto object-contain drop-shadow-sm select-none transition-transform duration-500 hover:scale-[1.01]"
                  loading="lazy"
                />

                {/* Central Circular Play Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  aria-label="Play introduction video"
                  className="group absolute inset-0 m-auto flex h-14 w-14 sm:h-16 sm:w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-white text-gold-600 shadow-xl backdrop-blur-xs transition-all duration-300 hover:scale-110 hover:bg-gold-50 active:scale-95 z-20 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-1 h-7 w-7 sm:h-8 sm:w-8 fill-current text-gold-500 transition-transform group-hover:scale-105"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              {/* Floating Community Member Counter Pill */}
              <div className="absolute -bottom-3 left-2 sm:left-4 md:left-6 z-20 flex items-center gap-3 rounded-full border border-gold-500/35 bg-white/95 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md backdrop-blur-xs">
                {/* 4 Overlapping Avatar Bubbles */}
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    src="/images/home/Radiant Indian Bride in Floral Glow.webp"
                    alt="Member"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover object-top"
                  />
                  <img
                    src="/images/home/Radiant Indian Groom in a Golden Wedding Setting.webp"
                    alt="Member"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover object-top"
                  />
                  <img
                    src="/images/home/Radiant Indian Wedding Portrait.webp"
                    alt="Member"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/images/home/Romantic Indian Wedding Portrait.webp"
                    alt="Member"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover"
                  />
                </div>

                <div className="leading-tight">
                  <p className="text-[10px] sm:text-[11px] font-semibold text-sky-700">
                    {t('about.community')}
                  </p>
                  <p className="font-display text-xs sm:text-sm font-bold text-navy-950">
                    {COMPANY.community.membersCount} {t('about.members').replace('50K+ ', '')}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ========================================================== */}
          {/* Right Column: Text Content Exactly Matching Design         */}
          {/* ========================================================== */}
          <Reveal variant="up" delay={0.12} className="lg:col-span-6">
            {/* Eyebrow with gold wheel icon and ornate divider */}
            <div className="inline-flex items-center gap-2">
              <span className="text-gold-600 text-sm font-bold" aria-hidden="true">
                ☸
              </span>
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-600">
                {t('about.eyebrow')}
              </span>
              <div className="inline-flex items-center gap-1 text-gold-500/80" aria-hidden="true">
                <span className="h-px w-8 sm:w-12 bg-gold-500/60" />
                <span className="text-[10px]">◆</span>
              </div>
            </div>

            {/* Main Section Heading */}
            <h2 className="font-display mt-3.5 sm:mt-4 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.14]">
              <span className="block text-navy-900">{t('about.titleA')}</span>
              <span className="block text-gold-600 mt-1">{t('about.titleB')}</span>
            </h2>

            {/* Body Copy */}
            <p className="mt-4 sm:mt-5 max-w-xl text-xs sm:text-sm lg:text-[15px] leading-relaxed text-ink-600 font-medium">
              {t('about.body')}
            </p>

            {/* CTA Button */}
            <div className="mt-7 sm:mt-8 flex items-center gap-4">
              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-navy-900 px-7 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-navy-800 hover:gap-3 active:scale-[0.98]"
              >
                <span>{t('about.cta')}</span>
                <span className="text-gold-400" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Video Modal                                                    */}
      {/* ============================================================== */}
      {isVideoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40 cursor-pointer"
              aria-label="Close video"
            >
              ✕
            </button>
            <div className="relative aspect-video w-full flex items-center justify-center text-white/70">
              <div className="text-center p-6">
                <p className="font-display text-xl sm:text-2xl font-bold text-gold-400">
                  {COMPANY.name}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  {t('about.body')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
