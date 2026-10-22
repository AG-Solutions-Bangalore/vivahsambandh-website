/**
 * @file src/components/common/SearchableSelect.tsx
 * Brand-styled searchable select component with real-time filtering,
 * keyboard accessibility, and custom slug input support.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react'
import { cn } from 'cn'

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Search or select page...',
  searchPlaceholder = 'Type to search by name or slug...',
  className,
  disabled = false,
  error = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Find the selected option's human-friendly label
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  )

  // Filter options based on user search term
  const filteredOptions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q),
    )
  }, [options, searchTerm])

  // Does the search term exactly match any option's value?
  const hasExactMatch = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return options.some((opt) => opt.value.toLowerCase() === q)
  }, [options, searchTerm])

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      // Small timeout ensures popup DOM node is rendered and focused
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border px-3 text-left transition-colors duration-150',
          'text-xs font-semibold text-navy-900',
          error
            ? 'border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-2 focus-visible:ring-maroon-500/20'
            : 'border-cream-300 bg-cream-50/70 hover:border-gold-500/60 hover:bg-white focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40',
          disabled && 'cursor-not-allowed opacity-60 hover:bg-cream-50/70',
          className,
        )}
      >
        <span className="flex-1 truncate">
          {selectedOption ? (
            selectedOption.label
          ) : value ? (
            <span className="font-medium text-navy-800">
              {value} <span className="text-[11px] text-ink-400">({value})</span>
            </span>
          ) : (
            <span className="font-normal text-ink-400">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className="rounded-full p-0.5 text-ink-400 hover:bg-cream-200/60 hover:text-navy-900"
              title="Clear selection"
            >
              <X className="size-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-ink-400 transition-transform duration-150',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[260px] rounded-xl border border-gold-500/30 bg-white p-2 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 rounded-lg border border-cream-200 bg-cream-50/50 px-2.5 py-1.5">
            <Search className="size-3.5 shrink-0 text-ink-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full bg-transparent text-xs text-navy-900 outline-none placeholder:text-ink-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-ink-400 hover:text-navy-900"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            role="listbox"
            className="mt-1.5 max-h-56 overflow-y-auto overscroll-contain py-0.5 space-y-0.5"
          >
            {/* Custom option prompt if user types an unlisted slug */}
            {searchTerm.trim() && !hasExactMatch && (
              <button
                type="button"
                onClick={() =>
                  handleSelect(
                    searchTerm.trim().toLowerCase().replace(/^\/+|\/+$/g, ''),
                  )
                }
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-gold-50/60 px-2.5 py-2 text-left text-xs font-semibold text-gold-900 hover:bg-gold-100 transition-colors"
              >
                <Plus className="size-3.5 text-gold-600 shrink-0" />
                <span className="truncate">
                  Use custom slug: <code className="font-mono font-bold">"{searchTerm.trim().toLowerCase()}"</code>
                </span>
              </button>
            )}

            {filteredOptions.length === 0 && !searchTerm.trim() ? (
              <p className="px-3 py-4 text-center text-xs text-ink-400">
                No page placement options available.
              </p>
            ) : filteredOptions.length === 0 && searchTerm.trim() && hasExactMatch ? (
              <p className="px-3 py-4 text-center text-xs text-ink-400">
                No matching page found.
              </p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors',
                      isSelected
                        ? 'bg-gold-100/70 font-bold text-navy-950'
                        : 'text-navy-900 hover:bg-cream-100/70',
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-gold-600" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
