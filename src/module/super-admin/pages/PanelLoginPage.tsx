/**
 * @file src/module/super-admin/pages/PanelLoginPage.tsx
 * Dedicated authentication page for Super Admin Panel at `/panel-login`.
 */

import { useState, type FormEvent, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  CircleAlert,
  ArrowRight,
  ArrowLeft,
  CircleCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LotusMark from "@/components/LotusMark";
import { useSuperAdminAuth } from "../context/SuperAdminAuthContext";

export default function PanelLoginPage() {
  const { isAuthenticated, login } = useSuperAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const target =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        "/panel/dashboard";
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Enter your admin username or mobile number.");
      return;
    }

    if (!password) {
      setErrorMessage("Enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        const target =
          (location.state as { from?: { pathname?: string } })?.from
            ?.pathname || "/panel/dashboard";
        navigate(target, { replace: true });
      } else {
        setErrorMessage(result.message);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="w-full max-w-sm">
          {/* Brand lockup */}
          <div className="mb-7 text-center">
           
            <h1 className="font-display text-2xl font-bold tracking-tight text-navy-900">
              Super Admin Sign In
            </h1>
            <p className="mt-1.5 text-xs text-ink-500">
              Authorized access to VivahSambandh management and moderation
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="animate-panel-fade mb-5 flex items-start gap-2.5 rounded-2xl border border-maroon-200 bg-maroon-50 p-3.5 text-xs text-maroon-800"
            >
              <CircleAlert
                className="mt-px size-4 shrink-0 text-maroon-600"
                aria-hidden
              />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Card */}
          <div className="rounded-[1.25rem] border border-gold-500/25 bg-white p-6 shadow-card sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="mb-1.5 block text-[0.66rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
                >
                  Username / Mobile Number
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-ink-400"
                    aria-hidden
                  />
                  <Input
                    id="admin-username"
                    name="username"
                    type="text"
                    inputMode="numeric"
                    autoComplete="username"
                    spellCheck={false}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    required
                    className="h-11 rounded-xl border-cream-300 bg-cream-50/70 pr-3 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1.5 block text-[0.66rem] font-bold tracking-[0.14em] text-navy-900 uppercase"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-ink-400"
                    aria-hidden
                  />
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-11 rounded-xl border-cream-300 bg-cream-50/70 pr-10 pl-10 text-sm text-navy-900 placeholder:text-ink-400 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
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
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-gold-600 text-sm font-bold tracking-wide text-white shadow-gold transition-colors duration-200 hover:bg-gold-700"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying with CRM…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Panel
                    <ArrowRight className="size-4" aria-hidden />
                  </span>
                )}
              </Button>
            </form>

            
          </div>
        </div>
      </main>
    </div>
  );
}
