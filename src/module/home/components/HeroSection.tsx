import { useTranslation } from "react-i18next";

const TRUST_BADGES = [
  {
    key: "hero.verified",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M13.78 4.22a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0L3.72 8.78a.75.75 0 011.06-1.06l2.19 2.19 5.72-5.72a.75.75 0 011.09.03z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "hero.privacy",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 1a3.5 3.5 0 00-3.5 3.5V6H4a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-.5V4.5A3.5 3.5 0 008 1zm2 5V4.5a2 2 0 10-4 0V6h4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    key: "hero.community",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path d="M7 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM11.5 6a2 2 0 100-4 2 2 0 000 4zM2 13.5c0-2.3 2.2-3.5 5-3.5s5 1.2 5 3.5V14H2v-.5zm10 0c0-.8-.3-1.6-.9-2.2 1.4.2 2.9.8 2.9 2.2V14h-2v-.5z" />
      </svg>
    ),
  },
  {
    key: "hero.familySupport",
    icon: (
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 fill-current"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8 1.75a.75.75 0 00-.53.22L2.22 7.22a.75.75 0 001.06 1.06L4 7.56V13.5A1.5 1.5 0 005.5 15h5a1.5 1.5 0 001.5-1.5V7.56l.72.72a.75.75 0 101.06-1.06L8.53 1.97A.75.75 0 008 1.75zm-.25 5.5a1.5 1.5 0 012.3 1.25c0 1.2-1.7 2.5-2.05 2.75a.4.4 0 01-.5 0c-.35-.25-2.05-1.55-2.05-2.75a1.5 1.5 0 012.3-1.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
] as const;

const MATCH_CARDS = [
  {
    id: "bride",
    href: "#search-bride",
    photo: "/images/home/Radiant Indian Bride in Floral Glow.webp",
    illustration: "/images/home/woman_image.png",
    illustrationAlt: "Bride Illustration",
    labelKey: "matchCards.bride",
    accentKey: "matchCards.brideAccent",
    accentColor: "text-gold-600",
  },
  {
    id: "groom",
    href: "#search-groom",
    photo: "/images/home/Radiant Indian Groom in a Golden Wedding Setting.webp",
    illustration: "/images/home/man_image.png",
    illustrationAlt: "Groom Illustration",
    labelKey: "matchCards.groom",
    accentKey: "matchCards.groomAccent",
    accentColor: "text-navy-900",
  },
] as const;

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-cream-50">
      {/* ============================================================== */}
      {/* Real Flower Images: Left & Right cascading garlands             */}
      {/* ============================================================== */}
      <img
        src="/images/home/flower1_image.png"
        alt=""
        className="pointer-events-none absolute left-0 bottom-0 z-20 w-36 sm:w-48 md:w-60 lg:w-72 xl:w-84 max-w-[26vw] object-contain object-left-bottom select-none"
        loading="eager"
        aria-hidden="true"
      />
      <img
        src="/images/home/flower2_image.png"
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 z-20 w-36 sm:w-48 md:w-60 lg:w-72 xl:w-88 max-w-[34vw] object-contain object-right-top select-none"
        loading="eager"
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* 1. HERO BANNER: Full-width, proportionally sized to 2172x724   */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden border-b border-gold-500/20 bg-cream-50 h-[470px] sm:h-[490px] lg:h-[520px] xl:h-[540px]">
        {/* Section Background Image: Contained and properly scaled */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/images/home/home_banner_image.png"
            alt=""
            className="h-full w-full object-cover object-[78%_center] sm:object-[76%_center] lg:object-[82%_center] xl:object-right"
            loading="eager"
          />
        </div>

        {/* Content Container (Aligned exactly with design) */}
        <div className="section-pad relative z-10 flex h-full items-center">
          <div className="grid w-full items-center lg:grid-cols-12">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-6 py-4">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-gold-700">
                <span className="text-gold-600 text-xs sm:text-sm font-black">
                  ✱
                </span>
                <span>{t("hero.eyebrow")}</span>
                <span className="h-px w-12 sm:w-16 bg-gold-500/50" />
              </div>

              {/* Headline */}
              <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.12]">
                <span className="block text-navy-900">{t("hero.titleA")}</span>
                <span className="block text-gold-600 mt-0.5">
                  {t("hero.titleB")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-3.5 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium">
                {t("hero.subtitle")}
              </p>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <a
                  href="#register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition hover:bg-navy-800 active:scale-[0.98]"
                >
                  <span>{t("hero.createProfile")}</span>
                  <span
                    aria-hidden="true"
                    className="text-xs transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#search"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500/70 bg-white/90 px-6 py-2.5 text-xs sm:text-sm font-semibold text-navy-900 shadow-xs backdrop-blur-xs transition hover:bg-gold-50 hover:border-gold-600 active:scale-[0.98]"
                >
                  <span>{t("hero.findMatch")}</span>
                  <span className="text-gold-600" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>

              {/* Trust Badges: Clean single horizontal row with distinct icons */}
              <div className="mt-6 pt-2">
                <ul className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-[11px] sm:text-xs font-semibold text-navy-900">
                  {TRUST_BADGES.map((b) => (
                    <li
                      key={b.key}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold-500/60 bg-gold-50/90 text-gold-700 shadow-2xs">
                        {b.icon}
                      </span>
                      <span>{t(b.key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side placeholder to preserve space for couple in background banner */}
            <div
              className="hidden lg:col-span-5 xl:col-span-6 lg:block h-full relative"
              aria-hidden="true"
            >
              {/* "Same Values Brighter Futures ♥" badge next to bride (from design reference) */}
              <div className="absolute right-12 xl:right-16 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-10">
                <p className="font-serif italic text-lg sm:text-xl xl:text-2xl font-bold leading-tight text-maroon-600 drop-shadow-xs">
                  Same
                  <br />
                  Values
                  <br />
                  Brighter
                  <br />
                  Futures
                </p>
                <p className="mt-1 text-maroon-600 text-base xl:text-lg">♥</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. QUICK MATCH CARDS: Positioned cleanly below the hero banner */}
      {/* ============================================================== */}
      <section className="section-pad py-8 sm:py-10 lg:py-12 relative z-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8 w-full max-w-7xl mx-auto">
          {MATCH_CARDS.map((card) => (
            <a
              key={card.id}
              href={card.href}
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gold-500/35 bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold-500"
            >
              {/* Left: Rectangular photo with rounded corners */}
              <div className="relative h-28 w-28 sm:h-36 sm:w-40 md:h-40 md:w-48 lg:h-44 lg:w-56 xl:h-48 xl:w-64 shrink-0 overflow-hidden rounded-xl border-gold-500/30">
                <img
                  src={card.photo}
                  alt={t(card.labelKey)}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Center: Gold Illustrated Avatar + Text */}
              <div className="flex flex-1 flex-col items-center justify-center text-center px-3 sm:px-4 md:px-6">
                <img
                  src={card.illustration}
                  alt={card.illustrationAlt}
                  className="h-14 w-auto sm:h-18 md:h-20 lg:h-22 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <p className="mt-1 text-xs sm:text-sm font-bold text-navy-950">
                  {t(card.labelKey)}
                </p>
                <h3
                  className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight ${card.accentColor}`}
                >
                  {t(card.accentKey)}
                </h3>
              </div>

              {/* Right: Circular Navy Arrow Button */}
              <div className="mr-1 sm:mr-3 md:mr-4 flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white transition-all duration-300 group-hover:bg-navy-800 group-hover:translate-x-1 z-10">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Decorative floral spray on bottom-right corner (enlarged & visible) */}
              <div className="pointer-events-none absolute -right-16 -bottom-3  sm:-bottom-4 h-32 w-28 sm:h-44 sm:w-36 md:h-52 md:w-44 lg:h-60 lg:w-52 opacity-95 select-none hidden sm:block">
                <img
                  src="/images/home/flower1_image.png"
                  alt=""
                  className="h-full w-full object-contain object-right-bottom -scale-x-100 rotate-6"
                />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
