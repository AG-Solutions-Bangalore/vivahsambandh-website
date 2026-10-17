/**
 * @file src/lib/firebase.ts
 * Firebase initialization and Auth provider for VivahSambandh.
 * Configured for phone number OTP verification.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: 'AIzaSyBKOvMYrzPXR7wmHWamKM4c-F1a8JUDQAs',
  authDomain: 'vivah-sambandh.firebaseapp.com',
  projectId: 'vivah-sambandh',
  storageBucket: 'vivah-sambandh.firebasestorage.app',
  messagingSenderId: '349131421979',
  appId: '1:349131421979:web:50d3d080f7078c36a97bbe',
  measurementId: 'G-7XQB56PJJ5',
}

// Singleton Firebase App instance
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig)

// Auth instance safe for SSR/prerendering
export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null
  return getAuth(app)
}
