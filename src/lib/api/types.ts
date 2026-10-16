/**
 * @file src/lib/api/types.ts
 * Shared API primitives and common response structures.
 */

export interface ImageUrlEntry {
  image_for: string
  image_url: string
}

export interface ApiResponse<T> {
  data: T
  image_url?: ImageUrlEntry[]
}
