/**
 * @file src/module/super-admin/services/blogImageVersion.ts
 * Session-scoped revision counter for the blog banner images.
 *
 * The CRM overwrites a banner file in place and serves it with a one-year
 * `max-age`, so a replaced banner keeps its old URL. The record's update
 * timestamp is part of the version, but it only has day precision — two
 * swaps on the same day would share a URL. This counter gives every banner
 * the panel replaces a fresh token, so the thumbnail updates straight away
 * instead of at the next day boundary.
 */

const STORAGE_KEY = 'panel_blog_banner_revisions'

function read(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function write(revisions: Record<string, string>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(revisions))
  } catch {
    // Private mode / storage disabled — the counter is a nicety, not a
    // requirement: the update timestamp still busts the cache.
  }
}

/** Marks the banner of a record as replaced, so its URL changes. */
export function bumpBlogBannerRevision(id: number | string): string {
  const revisions = read()
  const token = Date.now().toString()
  revisions[String(id)] = token
  write(revisions)
  return token
}

/** The revision token of a record, if the panel replaced its banner. */
export function blogBannerRevision(id: number | string): string | undefined {
  return read()[String(id)]
}
