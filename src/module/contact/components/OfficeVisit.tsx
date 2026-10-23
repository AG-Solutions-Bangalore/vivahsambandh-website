import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { useCompanyQuery } from '../../company'
import { getCompanyAddress } from '../../../constants/company'

/**
 * "Visit Our Office" card with a live map pinned to the company address
 * from the `getCompany` API (cached — shared with Footer/InfoCards).
 */
export default function OfficeVisit() {
  const { t } = useTranslation()

  const { data: companyRes } = useCompanyQuery()
  const liveAddress = companyRes?.data?.company_address?.trim()
  // Always geocode the English address — the translated fallback (e.g. just
  // "Bengaluru, Karnataka, India") is too vague to pin the office.
  const rawAddress = liveAddress || getCompanyAddress('en')
  // `#` (house-number marker, e.g. "#8, ...") and floor designators
  // ("1st Floor") make Google treat the query as a category search and show
  // nearby POIs instead of the building. Strip both for map queries only.
  const mapQuery =
    rawAddress
      .replace(/^#\s*/, '')
      .replace(
        /,\s*(?:\d(?:st|nd|rd|th)|first|second|third|fourth|fifth|ground)\s+floor\s*,/gi,
        ',',
      )
      .replace(/\s{2,}/g, ' ')
      .trim() || rawAddress
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`

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
      </article>
    </Reveal>
  )
}
