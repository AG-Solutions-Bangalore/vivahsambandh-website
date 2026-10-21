/**
 * @file src/module/super-admin/components/PanelFilterSelect.tsx
 * Compact themed dropdown used for the panel filter controls (status,
 * gender, audience). Replaces the inline pill rows, which crowded the
 * toolbar and wrapped badly on narrow screens.
 */

import { cn } from 'cn'
import { PanelSelect, type PanelSelectOption } from './PanelSelect'
import { statusTone } from './statusTones'

interface PanelFilterSelectProps<T extends string> {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
  className?: string
  /** Accessible id — required so the label is programmatically linked. */
  id: string
  /** Shows the status colour dot next to each option. */
  showStatusDots?: boolean
}

export function PanelFilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  id,
  showStatusDots = false,
}: PanelFilterSelectProps<T>) {
  const mapped: PanelSelectOption<T>[] = options.map((option) => ({
    value: option,
    label: option,
    dot: showStatusDots ? statusTone(option).dotPlain : undefined,
  }))

  return (
    <PanelSelect
      id={id}
      label={label}
      value={value}
      options={mapped}
      onChange={onChange}
      className={cn('w-full sm:w-44', className)}
    />
  )
}
