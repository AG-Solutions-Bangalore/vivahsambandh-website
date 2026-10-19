/**
 * @file src/module/registration/components/registration-form/constants.ts
 * Shared constants and small pure helpers for the registration form.
 */

import type { RegistrationFormData } from '../../types'

export const initialFormState: RegistrationFormData = {
  name: '',
  gender: '',
  date_of_birth: '',
  time_of_birth: '',
  place_of_birth: '',
  email: '',

  education_id: '',
  profession_id: '',
  company_name: '',
  company_type: '',
  annual_income: '',

  height_feet: '',
  height_inch: '',
  physical_disablity: '',

  father_name: '',
  mother_name: '',
  brother_married: '0',
  brother_un_married: '0',
  sister_married: '0',
  sister_un_married: '0',

  user_address: '',
  house_type: '',
  user_current_city: '',
  contact_name: '',
  mobile: '',
  alternate_contact_name: '',
  alternate_mobile_no: '',

  community_id: '',
  gotra_id: '',
  marry_in_community: [],

  married_before: '',
  divorce_status: '',
  children_from_prior_marriage: '',
  children_with: '',

  will_marry_same_gotra: '',
  is_manglik: '',
  will_marry_manglik: '',

  user_summary: '',

  full_image: null,
  face_image: null,
  full_image_preview: '',
  face_image_preview: '',

  agree_terms: false,
}

// Legal marriage age in India: 21 for grooms, 18 for brides.
export function minAgeForGender(gender: string): number {
  return gender === 'Female' ? 18 : 21
}

// Calculate if candidate is below the legal minimum age for their gender
export function isCandidateUnderage(dobStr: string, gender: string): boolean {
  if (!dobStr) return false
  const parts = dobStr.split('-')
  if (parts.length !== 3) return false
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false

  const birthDate = new Date(y, m - 1, d)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const mDiff = today.getMonth() - birthDate.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age < minAgeForGender(gender)
}
