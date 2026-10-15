import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'

/**
 * "Visit Our Office" card with a stylized map placeholder
 * (streets motif + location pin card, per design).
 */
export default function OfficeVisit() {
  const { t } = useTranslation()

  return (
    <Reveal variant="up" delay={0.08}>
      <article className="card-ring overflow-hidden p-6 sm:p-7">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
          {t('contactPage.officeTitle')}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-600">
          {t('contactPage.officeBody')}
        </p>

        {/* Live Google Map (keyless embed) */}
        <div className="relative mt-4 h-72 sm:h-80 overflow-hidden rounded-xl border border-gold-500/25">
          <iframe
            title={`${t('contactPage.officePin')}, ${t('contactPage.officePinSub')}`}
            src="https://www.google.com/maps?q=Bengaluru,Karnataka,India&z=13&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Bengaluru,Karnataka,India"
          target="_blank"
          rel="noopener noreferrer"
          title={t('contactPage.directions')}
          className="btn-gold mt-4 w-full !py-2.5 text-xs sm:text-sm"
        >
          <span>{t('contactPage.directions')}</span>
          <span aria-hidden="true" className="text-gold-600">↗</span>
        </a>
      </article>
    </Reveal>
  )
}
