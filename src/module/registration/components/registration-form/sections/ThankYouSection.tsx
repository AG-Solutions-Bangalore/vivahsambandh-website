/**
 * @file src/module/registration/components/registration-form/sections/ThankYouSection.tsx
 * Final step — confirmation shown after a successful registration.
 */

import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

export default function ThankYouSection() {
  const { t } = useTranslation()
  const { resetRegistration } = useRegistrationForm()

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.thankYou}
      title={t('registrationPage.form.thankYouTitle', 'Thank You!')}
      subtitle={t(
        'registrationPage.form.thankYouBody',
        'Your bio-data registration has been submitted successfully. Our committee will review your profile within 24 to 48 hours.',
      )}
    >
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-6 text-center sm:p-8">
        <span
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          aria-hidden="true"
        >
          <CheckCircle2 className="size-6" />
        </span>
        <button
          type="button"
          onClick={resetRegistration}
          className="mt-5 cursor-pointer rounded-full bg-navy-900 px-7 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 sm:text-sm"
        >
          {t('registrationPage.form.submitOtherResponse', 'Submit other response')}
        </button>
      </div>
    </FormSection>
  )
}
