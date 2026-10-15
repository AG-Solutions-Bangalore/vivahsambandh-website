/**
 * @file src/services/index.ts
 * Barrel export linking shared API infrastructure with domain modules.
 */

export * from '@/lib/api'
export * from '@/module/company'
export * from '@/module/blog'
export * from '@/module/faq'
export * from '@/module/testimonial'
export * from '@/module/contact/api/enquiry.api'
export * from '@/module/contact/hook/useEnquiry'
export * from '@/module/home/api/home.api'
export * from '@/module/home/hook/useHomeData'
