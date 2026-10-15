/**
 * Motion library loader — GSAP (and its plugins) load lazily via dynamic
 * import so ~120KB of animation runtime never contends with LCP/hero bytes.
 * The static page paints first; animation enhances as soon as the chunk lands
 * (no-JS / failed-load still shows final content — initial states are set in
 * JS only, never in markup/CSS).
 */

interface MotionLibs {
  gsap: typeof import('gsap').default
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

let motionPromise: Promise<MotionLibs> | null = null

/** Load GSAP + ScrollTrigger once, register plugins and project defaults. */
export function ensureMotion(): Promise<MotionLibs> {
  if (!motionPromise) {
    motionPromise = (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      gsap.registerPlugin(ScrollTrigger)

      // Mobile browsers fire resize when the URL bar shows/hides; without this,
      // every bar toggle triggers ScrollTrigger.refresh() → content jumps.
      ScrollTrigger.config({ ignoreMobileResize: true })

      // Sensible project-wide defaults: transform/opacity only, no layout props.
      gsap.defaults({ duration: 0.7, ease: 'power3.out' })

      return { gsap, ScrollTrigger }
    })()
  }
  return motionPromise
}

/** True when the build-time motion libs have finished loading. */
export function isMotionReady(): boolean {
  return motionPromise !== null
}

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
  // Motion not loaded yet (pre-hydration, deferred sections before JS):
  // no triggers exist, so there is nothing to refresh.
  if (!isMotionReady()) return () => {}
  const run = () => {
    void ensureMotion().then(({ ScrollTrigger }) => {
      try {
        ScrollTrigger.refresh()
      } catch {
        /* ScrollTrigger not yet initialised — safe to ignore */
      }
    })
  }
  if (afterMs <= 0) {
    // requestAnimationFrame avoids forced-sync-layout inside React render.
    const rafId = requestAnimationFrame(run)
    return () => cancelAnimationFrame(rafId)
  }
  const timeoutId = setTimeout(run, afterMs)
  return () => clearTimeout(timeoutId)
}
