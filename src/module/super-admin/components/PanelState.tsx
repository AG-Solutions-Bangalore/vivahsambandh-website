/**
 * @file src/module/super-admin/components/PanelState.tsx
 * Empty and error states for panel tables. Loading states live in
 * PanelSkeleton — the panel shows the shape of the incoming content instead
 * of a spinner.
 */

import type { ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

interface PanelEmptyProps {
  icon?: ReactNode
  title: string
  description?: string
  /** Optional recovery action (clear filters, retry, create…). */
  action?: ReactNode
  className?: string
}

export function PanelEmpty({
  icon,
  title,
  description,
  action,
  className,
}: PanelEmptyProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      {icon ? (
        <span className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-gold-500/20 bg-gold-50 text-gold-700">
          {icon}
        </span>
      ) : null}
      <p className="font-display text-sm font-bold text-balance text-navy-900">
        {title}
      </p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  )
}

interface PanelErrorProps {
  title?: string
  message?: string
  /** Optional retry action — wire this to the query's `refetch`. */
  onRetry?: () => void
  className?: string
}

/**
 * Failed-query state. Mirrors `PanelEmpty` so a failed load and an empty
 * result occupy the same space in the table body.
 */
export function PanelError({
  title = 'Could not load this list',
  message,
  onRetry,
  className,
}: PanelErrorProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-maroon-200 bg-maroon-50 text-maroon-600">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <p className="font-display text-sm font-bold text-balance text-navy-900">
        {title}
      </p>
      {message ? (
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-ink-500">
          {message}
        </p>
      ) : null}
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onRetry}
          className="mt-4 cursor-pointer rounded-full border-cream-300 text-xs font-semibold"
        >
          Try again
        </Button>
      ) : null}
    </div>
  )
}
