/**
 * @file src/module/super-admin/components/StatusActionGroup.tsx
 * Row of status transition buttons (approve / hold / cancel …).
 *
 * Shared by the member, admin and moderation queues so the destructive
 * affordance always wears the brand maroon and never a generic red.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'

export type StatusActionTone = 'success' | 'warn' | 'info' | 'danger'

export interface StatusAction {
  status: string
  label: string
  icon?: ReactNode
  tone: StatusActionTone
  /** Hides the action when the record already holds this status. */
  hideWhenCurrent?: boolean
}

interface StatusActionGroupProps {
  actions: StatusAction[]
  currentStatus: string
  onSelect: (nextStatus: string) => void
  size?: 'xs' | 'sm'
  /**
   * Icon-only mode: keeps a table row on a single line. Each button still
   * carries an accessible name via `aria-label` + `title`.
   */
  compact?: boolean
  className?: string
}

const TONE_CLASSES: Record<StatusActionTone, string> = {
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100',
  warn: 'border-navy-200 bg-navy-50 text-navy-800 hover:border-navy-300 hover:bg-navy-100',
  info: 'border-gold-300 bg-gold-50 text-gold-800 hover:border-gold-400 hover:bg-gold-100',
  danger:
    'border-maroon-200 bg-maroon-50 text-maroon-800 hover:border-maroon-300 hover:bg-maroon-100',
}

export function StatusActionGroup({
  actions,
  currentStatus,
  onSelect,
  size = 'xs',
  compact = false,
  className,
}: StatusActionGroupProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        compact ? 'flex-nowrap' : 'flex-wrap justify-end',
        className,
      )}
    >
      {actions.map((action) => {
        const isCurrent =
          action.hideWhenCurrent !== false &&
          currentStatus.toLowerCase() === action.status.toLowerCase()

        if (isCurrent) return null

        const isIconOnly = compact && Boolean(action.icon)

        return (
          <Button
            key={action.status}
            type="button"
            size={size}
            variant="outline"
            onClick={() => onSelect(action.status)}
            title={isIconOnly ? `${action.label} — set status to ${action.status}` : undefined}
            aria-label={
              isIconOnly
                ? `${action.label} ${action.status} for this record`
                : undefined
            }
            className={cn(
              'cursor-pointer rounded-full font-semibold transition-colors',
              TONE_CLASSES[action.tone],
              isIconOnly
                ? 'px-2'
                : size === 'xs'
                  ? 'px-2.5 text-[0.7rem]'
                  : 'px-3 text-xs',
            )}
          >
            {action.icon}
            {isIconOnly ? null : <span>{action.label}</span>}
          </Button>
        )
      })}
    </div>
  )
}
