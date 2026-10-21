/**
 * @file src/module/super-admin/components/PanelSearch.tsx
 * Themed search field with a leading magnifier, used across panel lists.
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from 'cn'

interface PanelSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export function PanelSearch({
  value,
  onChange,
  placeholder,
  className,
}: PanelSearchProps) {
  return (
    <div className={cn('relative min-w-0 flex-1', className)}>
      <Search
        className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-gold-600"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 rounded-full border-cream-300 bg-cream-50 pr-4 pl-10 text-xs text-navy-900 placeholder:text-ink-400 focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40"
      />
    </div>
  )
}
