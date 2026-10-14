import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import CityMatchesSection from "../components/CityMatchesSection";
import WhyChooseSection from "../components/WhyChooseSection";
import SuccessStoriesSection from "../components/SuccessStoriesSection";
import AppDownloadSection from "../components/AppDownloadSection";
import FaqSection from "../components/FaqSection";
import ContactSection from "../components/ContactSection";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <HeroSection />
      <AboutSection />
      <CityMatchesSection />
      <WhyChooseSection />
      <SuccessStoriesSection />
      <AppDownloadSection />
      <FaqSection />
      <ContactSection />
    </div>
  );
}
