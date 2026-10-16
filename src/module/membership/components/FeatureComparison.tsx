import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import type { ComparisonRow } from '../types'

export default function FeatureComparison() {
  const { t } = useTranslation()
  const rows = (t('membershipPage.comparison.rows', { returnObjects: true }) as ComparisonRow[]) || []

  return (
    <section className="relative overflow-hidden bg-[#FFFBF2] py-14 sm:py-16">
      <div className="section-pad">
        <Reveal variant="up" className="mx-auto max-w-2xl text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
            <span>✦</span>
            <span>{t('membershipPage.comparison.eyebrow')}</span>
            <span>✦</span>
          </div>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900">
            {t('membershipPage.comparison.title')}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-600">
            {t('membershipPage.comparison.subtitle')}
          </p>
        </Reveal>

        <Reveal variant="scale" className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gold-500/30 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gold-500/30 bg-navy-900 text-white">
                  <th className="py-4 px-4 sm:px-6 font-semibold w-2/5">
                    {t('membershipPage.comparison.colFeature')}
                  </th>
                  <th className="py-4 px-4 text-center font-semibold text-gold-300">
                    {t('membershipPage.comparison.colSilver')}
                  </th>
                  <th className="py-4 px-4 text-center font-bold text-gold-400 bg-navy-950/40">
                    {t('membershipPage.comparison.colGold')}
                  </th>
                  <th className="py-4 px-4 text-center font-bold text-amber-300">
                    {t('membershipPage.comparison.colPlatinum')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-500/15">
                {rows.map((r, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors hover:bg-gold-50/50 ${
                      idx % 2 === 1 ? 'bg-cream-50/60' : 'bg-white'
                    }`}
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-navy-900">
                      {r.feature}
                    </td>
                    <td className="py-3.5 px-4 text-center text-ink-600">
                      {r.silver === '✕' ? (
                        <span className="text-gray-300 font-bold">✕</span>
                      ) : (
                        <span className="text-gold-700 font-semibold">{r.silver}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-navy-950 bg-gold-50/30">
                      {r.gold === '✕' ? (
                        <span className="text-gray-300 font-bold">✕</span>
                      ) : (
                        <span className="text-gold-700 font-bold">{r.gold}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-navy-900">
                      <span className="text-maroon-700 font-bold">{r.platinum}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
