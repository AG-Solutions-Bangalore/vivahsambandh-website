/**
 * @file src/module/super-admin/components/StatusBadge.tsx
 * Standardized status badge component for Admin and Member statuses.
 */

import { cn } from 'cn'
import type { AdminMemberStatus, MemberStatus } from '../types'

interface StatusBadgeProps {
  status: AdminMemberStatus | MemberStatus | string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().trim()

  let styleClasses = 'bg-stone-100 text-stone-700 border-stone-200'
  let dotClass = 'bg-stone-500'

  if (norm === 'approved') {
    styleClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 shadow-xs'
    dotClass = 'bg-emerald-500 ring-2 ring-emerald-200'
  } else if (norm === 'pending') {
    styleClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-xs'
    dotClass = 'bg-amber-500 ring-2 ring-amber-200 animate-pulse'
  } else if (norm === 'hold') {
    styleClasses = 'bg-blue-50 text-blue-800 border-blue-200/80 shadow-xs'
    dotClass = 'bg-blue-500 ring-2 ring-blue-200'
  } else if (norm === 'married') {
    styleClasses = 'bg-purple-50 text-purple-800 border-purple-200/80 shadow-xs'
    dotClass = 'bg-purple-500 ring-2 ring-purple-200'
  } else if (norm === 'cancel' || norm === 'cancelled' || norm === 'rejected') {
    styleClasses = 'bg-rose-50 text-rose-800 border-rose-200/80 shadow-xs'
    dotClass = 'bg-rose-500 ring-2 ring-rose-200'
  }

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[0.7rem] gap-1' : 'px-2.5 py-1 text-xs gap-1.5'

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border transition-colors',
        sizeClasses,
        styleClasses,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', dotClass)} />
      {status || 'Unknown'}
    </span>
  )
}
