import { useTranslation } from 'react-i18next'
import Reveal, { RevealGroup } from '../../../components/motion/Reveal'

interface StatItem {
  value: string
  label: string
  sub: string
}

export default function StoryStats() {
  const { t } = useTranslation()
  const stats = (t('storiesPage.stats', { returnObjects: true }) as StatItem[]) || []

  return (
    <div role="region" aria-label="Key Statistics" className="relative overflow-hidden bg-navy-950 py-10 sm:py-12 text-white">
      <div className="section-pad">
        <RevealGroup className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8 divide-y-2 md:divide-y-0 md:divide-x divide-gold-500/20">
          {stats.map((s, idx) => (
            <Reveal
              key={idx}
              variant="up"
              delay={idx * 0.08}
              className={`flex flex-col items-center text-center ${idx > 1 ? 'pt-6 md:pt-0' : ''}`}
            >
              <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-400">
                {s.value}
              </span>
              <span className="mt-1 text-xs sm:text-sm font-semibold tracking-wide text-white">
                {s.label}
              </span>
              <span className="mt-0.5 text-[11px] sm:text-xs text-white/60">
                {s.sub}
              </span>
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </div>
  )
}
