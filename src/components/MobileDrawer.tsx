import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer'
import { Link } from 'react-router-dom'
import StoreBadge from './StoreBadge'
import type { NavItem } from '../constants/navigation'
import type { TFunction } from 'i18next'

interface MobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  navItems: NavItem[]
  closeDrawer: () => void
  t: TFunction
}

export default function MobileDrawer({
  open,
  onOpenChange,
  navItems,
  closeDrawer,
  t,
}: MobileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="rounded-t-3xl border-gold-500/30 bg-cream-50 text-navy-900">
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <nav
          aria-label="Mobile"
          className="max-h-[82dvh] overflow-y-auto px-4 pt-1 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        >
          <ul className="grid gap-1 text-[15px] font-medium">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.href}
                  onClick={closeDrawer}
                  title={item.label}
                  aria-current={item.active ? 'page' : undefined}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-gold-100 hover:text-maroon-600 ${
                    item.active ? 'bg-gold-100 font-bold text-maroon-600' : ''
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-gold-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-2.5 border-t border-gold-500/20 pt-4">
            <div className="px-1">
              <span className="text-gold-600 text-xs font-bold block" aria-hidden="true">
                ✦
              </span>
              <p className="font-display text-sm font-bold text-navy-950">
                {t('app.eyebrow')}
              </p>
              <p className="text-[11px] text-ink-600 font-medium">
                {t('app.title')}
              </p>
            </div>
            <div className="flex gap-2">
              <StoreBadge store="play" className="flex-1 justify-center !px-3" />
              <StoreBadge store="apple" className="flex-1 justify-center !px-3" />
            </div>
          </div>
          <div className="mt-3 border-t border-gold-500/20 pt-4">
            <Link
              to={navItems.some((n) => n.href.startsWith('/hi')) ? '/hi/registration' : '/registration'}
              onClick={closeDrawer}
              title={t('header.createProfile')}
              className="btn-primary block w-full !py-3 text-sm font-bold text-center"
            >
              {t('header.createProfile')}
            </Link>
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
