import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Footer from './components/Footer'
import Header from './components/Header'
import SmoothScroll from './components/motion/SmoothScroll'
import { refreshScrollTriggers } from './lib/gsap-setup'
import HomePage from './module/home/pages/HomePage'

export default function App() {
  const { i18n } = useTranslation()

  // Translated copy changes layout heights → re-measure ScrollTriggers.
  useEffect(() => {
    const onLangChange = () => refreshScrollTriggers()
    i18n.on('languageChanged', onLangChange)
    return () => {
      i18n.off('languageChanged', onLangChange)
    }
  }, [i18n])

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main>
          <HomePage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
