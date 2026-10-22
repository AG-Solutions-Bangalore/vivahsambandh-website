import AboutHero from '../components/AboutHero'
import MissionVision from '../components/MissionVision'
import ValuesBand from '../components/ValuesBand'
import WhyBuilt from '../components/WhyBuilt'
import StatsStrip from '../components/StatsStrip'
import CtaBand from '../components/CtaBand'
import PageParallax from '../../../components/motion/PageParallax'
import { TestimonialSection } from '../../testimonial'
import { FaqSection } from '../../faq'

/**
 * About Us page — assembles the "More Than a Matrimonial Platform"
 * story with common Testimonials and FAQ sections.
 */
export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <PageParallax />
      <AboutHero />
      <MissionVision />
      <ValuesBand />
      <WhyBuilt />
      <StatsStrip />
      <TestimonialSection page="about" tone="paper" />
      <FaqSection page="about" tone="cream" />
      <CtaBand />
    </div>
  )
}
