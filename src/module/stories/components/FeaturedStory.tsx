import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'
import { img, imgSrcSet } from '../../../lib/image'

export default function FeaturedStory() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-cream-50 py-12 sm:py-16 lg:py-20">
      <div className="section-pad">
        <Reveal variant="up" className="mx-auto max-w-3xl text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-700">
            <span>✦</span>
            <span>{t('storiesPage.featured.eyebrow')}</span>
            <span>✦</span>
          </div>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900">
            {t('storiesPage.featured.title')}
          </h2>
        </Reveal>

        <Reveal variant="scale" className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gold-500/35 bg-white shadow-xl">
          <div className="grid lg:grid-cols-12 items-center">
            {/* Image Column */}
            <div className="relative h-72 sm:h-96 lg:h-full lg:col-span-6 overflow-hidden bg-navy-950">
              <img
                src={img('/images/home/radiant-indian-wedding-portrait.webp')}
                srcSet={imgSrcSet('/images/home/radiant-indian-wedding-portrait-640.webp 640w, /images/home/radiant-indian-wedding-portrait.webp 1200w')}
                sizes="(max-width: 1024px) 100vw, 50vw"
                width={1200}
                height={800}
                alt="Vikas and Riya Wedding"
                title="Vikas and Riya Wedding"
                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 rounded-full bg-navy-900/80 px-3.5 py-1.5 text-xs font-bold text-gold-300 backdrop-blur-xs border border-gold-500/30">
                {t('storiesPage.featured.married')}
              </div>
            </div>

            {/* Story Text Column */}
            <div className="p-6 sm:p-8 lg:p-10 lg:col-span-6 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gold-700">
                <span className="rounded-full bg-gold-50 border border-gold-500/30 px-3 py-1">
                  {t('storiesPage.featured.gotras')}
                </span>
                <span className="rounded-full bg-cream-100 px-3 py-1 text-navy-900">
                  {t('storiesPage.featured.city')}
                </span>
              </div>

              <h3 className="font-display mt-4 text-2xl sm:text-3xl font-bold text-navy-900">
                {t('storiesPage.featured.couple')}
              </h3>

              <blockquote className="mt-4 border-l-2 border-gold-500 pl-4 italic text-ink-600 text-sm sm:text-base leading-relaxed">
                &ldquo;{t('storiesPage.featured.quote')}&rdquo;
              </blockquote>

              <p className="mt-4 text-xs sm:text-sm text-ink-600 leading-relaxed">
                {t('storiesPage.featured.story')}
              </p>

              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gold-500/20">
                <div className="h-10 w-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-700 font-bold text-sm">
                  VR
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900">
                    {t('storiesPage.featured.tagTitle')}
                  </p>
                  <p className="text-[11px] text-ink-600">
                    {t('storiesPage.featured.tagSub')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
