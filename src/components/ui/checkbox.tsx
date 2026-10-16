/**
 * @file src/components/ui/checkbox.tsx
 * Brand-themed shadcn (Base UI) Checkbox with focus ring + error state.
 */

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cn } from 'cn'
import { Check } from 'lucide-react'

interface CheckboxProps extends CheckboxPrimitive.Root.Props {
  error?: boolean
}

function Checkbox({ className, error = false, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      aria-invalid={error}
      className={cn(
        'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border transition outline-none',
        'focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[checked]:border-gold-600 data-[checked]:bg-gold-600 data-[checked]:text-white',
        error
          ? 'border-maroon-500 bg-maroon-50/30'
          : 'border-cream-300 bg-white hover:border-gold-500',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        render={
          <span className="flex items-center justify-center">
            <Check className="size-3" strokeWidth={3} aria-hidden />
          </span>
        }
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
