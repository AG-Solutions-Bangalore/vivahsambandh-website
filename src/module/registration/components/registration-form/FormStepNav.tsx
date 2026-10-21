/**
 * @file src/module/registration/components/registration-form/FormStepNav.tsx
 * Sticky jump-navigation for the five parts of the registration form.
 *
 * Purely presentational: it renders plain in-page anchors, so the navigation
 * works with the browser/Lenis anchor handling already in place and adds no
 * state, handlers or side effects of its own.
 */

import { useTranslation } from 'react-i18next'
import { REGISTRATION_STEP_IDS } from './steps'

export default function FormStepNav() {
  const { t } = useTranslation()

  const steps = [
    {
      id: REGISTRATION_STEP_IDS.personal,
      label: t('registrationPage.form.navPersonal', 'Personal'),
    },
    {
      id: REGISTRATION_STEP_IDS.preferences,
      label: t('registrationPage.form.navPreferences', 'Preferences'),
    },
    {
      id: REGISTRATION_STEP_IDS.family,
      label: t('registrationPage.form.navFamily', 'Family'),
    },
    {
      id: REGISTRATION_STEP_IDS.photos,
      label: t('registrationPage.form.navPhotos', 'Photos'),
    },
    {
      id: REGISTRATION_STEP_IDS.terms,
      label: t('registrationPage.form.navSubmit', 'Submit'),
    },
  ]

  return (
    <nav
      aria-label={t('registrationPage.form.navLabel', 'Registration form sections')}
      className="sticky top-16 z-30 mb-6 rounded-[1.5rem] border border-cream-200 bg-cream-50/95 p-1.5 shadow-card backdrop-blur-md"
    >
      <ol className="no-scrollbar flex items-center justify-start gap-1 overflow-x-auto sm:justify-center">
        {steps.map((step, index) => (
          <li key={step.id} className="shrink-0">
            <a
              href={`#${step.id}`}
              className="group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-navy-800 transition hover:bg-gold-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-navy-900 text-[10px] font-bold text-white transition-colors group-hover:bg-gold-600">
                {index + 1}
              </span>
              {step.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
