/**
 * @file src/module/super-admin/components/PanelState.tsx
 * Empty states for panel tables. Loading states live in PanelSkeleton — the
 * panel shows the shape of the incoming content instead of a spinner.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

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
