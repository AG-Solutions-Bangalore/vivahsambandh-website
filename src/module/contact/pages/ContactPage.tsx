import ContactHero from '../components/ContactHero'
import InfoCards from '../components/InfoCards'
import MessageForm from '../components/MessageForm'
import OfficeVisit from '../components/OfficeVisit'
import QuickAnswers from '../components/QuickAnswers'
import ContactCta from '../components/ContactCta'

/**
 * Contact Us page — hero → channel cards → form + office/answers →
 * closing CTA, per design.
 */
export default function ContactPage() {
  return (
    <div className="relative overflow-hidden">
      <ContactHero />
      <InfoCards />
      <section className="relative bg-cream-50 pb-10 sm:pb-12">
        <div className="section-pad">
          {/* Row 1: form + office side by side (naturally similar height).
              Row 2: answers full-width in two columns — nothing stretches
              into whitespace. */}
          <div className="grid items-start gap-5 sm:gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <MessageForm />
            </div>
            <div className="lg:col-span-5">
              <OfficeVisit />
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <QuickAnswers />
          </div>
        </div>
      </section>
      <ContactCta />
    </div>
  )
}
