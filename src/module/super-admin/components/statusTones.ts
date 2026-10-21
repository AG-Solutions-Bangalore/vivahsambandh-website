/**
 * @file src/module/super-admin/components/statusTones.ts
 * The single colour language for member and admin statuses.
 *
 * Shared by the status badge and the filter dropdown so a status always
 * wears the same colour wherever it appears.
 *
 * Colour mapping is brand-led: sindoor maroon carries "cancelled", navy
 * carries "on hold", festive gold carries "married", while the two workflow
 * states keep the semantic amber / emerald the rest of the app uses.
 */

export interface StatusTone {
  /** Badge surface: background, border and label colour. */
  chip: string
  /** The status dot colour, used in the badge. */
  dot: string
  /** Plain dot colour (no ring) for the filter dropdown options. */
  dotPlain: string
}

export const STATUS_TONES: Record<string, StatusTone> = {
  approved: {
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500 ring-2 ring-emerald-200', dotPlain: 'bg-emerald-500',
  },
  pending: {
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500 ring-2 ring-amber-200 animate-pulse', dotPlain: 'bg-amber-500',
  },
  hold: {
    chip: 'border-navy-200 bg-navy-50 text-navy-800',
    dot: 'bg-navy-600 ring-2 ring-navy-200', dotPlain: 'bg-navy-600',
  },
  married: {
    chip: 'border-gold-300 bg-gold-50 text-gold-800',
    dot: 'bg-gold-500 ring-2 ring-gold-200', dotPlain: 'bg-gold-500',
  },
  cancel: {
    chip: 'border-maroon-200 bg-maroon-50 text-maroon-800',
    dot: 'bg-maroon-500 ring-2 ring-maroon-200', dotPlain: 'bg-maroon-500',
  },
  cancelled: {
    chip: 'border-maroon-200 bg-maroon-50 text-maroon-800',
    dot: 'bg-maroon-500 ring-2 ring-maroon-200', dotPlain: 'bg-maroon-500',
  },
  rejected: {
    chip: 'border-maroon-200 bg-maroon-50 text-maroon-800',
    dot: 'bg-maroon-500 ring-2 ring-maroon-200', dotPlain: 'bg-maroon-500',
  },
}

export const FALLBACK_TONE: StatusTone = {
  chip: 'border-cream-300 bg-cream-100 text-ink-600',
  dot: 'bg-ink-400',
  dotPlain: 'bg-ink-400',
}

/** Resolves the tone for a status label, case-insensitively. */
export function statusTone(status: string): StatusTone {
  return STATUS_TONES[status.toLowerCase().trim()] ?? FALLBACK_TONE
}
