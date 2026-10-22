/**
 * @file src/module/registration/components/registration-form/steps.ts
 * Registry of the three numbered parts of the registration form.
 *
 * `fields` lists the form-state keys (the same keys validation.ts reports
 * under) that belong to each step, so the wizard can validate a single step
 * in isolation and can jump straight to the first incomplete step.
 *
 * Sections that share a step keep their own anchor ids (REGISTRATION_STEP_IDS)
 * so deep links and scroll helpers still land on the right panel.
 */

export const REGISTRATION_STEP_IDS = {
  personal: 'registration-part-1',
  preferences: 'registration-part-2',
  family: 'registration-part-3',
  photos: 'registration-part-4',
  terms: 'registration-part-5',
} as const

export interface RegistrationStep {
  id: string
  number: number
  /** i18n key + fallback for the short stepper label. */
  shortLabelKey: string
  shortLabelFallback: string
  /** i18n key + fallback for the full section title. */
  titleKey: string
  titleFallback: string
  /** Form-state keys validated in this step. */
  fields: string[]
}

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    id: 'registration-step-1',
    number: 1,
    shortLabelKey: 'registrationPage.form.stepPersonal',
    shortLabelFallback: 'Personal',
    titleKey: 'registrationPage.form.part1Title',
    titleFallback: 'Personal & Family Details',
    fields: [
      'name',
      'gender',
      'date_of_birth',
      'time_of_birth',
      'place_of_birth',
      'email',
      'education_id',
      'profession_id',
      'company_name',
      'company_type',
      'annual_income',
      'community_id',
      'gotra_id',
      'height_feet',
      'height_inch',
      'physical_disablity',
      'marry_in_community',
      'married_before',
      'divorce_status',
      'children_from_prior_marriage',
      'children_with',
      'father_name',
      'mother_name',
      'brother_married',
      'brother_un_married',
      'sister_married',
      'sister_un_married',
      'user_address',
      'house_type',
      'user_current_city',
      'contact_name',
      'mobile',
      'alternate_contact_name',
      'alternate_mobile_no',
    ],
  },
  {
    id: 'registration-step-2',
    number: 2,
    shortLabelKey: 'registrationPage.form.stepPreferencesPhotos',
    shortLabelFallback: 'Preferences & Photos',
    titleKey: 'registrationPage.form.part2Title',
    titleFallback: 'Preferences, Family & Photos',
    fields: ['will_marry_same_gotra', 'is_manglik', 'will_marry_manglik', 'user_summary', 'full_image', 'face_image'],
  },
  {
    id: 'registration-step-3',
    number: 3,
    shortLabelKey: 'registrationPage.form.stepSubmit',
    shortLabelFallback: 'Submit',
    titleKey: 'registrationPage.form.part5Title',
    titleFallback: 'Declaration & Submit',
    fields: ['agree_terms'],
  },
]

/** Total number of steps in the wizard. */
export const REGISTRATION_STEP_COUNT = REGISTRATION_STEPS.length
