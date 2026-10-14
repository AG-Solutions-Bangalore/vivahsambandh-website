/**
 * @file src/seo/seo.tsx
 * Global SEO host and Head metadata manager for VivahSambandh.
 *
 * Mounted once in `main.tsx` inside `<HelmetProvider>` — no per-page hooks needed.
 * Automatically synchronizes title, description, canonical link, hreflang alternates,
 * open graph, twitter cards, and typed Schema.org JSON-LD structured data in real-time
 * whenever the user toggles between English and Hindi.
 */

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  COMPANY_CONFIG,
  getCanonicalUrl,
  type SupportedLang,
} from './config';
import { createCompositeGraph } from './schemas';


export function SeoHost() {
  const { i18n } = useTranslation();
  const currentLang = (i18n.resolvedLanguage === 'hi' || i18n.language === 'hi') ? 'hi' : 'en';
  const lang: SupportedLang = currentLang;

  const title = COMPANY_CONFIG.titles[lang];
  const description = COMPANY_CONFIG.descriptions[lang];
  const keywords = COMPANY_CONFIG.keywords[lang];
  const canonicalUrl = getCanonicalUrl('', lang);
  const compositeGraph = createCompositeGraph(lang);

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

      {/* Multi-language Hreflang alternates */}
      <link rel="alternate" hrefLang="en" href={`${COMPANY_CONFIG.siteOrigin}/`} />
      <link rel="alternate" hrefLang="hi" href={`${COMPANY_CONFIG.siteOrigin}/hi`} />
      <link rel="alternate" hrefLang="x-default" href={`${COMPANY_CONFIG.siteOrigin}/`} />

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

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(compositeGraph)}
      </script>
    </Helmet>
  );
}

export default SeoHost;
