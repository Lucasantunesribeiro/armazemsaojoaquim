'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface LogoProps {
  isScrolled?: boolean
  onClick?: () => void
  className?: string
}

const Logo = memo(({ isScrolled = false, onClick, className = '' }: LogoProps) => {
  return (
    <Link 
      href="/" 
      className={`flex items-center space-x-3 group transition-all duration-200 ${className}`}
      onClick={onClick}
      aria-label="Armazém São Joaquim - Página inicial"
    >
      <Image 
        src="/images/logo.jpg" 
        alt="Logo Armazém São Joaquim" 
        width={50} 
        height={50} 
        className="rounded-full transition-transform duration-200 group-hover:scale-105" 
        priority
      />
      <div className="flex flex-col">
        <span className={`
          text-xl font-bold transition-colors duration-200 font-playfair
          ${isScrolled 
            ? 'text-amarelo-armazem dark:text-amarelo-armazem' 
            : 'text-white dark:text-amarelo-armazem'
          }
          group-hover:text-vermelho-portas dark:group-hover:text-vermelho-portas
        `}>
          Armazém São Joaquim
        </span>
        <span className={`
          text-xs transition-colors duration-200 font-inter italic
          ${isScrolled 
            ? 'text-madeira-escura dark:text-cinza-medio' 
            : 'text-white/90 dark:text-cinza-claro'
          }
          group-hover:text-madeira-clara dark:group-hover:text-cinza-claro
        `}>
          "En esta casa tenemos memoria"
        </span>
      </div>
    </Link>
  )
})

Logo.displayName = 'Logo'

export default Logo 