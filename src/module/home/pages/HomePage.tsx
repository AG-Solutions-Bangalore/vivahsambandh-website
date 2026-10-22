import { useQueryClient } from "@tanstack/react-query";
import { lazy, useEffect } from "react";
import DeferredSection from "../../../components/DeferredSection";
import { SkeletonSection, type SectionSpec } from "../../../components/skeletons/skeletonShapes";
import {
  DEFERRED_SECTION_IDS,
  whenSectionReady,
} from "../../../lib/deferredSections";
import { resolveHashId, scrollToAnchor } from "../../../lib/scroll";
import HeroSection from "../components/HeroSection";

// Below-the-fold sections split into separate chunks and mounted
// progressively (viewport proximity or idle backstop) — the initial
// bundle stays hero-focused. Module scope = created once, never re-made.
const AboutSection = lazy(() => import("../components/AboutSection"));
const CommunitiesSection = lazy(
  () => import("../components/CommunitiesSection"),
);
const CityMatchesSection = lazy(
  () => import("../components/CityMatchesSection"),
);
const WhyChooseSection = lazy(() => import("../components/WhyChooseSection"));
const SuccessStoriesSection = lazy(
  () => import("../components/SuccessStoriesSection"),
);
const FeaturedBlogsSection = lazy(
  () => import("../components/FeaturedBlogsSection"),
);
const FrontBlogsSection = lazy(() => import("../components/FrontBlogsSection"));
const AppDownloadSection = lazy(
  () => import("../components/AppDownloadSection"),
);
const FaqSection = lazy(() => import("../components/FaqSection"));
const ContactSection = lazy(() => import("../components/ContactSection"));

/**
 * Placeholder shape for each below-the-fold section.
 *
 * The generic fallback only reserved a blank band, so the home page still
 * jumped when a section landed. These mirror the real layout instead.
 */
const SECTION_SHAPES: Record<string, SectionSpec> = {
  about: { kind: "split", ratio: "6-6" },
  communities: { kind: "grid", cols: 3, rows: 2, aspect: "aspect-[4/3]" },
  search: { kind: "marquee", count: 4, aspect: "aspect-[4/3]" },
  "explore-features": {
    kind: "grid",
    cols: 3,
    rows: 3,
    framed: true,
    tone: "dark",
    bg: "bg-[#071833]",
  },
  stories: { kind: "marquee", count: 3 },
  "blogs-featured": { kind: "marquee", count: 3, aspect: "aspect-[16/9]" },
  "blogs-front": { kind: "marquee", count: 3, aspect: "aspect-[16/9]" },
  app: { kind: "split", ratio: "7-5", flip: true },
  faq: { kind: "dial" },
  contact: { kind: "form", fields: 4 },
};

export default function HomePage() {
  const queryClient = useQueryClient();

  // Prefetch below-fold data after initial load / on first scroll.
  // This keeps the network 100% free for hero LCP and critical CSS on mobile.
  useEffect(() => {
    let prefetched = false;
    const prefetch = async () => {
      if (prefetched) return;
      prefetched = true;
      try {
        const [
          { getTestimonialsBySlug },
          { testimonialKey },
          { prefetchFaqQuery },
          { getClients },
          { homeQueryKeys },
          { getFeaturedBlogs, getFrontBlogs },
          { blogKeys },
        ] = await Promise.all([
          import("../../testimonial/api/testimonial.api"),
          import("../../testimonial/hook/useTestimonials"),
          import("../../faq/hook/useFaq"),
          import("../api/home.api"),
          import("../hook/useHomeData"),
          import("../../blog/api/blog.api"),
          import("../../blog/hook/useBlogs"),
        ]);
        void queryClient.prefetchQuery({
          queryKey: testimonialKey("home"),
          queryFn: () => getTestimonialsBySlug("home"),
        });
        void prefetchFaqQuery(queryClient, "home");
        void queryClient.prefetchQuery({
          queryKey: homeQueryKeys.clients,
          queryFn: getClients,
        });
        void queryClient.prefetchQuery({
          queryKey: blogKeys.featured(),
          queryFn: getFeaturedBlogs,
        });
        void queryClient.prefetchQuery({
          queryKey: blogKeys.front(),
          queryFn: getFrontBlogs,
        });
      } catch {
        /* prefetch is best-effort */
      }
    };

    const timer = setTimeout(prefetch, 6000);
    const onScrollOrTouch = () => {
      clearTimeout(timer);
      prefetch();
      window.removeEventListener("scroll", onScrollOrTouch);
      window.removeEventListener("touchstart", onScrollOrTouch);
    };

    window.addEventListener("scroll", onScrollOrTouch, { passive: true, once: true });
    window.addEventListener("touchstart", onScrollOrTouch, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScrollOrTouch);
      window.removeEventListener("touchstart", onScrollOrTouch);
    };
  }, [queryClient]);

  // Deep link on load (e.g. /#contact): mount the target first, then jump.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;
    const id = resolveHashId(hash);
    if (DEFERRED_SECTION_IDS.has(id)) {
      void whenSectionReady(id).then(() => scrollToAnchor(hash));
    }
  }, []);

  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      <DeferredSection
        id="about"
        component={AboutSection}
        minHeight={640}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["about"]} />}
        tone="cream"
      />
      <DeferredSection
        id="communities"
        component={CommunitiesSection}
        minHeight={340}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["communities"]} />}
        tone="cream"
      />
      <DeferredSection
        id="search"
        component={CityMatchesSection}
        minHeight={480}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["search"]} />}
        tone="cream"
      />
      <DeferredSection
        id="explore-features"
        component={WhyChooseSection}
        minHeight={800}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["explore-features"]} />}
        tone="navy"
      />
      <DeferredSection
        id="stories"
        component={SuccessStoriesSection}
        minHeight={700}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["stories"]} />}
        tone="paper"
      />
      <DeferredSection
        id="blogs-featured"
        component={FeaturedBlogsSection}
        minHeight={400}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["blogs-featured"]} />}
        tone="cream"
      />
      <DeferredSection
        id="blogs-front"
        component={FrontBlogsSection}
        minHeight={400}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["blogs-front"]} />}
        tone="paper"
      />
      <DeferredSection
        id="app"
        component={AppDownloadSection}
        minHeight={900}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["app"]} />}
        tone="cream"
      />
      <DeferredSection
        id="faq"
        component={FaqSection}
        minHeight={600}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["faq"]} />}
        tone="paper"
      />
      <DeferredSection
        id="contact"
        component={ContactSection}
        minHeight={900}
        skeleton={<SkeletonSection spec={SECTION_SHAPES["contact"]} />}
        tone="paper"
      />
    </div>
  );
}
