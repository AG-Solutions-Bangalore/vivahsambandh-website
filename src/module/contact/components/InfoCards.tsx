import { useTranslation } from 'react-i18next'
import { COMPANY } from '../../../constants/company'
import { RevealGroup } from '../../../components/motion/Reveal'
import { useCompanyQuery } from '../../company'

function CardIcon({ index }: { index: number }) {
  const cls = 'h-5 w-5'
  switch (index % 4) {
    case 0:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" strokeLinejoin="round" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

/**
 * Four contact-channel cards (Call / Email / Address / Hours) —
 * cream cards, gold icon medallions, per design.
 */
export default function InfoCards() {
  const { t } = useTranslation()

  // Live company profile (cached by query key — shared with Footer,
  // so this adds no extra network request). Address falls back to
  // static copy when the API is unreachable.
  const { data: companyRes } = useCompanyQuery()
  const liveAddress = companyRes?.data?.company_address?.trim()

  const cards = [
    {
      title: t('contactPage.callTitle'),
      value: COMPANY.supportPhoneDisplay,
      href: COMPANY.supportPhoneLink,
      note: t('contactPage.callNote'),
    },
    {
      title: t('contactPage.emailTitle'),
      value: COMPANY.supportEmail,
      href: `mailto:${COMPANY.supportEmail}`,
      note: t('contactPage.emailNote'),
    },
    {
      title: t('contactPage.addressTitle'),
      value: liveAddress || t('contactPage.addressValue'),
      note: t('contactPage.addressNote'),
    },
    {
      title: t('contactPage.hoursTitle'),
      value: t('contactPage.hoursValue'),
      note: t('contactPage.hoursNote'),
    },
  ]

  return (
    <section aria-label="Contact channels" className="relative bg-cream-50 pb-8 sm:pb-10">
      <div className="section-pad">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5" stagger={0.08}>
          {cards.map((card, i) => (
            <article
              key={card.title}
              data-reveal-item
              className="card-ring flex items-start gap-3.5 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-white shadow-gold">
                <CardIcon index={i} />
              </span>
              <span className="min-w-0">
                <span className="font-display block text-[15px] sm:text-base font-bold text-navy-900">
                  {card.title}
                </span>
                {card.href ? (
                  <a
                    href={card.href}
                    title={card.value}
                    className="mt-0.5 block truncate text-xs sm:text-[13px] font-bold text-ink-600 transition hover:text-maroon-600"
                  >
                    {card.value}
                  </a>
                ) : (
                  <span className="mt-0.5 block text-xs sm:text-[13px] font-bold text-ink-600">
                    {card.value}
                  </span>
                )}
                <span className="mt-0.5 block text-[11px] sm:text-xs text-ink-500">{card.note}</span>
              </span>
            </article>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
