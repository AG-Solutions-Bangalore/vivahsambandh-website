/**
 * @file src/lib/api/utm.ts
 * Lead attribution and UTM tracking helpers.
 * Persists campaign parameters across navigations in sessionStorage.
 */

export interface UtmParams {
  utm_medium: string
  utm_source: string
  utm_campaign: string
}

const STORAGE_KEY = 'vs_utm'

const DEFAULT_UTM: UtmParams = {
  utm_medium: 'website',
  utm_source: 'direct',
  utm_campaign: 'organic',
}

function readStored(): Partial<UtmParams> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<UtmParams>
    return {
      utm_medium: typeof parsed.utm_medium === 'string' ? parsed.utm_medium : undefined,
      utm_source: typeof parsed.utm_source === 'string' ? parsed.utm_source : undefined,
      utm_campaign: typeof parsed.utm_campaign === 'string' ? parsed.utm_campaign : undefined,
    }
  } catch {
    return {}
  }
}

export function getUtmParams(): UtmParams {
  const stored = readStored()
  let fromUrl: Partial<UtmParams> = {}

  if (typeof window !== 'undefined') {
    try {
      const search = new URLSearchParams(window.location.search)
      const medium = search.get('utm_medium')?.trim()
      const source = search.get('utm_source')?.trim()
      const campaign = search.get('utm_campaign')?.trim()
      if (medium) fromUrl.utm_medium = medium
      if (source) fromUrl.utm_source = source
      if (campaign) fromUrl.utm_campaign = campaign
    } catch {
      fromUrl = {}
    }
  }

  const merged: UtmParams = {
    utm_medium: fromUrl.utm_medium ?? stored.utm_medium ?? DEFAULT_UTM.utm_medium,
    utm_source: fromUrl.utm_source ?? stored.utm_source ?? DEFAULT_UTM.utm_source,
    utm_campaign: fromUrl.utm_campaign ?? stored.utm_campaign ?? DEFAULT_UTM.utm_campaign,
  }

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    } catch {
      // Storage unavailable in private browsing modes
    }
  }

  return merged
}

export function getEnquiryFrom(context: string): string {
  if (typeof window === 'undefined') return context || '/'
  try {
    const path = window.location.pathname || '/'
    return context ? `${context} (${path})` : path
  } catch {
    return context || '/'
  }
}
