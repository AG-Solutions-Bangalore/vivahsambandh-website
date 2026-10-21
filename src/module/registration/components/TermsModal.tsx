/**
 * @file src/module/registration/components/TermsModal.tsx
 * Modal displaying VivahSambandh & ASVT terms and conditions.
 */

import { useTranslation } from 'react-i18next'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

const termsList = [
  'After submission, please wait while a committee member reviews your details and may contact you.',
  'In case you have entered incorrect or invalid information, photographs or bio-data, your submission will be deleted without attempting to contact you first.',
  'As has been communicated verbally to you, this service is offered on an honorary, volunteer and non-commercial basis to you.',
  'The data you provide is to help you shortlist prospective brides or grooms and their families.',
  'You understand that you take full responsibility for any act or forbearance that results from the data (or lack thereof) you provide (or which we provide/forward to you).',
  'The trust and all members of this volunteer committee are strictly against dowry and we neither endorse, recommend nor support this illegal practice. You take full responsibility to comply with dowry and all other applicable laws.',
  'If you have any queries or require assistance during the matchmaking process of your candidate, please feel free to contact any committee member by telephone or in person.',
  'It takes 24 to 48 hours to validate your profile, after which you will be able to access all verified matchmaking services.',
  'You are responsible for maintaining the confidentiality of any credentials or data provided during registration, and are solely responsible for activities under your profile.',
  'VivahSambandh / ASVT expressly disclaims any liability or responsibility whatsoever arising as a result of any listing or content posted on the platform.',
  'You agree and authorise the committee to share your verified bio-data with prospective matching families in good faith.',
]

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { t } = useTranslation()
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-xs"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-gold-500/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-cream-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-100 text-gold-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="text-base font-bold text-navy-900">
              {t('registrationPage.form.termsModalTitle', 'Terms & Conditions')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ink-500 hover:bg-cream-200 hover:text-navy-900 transition"
            aria-label={t('registrationPage.form.termsModalClose', 'Close')}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-ink-700 space-y-4">
          <p className="font-medium text-navy-900">
            {t('registrationPage.form.termsModalIntro', 'Please review the guidelines and policies governing the registration and matchmaking assistance:')}
          </p>
          <ul className="space-y-3 pl-5 list-disc text-xs sm:text-sm leading-relaxed">
            {termsList.map((term, index) => (
              <li key={index} className="text-ink-600">
                {term}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-cream-200 bg-cream-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary !px-6 !py-2 text-xs"
          >
            {t('registrationPage.form.termsModalAccept', 'I Understand & Accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
