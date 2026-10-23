/**
 * @file src/module/registration/components/registration-form/validation.ts
 * Pure validation logic for the registration form, split out of the former
 * 2,400-line RegistrationForm.tsx for maintainability.
 */

import type { RegistrationFormData } from '../../types'
import { isCandidateUnderage, minAgeForGender } from './constants'
import {
  validateName,
  validateEmail,
  validateIndianMobile,
  validateCity,
  validateAddress,
  validateCompany,
  validateSafeText,
} from '@/lib/validation'

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
  const nameCheck = validateName(form.name, 'Candidate Full Name', true, 2, 50)
  if (!nameCheck.valid && nameCheck.error) {
    addError('name', `${baseId}-name`, 'Full Name', nameCheck.error)
  }

  if (!form.gender) {
    addError('gender', `${baseId}-gender`, 'Gender', 'Please select gender')
  }

  if (!form.date_of_birth) {
    addError('date_of_birth', `${baseId}-dob`, 'Date of Birth', 'Date of birth is required')
  } else if (isCandidateUnderage(form.date_of_birth, form.gender)) {
    addError(
      'date_of_birth',
      `${baseId}-dob`,
      'Date of Birth',
      `Candidate must be at least ${minAgeForGender(form.gender)} years old to register`,
    )
  }

  if (!form.time_of_birth) {
    addError('time_of_birth', `${baseId}-birthtime`, 'Time of Birth', 'Time of birth is required')
  }

  const pobCheck = validateCity(form.place_of_birth, 'Place of Birth', true)
  if (!pobCheck.valid && pobCheck.error) {
    addError('place_of_birth', `${baseId}-pob`, 'Place of Birth', pobCheck.error)
  }

  // Email is optional per the API spec — validated for format when provided.
  const emailCheck = validateEmail(form.email, false, 'Email Address')
  if (!emailCheck.valid && emailCheck.error) {
    addError('email', `${baseId}-email`, 'Email Address', emailCheck.error)
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

  // Optional company fields checked when provided
  const compCheck = validateCompany(form.company_name, 'Company Name', false)
  if (!compCheck.valid && compCheck.error) {
    addError('company_name', `${baseId}-company-name`, 'Company Name', compCheck.error)
  }

  const compTypeCheck = validateCompany(form.company_type, 'Company Type', false)
  if (!compTypeCheck.valid && compTypeCheck.error) {
    addError('company_type', `${baseId}-company-type`, 'Company Type', compTypeCheck.error)
  }

  const fatherCheck = validateName(form.father_name, "Father's Name", true, 2, 50)
  if (!fatherCheck.valid && fatherCheck.error) {
    addError('father_name', `${baseId}-father`, "Father's Name", fatherCheck.error)
  }

  const motherCheck = validateName(form.mother_name, "Mother's Name", false, 2, 50)
  if (!motherCheck.valid && motherCheck.error) {
    addError('mother_name', `${baseId}-mother`, "Mother's Name", motherCheck.error)
  }

  const addrCheck = validateAddress(form.user_address, 'Residential Address', true)
  if (!addrCheck.valid && addrCheck.error) {
    addError('user_address', `${baseId}-address`, 'Residential Address', addrCheck.error)
  }

  if (!form.house_type) {
    addError(
      'house_type',
      `${baseId}-house-type-group`,
      'House Type',
      'Please select house ownership type (Own or Rent)',
    )
  }

  const cityCheck = validateCity(form.user_current_city, 'Present City', true)
  if (!cityCheck.valid && cityCheck.error) {
    addError('user_current_city', `${baseId}-current-city`, 'Present City', cityCheck.error)
  }

  const contactCheck = validateName(form.contact_name, 'Main Contact Person', true, 2, 50)
  if (!contactCheck.valid && contactCheck.error) {
    addError('contact_name', `${baseId}-contact-name`, 'Main Contact Person', contactCheck.error)
  }

  const mobileCheck = validateIndianMobile(form.mobile, true, 'Main Contact Mobile')
  if (!mobileCheck.valid && mobileCheck.error) {
    addError('mobile', `${baseId}-contact-mobile`, 'Main Contact Mobile', mobileCheck.error)
  }

  const altContactCheck = validateName(form.alternate_contact_name, 'Alternate Contact Person', true, 2, 50)
  if (!altContactCheck.valid && altContactCheck.error) {
    addError('alternate_contact_name', `${baseId}-alt-name`, 'Alternate Contact Person', altContactCheck.error)
  }

  // Alternate mobile is optional per the API spec — validated when provided.
  const altMobileCheck = validateIndianMobile(form.alternate_mobile_no, false, 'Alternate Contact Mobile')
  if (!altMobileCheck.valid && altMobileCheck.error) {
    addError('alternate_mobile_no', `${baseId}-alt-mobile`, 'Alternate Contact Mobile', altMobileCheck.error)
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
  const summaryCheck = validateSafeText(form.user_summary, 'Family Summary', false, 10, 500)
  if (!summaryCheck.valid && summaryCheck.error) {
    addError('user_summary', `${baseId}-summary`, 'Family Summary', summaryCheck.error)
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
  if (!validateName(form.name, 'Full Name', true, 2, 50).valid) return false
  if (!form.gender) return false
  if (!form.date_of_birth || isCandidateUnderage(form.date_of_birth, form.gender)) return false
  if (!form.time_of_birth) return false
  if (!validateCity(form.place_of_birth, 'Place of Birth', true).valid) return false
  if (!validateEmail(form.email, false, 'Email Address').valid) return false

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
  if (!validateName(form.father_name, "Father's Name", true, 2, 50).valid) return false
  if (!validateAddress(form.user_address, 'Residential Address', true).valid) return false
  if (!form.house_type) return false
  if (!validateCity(form.user_current_city, 'Present City', true).valid) return false

  // Contacts
  if (!validateName(form.contact_name, 'Main Contact Person', true, 2, 50).valid) return false
  if (!validateIndianMobile(form.mobile, true, 'Main Contact Mobile').valid) return false
  if (!validateName(form.alternate_contact_name, 'Alternate Contact Person', true, 2, 50).valid) return false
  if (!validateIndianMobile(form.alternate_mobile_no, false, 'Alternate Contact Mobile').valid) return false

  // Preferences & Horoscope
  if (!form.will_marry_same_gotra) return false
  if (!form.is_manglik) return false
  if (!form.will_marry_manglik) return false

  // Summary, Photos & Terms
  if (!validateSafeText(form.user_summary, 'Family Summary', false, 10, 500).valid) return false
  if (!form.full_image || !form.face_image) return false
  if (!form.agree_terms) return false

  return true
}
