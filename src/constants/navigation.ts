/**
 * Central navigation model — single source of truth for every site link.
 *
 * Adding a future page takes two steps:
 *  1. Add one row to NAV_ENTRIES (kind 'page', page '/new-route').
 *  2. Add one branch in App.tsx + one prerender route in vite.config.ts.
 *
 * Everything else (Header active state, Footer links, section-anchor
 * prefixing, language-prefixed paths) derives from here automatically.
 */

import type { AppLang } from '../i18n'

export type NavKind = 'home' | 'page' | 'section'

export interface NavEntry {
  /** Stable id (used as React key). */
  key: string
  /** i18n label key, e.g. 'header.about'. */
  i18nKey: string
  /** home = site root · page = standalone route · section = home-page anchor */
  kind: NavKind
  /** Standalone route WITHOUT lang prefix (kind 'page' only), e.g. '/about'. */
  page?: string
  /** Home-page anchor (kind 'section' only), e.g. '#search'. */
  hash?: string
}

export const NAV_ENTRIES: readonly NavEntry[] = [
  { key: 'home', i18nKey: 'header.home', kind: 'home' },
  { key: 'about', i18nKey: 'header.about', kind: 'page', page: '/about' },
  { key: 'search', i18nKey: 'header.search', kind: 'section', hash: '#search' },
  { key: 'stories', i18nKey: 'header.successStories', kind: 'section', hash: '#stories' },
  { key: 'membership', i18nKey: 'header.membership', kind: 'section', hash: '#explore-features' },
  { key: 'faq', i18nKey: 'header.faq', kind: 'section', hash: '#all-faq' },
  { key: 'contact', i18nKey: 'header.contact', kind: 'page', page: '/contact' },
]

/** Every standalone page route (without lang prefix). Used by App + i18n. */
export const PAGE_ROUTES: readonly string[] = NAV_ENTRIES.filter((e) => e.kind === 'page').map(
  (e) => e.page as string,
)

/** Site root for a language: '/' (en) or '/hi' (hi). */
export function homePath(lang: AppLang): string {
  return lang === 'hi' ? '/hi' : '/'
}

/** Language-prefixed page path: '/about' / '/hi/about'. */
export function pagePath(page: string, lang: AppLang): string {
  return lang === 'hi' ? `/hi${page}` : page
}

/** SSR-safe current pathname (defaults to '/' when there is no window). */
export function getCurrentPathname(): string {
  return typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
}

export function normalizePath(pathname: string): string {
  const lower = pathname.toLowerCase()
  return lower.length > 1 && lower.endsWith('/') ? lower.slice(0, -1) : lower
}

/** True on the site root of either language ('/' or '/hi'). */
export function isHomePath(pathname: string): boolean {
  const path = normalizePath(pathname)
  return path === '/' || path === '/hi'
}

/** True on a standalone page in either language ('/about' or '/hi/about'). */
export function isPagePath(pathname: string, page: string): boolean {
  const path = normalizePath(pathname)
  return (
    path === page || path.startsWith(`${page}/`) || path === `/hi${page}` || path.startsWith(`/hi${page}/`)
  )
}

/** True on ANY standalone page (drives "hop back home" anchor prefixing). */
export function isAnyPagePath(pathname: string): boolean {
  return PAGE_ROUTES.some((page) => isPagePath(pathname, page))
}

export interface NavItem {
  key: string
  label: string
  href: string
  active: boolean
}

/**
 * Resolve every nav entry to a concrete `{ label, href, active }` for the
 * current language + location.
 * - 'home' → '#' when already home (pure anchor scroll), else the home path.
 * - 'page' → language-prefixed route, active when its route matches.
 * - 'section' → bare hash on home, home-prefixed hash from any other page.
 */
export function getNavItems(
  t: (key: string) => string,
  lang: AppLang,
  pathname: string,
): NavItem[] {
  const home = homePath(lang)
  const onHome = isHomePath(pathname)

  return NAV_ENTRIES.map((entry) => {
    switch (entry.kind) {
      case 'home':
        return {
          key: entry.key,
          label: t(entry.i18nKey),
          href: onHome ? '#' : home,
          active: onHome,
        }
      case 'page': {
        const page = entry.page as string
        return {
          key: entry.key,
          label: t(entry.i18nKey),
          href: pagePath(page, lang),
          active: isPagePath(pathname, page),
        }
      }
      default: {
        const hash = entry.hash as string
        return {
          key: entry.key,
          label: t(entry.i18nKey),
          href: onHome ? hash : `${home}${hash}`,
          active: false,
        }
      }
    }
  })
}
