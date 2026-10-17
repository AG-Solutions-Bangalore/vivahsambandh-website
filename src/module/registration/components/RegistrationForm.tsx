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
import TermsModal from './TermsModal'
import OtpVerificationModal from './OtpVerificationModal'
import {
  RegistrationFormProvider,
  useRegistrationForm,
} from './registration-form/context'
import SubmitResultBanner from './registration-form/sections/SubmitResultBanner'
import PersonalDetailsSection from './registration-form/sections/PersonalDetailsSection'
import PartnerPreferencesSection from './registration-form/sections/PartnerPreferencesSection'
import FamilySummarySection from './registration-form/sections/FamilySummarySection'
import PhotosSection from './registration-form/sections/PhotosSection'
import TermsSubmitSection from './registration-form/sections/TermsSubmitSection'

function RegistrationFormInner() {
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
  } = useRegistrationForm()

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto max-w-5xl">
        {/* Success / Error notification */}
        <SubmitResultBanner />

        <form noValidate onSubmit={handleSubmit} className="space-y-10">
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
