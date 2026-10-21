/**
 * @file src/module/registration/components/registration-form/sections/FamilySummarySection.tsx
 * Part 3 — Family History & Summary.
 */

import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'
import FormSection from '../FormSection'
import { REGISTRATION_STEP_IDS } from '../steps'

export default function FamilySummarySection() {
  const { t } = useTranslation()
  const { baseId, form, fieldErrors, handleInputChange, handlePasteCapture } = useRegistrationForm()

  const inputCls = (key: string) =>
    cn(
      'w-full rounded-2xl border px-4 py-3 text-base md:text-sm font-medium text-navy-900 shadow-xs transition outline-none focus-visible:ring-2',
      'placeholder:font-normal placeholder:text-ink-400',
      fieldErrors[key]
        ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
        : 'border-cream-300 bg-cream-50/70 hover:bg-white hover:border-gold-500/60 focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
    )

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.family}
      step={3}
      badge={t('registrationPage.form.part3Badge', 'Part 3')}
      title={t('registrationPage.form.part3Title', 'Family History & Summary')}
      subtitle={t('registrationPage.form.part3Subtitle', "Briefly describe parents' occupation, values, family background, and any aspirations.")}
    >
      <div>
        <Field
          id={`${baseId}-summary`}
          label={t('registrationPage.form.summaryLabel', "Brief Summary of Parent's Occupation / Family History")}
          required
          hint={`${500 - form.user_summary.length} ${t('registrationPage.form.charsLeft', 'chars left')}`}
          error={fieldErrors.user_summary}
        >
          <Textarea
            id={`${baseId}-summary`}
            name="user_summary"
            rows={4}
            maxLength={500}
            value={form.user_summary}
            onChange={handleInputChange}
            onPaste={handlePasteCapture('user_summary')}
            placeholder={t('registrationPage.form.summaryPlaceholder', "Provide a brief paragraph describing your family, parents' professions, and lifestyle values (min. 10 characters).")}
            className={inputCls('user_summary')}
            aria-invalid={Boolean(fieldErrors.user_summary)}
          />
        </Field>
      </div>
    </FormSection>
  )
}
