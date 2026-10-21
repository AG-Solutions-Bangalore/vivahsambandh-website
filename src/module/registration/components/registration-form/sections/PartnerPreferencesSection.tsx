/**
 * @file src/module/registration/components/registration-form/sections/PartnerPreferencesSection.tsx
 * Part 2 — Partner Preferences & Horoscope: astrological criteria.
 */

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Field } from '@/components/ui/field'
import { YesNoPills } from '@/components/ui/option-pills'
import { HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from '../context'

export default function PartnerPreferencesSection() {
  const { t } = useTranslation()
  const {
    baseId,
    form,
    fieldErrors,
    handlePillChange,
  } = useRegistrationForm()

  return (
    <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
      <div className="mb-6 border-b border-cream-200 pb-4">
        <span className="eyebrow">{t('registrationPage.form.part2Badge', 'Part 2')}</span>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
          {t('registrationPage.form.part2Title', 'Partner Preferences & Horoscope')}
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          {t('registrationPage.form.part2Subtitle', 'Astrological criteria for the alliance.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Same Gotra */}
        <div id={`${baseId}-same-gotra-group`}>
          <Field
            id={`${baseId}-same-gotra-pills`}
            label={t('registrationPage.form.sameGotraLabel', 'Marry in same Gotra?')}
            required
            error={fieldErrors.will_marry_same_gotra}
            tooltip={
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  tabIndex={-1}
                  className="text-ink-400 transition hover:text-gold-700"
                >
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  {t('registrationPage.form.sameGotraTooltip', 'Indicate if your family permits alliances within the same paternal Gotra.')}
                </TooltipContent>
              </Tooltip>
            }
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
        <div id={`${baseId}-is-manglik-group`}>
          <Field
            id={`${baseId}-is-manglik-pills`}
            label={t('registrationPage.form.isManglikLabel', 'Are you Manglik?')}
            required
            error={fieldErrors.is_manglik}
            tooltip={
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  tabIndex={-1}
                  className="text-ink-400 transition hover:text-gold-700"
                >
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  {t('registrationPage.form.isManglikTooltip', "Astrological Mangal Dosha positioning in the candidate's birth chart.")}
                </TooltipContent>
              </Tooltip>
            }
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
        <div id={`${baseId}-will-marry-manglik-group`}>
          <Field
            id={`${baseId}-will-marry-manglik-pills`}
            label={t('registrationPage.form.willMarryManglikLabel', 'Will you marry Manglik?')}
            required
            error={fieldErrors.will_marry_manglik}
            tooltip={
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  tabIndex={-1}
                  className="text-ink-400 transition hover:text-gold-700"
                >
                  <HelpCircle className="size-3.5" />
                </TooltipTrigger>
                <TooltipContent>
                  {t('registrationPage.form.willMarryManglikTooltip', 'Indicate if willing to consider proposals from Manglik candidates.')}
                </TooltipContent>
              </Tooltip>
            }
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
    </div>
  )
}
