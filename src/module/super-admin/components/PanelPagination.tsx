/**
 * @file src/module/super-admin/components/PanelPagination.tsx
 * Page controls for the panel list footers.
 *
 * The count and the page buttons are identical on every list, so they live
 * here once — the summary slot lets a page add its own wording.
 */

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import type { ListMeta } from '../hook/useServerList'

interface PanelPaginationProps {
  meta: ListMeta
  onPageChange: (page: number) => void
  isFetching?: boolean
  /** Replaces the default "Showing X–Y of Z" summary. */
  summary?: ReactNode
  className?: string
}

export function PanelPagination({
  meta,
  onPageChange,
  isFetching = false,
  summary,
  className,
}: PanelPaginationProps) {
  const totalPages = Math.max(1, meta.last_page)
  const firstRow = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const lastRow = Math.min(meta.current_page * meta.per_page, meta.total)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
      {summary ?? (
        <span>
          Showing <strong>{firstRow}</strong>–<strong>{lastRow}</strong> of{' '}
          <strong>{meta.total}</strong>
        </span>
      )}

      <span className="flex items-center gap-2">
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, meta.current_page - 1))}
          disabled={meta.current_page <= 1 || isFetching}
          className="cursor-pointer rounded-full border-cream-300 text-[0.7rem] font-semibold"
        >
          <ChevronLeft className="size-3" aria-hidden />
          <span>Previous</span>
        </Button>

        <span className="tabular-nums">
          Page <strong>{meta.current_page}</strong> of <strong>{totalPages}</strong>
        </span>

        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, meta.current_page + 1))}
          disabled={meta.current_page >= totalPages || isFetching}
          className="cursor-pointer rounded-full border-cream-300 text-[0.7rem] font-semibold"
        >
          <span>Next</span>
          <ChevronRight className="size-3" aria-hidden />
        </Button>
      </span>
    </div>
  )
}
