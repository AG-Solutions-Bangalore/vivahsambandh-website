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
    openOtpModal,
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

      {/* Mobile OTP Verification Card at the bottom */}
      <div
        className={cn(
          "mt-6 rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          isMobileVerifiedNow
            ? "border-emerald-400/40 bg-emerald-50/60 text-emerald-950"
            : isMobileComplete
            ? "border-gold-500/40 bg-gold-50/60 text-navy-950"
            : "border-cream-300 bg-cream-50/60 text-ink-600"
        )}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base shadow-xs",
              isMobileVerifiedNow
                ? "bg-emerald-100 text-emerald-700"
                : isMobileComplete
                ? "bg-gold-100 text-gold-700"
                : "bg-cream-200 text-ink-500"
            )}
          >
            {isMobileVerifiedNow ? (
              <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gold-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
          </span>
          <div>
            <h4 className="text-sm font-bold text-navy-900">
              {isMobileVerifiedNow
                ? t('registrationPage.form.mobileVerifiedHeading', 'Mobile Number Verified')
                : t('registrationPage.form.mobileVerificationTitle', 'Mobile Number Verification')}
            </h4>
            <p className="mt-0.5 text-xs text-ink-600 leading-relaxed">
              {isMobileVerifiedNow
                ? t('registrationPage.form.mobileVerifiedSuccess', {
                    defaultValue: `✓ Contact number +91 ${form.mobile} has been verified successfully.`,
                    mobile: form.mobile,
                  })
                : isMobileComplete
                ? t('registrationPage.form.mobileVerificationNotice', {
                    defaultValue: `We will send a 6-digit verification code (OTP) to +91 ${form.mobile} to verify this number.`,
                    mobile: form.mobile,
                  })
                : t('registrationPage.form.mobileVerificationNoticeEmpty', 'Please enter a valid 10-digit mobile number in Part 1 to receive the verification OTP.')}
            </p>
          </div>
        </div>

        {!isMobileVerifiedNow && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openOtpModal}
            disabled={!isMobileComplete}
            className={cn(
              "w-full sm:w-auto shrink-0 font-bold text-xs shadow-2xs transition",
              isMobileComplete
                ? "border-gold-500 bg-gold-100 hover:bg-gold-200 text-navy-900 cursor-pointer"
                : "border-cream-300 bg-cream-100 text-ink-400 cursor-not-allowed opacity-60"
            )}
          >
            {t('registrationPage.form.verifyMobileBtn', 'Verify Mobile via OTP')}
          </Button>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-cream-200 pt-5 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={handleValidateClick}
          className="w-full border-gold-500/60 bg-gold-50/50 text-navy-900 hover:bg-gold-100 sm:w-auto"
        >
          {t('registrationPage.form.checkUnfilled', 'Check Any Unfilled Details')}
        </Button>

        <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
          <Button
            type="submit"
            disabled={!isFormFullyFilled || isSubmitting}
            className={cn(
              'w-full px-8 py-3 text-sm font-bold transition sm:w-auto',
              !isFormFullyFilled
                ? 'bg-ink-300 text-white cursor-not-allowed opacity-60 hover:bg-ink-300'
                : isMobileVerifiedNow
                ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-md'
                : 'bg-gold-600 text-navy-950 hover:bg-gold-500 shadow-md ring-2 ring-gold-400/50'
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
              t('registrationPage.form.sendOtpAndSubmit', {
                defaultValue: `Verify Mobile (+91 ${form.mobile}) & Submit`,
                mobile: form.mobile,
              })
            )}
          </Button>

          {!isFormFullyFilled ? (
            <span className="text-[11px] text-ink-500 font-medium text-center sm:text-right">
              {t('registrationPage.form.completeAllRequired', 'Complete all required fields above to proceed with submission')}
            </span>
          ) : !isMobileVerifiedNow ? (
            <span className="text-[11px] text-gold-900 font-semibold flex items-center gap-1 text-center sm:text-right">
              <span>
                {t('registrationPage.form.detailsCompleteOtpWithMobile', {
                  defaultValue: `✓ Details complete. Click to send OTP to +91 ${form.mobile} and submit.`,
                  mobile: form.mobile,
                })}
              </span>
            </span>
          ) : (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 text-center sm:text-right">
              <span>{t('registrationPage.form.mobileVerifiedReady', '✓ Mobile verified. Ready to submit!')}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
