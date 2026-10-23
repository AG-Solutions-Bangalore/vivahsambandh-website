import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "cn";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { pagePath } from "../../../constants/navigation";
import type { AppLang } from "../../../i18n";
import { img, imgSrcSet } from "../../../lib/image";
import { useCommunitiesQuery } from "../hook/useHomeData";

interface CommunityInfo {
  id: string;
  name: string;
}

/**
 * The CRM only stores English names. This maps each one to its position in
 * the translated `communities.list`, so Hindi visitors see "अग्रवाल" for the
 * API's "Agarwal" — the list itself and its order stay API-driven.
 */
const COMMUNITY_I18N_INDEX: Record<string, number> = {
  agarwal: 0,
  agrawal: 0,
  jain: 1,
  khandelwal: 2,
  maheshwari: 3,
  maheshvari: 3,
};

const SKELETON_CARDS = [0, 1, 2, 3];

export default function CommunitiesSection() {
  const { t, i18n } = useTranslation();
  const lang: AppLang =
    i18n.resolvedLanguage === "hi" || i18n.language === "hi" ? "hi" : "en";
  const registerHref = pagePath("/register", lang);

  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null,
  );

  const { data: apiCommunities, isLoading } = useCommunitiesQuery();

  const communities = useMemo<CommunityInfo[]>(() => {
    if (!apiCommunities) return [];

    // Render the CRM's list only — no invented gotras or taglines. The CRM
    // sends English names, so known communities are translated via i18n.
    return apiCommunities.map((community) => {
      const name = community.community_name.trim();
      const index = COMMUNITY_I18N_INDEX[name.toLowerCase()];

      return {
        id: String(community.id),
        name:
          index === undefined
            ? name
            : t(`communities.list.${index}.name`, { defaultValue: name }),
      };
    });
  }, [apiCommunities, t]);

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
                    "Explore verified matrimonial profiles across our communities.",
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
            aria-busy={isLoading}
            className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3"
          >
            {isLoading
              ? SKELETON_CARDS.map((index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="h-9 w-24 animate-pulse rounded-full border border-cream-300 bg-white/70 sm:h-[2.625rem] sm:w-28"
                  />
                ))
              : communities.map((comm) => {
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
          {isLoading &&
            SKELETON_CARDS.map((index) => (
              <div
                key={index}
                data-reveal-item
                aria-hidden="true"
                className="relative flex animate-pulse flex-col items-center rounded-2xl border border-gold-500/20 bg-white pt-11 pb-3"
              >
                <span className="absolute -top-7 left-1/2 size-14 -translate-x-1/2 rounded-full border border-gold-500/30 bg-gold-100/70 ring-4 ring-white" />
                <span className="h-7 w-28 rounded-md bg-cream-200" />
                <div className="mt-4 w-full border-t border-cream-200 p-3">
                  <span className="block h-10 w-full rounded-xl bg-cream-100" />
                </div>
              </div>
            ))}

          {!isLoading &&
            communities.map((comm) => {
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

                  <h3 className="font-display text-2xl font-bold text-navy-950 sm:text-[1.7rem]">
                    {comm.name}
                  </h3>

                  {/* Direct action — inverts to navy on hover */}
                  <div className="mt-4 w-full border-t border-cream-200 p-3">
                    <Link
                      to={registerHref}
                      className="group/cta flex w-full items-center justify-between rounded-xl bg-cream-100 px-4 py-2.5 text-xs font-bold text-navy-950 transition-all duration-300 hover:bg-navy-950 hover:text-white hover:shadow-gold"
                    >
                      <span>
                        {t("communities.explore", {
                          defaultValue: "Explore Matches",
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

        {!isLoading && communities.length === 0 && (
          <p className="mt-8 rounded-2xl border border-cream-200 bg-white/70 px-6 py-10 text-center text-sm font-medium text-ink-600">
            {t("communities.empty", {
              defaultValue:
                "Communities are unavailable right now. Please try again shortly.",
            })}
          </p>
        )}
      </div>
    </section>
  );
}
