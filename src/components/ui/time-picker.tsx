/**
 * @file src/components/ui/time-picker.tsx
 * Shadcn/Base-nova styled Time of Birth picker with 12-hour format and AM/PM selector.
 */

import { useMemo, useCallback } from 'react'
import { cn } from 'cn'
import { FormSelect } from '@/components/ui/form-select'

interface TimePickerProps {
  id?: string
  value: string // e.g. "10:30 AM" or "10:30"
  onChange: (timeStr: string) => void
  error?: boolean
  required?: boolean
}

export function TimePicker({
  id,
  value,
  onChange,
  error = false,
}: TimePickerProps) {
  // Parse hour, minute, period purely derived from value prop
  const { hour, minute, period } = useMemo(() => {
    if (!value) return { hour: '', minute: '', period: 'AM' as const }
    const match = value.match(/(\d+):(\d+)\s*(AM|PM)?/i)
    if (match) {
      let hourNum = parseInt(match[1], 10)
      let p: 'AM' | 'PM' = match[3] && match[3].toUpperCase() === 'PM' ? 'PM' : 'AM'
      if (!match[3] && hourNum >= 12) {
        p = 'PM'
        if (hourNum > 12) hourNum -= 12
      } else if (!match[3] && hourNum === 0) {
        hourNum = 12
      }
      const hStr = hourNum < 10 ? `0${hourNum}` : `${hourNum}`
      return { hour: hStr, minute: match[2], period: p }
    }
    return { hour: '', minute: '', period: 'AM' as const }
  }, [value])

  const handleHourChange = useCallback(
    (h: string) => {
      if (!h) {
        onChange('')
        return
      }
      const m = minute || '00'
      onChange(`${h}:${m} ${period}`)
    },
    [minute, period, onChange],
  )

  const handleMinuteChange = useCallback(
    (m: string) => {
      if (!m) {
        onChange('')
        return
      }
      const h = hour || '12'
      onChange(`${h}:${m} ${period}`)
    },
    [hour, period, onChange],
  )

  const handlePeriodChange = useCallback(
    (p: 'AM' | 'PM') => {
      if (!hour && !minute) {
        return
      }
      const h = hour || '12'
      const m = minute || '00'
      onChange(`${h}:${m} ${p}`)
    },
    [hour, minute, onChange],
  )

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const h = i + 1
        const val = h < 10 ? `0${h}` : `${h}`
        return { value: val, label: String(h) }
      }),
    [],
  )
  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const val = i < 10 ? `0${i}` : `${i}`
        return { value: val, label: val }
      }),
    [],
  )

  return (
    <div className="space-y-2" id={id}>
      <div className="grid grid-cols-2 gap-2">
        {/* Hour (1-12) */}
        <div>
          <label htmlFor={`${id}-hour`} className="sr-only">
            Hour
          </label>
          <FormSelect
            id={`${id}-hour`}
            value={hour}
            onValueChange={handleHourChange}
            options={hourOptions}
            placeholder="Hour"
            error={error}
          />
        </div>

        {/* Minute (00-59) */}
        <div>
          <label htmlFor={`${id}-min`} className="sr-only">
            Minute
          </label>
          <FormSelect
            id={`${id}-min`}
            value={minute}
            onValueChange={handleMinuteChange}
            options={minuteOptions}
            placeholder="Min"
            error={error}
          />
        </div>
      </div>

      {/* AM / PM Segmented Toggle — full width so it never squeezes */}
      <div
        role="radiogroup"
        aria-label="AM or PM"
        className={cn(
          'grid grid-cols-2 gap-1 rounded-xl border p-1 transition',
          error
            ? 'border-maroon-500 bg-maroon-50/30'
            : 'border-cream-300 bg-cream-50/70',
        )}
      >
        {(['AM', 'PM'] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={period === p}
            onClick={() => handlePeriodChange(p)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold transition outline-none active:scale-[0.98]',
              'focus-visible:ring-2 focus-visible:ring-gold-500/40',
              period === p
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-navy-900 hover:bg-white hover:text-gold-700',
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
