import type Lenis from 'lenis'

/**
 * Lenis singleton — created by <SmoothScroll/>, consumed by helpers
 * (anchor navigation, modal scroll-lock). Null on server / reduced-motion.
 */
let lenisInstance: Lenis | null = null

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance
  if (typeof window !== 'undefined') {
    ;(window as unknown as { __lenis?: Lenis | null }).__lenis = instance
  }
}

export function getLenis(): Lenis | null {
  if (lenisInstance) return lenisInstance
  if (typeof window !== 'undefined') {
    return (
      (window as unknown as { __lenis?: Lenis | null }).__lenis ?? null
    )
  }
  return null
}

/** Sticky header height — keep in sync with Header h-16 (64px) + border. */
export const SCROLL_OFFSET = -72

/**
 * Legacy / convenience hashes that have no matching element id.
 * Resolved to the real section before scrolling.
 */
const HASH_ALIASES: Record<string, string> = {
  'all-faq': 'faq',
  'all-cities': 'search',
}

/** history.replaceState throws in sandboxed iframes — never break scrolling. */
export function safeReplaceState(hash: string): void {
  try {
    history.replaceState(null, '', hash)
  } catch {
    /* sandboxed iframe or unavailable history — URL update is cosmetic */
  }
}

/**
 * Smooth-scroll to an in-page anchor. Falls back to native behaviour when
 * Lenis is unavailable (reduced-motion, SSR, before init).
 */
export function scrollToAnchor(hash: string): boolean {
  if (!hash || !hash.startsWith('#')) return false
  const id = hash.slice(1)
  if (!id) {
    getLenis()?.scrollTo(0, { offset: 0, duration: 1.2 })
    if (!getLenis()) window.scrollTo({ top: 0, behavior: 'smooth' })
    return true
  }
  const resolvedId = HASH_ALIASES[id] ?? id
  const el = document.getElementById(resolvedId)
  // Also support href="#about"-style anchors on sections without id by
  // matching querySelector (e.g. Swiper wrapper divs carry the id).
  const target = el ?? document.querySelector(`#${CSS.escape(resolvedId)}`)
  if (!target) return false

  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, {
      offset: SCROLL_OFFSET,
      duration: 1.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    })
  } else {
    // Native fallback: respect reduced-motion (instant) vs smooth.
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  return true
}

/** Lock page scroll (e.g. video modal, mobile drawer open). */
export function lockPageScroll(): void {
  getLenis()?.stop()
  document.documentElement.classList.add('overflow-hidden')
}

/** Unlock page scroll. */
export function unlockPageScroll(): void {
  getLenis()?.start()
  document.documentElement.classList.remove('overflow-hidden')
}
