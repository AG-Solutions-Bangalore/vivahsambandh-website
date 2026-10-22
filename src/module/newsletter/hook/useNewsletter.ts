/**
 * @file src/module/newsletter/hook/useNewsletter.ts
 * React Query hook for the public newsletter signup.
 */

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { subscribeNewsletter } from '../api/newsletter.api'
import type {
  NewsletterSubscribePayload,
  NewsletterSubscribeResponse,
} from '../types'

export function useNewsletterSubscribeMutation(
  options?: UseMutationOptions<
    NewsletterSubscribeResponse,
    Error,
    NewsletterSubscribePayload
  >,
) {
  return useMutation({
    mutationFn: subscribeNewsletter,
    ...options,
  })
}
