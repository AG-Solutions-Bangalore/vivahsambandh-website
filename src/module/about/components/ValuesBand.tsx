import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'
import type { AboutValue } from '../types'
import { img } from '../../../lib/image'

function ValueIcon({ index }: { index: number }) {
  const cls = 'h-6 w-6'
  if (index === 0) {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 19c0-2.6 2.4-4.2 5.5-4.2s5.5 1.6 5.5 4.2" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M15.5 14.6c2.9.2 5 1.7 5 4" strokeLinecap="round" />
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" strokeLinejoin="round" />
        <path d="M9.3 12l2 2 3.6-3.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="10" width="14" height="9" rx="2" />
      <path d="M8 10V7.5a4 4 0 018 0V10" strokeLinecap="round" />
      <circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Values band — navy section from the design:
 * "Tradition at Heart. Trust in Every Connection." + 3 glass cards.
 */
export default function ValuesBand() {
  const { t } = useTranslation()
  const values = (t('aboutPage.values', { returnObjects: true }) as AboutValue[]) || []

  return (
    <section className="relative overflow-hidden bg-[#071833] py-14 sm:py-16 lg:py-20">
      {/* Filigree sides — desktop only. On phones the full-height sides
          overwhelm the copy, so mobile gets a soft gold glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 z-0 h-64 w-72 -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl select-none lg:hidden"
      />
      <img
        src={img("/images/home/Ornate_Corner_Filigree_image.webp")}
        width={948}
        height={1659}
        alt="Ornate golden filigree decoration"
        title="Ornate golden filigree decoration"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 -left-4 z-0 h-full w-auto max-w-none select-none scale-105 opacity-60 hidden lg:block"
      />
      <img
        src={img("/images/home/Ornate_Corner_Filigree_image.webp")}
        width={948}
        height={1659}
        alt="Ornate golden filigree decoration"
        title="Ornate golden filigree decoration"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 -right-4 z-0 h-full w-auto max-w-none select-none rotate-180 scale-105 opacity-60 hidden lg:block"
      />


      <div className="section-pad relative z-10 !max-w-6xl text-center">
        <Reveal variant="up">
          <p data-eyebrow className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
            ✦ {t('aboutPage.valuesEyebrow')} ✦
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
          </p>
          <h2 className="font-display mx-auto mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.15]">
            <span className="block text-white">{t('aboutPage.valuesTitleA')}</span>
            <span className="mt-1 block text-gold-400">{t('aboutPage.valuesTitleB')}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-white/75 font-medium">
            {t('aboutPage.valuesSubtitle')}
          </p>
        </Reveal>

        <RevealGroup className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 lg:grid-cols-3" stagger={0.1}>
          {values.map((v, i) => (
            <article
              key={v.title}
              data-reveal-item
              className="rounded-2xl border border-gold-500/30 bg-white/[0.06] px-6 py-7 text-center shadow-sm backdrop-blur-[2px] transition-colors duration-300 hover:border-gold-400/60 hover:bg-white/[0.09]"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/15 text-gold-300">
                <ValueIcon index={i} />
              </span>
              <h3 className="font-display mt-4 text-base sm:text-lg font-bold text-white">{v.title}</h3>
              <p className="mx-auto mt-2.5 max-w-xs text-xs sm:text-[13px] leading-relaxed text-white/70">{v.desc}</p>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
