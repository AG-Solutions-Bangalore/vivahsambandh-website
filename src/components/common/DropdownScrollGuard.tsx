/**
 * @file src/components/common/DropdownScrollGuard.tsx
 * Global wheel/touch isolation for open dropdowns.
 *
 * While a select, combobox or listbox is open, the page must not scroll: every
 * wheel gesture scrolls the dropdown's own option list instead, no matter
 * where the pointer is. This keeps the popup anchored to its trigger (it can
 * no longer drift with the page) and stops scroll chaining at the list edges.
 *
 * Mounted once at the app root so public pages and the admin panel share the
 * same behaviour. Scrolling inside the list is handled manually here rather
 * than left to the browser/Lenis, which otherwise smooth-scrolls the page
 * even when the page's native scroll was prevented.
 */

import { useEffect } from 'react'

const DROPDOWN_SELECTOR =
  '[data-slot="select-content"], [data-slot="combobox-content"], [role="listbox"]'

function isScrollable(node: HTMLElement): boolean {
  if (node.scrollHeight <= node.clientHeight) return false
  const overflowY = window.getComputedStyle(node).overflowY
  return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
}

/** The open (visible) dropdown surface, if any. */
function getOpenDropdown(): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(DROPDOWN_SELECTOR)
  for (const candidate of candidates) {
    if (candidate.getClientRects().length > 0) return candidate
  }
  return null
}

/** The element that actually owns the option scroll inside the dropdown. */
function getScrollContainer(dropdown: HTMLElement): HTMLElement {
  const preferred = dropdown.querySelector<HTMLElement>(
    '[data-slot="select-list"], [data-slot="combobox-list"]',
  )
  if (preferred && isScrollable(preferred)) return preferred

  if (isScrollable(dropdown)) return dropdown

  for (const node of dropdown.querySelectorAll<HTMLElement>('*')) {
    if (isScrollable(node)) return node
  }

  return preferred ?? dropdown
}

function wheelDelta(event: WheelEvent, container: HTMLElement): number {
  if (event.deltaMode === 1) return event.deltaY * 16
  if (event.deltaMode === 2) return event.deltaY * container.clientHeight
  return event.deltaY
}

export default function DropdownScrollGuard() {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const dropdown = getOpenDropdown()
      if (!dropdown) return

      // Stop both native page scrolling and Lenis before either can move the
      // page. The dropdown stays exactly where it is; its list takes the wheel.
      if (event.cancelable) event.preventDefault()
      event.stopImmediatePropagation()

      const container = getScrollContainer(dropdown)
      container.scrollTop += wheelDelta(event, container)
    }

    const onTouchMove = (event: TouchEvent) => {
      const dropdown = getOpenDropdown()
      if (!dropdown) return

      const target = event.target as Node | null
      if (target && dropdown.contains(target)) return

      if (event.cancelable) event.preventDefault()
    }

    window.addEventListener('wheel', onWheel, {
      passive: false,
      capture: true,
    })
    window.addEventListener('touchmove', onTouchMove, {
      passive: false,
      capture: true,
    })

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchmove', onTouchMove, { capture: true })
    }
  }, [])

  return null
}
