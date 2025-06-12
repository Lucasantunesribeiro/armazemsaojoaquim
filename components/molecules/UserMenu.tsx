'use client'

import { memo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LogOut, Calendar, ChevronDown, Clock, Users } from 'lucide-react'
import { useUserReservations, type UserReservation } from '../../lib/hooks/useUserReservations'

interface UserMenuProps {
  user: any
  isScrolled: boolean
  onSignOut: () => void
  onReservationClick: () => void
  className?: string
}

const UserMenu = memo(({ user, isScrolled, onSignOut, onReservationClick, className = '' }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { userReservations, isLoadingReservations, formatDate, getStatusColor, getStatusText } = useUserReservations()

  // Fechar menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMenuToggle = () => setIsOpen(prev => !prev)
  const handleMenuClose = () => setIsOpen(false)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={handleMenuToggle}
        className={`
          flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg
          transition-all duration-200 hover:scale-105 cursor-pointer font-inter
          ${isScrolled 
            ? 'bg-amarelo-armazem hover:bg-vermelho-portas text-white shadow-lg' 
            : 'bg-white/90 text-amarelo-armazem hover:bg-white hover:text-vermelho-portas shadow-lg'
          }
          backdrop-blur-sm border-0 focus-ring
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Menu do usuário ${userName}`}
      >
        <User className="w-4 h-4" />
        <span className="max-w-32 truncate">{userName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-cinza-claro dark:border-slate-700 py-2 z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-cinza-claro dark:border-slate-700">
            <p className="text-sm font-medium text-madeira-escura dark:text-white font-inter truncate">
              {user?.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-cinza-medio dark:text-slate-400 font-inter truncate">
              {user?.email}
            </p>
          </div>

          {/* User Reservations */}
          <div className="px-4 py-3 border-b border-cinza-claro dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-madeira-escura dark:text-white font-inter">
                Minhas Reservas
              </h4>
              <Link
                href="/reservas"
                className="text-xs text-amarelo-armazem hover:text-vermelho-portas font-inter transition-colors"
                onClick={handleMenuClose}
              >
                Ver todas
              </Link>
            </div>
            
            {isLoadingReservations ? (
              <div className="text-xs text-cinza-medio dark:text-slate-400 font-inter">
                Carregando reservas...
              </div>
            ) : userReservations.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {userReservations.map((reservation: UserReservation) => (
                  <div 
                    key={reservation.id}
                    className="bg-cinza-claro dark:bg-slate-700 rounded-lg p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-madeira-escura dark:text-white font-inter">
                        {formatDate(reservation.data)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-cinza-medio dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{reservation.horario}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{reservation.pessoas} pessoas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-cinza-medio dark:text-slate-400 font-inter">
                Nenhuma reserva encontrada
              </div>
            )}
          </div>

          {/* Menu Actions */}
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => {
                onReservationClick()
                handleMenuClose()
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-amarelo-armazem hover:text-vermelho-portas hover:bg-cinza-claro dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 font-inter"
            >
              <Calendar className="w-4 h-4" />
              <span>Nova Reserva</span>
            </button>
            <button
              onClick={() => {
                onSignOut()
                handleMenuClose()
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 font-inter"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

UserMenu.displayName = 'UserMenu'

export default UserMenu 