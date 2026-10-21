/**
 * @file src/components/ui/time-picker.tsx
 * Native HTML5 time picker styled to match the VivahSambandh luxury design system.
 * Features a gold clock icon, full 12-hour/24-hour bidirectionality, and native picker integration.
 */

import * as React from 'react'
import { Clock } from 'lucide-react'
import { cn } from 'cn'

export interface TimePickerProps {
  id?: string
  value: string // e.g. "10:30 AM" or "14:30"
  onChange: (timeStr: string) => void
  error?: boolean
  disabled?: boolean
  required?: boolean
  className?: string
}

function to24HourTime(str: string): string {
  if (!str) return ''
  const trimmed = str.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)?$/i)
  if (!match) return ''
  let hours = parseInt(match[1], 10)
  const minutes = match[2].padStart(2, '0')
  const period = match[3] ? match[3].toUpperCase() : null

  if (period === 'PM' && hours < 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

function to12HourTime(str: string): string {
  if (!str) return ''
  const trimmed = str.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{1,2})/i)
  if (!match) return ''
  let hours = parseInt(match[1], 10)
  const minutes = match[2].padStart(2, '0')
  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours > 12) hours -= 12
  if (hours === 0) hours = 12
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`
  return `${hoursStr}:${minutes} ${period}`
}

export function TimePicker({
  id,
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  className,
}: TimePickerProps) {
  const time24 = React.useMemo(() => to24HourTime(value), [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) {
      onChange('')
      return
    }
    onChange(to12HourTime(val))
  }

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      // Trigger native clock picker popup on click if supported
      if ('showPicker' in HTMLInputElement.prototype) {
        e.currentTarget.showPicker()
      }
    } catch {
      // Browser fallback (native icon click)
    }
  }

  return (
    <div className={cn('relative flex items-center w-full min-w-0', className)}>
      <Clock
        className="pointer-events-none absolute left-3.5 size-4 text-gold-600 shrink-0"
        aria-hidden="true"
      />
      <input
        type="time"
        id={id}
        value={time24}
        onChange={handleChange}
        onClick={handleClick}
        disabled={disabled}
        required={required}
        aria-invalid={error}
        className={cn(
          'h-11 w-full min-w-0 rounded-full border pl-11 pr-10 text-base md:text-sm font-medium text-navy-900 transition duration-200 outline-none cursor-pointer select-none focus-visible:ring-2 shadow-xs',
          error
            ? 'border-maroon-500 bg-maroon-50/30 text-navy-900 focus:border-maroon-600 focus:ring-maroon-500/20'
            : 'border-cream-300 bg-cream-50/70 text-navy-900 hover:bg-white hover:border-gold-500/60 focus:border-gold-500 focus:bg-white focus:ring-gold-500/20',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-75 hover:[&::-webkit-calendar-picker-indicator]:opacity-100',
        )}
      />
    </div>
  )
}
