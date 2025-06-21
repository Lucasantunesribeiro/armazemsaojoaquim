'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface LogoProps {
  className?: string
  priority?: boolean
  isScrolled?: boolean
  onClick?: () => void
  showText?: boolean
}

const Logo = memo(({ 
  className = "", 
  priority = false,
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
      <div className="relative flex-shrink-0">
        <Image
          src="/images/logo.webp"
          alt="Armazém São Joaquim - Logo"
          width={40}
          height={40}
          className={`
            w-8 h-8 md:w-10 md:h-10 rounded-full object-cover
            ${isScrolled ? 'shadow-md' : 'shadow-lg ring-2 ring-white/20'}
            transition-all duration-300 group-hover:scale-105
            ${className}
          `}
          priority={priority}
          sizes="(max-width: 768px) 32px, 40px"
        />
        
        {/* Status indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="hidden sm:flex flex-col min-w-0">
          <span className={`
            font-bold text-sm md:text-base lg:text-lg leading-tight truncate
            ${isScrolled 
              ? 'text-slate-900 dark:text-slate-100' 
              : 'text-white drop-shadow-lg'
            }
            transition-colors duration-300
          `}>
            Armazém São Joaquim
          </span>
          <span className={`
            text-xs leading-tight font-medium truncate
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
              ? 'text-slate-900 dark:text-slate-100' 
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