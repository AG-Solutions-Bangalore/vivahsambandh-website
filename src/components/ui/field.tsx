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
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-1.5 text-xs font-bold text-navy-900"
        >
          <span>
            {label} {required && <span className="text-maroon-600">*</span>}
          </span>
          {tooltip}
        </label>
        {hint && (
          <span className="shrink-0 font-mono text-[11px] text-ink-400">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600"
        >
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
