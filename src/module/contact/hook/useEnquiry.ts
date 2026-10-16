import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { createEnquiry, createNewsletter } from '../api/enquiry.api'
import type {
  EnquiryPayload,
  EnquiryResponse,
  NewsletterPayload,
  NewsletterResponse,
} from '../types'

export function useEnquiryMutation(
  options?: UseMutationOptions<EnquiryResponse, Error, EnquiryPayload>,
) {
  return useMutation({
    mutationFn: createEnquiry,
    ...options,
  })
}

export function useNewsletterMutation(
  options?: UseMutationOptions<NewsletterResponse, Error, NewsletterPayload>,
) {
  return useMutation({
    mutationFn: createNewsletter,
    ...options,
  })
}
