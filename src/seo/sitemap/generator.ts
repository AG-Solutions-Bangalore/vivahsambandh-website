/**
 * @file src/seo/sitemap/generator.ts
 * Generates dynamic, SEO-compliant XML sitemaps for VivahSambandh.
 *
 * At build time, queries `getSitemap` (https://vivahsambandh.com/crmapi/public/api/getSitemap)
 * to assemble full dynamic sitemaps including:
 *   - Canonical multi-language routes (English + Hindi alternates + x-default)
 *   - Dynamically published blog articles (/blogs/:slug and /hi/blogs/:slug)
 *   - Accurate W3C lastmod timestamps, changefreq, and priorities
 *
 * Emits compliant sitemaps to both `public/sitemap.xml` and `dist/sitemap.xml`.
 */

import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

export interface SitemapPageItem {
  id?: number
  page_two_url: string
  page_two_name?: string | null
  page_two_type?: string | null
  page_two_priority?: string | null
  page_two_status?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface SitemapApiResponse {
  data?: SitemapPageItem[]
  blog?: SitemapPageItem[]
}

export interface StaticRouteItem {
  path: string
  priority: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  hasHindi: boolean
}

export const SITE_ORIGIN = 'https://vivahsambandh.com'
export const SITEMAP_API_URL = 'https://vivahsambandh.com/crmapi/public/api/getSitemap'

/**
 * Core static marketing and informational pages.
 */
export const CORE_STATIC_ROUTES: StaticRouteItem[] = [
  { path: '', priority: '1.0', changefreq: 'daily', hasHindi: true },
  { path: 'about', priority: '0.8', changefreq: 'monthly', hasHindi: true },
  { path: 'stories', priority: '0.8', changefreq: 'weekly', hasHindi: true },
  { path: 'membership', priority: '0.8', changefreq: 'monthly', hasHindi: true },
  { path: 'blogs', priority: '0.8', changefreq: 'weekly', hasHindi: true },
  { path: 'contact', priority: '0.7', changefreq: 'monthly', hasHindi: true },
  { path: 'registration', priority: '0.9', changefreq: 'daily', hasHindi: true },
  { path: 'download', priority: '0.7', changefreq: 'monthly', hasHindi: true },
  { path: 'help-center', priority: '0.5', changefreq: 'monthly', hasHindi: true },
  { path: 'privacy', priority: '0.4', changefreq: 'yearly', hasHindi: true },
  { path: 'terms', priority: '0.4', changefreq: 'yearly', hasHindi: true },
  { path: 'guidelines', priority: '0.4', changefreq: 'yearly', hasHindi: true },
]

/**
 * Normalizes an arbitrary timestamp to W3C format (YYYY-MM-DD).
 */
export function toW3CDate(dateStr?: string | null): string {
  if (!dateStr) {
    return new Date().toISOString().split('T')[0]
  }
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split('T')[0]
    }
    return d.toISOString().split('T')[0]
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

function buildUrlEntry(
  loc: string,
  options: {
    enUrl?: string
    hiUrl?: string
    lastmod: string
    changefreq: string
    priority: string
  },
): string {
  const lines: string[] = ['  <url>']
  lines.push(`    <loc>${loc}</loc>`)

  if (options.enUrl && options.hiUrl) {
    lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${options.enUrl}"/>`)
    lines.push(`    <xhtml:link rel="alternate" hreflang="hi" href="${options.hiUrl}"/>`)
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${options.enUrl}"/>`)
  }

  lines.push(`    <lastmod>${options.lastmod}</lastmod>`)
  lines.push(`    <changefreq>${options.changefreq}</changefreq>`)
  lines.push(`    <priority>${options.priority}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

/**
 * Builds the complete sitemap XML string incorporating static routes and dynamic blog articles.
 */
export function buildSitemapXml(
  apiData?: SitemapApiResponse | null,
  origin: string = SITE_ORIGIN,
): string {
  const today = toW3CDate()
  const entries: string[] = []
  const seenLocs = new Set<string>()

  // 1. Process Core Static Routes
  for (const route of CORE_STATIC_ROUTES) {
    const enUrl = route.path ? `${origin}/${route.path}` : `${origin}/`
    const hiUrl = route.path ? `${origin}/hi/${route.path}` : `${origin}/hi`

    // Check if getSitemap data array has updated date or custom priority for this route
    const matchedApiPage = apiData?.data?.find((p) => {
      const url = p.page_two_url?.toLowerCase().replace(/^\/+/, '')
      if (!url) return false
      if (route.path === 'about' && (url === 'about' || url === 'about-us')) return true
      if (route.path === 'blogs' && (url === 'blog' || url === 'blogs')) return true
      if (route.path === 'contact' && url === 'contact') return true
      if (route.path === 'membership' && (url === 'services' || url === 'membership')) return true
      if (route.path === 'stories' && (url === 'gallery' || url === 'stories')) return true
      return url === route.path
    })

    const priority = matchedApiPage?.page_two_priority || route.priority
    const lastmod = toW3CDate(matchedApiPage?.updated_at || matchedApiPage?.created_at || today)

    // English canonical URL
    if (!seenLocs.has(enUrl)) {
      seenLocs.add(enUrl)
      entries.push(
        buildUrlEntry(enUrl, {
          enUrl,
          hiUrl: route.hasHindi ? hiUrl : undefined,
          lastmod,
          changefreq: route.changefreq,
          priority,
        }),
      )
    }

    // Hindi localized URL
    if (route.hasHindi && !seenLocs.has(hiUrl)) {
      seenLocs.add(hiUrl)
      entries.push(
        buildUrlEntry(hiUrl, {
          enUrl,
          hiUrl,
          lastmod,
          changefreq: route.changefreq,
          priority,
        }),
      )
    }
  }

  // 2. Process Dynamic Blog Articles from getSitemap
  if (Array.isArray(apiData?.blog)) {
    for (const blog of apiData.blog) {
      const status = blog.page_two_status?.toLowerCase()
      if (status && status !== 'active') continue

      const slug = (blog.page_two_url || '').trim().replace(/^\/+/, '')
      if (!slug) continue

      const enUrl = `${origin}/blogs/${slug}`
      const hiUrl = `${origin}/hi/blogs/${slug}`
      const priority = blog.page_two_priority || '0.80'
      const lastmod = toW3CDate(blog.updated_at || blog.created_at || today)

      // English blog entry
      if (!seenLocs.has(enUrl)) {
        seenLocs.add(enUrl)
        entries.push(
          buildUrlEntry(enUrl, {
            enUrl,
            hiUrl,
            lastmod,
            changefreq: 'weekly',
            priority,
          }),
        )
      }

      // Hindi blog entry
      if (!seenLocs.has(hiUrl)) {
        seenLocs.add(hiUrl)
        entries.push(
          buildUrlEntry(hiUrl, {
            enUrl,
            hiUrl,
            lastmod,
            changefreq: 'weekly',
            priority,
          }),
        )
      }
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n')
}

/**
 * Fetches dynamic sitemap metadata from the CRM API endpoint.
 */
export async function fetchSitemapData(
  apiUrl: string = SITEMAP_API_URL,
): Promise<SitemapApiResponse | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      console.warn(`[sitemap] API responded with HTTP ${res.status}: ${res.statusText}`)
      return null
    }

    return (await res.json()) as SitemapApiResponse
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic sitemap from API:', err)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Builds and saves sitemap.xml to public and/or dist targets.
 */
export async function generateAndSaveSitemap(options?: {
  rootDir?: string
  apiUrl?: string
}): Promise<{ xml: string; count: number; blogCount: number }> {
  const rootDir = options?.rootDir || process.cwd()
  const apiData = await fetchSitemapData(options?.apiUrl)
  const xml = buildSitemapXml(apiData)

  const publicPath = resolve(rootDir, 'public/sitemap.xml')
  const distPath = resolve(rootDir, 'dist/sitemap.xml')

  try {
    if (existsSync(dirname(publicPath))) {
      writeFileSync(publicPath, xml, 'utf8')
    }
  } catch (e) {
    console.warn('[sitemap] Could not write to public/sitemap.xml:', e)
  }

  try {
    if (existsSync(dirname(distPath))) {
      writeFileSync(distPath, xml, 'utf8')
    }
  } catch {
    // dist might not exist yet
  }

  const blogCount = Array.isArray(apiData?.blog)
    ? apiData.blog.filter((b) => b.page_two_status?.toLowerCase() === 'active').length
    : 0
  const urlMatches = xml.match(/<loc>/g)
  const count = urlMatches ? urlMatches.length : 0

  return { xml, count, blogCount }
}
