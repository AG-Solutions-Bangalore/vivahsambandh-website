import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

// Register once — safe to import from anywhere (client-only usage via
// useGSAP / useEffect, never during SSR render).
gsap.registerPlugin(useGSAP, ScrollTrigger)

// Mobile browsers fire resize when the URL bar shows/hides; without this,
// every bar toggle triggers ScrollTrigger.refresh() → visible content jumps.
ScrollTrigger.config({ ignoreMobileResize: true })

// Sensible project-wide defaults: transform/opacity only, no layout props.
gsap.defaults({ duration: 0.7, ease: 'power3.out' })

export { gsap, ScrollTrigger, useGSAP }

/** True when the user prefers reduced motion (vestibular safety). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Recalculate all ScrollTrigger positions (call after layout changes).
 *
 * @param afterMs — delay before measuring. Use when the layout change is
 *   itself animated (e.g. FAQ accordion expands over 300ms): measuring
 *   mid-transition records wrong positions for everything below. Default 0
 *   (next animation frame).
 * @returns cleanup function that cancels the pending refresh.
 */
export function refreshScrollTriggers(afterMs = 0): () => void {
  if (afterMs <= 0) {
    // requestAnimationFrame avoids forced-sync-layout inside React render.
    const rafId = requestAnimationFrame(() => {
      try {
        ScrollTrigger.refresh()
      } catch {
        /* ScrollTrigger not yet initialised — safe to ignore */
      }
    })
    return () => cancelAnimationFrame(rafId)
  }
  const timeoutId = setTimeout(() => {
    try {
      ScrollTrigger.refresh()
    } catch {
      /* ScrollTrigger not yet initialised — safe to ignore */
    }
  }, afterMs)
  return () => clearTimeout(timeoutId)
}
