/**
 * @file src/module/registration/components/registration-form/sections/PartnerPreferencesSection.tsx
 * Part 2 — Partner Preferences & Horoscope: astrological criteria.
 */

import { Field } from '@/components/ui/field'
import { YesNoPills } from '@/components/ui/option-pills'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

export default function PartnerPreferencesSection() {
  const { t } = useTranslation()
  const {
    baseId,
    form,
    fieldErrors,
    handlePillChange,
  } = useRegistrationForm()

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.preferences}
      title={t('registrationPage.form.part2Title', 'Partner Preferences & Horoscope')}
      subtitle={t('registrationPage.form.part2Subtitle', 'Astrological criteria for the alliance.')}
    >
      <div className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Same Gotra */}
        <div
          id={`${baseId}-same-gotra-group`}
          className="rounded-2xl border border-cream-300 bg-cream-50/70 p-4 transition-colors focus-within:border-gold-500/50"
        >
          <Field
            id={`${baseId}-same-gotra-pills`}
            label={t('registrationPage.form.sameGotraLabel', 'Marry in same Gotra')}
            required
            error={fieldErrors.will_marry_same_gotra}
          >
            <YesNoPills
              id={`${baseId}-same-gotra-pills`}
              name="will_marry_same_gotra"
              value={form.will_marry_same_gotra}
              onChange={handlePillChange('will_marry_same_gotra')}
              error={Boolean(fieldErrors.will_marry_same_gotra)}
              ariaLabel={t('registrationPage.form.sameGotraLabel', 'Marry in same Gotra')}
            />
          </Field>
        </div>

        {/* Are you Manglik */}
        <div
          id={`${baseId}-is-manglik-group`}
          className="rounded-2xl border border-cream-300 bg-cream-50/70 p-4 transition-colors focus-within:border-gold-500/50"
        >
          <Field
            id={`${baseId}-is-manglik-pills`}
            label={t('registrationPage.form.isManglikLabel', 'Are you Manglik')}
            required
            error={fieldErrors.is_manglik}
          >
            <YesNoPills
              id={`${baseId}-is-manglik-pills`}
              name="is_manglik"
              value={form.is_manglik}
              onChange={handlePillChange('is_manglik')}
              error={Boolean(fieldErrors.is_manglik)}
              ariaLabel={t('registrationPage.form.isManglikLabel', 'Are you Manglik')}
            />
          </Field>
        </div>

        {/* Marry a Manglik */}
        <div
          id={`${baseId}-will-marry-manglik-group`}
          className="rounded-2xl border border-cream-300 bg-cream-50/70 p-4 transition-colors focus-within:border-gold-500/50"
        >
          <Field
            id={`${baseId}-will-marry-manglik-pills`}
            label={t('registrationPage.form.willMarryManglikLabel', 'Will you marry Manglik')}
            required
            error={fieldErrors.will_marry_manglik}
          >
            <YesNoPills
              id={`${baseId}-will-marry-manglik-pills`}
              name="will_marry_manglik"
              value={form.will_marry_manglik}
              onChange={handlePillChange('will_marry_manglik')}
              error={Boolean(fieldErrors.will_marry_manglik)}
              ariaLabel={t('registrationPage.form.willMarryManglikLabel', 'Will you marry Manglik')}
            />
          </Field>
        </div>
      </div>
    </FormSection>
  )
}
