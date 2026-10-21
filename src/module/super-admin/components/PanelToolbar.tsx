/**
 * @file src/module/super-admin/components/PanelToolbar.tsx
 * Toolbar strip that sits inside a table card: search on the left, filters
 * on the right. Keeping the controls in the card header removes the extra
 * bordered card that used to stack above every table.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PanelToolbarProps {
  children?: ReactNode
  /** Search field, pinned to the start of the row. */
  search?: ReactNode
  className?: string
}

export function PanelToolbar({ children, search, className }: PanelToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-cream-300/70 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-3',
        className,
      )}
    >
      {search ? <div className="min-w-0 sm:max-w-xs sm:flex-1">{search}</div> : null}
      {children ? (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>
      ) : null}
    </div>
  )
}
