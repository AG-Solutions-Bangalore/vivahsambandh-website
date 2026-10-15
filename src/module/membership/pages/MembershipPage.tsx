import MembershipHero from '../components/MembershipHero'
import MembershipPlans from '../components/MembershipPlans'
import FeatureComparison from '../components/FeatureComparison'
import MembershipBenefits from '../components/MembershipBenefits'
import MembershipFaq from '../components/MembershipFaq'
import MembershipCta from '../components/MembershipCta'
import PageParallax from '../../../components/motion/PageParallax'

export default function MembershipPage() {
  return (
    <div className="relative overflow-hidden">
      <PageParallax />
      <MembershipHero />
      <MembershipPlans />
      <FeatureComparison />
      <MembershipBenefits />
      <MembershipFaq />
      <MembershipCta />
    </div>
  )
}
