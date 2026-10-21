/**
 * @file src/components/ui/option-pills.tsx
 * Accessible single-select pill group (radiogroup) replacing raw radio inputs.
 * Keyboard navigable, aria-checked, focus-visible ring, error state.
 */

import { useTranslation } from 'react-i18next'
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

const GAP_REM = 0.375 // container gap-1.5
const PAD_REM = 0.5 // container p-1 (both sides combined)

export function OptionPills({
  id,
  name,
  value,
  onChange,
  options,
  error = false,
  ariaLabel,
}: OptionPillsProps) {
  const selectedIndex = options.findIndex((opt) => opt.value === value)
  const count = options.length || 1

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      aria-invalid={error}
      className={cn(
        'relative h-11 w-full flex items-center gap-1.5 rounded-full border p-1 transition shadow-xs',
        error
          ? 'border-maroon-500 bg-maroon-50/20'
          : 'border-cream-300 bg-cream-50/70',
      )}
    >
      {/* Gliding active pill — same motion language as the header language switcher */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-navy-900 shadow-xs transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `calc((100% - ${PAD_REM}rem - ${(count - 1) * GAP_REM}rem) / ${count})`,
          transform: `translateX(calc(${Math.max(selectedIndex, 0)} * (100% + ${GAP_REM}rem)))`,
          opacity: selectedIndex === -1 ? 0 : 1,
        }}
      />
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
              'relative z-10 h-full flex-1 rounded-full px-4 py-1 text-sm font-bold whitespace-nowrap cursor-pointer transition-colors duration-200 outline-none active:scale-[0.98]',
              'focus-visible:ring-2 focus-visible:ring-gold-500/40',
              selected ? 'text-white' : 'text-navy-900 hover:text-gold-800',
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
  props: Omit<OptionPillsProps, 'options'> & {
    yesLabel?: string
    noLabel?: string
  },
) {
  const { t } = useTranslation()
  const yes = props.yesLabel ?? t('registrationPage.form.yes', 'Yes')
  const no = props.noLabel ?? t('registrationPage.form.no', 'No')

  return (
    <OptionPills
      {...props}
      options={[
        { value: 'Yes', label: yes },
        { value: 'No', label: no },
      ]}
    />
  )
}
