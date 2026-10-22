/**
 * @file src/services/index.ts
 * Barrel export linking shared API infrastructure with domain modules.
 */

export * from '@/lib/api'
export * from '@/module/category'
export * from '@/module/company'
export * from '@/module/blog'
export * from '@/module/faq'
export * from '@/module/testimonial'
export * from '@/module/contact/api/enquiry.api'
export * from '@/module/contact/hook/useEnquiry'
export * from '@/module/home/api/home.api'
export * from '@/module/home/hook/useHomeData'

// Client API operations & HTTP client
export { default as api } from './api'
export { default as clientApi } from './clientApi'
export {
  buildClientFormData,
  createClient,
  getClientById,
  findClientById,
  updateClient,
  updateClientStatus,
  deleteClient,
  type ClientPayload,
  type ClientStatus,
  type ClientListParams,
} from './clientApi'

// Gallery API operations
export { default as galleryApi } from './galleryApi'
export {
  buildGalleryFormData,
  getGalleries,
  createGallery,
  getGalleryById,
  updateGallery,
  updateGalleryStatus,
  getActiveGalleries,
  deleteGallery,
  type GalleryPayload,
  type GalleryStatus,
  type GalleryListParams,
} from './galleryApi'
