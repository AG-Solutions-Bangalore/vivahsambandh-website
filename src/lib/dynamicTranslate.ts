/**
 * @file src/lib/dynamicTranslate.ts
 * Real-time dynamic translation service for runtime API data.
 * Translates English content received from the API into Hindi dynamically
 * with multi-tier caching (in-memory Map + browser localStorage)
 * and tag-preserving HTML chunking.
 */

const memoryCache = new Map<string, string>()
const STORAGE_PREFIX = 'vs_dyn_hi_'

/**
 * Fast string hashing for safe storage keys.
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return String(Math.abs(hash))
}

/**
 * Translates a single text chunk (<= 2500 chars) via Google Translate GTX API.
 */
async function translateChunk(text: string, targetLang = 'hi'): Promise<string> {
  if (!text || !text.trim()) return text ?? ''
  const trimmed = text.trim()
  const key = `${targetLang}_${hashString(trimmed)}`

  // 1. Check in-memory cache
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!
  }

  // 2. Check localStorage in browser
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key)
      if (stored) {
        memoryCache.set(key, stored)
        return stored
      }
    } catch {
      /* ignore storage access error */
    }
  }

  // 3. Dynamic network fetch
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`
    const res = await fetch(url)
    if (!res.ok) return text
    const data = await res.json()
    const translated = Array.isArray(data?.[0])
      ? data[0].map((s: [string]) => s[0]).join('')
      : trimmed

    if (translated) {
      memoryCache.set(key, translated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_PREFIX + key, translated)
        } catch {
          /* ignore storage quota */
        }
      }
      return translated
    }
  } catch (err) {
    console.warn('[dynamicTranslate] Request failed, fallback to original:', err)
  }

  return text
}

/**
 * Dynamically translates plain text or rich HTML into Hindi.
 * Automatically splits long HTML into tag-delimited blocks to preserve styling.
 */
export async function translateText(text: string | null | undefined, targetLang = 'hi'): Promise<string> {
  if (!text || !text.trim() || targetLang !== 'hi') {
    return text ?? ''
  }

  if (text.length <= 2500) {
    return translateChunk(text, targetLang)
  }

  // Split rich HTML along block tag boundaries
  const parts = text.split(/(<\/p>|<\/h[1-6]>|<\/div>|<\/li>)/gi)
  const blocks: string[] = []
  let cur = ''

  for (let i = 0; i < parts.length; i++) {
    if ((cur + parts[i]).length > 2500 && cur.length > 0) {
      blocks.push(cur)
      cur = parts[i]
    } else {
      cur += parts[i]
    }
  }
  if (cur) blocks.push(cur)

  const translatedBlocks = await Promise.all(
    blocks.map((b) => translateChunk(b, targetLang))
  )
  return translatedBlocks.join('')
}
