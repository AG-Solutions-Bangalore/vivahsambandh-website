/**
 * Registry for progressively-mounted homepage sections.
 *
 * Deferred sections register their mount callback here so anchor navigation
 * (header links, deep links) can mount a below-fold section on demand
 * before scrolling to it. Mounts happen once; chunks stay cached.
 */

/** Anchor ids rendered inside deferred homepage sections. */
export const DEFERRED_SECTION_IDS = new Set([
  'about',
  'communities',
  'search',
  'explore-features',
  'stories',
  'blogs-featured',
  'blogs-front',
  'contact',
  'faq',
])

type MountFn = () => void

const mounters = new Map<string, MountFn>()
const readyWaiters = new Map<string, Array<() => void>>()

/** Register a section's mount callback (called by DeferredSection). */
export function registerSectionMounter(id: string, mount: MountFn): () => void {
  mounters.set(id, mount)
  return () => {
    if (mounters.get(id) === mount) mounters.delete(id)
  }
}

/** Mount a deferred section immediately (no-op if unknown/already mounted). */
export function mountSection(id: string): void {
  mounters.get(id)?.()
}

function notifyReady(id: string): void {
  const waiters = readyWaiters.get(id)
  if (waiters) {
    readyWaiters.delete(id)
    waiters.forEach((fn) => fn())
  }
}

/** Called by a section instance once its real content has mounted. */
export function markSectionReady(id: string): void {
  notifyReady(id)
}

/**
 * Resolve when the section's anchor element exists in the DOM.
 * Triggers the mount if needed; never hangs (timeout fallback).
 */
export function whenSectionReady(id: string, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document !== 'undefined') {
      const el =
        document.getElementById(id) ??
        document.querySelector(`#${CSS.escape(id)}`)
      if (el) {
        resolve()
        return
      }
    }
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        resolve()
      }
    }
    const list = readyWaiters.get(id) ?? []
    list.push(finish)
    readyWaiters.set(id, list)
    mountSection(id)
    setTimeout(finish, timeoutMs)
  })
}
