/**
 * @file src/module/super-admin/utils/format.ts
 * Locale-aware formatters for the panel. Keeps `Intl` usage in one place so
 * every page renders dates and counts the same way.
 */

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('en-IN')

/** Formats an ISO timestamp as `21/10/2026`, or falls back to the raw text. */
export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return dateFormatter.format(parsed)
}

/** Formats a count with the Indian digit grouping (`1,20,400`). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** First letter of a name, used for the avatar chips. */
export function initials(name?: string | null): string {
  const trimmed = (name ?? '').trim()
  if (!trimmed) return '—'
  return trimmed.charAt(0).toUpperCase()
}
