import AboutHero from '../components/AboutHero'
import MissionVision from '../components/MissionVision'
import ValuesBand from '../components/ValuesBand'
import WhyBuilt from '../components/WhyBuilt'
import StatsStrip from '../components/StatsStrip'
import CtaBand from '../components/CtaBand'
import PageParallax from '../../../components/motion/PageParallax'

/**
 * About Us page — assembles the "More Than a Matrimonial Platform"
 * story exactly per the shared design (hero → mission/vision →
 * navy values → why-built → stats → closing CTA).
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
      <CtaBand />
    </div>
  )
}
