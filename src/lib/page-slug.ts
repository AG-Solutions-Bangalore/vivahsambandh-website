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

/**
 * Canonical route -> every CRM slug that may hold that page's content.
 *
 * The CRM stores pages under its own names (`about-us`, `blog`, `services`,
 * `gallery`) while the site routes are `/about`, `/blogs`, `/membership`,
 * `/stories`. Both spellings belong to the SAME page, so both are valid
 * lookup keys — but a different page's slug never is.
 */
export const PAGE_SLUG_ALIASES: Record<string, string[]> = {
  home: ['home'],
  about: ['about-us', 'about'],
  blogs: ['blog', 'blogs'],
  contact: ['contact'],
  download: ['download'],
  stories: ['stories', 'gallery'],
  membership: ['membership', 'services'],
  registration: ['registration'],
}

/**
 * All CRM slugs for a route, primary first. Unknown routes fall back to
 * their own normalized path so a lookup never silently becomes another page.
 */
export function getPageSlugAliases(route: string): string[] {
  const key = normalizePageSlug(route)
  const aliases = PAGE_SLUG_ALIASES[key]
  if (aliases && aliases.length > 0) return [...aliases]
  return key ? [key] : ['home']
}
