import { Drawer, DrawerContent, DrawerTitle } from './ui/drawer'
import { Link } from 'react-router-dom'
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
          <div className="mt-3 flex gap-2 border-t border-gold-500/20 pt-4">
            <a
              href="#login"
              onClick={closeDrawer}
              title={t('header.login')}
              className="btn-gold flex-1 !py-2.5 text-sm text-center"
            >
              {t('header.login')}
            </a>
            <Link
              to={navItems.some((n) => n.href.startsWith('/hi')) ? '/hi/registration' : '/registration'}
              onClick={closeDrawer}
              title={t('header.createProfile')}
              className="btn-primary flex-1 !py-2.5 text-sm text-center"
            >
              {t('header.createProfile')}
            </Link>
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}
