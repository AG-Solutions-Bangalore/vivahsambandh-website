import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "cn";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { pagePath } from "../../../constants/navigation";
import type { AppLang } from "../../../i18n";
import { img, imgSrcSet } from "../../../lib/image";

interface CommunityInfo {
  id: string;
  name: string;
  tag: string;
}

export default function CommunitiesSection() {
  const { t, i18n } = useTranslation();
  const lang: AppLang =
    i18n.resolvedLanguage === "hi" || i18n.language === "hi" ? "hi" : "en";
  const registerHref = pagePath("/register", lang);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null,
  );

  const communities: CommunityInfo[] = [
    {
      id: "agarwal",
      name: t("communities.list.0.name", { defaultValue: "Agarwal" }),
      tag: t("communities.list.0.tag", { defaultValue: "18 Sacred Gotras" }),
    },
    {
      id: "jain",
      name: t("communities.list.1.name", { defaultValue: "Jain" }),
      tag: t("communities.list.1.tag", {
        defaultValue: "Digambar & Svetambar Traditions",
      }),
    },
    {
      id: "khandelwal",
      name: t("communities.list.2.name", { defaultValue: "Khandelwal" }),
      tag: t("communities.list.2.tag", { defaultValue: "Vaishya Heritage" }),
    },
    {
      id: "maheshwari",
      name: t("communities.list.3.name", { defaultValue: "Maheshwari" }),
      tag: t("communities.list.3.tag", { defaultValue: "72 Sacred Khams" }),
    },
  ];

  const handleToggle = (id: string) => {
    setSelectedCommunity((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="communities"
      aria-label="Communities We Serve"
      className="relative overflow-hidden bg-cream-50 pt-10 pb-14 sm:pt-12 sm:pb-18"
    >
      {/* Ambient warmth: soft gold glow above, faint maroon glow below */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-6rem] left-1/2 h-72 w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-8rem] size-72 rounded-full bg-maroon-400/[0.06] blur-3xl" />
      </div>

      {/* ============================================================== */}
      {/* L-shaped Floral Decoration: bottom-left corner                 */}
      {/* Vertical arm: flower3 along left edge                          */}
      {/* Horizontal arm: flower4 along bottom-left edge                 */}
      {/* ============================================================== */}
      {/* Vertical arm of L — left edge */}
      <img
        src={img("/images/home/flower3_image.webp")}
        srcSet={imgSrcSet(
          "/images/home/flower3_image-320.webp 320w, /images/home/flower3_image-640.webp 640w, /images/home/flower3_image.webp 942w",
        )}
        sizes="(max-width: 640px) 14vw, (max-width: 1024px) 8rem, 11rem"
        width={942}
        height={1670}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        className="pointer-events-none absolute left-0 bottom-0 z-0 w-20 sm:w-24 md:w-32 lg:w-40 xl:w-48 max-w-[14vw] h-auto object-contain object-left-bottom select-none opacity-90"
        loading="lazy"
        aria-hidden="true"
      />
      {/* Horizontal arm of L — bottom-left, rotated 90° CW */}
      <img
        src={img("/images/home/flower4_image.webp")}
        srcSet={imgSrcSet(
          "/images/home/flower4_image-320.webp 320w, /images/home/flower4_image-640.webp 640w, /images/home/flower4_image.webp 942w",
        )}
        sizes="(max-width: 640px) 14vw, (max-width: 1024px) 8rem, 11rem"
        width={942}
        height={1670}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        className="pointer-events-none absolute left-0 bottom-0 z-0 w-20 sm:w-24 md:w-32 lg:w-40 xl:w-48 max-w-[14vw] h-auto object-contain object-left-bottom select-none opacity-90 origin-bottom-left rotate-90"
        loading="lazy"
        aria-hidden="true"
      />

      <div className="section-pad relative z-10">
        {/* ============================================================== */}
        {/* Section Header: Eyebrow, Title, Subtitle, Register CTA         */}
        {/* ============================================================== */}
        <Reveal variant="up">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2">
                <span
                  className="text-gold-600 text-sm font-bold"
                  aria-hidden="true"
                >
                  ☸
                </span>
                <span
                  data-eyebrow
                  className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gold-700"
                >
                  {t("communities.eyebrow", {
                    defaultValue: "Browse by community",
                  })}
                </span>
                <div
                  className="inline-flex items-center gap-1 text-gold-500/80"
                  aria-hidden="true"
                >
                  <span className="h-px w-8 sm:w-12 bg-gold-500/60" />
                  <span className="text-[10px]">◆</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950">
                {t("communities.title", {
                  defaultValue: "Find Matches by Community",
                })}
              </h2>

              {/* Subtitle */}
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-ink-600 font-medium">
                {t("communities.subtitle", {
                  defaultValue:
                    "Explore verified matrimonial profiles across Agarwal, Jain, Khandelwal, and Maheshwari families.",
                })}
              </p>
            </div>

            {/* Register CTA: bordered pill that fills maroon on hover */}
            <div className="shrink-0">
              <Link
                to={registerHref}
                title={t("communities.register", {
                  defaultValue: "Register Free Bio-Data",
                })}
                className="group inline-flex items-center gap-2 rounded-full border border-maroon-600/25 bg-white/70 px-4 py-2 text-xs font-bold text-maroon-700 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-maroon-600 hover:bg-maroon-600 hover:text-white hover:shadow-lg sm:px-5 sm:py-2.5 sm:text-sm"
              >
                <span>
                  {t("communities.register", {
                    defaultValue: "Register Free Bio-Data",
                  })}
                </span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* ============================================================== */}
        {/* Community Filter Pills: dot indicator, navy when active        */}
        {/* ============================================================== */}
        <Reveal variant="up" delay={0.1}>
          <div
            role="group"
            aria-label="Community selection pills"
            className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3"
          >
            {communities.map((comm) => {
              const isSelected = selectedCommunity === comm.id;

              return (
                <button
                  key={comm.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggle(comm.id)}
                  className={cn(
                    "group inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none select-none sm:px-5 sm:py-2.5",
                    "focus-visible:ring-2 focus-visible:ring-gold-500/60",
                    isSelected
                      ? "-translate-y-0.5 border border-navy-950 bg-navy-950 text-white shadow-md ring-2 ring-gold-500/40"
                      : "border border-cream-300 bg-white/70 text-navy-950 hover:-translate-y-0.5 hover:border-gold-500 hover:bg-gold-50/60 active:scale-95",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors duration-300",
                      isSelected
                        ? "bg-gold-400"
                        : "bg-gold-500/40 group-hover:bg-gold-600",
                    )}
                    aria-hidden="true"
                  />
                  <span>{comm.name}</span>
                </button>
              );
            })}

            {selectedCommunity && (
              <button
                type="button"
                onClick={() => setSelectedCommunity(null)}
                className="ml-1 cursor-pointer rounded-full border border-cream-300 bg-white/70 px-3 py-2 text-xs font-semibold text-ink-600 transition-all duration-300 hover:border-maroon-400 hover:text-maroon-700"
              >
                {t("communities.clearFilter", { defaultValue: "Show All" })}
              </button>
            )}
          </div>
        </Reveal>

        {/* ============================================================== */}
        {/* Community Cards: centered monogram medallion breaking the      */}
        {/* top border — wedding-invite composition, gold hairline         */}
        {/* ornament divider, CTA row that inverts to navy on hover        */}
        {/* ============================================================== */}
        <RevealGroup
          className="mt-8 grid grid-cols-1 gap-5 pt-7 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
          stagger={0.08}
        >
          {communities.map((comm) => {
            const isSelected = selectedCommunity === comm.id;
            const isFilteredOut = selectedCommunity !== null && !isSelected;

            return (
              <article
                key={comm.id}
                data-reveal-item
                className={cn(
                  "group relative flex flex-col items-center rounded-2xl border bg-white pt-11 pb-3 text-center shadow-xs transition-all duration-300",
                  isSelected
                    ? "-translate-y-1 border-gold-500 bg-gradient-to-b from-gold-50/50 via-white to-white ring-2 ring-gold-500/40 shadow-lift"
                    : "border-gold-500/25 hover:-translate-y-1.5 hover:border-gold-500/70 hover:shadow-lift",
                  isFilteredOut && "opacity-40 saturate-50",
                )}
              >
                {/* Monogram medallion: first letter of the community name,
                    breaks the card's top border like a seal */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "font-display absolute -top-7 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border text-2xl font-bold ring-4 ring-white transition-all duration-300",
                    isSelected
                      ? "border-navy-800 bg-navy-950 text-gold-400 shadow-gold group-hover:scale-105"
                      : "border-gold-500/50 bg-gradient-to-b from-gold-100 to-gold-50 text-gold-800 shadow-[0_6px_16px_-6px_rgb(183_121_31/0.5)] group-hover:scale-105",
                  )}
                >
                  {comm.name.charAt(0)}
                </span>

                {/* Profile count */}

                <h3 className="font-display text-2xl font-bold text-navy-950 sm:text-[1.7rem]">
                  {comm.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-gold-700">
                  {comm.tag}
                </p>

                {/* Direct action — inverts to navy on hover */}
                <div className="mt-4 w-full border-t border-cream-200 p-3">
                  <Link
                    to={registerHref}
                    className="group/cta flex w-full items-center justify-between rounded-xl bg-cream-100 px-4 py-2.5 text-xs font-bold text-navy-950 transition-all duration-300 hover:bg-navy-950 hover:text-white hover:shadow-gold"
                  >
                    <span>
                      {t("communities.findMatches", {
                        defaultValue: `Find ${comm.name} Matches`,
                        name: comm.name,
                      })}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 transition-all duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:bg-gold-400 group-hover/cta:text-navy-950"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
