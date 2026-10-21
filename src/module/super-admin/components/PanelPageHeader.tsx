/**
 * @file src/module/super-admin/components/PanelPageHeader.tsx
 * Shared page title block: eyebrow, display title, description and page actions.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PanelPageHeaderProps {
  title: string
  description?: string
  /** Small status chip rendered next to the title (e.g. queue counts). */
  chip?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PanelPageHeader({
  title,
  description,
  chip,
  actions,
  className,
}: PanelPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-xl font-bold tracking-tight text-balance text-navy-900 sm:text-2xl">
            {title}
          </h2>
          {chip}
        </div>
        {description ? (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-500 sm:text-[0.8rem]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
