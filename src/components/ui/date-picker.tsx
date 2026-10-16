/**
 * @file src/components/ui/date-picker.tsx
 * Shadcn Base UI Date Picker component built with Popover, PopoverContent, PopoverTrigger,
 * and react-day-picker Calendar.
 * Matches https://ui.shadcn.com/docs/components/base/date-picker
 */

"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "cn"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  value: string // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void
  error?: boolean
  disabled?: boolean
  placeholder?: string
}

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth()
const CURRENT_DAY = NOW.getDate()
const MAX_YEAR = CURRENT_YEAR - 21
const START_MONTH = new Date(1950, 0, 1)
const END_MONTH = new Date(MAX_YEAR, 11, 31)

function getAgeFromDateStr(val: string): number | null {
  if (!val) return null
  const parts = val.split("-")
  if (parts.length !== 3) return null
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  let a = CURRENT_YEAR - y
  const mDiff = CURRENT_MONTH - m
  if (mDiff < 0 || (mDiff === 0 && CURRENT_DAY < d)) {
    a--
  }
  return a
}

export function DatePicker({
  id,
  value,
  onChange,
  error = false,
  disabled = false,
  placeholder = "Select Date of Birth",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse YYYY-MM-DD to Date
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined
    const d = parse(value, "yyyy-MM-dd", START_MONTH)
    return isValid(d) ? d : undefined
  }, [value])

  const age = getAgeFromDateStr(value)
  const isUnderage = age !== null && age < 21

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formatted = format(selectedDate, "yyyy-MM-dd")
      onChange(formatted)
      setOpen(false)
    } else {
      onChange("")
    }
  }

  return (
    <div className="space-y-1.5" id={id ? `${id}-container` : undefined}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-8 w-full items-center justify-between rounded-xl border px-3.5 text-xs sm:text-sm text-left transition outline-none select-none focus-visible:ring-2',
            error || isUnderage
              ? "border-maroon-500 bg-maroon-50/30 text-navy-900 focus:border-maroon-600 focus:ring-maroon-500/20"
              : "border-cream-300 bg-cream-50/70 text-navy-900 focus:border-gold-500 focus:bg-white focus:ring-gold-500/20",
            !value && "text-ink-400"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="size-4 shrink-0 text-gold-600" />
            <span className={parsedDate ? "font-medium text-navy-900" : "text-ink-400"}>
              {parsedDate ? format(parsedDate, "dd MMMM yyyy") : placeholder}
            </span>
          </span>
          {age !== null && (
            <span
              className={cn(
                "ml-2 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold font-mono",
                isUnderage
                  ? "bg-maroon-100 text-maroon-800"
                  : "bg-emerald-100 text-emerald-800"
              )}
            >
              {age} yrs
            </span>
          )}
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2 border-cream-200 bg-white shadow-xl rounded-2xl" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={START_MONTH}
            endMonth={END_MONTH}
            selected={parsedDate}
            onSelect={handleSelect}
            defaultMonth={parsedDate || new Date(MAX_YEAR - 4, 0, 1)}
            disabled={(d) => d > END_MONTH || d < START_MONTH}
            className="rounded-xl border border-cream-200 p-3"
          />
          {isUnderage && (
            <div className="mt-2 rounded-lg bg-maroon-50 p-2 text-center text-xs font-semibold text-maroon-700">
              Candidate must be at least 21 years old
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
