/**
 * @file src/module/registration/components/registration-form/sections/SubmitResultBanner.tsx
 * Success / error notification shown above the form after submission attempts.
 */

import { useRegistrationForm } from '../context'

export default function SubmitResultBanner() {
  const { submitResult } = useRegistrationForm()

  if (!submitResult) return null

  return (
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
  )
}
