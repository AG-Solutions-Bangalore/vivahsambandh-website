/**
 * @file src/module/super-admin/pages/PanelLoginPage.tsx
 * Dedicated authentication page for Super Admin Panel at `/crm-login`.
 * Features 10-digit mobile number login and mobile + email password recovery.
 */

import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Phone,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { useSuperAdminAuth } from "../context/SuperAdminAuthContext";
import { sendPanelPassword } from "../services/adminApi";

const LABEL_CLASS =
  "block text-xs font-semibold text-navy-900";
const ERROR_CLASS = "mt-1 text-[11px] font-medium text-maroon-600";

export default function PanelLoginPage() {
  const { isAuthenticated, isPending, login } = useSuperAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'forgot'
  const [mode, setMode] = useState<"login" | "forgot">("login");

  // Login form state (Mobile + Password)
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{
    mobile?: string;
    password?: string;
    general?: string;
  }>({});

  // Forgot password form state (Mobile + Email)
  const [forgotMobile, setForgotMobile] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotErrors, setForgotErrors] = useState<{
    mobile?: string;
    email?: string;
    general?: string;
  }>({});
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const target =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        "/panel/dashboard";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle Login submission
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const errors: { mobile?: string; password?: string } = {};

    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!password) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      toast.error("Please correct the errors in the form.");
      return;
    }

    setLoginErrors({});

    try {
      const result = await login(cleanMobile, password);

      if (result.success) {
        toast.success("Welcome back to Super Admin Panel!");
        const target =
          (location.state as { from?: { pathname?: string } })?.from
            ?.pathname || "/panel/dashboard";
        navigate(target, { replace: true });
      } else {
        setLoginErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setLoginErrors({ general: msg });
      toast.error(msg);
    }
  };

  // Handle Forgot Password submission
  const handleForgotSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotErrors({});
    setForgotSuccess(null);

    const errors: { mobile?: string; email?: string } = {};

    const cleanMobile = forgotMobile.trim();
    if (!cleanMobile) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      errors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setForgotErrors(errors);
      toast.error("Please fill in both mobile number and email.");
      return;
    }

    setIsSendingForgot(true);
    try {
      const result = await sendPanelPassword({
        mobile: cleanMobile,
        email: cleanEmail,
      });

      if (result.success) {
        setForgotSuccess(
          result.message ||
            "Password has been sent to your registered email address.",
        );
        toast.success(result.message || "Password sent successfully!");
      } else {
        setForgotErrors({
          general:
            result.message ||
            "Unable to find an account matching these details.",
        });
        toast.error(result.message);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Network error during request.";
      setForgotErrors({ general: msg });
      toast.error(msg);
    } finally {
      setIsSendingForgot(false);
    }
  };

  const handleBackToLogin = () => {
    setMode("login");
    setForgotErrors({});
    setForgotSuccess(null);
    setLoginErrors({});
  };

  return (
    <div className="super-admin-panel flex min-h-screen flex-col bg-cream-50">
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="w-full max-w-sm">
          {/* Header Brand lockup */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-gold-500/30 bg-gold-50 shadow-xs text-gold-700">
              {mode === "login" ? (
                <ShieldCheck className="size-6 text-gold-600" />
              ) : (
                <KeyRound className="size-6 text-gold-600" />
              )}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
              {mode === "login" ? "Login" : "Forgot password"}
            </h1>
            <p className="mt-1.5 text-xs text-ink-500">
              {mode === "login"
                ? "Sign in to your account to continue."
                : "Enter your email to receive your password."}
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-[1.25rem] border border-gold-500/25 bg-white p-6 shadow-none sm:p-7">
            {mode === "login" ? (
              /* ================= LOGIN FORM ================= */
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                {loginErrors.general && (
                  <div className="rounded-xl border border-maroon-200 bg-maroon-50/70 p-3 text-xs text-maroon-800 flex items-start gap-2.5 animate-in fade-in-0">
                    <AlertCircle className="size-4 shrink-0 text-maroon-600 mt-0.5" />
                    <span>{loginErrors.general}</span>
                  </div>
                )}

                {/* Mobile Number Field */}
                <div>
                  <label htmlFor="admin-mobile" className={LABEL_CLASS}>
                    Mobile Number
                  </label>
                  <div className="relative mt-1.5">
                    <Phone
                      className={cn(
                        "pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 transition-colors",
                        loginErrors.mobile ? "text-maroon-500" : "text-ink-400",
                      )}
                      aria-hidden
                    />
                    <Input
                      id="admin-mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      autoComplete="tel"
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setMobileNumber(val);
                        if (loginErrors.mobile || loginErrors.general) {
                          setLoginErrors((prev) => ({
                            ...prev,
                            mobile: undefined,
                            general: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className={cn(
                        "h-11 rounded-xl pr-3 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2",
                        loginErrors.mobile
                          ? "border-maroon-500 bg-maroon-50/20 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20"
                          : "border-cream-300 bg-cream-50/70 focus-visible:border-gold-500 focus-visible:ring-gold-500/30",
                      )}
                    />
                  </div>
                  {loginErrors.mobile && (
                    <p className={ERROR_CLASS}>{loginErrors.mobile}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="admin-password" className={LABEL_CLASS}>
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <Lock
                      className={cn(
                        "pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 transition-colors",
                        loginErrors.password ? "text-maroon-500" : "text-ink-400",
                      )}
                      aria-hidden
                    />
                    <Input
                      id="admin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginErrors.password || loginErrors.general) {
                          setLoginErrors((prev) => ({
                            ...prev,
                            password: undefined,
                            general: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter password"
                      className={cn(
                        "h-11 rounded-xl pr-10 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2",
                        loginErrors.password
                          ? "border-maroon-500 bg-maroon-50/20 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20"
                          : "border-cream-300 bg-cream-50/70 focus-visible:border-gold-500 focus-visible:ring-gold-500/30",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-ink-400 transition-colors hover:text-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden />
                      ) : (
                        <Eye className="size-4" aria-hidden />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className={ERROR_CLASS}>{loginErrors.password}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-gold-600 text-sm font-bold tracking-wide text-white shadow-gold transition-colors duration-200 hover:bg-gold-700 disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  )}
                </Button>

                {/* Forgot Password link below button */}
                {/* <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleOpenForgot}
                    className="cursor-pointer text-xs font-semibold text-gold-600 hover:text-gold-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div> */}
              </form>
            ) : (
              /* ================= FORGOT PASSWORD FORM ================= */
              <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                {forgotSuccess ? (
                  <div className="space-y-4 text-center py-2 animate-in fade-in-0">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">
                        Password Request Sent
                      </h3>
                      <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">
                        {forgotSuccess}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleBackToLogin}
                      className="h-10 w-full cursor-pointer rounded-xl bg-navy-900 text-xs font-bold text-white hover:bg-navy-800 transition-colors"
                    >
                      Back to login
                    </Button>
                  </div>
                ) : (
                  <>
                    {forgotErrors.general && (
                      <div className="rounded-xl border border-maroon-200 bg-maroon-50/70 p-3 text-xs text-maroon-800 flex items-start gap-2.5 animate-in fade-in-0">
                        <AlertCircle className="size-4 shrink-0 text-maroon-600 mt-0.5" />
                        <span>{forgotErrors.general}</span>
                      </div>
                    )}

                    {/* Mobile Number Field */}
                    <div>
                      <label htmlFor="forgot-mobile" className={LABEL_CLASS}>
                        Mobile Number
                      </label>
                      <div className="relative mt-1.5">
                        <Phone
                          className={cn(
                            "pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 transition-colors",
                            forgotErrors.mobile ? "text-maroon-500" : "text-ink-400",
                          )}
                          aria-hidden
                        />
                        <Input
                          id="forgot-mobile"
                          name="mobile"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={10}
                          autoComplete="tel"
                          value={forgotMobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setForgotMobile(val);
                            if (forgotErrors.mobile || forgotErrors.general) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                mobile: undefined,
                                general: undefined,
                              }));
                            }
                          }}
                          placeholder="Enter 10-digit mobile number"
                          className={cn(
                            "h-11 rounded-xl pr-3 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2",
                            forgotErrors.mobile
                              ? "border-maroon-500 bg-maroon-50/20 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20"
                              : "border-cream-300 bg-cream-50/70 focus-visible:border-gold-500 focus-visible:ring-gold-500/30",
                          )}
                        />
                      </div>
                      {forgotErrors.mobile && (
                        <p className={ERROR_CLASS}>{forgotErrors.mobile}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="forgot-email" className={LABEL_CLASS}>
                        Email
                      </label>
                      <div className="relative mt-1.5">
                        <Mail
                          className={cn(
                            "pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 transition-colors",
                            forgotErrors.email ? "text-maroon-500" : "text-ink-400",
                          )}
                          aria-hidden
                        />
                        <Input
                          id="forgot-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={forgotEmail}
                          onChange={(e) => {
                            setForgotEmail(e.target.value);
                            if (forgotErrors.email || forgotErrors.general) {
                              setForgotErrors((prev) => ({
                                ...prev,
                                email: undefined,
                                general: undefined,
                              }));
                            }
                          }}
                          placeholder="Enter email address"
                          className={cn(
                            "h-11 rounded-xl pr-3 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2",
                            forgotErrors.email
                              ? "border-maroon-500 bg-maroon-50/20 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20"
                              : "border-cream-300 bg-cream-50/70 focus-visible:border-gold-500 focus-visible:ring-gold-500/30",
                          )}
                        />
                      </div>
                      {forgotErrors.email && (
                        <p className={ERROR_CLASS}>{forgotErrors.email}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSendingForgot}
                      className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-gold-600 text-sm font-bold tracking-wide text-white shadow-gold transition-colors duration-200 hover:bg-gold-700 disabled:opacity-60"
                    >
                      {isSendingForgot ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending password…
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Send password
                          <ArrowRight className="size-4" aria-hidden />
                        </span>
                      )}
                    </Button>

                    {/* Back to login link below button */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-navy-800 hover:text-gold-600 transition-colors"
                      >
                        <ArrowLeft className="size-3.5" />
                        <span>Back to login</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
