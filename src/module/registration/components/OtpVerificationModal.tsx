/**
 * @file src/module/registration/components/OtpVerificationModal.tsx
 * Firebase Phone OTP Verification Dialog.
 *
 * Flow:
 * - Modal opens → automatically initiates Firebase Phone Authentication with invisible reCAPTCHA
 * - Dynamically mounts a fresh reCAPTCHA container to prevent "already been rendered" errors
 * - Guarded against React 18 Strict Mode duplicate triggers
 * - Google reCAPTCHA triggers automatically without any "I'm not a robot" checkbox
 * - If Google requires image verification (crosswalk, bicycle, etc.), the challenge popup opens automatically
 * - Once verified, the SMS OTP is dispatched immediately
 * - 6-digit individual PIN input with auto-advance, backspace navigation, paste handling & auto-submit
 * - 30-second resend countdown timer to protect against SMS spamming
 * - Comprehensive user-friendly translations for all Firebase Auth error codes
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  ShieldCheck,
  ArrowRight,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

interface OtpVerificationModalProps {
  isOpen: boolean;
  mobile: string; // 10-digit mobile number
  onVerified: () => void;
  onClose: () => void;
  onChangeNumber?: () => void;
}

export default function OtpVerificationModal({
  isOpen,
  mobile,
  onVerified,
  onClose,
  onChangeNumber,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isExecutingRef = useRef(false);
  const hasSentRef = useRef(false);

  // Start 30-second countdown for Resend OTP
  const startCountdown = useCallback(() => {
    setCountdown(30);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Clean up reCAPTCHA verifier instance and reset parent DOM
  const cleanupRecaptcha = useCallback(() => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (err) {
        console.warn("reCAPTCHA clear warning:", err);
      }
      recaptchaVerifierRef.current = null;
    }
    const parent = document.getElementById("firebase-recaptcha-parent");
    if (parent) {
      parent.innerHTML = "";
    }
  }, []);

  // Automatically sends OTP via Firebase and triggers Google reCAPTCHA challenge
  const handleSendOtp = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage("Please provide a valid 10-digit mobile number.");
      isExecutingRef.current = false;
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setErrorMessage("Firebase Authentication is not available.");
      isExecutingRef.current = false;
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      cleanupRecaptcha();

      // Create a brand-new container DOM element inside the parent wrapper.
      // This completely prevents Google reCAPTCHA's "already been rendered in this element" error.
      const parent = document.getElementById("firebase-recaptcha-parent");
      if (parent) {
        parent.innerHTML = "";
      }
      const uniqueContainer = document.createElement("div");
      uniqueContainer.id = `firebase-recaptcha-${Date.now()}`;
      if (parent) {
        parent.appendChild(uniqueContainer);
      } else {
        document.body.appendChild(uniqueContainer);
      }

      // Invisible reCAPTCHA: NO "I'm not a robot" checkbox.
      // Automatically launches Google image challenge (crosswalk, bicycle, etc.) when needed.
      const verifier = new RecaptchaVerifier(auth, uniqueContainer, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          setErrorMessage(
            "Security challenge expired. Please click Resend Code.",
          );
        },
      });

      recaptchaVerifierRef.current = verifier;

      const fullPhoneNumber = `+91${cleanMobile}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        verifier,
      );
      confirmationResultRef.current = confirmation;
      setOtpSent(true);
      setErrorMessage(null); // clear any transient error
      startCountdown();

      // Focus first PIN input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: unknown) {
      cleanupRecaptcha();
      const firebaseError = err as { code?: string; message?: string };
      console.error("Firebase signInWithPhoneNumber error:", err);

      if (firebaseError.code === "auth/invalid-phone-number") {
        setErrorMessage(
          "Invalid phone number format. Please check your 10-digit mobile number.",
        );
      } else if (firebaseError.code === "auth/missing-phone-number") {
        setErrorMessage("Mobile number is missing.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setErrorMessage(
          "Too many requests sent. Please wait a few minutes before trying again.",
        );
      } else if (firebaseError.code === "auth/quota-exceeded") {
        setErrorMessage(
          "SMS daily quota reached. Please try again later or contact support.",
        );
      } else if (firebaseError.code === "auth/operation-not-allowed") {
        setErrorMessage(
          "Phone sign-in is currently unavailable in Firebase. Please enable it in the Firebase Console.",
        );
      } else if (
        firebaseError.code === "auth/unauthorized-domain" ||
        firebaseError.code === "auth/app-not-authorized"
      ) {
        setErrorMessage(
          "This domain is not authorized in Firebase Auth. Add localhost to Authorized Domains in Firebase Console.",
        );
      } else if (firebaseError.code === "auth/captcha-check-failed") {
        setErrorMessage(
          "Security verification was cancelled or failed. Please click Resend Code to try again.",
        );
      } else if (firebaseError.code === "auth/invalid-app-credential") {
        setErrorMessage("App verification failed. Please click Resend Code.");
      } else if (firebaseError.code === "auth/network-request-failed") {
        setErrorMessage(
          "Network error while contacting Firebase. Check your internet connection.",
        );
      } else {
        setErrorMessage(
          firebaseError.message ||
            "Unable to send verification code. Please try again.",
        );
      }
    } finally {
      setSending(false);
      isExecutingRef.current = false;
    }
  }, [mobile, cleanupRecaptcha, startCountdown]);

  // Automatically start phone auth / reCAPTCHA once when modal opens
  useEffect(() => {
    if (!isOpen) {
      hasSentRef.current = false;
      isExecutingRef.current = false;
      cleanupRecaptcha();
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (hasSentRef.current) return;
    hasSentRef.current = true;

    const timer = setTimeout(() => {
      setDigits(["", "", "", "", "", ""]);
      setOtpSent(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setCanResend(false);
      handleSendOtp();
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanupRecaptcha();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, handleSendOtp, cleanupRecaptcha]);

  // Handle single digit entry
  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const char = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage(null);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when 6th digit is typed
    if (char && index === 5 && newDigits.every((d) => d !== "")) {
      verifyOtpCode(newDigits.join(""));
    }
  };

  // Handle keyboard navigation (Backspace, Left/Right arrows)
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasting full 6-digit code
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    setErrorMessage(null);

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      verifyOtpCode(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Verify OTP with Firebase confirmationResult
  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code.");
      return;
    }

    if (!confirmationResultRef.current) {
      setErrorMessage("Verification session expired. Please resend the code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const userCredential = await confirmationResultRef.current.confirm(code);
      console.log(
        "Firebase Phone Auth verified successfully for user:",
        userCredential.user.phoneNumber,
      );
      setIsSuccess(true);
      // Brief delightful confirmation delay before auto-submitting
      setTimeout(() => {
        onVerified();
      }, 700);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("Firebase confirm error:", err);

      if (firebaseError.code === "auth/invalid-verification-code") {
        setErrorMessage(
          "Incorrect verification code. Please check and try again.",
        );
      } else if (firebaseError.code === "auth/code-expired") {
        setErrorMessage(
          "Verification code has expired. Please click Resend Code.",
        );
      } else if (firebaseError.code === "auth/session-expired") {
        setErrorMessage(
          "Verification session expired. Please click Resend Code.",
        );
      } else {
        setErrorMessage(
          firebaseError.message || "Failed to verify code. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResend = useCallback(() => {
    hasSentRef.current = false;
    setDigits(["", "", "", "", "", ""]);
    setOtpSent(false);
    setErrorMessage(null);
    setCanResend(false);
    handleSendOtp();
  }, [handleSendOtp]);

  if (!isOpen) return null;

  const cleanDigits = mobile.replace(/\D/g, "");
  const formattedMobile =
    cleanDigits.length === 10
      ? `${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : cleanDigits;

  const isComplete = digits.every((d) => d !== "");

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
          className="absolute right-5 top-5 rounded-full p-1.5 text-ink-400 hover:bg-cream-100 hover:text-navy-900 transition disabled:opacity-50 cursor-pointer"
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

          <h3
            id="otp-modal-title"
            className="mt-4 text-xl font-bold font-display text-navy-900"
          >
            {isSuccess ? "Mobile Verified!" : "Verify Mobile Number"}
          </h3>

          <p className="mt-1.5 text-xs text-ink-600 max-w-xs">
            {otpSent
              ? "Enter the 6-digit verification code sent via SMS to"
              : "Verifying security check to send code to"}{" "}
            <span className="font-bold font-mono text-navy-900">
              +91 {formattedMobile}
            </span>
          </p>

          {onChangeNumber && (
            <button
              type="button"
              onClick={onChangeNumber}
              disabled={loading || sending}
              className="mt-1 text-[11px] font-semibold text-gold-700 hover:text-gold-900 underline transition cursor-pointer"
            >
              Change mobile number
            </button>
          )}
        </div>

        {/* Dynamic Parent Wrapper for reCAPTCHA (never causes "already rendered" error) */}
        <div
          id="firebase-recaptcha-parent"
          className="flex justify-center"
        ></div>


        {/* Sent Confirmation Badge */}
        {otpSent && !sending && !isSuccess && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl py-2 px-3 animate-fade-in">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Code sent to +91 {formattedMobile}</span>
          </div>
        )}

        {/* 6-Digit PIN Inputs — shown only after security check completes */}
        {otpSent && (
        <div className="mt-5 animate-fade-in">
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={loading || isSuccess || sending || !otpSent}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl text-center font-mono text-xl font-bold transition outline-none shadow-2xs ${
                  isSuccess
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900"
                    : errorMessage
                      ? "border-maroon-400 bg-maroon-50/40 text-maroon-900 focus:border-maroon-600 focus:ring-2 focus:ring-maroon-400/20"
                      : digit
                        ? "border-gold-500 bg-gold-50/30 text-navy-900 focus:border-gold-600 focus:ring-2 focus:ring-gold-500/20"
                        : "border-cream-300 bg-cream-50/60 text-navy-900 hover:bg-white focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-500/20"
                } ${!otpSent ? "opacity-40 cursor-not-allowed" : ""}`}
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
        )}

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={
              !isComplete || loading || sending || isSuccess || !otpSent
            }
            onClick={() => verifyOtpCode()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCw className="size-4 animate-spin text-white" />
                <span>Verifying Code...</span>
              </span>
            ) : sending ? (
              <span className="flex items-center gap-2">
                <RotateCw className="size-4 animate-spin text-white" />
                <span>Waiting for Security Check...</span>
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>Verified!</span>
              </span>
            ) : (
              <>
                <span>Verify &amp; Complete Registration</span>
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
              onClick={handleResend}
              className="font-bold text-gold-700 hover:text-gold-900 underline transition inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`size-3 ${sending ? "animate-spin" : ""}`} />
              <span>Resend Code</span>
            </button>
          ) : (
            <span className="font-mono text-ink-400">
              Resend in <strong className="text-navy-900">{countdown}s</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
