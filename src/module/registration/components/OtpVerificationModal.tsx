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
  initializeRecaptchaConfig,
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

/* ------------------------------------------------------------------ */
/* [OTP-DIAG] Temporary diagnostics — remove after root cause is found */
/* ------------------------------------------------------------------ */
const otpDiag = (step: string, data?: unknown) =>
  console.log(`[OTP-DIAG] ${step}`, data ?? "");

const maskKey = (key?: string) =>
  key && key.length > 12 ? `${key.slice(0, 8)}…${key.slice(-4)}` : "(missing)";

const msSince = (t: number | null) =>
  t === null ? null : Math.round(performance.now() - t);

const attemptsStorageKey = "otp-diag-attempts";
const getAttemptCount = () => {
  try {
    return Number(sessionStorage.getItem(attemptsStorageKey) || 0);
  } catch {
    return 0;
  }
};
const bumpAttemptCount = () => {
  const next = getAttemptCount() + 1;
  try {
    sessionStorage.setItem(attemptsStorageKey, String(next));
  } catch {
    /* ignore */
  }
  return next;
};

const snapshotGrecaptcha = () => {
  const g = (
    window as unknown as {
      grecaptcha?: { render?: unknown; enterprise?: { render?: unknown } };
    }
  ).grecaptcha;
  return {
    exists: !!g,
    hasRender: typeof g?.render === "function",
    hasEnterprise: !!g?.enterprise,
    hasEnterpriseRender: typeof g?.enterprise?.render === "function",
  };
};

const summarizeAuthBody = (raw: unknown) => {
  if (typeof raw !== "string") return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const summary: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== "string") {
        summary[key] = value;
        continue;
      }
      const lower = key.toLowerCase();
      if (lower.includes("token") || lower.includes("captcha")) {
        summary[key] = `len:${value.length}`;
      } else if (lower.includes("phone")) {
        summary[key] = "***masked***";
      } else {
        summary[key] = value.length > 40 ? `${value.slice(0, 24)}…` : value;
      }
    }
    return summary;
  } catch {
    return "unparseable";
  }
};

let otpNetworkTapInstalled = false;
const installOtpNetworkTap = () => {
  if (otpNetworkTapInstalled || typeof window === "undefined") return;
  otpNetworkTapInstalled = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    const isAuthApi =
      url.includes("identitytoolkit.googleapis.com") ||
      url.includes("securetoken.googleapis.com");
    if (!isAuthApi) return originalFetch(input, init);

    const requestBody = summarizeAuthBody(init?.body);
    const response = await originalFetch(input, init);
    otpDiag(`auth-api ${response.status} ${url.split("?")[0]}`, { requestBody });
    if (!response.ok) {
      try {
        const text = await response.clone().text();
        otpDiag("auth-api error body", text.slice(0, 600));
      } catch {
        /* ignore */
      }
    }
    return response;
  }) as typeof fetch;
};

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
  const modalOpenedAtRef = useRef<number | null>(null);
  const captchaSolvedAtRef = useRef<number | null>(null);

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
    otpDiag("cleanup-recaptcha");
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

  const handleFirebaseSendError = useCallback(
    (err: unknown) => {
      cleanupRecaptcha();
      const firebaseError = err as {
        code?: string;
        message?: string;
        customData?: { serverResponse?: string };
      };
      console.error("[OTP-DIAG] Firebase signInWithPhoneNumber error:", err);
      otpDiag("send-error details", {
        code: firebaseError.code,
        message: firebaseError.message,
        serverResponse: firebaseError.customData?.serverResponse ?? null,
        attempts: getAttemptCount(),
        msSinceCaptchaSolved: msSince(captchaSolvedAtRef.current),
        msSinceModalOpen: msSince(modalOpenedAtRef.current),
        grecaptcha: snapshotGrecaptcha(),
        origin: typeof window !== "undefined" ? window.location.origin : null,
      });
      setCanResend(true);
      if (timerRef.current) clearInterval(timerRef.current);
      setCountdown(0);

      const code = firebaseError.code || "";
      const msg = firebaseError.message || "";

      if (
        code === "auth/too-many-requests" ||
        msg.includes("TOO_MANY_ATTEMPTS_TRY_LATER") ||
        msg.includes("too-many-requests")
      ) {
        console.warn(
          "TOO_MANY_ATTEMPTS_TRY_LATER — Google temporarily blocks repeated verification attempts. Dev: wait a few minutes or verify with a different number; check App Check / reCAPTCHA config if this keeps happening.",
        );
        setErrorMessage(
          "Too many attempts for this number. For security, please wait 10-15 minutes before requesting another code.",
        );
      } else if (code === "auth/invalid-phone-number") {
        setErrorMessage(
          "Invalid phone number format. Please check your 10-digit mobile number.",
        );
      } else if (code === "auth/missing-phone-number") {
        setErrorMessage("Mobile number is missing.");
      } else if (code === "auth/billing-not-enabled") {
        console.warn(
          "auth/billing-not-enabled — Enable billing (Blaze plan) on the Google Cloud/Firebase project so Phone Auth can send real SMS.",
        );
        setErrorMessage(
          "We couldn't send the verification code right now. Please try again later or contact support.",
        );
      } else if (code === "auth/quota-exceeded") {
        console.warn(
          "auth/quota-exceeded — Firebase project daily SMS quota exhausted.",
        );
        setErrorMessage(
          "We've reached today's SMS limit. Please try again tomorrow or contact support.",
        );
      } else if (code === "auth/operation-not-allowed") {
        console.warn(
          "auth/operation-not-allowed — Enable the Phone sign-in provider in the Firebase Console.",
        );
        setErrorMessage(
          "SMS verification is temporarily unavailable. Please try again later or contact support.",
        );
      } else if (
        code === "auth/unauthorized-domain" ||
        code === "auth/app-not-authorized"
      ) {
        console.warn(
          "auth/unauthorized-domain — Add this domain (localhost / production domain) to Authorized Domains in Firebase Auth.",
        );
        setErrorMessage(
          "Security verification is temporarily unavailable. Please try again later or contact support.",
        );
      } else if (code === "auth/captcha-check-failed") {
        setErrorMessage(
          "Security challenge failed or was cancelled. Please check the box again.",
        );
      } else if (code === "auth/invalid-app-credential") {
        console.warn(
          "auth/invalid-app-credential — known Firebase bug: real-number sends fail when the origin host is 'localhost' (test numbers bypass reCAPTCHA, that's why they work). Run dev on 127.0.0.1 (vite.config server.host) and add '127.0.0.1' to Auth → Settings → Authorized domains — the console may warn 'not a valid host name', still click Add. Also: repeated attempts make Google temporarily block verification.",
        );
        setErrorMessage(
          "Security verification could not be completed. Please wait a few minutes and try again.",
        );
      } else if (code === "auth/network-request-failed") {
        setErrorMessage(
          "Network error. Please check your internet connection and try again.",
        );
      } else {
        setErrorMessage(
          "Unable to send the verification code right now. Please try again in a moment.",
        );
      }
    },
    [cleanupRecaptcha],
  );

  // Automatically mounts visible Google reCAPTCHA checkbox ("I'm not a robot")
  const initVisibleRecaptcha = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    installOtpNetworkTap();
    otpDiag("init-recaptcha", {
      attempts: getAttemptCount(),
      msSinceModalOpen: msSince(modalOpenedAtRef.current),
      origin: window.location.origin,
      hostname: window.location.hostname,
    });

    const cleanMobile = mobile.replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMessage("Please provide a valid 10-digit mobile number.");
      isExecutingRef.current = false;
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      console.warn(
        "Firebase Auth is not initialized — check the Firebase config env vars.",
      );
      setErrorMessage(
        "Verification service is temporarily unavailable. Please try again later or contact support.",
      );
      isExecutingRef.current = false;
      return;
    }

    const authConfig = (
      auth as { config?: { apiKey?: string; authDomain?: string } }
    ).config;
    otpDiag("auth-instance", {
      appName: auth.app.name,
      projectId: auth.app.options.projectId,
      authDomain: authConfig?.authDomain ?? auth.app.options.authDomain,
      apiKey: maskKey(authConfig?.apiKey ?? auth.app.options.apiKey),
      grecaptcha: snapshotGrecaptcha(),
    });

    const configFetchStarted = performance.now();
    try {
      await initializeRecaptchaConfig(auth);
      otpDiag("recaptcha-config ok", {
        ms: Math.round(performance.now() - configFetchStarted),
        grecaptcha: snapshotGrecaptcha(),
      });
    } catch (configErr) {
      otpDiag("recaptcha-config FAILED", {
        ms: Math.round(performance.now() - configFetchStarted),
        error: configErr,
      });
    }

    setErrorMessage(null);

    try {
      cleanupRecaptcha();

      // Fresh container inside parent prevents "already been rendered" error
      const parent = document.getElementById("firebase-recaptcha-parent");
      if (!parent) {
        isExecutingRef.current = false;
        return;
      }
      parent.innerHTML = "";

      const uniqueContainer = document.createElement("div");
      uniqueContainer.id = `firebase-recaptcha-${Date.now()}`;
      parent.appendChild(uniqueContainer);

      // Visible "I'm not a robot" reCAPTCHA Checkbox
      const verifier = new RecaptchaVerifier(auth, uniqueContainer, {
        size: "normal",
        callback: async () => {
          captchaSolvedAtRef.current = performance.now();
          otpDiag("captcha-solved", {
            msSinceModalOpen: msSince(modalOpenedAtRef.current),
          });
          // As soon as user checks the checkbox, dispatch real SMS OTP
          setSending(true);
          setErrorMessage(null);
          try {
            const fullPhoneNumber = `+91${cleanMobile}`;
            otpDiag("sending-sms", {
              attempt: bumpAttemptCount(),
              msSinceCaptchaSolved: msSince(captchaSolvedAtRef.current),
            });
            const confirmation = await signInWithPhoneNumber(
              auth,
              fullPhoneNumber,
              verifier,
            );
            confirmationResultRef.current = confirmation;
            setOtpSent(true);
            startCountdown();

            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 150);
          } catch (err: unknown) {
            handleFirebaseSendError(err);
          } finally {
            setSending(false);
          }
        },
        "expired-callback": () => {
          otpDiag("captcha-expired", {
            msSinceCaptchaSolved: msSince(captchaSolvedAtRef.current),
          });
          setErrorMessage(
            "Security challenge expired. Please check the box again.",
          );
        },
      });

      recaptchaVerifierRef.current = verifier;
      const widgetId = await verifier.render();
      otpDiag("recaptcha-rendered", {
        widgetId,
        containerId: uniqueContainer.id,
        iframes: Array.from(uniqueContainer.querySelectorAll("iframe")).map(
          (f) => ({ title: f.title, src: f.src.slice(0, 140) }),
        ),
      });
    } catch (err: unknown) {
      handleFirebaseSendError(err);
    } finally {
      isExecutingRef.current = false;
    }
  }, [mobile, cleanupRecaptcha, handleFirebaseSendError, startCountdown]);

  // Mount visible reCAPTCHA when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupRecaptcha();
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    modalOpenedAtRef.current = performance.now();
    otpDiag("modal-open", {
      hostname: window.location.hostname,
      attempts: getAttemptCount(),
      grecaptcha: snapshotGrecaptcha(),
    });

    let active = true;
    const timer = setTimeout(() => {
      if (!active) return;
      setDigits(["", "", "", "", "", ""]);
      setOtpSent(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setCanResend(false);
      initVisibleRecaptcha();
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      cleanupRecaptcha();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, initVisibleRecaptcha, cleanupRecaptcha]);

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
      await confirmationResultRef.current.confirm(code);
      console.log("Firebase Phone Auth verified successfully.");
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
          "Something went wrong while verifying the code. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResend = useCallback(() => {
    setDigits(["", "", "", "", "", ""]);
    setOtpSent(false);
    setErrorMessage(null);
    setCanResend(false);
    initVisibleRecaptcha();
  }, [initVisibleRecaptcha]);

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
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-gold-500/20">
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
            {isSuccess
              ? "Mobile Verified!"
              : otpSent
                ? "Enter Verification Code"
                : "Security Check"}
          </h3>

          <p className="mt-1.5 text-xs text-ink-600 max-w-xs">
            {otpSent
              ? "Enter the 6-digit verification code sent via SMS to"
              : "Complete the check below to send verification SMS to"}{" "}
            <span className="font-bold font-mono text-navy-900">
              +91 {formattedMobile}
            </span>
          </p>

          {onChangeNumber && !otpSent && (
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

        {/* Dynamic Parent Wrapper for Visible reCAPTCHA */}
        <div
          id="firebase-recaptcha-parent"
          className={`flex justify-center transition-all duration-300 ${
            otpSent ? "hidden" : "my-5 min-h-[78px] items-center"
          }`}
        ></div>

        {/* Sending SMS Spinner */}
        {sending && (
          <div className="my-3 flex items-center justify-center gap-2 rounded-xl bg-gold-50/70 border border-gold-200/60 p-2.5 text-xs font-semibold text-navy-900 animate-fade-in">
            <RotateCw className="size-4 animate-spin text-gold-600" />
            <span>Sending verification code to +91 {formattedMobile}...</span>
          </div>
        )}

        {/* Sent Confirmation Badge */}
        {otpSent && !sending && !isSuccess && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl py-2 px-3 animate-fade-in">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>Code sent to +91 {formattedMobile}</span>
          </div>
        )}

        {/* Error Alert Box — always visible when an error occurs */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-maroon-200 bg-maroon-50/80 p-3.5 text-xs font-medium text-maroon-800 animate-fade-in text-left">
            <AlertCircle className="size-4 shrink-0 text-maroon-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Retry Security Check if error occurred before sending */}
        {!otpSent && errorMessage && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cream-100 text-navy-900 hover:bg-cream-200 transition cursor-pointer shadow-xs"
            >
              <RotateCw className="size-3.5 text-gold-600" />
              <span>Retry Security Check</span>
            </button>
          </div>
        )}

        {/* 6-Digit PIN Inputs — shown only after security check completes and OTP is sent */}
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
                  disabled={loading || isSuccess || sending}
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
                  }`}
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 animate-fade-in">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>Verification confirmed! Completing submission...</span>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              <button
                type="button"
                disabled={!isComplete || loading || sending || isSuccess}
                onClick={() => verifyOtpCode()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-navy-800 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="size-4 animate-spin text-white" />
                    <span>Verifying Code...</span>
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
                  <RotateCw
                    className={`size-3 ${sending ? "animate-spin" : ""}`}
                  />
                  <span>Resend Code</span>
                </button>
              ) : (
                <span className="font-mono text-ink-400">
                  Resend in{" "}
                  <strong className="text-navy-900">{countdown}s</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
