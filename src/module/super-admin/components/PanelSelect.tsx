/**
 * @file src/module/super-admin/components/PanelSelect.tsx
 * Brand-styled dropdown for the Super Admin Panel.
 *
 * The shared `ui/select` primitive carries a neutral grey hairline and
 * generic square-ish popup, which reads as scaffolding rather than as part
 * of the Vivah Sambandh brand. This builds the same accessible base-ui
 * behaviour (keyboard, type-ahead, focus management) with the panel's own
 * surfaces: warm paper popup, gold hairline, brand radius and shadow.
 *
 * Long option lists — categories, for instance — need a search field, so
 * the popup can filter the options as the admin types.
 */

import { useMemo, useState } from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from 'cn'

export interface PanelSelectOption<T extends string> {
  value: T
  label: string
  /** Optional leading dot that carries the status colour. */
  dot?: string
}

interface PanelSelectProps<T extends string> {
  id: string
  /** Accessible name; also used as the visible prefix inside the trigger. */
  label: string
  value: T
  options: readonly PanelSelectOption<T>[]
  onChange: (value: T) => void
  className?: string
  triggerClassName?: string
  /**
   * Hides the inline prefix so an external `<label>` can name the field
   * instead — used by the forms, which already label every input.
   */
  showLabel?: boolean
  /** Shows a search field above the options and narrows them as you type. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Shown when nothing is selected. */
  placeholder?: string
  /** Shown when the search matches no option. */
  emptyText?: string
  /** Blocks interaction with the dropdown. */
  disabled?: boolean
}

export function PanelSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
  showLabel = true,
  searchable = false,
  searchPlaceholder = 'Search…',
  placeholder = 'Select…',
  emptyText = 'No matches found',
  disabled = false,
}: PanelSelectProps<T>) {
  const [query, setQuery] = useState('')

  const selected = options.find((option) => option.value === value)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }, [options, query])

  // Base UI keeps the popup unmounted while it is closed, so the trigger
  // would fall back to the raw value (an API id like "5"). Passing `items`
  // hands the labels to the select itself, so the chosen name stays
  // readable in the trigger.
  const items = useMemo(
    () => options.map((option) => ({ value: option.value, label: option.label })),
    [options],
  )

  return (
    <div className={cn('min-w-0', className)}>
      <SelectPrimitive.Root
        items={items}
        value={value}
        disabled={disabled}
        onValueChange={(next) => onChange((next ?? value) as T)}
        onOpenChange={(open) => {
          if (!open) setQuery('')
        }}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-label={label}
          className={cn(
            'group/trigger flex h-10 w-full cursor-pointer items-center gap-2 rounded-full border border-cream-300 bg-white pr-3 pl-4 text-left transition-colors duration-150',
            'hover:border-gold-500/60 hover:bg-cream-50',
            'focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 focus-visible:outline-none',
            'data-[popup-open]:border-gold-500 data-[popup-open]:bg-cream-50',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-cream-300 disabled:hover:bg-white',
            triggerClassName,
          )}
        >
          {showLabel ? (
            <>
              <span className="text-[0.66rem] font-bold tracking-[0.14em] text-ink-400 uppercase">
                {label}
              </span>
              <span className="h-3 w-px shrink-0 bg-cream-300" aria-hidden />
            </>
          ) : null}
          {selected?.dot ? (
            <span
              className={cn('size-1.5 shrink-0 rounded-full', selected.dot)}
              aria-hidden
            />
          ) : null}
          {selected ? (
            <SelectPrimitive.Value className="flex-1 truncate text-xs font-semibold text-navy-900" />
          ) : value ? (
            <span className="flex-1 truncate text-xs font-semibold text-navy-900">
              {value}
            </span>
          ) : (
            <span className="flex-1 truncate text-xs font-semibold text-ink-400">
              {placeholder}
            </span>
          )}
          <SelectPrimitive.Icon
            render={
              <ChevronDown className="size-3.5 shrink-0 text-ink-400 transition-transform duration-150 group-data-[popup-open]/trigger:rotate-180" />
            }
          />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Positioner
            sideOffset={8}
            align="start"
            className="isolate z-50"
          >
            <SelectPrimitive.Popup
              className={cn(
                'animate-panel-scale flex w-(--anchor-width) min-w-44 origin-top flex-col overflow-hidden rounded-2xl border border-gold-500/30 bg-white p-1.5 shadow-lift',
                'data-[side=top]:origin-bottom',
              )}
            >
              {searchable && options.length > 1 ? (
                <div
                  className="flex items-center gap-2 border-b border-cream-200 px-2 py-2"
                  // The select listens for key presses to drive type-ahead and
                  // list navigation. While the admin is typing a search term
                  // those keys belong to the input — except Escape, which
                  // still has to close the popup.
                  onKeyDown={(event) => {
                    if (event.key !== 'Escape') event.stopPropagation()
                  }}
                >
                  <Search className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="w-full bg-transparent text-xs text-navy-900 outline-none placeholder:text-ink-400"
                  />
                </div>
              ) : null}

              <SelectPrimitive.List className="max-h-64 overflow-y-auto overscroll-contain">
                {visible.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-ink-400">
                    {emptyText}
                  </p>
                ) : (
                  visible.map((option) => (
                    <SelectPrimitive.Item
                      key={option.value}
                      value={option.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-navy-900 outline-none select-none',
                        'data-[highlighted]:bg-gold-50 data-[highlighted]:text-navy-900',
                        'data-[selected]:text-navy-900',
                      )}
                    >
                      {option.dot ? (
                        <span
                          className={cn('size-1.5 shrink-0 rounded-full', option.dot)}
                          aria-hidden
                        />
                      ) : (
                        <span className="size-1.5 shrink-0" aria-hidden />
                      )}
                      <SelectPrimitive.ItemText className="flex-1 truncate">
                        {option.label}
                      </SelectPrimitive.ItemText>
                      <SelectPrimitive.ItemIndicator
                        render={
                          <span className="flex size-4 shrink-0 items-center justify-center text-gold-700" />
                        }
                      >
                        <Check className="size-3.5" aria-hidden />
                      </SelectPrimitive.ItemIndicator>
                    </SelectPrimitive.Item>
                  ))
                )}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}
