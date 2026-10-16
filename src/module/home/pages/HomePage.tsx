import { useQueryClient } from "@tanstack/react-query";
import { lazy, useEffect } from "react";
import DeferredSection from "../../../components/DeferredSection";
import {
  DEFERRED_SECTION_IDS,
  whenSectionReady,
} from "../../../lib/deferredSections";
import { resolveHashId, scrollToAnchor } from "../../../lib/scroll";
import { getFeaturedBlogs, getFrontBlogs } from "../../blog/api/blog.api";
import { blogKeys } from "../../blog/hook/useBlogs";
import { prefetchFaqQuery } from "../../faq/hook/useFaq";
import { getTestimonialsBySlug } from "../../testimonial/api/testimonial.api";
import { testimonialKey } from "../../testimonial/hook/useTestimonials";
import { getClients } from "../api/home.api";
import HeroSection from "../components/HeroSection";
import { homeQueryKeys } from "../hook/useHomeData";

// Below-the-fold sections split into separate chunks and mounted
// progressively (viewport proximity or idle backstop) — the initial
// bundle stays hero-focused. Module scope = created once, never re-made.
const AboutSection = lazy(() => import("../components/AboutSection"));
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

export default function HomePage() {
  const queryClient = useQueryClient();

  // Prefetch below-fold data after initial load / on first scroll.
  // This keeps the network 100% free for hero LCP and critical CSS on mobile.
  useEffect(() => {
    let prefetched = false;
    const prefetch = () => {
      if (prefetched) return;
      prefetched = true;
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
        queryKey: blogKeys.featured,
        queryFn: getFeaturedBlogs,
      });
      void queryClient.prefetchQuery({
        queryKey: blogKeys.front,
        queryFn: getFrontBlogs,
      });
    };

    const timer = setTimeout(prefetch, 2500);
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
        tone="cream"
      />
      <DeferredSection
        id="search"
        component={CityMatchesSection}
        minHeight={480}
        tone="cream"
      />
      <DeferredSection
        id="explore-features"
        component={WhyChooseSection}
        minHeight={800}
        tone="navy"
      />
      <DeferredSection
        id="stories"
        component={SuccessStoriesSection}
        minHeight={700}
        tone="paper"
      />
      <DeferredSection
        id="blogs-featured"
        component={FeaturedBlogsSection}
        minHeight={400}
        tone="cream"
      />
      <DeferredSection
        id="blogs-front"
        component={FrontBlogsSection}
        minHeight={400}
        tone="paper"
      />
      <DeferredSection
        id="app"
        component={AppDownloadSection}
        minHeight={900}
        tone="cream"
      />
      <DeferredSection
        id="faq"
        component={FaqSection}
        minHeight={600}
        tone="paper"
      />
      <DeferredSection
        id="contact"
        component={ContactSection}
        minHeight={900}
        tone="paper"
      />
    </div>
  );
}
