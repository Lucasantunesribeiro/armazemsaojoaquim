'use client'

import { memo, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Menu, BookOpen, MapPin } from 'lucide-react'
import { useMobileMenu } from '../providers/MobileMenuProvider'

interface BottomNavItem {
  name: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  isButton?: boolean
  onClick?: () => void
}

const BottomNavigation = memo(() => {
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu()
  const pathname = usePathname()

  const isActive = useMemo(() => (href: string) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }, [pathname])

  if (isMobileMenuOpen) return null

  const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
    { name: 'Início', href: '/', icon: Home },
    { name: 'Menu', icon: Menu, isButton: true, onClick: toggleMobileMenu },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contato', icon: MapPin, isButton: true, onClick: () => window.open('https://wa.me/5521994099166', '_blank') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="flex items-center justify-around py-2 px-2 safe-area-padding-bottom">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          
          if (item.isButton) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className="
                  flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-target-lg
                  min-w-0 flex-1 relative group
                  text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20
                  active:scale-95 transform
                "
                aria-label={item.name}
              >
                <Icon 
                  className="
                    w-5 h-5 mb-1 transition-all duration-200
                    group-hover:scale-105
                  "
                />
                <span className="
                  text-xs font-medium leading-tight transition-all duration-200 text-center
                ">
                  {item.name}
                </span>
              </button>
            )
          }

          const active = isActive(item.href!)
          
          return (
            <Link prefetch={true}
              key={item.href}
              href={item.href!}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-target-lg
                min-w-0 flex-1 relative group
                ${active 
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                }
                active:scale-95 transform
              `}
              aria-label={item.name}
            >
              <Icon 
                className={`
                  w-5 h-5 mb-1 transition-all duration-200
                  ${active ? 'scale-110' : 'group-hover:scale-105'}
                `} 
              />
              <span className={`
                text-xs font-medium leading-tight transition-all duration-200 text-center
                ${active ? 'font-semibold' : ''}
              `}>
                {item.name}
              </span>
              
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-600 dark:bg-amber-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-slate-900"></div>
    </nav>
  )
})

BottomNavigation.displayName = 'BottomNavigation'

export default BottomNavigation 