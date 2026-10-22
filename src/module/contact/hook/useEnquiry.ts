import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { createEnquiry } from '../api/enquiry.api'
import type {
  EnquiryPayload,
  EnquiryResponse,
} from '../types'

export function useEnquiryMutation(
  options?: UseMutationOptions<EnquiryResponse, Error, EnquiryPayload>,
) {
  return useMutation({
    mutationFn: createEnquiry,
    ...options,
  })
}
