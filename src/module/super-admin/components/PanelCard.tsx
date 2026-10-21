/**
 * @file src/module/super-admin/components/PanelCard.tsx
 * The single surface primitive for the Super Admin Panel.
 *
 * Every panel surface in the module used to hand-roll its own border,
 * radius and shadow, which drifted away from the brand card language
 * (gold hairline + warm shadow). This wraps that language once.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PanelCardProps {
  children: ReactNode
  className?: string
  /** Removes the body padding for cards that host a flush table. */
  flush?: boolean
  /** Renders the muted "quiet" surface used for inset panels. */
  quiet?: boolean
}

export function PanelCard({
  children,
  className,
  flush = false,
  quiet = false,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        quiet ? 'panel-card-quiet' : 'panel-card',
        !flush && 'p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

interface PanelCardHeaderProps {
  title: string
  icon?: ReactNode
  description?: string
  action?: ReactNode
  className?: string
}

export function PanelCardHeader({
  title,
  icon,
  description,
  action,
  className,
}: PanelCardHeaderProps) {
  return (
    <header
      className={cn(
        'mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-cream-300/80 pb-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold text-balance text-navy-900">
          {icon ? <span className="text-gold-600">{icon}</span> : null}
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
