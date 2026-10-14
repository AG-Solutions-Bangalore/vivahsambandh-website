import { useSyncExternalStore } from 'react'
import i18n, { getAppLanguage, setAppLanguage, type AppLang } from './index'

interface LangSnapshot {
  /** Last fully-applied language. */
  lang: AppLang
  /** Language currently being applied (null when idle). */
  pending: AppLang | null
}

// Single shared snapshot — desktop + mobile switchers and all sections
// always agree, including mid-transition.
let snapshot: LangSnapshot = { lang: getAppLanguage(), pending: null }
const listeners = new Set<() => void>()
const emit = () => {
  listeners.forEach((l) => l())
}

// Keep the store in sync with i18next itself (init detection, external
// changes). An in-flight pending flag survives unless it matches the new
// language — so rapid clicks never flash a stale pill.
i18n.on('languageChanged', (lng: string) => {
  const next: AppLang = lng === 'hi' ? 'hi' : 'en'
  snapshot = {
    lang: next,
    pending: snapshot.pending === next ? null : snapshot.pending,
  }
  emit()
})

// Monotonic request id — concurrent switches collapse, latest click wins.
let requestSeq = 0

/**
 * Switch language. Safe to spam-click: superseded requests exit silently
 * and only the latest click commits state. Never leaves a stuck pending
 * flag — even if changeLanguage rejects, `finally` reconciles with i18next.
 */
export function switchAppLanguage(lng: AppLang): void {
  const mySeq = ++requestSeq
  if (snapshot.lang === lng && snapshot.pending === null) return
  snapshot = { ...snapshot, pending: lng }
  emit()
  void setAppLanguage(lng).finally(() => {
    if (mySeq !== requestSeq) return
    snapshot = { lang: getAppLanguage(), pending: null }
    emit()
  })
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): LangSnapshot {
  return snapshot
}

/**
 * Reactive `{ lang, pending, switchTo }` for switchers and sections.
 * `pending` drives the in-flight pill state (pulse + aria-busy).
 */
export function useAppLanguage() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return { lang: snap.lang, pending: snap.pending, switchTo: switchAppLanguage }
}
