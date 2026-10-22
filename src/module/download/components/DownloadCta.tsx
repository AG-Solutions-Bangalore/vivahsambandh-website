import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import StoreBadge from '../../../components/StoreBadge'
import { img, imgSrcSet } from '../../../lib/image'

export default function DownloadCta() {
  const { t } = useTranslation()

  return (
    <section className="relative isolate overflow-hidden bg-cream-50 py-16 sm:py-20">
      {/* Faint temple backdrop, same closing-band treatment as the other pages */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none"
      >
        <img
          src={img('/images/common/Temple_Skyline_Divider_footer_image.webp')}
          srcSet={imgSrcSet(
            '/images/common/Temple_Skyline_Divider_footer_image-1024.webp 1024w, /images/common/Temple_Skyline_Divider_footer_image.webp 2171w',
          )}
          sizes="100vw"
          width={2171}
          height={724}
          alt="Temple skyline divider"
          title="Temple skyline divider"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-50/70 to-cream-50" />
      </div>

      {/* Edge florals */}
      <img
        src={img('/images/home/flower1_image-320.webp')}
        width={320}
        height={480}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute left-0 bottom-0 z-[1] w-20 sm:w-28 lg:w-36 h-auto max-w-[16vw] select-none"
      />
      <img
        src={img('/images/home/flower2_image-320.webp')}
        width={320}
        height={480}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute right-0 bottom-0 z-[1] w-20 sm:w-28 lg:w-36 h-auto max-w-[16vw] select-none"
      />

      <div className="section-pad relative z-10 text-center">
        <Reveal variant="fade" className="mx-auto max-w-2xl">
          <p
            data-eyebrow
            className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-gold-600"
          >
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />✦{' '}
            {t('downloadPage.ctaEyebrow')} ✦
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
          </p>

          <h2 className="font-display mt-3 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
            {t('downloadPage.ctaTitle')}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-ink-600 sm:text-sm">
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
