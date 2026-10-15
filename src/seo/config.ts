import { COMPANY } from '../constants/company';

/**
 * Single source of truth for company constants and multi-language SEO metadata.
 * Updating values here or in `src/constants/company.ts` updates all metadata,
 * schemas, OpenGraph tags, and SSG prerendered HTML across English and Hindi automatically.
 */
export const COMPANY_CONFIG = {
  name: COMPANY.name,
  legalName: COMPANY.legalName,

  taglines: {
    en: 'Tradition Meets New Beginnings',
    hi: 'परंपरा से जुड़ें, नए रिश्तों की शुरुआत',
  },

  titles: {
    en: 'VivahSambandh — Premium Agarwal Matrimony | Tradition Meets New Beginnings',
    hi: 'विवाहसंबंध — विश्वसनीय अग्रवाल वैवाहिक मंच | परंपरा से जुड़ें',
  },

  descriptions: {
    en: 'VivahSambandh is India’s trusted premium Agarwal matrimonial platform connecting verified families with shared traditions, Gotra compatibility, and values for lifelong relationships.',
    hi: 'विवाहसंबंध अग्रवाल परिवारों के लिए एक विश्वसनीय वैवाहिक मंच है, जो साझा संस्कारों, मूल्यों और परंपराओं के साथ जीवनसाथी खोजने में आपकी सहायता करता है।',
  },

  keywords: {
    en: 'Agarwal matrimony, Agarwal matrimonial, VivahSambandh, Agarwal shaadi, Agarwal brides, Agarwal grooms, Bansal gotra, Mittal gotra, Jindal gotra, Agarwal marriage bureau, premium matrimony India',
    hi: 'अग्रवाल मैट्रिमोनी, विवाहसंबंध, अग्रवाल शादी, अग्रवाल रिश्ते, बंसल गोत्र, मित्तल गोत्र, जिंदल गोत्र, अग्रवाल वैवाहिक मंच',
  },

  siteOrigin: 'https://vivahsambandh.com',
  canonicalUrl: 'https://vivahsambandh.com/',
  logo: 'https://vivahsambandh.com/images/common/Temple_Skyline_Divider_footer_image.webp',
  ogImage: 'https://vivahsambandh.com/images/home/home_banner_image.webp',

  author: COMPANY.name,
  publisher: COMPANY.name,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',

  supportEmail: COMPANY.supportEmail,
  supportPhone: COMPANY.supportPhoneDisplay,
  supportPhoneLink: COMPANY.supportPhoneLink,
  supportHours: COMPANY.supportHours,
  address: COMPANY.address,

  socials: [
    COMPANY.socials.facebook,
    COMPANY.socials.instagram,
    COMPANY.socials.youtube,
    COMPANY.socials.linkedin,
  ],

  community: COMPANY.community,
  priceRange: '₹₹',

  faqs: {
    en: [
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
    hi: [
      {
        question: 'क्या विवाहसंबंध पर मेरी जानकारी सुरक्षित है?',
        answer:
          'हाँ, हम हर सदस्य की सुरक्षा के लिए कड़े सत्यापन, गोपनीयता नियंत्रण और सुरक्षित संचार का उपयोग करते हैं।',
      },
      {
        question: 'क्या मैं गोत्र या शहर के अनुसार जीवनसाथी खोज सकता हूँ?',
        answer:
          'हाँ, आप शहर, सभी 18 अग्रवाल गोत्र, व्यवसाय, शिक्षा और कई अन्य फ़िल्टर के आधार पर प्रोफाइल देख सकते हैं।',
      },
      {
        question: 'क्या विवाहसंबंध पर सभी प्रोफाइल सत्यापित हैं?',
        answer:
          'हर प्रोफाइल लाइव होने से पहले सख्त जांच और पहचान सत्यापन से गुजरती है।',
      },
      {
        question: 'रिश्ता खोजने की प्रक्रिया कैसे काम करती है?',
        answer:
          'अपनी प्रोफाइल बनाएं, प्राथमिकताएं चुनें, उपयुक्त रिश्ते देखें और परिवारों से सीधे संपर्क करें।',
      },
    ],
  },
} as const;

export type CompanyConfig = typeof COMPANY_CONFIG;
export type SupportedLang = 'en' | 'hi';
export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'hi'] as const;
export const SUPPORTED_SSG_ROUTES = ['/', '/hi'] as const;

/** Standalone pages that carry their own SEO metadata. */
export type PageKey = 'home' | 'about' | 'contact';

/**
 * Per-page SEO metadata (both languages). Home entries intentionally mirror
 * COMPANY_CONFIG.titles/descriptions above — single source stays here.
 */
export const PAGE_SEO: Record<PageKey, { titles: Record<SupportedLang, string>; descriptions: Record<SupportedLang, string> }> = {
  home: {
    titles: {
      en: 'VivahSambandh — Premium Agarwal Matrimony | Tradition Meets New Beginnings',
      hi: 'विवाहसंबंध — विश्वसनीय अग्रवाल वैवाहिक मंच | परंपरा से जुड़ें',
    },
    descriptions: {
      en: 'VivahSambandh is India’s trusted premium Agarwal matrimonial platform connecting verified families with shared traditions, Gotra compatibility, and values for lifelong relationships.',
      hi: 'विवाहसंबंध अग्रवाल परिवारों के लिए एक विश्वसनीय वैवाहिक मंच है, जो साझा संस्कारों, मूल्यों और परंपराओं के साथ जीवनसाथी खोजने में आपकी सहायता करता है।',
    },
  },
  about: {
    titles: {
      en: 'About Us — VivahSambandh | Trusted Agarwal Matrimony Platform',
      hi: 'हमारे बारे में — विवाहसंबंध | विश्वसनीय अग्रवाल वैवाहिक मंच',
    },
    descriptions: {
      en: 'Learn about VivahSambandh — India’s trusted Agarwal matrimonial platform built on tradition, strict verification and family values to help families find their perfect match.',
      hi: 'विवाहसंबंध के बारे में जानें — परंपरा, कड़े सत्यापन और पारिवारिक मूल्यों पर आधारित अग्रवाल परिवारों के लिए विश्वसनीय वैवाहिक मंच।',
    },
  },
  contact: {
    titles: {
      en: 'Contact Us — VivahSambandh | Agarwal Matrimony Support',
      hi: 'संपर्क करें — विवाहसंबंध | अग्रवाल मैट्रिमोनी सहायता',
    },
    descriptions: {
      en: 'Have a question or need support? Contact the VivahSambandh team by phone, email or visit our office — we reply within 24 hours.',
      hi: 'कोई प्रश्न है या सहायता चाहिए? फोन, ईमेल द्वारा विवाहसंबंध टीम से संपर्क करें या हमारे कार्यालय पधारें — हम 24 घंटों के भीतर उत्तर देते हैं।',
    },
  },
};

/**
 * Maps any app pathname to its SEO page key. Language prefixes, casing
 * and trailing slashes are normalized — unknown paths fall back to home.
 */
export function resolvePageKey(pathname = '/'): PageKey {
  const clean = pathname.toLowerCase().replace(/\/+$/, '');
  const withoutLang = clean === '/hi' ? '' : clean.replace(/^\/hi(?=\/|$)/, '');
  if (withoutLang === '/about') return 'about';
  if (withoutLang === '/contact') return 'contact';
  return 'home';
}

/** Absolute app path of a page in a language ('/about' / '/hi/about'). */
export function getPagePath(page: PageKey, lang: SupportedLang): string {
  const base = page === 'home' ? '' : `/${page}`;
  return lang === 'hi' ? `/hi${base}` : base || '/';
}

export const LANG_METADATA: Record<SupportedLang, { label: string; nativeName: string; locale: string }> = {
  en: { label: 'English', nativeName: 'English', locale: 'en_IN' },
  hi: { label: 'Hindi', nativeName: 'हिन्दी', locale: 'hi_IN' },
};

export const SITE_NAME = COMPANY_CONFIG.name;
export const SITE_ORIGIN = COMPANY_CONFIG.siteOrigin;
export const SITE_OG_IMAGE = COMPANY_CONFIG.ogImage;
export const SITE_LOGO = COMPANY_CONFIG.logo;

/**
 * Computes an absolute, normalized canonical URL for any route and language.
 * Page path is always preserved (including under the `/hi` prefix), so every
 * prerendered route and every client navigation resolves its own canonical.
 */
export function getCanonicalUrl(pathname = '', lang: SupportedLang = 'en'): string {
  const lower = pathname.toLowerCase().replace(/\/+$/, '');
  const isHiPath = lower === '/hi' || lower.startsWith('/hi/');
  const hi = lang === 'hi' || isHiPath;
  const withoutLang = isHiPath ? lower.replace(/^\/hi(?=\/|$)/, '') : lower;
  const page = withoutLang.replace(/^\/+/, '');
  if (!page) return hi ? `${COMPANY_CONFIG.siteOrigin}/hi` : `${COMPANY_CONFIG.siteOrigin}/`;
  return hi
    ? `${COMPANY_CONFIG.siteOrigin}/hi/${page}`
    : `${COMPANY_CONFIG.siteOrigin}/${page}`;
}
