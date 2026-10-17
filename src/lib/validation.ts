/**
 * @file src/lib/validation.ts
 * Reusable field-level validation and character sanitization utilities.
 * Enforces strict typing, paste prevention, and field-specific rules
 * across registration, contact, and inquiry forms.
 */

/* ==========================================================================
   1. REGEX PATTERNS (Field-specific, not generic)
   ========================================================================== */

/**
 * Name fields: Letters, spaces, apostrophes, dots, and hyphens.
 * Legitimate formats: "Dr. A. P. J. Abdul Kalam", "O'Connor", "Mary-Jane", "Sita Ram".
 */
export const NAME_REGEX = /^[a-zA-Z\s.'-]+$/

/**
 * Indian Mobile number: exactly 10 digits starting with 6, 7, 8, or 9.
 */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/

/**
 * Standard RFC-compliant email address.
 * Allows letters, digits, and legitimate email characters: @, ., _, -, +
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * City and Place of Birth: Letters, spaces, dots, commas, hyphens.
 */
export const CITY_REGEX = /^[a-zA-Z\s.,'-]+$/

/**
 * Company name & Type: Alphanumeric with safe business punctuation (&, ., ,, -, ', /, (, )).
 */
export const COMPANY_REGEX = /^[a-zA-Z0-9\s&.',\-/()]+$/

/**
 * Residential Address: Alphanumeric with safe address punctuation (,, ., -, /, #, (, ), :, ', &).
 */
export const ADDRESS_REGEX = /^[a-zA-Z0-9\s,.\-/#():'&]+$/

/**
 * Numbers only: digits 0-9.
 */
export const DIGITS_ONLY_REGEX = /^\d+$/

/* ==========================================================================
   2. INPUT SANITIZERS (Called on typing and paste to strip invalid characters)
   ========================================================================== */

/**
 * Strips any character that is not a letter, space, dot, apostrophe, or hyphen.
 * Collapses multiple consecutive spaces into a single space.
 */
export function sanitizeName(val: string): string {
  return val.replace(/[^a-zA-Z\s.'-]/g, '').replace(/\s{2,}/g, ' ')
}

/**
 * Strips any character that is not allowed in an email address.
 * Allowed: letters, numbers, @, ., _, -, +
 */
export function sanitizeEmail(val: string): string {
  return val.replace(/[^a-zA-Z0-9._%+-@]/g, '').trim()
}

/**
 * Strips any character that is not a digit (0-9).
 * Optionally restricts length.
 */
export function sanitizeDigits(val: string, maxLength?: number): string {
  const digits = val.replace(/\D/g, '')
  return maxLength ? digits.slice(0, maxLength) : digits
}

/**
 * Strips invalid characters from city / place of birth.
 * Allowed: letters, spaces, commas, dots, hyphens.
 */
export function sanitizeCity(val: string): string {
  return val.replace(/[^a-zA-Z\s.,'-]/g, '').replace(/\s{2,}/g, ' ')
}

/**
 * Strips invalid characters from company name / business fields.
 * Allowed: alphanumeric, spaces, and &, ., ,, -, ', /, (, )
 */
export function sanitizeCompany(val: string): string {
  return val.replace(/[^a-zA-Z0-9\s&.',\-/()]/g, '').replace(/\s{2,}/g, ' ')
}

/**
 * Strips invalid/dangerous characters from addresses.
 * Allowed: alphanumeric, spaces, and ,, ., -, /, #, (, ), :, ', &
 */
export function sanitizeAddress(val: string): string {
  return val.replace(/[^a-zA-Z0-9\s,.\-/#():'&]/g, '').replace(/\s{2,}/g, ' ')
}

/**
 * General safe text sanitizer for summary, message, and comments.
 * Removes potentially dangerous script/code characters (<, >, \, {, }, [, ], ^, $, ~, =, +, `)
 * while preserving standard punctuation (. , ! ? - ' " ( ) : ; / & % @).
 */
export function sanitizeSafeText(val: string): string {
  return val.replace(/[<>{}[\]\\^$~=+`]/g, '')
}

/* ==========================================================================
   3. FIELD VALIDATORS (Called on blur and form submission)
   ========================================================================== */

export interface ValidationRuleResult {
  valid: boolean
  error?: string
}

/**
 * Validates a person's name.
 */
export function validateName(
  val: string,
  fieldLabel = 'Name',
  required = true,
  minLen = 2,
  maxLen = 50,
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (trimmed.length < minLen) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least ${minLen} characters`,
    }
  }
  if (trimmed.length > maxLen) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed ${maxLen} characters`,
    }
  }
  if (!NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} can only contain letters, spaces, dots, and hyphens`,
    }
  }
  // Must contain at least two letters (not just dots or dashes)
  if ((trimmed.match(/[a-zA-Z]/g) || []).length < 2) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldLabel.toLowerCase()}`,
    }
  }
  return { valid: true }
}

/**
 * Validates an email address.
 */
export function validateEmail(
  val: string,
  required = true,
  fieldLabel = 'Email Address',
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Please enter a valid email address (e.g. name@example.com)',
    }
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed 100 characters`,
    }
  }
  return { valid: true }
}

/**
 * Validates an Indian 10-digit mobile number.
 */
export function validateIndianMobile(
  val: string,
  required = true,
  fieldLabel = 'Mobile Number',
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (!/^\d+$/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} must contain numbers only`,
    }
  }
  if (trimmed.length !== 10) {
    return {
      valid: false,
      error: `${fieldLabel} must be exactly 10 digits`,
    }
  }
  if (!INDIAN_MOBILE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} must start with 6, 7, 8, or 9`,
    }
  }
  return { valid: true }
}

/**
 * Validates city / place of birth.
 */
export function validateCity(
  val: string,
  fieldLabel = 'City',
  required = true,
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least 2 characters`,
    }
  }
  if (trimmed.length > 50) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed 50 characters`,
    }
  }
  if (!CITY_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} can only contain letters, spaces, and commas`,
    }
  }
  if ((trimmed.match(/[a-zA-Z]/g) || []).length < 2) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldLabel.toLowerCase()}`,
    }
  }
  return { valid: true }
}

/**
 * Validates address.
 */
export function validateAddress(
  val: string,
  fieldLabel = 'Address',
  required = true,
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (trimmed.length < 5) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least 5 characters`,
    }
  }
  if (trimmed.length > 250) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed 250 characters`,
    }
  }
  if (!ADDRESS_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} contains invalid special characters`,
    }
  }
  return { valid: true }
}

/**
 * Validates company name.
 */
export function validateCompany(
  val: string,
  fieldLabel = 'Company Name',
  required = false,
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least 2 characters`,
    }
  }
  if (trimmed.length > 60) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed 60 characters`,
    }
  }
  if (!COMPANY_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} contains invalid characters`,
    }
  }
  return { valid: true }
}

/**
 * Validates text message or summary.
 */
export function validateSafeText(
  val: string,
  fieldLabel = 'Message',
  required = true,
  minLen = 10,
  maxLen = 1000,
): ValidationRuleResult {
  const trimmed = val.trim()
  if (!trimmed) {
    return required
      ? { valid: false, error: `${fieldLabel} is required` }
      : { valid: true }
  }
  if (trimmed.length < minLen) {
    return {
      valid: false,
      error: `${fieldLabel} must be at least ${minLen} characters`,
    }
  }
  if (trimmed.length > maxLen) {
    return {
      valid: false,
      error: `${fieldLabel} cannot exceed ${maxLen} characters`,
    }
  }
  if (/[<>{}[\]\\^$~=+`]/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} contains disallowed characters like <, >, {, }, etc.`,
    }
  }
  return { valid: true }
}

/* ==========================================================================
   4. PASTE HANDLERS (Intercepts paste events to apply sanitizers directly)
   ========================================================================== */

/**
 * Creates an onPaste event handler that extracts plain text from clipboard,
 * runs it through the given sanitizer, and updates the input value.
 */
export function handleSanitizedPaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  sanitizer: (text: string) => string,
  onSanitized: (cleaned: string) => void,
) {
  e.preventDefault()
  const pasted = e.clipboardData.getData('text')
  const sanitized = sanitizer(pasted)
  const target = e.currentTarget
  const start = target.selectionStart ?? 0
  const end = target.selectionEnd ?? 0
  const currentVal = target.value
  const newVal = sanitizer(
    currentVal.slice(0, start) + sanitized + currentVal.slice(end),
  )
  onSanitized(newVal)
}
