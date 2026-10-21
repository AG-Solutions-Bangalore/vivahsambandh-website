/**
 * @file src/module/super-admin/components/ConfirmDialog.tsx
 * Accessible modal dialog for destructive actions, status updates, and confirmations.
 */

import { useEffect, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary' | 'success'
  isLoading?: boolean
  children?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

const VARIANT_STYLES = {
  danger: {
    icon: 'bg-maroon-100 text-maroon-600',
    Icon: CircleAlert,
    confirm: 'bg-maroon-600 text-white hover:bg-maroon-700',
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600',
    Icon: CircleCheck,
    confirm: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
  primary: {
    icon: 'bg-gold-100 text-gold-700',
    Icon: Info,
    confirm: 'bg-navy-900 text-white hover:bg-navy-700',
  },
} as const

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
  children,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const styles = VARIANT_STYLES[variant]
  const Icon = styles.Icon

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="panel-scrim animate-panel-fade"
      onClick={isLoading ? undefined : onClose}
    >
      <div
        className="panel-card animate-panel-scale relative w-full max-w-md p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-full',
              styles.icon,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 pr-2">
            <h3
              id="confirm-dialog-title"
              className="font-display text-lg font-bold text-navy-900"
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-cream-300/80 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer rounded-full border-cream-300 px-4 text-xs font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'cursor-pointer rounded-full px-5 text-xs font-semibold',
              styles.confirm,
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
