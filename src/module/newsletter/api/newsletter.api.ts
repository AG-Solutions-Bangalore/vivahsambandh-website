/**
 * @file src/module/newsletter/api/newsletter.api.ts
 * Public newsletter subscription endpoint.
 *
 * `POST /createNewsletter` is the same route the website and the app use to
 * sign a visitor up. It expects a multipart body, so the form data is
 * encoded natively rather than as JSON.
 */

import { apiPostForm } from '@/lib/api/apiClient'
import type {
  NewsletterSubscribePayload,
  NewsletterSubscribeResponse,
} from '../types'

/**
 * Subscribes an address to the newsletter.
 */
export async function subscribeNewsletter(
  payload: NewsletterSubscribePayload,
): Promise<NewsletterSubscribeResponse> {
  return apiPostForm<NewsletterSubscribeResponse>('/createNewsletter', {
    newsletter_email: payload.newsletter_email.trim(),
  })
}
