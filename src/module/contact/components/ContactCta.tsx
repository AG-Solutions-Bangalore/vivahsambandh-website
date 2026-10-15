import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Reveal from '../../../components/motion/Reveal'
import { homePath } from '../../../constants/navigation'
import type { AppLang } from '../../../i18n'

/**
 * Closing band — mandap visual, "We're Here for You", profile/search
 * CTAs (design's pre-footer block).
 */
export default function ContactCta() {
  const { t, i18n } = useTranslation()
  const lang: AppLang = i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'
  const home = homePath(lang)

  return (
    <section className="relative isolate overflow-hidden bg-cream-50 py-10 sm:py-12">
      <div aria-hidden="true" className="bg-jaali pointer-events-none absolute inset-0 opacity-60" />
      <img
        src="/images/home/flower1_image-320.webp"
        width={320}
        height={480}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute left-0 bottom-0 z-[1] w-20 sm:w-28 h-auto max-w-[16vw] select-none"
      />
      <img
        src="/images/home/flower2_image-320.webp"
        width={320}
        height={480}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute right-0 bottom-0 z-[1] w-20 sm:w-28 h-auto max-w-[16vw] select-none"
      />

      <div className="section-pad relative z-10">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Mandap: bottom-anchored + enlarged on desktop so it sits
              grounded at the band's base instead of floating mid-air. */}
          <Reveal variant="scale" className="lg:col-span-5 self-end">
            <img
              src="/images/home/Mandap_image.webp"
              srcSet="/images/home/Mandap_image-800.webp 800w, /images/home/Mandap_image.webp 1723w"
              sizes="(max-width: 1024px) 92vw, 40vw"
              width={1723}
              height={913}
              alt={t('contactPage.ctaTitleA')}
              title={t('contactPage.ctaTitleA')}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full max-w-xl object-contain drop-shadow-sm lg:origin-bottom lg:scale-125 lg:-mb-12"
            />
          </Reveal>

          <Reveal variant="up" className="text-center lg:col-span-4 lg:text-left">
            <p data-eyebrow className="eyebrow justify-center lg:justify-start">
              <span aria-hidden="true">❖</span>
              {t('contactPage.ctaEyebrow')}
              <span aria-hidden="true" className="h-px w-10 bg-gold-500/60" />
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl font-bold leading-[1.14]">
              <span className="text-navy-900">{t('contactPage.ctaTitleA')} </span>
              <span className="text-gold-600">{t('contactPage.ctaTitleB')}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium lg:mx-0">
              {t('contactPage.ctaBody')}
            </p>
          </Reveal>

          <Reveal variant="up" delay={0.1} className="lg:col-span-3">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:flex-col">
              <Link to={`${home}#register`} title={t('contactPage.ctaPrimary')} className="btn-primary w-full sm:w-auto">
                <span>{t('contactPage.ctaPrimary')}</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to={`${home}#search`} title={t('contactPage.ctaSecondary')} className="btn-gold w-full sm:w-auto">
                <span>{t('contactPage.ctaSecondary')}</span>
                <span aria-hidden="true" className="text-gold-600">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
