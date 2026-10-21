/**
 * @file src/module/registration/components/RegistrationForm.tsx
 * Complete VivahSambandh Registration Form — orchestrator shell.
 *
 * Delegates state/handlers to registration-form/context.tsx and renders the
 * five section components (registration-form/sections/*):
 *   Part 1  PersonalDetailsSection      — personal & family details
 *   Part 2  PartnerPreferencesSection   — horoscope & partner preferences
 *   Part 3  FamilySummarySection        — family history summary
 *   Part 4  PhotosSection               — photographs with interactive cropper
 *   Part 5  TermsSubmitSection          — terms agreement & submit actions
 */

import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import TermsModal from './TermsModal'
import OtpVerificationModal from './OtpVerificationModal'
import {
  RegistrationFormProvider,
  useRegistrationForm,
} from './registration-form/context'
import FormStepNav from './registration-form/FormStepNav'
import SubmitResultBanner from './registration-form/sections/SubmitResultBanner'
import PersonalDetailsSection from './registration-form/sections/PersonalDetailsSection'
import PartnerPreferencesSection from './registration-form/sections/PartnerPreferencesSection'
import FamilySummarySection from './registration-form/sections/FamilySummarySection'
import PhotosSection from './registration-form/sections/PhotosSection'
import TermsSubmitSection from './registration-form/sections/TermsSubmitSection'

function RegistrationFormInner() {
  const { t } = useTranslation()
  const {
    form,
    handleOtpVerified,
    handleSubmit,
    isOtpModalOpen,
    setIsOtpModalOpen,
    focusAndScrollToField,
    baseId,
    termsOpen,
    setTermsOpen,
    submitResult,
    resetRegistration,
    otpTriggerSource,
  } = useRegistrationForm()

  // Once submitted successfully, show only the centered success message
  // with a "Submit other response" button instead of the form.
  if (submitResult?.type === 'success') {
    return (
      <TooltipProvider delay={150}>
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center py-20 text-center">
          <SubmitResultBanner />

          <Button
            type="button"
            onClick={resetRegistration}
            className="mt-8 rounded-full bg-navy-900 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-navy-800"
          >
            {t('registrationPage.form.submitOtherResponse', 'Submit other response')}
          </Button>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto max-w-5xl">
        {/* Success / Error notification */}
        <SubmitResultBanner />

        {/* Sticky jump-navigation between the five parts */}
        <FormStepNav />

        <form noValidate onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <PersonalDetailsSection />
          <PartnerPreferencesSection />
          <FamilySummarySection />
          <PhotosSection />
          <TermsSubmitSection />
        </form>

        {/* Terms Modal */}
        <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />

        {/* Firebase Phone OTP Verification Modal */}
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          mobile={form.mobile}
          mode={otpTriggerSource}
          onVerified={handleOtpVerified}
          onClose={() => setIsOtpModalOpen(false)}
          onChangeNumber={() => {
            setIsOtpModalOpen(false)
            focusAndScrollToField(`${baseId}-contact-mobile`)
          }}
        />
      </div>
    </TooltipProvider>
  )
}

export default function RegistrationForm() {
  return (
    <RegistrationFormProvider>
      <RegistrationFormInner />
    </RegistrationFormProvider>
  )
}
