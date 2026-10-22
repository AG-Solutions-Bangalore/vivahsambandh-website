/**
 * @file src/module/home/components/SuccessStoriesSection.tsx
 * Home page Testimonial section adapter delegating to the common Testimonial module.
 */

import { TestimonialSection as CommonTestimonial } from '../../testimonial'

export default function SuccessStoriesSection() {
  return <CommonTestimonial page="home" id="stories" tone="paper" />
}
