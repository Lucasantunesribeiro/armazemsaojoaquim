'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import NavLink from '../atoms/NavLink'
import type { NavigationItem, NavigationItems } from '../../types/navigation'

interface MobileMenuProps {
  isOpen: boolean
  items: NavigationItems
  isActive: (href: string) => boolean
  user: any
  onSignOut: () => void

  onClose: () => void
  className?: string
}

const MobileMenu = memo(({ 
  isOpen, 
  items, 
  isActive, 
  user, 
  onSignOut, 
  onClose,
  className = '' 
}: MobileMenuProps) => {
  const router = useRouter()

  const handleAuthRequiredClick = (e: React.MouseEvent, item: NavigationItem) => {
    if (item.requireAuth && !user) {
      e.preventDefault()
      onClose()
      toast.error('Faça login para acessar as reservas')
      router.push('/auth')
    } else {
      onClose()
    }
  }

  const handleAuthClick = () => {
    onClose()
  }



  const handleSignOut = () => {
    onSignOut()
    onClose()
  }

  return (
    <div className={`
      md:hidden transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'max-h-screen opacity-100' 
        : 'max-h-0 opacity-0 pointer-events-none'
      }
      overflow-hidden ${className}
    `}>
      <div className="p-6 space-y-6 flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-cinza-claro/20 dark:border-slate-700/20">
        {/* Header do menu */}
        <div className="flex items-center justify-between">
          {/* ...logo e botão fechar... */}
        </div>
        {/* Links e botão login juntos */}
        <nav className="flex-1 flex flex-col justify-start">
          <div className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.name}
                href={item.href}
                isActive={isActive(item.href)}
                requireAuth={item.requireAuth}
                hasAuth={!!user}
                external={item.external}
                onClick={(e) => handleAuthRequiredClick(e, item)}
                isMobile={true}
              >
                {item.name}
              </NavLink>
            ))}
            {/* Botão destacado de login */}
            {!user && (
              <div className="pt-4">
                <Link
                  href="/auth"
                  className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
        {/* Mobile User Actions */}
        <div className="pt-4 space-y-2">
          {user && (
            <button
              onClick={handleSignOut}
              className="block w-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold px-4 py-3 rounded-lg text-center transition-colors duration-200 font-inter focus-ring"
              aria-label="Fazer logout"
            >
              <span className="flex items-center justify-center space-x-2">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

MobileMenu.displayName = 'MobileMenu'

export default MobileMenu 