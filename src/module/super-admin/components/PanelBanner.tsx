/**
 * @file src/module/super-admin/components/PanelBanner.tsx
 * Inline success / error banner used by every panel page.
 *
 * The banner used to be copy-pasted nine times with slightly different
 * colours, which is how the module drifted out of the brand palette.
 */

import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { cn } from 'cn'

interface PanelBannerProps {
  tone: 'success' | 'error' | 'info'
  message: string
  onDismiss?: () => void
  className?: string
}

const TONE_STYLES = {
  success: {
    shell: 'border-emerald-200/90 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    button: 'hover:bg-emerald-100 hover:text-emerald-900',
  },
  error: {
    shell: 'border-maroon-200 bg-maroon-50 text-maroon-900',
    icon: 'text-maroon-600',
    button: 'hover:bg-maroon-100 hover:text-maroon-900',
  },
  info: {
    shell: 'border-gold-500/40 bg-gold-50 text-navy-900',
    icon: 'text-gold-600',
    button: 'hover:bg-gold-100 hover:text-navy-900',
  },
} as const

export function PanelBanner({
  tone,
  message,
  onDismiss,
  className,
}: PanelBannerProps) {
  const styles = TONE_STYLES[tone]
  const Icon = tone === 'success' ? CircleCheck : tone === 'error' ? CircleAlert : CircleAlert

  return (
    <div
      role="status"
      className={cn(
        'animate-panel-fade flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-xs',
        styles.shell,
        className,
      )}
    >
      <span className="flex items-start gap-2">
        <Icon className={cn('mt-px size-4 shrink-0', styles.icon)} aria-hidden />
        <span className="font-medium leading-relaxed">{message}</span>
      </span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'shrink-0 cursor-pointer rounded-full p-1 transition-colors',
            styles.button,
          )}
          aria-label="Dismiss message"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  )
}
