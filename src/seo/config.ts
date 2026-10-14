import { COMPANY } from '../constants/company';

/**
 * Single source of truth for company constants and SEO metadata across VivahSambandh.
 * Updating values here or in `src/constants/company.ts` updates all metadata, schemas,
 * OpenGraph tags, and SSG prerendered HTML everywhere automatically.
 */
export const COMPANY_CONFIG = {
  name: COMPANY.name,
  legalName: COMPANY.legalName,
  tagline: 'Tradition Meets New Beginnings',
  title: 'VivahSambandh — Premium Agarwal Matrimony | Tradition Meets New Beginnings',
  description:
    'VivahSambandh is India’s premier Agarwal matrimonial platform connecting verified families with shared traditions, Gotra compatibility, and values for lifelong relationships.',
  keywords:
    'Agarwal matrimony, Agarwal matrimonial, VivahSambandh, Agarwal shaadi, Agarwal brides, Agarwal grooms, Bansal gotra, Mittal gotra, Jindal gotra, Agarwal marriage bureau, premium matrimony India',
  siteOrigin: 'https://vivahsambandh.com',
  canonicalUrl: 'https://vivahsambandh.com/',
  logo: 'https://vivahsambandh.com/images/common/Temple_Skyline_Divider_footer_image.png',
  ogImage: 'https://vivahsambandh.com/images/home/home_banner_image.png',

  supportEmail: COMPANY.supportEmail,
  supportPhone: COMPANY.supportPhoneDisplay,
  supportPhoneLink: COMPANY.supportPhoneLink,
  supportHours: COMPANY.supportHours.en,

  address: {
    streetAddress: COMPANY.address.en,
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    postalCode: '560001',
    addressCountry: 'IN',
  },

  socials: [
    COMPANY.socials.facebook,
    COMPANY.socials.instagram,
    COMPANY.socials.youtube,
    COMPANY.socials.linkedin,
  ],

  establishedYear: COMPANY.community.establishedYear,
  priceRange: '₹₹',

  faqs: [
    {
      question: 'Is my information secure on VivahSambandh?',
      answer:
        'Yes. We use strict verification, privacy controls and secure communication to protect every member and family.',
    },
    {
      question: 'Can I search by Agarwal gotra or city?',
      answer:
        'Yes. Browse verified matches across all 18 Agarwal Gotras (Bansal, Mittal, Jindal, Singhal, etc.), cities, professions, and education.',
    },
    {
      question: 'Are profiles on VivahSambandh verified?',
      answer:
        'Every profile passes strict screening plus optional official ID and family background verification before going live.',
    },
    {
      question: 'How does the matching process work?',
      answer:
        'Create your profile, set your partner preferences, receive curated Agarwal matches with Kundali compatibility, and connect directly with families.',
    },
  ],
} as const;

export type CompanyConfig = typeof COMPANY_CONFIG;

export const SITE_NAME = COMPANY_CONFIG.name;
export const SITE_ORIGIN = COMPANY_CONFIG.siteOrigin;
export const SITE_OG_IMAGE = COMPANY_CONFIG.ogImage;
export const SITE_LOGO = COMPANY_CONFIG.logo;

/**
 * Computes an absolute, normalized canonical URL for any internal route.
 */
export function getCanonicalUrl(pathname = ''): string {
  const clean = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  return clean ? `${COMPANY_CONFIG.siteOrigin}/${clean}` : `${COMPANY_CONFIG.siteOrigin}/`;
}
