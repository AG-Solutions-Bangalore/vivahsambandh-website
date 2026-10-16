import React from 'react'

/**
 * Base URL for remote web images on VivahSambandh CRM/CDN server.
 */
export const REMOTE_IMAGE_BASE =
  'https://vivahsambandh.com/crmapi/public/assets/images/web_images'

/**
 * Urgent/Critical images that remain stored locally in `public/images/`
 * for zero-latency above-the-fold render and maximum Lighthouse LCP score.
 * Kept in same folder with same name.
 */
export const URGENT_LOCAL_IMAGES = new Set([
  // Hero LCP Banner (Must stay local for instant LCP)
  '/images/home/home_banner_image-640.webp',
  '/images/home/home_banner_image-1024.webp',
  '/images/home/home_banner_image-1280.webp',
  '/images/home/home_banner_image.webp',

  // Hero Top/Bottom Garland accents (above-the-fold)
  '/images/home/flower1_image-192.webp',
  '/images/home/flower1_image-320.webp',
  '/images/home/flower2_image-192.webp',
  '/images/home/flower2_image-320.webp',

  // Hero Match Pill Avatars (above-the-fold)
  '/images/home/woman_image-160.webp',
  '/images/home/woman_image-320.webp',
  '/images/home/man_image-160.webp',
  '/images/home/man_image-320.webp',
  '/images/home/radiant-indian-bride-in-floral-glow-128.webp',
  '/images/home/radiant-indian-bride-in-floral-glow-320.webp',
  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-128.webp',
  '/images/home/radiant-indian-groom-in-a-golden-wedding-setting-320.webp',
])

/**
 * Resolves an image path to either local (if urgent) or remote CDN.
 *
 * Examples:
 *   img('/images/home/home_banner_image-640.webp') -> '/images/home/home_banner_image-640.webp' (Local)
 *   img('/images/home/cities/delhi.webp')          -> 'https://vivahsambandh.com/crmapi/public/assets/images/web_images/home/cities/delhi.webp' (Remote)
 */
export function img(path: string | undefined): string {
  if (!path) return ''

  // Already an absolute URL or data URL
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`

  // Urgent images stay local
  if (URGENT_LOCAL_IMAGES.has(normalized)) {
    return normalized
  }

  // Strip leading '/images/' and point to remote base
  const cleanPath = normalized.replace(/^\/images\//, '').replace(/^\//, '')
  return `${REMOTE_IMAGE_BASE}/${cleanPath}`
}

/**
 * Resolves a responsive `srcSet` string candidates to local or remote URLs.
 *
 * Example:
 *   imgSrcSet('/images/home/Mandap_image-800.webp 800w, /images/home/Mandap_image.webp 1723w')
 */
export function imgSrcSet(srcSet: string | undefined): string {
  if (!srcSet) return ''

  return srcSet
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim()
      const parts = trimmed.split(/\s+/)
      if (parts.length >= 2) {
        const url = parts[0]
        const descriptor = parts.slice(1).join(' ')
        return `${img(url)} ${descriptor}`
      }
      return img(trimmed)
    })
    .join(', ')
}

/**
 * Easy drop-in Image component that resolves local urgent vs remote CDN automatically.
 */
export const Img: React.FC<React.ComponentPropsWithoutRef<'img'>> = ({
  src,
  srcSet,
  ...props
}) => {
  return React.createElement('img', {
    ...props,
    src: src ? img(src) : undefined,
    srcSet: srcSet ? imgSrcSet(srcSet) : undefined,
  })
}
