/**
 * @file src/module/super-admin/components/ConfirmDialog.tsx
 * Accessible modal dialog for destructive actions, status updates, and confirmations.
 */

import { useEffect, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  const icon =
    variant === 'danger' ? (
      <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
        <AlertTriangle className="size-5" />
      </div>
    ) : variant === 'success' ? (
      <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <CheckCircle2 className="size-5" />
      </div>
    ) : (
      <div className="size-10 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center shrink-0">
        <Info className="size-5" />
      </div>
    )

  const confirmBtnVariant = variant === 'danger' ? 'destructive' : 'default'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-cream-200/70 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-1 text-ink-400 hover:bg-cream-100 hover:text-ink-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-start gap-4">
          {icon}
          <div className="flex-1 pr-6">
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-navy-900 font-display">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-ink-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-4 text-xs font-semibold cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmBtnVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full px-5 text-xs font-semibold cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
