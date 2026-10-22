/**
 * @file src/module/newsletter/types/index.ts
 * Types for the public newsletter subscription.
 */

export interface NewsletterSubscribePayload {
  /** The address that wants to receive the mailing. */
  newsletter_email: string
}

export interface NewsletterSubscribeResponse {
  status?: boolean | string
  message?: string
}
