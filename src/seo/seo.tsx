/**
 * @file src/seo/seo.tsx
 * Global SEO host and Head metadata manager for VivahSambandh.
 *
 * Mounted once in `main.tsx` inside `<HelmetProvider>` — no per-page hooks needed.
 * Route-aware: subscribes to the router pathname, so title, description,
 * canonical link, hreflang alternates, open graph, twitter cards, and typed
 * Schema.org JSON-LD update in real-time on client-side navigation as well as
 * whenever the user toggles between English and Hindi.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  COMPANY_CONFIG,
  PAGE_SEO,
  getCanonicalUrl,
  getPagePath,
  resolvePageKey,
  type SupportedLang,
} from './config';


export function SeoHost() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const currentLang = (i18n.resolvedLanguage === 'hi' || i18n.language === 'hi') ? 'hi' : 'en';
  const lang: SupportedLang = currentLang;

  // Route-aware metadata: subscribing to the pathname re-renders Helmet on
  // every client-side navigation, so title/description/canonical follow the
  // page without a reload. Same resolver feeds the prerenderer, keeping
  // static HTML and hydrated head identical.
  const page = resolvePageKey(pathname);
  const title = PAGE_SEO[page].titles[lang];
  const description = PAGE_SEO[page].descriptions[lang];
  const keywords = COMPANY_CONFIG.keywords[lang];
  const canonicalUrl = getCanonicalUrl(pathname, lang);
  const enHref = `${COMPANY_CONFIG.siteOrigin}${getPagePath(page, 'en')}`;
  const hiHref = `${COMPANY_CONFIG.siteOrigin}${getPagePath(page, 'hi')}`;

  // Lazy-load the schemas chunk post-mount so it doesn't block FCP/LCP.
  // The JSON-LD <script> is already deferred to after mount, so this dynamic
  // import matches the existing render timing perfectly.
  const [compositeGraph, setCompositeGraph] = useState<object | null>(null);
  useEffect(() => {
    import('./schemas').then(({ createCompositeGraph }) => {
      setCompositeGraph(createCompositeGraph(lang, page));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, page]);

  return (
    <Helmet prioritizeSeoTags>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={COMPANY_CONFIG.robots} />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content={COMPANY_CONFIG.author} />
      <meta name="publisher" content={COMPANY_CONFIG.publisher} />
      <link rel="author" href={COMPANY_CONFIG.siteOrigin} />
      <link rel="publisher" href={COMPANY_CONFIG.siteOrigin} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Multi-language Hreflang alternates (same page, both languages) */}
      <link rel="alternate" hrefLang="en" href={enHref} />
      <link rel="alternate" hrefLang="hi" href={hiHref} />
      <link rel="alternate" hrefLang="x-default" href={enHref} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={COMPANY_CONFIG.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={COMPANY_CONFIG.ogImage} />
      <meta property="og:image:alt" content={COMPANY_CONFIG.name} />
      <meta property="og:locale" content={lang === 'hi' ? 'hi_IN' : 'en_IN'} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={COMPANY_CONFIG.ogImage} />

      {/* Structured Data (JSON-LD) — loaded post-mount via lazy import, see above */}
      {compositeGraph && (
        <script type="application/ld+json">
          {JSON.stringify(compositeGraph)}
        </script>
      )}
    </Helmet>
  );
}

export default SeoHost;
