import { apiPostForm } from '@/lib/api/apiClient'
import type {
  EnquiryPayload,
  EnquiryResponse,
  NewsletterPayload,
  NewsletterResponse,
} from '../types'

/**
 * Submits lead or consultation enquiry via multipart/form-data.
 */
export async function createEnquiry(
  payload: EnquiryPayload,
): Promise<EnquiryResponse> {
  const fields: Record<string, string> = {
    enquiryFullName: payload.enquiryFullName.trim(),
    enquiryEmail: payload.enquiryEmail.trim(),
    enquiryMobile: payload.enquiryMobile.replace(/\D/g, ''),
    enquiryMessage: payload.enquiryMessage.trim(),
  }

  if (payload.enquiryService?.trim()) {
    fields.enquiryService = payload.enquiryService.trim()
  }
  if (payload.enquirySubject?.trim()) {
    fields.enquirySubject = payload.enquirySubject.trim()
  }
  if (payload.enquiryFrom?.trim()) {
    fields.enquiryFrom = payload.enquiryFrom.trim()
  }
  if (payload.utm_medium?.trim()) {
    fields.utm_medium = payload.utm_medium.trim()
  }
  if (payload.utm_source?.trim()) {
    fields.utm_source = payload.utm_source.trim()
  }
  if (payload.utm_campaign?.trim()) {
    fields.utm_campaign = payload.utm_campaign.trim()
  }

  return apiPostForm<EnquiryResponse>('/createEnquiry', fields)
}

/**
 * Submits newsletter subscription via multipart/form-data.
 */
export async function createNewsletter(
  payload: NewsletterPayload,
): Promise<NewsletterResponse> {
  return apiPostForm<NewsletterResponse>('/createNewsletter', {
    newsletter_email: payload.newsletter_email.trim(),
  })
}
