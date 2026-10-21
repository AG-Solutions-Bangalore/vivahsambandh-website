/**
 * @file src/module/super-admin/components/PanelModal.tsx
 * Accessible modal shell shared by every panel dialog.
 *
 * Handles the scrim, Escape-to-close, body scroll lock and the close
 * affordance, so the individual pages only supply content and actions.
 */

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from 'cn'

interface PanelModalProps {
  isOpen: boolean
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  /** Wider shell for biodata/profile views. */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

export function PanelModal({
  isOpen,
  title,
  description,
  icon,
  children,
  footer,
  onClose,
  size = 'md',
  className,
}: PanelModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="panel-scrim animate-panel-fade"
      onClick={onClose}
    >
      <div
        className={cn(
          'panel-card animate-panel-scale relative max-h-[90vh] overflow-y-auto p-6 sm:p-7',
          SIZE_CLASSES[size],
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-ink-400 transition-colors hover:bg-cream-100 hover:text-ink-700"
          aria-label="Close dialog"
        >
          <X className="size-4.5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          {icon ? (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="font-display text-base font-bold text-balance text-navy-900 sm:text-lg">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-ink-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">{children}</div>

        {footer ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-cream-300/80 pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
