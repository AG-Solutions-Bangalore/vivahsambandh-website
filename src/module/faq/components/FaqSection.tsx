import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  FileText,
  UserPlus,
  ShieldCheck,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { getFaqAnswer, getFaqQuestion, useGroupedFaqs } from "../hook/useFaq";
import type { FaqFallbackItem } from "../types";
import { img, imgSrcSet } from "../../../lib/image";
import { useAppLanguage } from "../../../i18n/useAppLanguage";
import { pagePath } from "../../../constants/navigation";
import { Link } from "react-router-dom";

export interface FaqSectionProps {
  slug?: string;
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

const FLOATING_PETALS = [
  { top: "46%", left: "9%", width: 28, height: 18, rotate: 2.7, fill: "#F43F5E", opacity: 0.85 },
  { top: "67%", left: "27%", width: 26, height: 17, rotate: -16.4, fill: "#F43F5E", opacity: 0.9 },
  { top: "79%", left: "37%", width: 28, height: 18, rotate: 7.4, fill: "#FB7185", opacity: 0.92 },
  { top: "82%", left: "49%", width: 26, height: 17, rotate: -6.9, fill: "#F43F5E", opacity: 0.88 },
  { top: "28%", left: "68%", width: 22, height: 15, rotate: 8.6, fill: "#E11D48", opacity: 0.85 },
  { top: "68%", left: "88%", width: 26, height: 17, rotate: 7.6, fill: "#FB7185", opacity: 0.9 },
  { top: "18%", left: "44%", width: 24, height: 16, rotate: 2.2, fill: "#F43F5E", opacity: 0.85 },
  { top: "86%", left: "76%", width: 22, height: 15, rotate: -3.9, fill: "#FB7185", opacity: 0.9 },
];

function FaqSkeleton() {
  return (
    <div className="w-full flex items-center justify-center min-h-[380px] animate-pulse">
      <div className="w-[300px] h-[300px] rounded-full bg-rose-50/70 border border-rose-200/50 flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full bg-rose-200/60" />
        <div className="w-3/4 h-4 rounded bg-rose-200/60" />
        <div className="w-1/2 h-3 rounded bg-rose-200/40" />
        <div className="w-full h-12 rounded bg-rose-100/60" />
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
  ctaText,
  ctaHref,
  fallbackItems,
  id = "faq",
  showCta = true,
}: FaqSectionProps) {
  const { t } = useTranslation();
  const { lang } = useAppLanguage();
  const [activeGroupIdx, setActiveGroupIdx] = useState<number>(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  const contactHref =
    ctaHref ||
    (typeof window !== "undefined" && document.getElementById("contact")
      ? "#contact"
      : pagePath("/contact", lang));

  const ctaLabel =
    ctaText ||
    t("faq.contactUs", t("header.contact", "Contact Us"));

  const { groups, isPending, isEmpty } = useGroupedFaqs(slug, {
    fallbackSlugs,
    fallbackItems,
  });

  if (!isPending && isEmpty) {
    return null;
  }

  const currentGroupIdx =
    groups.length > 0 && activeGroupIdx >= groups.length ? 0 : activeGroupIdx;
  const currentGroup = groups[currentGroupIdx] ?? groups[0];
  const currentItems = currentGroup?.items ?? [];

  // 5 questions mapped to the 5 arc nodes
  const displayItems = currentItems.length > 0 ? currentItems.slice(0, 5) : [];
  const safeActiveIdx =
    displayItems.length > 0 && activeQuestionIdx >= displayItems.length
      ? 0
      : activeQuestionIdx;

  const activeItem = displayItems[safeActiveIdx];
  const activeQuestion = activeItem ? getFaqQuestion(activeItem) : "";
  const activeAnswer = activeItem ? getFaqAnswer(activeItem) : "";
  const ActiveIcon = NODE_ICONS[safeActiveIdx % NODE_ICONS.length];

  const handlePrev = () => {
    if (displayItems.length === 0) return;
    setActiveQuestionIdx((prev) =>
      prev <= 0 ? displayItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (displayItems.length === 0) return;
    setActiveQuestionIdx((prev) =>
      prev >= displayItems.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <section
      id={id}
      className="pt-10 sm:pt-14 pb-12 sm:pb-16 bg-[#FFFDF9] text-[#2D2626] relative overflow-x-clip select-none"
    >
      {/* Top right bridal floral garland artwork */}
      <img
        src={img("/images/home/flower1_image-320.webp")}
        srcSet={imgSrcSet(
          "/images/home/flower1_image-192.webp 192w, /images/home/flower1_image-320.webp 320w, /images/home/flower1_image-640.webp 640w"
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

      {/* Background Floating Rose Petals */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden"
        aria-hidden="true"
      >
        {FLOATING_PETALS.map((petal, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: petal.top,
              left: petal.left,
              width: `${petal.width}px`,
              height: `${petal.height}px`,
              transform: `rotate(${petal.rotate}deg)`,
            }}
          >
            <svg
              viewBox="0 0 30 20"
              fill="none"
              className="w-full h-full drop-shadow-xs"
            >
              <path
                d="M5 10 C5 2, 22 2, 28 8 C30 16, 12 18, 5 10 Z"
                fill={petal.fill}
                opacity={petal.opacity}
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* Left Column: Eyebrow, Motif Icon, Title, Divider, Subtitle, and Optional Category Tabs */}
          <div className="lg:col-span-4 flex flex-col items-start text-left relative z-20">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF1EB] border border-[#F5D8CA] text-[#9F1239] text-[11px] font-bold tracking-[0.2em] uppercase shadow-2xs mb-3">
              <span className="text-[#C5A059] text-xs">❖</span>
              <span>{eyebrow || t("faq.eyebrow", "FAQ")}</span>
              <span className="text-[#C5A059] text-xs">❖</span>
            </div>

            {/* Heart with Question Mark Ornament */}
            <div className="relative mb-3.5">
              <div className="w-13 h-13 rounded-full bg-gradient-to-br from-[#FFE8ED] via-[#FFF1F4] to-white border-2 border-[#F6B6C4] p-1 flex items-center justify-center shadow-sm shadow-[#9F1239]/10">
                <div className="w-full h-full rounded-full border border-dashed border-[#E11D48]/50 flex items-center justify-center relative">
                  <svg
                    className="w-6 h-6 text-[#9F1239]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="absolute font-serif text-sm font-bold text-[#9F1239] -mt-0.5">
                    ?
                  </span>
                </div>
              </div>
            </div>

            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-[#2A1D1D] leading-[1.18] mb-2.5">
              {title ? (
                title
              ) : (
                <>
                  Frequently <br />
                  <span className="text-[#9F1239]">Asked Questions</span>
                </>
              )}
            </h2>

            {/* Ornate Gold Heart Divider */}
            <div className="flex items-center gap-2 text-[#D4AF37] mb-2.5">
              <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
              <span className="text-xs leading-none">♡</span>
              <span className="w-6 h-[1px] bg-[#D4AF37]/60" />
            </div>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-[#5A4E4D] leading-relaxed max-w-[280px] mb-4 sm:mb-6">
              {subtitle ||
                t(
                  "faq.subtitle",
                  "Find answers to common questions about VivahSambandh."
                )}
            </p>

            {/* Multi-category switch pills */}
            {groups.length > 1 && (
              <div className="w-full max-w-[320px] pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9F1239]/70 block mb-2">
                  {t("faq.categories", "Categories")}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {groups.map((group, idx) => {
                    const isActive = currentGroupIdx === idx;
                    const heading =
                      group.heading ||
                      t("faq.defaultCategory", "General Information");
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setActiveGroupIdx(idx);
                          setActiveQuestionIdx(0);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer text-left ${
                          isActive
                            ? "bg-[#9F1239] text-white shadow-xs font-semibold"
                            : "bg-white text-[#443838] border border-[#F1E8E2] hover:border-[#D4AF37]/60 hover:bg-[#FFF5F7]"
                        }`}
                      >
                        {heading}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
                        stroke="#D4AF37"
                        strokeWidth="1.3"
                        strokeDasharray="4 4"
                        opacity="0.8"
                      />
                      {DIAL_NODES.map((node, i) => {
                        const isActive = safeActiveIdx === i;
                        return isActive ? (
                          <g key={i}>
                            <circle
                              cx={node.circleCx}
                              cy={node.circleCy}
                              r="4"
                              fill="#9F1239"
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
                              fill="#D4AF37"
                              opacity="0.75"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* 5 Interactive Nodes (Tooltip Bubble + Button) */}
                    {displayItems.map((item, idx) => {
                      const node = DIAL_NODES[idx];
                      if (!node) return null;
                      const isActive = safeActiveIdx === idx;
                      const Icon = NODE_ICONS[idx % NODE_ICONS.length];
                      const q = getFaqQuestion(item);

                      return (
                        <div key={idx} className="relative z-40">
                          {/* Tooltip Bubble */}
                          <div
                            style={node.bubbleStyle}
                            onClick={() => setActiveQuestionIdx(idx)}
                            className="cursor-pointer"
                          >
                            <div
                              className={`relative px-3 py-1.5 rounded-xl bg-white shadow-sm text-center max-w-[130px] border transition-all ${
                                isActive
                                  ? "border-[#FDA4AF] shadow-md shadow-[#9F1239]/12 scale-105"
                                  : "border-[#F1E8E2] hover:border-[#D4AF37]/50 opacity-90 hover:opacity-100"
                              }`}
                            >
                              <p
                                className={`text-[11px] font-semibold leading-snug line-clamp-2 ${
                                  isActive ? "text-[#1E1B18]" : "text-[#443838]"
                                }`}
                              >
                                {q}
                              </p>
                              {isActive && (
                                <div className="w-5 h-[2px] bg-[#9F1239] rounded-full mx-auto mt-1" />
                              )}
                              <div className={node.arrowClass} />
                            </div>
                          </div>

                          {/* Node Icon Button */}
                          <button
                            type="button"
                            aria-label={q}
                            onClick={() => setActiveQuestionIdx(idx)}
                            style={node.buttonStyle}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer -translate-x-1/2 -translate-y-1/2 z-30 ${
                              isActive
                                ? "bg-[#9F1239] text-white shadow-md shadow-[#9F1239]/30 scale-110 ring-4 ring-[#FFF0F3]"
                                : "bg-white text-[#9F1239] border border-[#F1E8E2] hover:border-[#D4AF37]/60 shadow-sm hover:scale-105"
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
                      <div className="relative w-[310px] h-[310px] lg:w-[325px] lg:h-[325px] rounded-full bg-white shadow-[0_12px_40px_rgba(225,29,72,0.16)] ring-6 ring-[#FFF0F3]/80 border border-[#FEE2E2]/60 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                        {/* Prev Button */}
                        <button
                          type="button"
                          aria-label="Previous question"
                          onClick={handlePrev}
                          className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white shadow-md border border-[#F3E8E2] text-[#9F1239] hover:bg-[#FFF5F7] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-40"
                        >
                          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Next Button */}
                        <button
                          type="button"
                          aria-label="Next question"
                          onClick={handleNext}
                          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white shadow-md border border-[#F3E8E2] text-[#9F1239] hover:bg-[#FFF5F7] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-40"
                        >
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Inside Spotlight Content */}
                        <div className="flex flex-col items-center text-center max-w-[235px]">
                          <div className="text-[#9F1239] mb-1.5">
                            <ActiveIcon className="w-5 h-5 stroke-[1.8]" />
                          </div>

                          <h3 className="font-serif font-bold text-sm lg:text-[16px] text-[#1E1B18] leading-tight line-clamp-2 max-w-[230px] mb-1.5">
                            {activeQuestion}
                          </h3>

                          <div
                            className="flex items-center justify-center gap-1 text-[#D4AF37] mb-2"
                            aria-hidden="true"
                          >
                            <span className="w-4 h-[1px] bg-[#D4AF37]/60" />
                            <span className="text-[10px]">♡</span>
                            <span className="w-4 h-[1px] bg-[#D4AF37]/60" />
                          </div>

                          <p className="text-[11px] lg:text-[11.5px] text-[#554444] leading-relaxed max-w-[230px] line-clamp-4 mb-3.5">
                            {activeAnswer}
                          </p>

                          {showCta !== false && (
                            <Link
                              to={contactHref}
                              className="bg-[#9F1239] hover:bg-[#881337] text-white text-[11px] lg:text-xs font-medium px-5 py-1.5 rounded-full shadow-md shadow-[#9F1239]/20 hover:shadow-lg transition-all hover:scale-105 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>{ctaLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Pagination Indicator Dots */}
                      <div className="flex justify-center items-center gap-1.5 mt-3 pointer-events-auto">
                        {displayItems.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            aria-label={`Go to question ${dotIdx + 1}`}
                            onClick={() => setActiveQuestionIdx(dotIdx)}
                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                              safeActiveIdx === dotIdx
                                ? "w-2.5 h-2 bg-[#9F1239]"
                                : "w-2 h-2 bg-[#FBCFE8] hover:bg-[#FDA4AF]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile View (Below md) */}
                <div className="w-full flex flex-col items-center md:hidden mt-2">
                  {/* Scrollable Question Pills */}
                  <div className="w-full flex gap-2 overflow-x-auto pb-2.5 mb-4 scrollbar-none justify-start px-2">
                    {displayItems.map((item, idx) => {
                      const isActive = safeActiveIdx === idx;
                      const Icon = NODE_ICONS[idx % NODE_ICONS.length];
                      const q = getFaqQuestion(item);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveQuestionIdx(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                            isActive
                              ? "bg-[#9F1239] text-white font-semibold shadow-xs"
                              : "bg-white text-[#443838] border border-[#E8DED8] hover:bg-[#FFF5F7]"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{q}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Circular Spotlight Card for Mobile */}
                  <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] rounded-full bg-white shadow-[0_12px_35px_rgba(225,29,72,0.16)] ring-5 ring-[#FFF0F3] border border-[#FEE2E2] flex flex-col items-center justify-center p-5 text-center">
                    <button
                      type="button"
                      aria-label="Previous question"
                      onClick={handlePrev}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-[#F3E8E2] text-[#9F1239] flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next question"
                      onClick={handleNext}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-[#F3E8E2] text-[#9F1239] flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <div className="flex flex-col items-center text-center max-w-[210px]">
                      <div className="text-[#9F1239] mb-1">
                        <ActiveIcon className="w-4 h-4 stroke-[1.8]" />
                      </div>

                      <h3 className="font-serif font-bold text-sm sm:text-base text-[#1E1B18] leading-tight line-clamp-2 max-w-[210px] mb-1">
                        {activeQuestion}
                      </h3>

                      <div
                        className="flex items-center justify-center gap-1 text-[#D4AF37] mb-1.5"
                        aria-hidden="true"
                      >
                        <span className="w-3 h-[1px] bg-[#D4AF37]/60" />
                        <span className="text-[9px]">♡</span>
                        <span className="w-3 h-[1px] bg-[#D4AF37]/60" />
                      </div>

                      <p className="text-[10.5px] sm:text-[11px] text-[#554444] leading-relaxed line-clamp-4 max-w-[210px] mb-3">
                        {activeAnswer}
                      </p>

                      {showCta !== false && (
                        <Link
                          to={contactHref}
                          className="bg-[#9F1239] text-white text-[11px] font-medium px-4 py-1.5 rounded-full shadow-md shadow-[#9F1239]/20 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>{ctaLabel}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Pagination Dots for Mobile */}
                  <div className="flex justify-center items-center gap-1.5 mt-3">
                    {displayItems.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        aria-label={`Go to question ${dotIdx + 1}`}
                        onClick={() => setActiveQuestionIdx(dotIdx)}
                        className={`transition-all rounded-full cursor-pointer ${
                          safeActiveIdx === dotIdx
                            ? "w-2.5 h-2 bg-[#9F1239]"
                            : "w-2 h-2 bg-[#FBCFE8]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Elegant Bottom Maroon Ribbon Wave */}
      <div
        className="pointer-events-none absolute -bottom-4 left-0 right-0 z-10 overflow-hidden leading-none select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-5 sm:h-8 md:h-10 text-[#520B1D]"
        >
          <path
            d="M0,24 C360,48 720,0 1080,28 C1240,40 1360,16 1440,20 L1440,48 L0,48 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}

