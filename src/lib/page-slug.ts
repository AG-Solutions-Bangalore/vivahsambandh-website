/**
 * @file src/lib/page-slug.ts
 * Normalizes page URLs and slugs for consistent routing and placement identification.
 * Strips leading/trailing slashes, normalizes whitespace, and lowercases.
 */

export function normalizePageSlug(slug?: string | null): string {
  if (!slug) return ''
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
}
