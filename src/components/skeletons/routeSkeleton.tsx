/**
 * @file src/components/skeletons/routeSkeleton.tsx
 * Route-aware skeleton loader for the public website.
 *
 * Every public route is code-split behind a `React.lazy` boundary, so the
 * chunk has to download before the page can paint. Without a fallback the
 * content area stays empty for that window — the visitor sees the header and
 * the footer with a hole in between. This module renders a placeholder shaped
 * like the page that is on its way, so the layout never collapses and never
 * jumps when the real content arrives.
 *
 * The placeholder is chosen from the current route, so `/about` shows an
 * about-shaped skeleton and `/blogs` a blogs-shaped one. Only the band list
 * differs between pages — the shapes themselves are shared (see
 * `skeletonShapes.tsx`).
 */

import { useLocation } from 'react-router-dom'
import { SkeletonPage, type SectionSpec } from './skeletonShapes'

interface RouteSkeletonSpec {
  /** Page background, matching the real page's outer wrapper. */
  bg?: string
  /** Bands, in the same order as the real page renders them. */
  sections: SectionSpec[]
}

/**
 * Band lists mirroring each page's real section rhythm.
 *
 * `tone: 'dark'` marks bands whose real background is navy — the blocks have
 * to be light-on-dark there, otherwise the placeholder reads as a hole.
 */
const ROUTE_SPECS: Record<string, RouteSkeletonSpec> = {
  '/': {
    sections: [
      { kind: 'banner', copy: 'wide' },
      { kind: 'grid', cols: 3, rows: 3 },
      { kind: 'split', ratio: '6-6' },
      { kind: 'grid', cols: 4, rows: 1, framed: true },
    ],
  },

  // About — hero, mission/vision, navy values band, why, stats, reviews, FAQ, CTA.
  '/about': {
    sections: [
      { kind: 'banner', copy: 'narrow' },
      { kind: 'grid', cols: 2, rows: 2, framed: true },
      { kind: 'grid', cols: 3, rows: 3, framed: true, tone: 'dark', bg: 'bg-[#071833]' },
      { kind: 'split', ratio: '6-6' },
      { kind: 'stats', cols: 4, bg: 'border-y border-gold-500/30 bg-cream-100/70' },
      { kind: 'marquee', count: 3 },
      { kind: 'dial' },
      { kind: 'cta' },
    ],
  },

  // Stories — hero, navy stats, featured story, story grid, reviews, FAQ, CTA.
  '/stories': {
    sections: [
      { kind: 'banner', copy: 'wide' },
      { kind: 'stats', cols: 4, tone: 'dark' },
      { kind: 'split', ratio: '6-6' },
      { kind: 'grid', cols: 3, rows: 3, aspect: 'aspect-[16/10]' },
      { kind: 'marquee', count: 3 },
      { kind: 'dial' },
      { kind: 'cta', tone: 'dark', bg: 'bg-navy-pattern' },
    ],
  },

  // Membership — hero, pricing plans, comparison table, benefits, reviews, FAQ, CTA.
  '/membership': {
    sections: [
      { kind: 'banner', copy: 'wide' },
      { kind: 'grid', cols: 3, rows: 3, framed: true },
      { kind: 'table', rows: 5 },
      { kind: 'grid', cols: 4, rows: 1, framed: true },
      { kind: 'marquee', count: 3 },
      { kind: 'dial' },
      { kind: 'cta', tone: 'dark', bg: 'bg-navy-pattern' },
    ],
  },

  // Contact — hero, contact cards, form + office, reviews, FAQ, CTA.
  '/contact': {
    sections: [
      { kind: 'banner', copy: 'narrow' },
      { kind: 'grid', cols: 4, rows: 1, framed: true },
      { kind: 'split', ratio: '7-5' },
      { kind: 'marquee', count: 3 },
      { kind: 'dial' },
      { kind: 'cta' },
    ],
  },

  // Blogs — centred hero, article card grid.
  '/blogs': {
    bg: 'bg-[#FFFBF2]',
    sections: [
      { kind: 'centered' },
      { kind: 'grid', cols: 3, rows: 6, aspect: 'aspect-[16/10]' },
    ],
  },

  // Blog article — meta, headline, cover image, body copy.
  '/blogs/:slug': {
    bg: 'bg-[#FFFBF2]',
    sections: [{ kind: 'article' }],
  },

  // Legal pages — centred hero, one long document card.
  '/privacy': {
    bg: 'bg-[#FFFBF2]',
    sections: [{ kind: 'centered' }, { kind: 'lines' }],
  },
  '/terms': {
    bg: 'bg-[#FFFBF2]',
    sections: [{ kind: 'centered' }, { kind: 'lines' }],
  },
  '/guidelines': {
    bg: 'bg-[#FFFBF2]',
    sections: [{ kind: 'centered' }, { kind: 'lines' }],
  },
  '/help-center': {
    bg: 'bg-[#FFFBF2]',
    sections: [{ kind: 'centered' }, { kind: 'lines' }],
  },

  // App download — dark hero, feature grid, steps, city rail, reviews, FAQ, CTA.
  '/download': {
    sections: [
      { kind: 'darkBanner', tone: 'dark' },
      { kind: 'grid', cols: 3, rows: 3, framed: true },
      { kind: 'grid', cols: 3, rows: 3, framed: true },
      { kind: 'marquee', count: 3 },
      { kind: 'dial' },
      { kind: 'cta', tone: 'dark', bg: 'bg-navy-950' },
    ],
  },

  // Registration — navy hero, wizard rail, form card.
  '/registration': {
    sections: [
      { kind: 'darkBanner', tone: 'dark' },
      { kind: 'stepper', steps: 5 },
      { kind: 'form', fields: 8 },
    ],
  },

  // Admin registration — navy hero, form card.
  '/admin-register': {
    sections: [
      { kind: 'darkBanner', tone: 'dark' },
      { kind: 'form', fields: 6 },
    ],
  },
}

/** Fallback for a route with no hand-written band list. */
const DEFAULT_SPEC: RouteSkeletonSpec = {
  sections: [
    { kind: 'centered' },
    { kind: 'grid', cols: 3, rows: 3 },
  ],
}

/**
 * Maps a URL to its skeleton band list.
 *
 * - trailing slashes are dropped (`/hi/` → `/hi`)
 * - the Hindi prefix is stripped (`/hi/about` → `/about`) — the layout is
 *   identical, only the copy changes
 * - blog articles collapse to one shape (`/blogs/anything` → `/blogs/:slug`)
 */
function resolveRouteKey(pathname: string): string {
  let path = pathname.split(/[?#]/)[0]
  if (path.length > 1) path = path.replace(/\/+$/, '') || '/'

  if (path === '/hi') path = '/'
  else if (path.startsWith('/hi/')) path = path.slice(3)

  if (path.startsWith('/blogs/')) path = '/blogs/:slug'

  return path
}

/**
 * Suspense fallback for the public route tree.
 *
 * Rendered inside the router, so it can read the route that is loading and
 * pick the matching placeholder.
 */
export function RouteSkeleton() {
  const { pathname } = useLocation()
  const spec = ROUTE_SPECS[resolveRouteKey(pathname)] ?? DEFAULT_SPEC

  return <SkeletonPage sections={spec.sections} className={spec.bg} />
}

export default RouteSkeleton
