/**
 * @file src/lib/api/queryClient.tsx
 * TanStack QueryProvider for VivahSambandh.
 * Compatible with SSR/SSG prerender and client hydration.
 */

import { type ReactNode, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient, queryClient } from './queryClientInstance'

export interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(() =>
    typeof window !== 'undefined' ? queryClient : createQueryClient(),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
