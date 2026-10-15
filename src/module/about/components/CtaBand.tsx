import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { homePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'
import Reveal from '../../../components/motion/Reveal'

/**
 * Closing CTA — "Your Story Begins Here" over a faint temple backdrop,
 * navy solid + gold outline pills (design's pre-footer block).
 */
export default function CtaBand() {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const home = homePath(lang)

  return (
    <section className="relative isolate overflow-hidden bg-cream-50 py-14 sm:py-18 lg:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 select-none">
        <img
          src="/images/common/Temple_Skyline_Divider_footer_image.webp"
          srcSet="/images/common/Temple_Skyline_Divider_footer_image-1024.webp 1024w, /images/common/Temple_Skyline_Divider_footer_image.webp 2171w"
          sizes="100vw"
          width={2171}
          height={724}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 via-cream-50/70 to-cream-50" />
      </div>
      {/* Edge florals */}
      <img
        src="/images/home/flower1_image-320.webp"
        width={320}
        height={480}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute left-0 bottom-0 z-[1] w-20 sm:w-28 lg:w-36 h-auto max-w-[16vw] select-none"
      />
      <img
        src="/images/home/flower2_image-320.webp"
        width={320}
        height={480}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute right-0 bottom-0 z-[1] w-20 sm:w-28 lg:w-36 h-auto max-w-[16vw] select-none"
      />

      <div className="section-pad relative z-10 mx-auto max-w-3xl text-center">
        <Reveal variant="up">
          <p data-eyebrow className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-gold-600">
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
            ✦ {t('aboutPage.ctaEyebrow')} ✦
            <span aria-hidden="true" className="h-px w-8 bg-gold-500/60" />
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.12]">
            <span className="text-navy-900">{t('aboutPage.ctaTitleA')} </span>
            <span className="text-gold-600">{t('aboutPage.ctaTitleB')}</span>
          </h2>
          <p className="mx-auto mt-3.5 max-w-xl text-xs sm:text-sm lg:text-[15px] font-medium leading-relaxed text-ink-600">
            {t('aboutPage.ctaBody')}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link to={`${home}#register`} title={t('aboutPage.ctaPrimary')} className="btn-primary">
              <span>{t('aboutPage.ctaPrimary')}</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link to={`${home}#search`} title={t('aboutPage.ctaSecondary')} className="btn-gold">
              <span>{t('aboutPage.ctaSecondary')}</span>
              <span aria-hidden="true" className="text-gold-600">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
