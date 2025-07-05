'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import NavLink from '../atoms/NavLink'
import type { NavigationItem, NavigationItems } from '../../types/navigation'

interface NavigationProps {
  items: NavigationItems
  isScrolled: boolean
  isActive: (href: string) => boolean
  user: any
  className?: string
}

const Navigation = memo(({ items, isScrolled, isActive, user, className = '' }: NavigationProps) => {
  const router = useRouter()

  const handleAuthRequiredClick = (e: React.MouseEvent, item: NavigationItem) => {
    if (item.requireAuth && !user) {
      e.preventDefault()
      toast.error('Faça login para acessar as reservas')
      router.push('/auth')
    }
  }

  return (
    <nav className={`hidden md:flex items-center space-x-8 ${className}`} role="navigation">
      {items.map((item) => (
        <NavLink
          key={item.name}
          href={item.href}
          isActive={isActive(item.href)}
          isScrolled={isScrolled}
          requireAuth={item.requireAuth}
          hasAuth={!!user}
          external={item.external}
          onClick={(e) => handleAuthRequiredClick(e, item)}
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  )
})

Navigation.displayName = 'Navigation'

export default Navigation 