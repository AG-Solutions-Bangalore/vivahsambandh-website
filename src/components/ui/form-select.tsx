/**
 * @file src/components/ui/form-select.tsx
 * Brand-themed shadcn (Base UI) Select with optional built-in search.
 * Full-width trigger, error state, disabled + loading states.
 * The trigger is a real <button> so existing focus/scroll-to-field keeps working.
 */

import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { Loader2, Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  id: string
  value: string
  onValueChange: (value: string, eventDetails?: unknown) => void
  options: FormSelectOption[]
  placeholder?: string
  error?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  disabledText?: string
  searchable?: boolean
  searchPlaceholder?: string
  'aria-invalid'?: boolean
}

export function FormSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error = false,
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  disabledText,
  searchable = false,
  searchPlaceholder = 'Search...',
  'aria-invalid': ariaInvalid,
}: FormSelectProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const isDisabled = disabled || loading

  // NOTE: resolve the display label from `options` ourselves instead of
  // relying on <SelectValue/>. Base UI unmounts the popup when closed, so
  // the selected <SelectItem> isn't in the DOM and Value falls back to the
  // raw value (e.g. an API id like "5"). Rendering the label directly keeps
  // "B.Tech" visible instead of "5" at all times, including while options
  // are still loading or filtered by search.
  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label
    : undefined

  return (
    <Select
      value={value}
      onValueChange={(v) => onValueChange(v ?? '')}
      disabled={isDisabled}
    >
      <SelectTrigger
        id={id}
        aria-invalid={ariaInvalid ?? error}
        className={cn(
          'h-auto w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus-visible:ring-2',
          error
            ? 'border-maroon-500 bg-maroon-50/30 text-navy-900 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20'
            : 'border-cream-300 bg-cream-50/70 text-navy-900 hover:bg-white focus-visible:border-gold-500 focus-visible:ring-gold-500/20 data-[placeholder]:text-ink-400',
        )}
      >
        {loading ? (
          <span className="flex flex-1 items-center gap-2 text-left text-ink-400">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {loadingText}
          </span>
        ) : selectedLabel ? (
          <span className="flex flex-1 truncate text-left">{selectedLabel}</span>
        ) : (
          <SelectValue
            placeholder={
              !value && disabledText && options.length === 0 ? disabledText : placeholder
            }
          />
        )}
      </SelectTrigger>
      <SelectContent className="max-h-72 rounded-xl border-cream-200 bg-white shadow-xl">
        {searchable && options.length > 5 && (
          <div
            className="sticky top-0 z-10 flex items-center gap-2 border-b border-cream-200 bg-white px-2.5 py-2"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Search className="size-3.5 shrink-0 text-ink-400" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-navy-900 outline-none placeholder:text-ink-400"
              aria-label={searchPlaceholder}
            />
          </div>
        )}
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-ink-400">
            {query ? `No match for "${query}"` : 'No options available'}
          </p>
        ) : (
          filtered.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
