/**
 * @file src/module/registration/components/OtpVerificationModal.tsx
 * Industry-standard Firebase Phone OTP Verification Dialog.
 *
 * Features:
 * - 6-digit individual PIN input with auto-advance, backspace navigation & paste handling
 * - Firebase RecaptchaVerifier integration with memory leak & duplicate verifier protection
 * - 30-second resend countdown timer to protect against SMS spamming
 * - Clear, user-friendly error translations for all Firebase Auth error codes
 * - Native support for test credentials (e.g. 8888888888 -> 123456)
 * - Auto-submit upon 6th digit completion
 */

import { useState, useEffect, useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { ShieldCheck, ArrowRight, RotateCw, AlertCircle, CheckCircle2, X } from 'lucide-react'

interface OtpVerificationModalProps {
  isOpen: boolean
  mobile: string // 10-digit mobile number
  onVerified: () => void
  onClose: () => void
  onChangeNumber?: () => void
}

export default function OtpVerificationModal({
  isOpen,
  mobile,
  onVerified,
  onClose,
  onChangeNumber,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  const confirmationResultRef = useRef<ConfirmationResult | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start 30-second countdown for Resend OTP
  const startCountdown = useCallback(() => {
    setCountdown(30)
    setCanResend(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  // Clean up reCAPTCHA verifier instance
  const cleanupRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear()
      } catch {
        // Safe ignore
      }
      recaptchaVerifierRef.current = null
    }
  }, [])

  // Send or Resend OTP via Firebase
  const handleSendOtp = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setErrorMessage('Firebase Authentication is not available in this environment.')
      return
    }

    if (!mobile || mobile.length !== 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.')
      return
    }

    setSending(true)
    setErrorMessage(null)
    setDigits(['', '', '', '', '', ''])

    try {
      cleanupRecaptcha()

      // Create fresh invisible RecaptchaVerifier
      const verifier = new RecaptchaVerifier(auth, 'firebase-recaptcha-anchor', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setErrorMessage('Security verification expired. Please click Resend Code.')
        },
      })
      recaptchaVerifierRef.current = verifier

      const fullPhoneNumber = `+91${mobile}`
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier)
      confirmationResultRef.current = confirmation
      startCountdown()

      // Focus first input box
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    } catch (err: unknown) {
      cleanupRecaptcha()
      const firebaseError = err as { code?: string; message?: string }
      console.error('Firebase signInWithPhoneNumber error:', err)

      if (firebaseError.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format. Please check the 10-digit number.')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setErrorMessage('Too many SMS requests sent. Please wait a few minutes before trying again.')
      } else if (firebaseError.code === 'auth/quota-exceeded') {
        setErrorMessage('SMS verification quota exceeded. Please contact support.')
      } else {
        setErrorMessage(firebaseError.message || 'Unable to send verification code. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }, [mobile, cleanupRecaptcha, startCountdown])

  // Trigger send on initial modal open
  useEffect(() => {
    if (!isOpen) {
      cleanupRecaptcha()
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const timer = setTimeout(() => {
      handleSendOtp()
    }, 0)

    return () => {
      clearTimeout(timer)
      cleanupRecaptcha()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isOpen, handleSendOtp, cleanupRecaptcha])

  // Handle single digit entry
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '')
    if (!cleaned && value !== '') return

    const char = cleaned.slice(-1) // Take the last character entered
    const newDigits = [...digits]
    newDigits[index] = char
    setDigits(newDigits)
    setErrorMessage(null)

    // Advance to next box if char was entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify if all 6 digits are filled
    if (char && index === 5 && newDigits.every((d) => d !== '')) {
      verifyOtpCode(newDigits.join(''))
    }
  }

  // Handle keyboard navigation (Backspace, Left/Right arrows)
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous box and clear it
        inputRefs.current[index - 1]?.focus()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
      } else {
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle pasting full 6-digit code
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ''
    }
    setDigits(newDigits)
    setErrorMessage(null)

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus()
      verifyOtpCode(pasted)
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  // Verify OTP with Firebase confirmationResult
  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join('')
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.')
      return
    }

    if (!confirmationResultRef.current) {
      setErrorMessage('Verification session expired. Please click Resend Code.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      await confirmationResultRef.current.confirm(code)
      setIsSuccess(true)
      // Brief delightful confirmation delay before auto-submitting
      setTimeout(() => {
        onVerified()
      }, 700)
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string }
      console.error('Firebase confirm error:', err)

      if (firebaseError.code === 'auth/invalid-verification-code') {
        setErrorMessage('Incorrect verification code. Please check and try again.')
      } else if (firebaseError.code === 'auth/code-expired') {
        setErrorMessage('Verification code has expired. Please click Resend Code.')
      } else {
        setErrorMessage(firebaseError.message || 'Failed to verify code. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const formattedMobile =
    mobile.length === 10
      ? `${mobile.slice(0, 5)} ${mobile.slice(5)}`
      : mobile

  const isComplete = digits.every((d) => d !== '')
  const isTestNumber = mobile === '8888888888'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/75 p-4 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-gold-500/20">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading || sending}
          className="absolute right-5 top-5 rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-navy-900 transition disabled:opacity-50"
          aria-label="Close verification modal"
        >
          <X className="size-5" />
        </button>

        {/* Security Shield Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-100 to-cream-100 text-gold-700 shadow-inner ring-1 ring-gold-500/20">
            {isSuccess ? (
              <CheckCircle2 className="size-8 text-emerald-600 animate-scale-in" />
            ) : (
              <ShieldCheck className="size-8 text-gold-700" />
            )}
          </div>

          <h3 id="otp-modal-title" className="mt-4 text-xl font-bold font-display text-navy-900">
            {isSuccess ? 'Mobile Verified!' : 'Verify Mobile Number'}
          </h3>

          <p className="mt-1.5 text-xs text-ink-600 max-w-xs">
            Enter the 6-digit verification code sent via SMS to{' '}
            <span className="font-bold font-mono text-navy-900">+91 {formattedMobile}</span>
          </p>

          {onChangeNumber && (
            <button
              type="button"
              onClick={onChangeNumber}
              disabled={loading || sending}
              className="mt-1 text-[11px] font-semibold text-gold-700 hover:text-gold-900 underline transition"
            >
              Change mobile number
            </button>
          )}

          {isTestNumber && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-gold-50 border border-gold-300 px-3 py-1 text-[11px] font-medium text-gold-900">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-600 animate-pulse"></span>
              <span>Test Account: Use code <strong>123456</strong></span>
            </div>
          )}
        </div>

        {/* 6-Digit PIN Inputs */}
        <div className="mt-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={loading || isSuccess || sending}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl text-center font-mono text-xl font-bold transition outline-none shadow-2xs ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900'
                    : errorMessage
                    ? 'border-maroon-400 bg-maroon-50/40 text-maroon-900 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-400/20'
                    : digit
                    ? 'border-gold-500 bg-gold-50/30 text-navy-900 focus:border-gold-600 focus:ring-2 focus:ring-gold-500/20'
                    : 'border-cream-300 bg-cream-50/60 text-navy-900 hover:bg-white focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-500/20'
                }`}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-maroon-600 animate-fade-in text-center">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 animate-fade-in">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Verification confirmed! Completing submission...</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!isComplete || loading || sending || isSuccess}
            onClick={() => verifyOtpCode()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCw className="size-4 animate-spin text-white" />
                <span>Verifying Code...</span>
              </span>
            ) : sending ? (
              <span className="flex items-center gap-2">
                <RotateCw className="size-4 animate-spin text-white" />
                <span>Sending Code...</span>
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Verified!</span>
              </span>
            ) : (
              <>
                <span>Verify & Complete Registration</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>

        {/* Resend Code Section */}
        <div className="mt-5 text-center text-xs text-ink-600">
          <span>Didn&apos;t receive the code? </span>
          {canResend ? (
            <button
              type="button"
              disabled={loading || sending || isSuccess}
              onClick={handleSendOtp}
              className="font-bold text-gold-700 hover:text-gold-900 underline transition inline-flex items-center gap-1 disabled:opacity-50"
            >
              <RotateCw className={`size-3 ${sending ? 'animate-spin' : ''}`} />
              <span>Resend Code</span>
            </button>
          ) : (
            <span className="font-mono text-ink-400">
              Resend in <strong className="text-navy-900">{countdown}s</strong>
            </span>
          )}
        </div>

        {/* Invisible Firebase Recaptcha Anchor */}
        <div id="firebase-recaptcha-anchor" className="mt-2 flex justify-center"></div>
      </div>
    </div>
  )
}
