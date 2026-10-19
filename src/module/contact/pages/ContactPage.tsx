import ContactHero from '../components/ContactHero'
import InfoCards from '../components/InfoCards'
import MessageForm from '../components/MessageForm'
import OfficeVisit from '../components/OfficeVisit'
import ContactCta from '../components/ContactCta'
import PageParallax from '../../../components/motion/PageParallax'
import { TestimonialSection } from '../../testimonial'
import { FaqSection } from '../../faq'

/**
 * Contact Us page — hero → channel cards → form + office →
 * testimonials → FAQs → closing CTA.
 */
export default function ContactPage() {
  return (
    <div className="relative overflow-hidden">
      <PageParallax />
      <ContactHero />
      <InfoCards />
      <section className="relative bg-cream-50 pb-10 sm:pb-12">
        <div className="section-pad">
          {/* Form + office side by side */}
          <div className="grid items-stretch gap-5 sm:gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <MessageForm />
            </div>
            <div className="lg:col-span-5">
              <OfficeVisit />
            </div>
          </div>
        </div>
      </section>
      <TestimonialSection slug="contact" tone="paper" />
      <FaqSection slug="contact" tone="cream" />
      <ContactCta />
    </div>
  )
}
