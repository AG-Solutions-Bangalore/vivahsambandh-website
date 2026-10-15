import { lazy, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import DeferredSection from "../../../components/DeferredSection";
import {
  DEFERRED_SECTION_IDS,
  whenSectionReady,
} from "../../../lib/deferredSections";
import { resolveHashId, scrollToAnchor } from "../../../lib/scroll";

// Below-the-fold sections split into separate chunks and mounted
// progressively (viewport proximity or idle backstop) — the initial
// bundle stays hero-focused. Module scope = created once, never re-made.
const AboutSection = lazy(() => import("../components/AboutSection"));
const CityMatchesSection = lazy(
  () => import("../components/CityMatchesSection"),
);
const WhyChooseSection = lazy(
  () => import("../components/WhyChooseSection"),
);
const SuccessStoriesSection = lazy(
  () => import("../components/SuccessStoriesSection"),
);
const AppDownloadSection = lazy(
  () => import("../components/AppDownloadSection"),
);
const FaqSection = lazy(() => import("../components/FaqSection"));
const ContactSection = lazy(() => import("../components/ContactSection"));

export default function HomePage() {
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
