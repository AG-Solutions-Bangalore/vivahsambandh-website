/**
 * @file src/components/ui/time-picker.tsx
 * Shadcn/Base-nova styled Time of Birth picker with 12-hour format and AM/PM selector.
 */

import { useMemo, useState, useEffect } from 'react'
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
  // Parse initial value (e.g., "10:30 AM" or "10:30")
  const parseTime = (str: string) => {
    if (!str) return { h: '', m: '', p: 'AM' }
    const match = str.match(/(\d+):(\d+)\s*(AM|PM)?/i)
    if (match) {
      let hourNum = parseInt(match[1], 10)
      let period = match[3] ? match[3].toUpperCase() : 'AM'
      // If 24-hr format was provided
      if (!match[3] && hourNum >= 12) {
        period = 'PM'
        if (hourNum > 12) hourNum -= 12
      } else if (!match[3] && hourNum === 0) {
        hourNum = 12
      }
      const hStr = hourNum < 10 ? `0${hourNum}` : `${hourNum}`
      return { h: hStr, m: match[2], p: period }
    }
    return { h: '', m: '', p: 'AM' }
  }

  const initial = parseTime(value)
  const [hour, setHour] = useState(initial.h)
  const [minute, setMinute] = useState(initial.m)
  const [period, setPeriod] = useState(initial.p || 'AM')

  // When hour, minute, or period changes, emit formatted string
  useEffect(() => {
    if (hour && minute) {
      const formatted = `${hour}:${minute} ${period}`
      if (formatted !== value) {
        onChange(formatted)
      }
    } else if (value && (!hour || !minute)) {
      onChange('')
    }
  }, [hour, minute, period, onChange, value])

  // Sync external changes
  useEffect(() => {
    if (value) {
      const parsed = parseTime(value)
      if (parsed.h !== hour) setHour(parsed.h)
      if (parsed.m !== minute) setMinute(parsed.m)
      if (parsed.p !== period) setPeriod(parsed.p)
    } else if (hour || minute) {
      setHour('')
      setMinute('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

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
            onValueChange={setHour}
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
            onValueChange={setMinute}
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
            onClick={() => setPeriod(p)}
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
