import MembershipHero from '../components/MembershipHero'
import MembershipPlans from '../components/MembershipPlans'
import FeatureComparison from '../components/FeatureComparison'
import MembershipBenefits from '../components/MembershipBenefits'
import MembershipCta from '../components/MembershipCta'
import PageParallax from '../../../components/motion/PageParallax'
import { TestimonialSection } from '../../testimonial'
import { FaqSection } from '../../faq'

export default function MembershipPage() {
  return (
    <div className="relative overflow-hidden">
      <PageParallax />
      <MembershipHero />
      <MembershipPlans />
      <FeatureComparison />
      <MembershipBenefits />
      <TestimonialSection page="membership" tone="paper" />
      <FaqSection page="membership" tone="cream" showCta={false} />
      <MembershipCta />
    </div>
  )
}
