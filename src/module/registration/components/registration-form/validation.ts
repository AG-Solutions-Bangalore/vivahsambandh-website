/**
 * @file src/module/registration/components/registration-form/validation.ts
 * Pure validation logic for the registration form, split out of the former
 * 2,400-line RegistrationForm.tsx for maintainability.
 */

import type { RegistrationFormData } from '../../types'
import { isCandidateUnderage } from './constants'

/**
 * Dynamic condition flags derived from current form selections
 * (profession branches, marital history, gender, etc.).
 */
export interface RegistrationConditions {
  isEmployed: boolean
  isBusiness: boolean
  isOtherProfession: boolean
  showIncome: boolean
  isDivorced: boolean
  hasPriorMarriage: boolean
  showChildrenWith: boolean
  isMale: boolean
}

export interface ErrorSummaryItem {
  key: string
  id: string
  label: string
  error: string
}

export interface ValidationResult {
  errors: Record<string, string>
  firstField: ErrorSummaryItem | null
  errorList: ErrorSummaryItem[]
}

/**
 * Form Validation Engine in visual top-to-bottom order.
 * Enforces ONLY the create-user-register API spec fields — everything not in
 * the spec has been removed from the form. Optional spec keys (email,
 * company_name, company_type, annual_income, mother_name, divorce_status,
 * children_from_prior_marriage, children_with) accept empty values but are
 * format-checked when filled.
 */
export function validateRegistrationForm(
  form: RegistrationFormData,
  _conditions: RegistrationConditions,
  baseId: string,
): ValidationResult {
  const errors: Record<string, string> = {}
  const errorList: ErrorSummaryItem[] = []

  const addError = (key: string, id: string, label: string, msg: string) => {
    errors[key] = msg
    errorList.push({ key, id, label, error: msg })
  }

  // --- PART 1: Personal & Family Details ---
  if (!form.name.trim()) {
    addError('name', `${baseId}-name`, 'Full Name', 'Candidate full name is required')
  } else if (form.name.trim().length < 2) {
    addError('name', `${baseId}-name`, 'Full Name', 'Please enter a valid full name')
  }

  if (!form.gender) {
    addError('gender', `${baseId}-gender`, 'Gender', 'Please select gender')
  }

  if (!form.date_of_birth) {
    addError('date_of_birth', `${baseId}-dob`, 'Date of Birth', 'Date of birth is required')
  } else if (isCandidateUnderage(form.date_of_birth)) {
    addError(
      'date_of_birth',
      `${baseId}-dob`,
      'Date of Birth',
      'Candidate must be at least 21 years old to register',
    )
  }

  if (!form.time_of_birth) {
    addError('time_of_birth', `${baseId}-birthtime`, 'Time of Birth', 'Time of birth is required')
  }

  if (!form.place_of_birth.trim()) {
    addError('place_of_birth', `${baseId}-pob`, 'Place of Birth', 'Place of birth is required')
  }

  // Email is optional per the API spec — validated for format when provided.
  if (
    form.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    addError('email', `${baseId}-email`, 'Email Address', 'Please enter a valid email address')
  }

  if (!form.education_id) {
    addError('education_id', `${baseId}-edu`, 'Education', 'Please select education qualification')
  }

  if (!form.profession_id) {
    addError('profession_id', `${baseId}-profession`, 'Profession', 'Please select profession')
  }

  if (!form.community_id) {
    addError('community_id', `${baseId}-community`, 'My Community', 'Please select your community')
  }

  if (!form.gotra_id) {
    addError('gotra_id', `${baseId}-gotra`, 'Gotra', 'Please select your gotra')
  }

  if (!form.height_feet) {
    addError('height_feet', `${baseId}-height-feet`, 'Height Feet', 'Height (feet) is required')
  }
  if (!form.height_inch) {
    addError('height_inch', `${baseId}-height-inch`, 'Height Inch', 'Height (inch) is required')
  }

  if (!form.physical_disablity) {
    addError(
      'physical_disablity',
      `${baseId}-disability`,
      'Physical Disability',
      'Physical disability selection is required',
    )
  }

  if (form.marry_in_community.length === 0) {
    addError(
      'marry_in_community',
      `${baseId}-comm-prefs`,
      'Community Preferences',
      'Please select at least one community preference',
    )
  }

  if (!form.married_before) {
    addError(
      'married_before',
      `${baseId}-prior-marriage`,
      'Married Before',
      'Please specify marital history',
    )
  }

  if (!form.father_name.trim()) {
    addError('father_name', `${baseId}-father`, "Father's Name", "Father's name is required")
  }

  if (!form.user_address.trim()) {
    addError(
      'user_address',
      `${baseId}-address`,
      'Residential Address',
      'Residential address is required',
    )
  }

  if (!form.house_type) {
    addError(
      'house_type',
      `${baseId}-house-type-group`,
      'House Type',
      'Please select house ownership type (Own or Rent)',
    )
  }

  if (!form.user_current_city.trim()) {
    addError(
      'user_current_city',
      `${baseId}-current-city`,
      'Present City',
      'Present city / parents location is required',
    )
  }

  if (!form.contact_name.trim()) {
    addError(
      'contact_name',
      `${baseId}-contact-name`,
      'Main Contact Person',
      'Main contact person name is required',
    )
  }

  if (!form.mobile) {
    addError(
      'mobile',
      `${baseId}-contact-mobile`,
      'Main Contact Mobile',
      'Main 10-digit mobile number is required',
    )
  } else if (form.mobile.length !== 10) {
    addError(
      'mobile',
      `${baseId}-contact-mobile`,
      'Main Contact Mobile',
      'Mobile number must be exactly 10 digits',
    )
  } else if (!/^[6-9]\d{9}$/.test(form.mobile)) {
    addError(
      'mobile',
      `${baseId}-contact-mobile`,
      'Main Contact Mobile',
      'Please enter a valid 10-digit Indian mobile number',
    )
  }

  if (!form.alternate_contact_name.trim()) {
    addError(
      'alternate_contact_name',
      `${baseId}-alt-name`,
      'Alternate Contact Person',
      'Alternate contact person name is required',
    )
  }

  // Alternate mobile is optional per the API spec — validated when provided.
  if (
    form.alternate_mobile_no &&
    !/^[6-9]\d{9}$/.test(form.alternate_mobile_no)
  ) {
    addError(
      'alternate_mobile_no',
      `${baseId}-alt-mobile`,
      'Alternate Contact Mobile',
      'Please enter a valid 10-digit Indian mobile number',
    )
  }

  // --- PART 2: Partner Preferences & Horoscope ---
  if (!form.will_marry_same_gotra) {
    addError(
      'will_marry_same_gotra',
      `${baseId}-same-gotra-group`,
      'Marry Same Gotra',
      'Please specify if willing to marry in same Gotra',
    )
  }

  if (!form.is_manglik) {
    addError(
      'is_manglik',
      `${baseId}-is-manglik-group`,
      'Are You Manglik',
      'Please specify if candidate is Manglik',
    )
  }

  if (!form.will_marry_manglik) {
    addError(
      'will_marry_manglik',
      `${baseId}-will-marry-manglik-group`,
      'Marry Manglik',
      'Please specify if willing to marry Manglik',
    )
  }

  // --- PART 3: Family Summary ---
  if (!form.user_summary.trim()) {
    addError(
      'user_summary',
      `${baseId}-summary`,
      'Family Summary',
      'Brief summary of family history and parents occupation is required',
    )
  }

  // --- PART 4: Photographs ---
  if (!form.full_image) {
    addError(
      'full_image',
      `${baseId}-full-image-group`,
      'Full Length Photograph',
      'Full length photograph is required',
    )
  }

  if (!form.face_image) {
    addError(
      'face_image',
      `${baseId}-face-image-group`,
      'Full Face Photograph',
      'Full face photograph is required',
    )
  }

  // --- PART 5: Terms & Conditions ---
  if (!form.agree_terms) {
    addError(
      'agree_terms',
      `${baseId}-agree-terms`,
      'Terms & Conditions',
      'You must agree to the Terms & Conditions before submitting',
    )
  }

  const firstField = errorList.length > 0 ? errorList[0] : null
  return { errors, firstField, errorList }
}

/**
 * Check if form is complete according to the API spec field set only.
 * Used to enable/disable the submit action.
 */
export function isRegistrationFormComplete(
  form: RegistrationFormData,
  _conditions: RegistrationConditions,
): boolean {
  // Basic Details
  if (!form.name.trim() || form.name.trim().length < 2) return false
  if (!form.gender) return false
  if (!form.date_of_birth || isCandidateUnderage(form.date_of_birth)) return false
  if (!form.time_of_birth) return false
  if (!form.place_of_birth.trim()) return false
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false

  // Education & Profession
  if (!form.education_id) return false
  if (!form.profession_id) return false

  // Community, Gotra & Physical
  if (!form.community_id || !form.gotra_id) return false
  if (!form.height_feet || !form.height_inch) return false
  if (!form.physical_disablity) return false
  if (form.marry_in_community.length === 0) return false

  // Marital Status
  if (!form.married_before) return false

  // Family & Address
  if (!form.father_name.trim()) return false
  if (!form.user_address.trim()) return false
  if (!form.house_type) return false
  if (!form.user_current_city.trim()) return false

  // Contacts
  if (!form.contact_name.trim()) return false
  if (!form.mobile || form.mobile.length !== 10) return false
  if (!form.alternate_contact_name.trim()) return false
  if (form.alternate_mobile_no && !/^[6-9]\d{9}$/.test(form.alternate_mobile_no)) return false

  // Preferences & Horoscope
  if (!form.will_marry_same_gotra) return false
  if (!form.is_manglik) return false
  if (!form.will_marry_manglik) return false

  // Summary, Photos & Terms
  if (!form.user_summary.trim()) return false
  if (!form.full_image || !form.face_image) return false
  if (!form.agree_terms) return false

  return true
}
