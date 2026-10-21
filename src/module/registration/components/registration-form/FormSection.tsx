/**
 * @file src/module/registration/components/registration-form/FormSection.tsx
 * Presentational shell for each numbered part of the registration form.
 *
 * Purely visual: it renders the numbered badge, the part title/subtitle and
 * the body slot. It holds no state and adds no behaviour of its own — the
 * section components keep owning every piece of form logic.
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface FormSectionProps {
  /** Anchor id — also used by the sticky step navigator. */
  id: string
  /** Part number shown in the badge (1 → "01"). */
  step: number
  /** Eyebrow text, e.g. "Part 1". */
  badge: string
  title: string
  subtitle?: string
  /** Extra classes for the card shell. */
  className?: string
  /** Extra classes for the body area. */
  bodyClassName?: string
  children: ReactNode
}

export default function FormSection({
  id,
  step,
  badge,
  title,
  subtitle,
  className,
  bodyClassName,
  children,
}: FormSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'scroll-mt-16 overflow-hidden rounded-[1.5rem] border border-gold-500/25 bg-white shadow-card',
        className,
      )}
    >
      <div className="flex items-start gap-4 border-b border-cream-200 bg-gradient-to-r from-cream-50 via-cream-50/60 to-white px-5 py-5 sm:gap-5 sm:px-8 sm:py-6 lg:px-10">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy-900 font-display text-base font-bold leading-none text-gold-400 shadow-sm ring-1 ring-navy-700 sm:size-12 sm:text-lg"
        >
          {String(step).padStart(2, '0')}
        </span>
        <div className="min-w-0 pt-0.5">
          <span className="eyebrow">{badge}</span>
          <h2
            id={`${id}-title`}
            className="mt-1.5 font-display text-lg font-bold leading-tight tracking-tight text-navy-900 sm:text-xl lg:text-2xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-ink-500 sm:text-[13px]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className={cn('px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9', bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
