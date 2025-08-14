'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo, useState, useEffect, SyntheticEvent } from 'react'

interface LogoProps {
  className?: string
  priority?: boolean
  isScrolled?: boolean
  onClick?: () => void
  showText?: boolean
  size?: 'mobile' | 'desktop'
}

const Logo = memo(({ 
  className = "", 
  priority = false,
  isScrolled = false,
  onClick,
  showText = true,
  size = 'desktop'
}: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('❌ Erro ao carregar logo:', e.currentTarget.src)
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // Reset error state when component remounts
  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [])

  // Use fixed size for Next/Image and let Tailwind CSS control visual sizing
  const logoSize = 40 // corresponds to lg:w-10 lg:h-10 (largest responsive size)

  return (
    <Link prefetch={true} 
      href="/" 
      className={`
        group flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 md:gap-2 lg:gap-3
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
        rounded-lg p-0.5 -m-0.5
        ${className}
      `}
      aria-label="Armazém São Joaquim - Página inicial"
      onClick={onClick}
    >
      {/* Logo Image Container */}
      <div className="relative flex-shrink-0">
        <div className={`
          relative overflow-hidden rounded-lg
          transition-all duration-200
          ${isScrolled ? 'shadow-sm' : 'shadow-md'}
          ${!imageLoaded && !imageError ? 'animate-pulse bg-gray-200 dark:bg-gray-700' : ''}
        `}>
          {/* Primary Logo */}
          {!imageError && (
            <Image
              src="/images/logo.webp"
              alt="Armazém São Joaquim"
              width={logoSize}
              height={logoSize}
              className={`
                object-cover object-center rounded-lg
                transition-all duration-300 ease-out
                group-hover:scale-105
                ${isScrolled 
                  ? 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8' 
                  : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10'
                }
                ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
              `}
              priority={priority}
              quality={90}
              sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, (max-width: 1024px) 36px, 40px"
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={false}
            />
          )}
          
          {/* Emergency fallback - Logo antigo */}
          {imageError && (
            <Image
              src="/images/logo.jpg"
              alt="Armazém São Joaquim"
              width={logoSize}
              height={logoSize}
              className={`
                object-cover object-center rounded-lg
                transition-all duration-300 ease-out
                group-hover:scale-105
                ${isScrolled 
                  ? 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8' 
                  : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10'
                }
              `}
              priority={priority}
              quality={90}
              sizes="(max-width: 640px) 28px, (max-width: 768px) 32px, (max-width: 1024px) 36px, 40px"
              unoptimized={true}
              onError={() => {
                // Se nem o optimized funcionar, vamos mostrar a letra
                setImageError(true)
                setImageLoaded(false)
              }}
            />
          )}
          
          {/* Fallback final - Letra */}
          {imageError && !imageLoaded && (
            <div className={`
              flex items-center justify-center
              bg-gradient-to-br from-amber-500 to-orange-500
              text-white font-bold rounded-lg
              ${isScrolled 
                ? 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs' 
                : 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-sm'
              }
            `}>
              A
            </div>
          )}
        </div>
      </div>

      {/* Professional Typography */}
      {showText && (
        <div className="flex flex-col leading-tight min-w-0">
          {/* Restaurant Name */}
          <h1 className={`
            font-playfair font-bold text-gray-900 dark:text-white
            transition-all duration-200 truncate
            ${isScrolled 
              ? 'text-xs xs:text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl' 
              : 'text-sm xs:text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl'
            }
            group-hover:text-amber-700 dark:group-hover:text-amber-300
          `}>
            <span className="hidden xs:inline">Armazém São Joaquim</span>
            <span className="xs:hidden">Armazém</span>
          </h1>
          
          {/* Established Year */}
          <span className={`
            font-medium text-gray-600 dark:text-gray-400 tracking-wide
            transition-all duration-200 truncate
            group-hover:text-amber-600 dark:group-hover:text-amber-400
            ${isScrolled ? 'text-xs' : 'text-xs sm:text-sm'}
          `}>
            Desde 1854
          </span>
        </div>
      )}
    </Link>
  )
})

Logo.displayName = 'Logo'

export default Logo 