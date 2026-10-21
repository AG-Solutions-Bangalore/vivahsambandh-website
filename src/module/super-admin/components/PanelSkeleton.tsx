/**
 * @file src/module/super-admin/components/PanelSkeleton.tsx
 * Skeleton placeholders for the Super Admin Panel.
 *
 * The panel never shows a spinner: a spinner hides the shape of the content
 * that is arriving and makes the table jump when the data lands. These
 * placeholders mirror the real layout so nothing shifts on resolve.
 */

import { cn } from 'cn'

interface SkeletonProps {
  className?: string
}

/** Single shimmering block. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

/** One or more lines of text placeholder. */
export function SkeletonText({
  lines = 1,
  className,
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-3',
            index === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}

/** Shimmering circle used for avatars and icon chips. */
export function SkeletonCircle({
  className,
  size = 'size-9',
}: SkeletonProps & { size?: string }) {
  return <Skeleton className={cn('rounded-full', size, className)} />
}

interface PanelTableSkeletonProps {
  rows?: number
  columns?: number
}

/** Table-shaped placeholder matching the shared panel table rhythm. */
export function PanelTableSkeleton({
  rows = 6,
  columns = 5,
}: PanelTableSkeletonProps) {
  return (
    <div className="divide-y divide-cream-200/80" aria-hidden="true">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
          <SkeletonCircle size="size-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <div className="hidden flex-1 gap-4 md:flex">
            {Array.from({ length: Math.max(0, columns - 3) }, (_, cellIndex) => (
              <Skeleton key={cellIndex} className="h-3 flex-1" />
            ))}
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder for a list of records (recent admins, notifications…). */
export function PanelListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-xl border border-cream-300/70 bg-cream-50/60 p-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonCircle />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

/** Placeholder for a dashboard KPI tile. */
export function PanelStatSkeleton() {
  return (
    <div className="panel-card p-5" aria-hidden="true">
      <Skeleton className="size-11 rounded-xl" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}
