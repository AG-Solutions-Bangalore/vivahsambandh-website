/**
 * @file src/module/registration/components/RegistrationForm.tsx
 * Complete VivahSambandh Registration Form implementing every dynamic condition,
 * interactive auto-focus & smooth scrolling on missing/invalid fields,
 * shadcn-style Date & Time pickers, inline error feedback, and live completion progress.
 */

import { useState, useEffect, useId, useMemo, type ChangeEvent, type FormEvent } from 'react'
import {
  getEducation,
  getCommunity,
  getGotra,
  getProfession,
  createUserRegister,
} from '../api/registration.api'
import type {
  EducationItem,
  CommunityItem,
  GotraItem,
  ProfessionItem,
  RegistrationFormData,
} from '../types'
import ImageCropModal from './ImageCropModal'
import TermsModal from './TermsModal'
import OtpVerificationModal from './OtpVerificationModal'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { FormSelect } from '@/components/ui/form-select'
import { OptionPills, YesNoPills } from '@/components/ui/option-pills'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from 'cn'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'

const initialFormState: RegistrationFormData = {
  name: '',
  gender: '',
  date_of_birth: '',
  time_of_birth: '',
  place_of_birth: '',
  email: '',

  education_id: '',
  education_other: '',
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
  num_years_at_address: '',
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
  match_ganna: '',
  is_manglik: '',
  will_marry_manglik: '',
  older_by: '',
  younger_by: '',
  bride_budget: '',
  groom_budget: '',
  work_after_marriage: '',
  residence_after_marriage: '',

  user_summary: '',

  full_image: null,
  face_image: null,
  full_image_preview: '',
  face_image_preview: '',

  agree_terms: false,
}

// Calculate if candidate is under 21 years old
function isCandidateUnderage(dobStr: string): boolean {
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
  return age < 21
}

interface ErrorSummaryItem {
  key: string
  id: string
  label: string
  error: string
}

export default function RegistrationForm() {
  const baseId = useId()
  const [form, setForm] = useState<RegistrationFormData>(initialFormState)

  // Remote dropdown items
  const [educations, setEducations] = useState<EducationItem[]>([])
  const [communities, setCommunities] = useState<CommunityItem[]>([])
  const [professions, setProfessions] = useState<ProfessionItem[]>([])
  const [gotras, setGotras] = useState<GotraItem[]>([])
  const [loadingGotras, setLoadingGotras] = useState(false)

  // Modals state
  const [termsOpen, setTermsOpen] = useState(false)
  const [cropTarget, setCropTarget] = useState<'full' | 'face' | null>(null)
  const [cropRawSrc, setCropRawSrc] = useState<string | null>(null)

  // Mobile OTP Verification State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isMobileVerified, setIsMobileVerified] = useState(false)
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState('')

  // Status and Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Load initial dropdowns
  useEffect(() => {
    let active = true
    Promise.all([getEducation(), getCommunity(), getProfession()])
      .then(([eduList, commList, profList]) => {
        if (!active) return
        setEducations(eduList)
        setCommunities(commList)
        setProfessions(profList)
      })
      .catch((err) => {
        console.error('Failed to load form options:', err)
      })
    return () => {
      active = false
    }
  }, [])

  // Helper: Find selected profession details
  const selectedProfession = professions.find(
    (p) => String(p.id) === form.profession_id,
  )
  const profName = selectedProfession?.profession_name ?? ''

  // Condition 2: Profession conditions
  const isEmployed =
    profName.includes('Employed in Private') || profName.includes('Employed in Govt')
  const isBusiness =
    profName.includes('Family Business') || profName.includes('Own Business')
  const isSelfEmployed = profName.includes('Self Employed')
  const isOtherProfession = profName.includes('Others')
  const showIncome = isEmployed || isBusiness || isSelfEmployed || isOtherProfession

  // Condition 1: Education "Other" condition
  const selectedEdu = educations.find((e) => String(e.id) === form.education_id)
  const showEduOther =
    selectedEdu?.education_name.toLowerCase() === 'other' || form.education_id === '32'

  // Condition 3: Marital status condition
  const isDivorced = form.married_before === 'Yes and Divorced'
  const isWidowed = form.married_before === 'Yes and Spouse died'
  const hasPriorMarriage = isDivorced || isWidowed
  const childrenCount = parseInt(form.children_from_prior_marriage || '0', 10)
  const showChildrenWith = hasPriorMarriage && childrenCount >= 1

  // Condition 4: Gender condition
  const isMale = form.gender === 'Male'

  // Clear single field error
  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Input handlers
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    clearFieldError(name)

    if (name === 'community_id') {
      setForm((prev) => ({ ...prev, [name]: value, gotra_id: '' }))
      clearFieldError('gotra_id')
      if (!value) {
        setGotras([])
        setLoadingGotras(false)
      } else {
        setLoadingGotras(true)
        getGotra(value)
          .then((data) => {
            setGotras(data)
            setLoadingGotras(false)
          })
          .catch((err) => {
            console.error('Failed to fetch gotras:', err)
            setLoadingGotras(false)
          })
      }
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumericInput = (
    e: ChangeEvent<HTMLInputElement>,
    maxVal?: number,
  ) => {
    const { name, value } = e.target
    let sanitized = value.replace(/\D/g, '')
    if (maxVal !== undefined && sanitized !== '') {
      const num = parseInt(sanitized, 10)
      if (num > maxVal) sanitized = String(maxVal)
    }
    clearFieldError(name)
    if (name === 'mobile' && isMobileVerified && sanitized !== verifiedMobileNumber) {
      setIsMobileVerified(false)
      setVerifiedMobileNumber('')
    }
    setForm((prev) => ({ ...prev, [name]: sanitized }))
  }

  const handleCommunityPreferenceToggle = (commName: string) => {
    clearFieldError('marry_in_community')
    setForm((prev) => {
      const current = prev.marry_in_community
      if (current.includes(commName)) {
        return {
          ...prev,
          marry_in_community: current.filter((c) => c !== commName),
        }
      }
      return {
        ...prev,
        marry_in_community: [...current, commName],
      }
    })
  }

  // File selection for image cropping
  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>,
    target: 'full' | 'face',
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropRawSrc(reader.result as string)
      setCropTarget(target)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (cropTarget === 'full') {
      clearFieldError('full_image')
      setForm((prev) => ({
        ...prev,
        full_image: croppedFile,
        full_image_preview: previewUrl,
      }))
    } else if (cropTarget === 'face') {
      clearFieldError('face_image')
      setForm((prev) => ({
        ...prev,
        face_image: croppedFile,
        face_image_preview: previewUrl,
      }))
    }
  }

  // Focus and smooth-scroll directly to target field
  const focusAndScrollToField = (elementId: string) => {
    const el = document.getElementById(elementId)
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Allow smooth scroll to settle then focus target control
    setTimeout(() => {
      if (
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(el.tagName) &&
        typeof el.focus === 'function'
      ) {
        ;(el as HTMLElement).focus({ preventScroll: true })
      } else {
        const focusable = el.querySelector<HTMLElement>(
          'input, select, textarea, button',
        )
        if (focusable && typeof focusable.focus === 'function') {
          focusable.focus({ preventScroll: true })
        }
      }
    }, 150)
  }

  // Form Validation Engine in Visual Top-to-Bottom Order
  const runValidation = (): {
    errors: Record<string, string>
    firstField: ErrorSummaryItem | null
    errorList: ErrorSummaryItem[]
  } => {
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

    if (!form.email.trim()) {
      addError('email', `${baseId}-email`, 'Email Address', 'Email address is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      addError('email', `${baseId}-email`, 'Email Address', 'Please enter a valid email address')
    }

    if (!form.education_id) {
      addError('education_id', `${baseId}-edu`, 'Education', 'Please select education qualification')
    }

    if (showEduOther && !form.education_other?.trim()) {
      addError(
        'education_other',
        `${baseId}-edu-other`,
        'Other Education',
        'Please specify your degree / qualification',
      )
    }

    if (!form.profession_id) {
      addError('profession_id', `${baseId}-profession`, 'Profession', 'Please select profession')
    }

    if (isEmployed) {
      if (!form.company_name.trim()) {
        addError('company_name', `${baseId}-company`, 'Company Name', 'Company name is required')
      }
      if (!form.company_type.trim()) {
        addError('company_type', `${baseId}-company-type`, 'Company Type', 'Company type is required')
      }
    }

    if (isBusiness) {
      if (!form.company_name.trim()) {
        addError('company_name', `${baseId}-biz-name`, 'Business Name', 'Business name is required')
      }
      if (!form.company_type.trim()) {
        addError('company_type', `${baseId}-biz-type`, 'Business Type', 'Business type is required')
      }
    }

    if (isOtherProfession && !form.company_name.trim()) {
      addError(
        'company_name',
        `${baseId}-other-prof`,
        'Other Profession',
        'Please specify your profession details',
      )
    }

    if (showIncome && !form.annual_income) {
      addError('annual_income', `${baseId}-income`, 'Annual Income', 'Annual income is required')
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

    if (isDivorced && !form.divorce_status) {
      addError(
        'divorce_status',
        `${baseId}-divorce-status`,
        'Divorce Status',
        'Please specify divorce decree status',
      )
    }

    if (showChildrenWith && !form.children_with) {
      addError(
        'children_with',
        `${baseId}-children-with`,
        'Children Residing With',
        'Please specify where children reside',
      )
    }

    if (!form.father_name.trim()) {
      addError('father_name', `${baseId}-father`, "Father's Name", "Father's name is required")
    }

    if (!form.mother_name.trim()) {
      addError('mother_name', `${baseId}-mother`, "Mother's Name", "Mother's name is required")
    }

    if (!form.user_address.trim()) {
      addError(
        'user_address',
        `${baseId}-address`,
        'Residential Address',
        'Residential address is required',
      )
    }

    if (!form.num_years_at_address) {
      addError(
        'num_years_at_address',
        `${baseId}-years-addr`,
        'Years at Address',
        'Number of years at address is required',
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

    if (!form.alternate_mobile_no) {
      addError(
        'alternate_mobile_no',
        `${baseId}-alt-mobile`,
        'Alternate Contact Mobile',
        'Alternate 10-digit mobile number is required',
      )
    } else if (form.alternate_mobile_no.length !== 10) {
      addError(
        'alternate_mobile_no',
        `${baseId}-alt-mobile`,
        'Alternate Contact Mobile',
        'Alternate mobile number must be exactly 10 digits',
      )
    } else if (!/^[6-9]\d{9}$/.test(form.alternate_mobile_no)) {
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

    if (!form.match_ganna) {
      addError(
        'match_ganna',
        `${baseId}-match-ganna-group`,
        'Matching Ganna',
        'Please specify matching Janampatri/Ganna preference',
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

    if (!form.older_by) {
      addError('older_by', `${baseId}-older-by`, 'Older By Years', 'Spouse older by preference is required')
    }

    if (!form.younger_by) {
      addError('younger_by', `${baseId}-younger-by`, 'Younger By Years', 'Spouse younger by preference is required')
    }

    if (!form.bride_budget) {
      addError('bride_budget', `${baseId}-bride-budget`, 'Bride Budget', 'Expected bride budget range is required')
    }

    // --- PART 3: Family History & Summary ---
    if (!form.user_summary.trim()) {
      addError(
        'user_summary',
        `${baseId}-summary`,
        'Family Summary',
        'Brief summary of family history and parents occupation is required',
      )
    } else if (form.user_summary.trim().length < 10) {
      addError(
        'user_summary',
        `${baseId}-summary`,
        'Family Summary',
        'Please provide at least 10 characters describing family history',
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

  // Check if form is 100% complete according to all dynamic conditions
  const isFormFullyFilled = useMemo(() => {
    // Basic Details
    if (!form.name.trim() || form.name.trim().length < 2) return false
    if (!form.gender) return false
    if (!form.date_of_birth || isCandidateUnderage(form.date_of_birth)) return false
    if (!form.time_of_birth) return false
    if (!form.place_of_birth.trim()) return false
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return false

    // Education & Profession
    if (!form.education_id) return false
    if (showEduOther && !form.education_other?.trim()) return false
    if (!form.profession_id) return false
    if (isEmployed) {
      if (!form.company_name.trim() || !form.company_type.trim()) return false
    }
    if (isBusiness) {
      if (!form.company_name.trim() || !form.company_type.trim()) return false
    }
    if (isOtherProfession && !form.company_name.trim()) return false
    if (showIncome && !form.annual_income) return false

    // Community, Gotra & Physical
    if (!form.community_id || !form.gotra_id) return false
    if (!form.height_feet || !form.height_inch) return false
    if (!form.physical_disablity) return false
    if (form.marry_in_community.length === 0) return false

    // Marital Status
    if (!form.married_before) return false
    if (isDivorced && !form.divorce_status) return false
    if (showChildrenWith && !form.children_with) return false

    // Parents & Siblings
    if (!form.father_name.trim() || !form.mother_name.trim()) return false

    // Address & Contacts
    if (!form.user_address.trim()) return false
    if (!form.num_years_at_address) return false
    if (!form.house_type) return false
    if (!form.user_current_city.trim()) return false
    if (!form.contact_name.trim()) return false
    if (!form.mobile || form.mobile.length !== 10) return false
    if (!form.alternate_contact_name.trim()) return false
    if (!form.alternate_mobile_no || form.alternate_mobile_no.length !== 10) return false

    // Preferences & Horoscope
    if (!form.will_marry_same_gotra) return false
    if (!form.match_ganna) return false
    if (!form.is_manglik) return false
    if (!form.will_marry_manglik) return false
    if (!form.older_by) return false
    if (!form.younger_by) return false
    if (!form.bride_budget) return false
    if (isMale && !form.groom_budget) return false

    // Summary, Photos & Terms
    if (!form.user_summary.trim() || form.user_summary.trim().length < 10) return false
    if (!form.full_image || !form.face_image) return false
    if (!form.agree_terms) return false

    return true
  }, [
    form,
    showEduOther,
    isEmployed,
    isBusiness,
    isOtherProfession,
    showIncome,
    isDivorced,
    showChildrenWith,
    isMale,
  ])

  // "Check Any Unfilled Details" Button Action
  const handleValidateClick = () => {
    const { errors, firstField } = runValidation()
    setFieldErrors(errors)

    if (firstField) {
      focusAndScrollToField(firstField.id)
    } else {
      setSubmitResult({
        type: 'success',
        message: 'All required details are filled! You can now review and submit your registration.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Core Form Submission to CRM Backend API
  const executeFormSubmission = async () => {
    setIsSubmitting(true)
    setSubmitResult(null)

    // Assemble FormData matching API specification in Postman Collection
    const formData = new FormData()
    formData.append('name', form.name.trim())
    formData.append('gender', form.gender)
    formData.append('date_of_birth', form.date_of_birth)
    formData.append('time_of_birth', form.time_of_birth)
    formData.append('place_of_birth', form.place_of_birth.trim())
    formData.append('email', form.email.trim())
    formData.append('education_id', form.education_id)
    if (form.education_other?.trim()) {
      formData.append('education_other', form.education_other.trim())
    }
    formData.append('profession_id', form.profession_id)
    formData.append('company_name', form.company_name.trim())
    formData.append('company_type', form.company_type.trim())
    formData.append('annual_income', form.annual_income)
    formData.append('height_feet', form.height_feet)
    formData.append('height_inch', form.height_inch)
    formData.append('father_name', form.father_name.trim())
    formData.append('mother_name', form.mother_name.trim())
    formData.append('brother_married', form.brother_married || '0')
    formData.append('brother_un_married', form.brother_un_married || '0')
    formData.append('sister_married', form.sister_married || '0')
    formData.append('sister_un_married', form.sister_un_married || '0')
    formData.append('user_address', form.user_address.trim())
    formData.append('num_years_at_address', form.num_years_at_address)
    formData.append('house_type', form.house_type)
    formData.append('user_current_city', form.user_current_city.trim())
    formData.append('contact_name', form.contact_name.trim())
    formData.append('mobile', form.mobile)
    formData.append('alternate_contact_name', form.alternate_contact_name.trim())
    formData.append('alternate_mobile_no', form.alternate_mobile_no)
    formData.append('community_id', form.community_id)
    formData.append('gotra_id', form.gotra_id)
    formData.append('marry_in_community', form.marry_in_community.join(','))
    formData.append('physical_disablity', form.physical_disablity)
    formData.append('married_before', form.married_before)
    if (isDivorced && form.divorce_status) {
      formData.append('divorce_status', form.divorce_status)
    }
    if (hasPriorMarriage && form.children_from_prior_marriage) {
      formData.append(
        'children_from_prior_marriage',
        form.children_from_prior_marriage,
      )
    }
    if (showChildrenWith && form.children_with) {
      formData.append('children_with', form.children_with)
    }
    formData.append('will_marry_same_gotra', form.will_marry_same_gotra)
    formData.append('is_manglik', form.is_manglik)
    formData.append('will_marry_manglik', form.will_marry_manglik)
    formData.append('user_summary', form.user_summary.trim())

    // Append cropped image files
    if (form.full_image) {
      formData.append('full_image', form.full_image)
    }
    if (form.face_image) {
      formData.append('face_image', form.face_image)
    }

    try {
      const res = await createUserRegister(formData)
      if (res.success) {
        setSubmitResult({
          type: 'success',
          message:
            'Your bio-data registration has been submitted successfully! Our committee will review your profile within 24 to 48 hours.',
        })
        setForm(initialFormState)
        setFieldErrors({})
        setIsMobileVerified(false)
        setVerifiedMobileNumber('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitResult({
          type: 'error',
          message: res.message || 'Submission could not be completed.',
        })
      }
    } catch (err) {
      setSubmitResult({
        type: 'error',
          message: err instanceof Error ? err.message : 'An error occurred during submission.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Form Submission Trigger: Validates form, then requires mobile OTP verification before submitting
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitResult(null)

    // Step 1: Validate all form fields first
    const { errors, firstField } = runValidation()
    setFieldErrors(errors)

    if (firstField) {
      focusAndScrollToField(firstField.id)
      return
    }

    // Step 2: Ensure Main Contact Mobile is verified via Firebase OTP
    const isCurrentMobileVerified =
      isMobileVerified && form.mobile === verifiedMobileNumber
    if (!isCurrentMobileVerified) {
      setIsOtpModalOpen(true)
      return
    }

    // Step 3: Execute submission
    await executeFormSubmission()
  }

  // Callback when OTP verification succeeds inside the modal
  const handleOtpVerified = () => {
    setIsMobileVerified(true)
    setVerifiedMobileNumber(form.mobile)
    setIsOtpModalOpen(false)
    // Automatically submit now that mobile is verified
    executeFormSubmission()
  }

  // Dynamic CSS helper based on field validation status (shadcn-aligned brand style)
  const inputCls = (key: string) =>
    cn(
      'w-full rounded-xl border px-4 py-2.5 text-sm text-navy-900 transition outline-none focus-visible:ring-2',
      fieldErrors[key]
        ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
        : 'border-cream-300 bg-cream-50/70 hover:bg-white focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20',
    )

  // Shared select-change handler (clears error + supports community→gotra cascade)
  const handleSelectChange = (name: string) => (value: string) => {
    clearFieldError(name)
    if (name === 'community_id') {
      setForm((prev) => ({ ...prev, community_id: value, gotra_id: '' }))
      clearFieldError('gotra_id')
      if (!value) {
        setGotras([])
        setLoadingGotras(false)
      } else {
        setLoadingGotras(true)
        getGotra(value)
          .then((data) => {
            setGotras(data)
            setLoadingGotras(false)
          })
          .catch((err) => {
            console.error('Failed to fetch gotras:', err)
            setLoadingGotras(false)
          })
      }
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Shared pill/radio-change handler
  const handlePillChange = (name: string) => (value: string) => {
    clearFieldError(name)
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Select option lists (memoized from API data)
  const educationOptions = useMemo(
    () => educations.map((item) => ({ value: String(item.id), label: item.education_name })),
    [educations],
  )
  const professionOptions = useMemo(
    () => professions.map((item) => ({ value: String(item.id), label: item.profession_name })),
    [professions],
  )
  const communityOptions = useMemo(
    () => communities.map((c) => ({ value: String(c.id), label: c.community_name })),
    [communities],
  )
  const gotraOptions = useMemo(
    () => gotras.map((g) => ({ value: String(g.id), label: g.gotra_name })),
    [gotras],
  )

  return (
    <TooltipProvider delay={150}>
      <div className="mx-auto max-w-5xl">
      {/* Success / Error notification */}
      {submitResult && (
        <div
          className={`mb-8 rounded-2xl p-6 shadow-lift ${
            submitResult.type === 'success'
              ? 'border border-emerald-500/30 bg-emerald-50/90 text-emerald-950'
              : 'border border-maroon-500/30 bg-maroon-50/90 text-maroon-950'
          }`}
        >
          <div className="flex items-start gap-3">
            {submitResult.type === 'success' ? (
              <svg className="h-6 w-6 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-maroon-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div>
              <h4 className="font-bold text-base">
                {submitResult.type === 'success' ? 'Registration Completed' : 'Submission Note'}
              </h4>
              <p className="mt-1 text-sm">{submitResult.message}</p>
            </div>
          </div>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="space-y-10">
        {/* SECTION 1: Personal & Family Details */}
        <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
          <div className="mb-6 border-b border-cream-200 pb-4">
            <span className="eyebrow">Part 1</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
              Personal & Family Details
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Basic identification, educational qualifications, background, and family records.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Full Name */}
            <Field id={`${baseId}-name`} label="Full Name" required error={fieldErrors.name}>
              <Input
                id={`${baseId}-name`}
                type="text"
                name="name"
                maxLength={45}
                value={form.name}
                onChange={handleInputChange}
                placeholder="Candidate Full Name"
                className={inputCls('name')}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? `${baseId}-name-error` : undefined}
              />
            </Field>

            {/* Gender */}
            <Field id={`${baseId}-gender`} label="Gender" required error={fieldErrors.gender}>
              <FormSelect
                id={`${baseId}-gender`}
                value={form.gender}
                onValueChange={handleSelectChange('gender')}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
                placeholder="Select Gender"
                error={Boolean(fieldErrors.gender)}
                aria-invalid={Boolean(fieldErrors.gender)}
              />
            </Field>

            {/* Date of Birth with shadcn-styled DatePicker */}
            <div id={`${baseId}-dob`}>
              <Field id={`${baseId}-dob-day`} label="Date of Birth" required error={fieldErrors.date_of_birth}>
                <DatePicker
                  id={`${baseId}-dob`}
                  value={form.date_of_birth}
                  onChange={(dateStr) => {
                    setForm((prev) => ({ ...prev, date_of_birth: dateStr }))
                    clearFieldError('date_of_birth')
                  }}
                  error={Boolean(fieldErrors.date_of_birth)}
                />
              </Field>
            </div>

            {/* Time of Birth with shadcn-styled TimePicker */}
            <div id={`${baseId}-birthtime`}>
              <Field id={`${baseId}-birthtime-hour`} label="Time of Birth" required error={fieldErrors.time_of_birth}>
                <TimePicker
                  id={`${baseId}-birthtime`}
                  value={form.time_of_birth}
                  onChange={(timeStr) => {
                    setForm((prev) => ({ ...prev, time_of_birth: timeStr }))
                    clearFieldError('time_of_birth')
                  }}
                  error={Boolean(fieldErrors.time_of_birth)}
                />
              </Field>
            </div>

            {/* Place of Birth */}
            <Field id={`${baseId}-pob`} label="Place of Birth" required error={fieldErrors.place_of_birth}>
              <Input
                id={`${baseId}-pob`}
                type="text"
                name="place_of_birth"
                maxLength={25}
                value={form.place_of_birth}
                onChange={handleInputChange}
                placeholder="City / District"
                className={inputCls('place_of_birth')}
                aria-invalid={Boolean(fieldErrors.place_of_birth)}
              />
            </Field>

            {/* Email Address */}
            <Field id={`${baseId}-email`} label="Email Address" required error={fieldErrors.email}>
              <Input
                id={`${baseId}-email`}
                type="email"
                name="email"
                maxLength={65}
                value={form.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className={inputCls('email')}
                aria-invalid={Boolean(fieldErrors.email)}
              />
            </Field>

            {/* Education Qualification (API Dropdown) */}
            <Field id={`${baseId}-edu`} label="Education" required error={fieldErrors.education_id}>
              <FormSelect
                id={`${baseId}-edu`}
                value={form.education_id}
                onValueChange={handleSelectChange('education_id')}
                options={educationOptions}
                placeholder="Select Qualification"
                error={Boolean(fieldErrors.education_id)}
                searchable
                searchPlaceholder="Search qualification..."
                aria-invalid={Boolean(fieldErrors.education_id)}
              />
            </Field>

            {/* Condition 1: Other Education */}
            {showEduOther && (
              <div className="animate-fade-in">
                <Field id={`${baseId}-edu-other`} label="Other Education" required error={fieldErrors.education_other}>
                  <Input
                    id={`${baseId}-edu-other`}
                    type="text"
                    name="education_other"
                    maxLength={25}
                    value={form.education_other}
                    onChange={handleInputChange}
                    placeholder="Specify Degree / Course"
                    className={inputCls('education_other')}
                    aria-invalid={Boolean(fieldErrors.education_other)}
                  />
                </Field>
              </div>
            )}

            {/* Profession (API Dropdown) */}
            <Field id={`${baseId}-profession`} label="Profession" required error={fieldErrors.profession_id}>
              <FormSelect
                id={`${baseId}-profession`}
                value={form.profession_id}
                onValueChange={handleSelectChange('profession_id')}
                options={professionOptions}
                placeholder="Select Profession"
                error={Boolean(fieldErrors.profession_id)}
                searchable
                searchPlaceholder="Search profession..."
                aria-invalid={Boolean(fieldErrors.profession_id)}
              />
            </Field>

            {/* Condition 2: Dynamic fields based on Profession */}
            {isEmployed && (
              <>
                <div className="animate-fade-in">
                  <Field id={`${baseId}-company`} label="Company Name" required error={fieldErrors.company_name}>
                    <Input
                      id={`${baseId}-company`}
                      type="text"
                      name="company_name"
                      maxLength={45}
                      value={form.company_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Infosys, TCS, Govt Dept"
                      className={inputCls('company_name')}
                      aria-invalid={Boolean(fieldErrors.company_name)}
                    />
                  </Field>
                </div>
                <div className="animate-fade-in">
                  <Field id={`${baseId}-company-type`} label="Company Type" required error={fieldErrors.company_type}>
                    <Input
                      id={`${baseId}-company-type`}
                      type="text"
                      name="company_type"
                      maxLength={45}
                      value={form.company_type}
                      onChange={handleInputChange}
                      placeholder="e.g. IT, Banking, PSU"
                      className={inputCls('company_type')}
                      aria-invalid={Boolean(fieldErrors.company_type)}
                    />
                  </Field>
                </div>
              </>
            )}

            {isBusiness && (
              <>
                <div className="animate-fade-in">
                  <Field id={`${baseId}-biz-name`} label="Business Name" required error={fieldErrors.company_name}>
                    <Input
                      id={`${baseId}-biz-name`}
                      type="text"
                      name="company_name"
                      maxLength={45}
                      value={form.company_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Agarwal Traders"
                      className={inputCls('company_name')}
                      aria-invalid={Boolean(fieldErrors.company_name)}
                    />
                  </Field>
                </div>
                <div className="animate-fade-in">
                  <Field id={`${baseId}-biz-type`} label="Business Type" required error={fieldErrors.company_type}>
                    <Input
                      id={`${baseId}-biz-type`}
                      type="text"
                      name="company_type"
                      maxLength={45}
                      value={form.company_type}
                      onChange={handleInputChange}
                      placeholder="e.g. Retail, Wholesale, Manufacturing"
                      className={inputCls('company_type')}
                      aria-invalid={Boolean(fieldErrors.company_type)}
                    />
                  </Field>
                </div>
              </>
            )}

            {isOtherProfession && (
              <div className="animate-fade-in">
                <Field id={`${baseId}-other-prof`} label="Other Profession" required error={fieldErrors.company_name}>
                  <Input
                    id={`${baseId}-other-prof`}
                    type="text"
                    name="company_name"
                    maxLength={45}
                    value={form.company_name}
                    onChange={handleInputChange}
                    placeholder="Specify Profession"
                    className={inputCls('company_name')}
                    aria-invalid={Boolean(fieldErrors.company_name)}
                  />
                </Field>
              </div>
            )}

            {showIncome && (
              <div className="animate-fade-in">
                <Field
                  id={`${baseId}-income`}
                  label="Annual Income (in Lakhs)"
                  required
                  hint="Max 300"
                  error={fieldErrors.annual_income}
                >
                  <Input
                    id={`${baseId}-income`}
                    type="text"
                    name="annual_income"
                    maxLength={3}
                    value={form.annual_income}
                    onChange={(e) => handleNumericInput(e, 300)}
                    placeholder="e.g. 15"
                    className={inputCls('annual_income')}
                    aria-invalid={Boolean(fieldErrors.annual_income)}
                  />
                </Field>
              </div>
            )}

            {/* My Community (API Dropdown) */}
            <Field id={`${baseId}-community`} label="My Community" required error={fieldErrors.community_id}>
              <FormSelect
                id={`${baseId}-community`}
                value={form.community_id}
                onValueChange={handleSelectChange('community_id')}
                options={communityOptions}
                placeholder="Select Community"
                error={Boolean(fieldErrors.community_id)}
                searchable
                searchPlaceholder="Search community..."
                aria-invalid={Boolean(fieldErrors.community_id)}
              />
            </Field>

            {/* Gotra (Cascade loaded from Community) */}
            <Field id={`${baseId}-gotra`} label="Gotra" required error={fieldErrors.gotra_id}>
              <FormSelect
                id={`${baseId}-gotra`}
                value={form.gotra_id}
                onValueChange={handleSelectChange('gotra_id')}
                options={gotraOptions}
                placeholder="Select Gotra"
                error={Boolean(fieldErrors.gotra_id)}
                disabled={!form.community_id}
                loading={loadingGotras}
                loadingText="Loading Gotras..."
                disabledText="First select Community"
                searchable
                searchPlaceholder="Search gotra..."
                aria-invalid={Boolean(fieldErrors.gotra_id)}
              />
            </Field>

            {/* Height (Feet & Inches) */}
            <div>
              <span className="mb-1.5 block text-xs font-bold text-navy-900">
                Height <span className="text-maroon-600">*</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <FormSelect
                  id={`${baseId}-height-feet`}
                  value={form.height_feet}
                  onValueChange={handleSelectChange('height_feet')}
                  options={[
                    { value: '4', label: '4 ft' },
                    { value: '5', label: '5 ft' },
                    { value: '6', label: '6 ft' },
                    { value: '7', label: '7 ft' },
                  ]}
                  placeholder="Feet"
                  error={Boolean(fieldErrors.height_feet)}
                  aria-invalid={Boolean(fieldErrors.height_feet)}
                />
                <FormSelect
                  id={`${baseId}-height-inch`}
                  value={form.height_inch}
                  onValueChange={handleSelectChange('height_inch')}
                  options={[...Array(12).keys()].map((inch) => ({
                    value: String(inch),
                    label: `${inch} in`,
                  }))}
                  placeholder="Inch"
                  error={Boolean(fieldErrors.height_inch)}
                  aria-invalid={Boolean(fieldErrors.height_inch)}
                />
              </div>
              {(fieldErrors.height_feet || fieldErrors.height_inch) && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                  {fieldErrors.height_feet || fieldErrors.height_inch}
                </p>
              )}
            </div>

            {/* Physical Disability */}
            <Field
              id={`${baseId}-disability`}
              label="Physical Disability (if any)"
              required
              error={fieldErrors.physical_disablity}
            >
              <OptionPills
                id={`${baseId}-disability-pills`}
                name="physical_disablity"
                value={form.physical_disablity}
                onChange={handlePillChange('physical_disablity')}
                options={[
                  { value: 'No', label: 'No' },
                  { value: 'Yes', label: 'Yes' },
                ]}
                error={Boolean(fieldErrors.physical_disablity)}
              />
              {/* Hidden native select keeps the focus/scroll target id stable */}
              <select
                id={`${baseId}-disability`}
                name="physical_disablity"
                value={form.physical_disablity}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden
                tabIndex={-1}
              >
                <option value="">Please Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </Field>
          </div>

          {/* Community Preferences multi-select chips */}
          <div id={`${baseId}-comm-prefs`} className="mt-5 border-t border-cream-200 pt-5">
            <span className="mb-2 block text-xs font-bold text-navy-900">
              Community Preferences (Select eligible communities) <span className="text-maroon-600">*</span>
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Community preferences">
              {['Agarwal', 'Jain', 'Khandelwal', 'Maheshwari', 'Any of the Above'].map((comm) => {
                const selected = form.marry_in_community.includes(comm)
                return (
                  <button
                    key={comm}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleCommunityPreferenceToggle(comm)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-semibold transition outline-none active:scale-95',
                      'focus-visible:ring-2 focus-visible:ring-gold-500/40',
                      selected
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'border border-cream-300 bg-cream-50 text-navy-800 hover:border-gold-500/60 hover:bg-gold-50',
                    )}
                  >
                    {selected ? '✓ ' : '+ '}{comm}
                  </button>
                )
              })}
            </div>
            {fieldErrors.marry_in_community && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                {fieldErrors.marry_in_community}
              </p>
            )}
          </div>

          {/* Prior Marriage Condition */}
          <div className="mt-6 border-t border-cream-200 pt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id={`${baseId}-prior-marriage`}
                label="Have you been married before?"
                required
                error={fieldErrors.married_before}
              >
                <FormSelect
                  id={`${baseId}-prior-marriage`}
                  value={form.married_before}
                  onValueChange={handleSelectChange('married_before')}
                  options={[
                    { value: 'No', label: 'No (Never Married)' },
                    { value: 'Yes and Divorced', label: 'Yes and Divorced' },
                    { value: 'Yes and Spouse died', label: 'Yes and Spouse died' },
                  ]}
                  placeholder="Please Select"
                  error={Boolean(fieldErrors.married_before)}
                  aria-invalid={Boolean(fieldErrors.married_before)}
                />
              </Field>

              {/* Condition: Divorce Status */}
              {isDivorced && (
                <div className="animate-fade-in">
                  <Field
                    id={`${baseId}-divorce-status`}
                    label="Divorce Status"
                    required
                    error={fieldErrors.divorce_status}
                  >
                    <FormSelect
                      id={`${baseId}-divorce-status`}
                      value={form.divorce_status ?? ''}
                      onValueChange={handleSelectChange('divorce_status')}
                      options={[
                        { value: 'Decree in process', label: 'Decree in process' },
                        { value: 'Decree granted less than 6 months back', label: 'Decree granted less than 6 months back' },
                        { value: 'Decree granted less than 2 years back', label: 'Decree granted less than 2 years back' },
                        { value: 'Decree granted less than 5 years back', label: 'Decree granted less than 5 years back' },
                        { value: 'Decree granted more than 5 years back', label: 'Decree granted more than 5 years back' },
                      ]}
                      placeholder="Select Divorce Status"
                      error={Boolean(fieldErrors.divorce_status)}
                      aria-invalid={Boolean(fieldErrors.divorce_status)}
                    />
                  </Field>
                </div>
              )}

              {/* Condition: Children from prior marriage */}
              {hasPriorMarriage && (
                <div className="animate-fade-in">
                  <Field id={`${baseId}-children`} label="Children from Prior Marriage">
                    <Input
                      id={`${baseId}-children`}
                      type="text"
                      name="children_from_prior_marriage"
                      maxLength={2}
                      value={form.children_from_prior_marriage}
                      onChange={handleNumericInput}
                      placeholder="Number of children (e.g. 0, 1, 2)"
                      className={inputCls('children_from_prior_marriage')}
                    />
                  </Field>
                </div>
              )}

              {/* Sub-condition: Children with */}
              {showChildrenWith && (
                <div className="animate-fade-in">
                  <Field
                    id={`${baseId}-children-with`}
                    label="Children Residing With"
                    required
                    error={fieldErrors.children_with}
                  >
                    <FormSelect
                      id={`${baseId}-children-with`}
                      value={form.children_with ?? ''}
                      onValueChange={handleSelectChange('children_with')}
                      options={[
                        { value: 'All with me', label: 'All with me' },
                        { value: 'All with ex-spouse', label: 'All with ex-spouse' },
                        { value: 'Shared between us', label: 'Shared between us' },
                      ]}
                      placeholder="Select living arrangement"
                      error={Boolean(fieldErrors.children_with)}
                      aria-invalid={Boolean(fieldErrors.children_with)}
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

          {/* Parents and Siblings row */}
          <div className="mt-6 border-t border-cream-200 pt-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold-700">
              Parents & Siblings
            </h3>
            {/* Parents Row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id={`${baseId}-father`} label="Father's Name" required error={fieldErrors.father_name}>
                <Input
                  id={`${baseId}-father`}
                  type="text"
                  name="father_name"
                  maxLength={25}
                  value={form.father_name}
                  onChange={handleInputChange}
                  placeholder="Father's Full Name"
                  className={inputCls('father_name')}
                  aria-invalid={Boolean(fieldErrors.father_name)}
                />
              </Field>

              <Field id={`${baseId}-mother`} label="Mother's Name" required error={fieldErrors.mother_name}>
                <Input
                  id={`${baseId}-mother`}
                  type="text"
                  name="mother_name"
                  maxLength={25}
                  value={form.mother_name}
                  onChange={handleInputChange}
                  placeholder="Mother's Full Name"
                  className={inputCls('mother_name')}
                  aria-invalid={Boolean(fieldErrors.mother_name)}
                />
              </Field>
            </div>

            {/* Siblings Row */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field id={`${baseId}-bro-married`} label="Brothers (Married)" required error={fieldErrors.brother_married}>
                <FormSelect
                  id={`${baseId}-bro-married`}
                  value={form.brother_married}
                  onValueChange={handleSelectChange('brother_married')}
                  options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                  placeholder="0"
                />
              </Field>

              <Field id={`${baseId}-bro-unmarried`} label="Brothers (Unmarried)" required error={fieldErrors.brother_un_married}>
                <FormSelect
                  id={`${baseId}-bro-unmarried`}
                  value={form.brother_un_married}
                  onValueChange={handleSelectChange('brother_un_married')}
                  options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                  placeholder="0"
                />
              </Field>

              <Field id={`${baseId}-sis-married`} label="Sisters (Married)" required error={fieldErrors.sister_married}>
                <FormSelect
                  id={`${baseId}-sis-married`}
                  value={form.sister_married}
                  onValueChange={handleSelectChange('sister_married')}
                  options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                  placeholder="0"
                />
              </Field>

              <Field id={`${baseId}-sis-unmarried`} label="Sisters (Unmarried)" required error={fieldErrors.sister_un_married}>
                <FormSelect
                  id={`${baseId}-sis-unmarried`}
                  value={form.sister_un_married}
                  onValueChange={handleSelectChange('sister_un_married')}
                  options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
                  placeholder="0"
                />
              </Field>
            </div>
          </div>

          {/* Residential Address, House type, Years */}
          <div className="mt-6 border-t border-cream-200 pt-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Field
                  id={`${baseId}-address`}
                  label="Current Residential Address (Candidate)"
                  required
                  hint={`${500 - form.user_address.length} chars left`}
                  error={fieldErrors.user_address}
                >
                  <Textarea
                    id={`${baseId}-address`}
                    name="user_address"
                    rows={3}
                    maxLength={500}
                    value={form.user_address}
                    onChange={handleInputChange}
                    placeholder="Enter full address with postal pincode"
                    className={inputCls('user_address')}
                    aria-invalid={Boolean(fieldErrors.user_address)}
                  />
                </Field>
              </div>

              <div className="space-y-4">
                <Field
                  id={`${baseId}-years-addr`}
                  label="Years at Address"
                  required
                  error={fieldErrors.num_years_at_address}
                >
                  <Input
                    id={`${baseId}-years-addr`}
                    type="text"
                    name="num_years_at_address"
                    maxLength={3}
                    value={form.num_years_at_address}
                    onChange={handleNumericInput}
                    placeholder="e.g. 5"
                    className={inputCls('num_years_at_address')}
                    aria-invalid={Boolean(fieldErrors.num_years_at_address)}
                  />
                </Field>

                <div id={`${baseId}-house-type-group`}>
                  <span className="mb-1.5 block text-xs font-bold text-navy-900">
                    House Type <span className="text-maroon-600">*</span>
                  </span>
                  <OptionPills
                    id={`${baseId}-house-type-pills`}
                    name="house_type"
                    value={form.house_type}
                    onChange={handlePillChange('house_type')}
                    options={[
                      { value: 'Own', label: 'Own' },
                      { value: 'Rent', label: 'Rent' },
                    ]}
                    error={Boolean(fieldErrors.house_type)}
                    ariaLabel="House Type"
                  />
                  {/* Hidden native input keeps the scroll/focus target id stable */}
                  <input
                    id={`${baseId}-house-type-anchor`}
                    type="text"
                    className="sr-only"
                    aria-hidden
                    tabIndex={-1}
                    readOnly
                    value=""
                  />
                  {fieldErrors.house_type && (
                    <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                      {fieldErrors.house_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current City & Contacts */}
          <div className="mt-6 border-t border-cream-200 pt-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold-700">
              Location & Contact Details
            </h3>

            {/* Primary Location & Main Contact */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id={`${baseId}-current-city`}
                label="Present City / Parents Location"
                required
                error={fieldErrors.user_current_city}
              >
                <Input
                  id={`${baseId}-current-city`}
                  type="text"
                  name="user_current_city"
                  maxLength={45}
                  value={form.user_current_city}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru, Delhi, Mumbai"
                  className={inputCls('user_current_city')}
                  aria-invalid={Boolean(fieldErrors.user_current_city)}
                />
              </Field>

              <Field
                id={`${baseId}-contact-name`}
                label="Main Contact Person"
                required
                error={fieldErrors.contact_name}
              >
                <Input
                  id={`${baseId}-contact-name`}
                  type="text"
                  name="contact_name"
                  maxLength={45}
                  value={form.contact_name}
                  onChange={handleInputChange}
                  placeholder="Name of contact person"
                  className={inputCls('contact_name')}
                  aria-invalid={Boolean(fieldErrors.contact_name)}
                />
              </Field>

              <Field
                id={`${baseId}-contact-mobile`}
                label="Main Contact Mobile"
                required
                hint={
                  isMobileVerified && form.mobile === verifiedMobileNumber
                    ? '✓ Mobile Verified'
                    : form.mobile.length === 10
                    ? '✓ 10 digits'
                    : `${form.mobile.length}/10 digits`
                }
                error={fieldErrors.mobile}
              >
                <div className="relative">
                  <Input
                    id={`${baseId}-contact-mobile`}
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleNumericInput}
                    placeholder="10-digit mobile number"
                    className={cn(
                      inputCls('mobile'),
                      isMobileVerified && form.mobile === verifiedMobileNumber
                        ? 'border-emerald-500 bg-emerald-50/20 pr-28 text-emerald-950 focus-visible:border-emerald-600 focus-visible:ring-emerald-500/20'
                        : form.mobile.length === 10
                        ? 'pr-24'
                        : '',
                    )}
                    aria-invalid={Boolean(fieldErrors.mobile)}
                  />
                  {isMobileVerified && form.mobile === verifiedMobileNumber ? (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      ✓ Verified
                    </span>
                  ) : form.mobile.length === 10 ? (
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(true)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-gold-100 hover:bg-gold-200 border border-gold-300 px-2.5 py-1 text-[11px] font-bold text-navy-900 transition active:scale-95 shadow-2xs"
                    >
                      Verify OTP
                    </button>
                  ) : null}
                </div>
              </Field>
            </div>

            {/* Alternate Contact */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id={`${baseId}-alt-name`}
                label="Alternate Contact Person"
                required
                error={fieldErrors.alternate_contact_name}
              >
                <Input
                  id={`${baseId}-alt-name`}
                  type="text"
                  name="alternate_contact_name"
                  maxLength={45}
                  value={form.alternate_contact_name}
                  onChange={handleInputChange}
                  placeholder="Relative / Parent contact"
                  className={inputCls('alternate_contact_name')}
                  aria-invalid={Boolean(fieldErrors.alternate_contact_name)}
                />
              </Field>

              <Field
                id={`${baseId}-alt-mobile`}
                label="Alternate Contact Mobile"
                required
                hint={
                  form.alternate_mobile_no.length === 10
                    ? '✓ 10 digits'
                    : `${form.alternate_mobile_no.length}/10 digits`
                }
                error={fieldErrors.alternate_mobile_no}
              >
                <Input
                  id={`${baseId}-alt-mobile`}
                  type="tel"
                  name="alternate_mobile_no"
                  maxLength={10}
                  value={form.alternate_mobile_no}
                  onChange={handleNumericInput}
                  placeholder="10-digit mobile number"
                  className={inputCls('alternate_mobile_no')}
                  aria-invalid={Boolean(fieldErrors.alternate_mobile_no)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* SECTION 2: Partner Preferences */}
        <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
          <div className="mb-6 border-b border-cream-200 pb-4">
            <span className="eyebrow">Part 2</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
              Partner Preferences & Horoscope
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Astrological criteria, age bounds, budgets, and post-marriage expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Same Gotra */}
            <div id={`${baseId}-same-gotra-group`}>
              <Field
                id={`${baseId}-same-gotra-pills`}
                label="Marry in same Gotra?"
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
                      Indicate if your family permits alliances within the same paternal Gotra.
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
                  ariaLabel="Marry in same Gotra"
                />
              </Field>
            </div>

            {/* Match Ganna / Janampatri */}
            <div id={`${baseId}-match-ganna-group`}>
              <Field
                id={`${baseId}-match-ganna-pills`}
                label="Matching Ganna (Janampatri)?"
                required
                error={fieldErrors.match_ganna}
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
                      Whether horoscope Kundali Ganna matching is required before finalizing.
                    </TooltipContent>
                  </Tooltip>
                }
              >
                <YesNoPills
                  id={`${baseId}-match-ganna-pills`}
                  name="match_ganna"
                  value={form.match_ganna}
                  onChange={handlePillChange('match_ganna')}
                  error={Boolean(fieldErrors.match_ganna)}
                  ariaLabel="Matching Ganna"
                />
              </Field>
            </div>

            {/* Are you Manglik */}
            <div id={`${baseId}-is-manglik-group`}>
              <Field
                id={`${baseId}-is-manglik-pills`}
                label="Are you Manglik?"
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
                      Astrological Mangal Dosha positioning in the candidate&apos;s birth chart.
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
                  ariaLabel="Are you Manglik"
                />
              </Field>
            </div>

            {/* Marry a Manglik */}
            <div id={`${baseId}-will-marry-manglik-group`}>
              <Field
                id={`${baseId}-will-marry-manglik-pills`}
                label="Will you marry Manglik?"
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
                      Indicate if willing to consider proposals from Manglik candidates.
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
                  ariaLabel="Will you marry Manglik"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 border-t border-cream-200 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Older By */}
            <Field id={`${baseId}-older-by`} label="Spouse can be Older By (years)" required error={fieldErrors.older_by}>
              <FormSelect
                id={`${baseId}-older-by`}
                value={form.older_by}
                onValueChange={handleSelectChange('older_by')}
                options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                  value: String(n),
                  label: `${n} years`,
                }))}
                placeholder="Select years"
                error={Boolean(fieldErrors.older_by)}
                aria-invalid={Boolean(fieldErrors.older_by)}
              />
            </Field>

            {/* Younger By */}
            <Field
              id={`${baseId}-younger-by`}
              label="Spouse can be Younger By (years)"
              required
              error={fieldErrors.younger_by}
            >
              <FormSelect
                id={`${baseId}-younger-by`}
                value={form.younger_by}
                onValueChange={handleSelectChange('younger_by')}
                options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({
                  value: String(n),
                  label: `${n} years`,
                }))}
                placeholder="Select years"
                error={Boolean(fieldErrors.younger_by)}
                aria-invalid={Boolean(fieldErrors.younger_by)}
              />
            </Field>

            {/* Bride Expected Budget */}
            <Field
              id={`${baseId}-bride-budget`}
              label="Bride Budget (In Lakhs)"
              required
              error={fieldErrors.bride_budget}
            >
              <FormSelect
                id={`${baseId}-bride-budget`}
                value={form.bride_budget}
                onValueChange={handleSelectChange('bride_budget')}
                options={[
                  '1-10',
                  '11-20',
                  '21-30',
                  '31-40',
                  '41-50',
                  '51-75',
                  '76-100',
                  '101-200',
                  '201-500',
                ].map((r) => ({ value: r, label: `${r} Lakhs` }))}
                placeholder="Select Budget Range"
                error={Boolean(fieldErrors.bride_budget)}
                aria-invalid={Boolean(fieldErrors.bride_budget)}
              />
            </Field>

            {/* Condition 4: Groom Budget (only for Male candidates) */}
            {isMale && (
              <div className="animate-fade-in">
                <Field id={`${baseId}-groom-budget`} label="Groom Budget (In Lakhs)">
                  <FormSelect
                    id={`${baseId}-groom-budget`}
                    value={form.groom_budget ?? ''}
                    onValueChange={handleSelectChange('groom_budget')}
                    options={[
                      '1-10',
                      '11-20',
                      '21-30',
                      '31-40',
                      '41-50',
                      '51-75',
                      '76-100',
                      '101-200',
                      '201-500',
                    ].map((r) => ({ value: r, label: `${r} Lakhs` }))}
                    placeholder="Select Budget Range"
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Condition 4: Post-Marriage expectations (for Male candidate) */}
          {isMale && (
            <div className="mt-6 grid animate-fade-in grid-cols-1 gap-5 border-t border-cream-200 pt-5 sm:grid-cols-2">
              <Field id={`${baseId}-work-after`} label="Bride permitted to work after marriage?">
                <FormSelect
                  id={`${baseId}-work-after`}
                  value={form.work_after_marriage ?? ''}
                  onValueChange={handleSelectChange('work_after_marriage')}
                  options={[
                    { value: 'Yes (Business or Service)', label: 'Yes (Business or Service)' },
                    { value: 'Yes (Business only)', label: 'Yes (Business only)' },
                    { value: 'Yes (Private Service Only)', label: 'Yes (Private Service Only)' },
                    { value: 'Yes (Govt. Service Only)', label: 'Yes (Govt. Service Only)' },
                    { value: 'No', label: 'No' },
                    { value: 'we are flexible to discuss this', label: 'We are flexible to discuss this' },
                  ]}
                  placeholder="Please Select"
                />
              </Field>

              <Field id={`${baseId}-res-after`} label="Place of residence after marriage">
                <Input
                  id={`${baseId}-res-after`}
                  type="text"
                  name="residence_after_marriage"
                  maxLength={45}
                  value={form.residence_after_marriage}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru, With Parents, Independent"
                  className={inputCls('residence_after_marriage')}
                />
              </Field>
            </div>
          )}
        </div>

        {/* SECTION 3: Additional Information / Summary */}
        <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
          <div className="mb-6 border-b border-cream-200 pb-4">
            <span className="eyebrow">Part 3</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
              Family History & Summary
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              Briefly describe parents&apos; occupation, values, family background, and any aspirations.
            </p>
          </div>

          <div>
            <Field
              id={`${baseId}-summary`}
              label="Brief Summary of Parent's Occupation / Family History"
              required
              hint={`${500 - form.user_summary.length} chars left`}
              error={fieldErrors.user_summary}
            >
              <Textarea
                id={`${baseId}-summary`}
                name="user_summary"
                rows={4}
                maxLength={500}
                value={form.user_summary}
                onChange={handleInputChange}
                placeholder="Provide a brief paragraph describing your family, parents' professions, and lifestyle values (min. 10 characters)."
                className={inputCls('user_summary')}
                aria-invalid={Boolean(fieldErrors.user_summary)}
              />
            </Field>
          </div>
        </div>

        {/* SECTION 4: Photographs & Cropping */}
        <div className="rounded-[1.5rem] border border-gold-500/30 bg-white p-6 sm:p-8 lg:p-10 shadow-card">
          <div className="mb-6 border-b border-cream-200 pb-4">
            <span className="eyebrow">Part 4</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-navy-900">
              Profile Photographs
            </h2>
            <p className="mt-1 text-xs text-ink-500">
              High-resolution recent photographs. Selecting a photo will open the interactive cropper.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Full Length Photo */}
            <div
              id={`${baseId}-full-image-group`}
              className={`rounded-2xl border p-5 transition ${
                fieldErrors.full_image
                  ? 'border-maroon-500 bg-maroon-50/20'
                  : 'border-cream-200 bg-cream-50/50'
              }`}
            >
              <span className="block text-sm font-bold text-navy-900 mb-1">
                Full Length Photograph <span className="text-maroon-600">*</span>
              </span>
              <p className="text-xs text-ink-500 mb-4">
                Full-standing recent photo showing attire clearly.
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="h-44 w-44 overflow-hidden rounded-xl border-2 border-dashed border-gold-500/50 bg-white flex items-center justify-center shadow-inner">
                  {form.full_image_preview ? (
                    <img
                      src={form.full_image_preview}
                      alt="Full photograph preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="mx-auto h-10 w-10 text-gold-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 block text-xs text-ink-500">No photo selected</span>
                    </div>
                  )}
                </div>

                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <span>{form.full_image ? 'Change & Crop' : 'Upload & Crop Photo'}</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'full')}
                    className="sr-only"
                  />
                </label>
              </div>
              {fieldErrors.full_image && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                  {fieldErrors.full_image}
                </p>
              )}
            </div>

            {/* Full Face Photo */}
            <div
              id={`${baseId}-face-image-group`}
              className={`rounded-2xl border p-5 transition ${
                fieldErrors.face_image
                  ? 'border-maroon-500 bg-maroon-50/20'
                  : 'border-cream-200 bg-cream-50/50'
              }`}
            >
              <span className="block text-sm font-bold text-navy-900 mb-1">
                Full Face Photograph <span className="text-maroon-600">*</span>
              </span>
              <p className="text-xs text-ink-500 mb-4">
                Close-up portrait with clear frontal view of facial features.
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="h-44 w-44 overflow-hidden rounded-full border-2 border-dashed border-gold-500/50 bg-white flex items-center justify-center shadow-inner">
                  {form.face_image_preview ? (
                    <img
                      src={form.face_image_preview}
                      alt="Face photograph preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="mx-auto h-10 w-10 text-gold-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="mt-2 block text-xs text-ink-500">No photo selected</span>
                    </div>
                  )}
                </div>

                <label className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    <span>{form.face_image ? 'Change & Crop' : 'Upload & Crop Photo'}</span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'face')}
                    className="sr-only"
                  />
                </label>
              </div>
              {fieldErrors.face_image && (
                <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
                  {fieldErrors.face_image}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: Terms Agreement & Submission Actions */}
        <div
          id={`${baseId}-agree-terms-group`}
          className={`rounded-[1.5rem] border p-6 sm:p-8 shadow-card transition ${
            fieldErrors.agree_terms
              ? 'border-maroon-500 bg-maroon-50/20'
              : 'border-gold-500/30 bg-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              id={`${baseId}-agree-terms`}
              checked={form.agree_terms}
              onCheckedChange={(checked) => {
                setForm((prev) => ({ ...prev, agree_terms: checked === true }))
                clearFieldError('agree_terms')
              }}
              error={Boolean(fieldErrors.agree_terms)}
              aria-label="Agree to Terms and Conditions"
            />
            <label
              htmlFor={`${baseId}-agree-terms`}
              className="cursor-pointer text-xs leading-relaxed text-navy-900 sm:text-sm"
            >
              I have read, understood and agree to the{' '}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="font-bold text-gold-700 underline transition hover:text-gold-800"
              >
                Terms & Conditions
              </button>{' '}
              governing community bio-data verification and honorary matchmaking support.
            </label>
          </div>
          {fieldErrors.agree_terms && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-maroon-600">
              {fieldErrors.agree_terms}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-cream-200 pt-5 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleValidateClick}
              className="w-full border-gold-500/60 bg-gold-50/50 text-navy-900 hover:bg-gold-100 sm:w-auto"
            >
              Check Any Unfilled Details
            </Button>

            <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
              <Button
                type="submit"
                disabled={!isFormFullyFilled || isSubmitting}
                className={cn(
                  'w-full px-8 py-3 text-sm font-bold transition sm:w-auto',
                  !isFormFullyFilled
                    ? 'bg-ink-300 text-white cursor-not-allowed opacity-60 hover:bg-ink-300'
                    : isMobileVerified
                    ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-md'
                    : 'bg-gold-600 text-navy-950 hover:bg-gold-500 shadow-md ring-2 ring-gold-400/50'
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting Registration...
                  </span>
                ) : !isFormFullyFilled ? (
                  'Fill All Details to Enable Submit'
                ) : isMobileVerified ? (
                  'Submit Registration'
                ) : (
                  'Verify Mobile via OTP & Submit'
                )}
              </Button>

              {!isFormFullyFilled ? (
                <span className="text-[11px] text-ink-500 font-medium text-center sm:text-right">
                  Complete all required fields above to proceed with submission
                </span>
              ) : !isMobileVerified ? (
                <span className="text-[11px] text-gold-900 font-semibold flex items-center gap-1 text-center sm:text-right">
                  <span>✓ Details complete.</span>
                  <span>Click to verify via Firebase OTP.</span>
                </span>
              ) : (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 text-center sm:text-right">
                  <span>✓ Mobile verified. Ready to submit!</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Image Cropper Modal */}
      <ImageCropModal
        key={cropTarget || 'none'}
        isOpen={cropTarget !== null}
        title={cropTarget === 'full' ? 'Crop Full Length Photo' : 'Crop Full Face Photo'}
        imageSrc={cropRawSrc}
        onClose={() => {
          setCropTarget(null)
          setCropRawSrc(null)
        }}
        onCropComplete={handleCropComplete}
      />

      {/* Terms Modal */}
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />

      {/* Firebase Phone OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        mobile={form.mobile}
        onVerified={handleOtpVerified}
        onClose={() => setIsOtpModalOpen(false)}
        onChangeNumber={() => {
          setIsOtpModalOpen(false)
          focusAndScrollToField(`${baseId}-contact-mobile`)
        }}
      />
    </div>
    </TooltipProvider>
  )
}
