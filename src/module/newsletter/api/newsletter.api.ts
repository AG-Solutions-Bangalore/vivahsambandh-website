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
  NewsletterSubscribeResult,
} from '../types'

/**
 * Subscribes an address to the newsletter.
 *
 * The CRM answers a duplicate signup with `400` and a plain message — the
 * address is already on the list, which is a fine outcome rather than a
 * failure, so it is reported as its own result.
 */
export async function subscribeNewsletter(
  payload: NewsletterSubscribePayload,
): Promise<NewsletterSubscribeResult> {
  const response = await apiPostForm<NewsletterSubscribeResponse>(
    '/createNewsletter',
    { newsletter_email: payload.newsletter_email.trim() },
  )

  const code = Number(response?.code ?? 0)
  const message = response?.message?.trim() ?? ''

  if (code === 400 || /already/i.test(message)) {
    return {
      outcome: 'already_subscribed',
      message: message || 'You already Subscribed with us.',
    }
  }

  if (code >= 400) {
    throw new Error(message || 'Could not subscribe right now. Please try again.')
  }

  return { outcome: 'subscribed', message: message || 'Subscribed Successfully.' }
}
