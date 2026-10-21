/**
 * @file src/module/registration/components/registration-form/sections/TermsSubmitSection.tsx
 * Part 5 — Terms agreement and submission actions.
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ClipboardCheck, Send } from 'lucide-react'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

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
    <FormSection
      id={REGISTRATION_STEP_IDS.terms}
      step={5}
      badge={t('registrationPage.form.part5Badge', 'Part 5')}
      title={t('registrationPage.form.part5Title', 'Declaration & Submit')}
      subtitle={t(
        'registrationPage.form.part5Subtitle',
        'Accept the community guidelines, then send your bio-data to the volunteer committee for verification.',
      )}
      className={fieldErrors.agree_terms ? 'border-maroon-500' : undefined}
    >
      <div
        className={`rounded-2xl border p-4 transition sm:p-5 ${
          fieldErrors.agree_terms
            ? 'border-maroon-500 bg-maroon-50/20'
            : 'border-cream-200 bg-cream-50/60 focus-within:border-gold-500/50'
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
            className="mt-0.5 size-5"
            aria-label={t('registrationPage.form.termsAndConditions', 'Agree to Terms and Conditions')}
          />
          <label
            htmlFor={`${baseId}-agree-terms`}
            className="cursor-pointer text-[13px] leading-relaxed text-navy-900 sm:text-sm"
          >
            {t('registrationPage.form.agreeTermsPrefix', 'I have read, understood and agree to the')}{' '}
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="font-bold text-gold-700 underline underline-offset-2 transition hover:text-gold-800"
            >
              {t('registrationPage.form.termsAndConditions', 'Terms & Conditions')}
            </button>{' '}
            {t('registrationPage.form.agreeTermsSuffix', 'governing community bio-data verification and honorary matchmaking support.')}
          </label>
        </div>
        {fieldErrors.agree_terms && (
          <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-maroon-600">
            {fieldErrors.agree_terms}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col items-stretch gap-5 border-t border-cream-200 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleValidateClick}
          className="h-12 w-full rounded-full border-gold-500/60 bg-white font-semibold text-navy-900 hover:border-gold-500 hover:bg-gold-50 lg:w-auto"
        >
          <ClipboardCheck aria-hidden />
          {t('registrationPage.form.checkUnfilled', 'Check Any Unfilled Details')}
        </Button>

        <div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:items-end">
          {/* Natural notice telling user where OTP goes */}
          {!isMobileVerifiedNow && isMobileComplete && (
            <p className="flex items-center gap-1.5 text-center text-xs font-medium text-ink-600 lg:text-right">
              <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
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
              'h-12 w-full rounded-full px-8 text-sm font-bold transition shadow-md lg:w-auto',
              !isFormFullyFilled
                ? '!bg-navy-900/40 !text-white cursor-not-allowed hover:!bg-navy-900/40'
                : isMobileVerifiedNow
                ? '!bg-navy-900 !text-white hover:!bg-navy-800'
                : '!bg-gold-600 !text-white hover:!bg-gold-500 ring-2 ring-gold-400/50 shadow-gold',
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
              <span className="flex items-center gap-2">
                <Send aria-hidden />
                {t('registrationPage.form.submitRegistration', 'Submit Registration')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send aria-hidden />
                {t('registrationPage.form.verifyAndSubmit', 'Verify via OTP & Submit')}
              </span>
            )}
          </Button>

          {!isFormFullyFilled ? (
            <span className="text-center text-[11px] font-medium text-ink-500 lg:text-right">
              {t('registrationPage.form.completeAllRequired', 'Complete all required fields above to proceed with submission')}
            </span>
          ) : isMobileVerifiedNow ? (
            <span className="flex items-center gap-1 text-center text-[11px] font-semibold text-emerald-700 lg:text-right">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
              <span>{t('registrationPage.form.mobileVerifiedReady', '✓ Mobile verified. Ready to submit!')}</span>
            </span>
          ) : null}
        </div>
      </div>
    </FormSection>
  )
}
