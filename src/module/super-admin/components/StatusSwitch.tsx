/**
 * @file src/module/super-admin/components/StatusSwitch.tsx
 * The publication-state control shared by every panel list.
 *
 * Blogs, categories, clients, FAQs, testimonials and gallery photos all
 * carry the same two-state flag, so they all carry the same control: a
 * switch that flips the record between Active and Inactive, with the
 * current state spelled out beside it so the row still reads at a glance.
 *
 * The flip is optimistic. The switch moves the instant it is touched and
 * only rolls back to the server state if the request fails, so the panel
 * never feels like it is waiting on the network.
 */

import { useId, useState } from 'react'
import { cn } from 'cn'
import { Switch } from '@/components/ui/switch'

export type PublicationStatus = 'Active' | 'Inactive'

interface StatusSwitchProps {
  /** The status the record currently holds on the server. */
  status: PublicationStatus
  /**
   * Moves the record to the given status. Returning a promise lets the
   * switch flip instantly and roll back to the server state when the
   * request fails.
   */
  onStatusChange: (nextStatus: PublicationStatus) => Promise<unknown>
  /** Blocks interaction entirely, e.g. while the record is read-only. */
  disabled?: boolean
  /** Hides the Active / Inactive word, e.g. on a compact card overlay. */
  showLabel?: boolean
  /** Accessible name used when the visible word is hidden. */
  label?: string
  className?: string
}

interface OptimisticStatus {
  /** The status the server held when the switch was flipped. */
  base: PublicationStatus
  /** The status the switch moved to. */
  next: PublicationStatus
}

export function StatusSwitch({
  status,
  onStatusChange,
  disabled = false,
  showLabel = true,
  label,
  className,
}: StatusSwitchProps) {
  const labelId = useId()
  const [optimistic, setOptimistic] = useState<OptimisticStatus | null>(null)
  const [busy, setBusy] = useState(false)

  // The optimistic value only holds while the server still reports the
  // status the flip started from. As soon as the server answers with
  // something new, the saved state takes over and the row settles on it.
  const current =
    optimistic && optimistic.base === status ? optimistic.next : status
  const isActive = current === 'Active'

  const handleCheckedChange = async (checked: boolean) => {
    const next: PublicationStatus = checked ? 'Active' : 'Inactive'

    setOptimistic({ base: status, next })
    setBusy(true)

    try {
      await onStatusChange(next)
    } catch {
      // The request failed — fall back to whatever the server still holds.
      setOptimistic(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Switch
        checked={isActive}
        disabled={disabled || busy}
        busy={busy}
        onCheckedChange={handleCheckedChange}
        aria-labelledby={showLabel ? labelId : undefined}
        aria-label={showLabel ? undefined : (label ?? status)}
        className={busy ? 'disabled:opacity-100' : undefined}
      />
      {showLabel ? (
        <span
          id={labelId}
          className={cn(
            'text-xs font-semibold whitespace-nowrap transition-colors duration-200',
            isActive ? 'text-emerald-700' : 'text-ink-500',
          )}
        >
          {current}
        </span>
      ) : null}
    </span>
  )
}
