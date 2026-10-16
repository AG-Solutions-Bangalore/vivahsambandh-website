import { useEffect } from 'react'
import type Lenis from 'lenis'
import { ensureMotion, prefersReducedMotion } from '../../lib/gsap-setup'
import {
  setLenis,
  scrollToAnchor,
  safeReplaceState,
  resolveHashId,
} from '../../lib/scroll'
import {
  DEFERRED_SECTION_IDS,
  whenSectionReady,
} from '../../lib/deferredSections'

/**
 * Lenis smooth-scroll provider + GSAP ScrollTrigger integration.
 *
 * Motion + smoothing load lazily (dynamic import — no static edge from the
 * entry graph, so ~140KB never contends with LCP/hero bytes). Native
 * scrolling and anchor navigation keep working until they land.
 *
 * Edge cases handled:
 * - prefers-reduced-motion → no Lenis, no smoothing (native scroll)
 * - StrictMode double-invoke → full cleanup (destroy Lenis, remove ticker)
 * - ScrollTrigger sync via gsap ticker (lagSmoothing 0) + lenis 'scroll' event
 * - Anchor links (href="#…") intercepted → lenis.scrollTo with header offset
 * - Images/fonts shifting layout → ScrollTrigger.refresh() on load + fonts.ready
 * - Touch devices → syncTouch off (native touch, smooth wheel only on desktop)
 * - Lenis constructor throw → native-scroll fallback, page never breaks
 * - history.replaceState guarded (throws in sandboxed iframes)
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Guard: client-only (effect never runs on server anyway).
    if (typeof window === 'undefined') return

    // Reduced motion: skip smoothing entirely, keep native anchors working.
    if (prefersReducedMotion()) {
      const onClickNative = (e: MouseEvent) => {
        const anchor = (e.target as HTMLElement).closest?.(
          'a[href^="#"]',
        ) as HTMLAnchorElement | null
        if (!anchor) return
        const hash = anchor.getAttribute('href')
        if (!hash || hash === '#') return
        // Deferred below-fold section: mount it first, then jump instantly.
        const targetId = resolveHashId(hash)
        if (DEFERRED_SECTION_IDS.has(targetId)) {
          e.preventDefault()
          void whenSectionReady(targetId).then(() => {
            const target =
              document.getElementById(targetId) ??
              document.querySelector(`#${CSS.escape(targetId)}`)
            if (target) {
              target.scrollIntoView({ behavior: 'auto', block: 'start' })
              safeReplaceState(hash)
            }
          })
          return
        }
        // Let a same-page target jump instantly (no smooth).
        const target =
          document.getElementById(hash.slice(1)) ?? document.querySelector(hash)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'auto', block: 'start' })
          safeReplaceState(hash)
        }
      }
      document.addEventListener('click', onClickNative)
      return () => document.removeEventListener('click', onClickNative)
    }

    let lenis: Lenis | null = null
    let cancelled = false
    let cleanupMotion: (() => void) | null = null

    const initMotion = () => {
      if (cancelled) return
      void Promise.all([import('lenis'), ensureMotion()])
        .then(([{ default: LenisCtor }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return
        // Lenis construction can throw in exotic webviews (no rAF, frozen
        // objects). Fall back to native scrolling + CSS scroll-margin-top
        // instead of breaking the whole page.
        try {
          lenis = new LenisCtor({
            duration: 1.15,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            // Keep native touch scrolling on mobile (perf + Swiper compat);
            // Lenis smooths wheel/trackpad on desktop where it shines.
            syncTouch: false,
            touchMultiplier: 1.5,
            autoRaf: false,
          })
        } catch {
          lenis = null
        }
        if (!lenis || cancelled) return
        const smooth = lenis as Lenis
        setLenis(smooth)

        // ——— GSAP ↔ Lenis sync (official recommended pattern) ———
        // NOTE: no scrollerProxy needed — Lenis v1 drives the native scroll
        // position, so ScrollTrigger reads the default viewport scroller.
        // lagSmoothing(0) stops GSAP from jumping tweens after tab-switch gaps.
        smooth.on('scroll', ScrollTrigger.update)
        const raf = (time: number) => {
          smooth.raf(time * 1000)
        }
        gsap.ticker.add(raf)
        gsap.ticker.lagSmoothing(0)

        // ——— Anchor navigation (href="#section") ———
        const onClick = (e: MouseEvent) => {
          // Ignore modified clicks (new tab) and non-left buttons.
          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
            return
          const anchor = (e.target as HTMLElement).closest?.(
            'a[href^="#"]',
          ) as HTMLAnchorElement | null
          if (!anchor) return
          const hash = anchor.getAttribute('href')
          if (!hash || hash === '#') {
            // Bare "#" → scroll to top instead of a dead jump.
            e.preventDefault()
            if (smooth) smooth.scrollTo(0, { duration: 1.2 })
            else window.scrollTo({ top: 0, behavior: 'smooth' })
            safeReplaceState(window.location.pathname)
            return
          }
          const handled = scrollToAnchor(hash)
          if (handled) {
            e.preventDefault()
            // Update URL without triggering a native jump.
            safeReplaceState(hash)
            return
          }
          // Deferred below-fold section not mounted yet: mount on demand,
          // then smooth-scroll once its anchor exists. Never hangs (timeout).
          const targetId = resolveHashId(hash)
          if (DEFERRED_SECTION_IDS.has(targetId)) {
            e.preventDefault()
            void whenSectionReady(targetId).then(() => {
              if (scrollToAnchor(hash)) safeReplaceState(hash)
            })
          }
          // Unknown hash → let the browser do its default (no preventDefault).
        }
        document.addEventListener('click', onClick)

        // ——— Layout shifts (images, webfonts, late content) ———
        const refresh = () => ScrollTrigger.refresh()
        window.addEventListener('load', refresh)
        let fontsPromise: Promise<unknown> | undefined
        try {
          fontsPromise = (document as Document).fonts?.ready as unknown as
            | Promise<unknown>
            | undefined
          fontsPromise?.then(() => ScrollTrigger.refresh()).catch(() => {})
        } catch {
          /* fonts API unavailable — ignore */
        }
        // Late-loading images below the fold can still shift triggers.
        const imgs = Array.from(document.images ?? [])
        const onImgLoad = () => ScrollTrigger.refresh()
        imgs.forEach((img) => {
          if (!img.complete) img.addEventListener('load', onImgLoad, { once: true })
        })

        // Initial measurement after first paint.
        const rafId = requestAnimationFrame(() => ScrollTrigger.refresh())

        cleanupMotion = () => {
          cancelAnimationFrame(rafId)
          document.removeEventListener('click', onClick)
          window.removeEventListener('load', refresh)
          imgs.forEach((img) => img.removeEventListener('load', onImgLoad))
          gsap.ticker.remove(raf)
          // destroy() removes Lenis's internal listeners (incl. ScrollTrigger.update)
          smooth.destroy()
          setLenis(null)
        }
      })
      .catch(() => {
        /* motion/smoothing failed — native scroll stays in place */
      })
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const timer = setTimeout(initMotion, 6000)
      const onMove = () => {
        clearTimeout(timer)
        initMotion()
      }
      window.addEventListener('scroll', onMove, { once: true, passive: true })
      window.addEventListener('touchstart', onMove, { once: true, passive: true })
      return () => {
        cancelled = true
        clearTimeout(timer)
        window.removeEventListener('scroll', onMove)
        window.removeEventListener('touchstart', onMove)
        cleanupMotion?.()
      }
    }

    initMotion()
    return () => {
      cancelled = true
      cleanupMotion?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
