import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { pagePath } from "../../../constants/navigation";
import { useAppLanguage } from "../../../i18n/useAppLanguage";
import { img, imgSrcSet } from "../../../lib/image";
import { getPageSlugAliases } from "../../../lib/page-slug";
import { getFaqAnswer, getFaqQuestion, useGroupedFaqs } from "../hook/useFaq";

export interface FaqSectionProps {
  /**
   * Canonical route of the page ("about", "stories", ...). The CRM slug
   * chain is derived from it, so a section can only ever show the FAQs
   * assigned to its own page.
   */
  page?: string;
  /** Explicit CRM slug — used when `page` is not given. */
  slug?: string;
  /**
   * Naming aliases of the **same** page (e.g. `about` -> `about-us`).
   * Never another page's slug: a page with no FAQ rows renders no section.
   */
  fallbackSlugs?: Array<string | null | undefined> | null;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  tone?: "cream" | "paper" | "navy";
  id?: string;
  showCta?: boolean;
}

/** Number of questions the arc dial shows at once. */
const DIAL_SIZE = 5;

const NODE_ICONS = [Users, FileText, UserPlus, ShieldCheck, BadgeCheck];

interface DialNodeConfig {
  bubbleStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
  arrowClass: string;
  circleCx: number;
  circleCy: number;
}

const DIAL_NODES: DialNodeConfig[] = [
  {
    // Node 0: Far Left
    bubbleStyle: { position: "absolute", left: "15px", top: "252px" },
    buttonStyle: { position: "absolute", left: "160px", top: "275px" },
    arrowClass:
      "absolute -right-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-white drop-shadow-2xs",
    circleCx: 160,
    circleCy: 297,
  },
  {
    // Node 1: Mid Left
    bubbleStyle: { position: "absolute", left: "80px", top: "92px" },
    buttonStyle: { position: "absolute", left: "220px", top: "152px" },
    arrowClass:
      "absolute right-3 -bottom-1.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white drop-shadow-2xs",
    circleCx: 220,
    circleCy: 168,
  },
  {
    // Node 2: Top Center
    bubbleStyle: { position: "absolute", left: "305px", top: "22px" },
    buttonStyle: { position: "absolute", left: "370px", top: "92px" },
    arrowClass:
      "absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white drop-shadow-2xs",
    circleCx: 370,
    circleCy: 108,
  },
  {
    // Node 3: Mid Right
    bubbleStyle: { position: "absolute", left: "535px", top: "92px" },
    buttonStyle: { position: "absolute", left: "520px", top: "152px" },
    arrowClass:
      "absolute left-3 -bottom-1.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white drop-shadow-2xs",
    circleCx: 520,
    circleCy: 168,
  },
  {
    // Node 4: Far Right
    bubbleStyle: { position: "absolute", left: "608px", top: "252px" },
    buttonStyle: { position: "absolute", left: "580px", top: "275px" },
    arrowClass:
      "absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-white drop-shadow-2xs",
    circleCx: 580,
    circleCy: 291,
  },
];

function FaqSkeleton() {
  return (
    <div className="w-full flex items-center justify-center min-h-[380px] animate-pulse">
      <div className="w-[300px] h-[300px] rounded-full bg-cream-100/70 border border-gold-500/30 flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full bg-maroon-100/60" />
        <div className="w-3/4 h-4 rounded bg-maroon-100/60" />
        <div className="w-1/2 h-3 rounded bg-maroon-100/40" />
        <div className="w-full h-12 rounded bg-cream-200/60" />
      </div>
    </div>
  );
}

export default function FaqSection({
  page,
  slug,
  fallbackSlugs,
  title,
  subtitle,
  ctaText,
  ctaHref,
  id = "faq",
  showCta = true,
}: FaqSectionProps) {
  const { t } = useTranslation();
  const { lang } = useAppLanguage();
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  const contactHref =
    ctaHref ||
    (typeof window !== "undefined" && document.getElementById("contact")
      ? "#contact"
      : pagePath("/contact", lang));

  const ctaLabel =
    ctaText || t("faq.contactUs", t("header.contact", "Contact Us"));

  /**
   * CRM slugs this section may query. Derived from the page route so the
   * chain can only ever contain naming aliases of the SAME page — a page
   * with no FAQs of its own gets an empty result, not another page's.
   */
  const pageAliases = page ? getPageSlugAliases(page) : null;
  const primarySlug = pageAliases ? pageAliases[0] : (slug ?? "home");
  const aliasSlugs = pageAliases
    ? pageAliases.slice(1)
    : (fallbackSlugs ?? null);

  const { groups, isPending, isEmpty } = useGroupedFaqs(primarySlug, {
    fallbackSlugs: aliasSlugs,
  });

  /**
   * Every heading group of this page, flattened. The old implementation read
   * `groups[0]` only, so the 20 FAQs outside the first category were
   * unreachable no matter how many rows the API returned.
   */
  const flatItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => ({ item, heading: group.heading })),
      ),
    [groups],
  );

  // The API is the only source of truth — a page with no FAQ rows of its own
  // renders no FAQ section rather than borrowing another page's answers.
  if (!isPending && isEmpty) {
    return null;
  }

  const total = flatItems.length;
  const safeActiveIdx =
    total === 0 ? 0 : Math.min(activeQuestionIdx, total - 1);

  /**
   * Fixed sets of `DIAL_SIZE` questions. The set never slides, so questions
   * from two sets are never shown on the dial at the same time — each set is
   * a self-contained page (the last set may hold fewer than `DIAL_SIZE`).
   */
  const activeSetIndex = Math.floor(safeActiveIdx / DIAL_SIZE);
  const setStart = activeSetIndex * DIAL_SIZE;
  const visibleItems = flatItems.slice(setStart, setStart + DIAL_SIZE);

  /** Slot (0–4) of the active question inside the current set. */
  const activeSlot = safeActiveIdx - setStart;

  const activeEntry = flatItems[safeActiveIdx];
  const activeItem = activeEntry?.item;
  const activeQuestion = activeItem ? getFaqQuestion(activeItem) : "";
  const activeAnswer = activeItem ? getFaqAnswer(activeItem) : "";
  const activeHeading = activeEntry?.heading ?? null;
  const ActiveIcon = NODE_ICONS[safeActiveIdx % NODE_ICONS.length];

  /**
   * Two-level navigation.
   * 1. Inside a set the arrows move one question at a time.
   * 2. At a set boundary they page to the adjacent set:
   *    Next on the last question → first question of the next set.
   *    Prev on the first question → last question of the previous set.
   * Both directions wrap around the whole list, staying circular.
   */
  const handlePrev = () => {
    if (total === 0) return;
    setActiveQuestionIdx((prev) => {
      const prevSetStart = Math.floor(prev / DIAL_SIZE) * DIAL_SIZE;
      if (prev > prevSetStart) return prev - 1;
      const lastIdx = total - 1;
      const lastSetStart = Math.floor(lastIdx / DIAL_SIZE) * DIAL_SIZE;
      const targetSetStart =
        prevSetStart === 0 ? lastSetStart : prevSetStart - DIAL_SIZE;
      return Math.min(targetSetStart + DIAL_SIZE - 1, lastIdx);
    });
  };

  const handleNext = () => {
    if (total === 0) return;
    setActiveQuestionIdx((prev) => {
      const setStart = Math.floor(prev / DIAL_SIZE) * DIAL_SIZE;
      const setEnd = Math.min(setStart + DIAL_SIZE - 1, total - 1);
      if (prev < setEnd) return prev + 1;
      const nextSetStart = setStart + DIAL_SIZE;
      return nextSetStart >= total ? 0 : nextSetStart;
    });
  };

  return (
    <section
      id={id}
      className="pt-10 sm:pt-14 pb-12 sm:pb-16 bg-cream-50 text-ink-600 relative overflow-x-clip select-none"
    >
      {/* Top right bridal floral garland artwork */}
      <img
        src={img("/images/home/flower1_image-320.webp")}
        srcSet={imgSrcSet(
          "/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w",
        )}
        sizes="(max-width: 640px) 120px, (max-width: 1024px) 200px, 280px"
        width={320}
        height={480}
        alt="Decorative flower garland"
        title="Decorative flower garland"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute -right-14 rotate-[160deg] top-0 z-10 w-32 sm:w-44 md:w-56 lg:w-64 max-w-[28vw] h-auto object-contain object-right-top select-none opacity-90"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* Left Column: Eyebrow, Motif Icon, Title, Divider, Subtitle, and Optional Category Tabs */}
          <div className="lg:col-span-4 flex flex-col items-start text-left relative z-20">
            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-navy-900 leading-[1.18] mb-2.5">
              {title ? (
                title
              ) : (
                <>
                  Frequently <br />
                  <span className="text-maroon-600">Asked Questions</span>
                </>
              )}
            </h2>

            {/* Ornate Gold Heart Divider */}
            <div className="flex items-center gap-2 text-gold-600 mb-2.5">
              <span className="w-6 h-[1px] bg-gold-500/60" />
              <span className="text-xs leading-none">♡</span>
              <span className="w-6 h-[1px] bg-gold-500/60" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-ink-600 leading-relaxed max-w-[280px] mb-4 sm:mb-6">
              {subtitle ||
                t(
                  "faq.subtitle",
                  "Find answers to common questions about Vivah Sambandh.",
                )}
            </p>
          </div>

          {/* Right Column: Semicircular Arc Dial on Desktop & Carousel on Mobile */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center relative min-h-[390px] lg:min-h-[415px] overflow-visible">
            {isPending && isEmpty ? (
              <FaqSkeleton />
            ) : (
              <>
                {/* Desktop Dial (md+) */}
                <div className="w-full hidden md:flex items-center justify-center overflow-visible">
                  <div className="relative w-[740px] h-[415px] shrink-0 scale-[0.84] lg:scale-[0.92] xl:scale-[0.98] origin-center transition-transform">
                    {/* SVG Dashed Arc and Node Points */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-0"
                      viewBox="0 0 740 480"
                    >
                      <path
                        d="M 140,285 A 215,215 0 0,1 600,285"
                        fill="none"
                        stroke="var(--color-gold-500)"
                        strokeWidth="1.3"
                        strokeDasharray="4 4"
                        opacity="0.8"
                      />
                      {DIAL_NODES.map((node, i) => {
                        const isActive = activeSlot === i;
                        return isActive ? (
                          <g key={i}>
                            <circle
                              cx={node.circleCx}
                              cy={node.circleCy}
                              r="4"
                              fill="var(--color-maroon-600)"
                            />
                            <circle
                              cx={node.circleCx}
                              cy={node.circleCy}
                              r="1.8"
                              fill="white"
                            />
                          </g>
                        ) : (
                          <g key={i}>
                            <circle
                              cx={node.circleCx}
                              cy={node.circleCy}
                              r="2.5"
                              fill="var(--color-gold-500)"
                              opacity="0.75"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* 5 Interactive Nodes (Tooltip Bubble + Button) */}
                    {visibleItems.map((entry, slot) => {
                      const node = DIAL_NODES[slot];
                      if (!node) return null;
                      const globalIdx = setStart + slot;
                      const isActive = safeActiveIdx === globalIdx;
                      const Icon = NODE_ICONS[slot % NODE_ICONS.length];
                      const q = getFaqQuestion(entry.item);

                      return (
                        <div key={globalIdx} className="relative z-40">
                          {/* Tooltip Bubble */}
                          <div
                            style={node.bubbleStyle}
                            onClick={() => setActiveQuestionIdx(globalIdx)}
                            className="cursor-pointer"
                          >
                            <div
                              className={`relative px-3 py-1.5 rounded-xl bg-white shadow-sm text-center max-w-[130px] border transition-all ${
                                isActive
                                  ? "border-maroon-300 shadow-md shadow-maroon-600/12 scale-105"
                                  : "border-cream-300 hover:border-gold-500/50 opacity-90 hover:opacity-100"
                              }`}
                            >
                              <p
                                className={`text-[11px] font-semibold leading-snug line-clamp-2 ${
                                  isActive ? "text-navy-900" : "text-ink-600"
                                }`}
                              >
                                {q}
                              </p>
                              {isActive && (
                                <div className="w-5 h-[2px] bg-maroon-600 rounded-full mx-auto mt-1" />
                              )}
                              <div className={node.arrowClass} />
                            </div>
                          </div>

                          {/* Node Icon Button */}
                          <button
                            type="button"
                            aria-label={q}
                            onClick={() => setActiveQuestionIdx(globalIdx)}
                            style={node.buttonStyle}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer -translate-x-1/2 -translate-y-1/2 z-30 ${
                              isActive
                                ? "bg-maroon-600 text-white shadow-md shadow-maroon-600/30 scale-110 ring-4 ring-maroon-50"
                                : "bg-white text-maroon-600 border border-cream-300 hover:border-gold-500/60 shadow-sm hover:scale-105"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? "stroke-[2.2]" : "stroke-[1.8]"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}

                    {/* Center Circular Spotlight Card */}
                    <div className="absolute left-[370px] top-[295px] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="relative w-[310px] h-[310px] lg:w-[325px] lg:h-[325px] rounded-full bg-white shadow-[0_12px_40px_rgb(158_27_50/0.16)] ring-6 ring-maroon-50/80 border border-maroon-100/60 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                        {/* Prev Button */}
                        <button
                          type="button"
                          aria-label="Previous question"
                          onClick={handlePrev}
                          className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white shadow-md border border-cream-300 text-maroon-600 hover:bg-maroon-50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-40"
                        >
                          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Next Button */}
                        <button
                          type="button"
                          aria-label="Next question"
                          onClick={handleNext}
                          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white shadow-md border border-cream-300 text-maroon-600 hover:bg-maroon-50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-40"
                        >
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Inside Spotlight Content */}
                        <div className="flex flex-col items-center text-center max-w-[235px]">
                          <div className="text-maroon-600 mb-1.5">
                            <ActiveIcon className="w-5 h-5 stroke-[1.8]" />
                          </div>

                          {activeHeading && (
                            <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-gold-700">
                              {activeHeading}
                            </p>
                          )}

                          <h3 className="font-serif font-bold text-sm lg:text-[16px] text-navy-900 leading-tight line-clamp-2 max-w-[230px] mb-1.5">
                            {activeQuestion}
                          </h3>

                          <div
                            className="flex items-center justify-center gap-1 text-gold-600 mb-2"
                            aria-hidden="true"
                          >
                            <span className="w-4 h-[1px] bg-gold-500/60" />
                            <span className="text-[10px]">♡</span>
                            <span className="w-4 h-[1px] bg-gold-500/60" />
                          </div>

                          <p className="text-[11px] lg:text-[11.5px] text-ink-600 leading-relaxed max-w-[230px] line-clamp-4 mb-3.5">
                            {activeAnswer}
                          </p>

                          {showCta !== false && (
                            <Link
                              to={contactHref}
                              className="bg-maroon-600 hover:bg-maroon-700 text-white text-[11px] lg:text-xs font-medium px-5 py-1.5 rounded-full shadow-md shadow-maroon-600/20 hover:shadow-lg transition-all hover:scale-105 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{ctaLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile View (Below md) */}
                <div className="w-full flex flex-col items-center md:hidden mt-2">
                  {/* Scrollable Question Pills */}
                  <div className="w-full flex gap-2 overflow-x-auto pb-2.5 mb-4 scrollbar-none justify-start px-2">
                    {visibleItems.map((entry, slot) => {
                      const globalIdx = setStart + slot;
                      const isActive = safeActiveIdx === globalIdx;
                      const Icon = NODE_ICONS[slot % NODE_ICONS.length];
                      const q = getFaqQuestion(entry.item);
                      return (
                        <button
                          key={globalIdx}
                          type="button"
                          onClick={() => setActiveQuestionIdx(globalIdx)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                            isActive
                              ? "bg-maroon-600 text-white font-semibold shadow-xs"
                              : "bg-white text-ink-600 border border-cream-300 hover:bg-maroon-50"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{q}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Circular Spotlight Card for Mobile */}
                  <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] rounded-full bg-white shadow-[0_12px_35px_rgb(158_27_50/0.16)] ring-5 ring-maroon-50 border border-maroon-100 flex flex-col items-center justify-center p-5 text-center">
                    <button
                      type="button"
                      aria-label="Previous question"
                      onClick={handlePrev}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-cream-300 text-maroon-600 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next question"
                      onClick={handleNext}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-cream-300 text-maroon-600 flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <div className="flex flex-col items-center text-center max-w-[210px]">
                      <div className="text-maroon-600 mb-1">
                        <ActiveIcon className="w-4 h-4 stroke-[1.8]" />
                      </div>

                      {activeHeading && (
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-700">
                          {activeHeading}
                        </p>
                      )}

                      <h3 className="font-serif font-bold text-sm sm:text-base text-navy-900 leading-tight line-clamp-2 max-w-[210px] mb-1">
                        {activeQuestion}
                      </h3>

                      <div
                        className="flex items-center justify-center gap-1 text-gold-600 mb-1.5"
                        aria-hidden="true"
                      >
                        <span className="w-3 h-[1px] bg-gold-500/60" />
                        <span className="text-[9px]">♡</span>
                        <span className="w-3 h-[1px] bg-gold-500/60" />
                      </div>

                      <p className="text-[10.5px] sm:text-[11px] text-ink-600 leading-relaxed line-clamp-4 max-w-[210px] mb-3">
                        {activeAnswer}
                      </p>

                      {showCta !== false && (
                        <Link
                          to={contactHref}
                          className="bg-maroon-600 text-white text-[11px] font-medium px-4 py-1.5 rounded-full shadow-md shadow-maroon-600/20 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{ctaLabel}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
