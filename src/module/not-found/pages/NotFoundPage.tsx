/**
 * @file src/module/not-found/pages/NotFoundPage.tsx
 * 404 page for any URL that does not match a public route.
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Home } from 'lucide-react'
import PageParallax from '@/components/motion/PageParallax'
import Reveal from '@/components/motion/Reveal'
import { pagePath } from '@/constants/navigation'
import type { AppLang } from '@/i18n'

export default function NotFoundPage() {
  const { t, i18n } = useTranslation()
  const lang: AppLang =
    i18n.resolvedLanguage === 'hi' || i18n.language === 'hi' ? 'hi' : 'en'

  return (
    <div className="relative overflow-hidden bg-[#FFFBF2]">
      <PageParallax />

      <section className="section-pad relative z-10 flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24">
        <Reveal variant="up" className="max-w-xl">
          <p className="font-display text-7xl font-bold tracking-tight text-gold-500 sm:text-8xl">
            404
          </p>
          <p className="eyebrow mx-auto mt-4 justify-center">
            <span className="text-gold-500">✦</span>
            <span>{t('notFound.eyebrow', 'Page not found')}</span>
          </p>
          <h1 className="font-display mt-3 text-2xl font-bold text-balance text-navy-900 sm:text-4xl">
            {t('notFound.title', "This page doesn't exist.")}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600 sm:text-base">
            {t(
              'notFound.description',
              'The link may be broken, or the page may have been moved or removed.',
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={pagePath('/', lang)} className="btn-primary !px-6 !py-2.5">
              <Home className="size-4" aria-hidden />
              {t('notFound.home', 'Back to home')}
            </Link>
            <Link
              to={pagePath('/contact', lang)}
              className="btn-gold !px-6 !py-2.5"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t('notFound.contact', 'Contact support')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
