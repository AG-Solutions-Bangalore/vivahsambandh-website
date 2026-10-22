/**
 * @file src/module/newsletter/types/index.ts
 * Types for the public newsletter subscription.
 */

export interface NewsletterSubscribePayload {
  /** The address that wants to receive the mailing. */
  newsletter_email: string
}

/** The raw envelope the CRM answers with. */
export interface NewsletterSubscribeResponse {
  /** `201` on success, `400` when the address is already on the list. */
  code?: number
  status?: boolean | string
  message?: string
}

/**
 * What the signup actually did.
 *
 * `already_subscribed` is not an error — the CRM refuses a duplicate and
 * says so, which is a perfectly good outcome for the visitor.
 */
export type NewsletterSubscribeOutcome = 'subscribed' | 'already_subscribed'

export interface NewsletterSubscribeResult {
  outcome: NewsletterSubscribeOutcome
  message: string
}
