/**
 * @file src/module/super-admin/context/SuperAdminAuthContext.tsx
 * Authentication state provider and route guard for Super Admin Panel.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  clearSession,
  getStoredSession,
  superAdminLogin,
} from '../services/adminApi'
import type { SuperAdminSession } from '../types'

interface SuperAdminAuthContextValue {
  session: SuperAdminSession | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{
    success: boolean
    message: string
    isInactiveProfile?: boolean
  }>
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

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await superAdminLogin(username, password)
      if (result.success && result.session) {
        setSession(result.session)
      }
      return result
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value: SuperAdminAuthContextValue = {
    session,
    isAuthenticated: Boolean(session?.token),
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
 * Redirects unauthenticated users directly to `/panel-login`.
 */
export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSuperAdminAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/panel-login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
