/**
 * @file src/module/super-admin/pages/PanelLoginPage.tsx
 * Dedicated authentication page for Super Admin Panel at `/panel-login`.
 */

import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'

export default function PanelLoginPage() {
  const { isAuthenticated, login, devBypassLogin } = useSuperAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('9999999999')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [inactiveProfileInfo, setInactiveProfileInfo] = useState<{
    message: string
  } | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const target = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/panel/dashboard'
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInactiveProfileInfo(null)

    if (!username.trim()) {
      setErrorMessage('Please enter your admin username or mobile number.')
      return
    }

    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(username.trim(), password)

      if (result.success) {
        const target =
          (location.state as { from?: { pathname?: string } })?.from?.pathname ||
          '/panel/dashboard'
        navigate(target, { replace: true })
      } else if (result.isInactiveProfile) {
        setInactiveProfileInfo({
          message:
            result.message ||
            'Your profile is inactive. Contact admin in the backend CRM database.',
        })
      } else {
        setErrorMessage(result.message)
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDevBypass = () => {
    devBypassLogin(username)
    const target =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      '/panel/dashboard'
    navigate(target, { replace: true })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-4 sm:p-6 text-white overflow-hidden">
      {/* Decorative ambient background glows */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 size-96 rounded-full bg-maroon-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to site link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-cream-200/80 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Return to public website</span>
          </Link>
          <span className="text-[0.68rem] tracking-wider uppercase font-semibold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full border border-gold-400/20">
            Control Center
          </span>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto size-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-400 p-0.5 shadow-gold flex items-center justify-center text-navy-950 mb-4">
              <Shield className="size-7" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">
              Super Admin Sign In
            </h1>
            <p className="mt-1.5 text-xs text-cream-200/80">
              Authorized access to VivahSambandh management and moderation
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-5 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3.5 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Backend Inactive Profile notice with Dev Mode session button */}
          {inactiveProfileInfo && (
            <div className="mt-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 p-4 text-xs text-amber-200 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-amber-300">
                    Backend Verified Credentials:
                  </p>
                  <p className="mt-1 leading-relaxed text-cream-100">
                    &ldquo;{inactiveProfileInfo.message}&rdquo;
                  </p>
                  <p className="mt-2 text-[0.7rem] text-amber-200/90 leading-tight">
                    In the live database, this account needs activation. You can
                    proceed in <strong>Development Preview Mode</strong> to test
                    and manage all modules right now.
                  </p>
                  <button
                    type="button"
                    onClick={handleDevBypass}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-1.5 font-bold text-navy-950 text-xs shadow-md hover:bg-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Enter Dev Session</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-cream-200 uppercase tracking-wider mb-1.5"
              >
                Username / Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-300">
                  <User className="size-4 text-cream-200/60" />
                </div>
                <Input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-cream-200/40 rounded-xl focus:border-gold-400 focus:ring-gold-400/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-cream-200 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-300">
                  <Lock className="size-4 text-cream-200/60" />
                </div>
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="pl-10 pr-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-cream-200/40 rounded-xl focus:border-gold-400 focus:ring-gold-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-cream-200/60 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Quick Testing Credentials chip */}
            <div className="flex items-center justify-between text-[0.7rem] pt-1">
              <span className="text-cream-200/70">Testing credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setUsername('9999999999')
                  setPassword('123456')
                }}
                className="text-gold-400 hover:text-gold-300 font-semibold underline decoration-dotted cursor-pointer"
              >
                9999999999 / 123456
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 font-bold text-sm tracking-wide shadow-gold transition-all duration-200 cursor-pointer mt-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="size-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  Verifying with CRM...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In to Panel
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Security details footnote */}
          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[0.68rem] text-cream-200/60">
              <CheckCircle2 className="size-3 text-gold-400" />
              <span>TLS 1.3 Encrypted • Dedicated Super Admin Route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
