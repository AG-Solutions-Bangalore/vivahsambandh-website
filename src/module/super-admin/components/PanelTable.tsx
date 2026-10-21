/**
 * @file src/module/super-admin/components/PanelTable.tsx
 * Table shell shared by every panel list: header strip, hover rows and the
 * record-count footer.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PanelTableProps {
  head: ReactNode
  children: ReactNode
  /** Screen-reader caption describing the table contents. */
  caption?: string
  className?: string
}

export function PanelTable({
  head,
  children,
  caption,
  className,
}: PanelTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left text-xs">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="panel-table-head">{head}</tr>
        </thead>
        <tbody className="divide-y divide-cream-200/80">{children}</tbody>
      </table>
    </div>
  )
}

interface PanelTableHeadCellProps {
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function PanelTableHeadCell({
  children,
  align = 'left',
  className,
}: PanelTableHeadCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3.5 whitespace-nowrap',
        align === 'right' && 'text-right',
        className,
      )}
    >
      {children}
    </th>
  )
}

interface PanelTableFooterProps {
  children: ReactNode
  className?: string
}

export function PanelTableFooter({ children, className }: PanelTableFooterProps) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-t border-cream-300/80 bg-cream-100/50 px-4 py-3 text-[0.7rem] text-ink-500 tabular-nums',
        className,
      )}
    >
      {children}
    </footer>
  )
}
