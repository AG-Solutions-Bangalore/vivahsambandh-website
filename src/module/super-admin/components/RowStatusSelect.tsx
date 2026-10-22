/**
 * @file src/module/super-admin/components/RowStatusSelect.tsx
 * Compact status dropdown for table rows: pick a status value and the page
 * opens its usual confirmation dialog before saving.
 *
 * Colours come from the shared status tone map so the trigger always wears
 * the same colour language as the status badge beside it.
 */

import { cn } from 'cn'
import { statusTone } from './statusTones'

interface RowStatusSelectProps<T extends string> {
  value: T
  options: readonly T[]
  onSelect: (next: T) => void
  /** Accessible name, e.g. "Change status for Rohan Mehta". */
  label: string
  className?: string
}

export function RowStatusSelect<T extends string>({
  value,
  options,
  onSelect,
  label,
  className,
}: RowStatusSelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(event) => {
        const next = event.target.value as T
        if (next === value) return
        onSelect(next)
      }}
      title={label}
      aria-label={label}
      className={cn(
        'h-8 cursor-pointer rounded-full border px-2.5 pr-7 text-[0.7rem] font-bold transition-colors focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none',
        statusTone(value).chip,
        className,
      )}
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  )
}
