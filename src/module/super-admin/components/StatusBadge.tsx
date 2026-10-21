/**
 * @file src/module/super-admin/components/StatusBadge.tsx
 * Standardized status badge component for Admin and Member statuses.
 */

import { cn } from 'cn'
import type { AdminMemberStatus, MemberStatus } from '../types'
import { statusTone } from './statusTones'

interface StatusBadgeProps {
  status: AdminMemberStatus | MemberStatus | string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const tone = statusTone(status || '')

  const sizeClasses =
    size === 'sm'
      ? 'gap-1.5 px-2 py-0.5 text-[0.7rem]'
      : 'gap-1.5 px-2.5 py-1 text-xs'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold whitespace-nowrap transition-colors',
        sizeClasses,
        tone.chip,
        className,
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', tone.dot)} aria-hidden />
      {status || 'Unknown'}
    </span>
  )
}
