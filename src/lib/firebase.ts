/**
 * @file src/lib/firebase.ts
 * Firebase initialization and Auth provider for Vivah Sambandh.
 * Configured for phone number OTP verification.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

export const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ||
    'AIzaSyBKOvMYrzPXR7wmHWamKM4c-F1a8JUDQAs',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ||
    'vivah-sambandh.firebaseapp.com',
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ||
    'vivah-sambandh',
  storageBucket:
    (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) ||
    'vivah-sambandh.firebasestorage.app',
  messagingSenderId:
    (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ||
    '349131421979',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ||
    '1:349131421979:web:50d3d080f7078c36a97bbe',
  measurementId:
    (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ||
    'G-7XQB56PJJ5',
}

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig)

/* ------------------------------------------------------------------ */
/* [OTP-DIAG] Temporary diagnostics — remove after root cause is found */
/* ------------------------------------------------------------------ */
const maskKey = (key?: string) =>
  key && key.length > 12 ? `${key.slice(0, 8)}…${key.slice(-4)}` : '(missing)'

export const logFirebaseDiagnostics = () => {
  if (typeof window === 'undefined') return
  const env = import.meta.env
  console.log('[OTP-DIAG] firebase-config', {
    sources: {
      apiKey: env.VITE_FIREBASE_API_KEY ? 'env' : 'fallback',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ? 'env' : 'fallback',
      projectId: env.VITE_FIREBASE_PROJECT_ID ? 'env' : 'fallback',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ? 'env' : 'fallback',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'env' : 'fallback',
      appId: env.VITE_FIREBASE_APP_ID ? 'env' : 'fallback',
    },
    resolved: {
      apiKey: maskKey(firebaseConfig.apiKey),
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
    },
    authDomainMatchesProject:
      firebaseConfig.authDomain === `${firebaseConfig.projectId}.firebaseapp.com`,
    origin: window.location.origin,
    hostname: window.location.hostname,
  })
}

if (typeof window !== 'undefined') logFirebaseDiagnostics()

// Auth instance safe for SSR/prerendering
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null
  return getAuth(app)
}

if (typeof window !== 'undefined') {
  console.log('[Firebase Init] Loaded project configuration:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId,
    currentOrigin: window.location.origin,
  })
}
