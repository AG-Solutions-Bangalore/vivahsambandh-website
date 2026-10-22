/**
 * @file src/components/skeletons/skeletonShapes.tsx
 * Section-shaped placeholder blocks for the public site.
 *
 * One renderer drives every page skeleton from a declarative `SectionSpec`
 * list (see `routeSkeleton.tsx`). Keeping the shapes in a single generic
 * renderer instead of one hand-written component per page matters: this
 * module is statically imported by the app entry, so every byte here sits on
 * the critical path. A per-page component set measured +21 kB raw / +5.3 kB
 * gzipped on the entry chunk; the spec renderer costs a fraction of that.
 *
 * Every block is `aria-hidden` — the surrounding shell announces the busy
 * state once, so screen readers are not flooded by a hundred empty divs.
 */

import { cn } from 'cn'

/** Surface a block sits on — decides the block colour. */
export type SkeletonTone = 'light' | 'dark'

/**
 * Declarative description of one placeholder band.
 *
 * A flat shape (rather than a discriminated union) keeps the spec table in
 * `routeSkeleton.tsx` terse — the compiler cannot catch a stray key in a
 * union, but the renderer ignores unknown keys, so a typo degrades to the
 * default band instead of crashing the page.
 */
export interface SectionSpec {
  /**
   * - `banner`    tall image banner with a copy block
   * - `centered`  centred eyebrow + headline + subtitle
   * - `darkBanner` navy rounded hero (registration)
   * - `grid`      card grid, optional image area on every card
   * - `split`     image beside a text column
   * - `stats`     row of large numbers with captions
   * - `marquee`   horizontal row of wide quote cards
   * - `table`     comparison table with a dark header row
   * - `lines`     long-form document card (legal pages)
   * - `form`      form card with labelled inputs
   * - `stepper`   wizard progress rail
   * - `dial`      circular FAQ dial
   * - `cta`       centred call-to-action with two buttons
   */
  kind:
    | 'banner'
    | 'centered'
    | 'darkBanner'
    | 'grid'
    | 'split'
    | 'stats'
    | 'marquee'
    | 'table'
    | 'lines'
    | 'form'
    | 'stepper'
    | 'dial'
    | 'cta'
    | 'article'
  /** Extra background class for the band (matches the real section's bg). */
  bg?: string
  /** `banner` copy column width. */
  copy?: 'wide' | 'narrow'
  /** Grid / stats column count. */
  cols?: number
  /** Number of cards or rows. */
  rows?: number
  /** Aspect ratio of a card's image area, e.g. `aspect-[16/10]`. */
  aspect?: string
  /** Cards render as padded blocks instead of image cards. */
  framed?: boolean
  /** `split` column ratio. */
  ratio?: '7-5' | '6-6'
  /** `split` renders the copy column before the image column. */
  flip?: boolean
  /** Number of marquee cards. */
  count?: number
  /** Number of form fields. */
  fields?: number
  /** Number of wizard steps. */
  steps?: number
  /** Colour of the blocks inside the band. */
  tone?: SkeletonTone
}

/** A single shimmering block. */
export function Bar({
  className,
  tone = 'light',
}: {
  className?: string
  tone?: SkeletonTone
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded',
        tone === 'dark' ? 'bg-white/12' : 'bg-cream-200/70',
        className,
      )}
    />
  )
}

/** A stack of text lines; the last one is shorter, like a real paragraph. */
export function Text({ lines = 3, tone }: { lines?: number; tone?: SkeletonTone }) {
  return (
    <div aria-hidden="true" className="space-y-2.5">
      {Array.from({ length: lines }, (_, index) => (
        <Bar
          key={index}
          tone={tone}
          className={cn('h-3.5', index === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 gap-4 lg:grid-cols-4',
}

/** Band wrapper — lets every band pick up a route-specific background. */
function Band({
  spec,
  className,
  children,
}: {
  spec: SectionSpec
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn(className, spec.bg)}>
      {children}
    </section>
  )
}

/** Renders one declarative band. */
export function SkeletonSection({ spec }: { spec: SectionSpec }) {
  switch (spec.kind) {
    case 'banner':
      return (
        <Band
          spec={spec}
          className="relative isolate w-full border-b border-cream-200/70 bg-cream-100/50 lg:h-[540px] xl:h-[580px]"
        >
          <div className="section-pad flex h-full flex-col justify-center py-12 lg:py-0">
            <div className="grid w-full items-center gap-8 lg:grid-cols-12">
              <div
                className={cn(
                  'space-y-4',
                  spec.copy === 'narrow'
                    ? 'lg:col-span-7 xl:col-span-6'
                    : 'lg:col-span-8 xl:col-span-7',
                )}
              >
                <Bar className="h-3.5 w-32 rounded-full bg-gold-200/80" />
                <Bar className="h-10 w-4/5 rounded-lg sm:h-12" />
                <Bar className="h-10 w-3/5 rounded-lg bg-gold-200/50 sm:h-12" />
                <Bar className="h-3.5 w-11/12 rounded" />
                <Bar className="h-3.5 w-4/5 rounded" />
              </div>
            </div>
          </div>
        </Band>
      )

    case 'centered':
      return (
        <Band spec={spec} className="section-pad pt-10 pb-4 text-center sm:pt-14">
          <div className="mx-auto max-w-2xl space-y-3">
            <Bar className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
            <Bar className="mx-auto h-9 w-4/5 rounded-lg sm:h-11" />
            <Bar className="mx-auto h-3.5 w-3/4 rounded" />
          </div>
        </Band>
      )

    case 'darkBanner':
      return (
        <Band
          spec={spec}
          className="relative overflow-hidden rounded-b-[8rem] bg-navy-900 pt-16 pb-16 sm:pt-20"
        >
          <div className="section-pad mx-auto max-w-2xl space-y-4 text-center">
            <Bar tone="dark" className="mx-auto h-3.5 w-36 rounded-full bg-gold-400/40" />
            <Bar tone="dark" className="mx-auto h-10 w-4/5 rounded-lg bg-white/15 sm:h-12" />
            <Bar tone="dark" className="mx-auto h-3.5 w-11/12 rounded" />
          </div>
        </Band>
      )

    case 'grid':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div className={cn('grid gap-6', COLS[spec.cols ?? 3])}>
            {Array.from({ length: spec.rows ?? 3 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  'overflow-hidden rounded-2xl border shadow-sm',
                  spec.tone === 'dark'
                    ? 'border-gold-500/30 bg-white/[0.06]'
                    : 'border-cream-200 bg-white',
                  spec.framed && 'p-5',
                )}
              >
                {spec.aspect ? (
                  <Bar tone={spec.tone} className={cn('w-full rounded-none', spec.aspect)} />
                ) : null}
                <div className={cn('space-y-3', spec.framed ? '' : 'p-5')}>
                  <Bar tone={spec.tone} className="h-4 w-1/3 rounded" />
                  <Bar tone={spec.tone} className="h-4 w-full rounded" />
                  <Bar tone={spec.tone} className="h-3.5 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Band>
      )

    case 'split': {
      const image = (
        <div
          className={cn(
            'h-64 sm:h-80 lg:h-auto',
            spec.ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-7',
          )}
        >
          <Bar
            tone={spec.tone}
            className={cn(
              'h-full w-full rounded-none',
              spec.tone === 'dark' ? 'bg-white/10' : 'bg-cream-200/60',
            )}
          />
        </div>
      )
      const copy = (
        <div
          className={cn(
            'flex flex-col justify-center space-y-4 p-6 sm:p-8 lg:p-10',
            spec.ratio === '6-6' ? 'lg:col-span-6' : 'lg:col-span-5',
          )}
        >
          <Bar tone={spec.tone} className="h-3.5 w-28 rounded-full bg-gold-200/80" />
          <Bar tone={spec.tone} className="h-7 w-3/4 rounded-lg" />
          <Text lines={4} tone={spec.tone} />
          <Bar tone={spec.tone} className="mt-2 h-10 w-36 rounded-full" />
        </div>
      )

      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div
            className={cn(
              'grid overflow-hidden rounded-3xl border shadow-card lg:grid-cols-12',
              spec.tone === 'dark'
                ? 'border-gold-500/30 bg-white/[0.06]'
                : 'border-cream-200 bg-white',
            )}
          >
            {spec.flip ? (
              <>
                {copy}
                {image}
              </>
            ) : (
              <>
                {image}
                {copy}
              </>
            )}
          </div>
        </Band>
      )
    }

    case 'stats':
      return (
        <Band
          spec={spec}
          className={cn(
            'section-pad py-10 sm:py-12',
            spec.tone === 'dark'
              ? 'bg-navy-950'
              : 'border-y border-gold-500/30 bg-cream-100/70',
          )}
        >
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {Array.from({ length: spec.cols ?? 4 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Bar tone={spec.tone} className="mx-auto h-9 w-20 rounded-lg" />
                <Bar tone={spec.tone} className="mx-auto h-3 w-28 rounded" />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'marquee':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: spec.count ?? 3 }, (_, index) => (
              <div
                key={index}
                className="w-[300px] shrink-0 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-card"
              >
                {spec.aspect ? (
                  <Bar className={cn('w-full rounded-none', spec.aspect)} />
                ) : null}
                <div className="space-y-3 p-5">
                  <Text lines={3} />
                </div>
              </div>
            ))}
          </div>
        </Band>
      )

    case 'table':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-lg">
            <div className="h-12 bg-navy-900/90" />
            {Array.from({ length: spec.rows ?? 5 }, (_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 border-t border-gold-500/15 px-5 py-3.5"
              >
                <Bar className="h-3.5 flex-1" />
                <Bar className="h-3.5 w-16" />
                <Bar className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'lines':
      return (
        <Band spec={spec} className="section-pad py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-[#EADDC3] bg-white p-6 shadow-sm sm:p-10">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3">
                <Bar className="h-6 w-1/3 rounded-lg" />
                <Text lines={3} />
              </div>
            ))}
          </div>
        </Band>
      )

    case 'form':
      return (
        <Band spec={spec} className="section-pad py-14 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-6 rounded-[1.5rem] border border-gold-500/30 bg-white p-6 shadow-card sm:p-8">
            <div className="space-y-2 border-b border-cream-200 pb-4">
              <Bar className="h-6 w-48 rounded-lg" />
              <Bar className="h-3.5 w-72 rounded" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: spec.fields ?? 6 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Bar className="h-3.5 w-28 rounded" />
                  <Bar className="h-11 w-full rounded-full border border-cream-200 bg-cream-50" />
                </div>
              ))}
            </div>
            <div className="flex justify-center border-t border-cream-100 pt-6">
              <Bar className="h-11 w-44 rounded-full bg-navy-900/10" />
            </div>
          </div>
        </Band>
      )

    case 'stepper':
      return (
        <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-cream-300 bg-cream-100 px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            {Array.from({ length: spec.steps ?? 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Bar className="size-9 shrink-0 rounded-full" />
                <Bar className="hidden h-3 w-14 rounded sm:block" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'dial':
      return (
        <Band spec={spec} className="section-pad py-12">
          <div className="flex min-h-[380px] items-center justify-center">
            <Bar className="size-[300px] rounded-full" />
          </div>
        </Band>
      )

    case 'cta':
      return (
        <Band spec={spec} className="section-pad py-14 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <Bar tone={spec.tone} className="mx-auto h-3.5 w-28 rounded-full bg-gold-200/80" />
            <Bar tone={spec.tone} className="mx-auto h-9 w-4/5 rounded-lg sm:h-11" />
            <Bar tone={spec.tone} className="mx-auto h-3.5 w-3/4 rounded" />
            <div className="flex justify-center gap-3 pt-3">
              <Bar
                tone={spec.tone}
                className={cn(
                  'h-11 w-32 rounded-full',
                  spec.tone === 'dark' ? 'bg-white/15' : 'bg-navy-900/10',
                )}
              />
              <Bar
                tone={spec.tone}
                className={cn(
                  'h-11 w-32 rounded-full border',
                  spec.tone === 'dark' ? 'border-white/25' : 'border-cream-300',
                )}
              />
            </div>
          </div>
        </Band>
      )

    case 'article':
      return (
        <Band spec={spec} className="section-pad py-10 sm:py-14">
          <div className="mx-auto max-w-6xl space-y-5">
            <Bar className="h-3.5 w-40 rounded" />
            <Bar className="h-10 w-11/12 rounded-lg sm:h-12" />
            <Bar className="h-10 w-3/5 rounded-lg sm:h-12" />
            <div className="flex items-center gap-3 border-y border-cream-200 py-3.5">
              <Bar className="size-10 rounded-full" />
              <Bar className="h-3.5 w-32 rounded" />
            </div>
            <Bar className="aspect-[16/8] w-full rounded-2xl" />
            <Text lines={6} />
          </div>
        </Band>
      )

    default:
      return null
  }
}

/** Renders a whole page from its band list. */
export function SkeletonPage({
  sections,
  className,
}: {
  sections: SectionSpec[]
  className?: string
}) {
  return (
    <div
      aria-busy="true"
      role="status"
      aria-label="Loading content"
      className={cn('relative min-h-[70vh] overflow-hidden bg-cream-50', className)}
    >
      {sections.map((spec, index) => (
        <SkeletonSection key={`${spec.kind}-${index}`} spec={spec} />
      ))}
    </div>
  )
}
