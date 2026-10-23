/**
 * @file src/module/registration/components/RegistrationForm.tsx
 * Complete VivahSambandh Registration Form — step-by-step wizard shell.
 *
 * The three numbered parts are shown one at a time so the form never reads as
 * one endless wall of inputs:
 *   Step 1  PersonalDetailsSection      — personal & family details
 *   Step 2  PartnerPreferencesSection   — horoscope & partner preferences
 *           FamilySummarySection        — family history summary
 *           PhotosSection               — photographs with interactive cropper
 *   Step 3  TermsSubmitSection          — terms agreement
 *
 * Steps unlock in order: you cannot open a later step until every step before
 * it validates. State, handlers and validation live in
 * registration-form/context.tsx.
 */

import { TooltipProvider } from '@/components/ui/tooltip'
import { useEffect, type FormEvent } from 'react'
import { getLenis } from '@/lib/scroll'
import TermsModal from './TermsModal'
import OtpVerificationModal from './OtpVerificationModal'
import {
  RegistrationFormProvider,
  useRegistrationForm,
} from './registration-form/context'
import FormStepper from './registration-form/FormStepper'
import FormWizardNav from './registration-form/FormWizardNav'
import { REGISTRATION_STEPS } from './registration-form/steps'
import SubmitResultBanner from './registration-form/sections/SubmitResultBanner'
import PersonalDetailsSection from './registration-form/sections/PersonalDetailsSection'
import PartnerPreferencesSection from './registration-form/sections/PartnerPreferencesSection'
import FamilySummarySection from './registration-form/sections/FamilySummarySection'
import PhotosSection from './registration-form/sections/PhotosSection'
import TermsSubmitSection from './registration-form/sections/TermsSubmitSection'
import ThankYouSection from './registration-form/sections/ThankYouSection'

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
    submitResult,
    otpTriggerSource,
    currentStep,
    goToStep,
    validateStep,
    validateStepsBefore,
    validateAllSteps,
    isFormFullyFilled,
    isSubmitting,
    isMobileVerifiedNow,
    isMobileComplete,
  } = useRegistrationForm()

  const lastStepIndex = REGISTRATION_STEPS.length - 1
  // The declaration lives on step 2; submitting there moves the visitor to
  // the final thank-you step.
  const isSubmitStep = currentStep === lastStepIndex - 1

  // Keep the active step in view when it changes.
  const scrollToStepTop = () => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { offset: 0, duration: 0.7 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // On a successful submit, land on the thank-you step.
  useEffect(() => {
    if (submitResult?.type === 'success' && currentStep !== lastStepIndex) {
      goToStep(lastStepIndex)
      scrollToStepTop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitResult, currentStep, lastStepIndex, goToStep])

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    goToStep(currentStep + 1)
    scrollToStepTop()
  }

  const handleBack = () => {
    goToStep(currentStep - 1)
    scrollToStepTop()
  }

  // Stepper jumps follow the same rule as Continue: a later step only opens
  // once every earlier step validates. Otherwise reveal the first gap instead.
  // The final thank-you step is only reachable by submitting.
  const handleStepSelect = (step: number) => {
    if (submitResult?.type === 'success' || step === lastStepIndex) return
    if (step > currentStep && !validateStepsBefore(step)) {
      scrollToStepTop()
      return
    }
    goToStep(step)
    scrollToStepTop()
  }

  // Submit guard: only hand over to the real submit flow once every step
  // is complete. Otherwise jump to the first unfinished step.
  const handleWizardSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateAllSteps()) {
      scrollToStepTop()
      return
    }
    void handleSubmit(e)
  }

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto max-w-5xl">
        {/* Submission errors stay visible above the form */}
        {submitResult?.type !== 'success' && <SubmitResultBanner />}

        {/* Progress indicator — travels with the form, never fixed */}
        <FormStepper current={currentStep} onSelect={handleStepSelect} />

        <form noValidate onSubmit={handleWizardSubmit}>
          <div key={currentStep} className="animate-step-in">
            {currentStep === 0 && <PersonalDetailsSection />}
            {currentStep === 1 && (
              <div className="space-y-6">
                <PartnerPreferencesSection />
                <FamilySummarySection />
                <PhotosSection />
                <TermsSubmitSection />
              </div>
            )}
            {currentStep === 2 && <ThankYouSection />}
          </div>

          {currentStep !== lastStepIndex && (
            <FormWizardNav
              step={currentStep}
              isLastStep={isSubmitStep}
              onBack={handleBack}
              onNext={handleNext}
              isSubmitting={isSubmitting}
              isFormFullyFilled={isFormFullyFilled}
              isMobileVerifiedNow={isMobileVerifiedNow}
              isMobileComplete={isMobileComplete}
              mobile={form.mobile}
            />
          )}
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
