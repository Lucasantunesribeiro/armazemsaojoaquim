'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface LogoProps {
  className?: string
  priority?: boolean
  width?: number
  height?: number
  isScrolled?: boolean
  onClick?: () => void
  showText?: boolean
}

const Logo = memo(({ 
  className = "", 
  priority = false,
  width = 70,
  height = 70,
  isScrolled = false,
  onClick,
  showText = true
}: LogoProps) => {
  return (
    <Link 
      href="/" 
      className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-all duration-200 group"
      aria-label="Armazém São Joaquim - Página inicial"
      onClick={onClick}
    >
      {/* Logo Image */}
      <div className="relative">
        <Image
          src="/images/logo.jpg"
          alt="Armazém São Joaquim - Logo"
          width={width}
          height={height}
          className={`
            w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full object-cover
            ${isScrolled ? 'shadow-md' : 'shadow-lg ring-2 ring-white/20'}
            transition-all duration-300 group-hover:scale-105
            ${className}
          `}
          priority={priority}
          sizes="(max-width: 768px) 40px, (max-width: 1024px) 48px, 56px"
          style={{
            objectFit: 'cover',
          }}
        />
        
        {/* Indicator dot for restaurant status */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
      </div>

      {/* Logo Text - Responsive */}
      {showText && (
        <div className="hidden sm:flex flex-col">
          <span className={`
            font-bold text-sm md:text-base lg:text-lg leading-tight
            ${isScrolled 
              ? 'text-madeira-escura dark:text-cinza-claro' 
              : 'text-white drop-shadow-lg'
            }
            transition-colors duration-300
          `}>
            Armazém São Joaquim
          </span>
          <span className={`
            text-xs leading-tight font-medium
            ${isScrolled 
              ? 'text-amber-600 dark:text-amber-400' 
              : 'text-amber-200'
            }
            transition-colors duration-300
          `}>
            Desde 1854
          </span>
        </div>
      )}

      {/* Mobile simplified text */}
      {showText && (
        <div className="sm:hidden flex items-center">
          <span className={`
            font-bold text-sm leading-tight
            ${isScrolled 
              ? 'text-madeira-escura dark:text-cinza-claro' 
              : 'text-white drop-shadow-lg'
            }
            transition-colors duration-300
          `}>
            Armazém
          </span>
        </div>
      )}
    </Link>
  )
})

Logo.displayName = 'Logo'

export default Logo 