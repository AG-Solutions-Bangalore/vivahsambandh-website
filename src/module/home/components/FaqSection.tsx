/**
 * @file src/module/home/components/FaqSection.tsx
 * Home page FAQ section adapter delegating to the common FAQ module.
 */

import { FaqSection as CommonFaq } from '../../faq'

export default function FaqSection() {
  return <CommonFaq page="home" id="faq" tone="cream" />
}
