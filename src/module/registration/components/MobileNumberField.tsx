/**
 * @file src/module/registration/components/MobileNumberField.tsx
 * Shared Indian mobile-number field with OTP verification.
 *
 * Extracted from the user registration wizard so the admin registration
 * form uses the exact same control instead of a hand-rolled copy: digit
 * hint counter, inline "Verify" button, verified badge and the emerald
 * success styling all live here.
 */

import { useTranslation } from 'react-i18next'
import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { cn } from 'cn'

export interface MobileNumberFieldProps {
  /** DOM id of the input — the label and error message anchor to it. */
  id: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void
  /** True once the number passed OTP verification. */
  isVerified?: boolean
  /** Opens the OTP modal. Only rendered when the number is 10 digits. */
  onVerify?: () => void
  error?: string
  required?: boolean
  placeholder?: string
  /** Extra classes for the input (the caller's field styling). */
  inputClassName?: string
  autoComplete?: string
}

const MOBILE_LENGTH = 10

export default function MobileNumberField({
  id,
  label,
  value,
  onChange,
  onPaste,
  isVerified = false,
  error,
  required = true,
  placeholder,
  inputClassName,
  autoComplete = 'tel',
}: MobileNumberFieldProps) {
  const { t } = useTranslation()

  const hint = isVerified ? t('registrationPage.form.mobileVerified', 'Mobile verified') : undefined

  return (
    <Field id={id} label={label} required={required} hint={hint} error={error}>
      <div className="relative">
        <Input
          id={id}
          type="tel"
          name="mobile"
          inputMode="numeric"
          autoComplete={autoComplete}
          maxLength={MOBILE_LENGTH}
          value={value}
          onChange={onChange}
          onPaste={onPaste}
          placeholder={placeholder ?? t('registrationPage.form.contactMobilePlaceholder', 'Enter mobile number')}
          className={cn(
            inputClassName,
            isVerified &&
              'border-emerald-500 bg-emerald-50/20 pr-28 text-emerald-950 focus-visible:border-emerald-600 focus-visible:ring-emerald-500/20',
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {isVerified ? (
          <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            {t('registrationPage.form.verified', 'Verified')}
          </span>
        ) : null}
      </div>
    </Field>
  )
}
