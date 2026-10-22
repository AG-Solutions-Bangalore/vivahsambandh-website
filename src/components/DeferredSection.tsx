import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'
import { refreshScrollTriggers } from '../lib/gsap-setup'
import { markSectionReady, registerSectionMounter } from '../lib/deferredSections'

interface DeferredSectionProps {
  /** Anchor id rendered inside the section (registry key). */
  id: string
  /** Dynamic import of the section component (module-scope React.lazy). */
  component: LazyExoticComponent<ComponentType<Record<string, never>>>
  /** Skeleton min-height (px) — keeps scrollbar stable, prevents CLS. */
  minHeight: number
  /** Skeleton backdrop matching the section background. */
  tone?: 'cream' | 'paper' | 'navy'
  /**
   * Placeholder shaped like the real section. Falls back to a generic
   * headline block when omitted.
   */
  skeleton?: ReactNode
  /** How early (px) before entering the viewport to start mounting. */
  rootMargin?: number
}

const TONE_CLASS: Record<NonNullable<DeferredSectionProps['tone']>, string> = {
  cream: 'bg-cream-50',
  paper: 'bg-[#FFFBF2]',
  navy: 'bg-[#071833]',
}

/**
 * Viewport-driven progressive section loader — hero-only initial render.
 *
 * - Renders a lightweight skeleton until the section approaches the viewport
 *   (IntersectionObserver). Nothing mounts on a timer: without scrolling,
 *   only the hero (and header/footer chrome) exists in the DOM.
 * - Anchor/deep links mount their section on demand via the lib registry.
 * - Mounts exactly once; chunks stay cached, so no duplicate work/requests.
 * - Refreshes ScrollTriggers after mount so below-fold animations measure right.
 * - No-JS / no-IntersectionObserver environments mount immediately.
 */
export default function DeferredSection({
  id,
  component: Section,
  minHeight,
  tone = 'cream',
  skeleton: skeletonOverride,
  rootMargin = 250,
}: DeferredSectionProps) {
  const [shouldMount, setShouldMount] = useState(false)
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mountedRef = useRef(false)

  const doMount = () => {
    if (mountedRef.current) return
    mountedRef.current = true
    setShouldMount(true)
  }

  // Register in the anchor-mount registry.
  useEffect(() => {
    return registerSectionMounter(id, doMount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Viewport trigger.
  //
  // Hero-only initial render: if the placeholder is already visible (tall
  // screens), observe at once — IO fires immediately. Otherwise wait for the
  // first scroll/resize before observing, so a static viewport (audit,
  // crawler, print preview) never pays for below-fold chunks and images.
  // Anchor/deep-link mounts bypass this via the lib registry.
  useEffect(() => {
    if (mountedRef.current) return
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === 'undefined') {
      doMount()
      return
    }
    let io: IntersectionObserver | null = null
    const startObserving = () => {
      if (mountedRef.current || io) return
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            doMount()
            io?.disconnect()
            io = null
          }
        },
        { rootMargin: `${rootMargin}px 0px`, threshold: 0 },
      )
      if (hostRef.current) io.observe(hostRef.current)
    }
    const rect = host.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      startObserving()
      return () => io?.disconnect()
    }
    const onFirstMove = () => startObserving()
    const onBeforePrint = () => doMount()
    window.addEventListener('scroll', onFirstMove, {
      once: true,
      passive: true,
    })
    window.addEventListener('resize', onFirstMove, { once: true })
    window.addEventListener('beforeprint', onBeforePrint)
    return () => {
      window.removeEventListener('scroll', onFirstMove)
      window.removeEventListener('resize', onFirstMove)
      window.removeEventListener('beforeprint', onBeforePrint)
      io?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin])

  // After the real section lands: notify anchor waiters + re-measure scroll.
  useEffect(() => {
    if (!shouldMount) return
    markSectionReady(id)
    const raf = requestAnimationFrame(() => refreshScrollTriggers())
    return () => cancelAnimationFrame(raf)
  }, [shouldMount, id])

  const skeleton = (
    <div
      aria-hidden="true"
      className={`${TONE_CLASS[tone]} flex flex-col items-center justify-center gap-3 px-6`}
      style={{ minHeight }}
    >
      <div className="h-2.5 w-24 rounded-full bg-navy-900/10" />
      <div className="h-6 w-56 max-w-full rounded-lg bg-navy-900/10" />
      <div className="h-3 w-40 max-w-full rounded-full bg-navy-900/5" />
    </div>
  )

  // A section-shaped placeholder keeps the reserved height honest: the
  // generic fallback above only reserved a blank band, so the page still
  // jumped once the real section landed.
  const placeholder = skeletonOverride ?? skeleton

  return (
    <div ref={hostRef}>
      {shouldMount ? (
        <Suspense fallback={placeholder}>
          <Section />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  )
}
