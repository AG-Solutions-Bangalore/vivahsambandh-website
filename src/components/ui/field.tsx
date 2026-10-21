/**
 * @file src/components/ui/field.tsx
 * Reusable shadcn-style form field wrapper: label + hint + error.
 * Keeps label/error markup consistent across the whole registration form.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'
import { CircleAlert } from 'lucide-react'

interface FieldProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  tooltip?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({
  id,
  label,
  required,
  hint,
  error,
  tooltip,
  children,
  className,
}: FieldProps) {
  return (
    <div id={`${id}-field`} className={cn('min-w-0', className)}>
      <div className="mb-2 flex items-start justify-between gap-x-3 gap-y-1">
        <label
          htmlFor={id}
          className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold leading-tight tracking-tight text-navy-900"
        >
          <span className="min-w-0">{label}</span>
          {required && (
            <span className="text-maroon-600" aria-hidden="true">
              *
            </span>
          )}
          {tooltip}
        </label>
        {hint && (
          <span className="shrink-0 text-[12px] font-medium leading-none text-ink-500 tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
