/**
 * @file src/module/super-admin/hook/errors.ts
 * Adapters between the panel's `{ data, error }` service contract and React
 * Query's reject-on-failure contract.
 *
 * The service layer never throws — it returns a result object so callers can
 * branch on `success`. React Query expects `queryFn` to reject when the
 * request fails, and `mutationFn` to reject so `onError` fires. These helpers
 * translate between the two so no page has to inspect raw result objects.
 */

export function unwrapList<T>(result: { data: T[]; error?: string }): T[] {
  if (result.error) throw new Error(result.error)
  return result.data
}

export function unwrapItem<T>(result: { data: T | null; error?: string }): T {
  if (result.error) throw new Error(result.error)
  if (result.data === null) throw new Error('That record could not be found.')
  return result.data
}

export function unwrapAction(result: { success: boolean; message: string }): string {
  if (!result.success) {
    throw new Error(result.message || 'The request could not be completed.')
  }
  return result.message
}

/** Normalizes anything thrown into a message an admin can act on. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  return fallback
}
