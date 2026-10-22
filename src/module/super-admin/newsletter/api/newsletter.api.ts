/**
 * @file src/module/super-admin/newsletter/api/newsletter.api.ts
 * Newsletter subscriber endpoints for the Super Admin Panel.
 *
 * The CRM exposes the list at `GET /newsletter` — a standard Laravel
 * paginator, so the page, the page size and the search term all travel with
 * the request and the server does the filtering. `DELETE /newsletter/{id}`
 * removes a subscription.
 *
 * Everything goes through the panel transport, so the request carries the
 * admin session and a server failure comes back as a message an admin can
 * act on instead of a raw stack trace.
 */

import { buildQueryString, request } from '../../services/http'
import { toListMeta } from '../../services/mappers'
import type { ListMeta } from '../../hook/useServerList'
import type {
  NewsletterListParams,
  NewsletterSubscriber,
} from '../types/newsletter.types'

type Raw = Record<string, unknown>

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length ? str : null
}

/**
 * Normalises a `/newsletter` row.
 *
 * The endpoint has shipped the address under `newsletter_email` and the
 * subscription day under `newsletter_created`; both are also read from the
 * generic aliases so an older payload still renders.
 */
function toSubscriber(raw: Raw): NewsletterSubscriber {
  return {
    id: Number(raw.id ?? 0),
    newsletter_email: text(raw.newsletter_email) ?? text(raw.email) ?? '',
    newsletter_created:
      text(raw.newsletter_created) ?? text(raw.created_at) ?? text(raw.created_date),
  }
}

/** Reads the rows out of the paginated envelope. */
function readRows(payload: unknown): Raw[] {
  const envelope = (payload as { data?: unknown } | null)?.data
  if (Array.isArray(envelope)) return envelope as Raw[]
  if (envelope && typeof envelope === 'object' && Array.isArray((envelope as Raw).data)) {
    return (envelope as Raw).data as Raw[]
  }
  if (Array.isArray(payload)) return payload as Raw[]
  return []
}

/**
 * GET /newsletter — the subscriber list.
 *
 * `search` and the page window are honoured by the server, so the rows that
 * come back are already the rows the panel should show.
 */
export async function fetchNewsletterSubscribers(
  params: NewsletterListParams = {},
): Promise<{ data: NewsletterSubscriber[]; meta: ListMeta; error?: string }> {
  const res = await request<unknown>(`/newsletter${buildQueryString(params)}`)

  if (!res.ok) {
    return {
      data: [],
      meta: toListMeta(null, { page: params.page, per_page: params.per_page }),
      error: res.message,
    }
  }

  return {
    data: readRows(res.data).map(toSubscriber),
    meta: toListMeta(res.data, {
      page: params.page,
      per_page: params.per_page,
      rowCount: readRows(res.data).length,
    }),
  }
}

/**
 * DELETE /newsletter/{id} — removes a subscription from the list.
 */
export async function deleteNewsletterSubscriber(
  id: number | string,
): Promise<{ success: boolean; message: string }> {
  const res = await request<{ message?: string }>(`/newsletter/${id}`, {
    method: 'DELETE',
  })

  if (res.ok) {
    return {
      success: true,
      message: res.data?.message || 'Subscriber removed successfully.',
    }
  }

  return {
    success: false,
    message: res.message || 'Failed to remove the subscriber.',
  }
}
