'use client'

import { memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Calendar, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import NavLink from '../atoms/NavLink'
import type { NavigationItem, NavigationItems } from '../../types/navigation'

interface MobileMenuProps {
  isOpen: boolean
  items: NavigationItems
  isActive: (href: string) => boolean
  user: any
  onSignOut: () => void
  onReservationClick: () => void
  onClose: () => void
  className?: string
}

const MobileMenu = memo(({ 
  isOpen, 
  items, 
  isActive, 
  user, 
  onSignOut, 
  onReservationClick, 
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

  const handleReservationClick = () => {
    onReservationClick()
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
<<<<<<< HEAD
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
                onClick={(e) => handleAuthRequiredClick(e, item)}
                isMobile={true}
              >
                {item.name}
              </NavLink>
            ))}
            {/* Botão destacado de login */}
            {!user && (
              <div className="pt-4">
                <a
                  href="/auth"
                  className="flex items-center justify-center space-x-3 w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 px-6 py-4 rounded-2xl font-bold transition-all duration-300 font-inter bg-white dark:bg-slate-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <User className="w-5 h-5" />
                  <span className="text-base">Entrar na conta</span>
                </a>
              </div>
            )}
          </div>
        </nav>
=======
      <div className="px-4 pt-2 pb-6 space-y-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-cinza-claro/20 dark:border-slate-700/20">
        {/* User Info in Mobile */}
        {user && (
          <div className="px-4 py-3 bg-cinza-claro dark:bg-slate-800 rounded-lg mb-4">
            <p className="text-sm font-medium text-madeira-escura dark:text-white font-inter truncate">
              {user.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-cinza-medio dark:text-slate-400 font-inter truncate">
              {user.email}
            </p>
          </div>
        )}

        {/* Navigation Links */}
        <nav role="navigation" aria-label="Menu de navegação mobile">
          {items.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              isActive={isActive(item.href)}
              requireAuth={item.requireAuth}
              hasAuth={!!user}
              onClick={(e) => handleAuthRequiredClick(e, item)}
              isMobile={true}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        
>>>>>>> db71da20d421fb713050462e83c63369986edb18
        {/* Mobile User Actions */}
        <div className="pt-4 space-y-2">
          {user ? (
            <>
              <button
                onClick={handleReservationClick}
                className="block w-full bg-amarelo-armazem hover:bg-vermelho-portas text-white font-semibold px-4 py-3 rounded-lg text-center transition-colors duration-200 font-inter focus-ring"
                aria-label="Fazer nova reserva"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Nova Reserva</span>
                </span>
              </button>
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
            </>
          ) : (
            <>
<<<<<<< HEAD
=======
              <Link
                href="/auth"
                className="block w-full border border-amarelo-armazem text-amarelo-armazem hover:bg-amarelo-armazem hover:text-white font-semibold px-4 py-3 rounded-lg text-center transition-colors duration-200 font-inter focus-ring"
                onClick={handleAuthClick}
                aria-label="Fazer login"
              >
                <span className="flex items-center justify-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Entrar</span>
                </span>
              </Link>
>>>>>>> db71da20d421fb713050462e83c63369986edb18
              <button
                onClick={handleReservationClick}
                className="block w-full bg-amarelo-armazem hover:bg-vermelho-portas text-white font-semibold px-4 py-3 rounded-lg text-center transition-colors duration-200 font-inter focus-ring"
                aria-label="Fazer reserva"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Reservar</span>
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

MobileMenu.displayName = 'MobileMenu'

export default MobileMenu 