import { useEffect } from 'react'
import { getLenis } from '../../../lib/scroll'
import { useAppLanguage } from '../../../i18n/useAppLanguage'
import { FaqSection } from '../../faq'
import CityMatchesSection from '../../home/components/CityMatchesSection'
import { TestimonialSection } from '../../testimonial'
import DownloadCta from '../components/DownloadCta'
import DownloadFeatures from '../components/DownloadFeatures'
import DownloadHero from '../components/DownloadHero'
import DownloadSteps from '../components/DownloadSteps'

/**
 * Dedicated Vivah Sambandh Mobile App Download Page.
 * Distinctive, luxury UI/UX engineered specifically for app discovery,
 * store downloads, feature highlights, real user reviews via live testimonial marquee API,
 * dynamic FAQ dial, and seamless bilingual support.
 */
export default function DownloadPage() {
  const { lang } = useAppLanguage()

  // Ensure instantaneous top-of-page positioning on load/navigation
  useEffect(() => {
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  return (
    <div className="relative overflow-hidden bg-cream-50">
      <DownloadHero />
      <DownloadFeatures />
      <DownloadSteps />
      <CityMatchesSection />
      <TestimonialSection page="download" tone="paper" />
      <FaqSection
        page="download"
        tone="cream"
        title={lang === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : undefined}
      />
      <DownloadCta />
    </div>
  )
}

