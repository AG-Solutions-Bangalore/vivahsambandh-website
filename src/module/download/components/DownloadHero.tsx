import { useTranslation } from "react-i18next";
import { img, imgSrcSet } from "../../../lib/image";
import StoreBadge from "../../../components/StoreBadge";
import Reveal from "../../../components/motion/Reveal";

export default function DownloadHero() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-cream-50 pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Subtle jaali texture + ambient golden glows */}
      <div
        className="bg-jaali pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.22),transparent_70%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(163,51,77,0.1),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="section-pad relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading, Subtitle, Badges & QR Code */}
          <Reveal variant="left" className="lg:col-span-7">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3.5 py-1 text-xs font-bold tracking-[0.2em] uppercase text-gold-700 backdrop-blur">
              <span className="text-gold-600">✦</span>
              <span>{t("downloadPage.eyebrow")}</span>
            </div>

            {/* Headline */}
            <h1 className="font-display mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.12]">
              <span className="block text-navy-900">
                {t("downloadPage.titleA")}
              </span>
              <span className="block bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 bg-clip-text text-transparent mt-1">
                {t("downloadPage.titleB")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-600 sm:text-base">
              {t("downloadPage.subtitle")}
            </p>

            {/* Store Download Buttons & QR Code */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <StoreBadge store="play" className="rounded-full !py-3 !px-5" />
                <StoreBadge store="apple" className="rounded-full !py-3 !px-5" />
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="mt-8 pt-6 border-t border-gold-500/20 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 text-xs font-bold">
                  ✓
                </span>
                <span className="font-semibold text-navy-900">
                  {t("downloadPage.badges.verified")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 text-xs font-bold">
                  ★
                </span>
                <span className="font-semibold text-navy-900">
                  {t("downloadPage.rating")}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Phone Mockup with Floating UI Notifications */}
          <Reveal
            variant="scale"
            delay={0.15}
            className="relative flex justify-center lg:col-span-5"
          >
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px]">
              {/* Outer Golden Glow behind Device */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-gold-500/25 via-maroon-600/10 to-transparent blur-2xl"
                aria-hidden="true"
              />

              {/* Main Phone Showcase */}
              <div className="relative z-10 overflow-hidden rounded-[36px] p-2">
                <img
                  src={img("/images/home/vivahsambandh-app-image.webp")}
                  srcSet={imgSrcSet(
                    "/images/home/vivahsambandh-app-image-800.webp 800w, /images/home/vivahsambandh-app-image.webp 1426w",
                  )}
                  sizes="(max-width: 640px) 85vw, 24rem"
                  width={1426}
                  height={1103}
                  alt="Vivah Sambandh App Screen Showcase"
                  title="Vivah Sambandh App Screen Showcase"
                  className="h-auto w-full object-contain rounded-[28px]"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Floating Match Notification Card (Top Right) */}
              <div className="absolute -top-4 -right-4 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-white/95 p-3 text-navy-900 shadow-[0_12px_40px_rgba(7,17,31,0.14)] backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-500 max-w-[240px]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 font-bold text-sm">
                  ✨
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-navy-900">
                    {t("downloadPage.previewCards.matchTitle")}
                  </span>
                  <span className="block text-[10.5px] text-gold-700 font-medium mt-0.5">
                    {t("downloadPage.previewCards.matchDesc")}
                  </span>
                </div>
              </div>

              {/* Floating Instant Alert Card (Bottom Left) */}
              <div className="absolute -bottom-4 -left-4 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-gold-500/40 bg-white/95 p-3 text-navy-900 shadow-[0_12px_40px_rgba(7,17,31,0.14)] backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-[240px]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-maroon-600/10 text-maroon-700 font-bold text-sm">
                  🔔
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs font-bold text-navy-900">
                    {t("downloadPage.previewCards.alertTitle")}
                  </span>
                  <span className="block text-[10.5px] text-ink-600 font-medium mt-0.5">
                    {t("downloadPage.previewCards.alertDesc")}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
