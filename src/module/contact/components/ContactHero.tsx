import { useTranslation } from 'react-i18next'
import Reveal from '../../../components/motion/Reveal'

/**
 * Contact hero — same full-width banner treatment as the home hero:
 * `home_banner_image` backdrop, copy on the left
 * ("Get in Touch" + navy/gold headline), garlands + bottom blend.
 */
export default function ContactHero() {
  const { t } = useTranslation()

  return (
    <div className="relative isolate bg-cream-50">
      {/* Side cascading garlands (same as home hero) */}
      <img
        src="/images/home/flower1_image.webp"
        srcSet="/images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w, /images/home/flower1_image.webp 1024w"
        sizes="(max-width: 640px) 22vw, (max-width: 768px) 10rem, (max-width: 1024px) 12rem, (max-width: 1280px) 14rem, 16rem"
        width={1024}
        height={1536}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        fetchPriority="low"
        className="pointer-events-none absolute left-0 bottom-0 z-20 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 max-w-[22vw] h-auto object-contain object-left-bottom select-none"
        loading="eager"
        aria-hidden="true"
      />
      <img
        src="/images/home/flower2_image.webp"
        srcSet="/images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w, /images/home/flower2_image.webp 1024w"
        sizes="(max-width: 640px) 26vw, (max-width: 768px) 11rem, (max-width: 1024px) 13rem, (max-width: 1280px) 15rem, 18rem"
        width={1024}
        height={1536}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        fetchPriority="low"
        className="pointer-events-none absolute right-0 bottom-0 z-20 w-32 sm:w-44 md:w-52 lg:w-60 xl:w-72 max-w-[26vw] h-auto object-contain object-right-top select-none"
        loading="eager"
        aria-hidden="true"
      />

      <section className="relative isolate z-10 w-full lg:h-[540px] xl:h-[580px]">
        {/* Top hanging garlands */}
        <img
          src="/images/home/flower1_image-320.webp"
          srcSet="/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w"
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={320}
          height={480}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute left-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-left-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />
        <img
          src="/images/home/flower2_image-320.webp"
          srcSet="/images/home/flower2_image-192.webp 192w, /images/home/flower2_image-320.webp 320w, /images/home/flower2_image-640.webp 640w"
          sizes="(max-width: 640px) 12vw, (max-width: 768px) 5rem, 8rem"
          width={320}
          height={480}
          alt="Decorative flower garland"
          title="Decorative flower garland"
          className="pointer-events-none absolute right-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-right-top select-none -scale-y-100"
          loading="eager"
          fetchPriority="low"
          aria-hidden="true"
        />

        {/* Banner image: photo block on top for small screens, full-bleed
            backdrop from lg up — same image as the home hero. */}
        <div className="pointer-events-none relative h-72 sm:h-96 overflow-hidden lg:absolute lg:inset-0 lg:h-auto" aria-hidden="true">
          <img
            src="/images/home/home_banner_image.webp"
            srcSet="/images/home/home_banner_image-640.webp 640w, /images/home/home_banner_image-1024.webp 1024w, /images/home/home_banner_image.webp 2172w"
            sizes="100vw"
            width={2172}
            height={724}
            alt="VivahSambandh Indian wedding celebration banner"
            title="VivahSambandh Indian wedding celebration banner"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-[68%_25%] sm:object-[70%_30%] lg:object-[82%_center] xl:object-right will-change-transform"
            loading="eager"
          />
          {/* Mobile fade: photo melts into the cream copy below */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream-50 lg:hidden"
            aria-hidden="true"
          />
        </div>
        {/* Blend overlay: bottom fade into the next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-b from-transparent to-cream-50 sm:h-24 lg:h-28"
          aria-hidden="true"
        />

        {/* Copy */}
        <div className="section-pad relative z-10 -mt-10 pt-4 pb-8 sm:-mt-12 lg:mt-0 lg:flex lg:h-full lg:items-center lg:py-0">
          <div className="grid w-full items-center lg:grid-cols-12">
            <div className="lg:col-span-7 xl:col-span-6 py-4">
              <Reveal variant="up">
                <p data-eyebrow className="eyebrow mt-4">
                  <span aria-hidden="true" className="text-gold-500">❖</span>
                  {t('contactPage.eyebrow')}
                  <span aria-hidden="true" className="inline-flex items-center gap-1 text-gold-500/70">
                    <span className="h-px w-10 bg-gold-500/60" />
                    <span className="text-[9px]">◆</span>
                  </span>
                </p>
              </Reveal>
              <Reveal variant="up" delay={0.08}>
                <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[44px] xl:text-[52px] font-bold leading-[1.12]">
                  <span className="block text-navy-900">{t('contactPage.titleA')}</span>
                  <span className="mt-1 block text-gold-600">{t('contactPage.titleB')}</span>
                </h1>
              </Reveal>
              <Reveal variant="up" delay={0.14}>
                <p className="mt-4 max-w-xl text-xs sm:text-sm lg:text-[15px] font-medium leading-relaxed text-ink-600">
                  {t('contactPage.body')}
                </p>
              </Reveal>
            </div>
            {/* Right side kept clear — the celebration lives in the banner photo */}
            <div className="hidden lg:col-span-5 xl:col-span-6 lg:block h-full" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  )
}
