/**
 * @file src/module/super-admin/components/RemoteImage.tsx
 * Image loader for CRM-hosted files that degrades to a fallback node.
 *
 * A stored file name can resolve to a URL that 404s — the row was deleted on
 * the server, or the upload never finished. Rather than leaving a broken
 * image icon in the table, the failed source is remembered and the fallback
 * is rendered instead.
 */

import { useState, type ReactNode } from 'react'

interface RemoteImageProps {
  /** Absolute URL of the image, or `null` when the record has no attachment. */
  src?: string | null
  alt: string
  /** Applied to the `img` element itself. */
  className?: string
  /** Rendered in place of the image when it is missing or fails to load. */
  fallback?: ReactNode
}

export function RemoteImage({ src, alt, className, fallback = null }: RemoteImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || src === failedSrc) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  )
}
