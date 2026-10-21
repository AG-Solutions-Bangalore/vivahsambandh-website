/**
 * @file src/module/registration/components/registration-form/steps.ts
 * Anchor ids for the numbered parts of the registration form.
 *
 * Shared by <FormStepNav/> (the sticky navigator) and every section card so
 * the jump links and the section targets can never drift apart.
 */

export const REGISTRATION_STEP_IDS = {
  personal: 'registration-part-1',
  preferences: 'registration-part-2',
  family: 'registration-part-3',
  photos: 'registration-part-4',
  terms: 'registration-part-5',
} as const
