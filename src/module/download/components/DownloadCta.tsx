import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import StoreBadge from '../../../components/StoreBadge'

export default function DownloadCta() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-20 text-white">
      {/* Decorative Gold Radial Glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.15),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="section-pad relative z-10 text-center">
        <Reveal variant="fade" className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/15 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase text-gold-300">
            <span>✦</span>
            <span>{t('downloadPage.ctaEyebrow')}</span>
          </div>

          <h2 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t('downloadPage.ctaTitle')}
          </h2>

          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-white/80 max-w-lg mx-auto">
            {t('downloadPage.ctaSubtitle')}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <StoreBadge store="play" />
            <StoreBadge store="apple" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
