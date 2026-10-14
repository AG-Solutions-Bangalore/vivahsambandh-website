import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap-setup'

/**
 * Thin gold scroll-progress bar pinned to the very top (above the header).
 *
 * Edge cases:
 * - prefers-reduced-motion → not rendered at all
 * - transform-only (scaleX) + scrub → compositor-only, no layout cost
 * - useGSAP scope → auto cleanup on unmount (StrictMode-safe)
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null)
  // Read once per mount (hooks stay unconditional; render bails below).
  const reduced = useRef(prefersReducedMotion()).current

  useGSAP(
    () => {
      const bar = ref.current
      if (!bar || prefersReducedMotion()) return
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
          },
        },
      )
    },
    { scope: ref },
  )

  if (reduced) return null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold-600 via-gold-400 to-maroon-600"
    />
  )
}
