/**
 * @file src/seo/seo.tsx
 * Global SEO host and Head metadata manager for VivahSambandh.
 *
 * Mounted once in `main.tsx` inside `<HelmetProvider>` — no per-page hooks needed.
 * Automatically synchronizes title, description, canonical link, open graph,
 * twitter cards, and typed Schema.org JSON-LD structured data.
 */

import { Helmet } from 'react-helmet-async';
import {
  COMPANY_CONFIG,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_OG_IMAGE,
  SITE_LOGO,
  getCanonicalUrl,
} from './config';
import { createCompositeGraph } from './schemas';

export {
  COMPANY_CONFIG,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_OG_IMAGE,
  SITE_LOGO,
  getCanonicalUrl,
};

export function SeoHost() {
  const compositeGraph = createCompositeGraph();

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{COMPANY_CONFIG.title}</title>
      <meta name="description" content={COMPANY_CONFIG.description} />
      <meta name="keywords" content={COMPANY_CONFIG.keywords} />
      <link rel="canonical" href={COMPANY_CONFIG.canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={COMPANY_CONFIG.name} />
      <meta property="og:title" content={COMPANY_CONFIG.title} />
      <meta property="og:description" content={COMPANY_CONFIG.description} />
      <meta property="og:url" content={COMPANY_CONFIG.canonicalUrl} />
      <meta property="og:image" content={COMPANY_CONFIG.ogImage} />
      <meta property="og:image:alt" content={COMPANY_CONFIG.name} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={COMPANY_CONFIG.title} />
      <meta name="twitter:description" content={COMPANY_CONFIG.description} />
      <meta name="twitter:image" content={COMPANY_CONFIG.ogImage} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(compositeGraph)}
      </script>
    </Helmet>
  );
}

export default SeoHost;
