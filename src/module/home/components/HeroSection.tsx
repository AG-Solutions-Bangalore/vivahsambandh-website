import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap, useGSAP, prefersReducedMotion } from "../../../lib/gsap-setup";

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
    illustration: "/images/home/woman_image.webp",
    illustrationAlt: "Bride Illustration",
    labelKey: "matchCards.bride",
    accentKey: "matchCards.brideAccent",
    accentColor: "text-gold-600",
  },
  {
    id: "groom",
    href: "#search-groom",
    photo: "/images/home/Radiant Indian Groom in a Golden Wedding Setting.webp",
    illustration: "/images/home/man_image.webp",
    illustrationAlt: "Groom Illustration",
    labelKey: "matchCards.groom",
    accentKey: "matchCards.groomAccent",
    accentColor: "text-navy-900",
  },
] as const;

export default function HeroSection() {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;

      // ——— Intro timeline (above the fold → play on mount, not on scroll) ———
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        '[data-hero="eyebrow"]',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, clearProps: "all" },
        0.05,
      )
        // Line-mask reveal: each headline line slides up from inside its overflow-hidden mask
        .fromTo(
          '[data-hero-line]',
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 0.75,
            ease: "power4.out",
            stagger: 0.09,
            clearProps: "all",
          },
          0.1,
        )
        .fromTo(
          '[data-hero="subtitle"]',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.5, clearProps: "all" },
          0.28,
        )
        // CTA Buttons: smooth spring bounce entrance without hard hiding
        .fromTo(
          '[data-hero="cta"] > *',
          { opacity: 0, y: 16, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.09,
            ease: "back.out(1.4)",
            clearProps: "all",
          },
          0.38,
        )
        // Trust Badges: staggered fade and lift
        .fromTo(
          '[data-hero="badges"] li',
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.05,
            clearProps: "all",
          },
          0.5,
        )
        .fromTo(
          '[data-hero="badge-side"]',
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.6, clearProps: "all" },
          0.35,
        );

      // ——— Banner parallax (scrub, desktop only — mobile keeps static image) ———
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to('[data-hero="banner"]', {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: '[data-hero="banner-wrap"]',
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
        // Flowers drift at different rates for depth.
        gsap.to('[data-hero="flower-l"]', {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
        gsap.to('[data-hero="flower-r"]', {
          y: -56,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });

      // ——— Match cards entrance (just below fold → scroll-triggered, once) ———
      gsap.fromTo(
        '[data-hero="cards"] > *',
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: "auto",
          scrollTrigger: {
            trigger: '[data-hero="cards"]',
            start: "top 88%",
            once: true,
          },
        },
      );

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="relative isolate bg-cream-50">
      {/* ============================================================== */}
      {/* Real Flower Images: Left & Right cascading garlands             */}
      {/* Small + in front                                                */}
      {/* ============================================================== */}
      <img
        src="/images/home/flower1_image.webp"
        alt=""
        data-hero="flower-l"
        className="pointer-events-none absolute left-0 bottom-0 z-20 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 max-w-[22vw] h-auto object-contain object-left-bottom select-none"
        loading="eager"
        aria-hidden="true"
      />
      <img
        src="/images/home/flower2_image.webp"
        alt=""
        data-hero="flower-r"
        className="pointer-events-none absolute right-0 bottom-0 z-20 w-32 sm:w-44 md:w-52 lg:w-60 xl:w-72 max-w-[26vw] h-auto object-contain object-right-top select-none"
        loading="eager"
        aria-hidden="true"
      />

      {/* ============================================================== */}
      {/* 1. HERO BANNER: Full-width, proportionally sized to 2172x724   */}
      {/* ============================================================== */}
      <section data-hero="banner-wrap" className="relative isolate z-10 w-full h-[470px] sm:h-[490px] lg:h-[520px] xl:h-[540px]">
        {/* Top garlands: hang from top */}
        <img
          src="/images/home/flower1_image.webp"
          alt=""
          className="pointer-events-none absolute left-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-left-top select-none -scale-y-100"
          loading="eager"
          aria-hidden="true"
        />
        <img
          src="/images/home/flower2_image.webp"
          alt=""
          className="pointer-events-none absolute right-0 top-0 z-[5] w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 max-w-[12vw] h-auto object-contain object-right-top select-none -scale-y-100"
          loading="eager"
          aria-hidden="true"
        />
        {/* Section Background Image: Contained and properly scaled */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <img
            src="/images/home/home_banner_image.webp"
            alt=""
            data-hero="banner"
            className="h-full w-full object-cover object-[78%_center] sm:object-[76%_center] lg:object-[82%_center] xl:object-right will-change-transform"
            loading="eager"
          />
        </div>
        {/* Blend overlay: bottom fade into cards */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-20 bg-gradient-to-b from-transparent to-cream-50 sm:h-24 lg:h-28"
          aria-hidden="true"
        />

        {/* Content Container (Aligned exactly with design) */}
        <div className="section-pad relative z-10 flex h-full items-center">
          <div className="grid w-full items-center lg:grid-cols-12">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-6 py-4">
              {/* Eyebrow */}
              <div data-hero="eyebrow" className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-gold-700">
                <span className="text-gold-600 text-xs sm:text-sm font-black">
                  ✱
                </span>
                <span>{t("hero.eyebrow")}</span>
                <span className="h-px w-12 sm:w-16 bg-gold-500/50" />
              </div>

              {/* Headline (line masks for the mask-reveal intro) */}
              <h1 data-hero="title" className="font-display mt-3 text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-bold leading-[1.12]">
                <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <span data-hero-line className="block text-navy-900 will-change-transform">{t("hero.titleA")}</span>
                </span>
                <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                  <span data-hero-line className="block text-gold-600 mt-0.5 will-change-transform">
                    {t("hero.titleB")}
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p data-hero="subtitle" className="mt-3.5 max-w-md text-xs sm:text-sm leading-relaxed text-ink-600 font-medium">
                {t("hero.subtitle")}
              </p>

              {/* Buttons: styled exactly to design reference pill buttons with rich micro-animations */}
              <div data-hero="cta" className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3.5 sm:gap-4 relative z-20">
                <a
                  href="#register"
                  className="group relative inline-flex items-center justify-center gap-2 sm:gap-2.5 overflow-hidden rounded-full bg-navy-900 px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-navy-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-lg hover:shadow-navy-950/30 active:scale-[0.97]"
                >
                  {/* Subtle shine sweep on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative z-10">{t("hero.createProfile")}</span>
                  <span
                    aria-hidden="true"
                    className="relative z-10 text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#search"
                  className="group relative inline-flex items-center justify-center gap-2 sm:gap-2.5 overflow-hidden rounded-full border border-gold-500/80 bg-white/95 px-6 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm font-semibold text-navy-900 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-600 hover:bg-gold-50/80 hover:shadow-md hover:shadow-gold-500/15 active:scale-[0.97]"
                >
                  {/* Subtle gold sheen sweep on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold-400/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                  />
                  <span className="relative z-10">{t("hero.findMatch")}</span>
                  <span
                    aria-hidden="true"
                    className="relative z-10 text-gold-600 text-xs sm:text-sm transition-transform duration-300 group-hover:translate-x-1.5"
                  >
                    →
                  </span>
                </a>
              </div>

              {/* Trust Badges: Clean single horizontal row with distinct icons */}
              <div data-hero="badges" className="mt-6 pt-2">
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
              <div data-hero="badge-side" className="absolute right-12 xl:right-16 top-1/2 -translate-y-1/2 text-center pointer-events-none select-none z-10">
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
      <section className="section-pad pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10 lg:pb-8 relative z-10">
        <div data-hero="cards" className="grid gap-6 sm:grid-cols-2 lg:gap-8 w-full max-w-7xl mx-auto">
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
                  src="/images/home/flower1_image.webp"
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
