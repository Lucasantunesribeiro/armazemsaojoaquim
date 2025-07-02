'use client'

import { memo } from 'react'
import Link from 'next/link'
import { User, Calendar } from 'lucide-react'

interface AuthButtonsProps {
  isScrolled: boolean
  onReservationClick: () => void
  className?: string
}

const AuthButtons = memo(({ isScrolled, onReservationClick, className = '' }: AuthButtonsProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Link
        href="/auth"
        className={`
          inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg
          transition-all duration-200 hover:scale-105 cursor-pointer font-inter focus-ring
<<<<<<< HEAD
          touch-manipulation min-h-[44px] min-w-[44px]
          ${isScrolled 
            ? 'border border-amarelo-armazem text-amarelo-armazem hover:bg-amarelo-armazem hover:text-white dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-500 dark:hover:text-white' 
            : 'border border-white text-white hover:bg-white hover:text-amarelo-armazem dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-900'
=======
          ${isScrolled 
            ? 'border border-amarelo-armazem text-amarelo-armazem hover:bg-amarelo-armazem hover:text-white' 
            : 'border border-white text-white hover:bg-white hover:text-amarelo-armazem'
>>>>>>> db71da20d421fb713050462e83c63369986edb18
          }
          backdrop-blur-sm
        `}
        aria-label="Fazer login"
      >
        <User className="w-4 h-4 mr-2" />
        <span>Entrar</span>
      </Link>
      <button
        onClick={onReservationClick}
        className={`
          inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg
          transition-all duration-200 hover:scale-105 cursor-pointer font-inter focus-ring
<<<<<<< HEAD
          touch-manipulation min-h-[44px] min-w-[44px]
          ${isScrolled 
            ? 'bg-amarelo-armazem hover:bg-vermelho-portas text-white shadow-lg dark:bg-amber-500 dark:hover:bg-amber-600' 
            : 'bg-white/90 text-amarelo-armazem hover:bg-white hover:text-vermelho-portas shadow-lg dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-100'
=======
          ${isScrolled 
            ? 'bg-amarelo-armazem hover:bg-vermelho-portas text-white shadow-lg' 
            : 'bg-white/90 text-amarelo-armazem hover:bg-white hover:text-vermelho-portas shadow-lg'
>>>>>>> db71da20d421fb713050462e83c63369986edb18
          }
          backdrop-blur-sm border-0
        `}
        aria-label="Fazer reserva"
      >
        <Calendar className="w-4 h-4 mr-2" />
        <span>Reservar</span>
      </button>
    </div>
  )
})

AuthButtons.displayName = 'AuthButtons'

export default AuthButtons 