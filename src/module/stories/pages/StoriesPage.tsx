import StoriesHero from '../components/StoriesHero'
import StoryStats from '../components/StoryStats'
import FeaturedStory from '../components/FeaturedStory'
import StoriesGrid from '../components/StoriesGrid'
import ShareStoryCta from '../components/ShareStoryCta'
import PageParallax from '../../../components/motion/PageParallax'
import { TestimonialSection } from '../../testimonial'
import { FaqSection } from '../../faq'

export default function StoriesPage() {
  return (
    <div className="relative overflow-hidden">
      <PageParallax />
      <StoriesHero />
      <StoryStats />
      <FeaturedStory />
      <StoriesGrid />
      <TestimonialSection page="stories" tone="paper" />
      <FaqSection page="stories" tone="cream" />
      <ShareStoryCta />
    </div>
  )
}
