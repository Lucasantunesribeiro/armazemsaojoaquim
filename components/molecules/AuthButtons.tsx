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
          ${isScrolled 
            ? 'border border-amarelo-armazem text-amarelo-armazem hover:bg-amarelo-armazem hover:text-white' 
            : 'border border-white text-white hover:bg-white hover:text-amarelo-armazem'
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
          ${isScrolled 
            ? 'bg-amarelo-armazem hover:bg-vermelho-portas text-white shadow-lg' 
            : 'bg-white/90 text-amarelo-armazem hover:bg-white hover:text-vermelho-portas shadow-lg'
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