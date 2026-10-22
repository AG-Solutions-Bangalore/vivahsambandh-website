/**
 * @file src/module/super-admin/newsletter/types/newsletter.types.ts
 * Domain types for the newsletter subscriber list.
 *
 * The CRM stores one row per subscription — `newsletter_email` plus the day
 * the subscription was recorded. There is no publication state on a
 * subscriber: a row is either on the list or it is not.
 */

export interface NewsletterSubscriber {
  id: number
  /** The address that subscribed. */
  newsletter_email: string
  /** The day the subscription was recorded, as `YYYY-MM-DD`. */
  newsletter_created: string | null
}

/** Query parameters accepted by the newsletter list endpoint. */
export interface NewsletterListParams {
  page?: number
  per_page?: number
  search?: string
}
