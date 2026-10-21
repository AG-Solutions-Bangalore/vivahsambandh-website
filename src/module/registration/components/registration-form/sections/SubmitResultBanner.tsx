/**
 * @file src/module/registration/components/registration-form/sections/SubmitResultBanner.tsx
 * Success / error notification shown above the form after submission attempts.
 */

import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useRegistrationForm } from '../context'

export default function SubmitResultBanner() {
  const { t } = useTranslation()
  const { submitResult } = useRegistrationForm()

  if (!submitResult) return null

  const isSuccess = submitResult.type === 'success'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-5 shadow-lift ${
        isSuccess
          ? 'border-emerald-500/30 bg-emerald-50/90 text-emerald-950'
          : 'border-maroon-500/30 bg-maroon-50/90 text-maroon-950'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid size-9 shrink-0 place-items-center rounded-full ${
          isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-maroon-100 text-maroon-700'
        }`}
      >
        {isSuccess ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
      </span>
      <div className="min-w-0 pt-0.5">
        <h4 className="font-display text-base font-bold">
          {isSuccess
            ? t('registrationPage.form.registrationCompleted', 'Registration Completed')
            : t('registrationPage.form.submissionNote', 'Submission Note')}
        </h4>
        <p className="mt-1 text-sm leading-relaxed">{submitResult.message}</p>
      </div>
    </div>
  )
}
