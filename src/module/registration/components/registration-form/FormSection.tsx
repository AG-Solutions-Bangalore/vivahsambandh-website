/**
 * @file src/module/registration/components/registration-form/FormSection.tsx
 * Presentational shell for each numbered part of the registration form.
 *
 * Purely visual: it renders the part title/subtitle and the body slot. It
 * holds no state and adds no behaviour of its own — the section components
 * keep owning every piece of form logic.
 *
 * House style (see the design rules this project follows):
 * - flat surface: a 1px border, never an elevation on a resting panel
 * - one type voice: Gotu (display) for the title, Mukta (text) for the rest
 * - no badge, no tracked-caps kicker — the stepper above already names the
 *   part, so a second number would just be noise
 */

import type { ReactNode } from 'react'
import { cn } from 'cn'

interface FormSectionProps {
  /** Anchor id — also used by the stepper's scroll targets. */
  id: string
  title: string
  subtitle?: string
  /** Extra classes for the sheet shell. */
  className?: string
  /** Extra classes for the body area. */
  bodyClassName?: string
  /** Optional footer rendered inside the sheet, separated by a hairline rule. */
  footer?: ReactNode
  children: ReactNode
}

export default function FormSection({
  id,
  title,
  subtitle,
  className,
  bodyClassName,
  footer,
  children,
}: FormSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'scroll-mt-16 overflow-hidden rounded-[1.5rem] border border-cream-300 bg-white',
        className,
      )}
    >
      <div className="px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
        <h2
          id={`${id}-title`}
          className="font-display text-xl font-bold leading-tight tracking-tight text-navy-900 sm:text-2xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={cn(
          'border-t border-cream-200 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-9',
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer && (
        <div className="border-t border-cream-200 px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
          {footer}
        </div>
      )}
    </section>
  )
}
