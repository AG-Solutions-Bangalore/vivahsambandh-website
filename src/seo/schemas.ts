/**
 * @file src/seo/schemas.ts
 * Typed Schema.org JSON-LD graph builders for Google Rich Results.
 *
 * Utilizes `schema-dts` for compile-time type safety against official Schema.org standards.
 * Powered by `COMPANY_CONFIG` as the single source of truth.
 */

import type {
  BreadcrumbList,
  ContactPoint,
  FAQPage,
  ImageObject,
  ListItem,
  Organization,
  PostalAddress,
  SearchAction,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';
import {
  COMPANY_CONFIG,
  SITE_NAME,
  SITE_ORIGIN,
  SITE_OG_IMAGE,
  SITE_LOGO,
  getCanonicalUrl,
} from './config';

export { SITE_NAME, SITE_ORIGIN, SITE_OG_IMAGE, SITE_LOGO, getCanonicalUrl };

/**
 * Builds the primary Organization Schema for VivahSambandh.
 */
export function organizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    name: COMPANY_CONFIG.name,
    legalName: COMPANY_CONFIG.legalName,
    url: `${COMPANY_CONFIG.siteOrigin}/`,
    logo: {
      '@type': 'ImageObject',
      url: COMPANY_CONFIG.logo,
    } as ImageObject,
    image: COMPANY_CONFIG.ogImage,
    description: COMPANY_CONFIG.description,
    email: COMPANY_CONFIG.supportEmail,
    telephone: COMPANY_CONFIG.supportPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY_CONFIG.address.streetAddress,
      addressLocality: COMPANY_CONFIG.address.addressLocality,
      addressRegion: COMPANY_CONFIG.address.addressRegion,
      postalCode: COMPANY_CONFIG.address.postalCode,
      addressCountry: COMPANY_CONFIG.address.addressCountry,
    } as PostalAddress,
    sameAs: [...COMPANY_CONFIG.socials],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: COMPANY_CONFIG.supportPhone,
        contactType: 'customer support',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      } as ContactPoint,
    ],
  };
}

/**
 * Builds the WebSite Schema node with search query capability.
 */
export function websiteSchema(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#website`,
    name: COMPANY_CONFIG.name,
    url: `${COMPANY_CONFIG.siteOrigin}/`,
    publisher: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    inLanguage: ['en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${COMPANY_CONFIG.siteOrigin}/#search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    } as SearchAction,
  };
}

/**
 * Builds BreadcrumbList schema for navigation rich results.
 */
export function breadcrumbSchema(
  items: Array<{ name: string; path: string }> = [{ name: 'Home', path: '/' }],
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path),
    } as ListItem)),
  };
}

/**
 * Builds the WebPage Schema node for the homepage with BreadcrumbList.
 */
export function webPageSchema(): WebPage {
  return {
    '@type': 'WebPage',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#webpage`,
    url: `${COMPANY_CONFIG.siteOrigin}/`,
    name: COMPANY_CONFIG.title,
    description: COMPANY_CONFIG.description,
    isPartOf: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#website`,
    },
    about: {
      '@id': `${COMPANY_CONFIG.siteOrigin}/#organization`,
    },
    inLanguage: ['en', 'hi'],
    breadcrumb: breadcrumbSchema(),
  };
}

/**
 * Builds the FAQPage Schema from the platform FAQs.
 */
export function faqPageSchema(): FAQPage {
  return {
    '@type': 'FAQPage',
    '@id': `${COMPANY_CONFIG.siteOrigin}/#faq`,
    mainEntity: COMPANY_CONFIG.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Assembles a unified `@context/@graph` structured data object containing all active schemas.
 */
export function createCompositeGraph(): { '@context': string; '@graph': Thing[] } {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationSchema(),
      websiteSchema(),
      webPageSchema(),
      faqPageSchema(),
    ],
  };
}
