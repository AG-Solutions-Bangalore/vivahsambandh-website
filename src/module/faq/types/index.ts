/**
 * Backend wire format for `GET /getFAQBySlug/:slug`.
 * `faq_sort` arrives as a numeric string (e.g. `"1"`), `faq_heading`
 * may be `null` on continuation rows of the same section.
 */
export interface FaqItem {
  id?: number | string | null
  faq_sort?: string | number | null
  faq_heading?: string | null
  faq_que?: string | null
  faq_ans?: string | null
  /** Legacy / fallback schema aliases. */
  question?: string | null
  answer?: string | null
}

export interface FaqResponse {
  data: FaqItem[]
  /** Which slug in the fallback chain actually served non-empty data (if any). */
  resolvedSlug?: string | null
}

export interface GroupedFaqs {
  heading: string | null
  items: FaqItem[]
}

/** Item shape accepted via the `fallbackItems` prop (supports both schemas). */
export type FaqFallbackItem = { q: string; a: string } | FaqItem

/** Default slug used when the requested page/category has no FAQs. */
export const DEFAULT_FAQ_FALLBACK_SLUG = 'home'
