import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Reveal from "../../../components/motion/Reveal";
import { refreshScrollTriggers } from "../../../lib/gsap-setup";
import { getFaqAnswer, getFaqQuestion, useGroupedFaqs } from "../hook/useFaq";
import type { FaqFallbackItem } from "../types";

export interface FaqSectionProps {
  slug?: string;
  /**
   * Fallback slugs tried when `slug` returns no rows.
   * Default: none — only `slug` is queried (pass `['home']` to opt in).
   */
  fallbackSlugs?: Array<string | null | undefined> | null;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaHref?: string;
  fallbackItems?: FaqFallbackItem[];
  tone?: "cream" | "paper" | "navy";
  id?: string;
  showCta?: boolean;
}

function FaqSkeleton({ tone }: { tone: "cream" | "paper" | "navy" }) {
  const lineBg = tone === "navy" ? "bg-white/10" : "bg-gold-500/15";
  return (
    <div
      className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16"
      aria-hidden="true"
    >
      <div className="lg:col-span-5 space-y-4">
        <div className={`h-8 w-32 rounded-lg animate-pulse ${lineBg}`} />
        <div className={`h-4 w-3/4 rounded animate-pulse ${lineBg}`} />
        <div className="flex gap-2 my-6">
          <div className={`h-[3px] w-12 rounded ${lineBg}`} />
          <div className="h-[3px] w-8 rounded bg-gold-500/50" />
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-5 w-48 rounded animate-pulse ${lineBg}`}
            />
          ))}
        </div>
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className={`h-7 w-64 rounded-lg animate-pulse ${lineBg}`} />
        <div className="divide-y divide-gold-500/15 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="pt-4 flex justify-between items-center">
              <div className={`h-5 w-3/4 rounded animate-pulse ${lineBg}`} />
              <div className={`h-4 w-4 rounded animate-pulse ${lineBg}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FaqSection({
  slug = "home",
  fallbackSlugs,
  title,
  subtitle,
  eyebrow,
  
  fallbackItems,
  tone = "cream",
  id = "faq",

}: FaqSectionProps) {
  const { t } = useTranslation();
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);
  const [openQuestionIdx, setOpenQuestionIdx] = useState<number | null>(0);

  const { groups, isPending, isEmpty } = useGroupedFaqs(slug, {
    fallbackSlugs,
    fallbackItems,
  });

  const currentGroupIdx =
    groups.length > 0 && activeGroupIdx >= groups.length ? 0 : activeGroupIdx;

  useEffect(() => {
    const cancel = refreshScrollTriggers(350);
    return cancel;
  }, [openQuestionIdx, currentGroupIdx, groups.length]);

  // Hide the section entirely when the slug chain + fallbackItems yield nothing
  if (!isPending && isEmpty) {
    return null;
  }

  const handleSelectCategory = (idx: number) => {
    setActiveGroupIdx(idx);
    setOpenQuestionIdx(0); // Default to opening the first question of the selected category
  };

  const toggleQuestion = (qIdx: number) => {
    setOpenQuestionIdx((curr) => (curr === qIdx ? null : qIdx));
  };

  const currentGroup = groups[currentGroupIdx] ?? groups[0];
  const hasMultipleCategories =
    groups.length > 1 || Boolean(groups[0]?.heading);

  const bgCls =
    tone === "paper"
      ? "bg-white"
      : tone === "navy"
        ? "bg-navy-900 text-white"
        : "bg-[#FFFBF2]";

  return (
    <section
      id={id}
      className={`relative overflow-hidden ${bgCls} py-16 sm:py-20 md:py-24`}
    >
      {/* Background Architectural Temple Arch Artwork & Subtle Jaali Texture */}
      {tone !== "navy" && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            aria-hidden="true"
          >
            <img
              src="/images/home/elegant-temple-wedding-banner.webp"
              srcSet="/images/home/elegant-temple-wedding-banner-1024.webp 1024w, /images/home/elegant-temple-wedding-banner.webp 2170w"
              sizes="100vw"
              width={2170}
              height={725}
              alt="Decorative temple wedding banner"
              title="Decorative temple wedding banner"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-bottom"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[#FFFBF2]/55" />
        </>
      )}

      <div className="section-pad relative z-10">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Eyebrow, Title, Subtitle, Divider, and Category Tabs */}
          <Reveal variant="left" className="lg:col-span-5">
            {/* Brand Eyebrow with gold motif */}
            <div className="eyebrow mb-3.5">
              <span className="text-gold-500">✦</span>
              <span>
                {eyebrow || t("faq.eyebrow", "Frequently Asked Questions")}
              </span>
              <div
                className="inline-flex items-center gap-1 text-gold-500/80"
                aria-hidden="true"
              >
                <span className="h-px w-8 sm:w-12 bg-gold-500/60" />
                <span className="text-[10px]">◆</span>
              </div>
            </div>

            <h2
              className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
                tone === "navy" ? "text-white" : "text-navy-900"
              }`}
            >
              {title || t("faq.title", "FAQ's")}
            </h2>

            <p
              className={`mt-3.5 text-sm sm:text-base leading-relaxed max-w-md ${
                tone === "navy" ? "text-white/75" : "text-ink-600"
              }`}
            >
              {subtitle || t("faq.subtitle")}
            </p>

            {/* Brand Signature Decorative Accent Divider (Navy + Gold) */}
            <div
              className="flex items-center gap-2 my-6 sm:my-8"
              aria-hidden="true"
            >
              <span
                className={`h-[3px] w-12 rounded-full ${
                  tone === "navy" ? "bg-white/40" : "bg-navy-900"
                }`}
              />
              <span className="h-[3px] w-8 rounded-full bg-gold-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            </div>

            {/* Desktop Vertical Category Tabs */}
            {hasMultipleCategories && (
              <nav
                className="hidden lg:flex flex-col space-y-3 pt-1"
                role="tablist"
                aria-label="FAQ categories"
              >
                {groups.map((group, idx) => {
                  const isActive = currentGroupIdx === idx;
                  const heading =
                    group.heading ||
                    t("faq.defaultCategory", "General Information");
                  return (
                    <button
                      key={idx}
                      id={`${id}-category-tab-${idx}`}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`${id}-category-panel-${idx}`}
                      type="button"
                      onClick={() => handleSelectCategory(idx)}
                      className={`group relative flex items-start text-left py-2 px-1 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "font-bold text-gold-700 dark:text-gold-400"
                          : tone === "navy"
                            ? "font-medium text-white/70 hover:text-white"
                            : "font-medium text-navy-900/80 hover:text-gold-600"
                      }`}
                    >
                      {/* Active gold vertical bar */}
                      <span
                        className={`mr-3.5 mt-0.5 inline-block h-5 w-[3.5px] shrink-0 rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-b from-gold-500 to-gold-600 shadow-[0_0_8px_rgba(209,154,43,0.35)]"
                            : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[15px] sm:text-base leading-snug">
                        {heading}
                      </span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Mobile Category Horizontal Scrollable Pills */}
            {hasMultipleCategories && (
              <div className="lg:hidden mt-6 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {groups.map((group, idx) => {
                  const isActive = currentGroupIdx === idx;
                  const heading =
                    group.heading ||
                    t("faq.defaultCategory", "General Information");
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCategory(idx)}
                      className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-gold-600 to-gold-500 text-white shadow-sm ring-1 ring-gold-400/40"
                          : tone === "navy"
                            ? "bg-white/10 text-white/80 hover:bg-white/15"
                            : "bg-white/90 text-navy-900/85 border border-gold-500/25 hover:border-gold-500/50 shadow-2xs"
                      }`}
                    >
                      {heading}
                    </button>
                  );
                })}
              </div>
            )}
          </Reveal>

          {/* Right Column: Active Category Title and Accordion Questions */}
          <Reveal variant="right" delay={0.1} className="lg:col-span-7">
            {isPending && isEmpty ? (
              <FaqSkeleton tone={tone} />
            ) : (
              <div>
                {/* Active Category Title with subtle brand gold accent */}
                <div className="mb-6 sm:mb-8">
                  <h3
                    className={`font-display text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight ${
                      tone === "navy" ? "text-white" : "text-navy-900"
                    }`}
                  >
                    {currentGroup?.heading || title || t("faq.title", "FAQ's")}
                  </h3>
                  <div
                    className="mt-2.5 h-[2px] w-12 bg-gradient-to-r from-gold-500 to-transparent rounded-full"
                    aria-hidden="true"
                  />
                </div>

                {/* Accordion Questions List */}
                <div className="divide-y divide-gold-500/20 dark:divide-white/10">
                  {(currentGroup?.items ?? []).map((item, qIdx) => {
                    const q = getFaqQuestion(item);
                    const a = getFaqAnswer(item);
                    const isOpen = openQuestionIdx === qIdx;
                    const buttonId = `${id}-btn-${activeGroupIdx}-${qIdx}`;
                    const panelId = `${id}-panel-${activeGroupIdx}-${qIdx}`;
                    const itemId = (item as { id?: unknown })?.id;

                    return (
                      <div
                        key={
                          itemId != null
                            ? `faq-item-${String(itemId)}`
                            : `${q}-${qIdx}`
                        }
                        className="py-4 sm:py-5 first:pt-0"
                      >
                        <button
                          id={buttonId}
                          type="button"
                          onClick={() => toggleQuestion(qIdx)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="group flex w-full items-start justify-between gap-4 text-left cursor-pointer transition-colors"
                        >
                          <span
                            className={`font-display text-sm sm:text-base font-semibold leading-snug transition-colors duration-200 ${
                              isOpen
                                ? "text-gold-700 dark:text-gold-400 font-bold"
                                : tone === "navy"
                                  ? "text-white group-hover:text-gold-300"
                                  : "text-navy-900 group-hover:text-gold-600"
                            }`}
                          >
                            {q}
                          </span>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center transition-transform duration-300 ${
                              isOpen
                                ? "rotate-180 text-gold-600 dark:text-gold-400"
                                : "text-gold-500/60 group-hover:text-gold-600 dark:group-hover:text-white"
                            }`}
                            aria-hidden="true"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>

                        {/* Animated answer */}
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div
                              className={`pt-3.5 pb-2 text-sm sm:text-[15px] leading-relaxed ${
                                tone === "navy"
                                  ? "text-white/80"
                                  : "text-ink-600"
                              }`}
                            >
                              <p>{a}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
