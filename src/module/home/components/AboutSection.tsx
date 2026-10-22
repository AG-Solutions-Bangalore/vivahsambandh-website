import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { COMPANY } from '../../../constants/company'
import { pagePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'
import Reveal from '../../../components/motion/Reveal'
import { img, imgSrcSet } from '../../../lib/image'

export default function AboutSection() {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const aboutHref = pagePath('/about', lang)

  return (
    <section id="about" className="relative isolate overflow-x-clip overflow-y-visible bg-cream-50 pt-4 sm:pt-6 lg:pt-8 pb-12 sm:pb-16 lg:pb-20">
      {/* Main Content Container: Clean, fresh layout and balanced gaps  */}

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
                  src={img("/images/home/Mandap_image.webp")}
                  srcSet={imgSrcSet("/images/home/Mandap_image-800.webp 800w, /images/home/Mandap_image.webp 1723w")}
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  width={1723}
                  height={913}
                  alt={`${COMPANY.name} Wedding Mandap`}
                  title={`${COMPANY.name} Wedding Mandap`}
                  className="w-full h-auto object-contain drop-shadow-sm select-none transition-transform duration-500 hover:scale-[1.01]"
                  loading="lazy"
                />

              </div>

              {/* Floating Community Member Counter Pill */}
              <div className="absolute -bottom-3 left-2 sm:left-4 md:left-6 z-20 flex items-center gap-3 rounded-full border border-gold-500/35 bg-white/95 px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md backdrop-blur-xs">
                {/* 4 Overlapping Avatar Bubbles */}
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    src={img("/images/home/radiant-indian-bride-in-floral-glow-128.webp")}
                    width={128}
                    height={154}
                    alt="Member"
                    title="Member"
                    loading="lazy"
                    decoding="async"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover object-top"
                  />
                  <img
                    src={img("/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp")}
                    width={128}
                    height={128}
                    alt="Member"
                    title="Member"
                    loading="lazy"
                    decoding="async"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover object-top"
                  />
                  <img
                    src={img("/images/home/radiant-indian-wedding-portrait-128.webp")}
                    width={128}
                    height={70}
                    alt="Member"
                    title="Member"
                    loading="lazy"
                    decoding="async"
                    className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src={img("/images/home/romantic-indian-wedding-portrait-128.webp")}
                    width={128}
                    height={74}
                    alt="Member"
                    title="Member"
                    loading="lazy"
                    decoding="async"
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
              <span data-eyebrow className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-600">
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

            {/* CTA Button — centered on phones, left-aligned from sm up */}
            <div className="mt-7 sm:mt-8 flex items-center justify-center gap-4 sm:justify-start">
              <Link
                to={aboutHref}
                title={t('about.cta')}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-navy-900 px-7 py-3 sm:px-8 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-navy-800 hover:gap-3 active:scale-[0.98]"
              >
                <span>{t('about.cta')}</span>
                <span className="text-gold-400" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

    </section>
  )
}
