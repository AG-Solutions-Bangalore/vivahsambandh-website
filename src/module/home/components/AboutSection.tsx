import { useTranslation } from 'react-i18next'
import { COMPANY } from '../../../constants/company'

export default function AboutSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="section-pad">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Visual: Ornate Mandap Arch with Play Button & Community Pill */}
          <div className="relative lg:col-span-6">
            <div className="card-ring relative overflow-hidden bg-white p-2.5 shadow-lift">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src="/images/home/Golden Floral Mandap at Sunset.webp"
                  alt={`${COMPANY.name} Wedding Mandap`}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 via-transparent to-transparent pointer-events-none" />

                {/* Central Play Button */}
                <button
                  type="button"
                  aria-label="Play introduction video"
                  className="group absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-gold-600 shadow-xl backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-gold-50 hover:text-gold-700"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="ml-1 h-8 w-8 fill-current transition-transform group-hover:scale-110"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Floating Community Member Counter */}
            <div className="card-ring absolute -bottom-5 left-6 flex items-center gap-3.5 bg-white/95 px-4 py-2.5 shadow-lift backdrop-blur sm:left-10 sm:px-5 sm:py-3">
              {/* 4 Overlapping Avatar Bubbles */}
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  src="/images/home/Radiant Indian Bride in Floral Glow.webp"
                  alt="Member"
                  className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/images/home/Radiant Indian Groom in a Golden Wedding Setting.webp"
                  alt="Member"
                  className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/images/home/Radiant Indian Wedding Portrait.webp"
                  alt="Member"
                  className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/images/home/Romantic Indian Wedding Portrait.webp"
                  alt="Member"
                  className="inline-block h-8 w-8 rounded-full border-2 border-white object-cover"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold tracking-wider text-ink-500 uppercase">
                  {t('about.community')}
                </p>
                <p className="font-display text-sm font-bold text-navy-900 sm:text-base">
                  {COMPANY.community.membersCount} {t('about.members').replace('50K+ ', '')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="lg:col-span-6">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t('about.eyebrow')}</span>
              <span className="hidden h-px w-10 bg-gold-500/40 sm:inline-block" />
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              <span>{t('about.titleA')}</span>{' '}
              <span className="block text-gold-600 sm:inline sm:block">{t('about.titleB')}</span>
            </h2>

            <p className="mt-6 text-base leading-relaxed text-ink-600 sm:text-lg">
              {t('about.body')}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a href="#about" className="btn-primary !px-7 !py-3.5">
                {t('about.cta')}
                <span className="text-gold-300" aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
