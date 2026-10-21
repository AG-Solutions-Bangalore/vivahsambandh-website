/**
 * @file src/module/registration/components/registration-form/FormWizardNav.tsx
 * Navigation bar for the step-by-step registration form: Back on the left,
 * Continue / Submit on the right, plus the OTP notice and status hints.
 */

import { Button } from '@/components/ui/button'
import { CheckCircle2, Send } from 'lucide-react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'

interface FormWizardNavProps {
  /** Index of the active step (0-based). */
  step: number
  /** True on the last step — swaps Continue for the submit action. */
  isLastStep: boolean
  onBack: () => void
  onNext: () => void
  isSubmitting: boolean
  isFormFullyFilled: boolean
  isMobileVerifiedNow: boolean
  isMobileComplete: boolean
  mobile: string
}

export default function FormWizardNav({
  step,
  isLastStep,
  onBack,
  onNext,
  isSubmitting,
  isFormFullyFilled,
  isMobileVerifiedNow,
  isMobileComplete,
  mobile,
}: FormWizardNavProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 rounded-[1.5rem] border border-cream-300 bg-white p-5 sm:p-6">
      <div className="flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Back / hint */}
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-12 w-full rounded-full border-cream-300 bg-white font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50 sm:w-auto"
          >
            {t('registrationPage.form.back', 'Back')}
          </Button>
        ) : (
          <p className="text-center text-xs leading-relaxed text-ink-500 sm:max-w-xs sm:text-left">
            {t(
              'registrationPage.form.stepHint',
              'Fill in the details on this page — you can move between steps at any time.',
            )}
          </p>
        )}

        {/* Continue / Submit */}
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          {isLastStep && !isMobileVerifiedNow && isMobileComplete && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-ink-600 sm:justify-end sm:text-right">
              <span className="size-1.5 rounded-full bg-gold-600" />
              <span>
                {t('registrationPage.form.otpSendNotice', {
                  defaultValue: `सत्यापन के लिए +91 ${mobile} पर ओटीपी भेजा जाएगा`,
                  mobile,
                })}
              </span>
            </p>
          )}

          {isLastStep ? (
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'h-12 w-full rounded-full px-8 text-sm font-bold transition-colors sm:w-auto',
                isSubmitting
                  ? '!bg-navy-900/70 !text-white cursor-not-allowed'
                  : isMobileVerifiedNow
                  ? '!bg-navy-900 !text-white hover:!bg-navy-800'
                  : '!bg-gold-600 !text-white hover:!bg-gold-500 ring-2 ring-gold-400/50',
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('registrationPage.form.submittingRegistration', 'Submitting Registration...')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send aria-hidden />
                  {isMobileVerifiedNow
                    ? t('registrationPage.form.submitRegistration', 'Submit Registration')
                    : t('registrationPage.form.verifyAndSubmit', 'Verify via OTP & Submit')}
                </span>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              className="h-12 w-full rounded-full bg-navy-900 px-8 text-sm font-bold text-white transition-colors hover:bg-navy-800 sm:w-auto"
            >
              {t('registrationPage.form.continue', 'Continue')}
            </Button>
          )}

          {isLastStep && (
            <span
              className={cn(
                'text-center text-[11px] font-medium sm:text-right',
                isMobileVerifiedNow ? 'text-emerald-700' : 'text-ink-500',
              )}
            >
              {isMobileVerifiedNow ? (
                <span className="flex items-center justify-center gap-1 sm:justify-end">
                  <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                  <span>{t('registrationPage.form.mobileVerifiedReady', 'Mobile verified. Ready to submit!')}</span>
                </span>
              ) : isFormFullyFilled ? (
                t(
                  'registrationPage.form.completeAllRequired',
                  'Complete all required fields above to proceed with submission',
                )
              ) : (
                t(
                  'registrationPage.form.stepsIncompleteHint',
                  'Finish every step to submit — we will take you to whatever is still missing.',
                )
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
