/**
 * @file src/components/ui/option-pills.tsx
 * Accessible single-select pill group (radiogroup) replacing raw radio inputs.
 * Keyboard navigable, aria-checked, focus-visible ring, error state.
 */

import { cn } from 'cn'

export interface OptionPillsOption {
  value: string
  label: string
}

interface OptionPillsProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  options: OptionPillsOption[]
  error?: boolean
  ariaLabel?: string
}

export function OptionPills({
  id,
  name,
  value,
  onChange,
  options,
  error = false,
  ariaLabel,
}: OptionPillsProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      aria-invalid={error}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border p-1.5 transition',
        error
          ? 'border-maroon-500 bg-maroon-50/20'
          : 'border-cream-300 bg-cream-50/70',
      )}
    >
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                onChange(opt.value)
              }
            }}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition outline-none active:scale-[0.98]',
              'focus-visible:ring-2 focus-visible:ring-gold-500/40',
              selected
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white text-navy-900 hover:bg-gold-50 hover:text-gold-800',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/** Convenience Yes/No variant used across horoscope + Gotra questions. */
export function YesNoPills(
  props: Omit<OptionPillsProps, 'options'>,
) {
  return (
    <OptionPills
      {...props}
      options={[
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' },
      ]}
    />
  )
}
