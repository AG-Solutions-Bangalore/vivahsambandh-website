import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { useCompanyQuery } from '../../company'

/**
 * "Visit Our Office" card with a live map pinned to the company address
 * from the `getCompany` API (cached — shared with Footer/InfoCards).
 */
export default function OfficeVisit() {
  const { t } = useTranslation()

  const { data: companyRes } = useCompanyQuery()
  const liveAddress = companyRes?.data?.company_address?.trim()
  const rawAddress = liveAddress || t('contactPage.addressValue')
  // `#` (house-number marker, e.g. "#8, ...") breaks Google geocoding and
  // pins the map at the wrong place — strip it for map queries only.
  // The displayed address text stays untouched.
  const mapQuery = rawAddress.replace(/^#\s*/, '').trim() || rawAddress
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

  return (
    <Reveal variant="up" delay={0.08} className="h-full">
      <article className="card-ring flex h-full flex-col overflow-hidden p-6 sm:p-7">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-900">
          {t('contactPage.officeTitle')}
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-600">
          {t('contactPage.officeBody')}
        </p>

        {/* Live Google Map (keyless embed) — grows to match the form card */}
        <div className="relative mt-4 min-h-72 flex-1 overflow-hidden rounded-xl border border-gold-500/25 sm:min-h-80">
          <iframe
            title={`${t('contactPage.officePin')}, ${t('contactPage.officePinSub')}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        <a
          href={directionsHref}
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
