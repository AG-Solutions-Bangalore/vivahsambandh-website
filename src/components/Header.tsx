import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { COMPANY } from '../constants/company'
import LanguageSwitcher from './LanguageSwitcher'
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from '../lib/gsap-setup'
import { lockPageScroll, unlockPageScroll } from '../lib/scroll'

function LotusMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 text-gold-600" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 3c2.5 3.2 4 6.4 4 9.2 2.8-.6 5.4-.4 8 .8-2.2 1.4-4.7 2-7.4 1.9 1.5 1.2 2.6 2.9 3.1 5-2.6.7-5.3.5-7.7-.5-2.4 1-5.1 1.2-7.7.5.5-2.1 1.6-3.8 3.1-5-2.7.1-5.2-.5-7.4-1.9 2.6-1.2 5.2-1.4 8-.8 0-2.8 1.5-6 4-9.2z"
      />
      <ellipse cx="16" cy="27" rx="9" ry="1.6" fill="currentColor" opacity=".35" />
    </svg>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)

  // Entrance + hide-on-scroll-down (auto-show on scroll-up / at top).
  useGSAP(
    () => {
      const header = headerRef.current
      if (!header || prefersReducedMotion()) return

      // Entrance: slide down once (transform only — no layout shift).
      gsap.from(header, {
        y: -72,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
        overwrite: 'auto',
      })

      // Hide on scroll down, reveal on scroll up. Disabled while the
      // mobile drawer is open (tracked via data attribute below).
      // State-guarded: Lenis fires scroll events every frame, so only
      // create a tween when visibility actually flips — otherwise hundreds
      // of killed/reborn tweens churn per scroll (jank + flicker).
      let hidden = false
      const setHidden = (next: boolean) => {
        if (hidden === next) return
        hidden = next
        gsap.to(header, {
          yPercent: next ? -110 : 0,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
      const trigger = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (header.dataset.drawerOpen === 'true') return
          if (self.scroll() <= 80) {
            setHidden(false)
            return
          }
          if (self.direction === 1) setHidden(true)
          else if (self.direction === -1) setHidden(false)
        },
      })

      return () => {
        trigger.kill()
      }
    },
    { scope: headerRef },
  )

  // Lock smooth-scroll + background scroll while the mobile drawer is open.
  // NOTE: side-effects stay outside the setState updater (StrictMode
  // double-invokes updaters — locking inside would lock/unlock twice).
  const toggleDrawer = () => {
    const next = !open
    setOpen(next)
    if (headerRef.current) headerRef.current.dataset.drawerOpen = String(next)
    if (next) lockPageScroll()
    else unlockPageScroll()
  }
  const closeDrawer = () => {
    setOpen(false)
    if (headerRef.current) headerRef.current.dataset.drawerOpen = 'false'
    unlockPageScroll()
  }

  const navItems = [
    { label: t('header.home'), href: '#' },
    { label: t('header.about'), href: '#about' },
    { label: t('header.search'), href: '#search' },
    { label: t('header.successStories'), href: '#stories' },
    { label: t('header.membership'), href: '#explore-features' },
    { label: t('header.faq'), href: '#all-faq' },
    { label: t('header.contact'), href: '#contact' },
  ]

  return (
    <header
      ref={headerRef}
      data-drawer-open="false"
      className="sticky top-0 z-50 border-b border-gold-500/25 bg-cream-50/90 backdrop-blur will-change-transform"
    >
      <div className="section-pad flex h-16 items-center justify-between gap-3">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 transition hover:opacity-95">
          <LotusMark />
          <span className="leading-none">
            <span className="font-display block text-lg font-bold text-navy-900 sm:text-xl">
              {COMPANY.name}
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-gold-700 sm:text-[10px]">
              {t('meta.tagline')}
            </span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-navy-900/80 lg:flex" aria-label="Primary">
          {navItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={`transition hover:text-maroon-600 ${
                i === 0
                  ? 'font-bold text-maroon-600 underline decoration-gold-500 decoration-2 underline-offset-8'
                  : ''
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Controls: Language Switcher, Login, Create Profile */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageSwitcher />
          <a
            href="#login"
            className="rounded-full px-3.5 py-2 text-sm font-semibold text-navy-900 transition hover:bg-gold-100"
          >
            {t('header.login')}
          </a>
          <a href="#register" className="btn-primary !px-5 !py-2 text-[13px]">
            {t('header.createProfile')}
          </a>
        </div>

        {/* Mobile Menu Button & Language Switcher */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={toggleDrawer}
            aria-expanded={open}
            aria-label="Menu"
            className="rounded-full border border-gold-500/40 p-2 text-navy-900 hover:bg-gold-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <nav className="border-t border-gold-500/25 bg-cream-50 px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1 text-sm font-medium text-navy-900">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={closeDrawer}
                  className="block rounded-xl px-3 py-2 transition hover:bg-gold-100 hover:text-maroon-600"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2 border-t border-gold-500/20 pt-3">
            <a href="#login" onClick={closeDrawer} className="btn-gold flex-1 !py-2 text-[13px]">
              {t('header.login')}
            </a>
            <a href="#register" onClick={closeDrawer} className="btn-primary flex-1 !py-2 text-[13px]">
              {t('header.createProfile')}
            </a>
          </div>
        </nav>
      )}
    </header>
  )
}
