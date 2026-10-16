import { useEffect, useRef, type CSSProperties } from 'react'
import { ensureMotion, prefersReducedMotion } from '../../lib/gsap-setup'

type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'scale' | 'none'

interface RevealProps {
  children: React.ReactNode
  /** Entrance direction. Default 'up'. */
  variant?: RevealVariant
  /** Extra px distance for directional variants. Default 28. */
  distance?: number
  /** Seconds. Default 0.8. */
  duration?: number
  /** Seconds. Default 0. */
  delay?: number
  /** ScrollTrigger start. Default 'top 85%'. */
  start?: string
  /** Replay every time it re-enters (default plays once and stays). */
  once?: boolean
  /** Extra class names on the wrapper. */
  className?: string
  /** Inline style on the wrapper. */
  style?: CSSProperties
  /** Rendered element. Default 'div'. */
  as?: 'div' | 'section' | 'span' | 'li' | 'h2' | 'h3' | 'p'
}

const OFFSETS: Record<Exclude<RevealVariant, 'none'>, (d: number) => object> = {
  up: (d) => ({ y: d, x: 0, scale: 1 }),
  fade: () => ({ y: 0, x: 0, scale: 1 }),
  left: (d) => ({ x: -d, y: 0, scale: 1 }),
  right: (d) => ({ x: d, y: 0, scale: 1 }),
  scale: () => ({ scale: 0.94, y: 12, x: 0 }),
}

/**
 * Scroll-triggered reveal wrapper (transform + opacity only — GPU friendly).
 *
 * Edge cases:
 * - No-JS / pre-trigger: content stays visible (initial state set in JS only)
 * - prefers-reduced-motion: renders final state, no ScrollTrigger
 * - StrictMode: useGSAP auto-reverts on unmount; scope limits selectors
 * - Layout shifts (FAQ open, locale change): parent should call
 *   refreshScrollTriggers(); this trigger uses once:true by default so it
 *   never traps content hidden.
 */
export default function Reveal({
  children,
  variant = 'up',
  distance = 28,
  duration = 0.8,
  delay = 0,
  start = 'top 85%',
  once = true,
  className,
  style,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // Motion loads lazily (see lib/gsap-setup): only when this element approaches
  // the viewport (IntersectionObserver) is GSAP loaded and choreographed.
  // Static content stays visible by default (no-JS / pre-trigger safe).
  useEffect(() => {
    let ctx: { revert: () => void } | null = null
    let cancelled = false
    const el = ref.current
    if (!el) return

    // Reduced motion or 'none' → content is already visible, no animation needed.
    if (variant === 'none' || prefersReducedMotion()) {
      return
    }

    const wire = () => {
      if (cancelled) return
      void ensureMotion()
        .then(({ gsap }) => {
          if (cancelled || !el) return

          const from =
            variant === 'fade' ? { autoAlpha: 0 } : { autoAlpha: 0, ...OFFSETS[variant](distance) }

          ctx = gsap.context(() => {
            gsap.fromTo(
              el,
              from,
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration,
                delay,
                ease: 'power3.out',
                overwrite: 'auto',
                // Release the will-change compositor layer after playing —
                // keeping it forever pins GPU memory on low-end phones.
                clearProps: 'willChange',
                scrollTrigger: {
                  trigger: el,
                  start,
                  toggleActions: once ? 'play none none none' : 'play reverse play reverse',
                  once,
                },
              },
            )
          }, ref)
        })
        .catch(() => {
          /* motion failed to load — content stays visible (final state) */
        })
    }

    // Only load motion when element approaches the viewport
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect()
            wire()
          }
        },
        { rootMargin: '350px 0px' },
      )
      io.observe(el)
      return () => {
        cancelled = true
        io.disconnect()
        ctx?.revert()
      }
    }

    wire()
    return () => {
      cancelled = true
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Tag = as as 'div'
  return (
    <Tag ref={ref} className={className} style={{ willChange: 'transform, opacity', ...style }}>
      {children}
    </Tag>
  )
}

interface RevealGroupProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  /** Stagger seconds between items. Default 0.09. */
  stagger?: number
  start?: string
  once?: boolean
}

/**
 * Stagger-reveal for grids/lists. Children must carry `data-reveal-item`.
 * Uses ONE ScrollTrigger for the group (perf) instead of N triggers.
 */
export function RevealGroup({
  children,
  className,
  style,
  stagger = 0.09,
  start = 'top 85%',
  once = true,
}: RevealGroupProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let ctx: { revert: () => void } | null = null
    let cancelled = false
    void ensureMotion()
      .then(({ gsap }) => {
        const root = ref.current
        if (cancelled || !root) return
        const items = root.querySelectorAll('[data-reveal-item]')
        if (items.length === 0) return

        if (prefersReducedMotion()) {
          gsap.set(items, { clearProps: 'all', autoAlpha: 1, y: 0 })
          return
        }

        ctx = gsap.context(() => {
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              stagger,
              overwrite: 'auto',
              // Release the will-change compositor layers after playing.
              clearProps: 'willChange',
              scrollTrigger: {
                trigger: root,
                start,
                toggleActions: once ? 'play none none none' : 'play reverse play reverse',
                once,
              },
            },
          )
        }, ref)
      })
      .catch(() => {
        /* motion failed to load — content stays visible (final state) */
      })
    return () => {
      cancelled = true
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
