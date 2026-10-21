/**
 * @file src/module/registration/components/registration-form/sections/TermsSubmitSection.tsx
 * Part 5 — Terms agreement and submission actions.
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'

export default function TermsSubmitSection() {
  const { t } = useTranslation()
  const {
    baseId,
    form,
    fieldErrors,
    setForm,
    clearFieldError,
    handleValidateClick,
    isFormFullyFilled,
    isSubmitting,
    isMobileVerifiedNow,
    isMobileComplete,
    setTermsOpen,
  } = useRegistrationForm()

  return (
    <div
      id={`${baseId}-agree-terms-group`}
      className={`rounded-[1.5rem] border p-6 sm:p-8 shadow-card transition ${
        fieldErrors.agree_terms
          ? 'border-maroon-500 bg-maroon-50/20'
          : 'border-gold-500/30 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`${baseId}-agree-terms`}
          checked={form.agree_terms}
          onCheckedChange={(checked) => {
            setForm((prev) => ({ ...prev, agree_terms: checked === true }))
            clearFieldError('agree_terms')
          }}
          error={Boolean(fieldErrors.agree_terms)}
          aria-label={t('registrationPage.form.termsAndConditions', 'Agree to Terms and Conditions')}
        />
        <label
          htmlFor={`${baseId}-agree-terms`}
          className="cursor-pointer text-xs leading-relaxed text-navy-900 sm:text-sm"
        >
          {t('registrationPage.form.agreeTermsPrefix', 'I have read, understood and agree to the')}{' '}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="font-bold text-gold-700 underline transition hover:text-gold-800"
          >
            {t('registrationPage.form.termsAndConditions', 'Terms & Conditions')}
          </button>{' '}
          {t('registrationPage.form.agreeTermsSuffix', 'governing community bio-data verification and honorary matchmaking support.')}
        </label>
      </div>
      {fieldErrors.agree_terms && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
          {fieldErrors.agree_terms}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-cream-200 pt-5 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={handleValidateClick}
          className="w-full border-gold-500/60 bg-gold-50/50 text-navy-900 hover:bg-gold-100 sm:w-auto font-medium"
        >
          {t('registrationPage.form.checkUnfilled', 'Check Any Unfilled Details')}
        </Button>

        <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
          {/* Natural notice telling user where OTP goes */}
          {!isMobileVerifiedNow && isMobileComplete && (
            <p className="text-xs font-medium text-ink-600 flex items-center gap-1.5 text-center sm:text-right">
              <span className="size-1.5 rounded-full bg-gold-600 animate-pulse" />
              <span>
                {t('registrationPage.form.otpSendNotice', {
                  defaultValue: `सत्यापन के लिए +91 ${form.mobile} पर ओटीपी भेजा जाएगा`,
                  mobile: form.mobile,
                })}
              </span>
            </p>
          )}

          <Button
            type="submit"
            disabled={!isFormFullyFilled || isSubmitting}
            className={cn(
              'w-full px-8 py-3 text-sm font-bold transition sm:w-auto shadow-md rounded-xl !text-white',
              !isFormFullyFilled
                ? '!bg-navy-900/40 !text-white cursor-not-allowed hover:!bg-navy-900/40'
                : isMobileVerifiedNow
                ? '!bg-navy-900 !text-white hover:!bg-navy-800'
                : '!bg-gold-600 !text-white hover:!bg-gold-500 ring-2 ring-gold-400/50 shadow-gold'
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
            ) : !isFormFullyFilled ? (
              t('registrationPage.form.fillAllDetails', 'Fill All Details to Enable Submit')
            ) : isMobileVerifiedNow ? (
              t('registrationPage.form.submitRegistration', 'Submit Registration')
            ) : (
              t('registrationPage.form.verifyAndSubmit', 'Verify via OTP & Submit')
            )}
          </Button>

          {!isFormFullyFilled ? (
            <span className="text-[11px] text-ink-500 font-medium text-center sm:text-right">
              {t('registrationPage.form.completeAllRequired', 'Complete all required fields above to proceed with submission')}
            </span>
          ) : isMobileVerifiedNow ? (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 text-center sm:text-right">
              <span>{t('registrationPage.form.mobileVerifiedReady', '✓ Mobile verified. Ready to submit!')}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
