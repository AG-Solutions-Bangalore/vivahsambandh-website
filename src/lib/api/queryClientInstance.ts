/**
 * @file src/lib/api/queryClientInstance.ts
 * QueryClient factory and browser singleton.
 * Isolated in a pure TS file for Vite React Fast Refresh compliance.
 */

import { QueryClient } from '@tanstack/react-query'

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes cache freshness
        gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

export const queryClient = createQueryClient()
