/**
 * @file src/module/registration/components/registration-form/sections/FamilySummarySection.tsx
 * Part 3 — Family History & Summary.
 */

import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'

export default function FamilySummarySection() {
  const { t } = useTranslation()
  const { baseId, form, fieldErrors, handleInputChange, handlePasteCapture } = useRegistrationForm()

  const inputCls = (key: string) =>
    cn(
      'w-full rounded-2xl border px-4 py-2.5 text-sm text-navy-900 transition outline-none focus-visible:ring-2',
      fieldErrors[key]
        ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
        : 'border-cream-300 bg-cream-50/70 hover:bg-white focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
    )

  return (
    <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
      <div className="mb-6 border-b border-cream-200 pb-4">
        <span className="eyebrow">{t('registrationPage.form.part3Badge', 'Part 3')}</span>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
          {t('registrationPage.form.part3Title', 'Family History & Summary')}
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          {t('registrationPage.form.part3Subtitle', "Briefly describe parents' occupation, values, family background, and any aspirations.")}
        </p>
      </div>

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
    </div>
  )
}
