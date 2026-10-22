/**
 * @file src/module/super-admin/context/SuperAdminAuthContext.tsx
 * Authentication state provider and route guard for Super Admin Panel.
 *
 * The login request runs as a TanStack Query mutation so the pending state
 * (button spinner, disabled submit) is owned by React Query instead of a
 * second hand-rolled flag.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useMutation } from '@tanstack/react-query'
import { Navigate, useLocation } from 'react-router-dom'
import {
  clearSession,
  getStoredSession,
  superAdminLogin,
} from '../services/adminApi'
import type { SuperAdminSession } from '../types'

export interface SuperAdminLoginResult {
  success: boolean
  message: string
  isInactiveProfile?: boolean
}

interface SuperAdminAuthContextValue {
  session: SuperAdminSession | null
  isAuthenticated: boolean
  /** True while a sign-in request is in flight. */
  isPending: boolean
  login: (username: string, password: string) => Promise<SuperAdminLoginResult>
  logout: () => void
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | null>(null)

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SuperAdminSession | null>(() => getStoredSession())

  useEffect(() => {
    const handleStorageChange = () => {
      setSession(getStoredSession())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const result = await superAdminLogin(credentials.username, credentials.password)
      if (result.success && result.session) {
        setSession(result.session)
      }
      return result
    },
  })

  const login = useCallback(
    async (username: string, password: string) =>
      loginMutation.mutateAsync({ username, password }),
    [loginMutation],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value: SuperAdminAuthContextValue = {
    session,
    isAuthenticated: Boolean(session?.token),
    isPending: loginMutation.isPending,
    login,
    logout,
  }

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  )
}

export function useSuperAdminAuth(): SuperAdminAuthContextValue {
  const ctx = useContext(SuperAdminAuthContext)
  if (!ctx) {
    throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider')
  }
  return ctx
}

/**
 * Route protection guard for all Super Admin panel routes.
 * Redirects unauthenticated users directly to `/crm-login`.
 */
export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSuperAdminAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/crm-login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
