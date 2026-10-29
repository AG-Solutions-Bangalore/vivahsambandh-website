/**
 * @file src/components/LotusMark.tsx
 * The   lotus mark — the shared brand glyph used by the public
 * header and the Super Admin panel so both surfaces read as one brand.
 */

interface LotusMarkProps {
  className?: string
}

export default function LotusMark({ className = 'h-8 w-8' }: LotusMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 3c2.5 3.2 4 6.4 4 9.2 2.8-.6 5.4-.4 8 .8-2.2 1.4-4.7 2-7.4 1.9 1.5 1.2 2.6 2.9 3.1 5-2.6.7-5.3.5-7.7-.5-2.4 1-5.1 1.2-7.7.5.5-2.1 1.6-3.8 3.1-5-2.7.1-5.2-.5-7.4-1.9 2.6-1.2 5.2-1.4 8-.8 0-2.8 1.5-6 4-9.2z"
      />
      <ellipse cx="16" cy="27" rx="9" ry="1.6" fill="currentColor" opacity=".35" />
    </svg>
  )
}
