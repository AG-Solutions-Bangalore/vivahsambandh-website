import { useRef, type CSSProperties } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/gsap-setup'

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

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      // Reduced motion or 'none' → ensure visible, no animation.
      if (variant === 'none' || prefersReducedMotion()) {
        gsap.set(el, { clearProps: 'all', autoAlpha: 1, x: 0, y: 0, scale: 1 })
        return
      }

      const from = variant === 'fade' ? { autoAlpha: 0 } : { autoAlpha: 0, ...OFFSETS[variant](distance) }

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
    },
    { scope: ref },
  )

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

  useGSAP(
    () => {
      const root = ref.current
      if (!root) return
      const items = root.querySelectorAll('[data-reveal-item]')
      if (items.length === 0) return

      if (prefersReducedMotion()) {
        gsap.set(items, { clearProps: 'all', autoAlpha: 1, y: 0 })
        return
      }

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
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
