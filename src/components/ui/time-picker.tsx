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
    <div className="w-full h-8 space-y-1" id={id}>
      <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-1.5 items-center h-full">
        {/* Hour (1-12) */}
        <div className="min-w-0 h-full">
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
            className="h-full px-2"
          />
        </div>

        {/* Minute (00-59) */}
        <div className="min-w-0 h-full">
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
            className="h-full px-2"
          />
        </div>

        {/* AM / PM Segmented Toggle — full width so it never squeezes */}
        <div
          role="radiogroup"
          aria-label="AM or PM"
          className={cn(
            'relative h-full grid grid-cols-2 gap-1 rounded-full border p-1 transition',
            error
              ? 'border-maroon-500 bg-maroon-50/30'
              : 'border-cream-300 bg-cream-50/70',
          )}
        >
          {/* Gliding active pill — AM ⇄ PM */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-navy-900 shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: 'calc((100% - 0.5rem - 0.25rem) / 2)',
              transform:
                period === 'PM'
                  ? 'translateX(calc(100% + 0.25rem))'
                  : 'translateX(0)',
            }}
          />
          {(['AM', 'PM'] as const).map((p) => (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={period === p}
              onClick={() => handlePeriodChange(p)}
              className={cn(
                'relative z-10 h-full w-full inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold cursor-pointer transition-colors duration-200 outline-none active:scale-[0.98]',
                'focus-visible:ring-2 focus-visible:ring-gold-500/40',
                period === p
                  ? 'text-white'
                  : 'text-navy-900 hover:text-gold-700',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
