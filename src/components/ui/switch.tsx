/**
 * @file src/components/ui/switch.tsx
 * Brand-themed shadcn (Base UI) Switch with an iOS-style sliding thumb.
 *
 * The thumb rides on a spring curve and grows slightly under the finger,
 * so flipping a switch reads as a physical movement rather than a colour
 * change. `busy` marks the control as saving without dimming it.
 */

import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from 'cn'

interface SwitchProps extends SwitchPrimitive.Root.Props {
  error?: boolean
  /** Marks the switch as saving — the thumb pulses until the work settles. */
  busy?: boolean
}

function Switch({
  className,
  error = false,
  busy = false,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-busy={busy ? '' : undefined}
      aria-invalid={error}
      aria-busy={busy || undefined}
      className={cn(
        'group/switch relative inline-flex h-[1.4rem] w-[2.4rem] shrink-0 cursor-pointer items-center rounded-full border border-transparent p-[0.1rem]',
        'transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none select-none',
        'focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'motion-reduce:transition-none',
        'data-[checked]:bg-emerald-500',
        'data-[busy]:[&_[data-slot=switch-thumb]]:animate-pulse',
        error
          ? 'bg-maroon-50 ring-1 ring-maroon-500'
          : 'bg-cream-200',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-[1.2rem] rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.28)] ring-1 ring-black/5',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          'motion-reduce:transition-none',
          'group-active/switch:scale-110',
          'data-[checked]:translate-x-4 data-[unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
