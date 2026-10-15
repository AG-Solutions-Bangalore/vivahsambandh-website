import { useEffect } from 'react'
import { ensureMotion, prefersReducedMotion } from '../../lib/gsap-setup'

/**
 * Home-hero motion recipe, reused by the About / Contact heroes.
 *
 * The hero markup must mirror HomeSection's `data-hero` contract:
 * - `[data-hero="eyebrow"]`, `[data-hero-line]` inside `[data-hero-mask]`,
 *   `[data-hero="subtitle"]` → mount intro timeline (plays on page entry).
 * - `[data-hero="banner"]` inside `[data-hero="banner-wrap"]` → scrub
 *   parallax (`yPercent: 12`, desktop only — identical to home).
 * - `[data-hero="flower-l"]` / `[data-hero="flower-r"]` → scrub drift
 *   at different rates for depth (desktop only — identical to home).
 *
 * Motion loads lazily (see lib/gsap-setup); reduced-motion stays static.
 */
export default function PageParallax() {
  useEffect(() => {
    let mm: {
      revert: () => void
      add: (conditions: string, callback: () => void) => void
    } | null = null
    let cancelled = false

    void ensureMotion()
      .then(({ gsap }) => {
        if (cancelled || prefersReducedMotion()) return
        const has = (sel: string) => document.querySelectorAll(sel).length > 0

        // ——— Intro timeline (above the fold → play on mount, not on scroll) ———
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (has('[data-hero="eyebrow"]')) {
          tl.fromTo(
            '[data-hero="eyebrow"]',
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45, clearProps: 'all' },
            0.05,
          )
        }
        if (has('[data-hero-line]')) {
          tl.fromTo(
            '[data-hero-line]',
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 0.75,
              ease: 'power4.out',
              stagger: 0.09,
              clearProps: 'all',
            },
            0.1,
          )
        }
        if (has('[data-hero="subtitle"]')) {
          tl.fromTo(
            '[data-hero="subtitle"]',
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' },
            0.28,
          )
        }

        // ——— Banner parallax + flower drift (desktop only — home parity) ———
        mm = gsap.matchMedia()
        mm.add('(min-width: 768px)', () => {
          if (has('[data-hero="banner"]')) {
            gsap.to('[data-hero="banner"]', {
              yPercent: 12,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-hero="banner-wrap"]',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6,
              },
            })
          }
          // Flowers drift at different rates for depth.
          if (has('[data-hero="flower-l"]')) {
            gsap.to('[data-hero="flower-l"]', {
              y: -40,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-hero="banner-wrap"]',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8,
              },
            })
          }
          if (has('[data-hero="flower-r"]')) {
            gsap.to('[data-hero="flower-r"]', {
              y: -56,
              ease: 'none',
              scrollTrigger: {
                trigger: '[data-hero="banner-wrap"]',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8,
              },
            })
          }
        })
      })
      .catch(() => {
        /* motion failed to load — content stays visible (final state) */
      })

    return () => {
      cancelled = true
      mm?.revert()
    }
  }, [])

  return null
}
