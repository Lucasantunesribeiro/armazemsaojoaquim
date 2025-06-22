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

  // Clean, professional sizing
  const getLogoSize = () => {
    if (size === 'mobile') {
      return isScrolled ? 32 : 36
    }
    return isScrolled ? 36 : 40
  }

  const logoSize = getLogoSize()

  return (
    <Link 
      href="/" 
      className={`
        group flex items-center gap-2 sm:gap-3
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
        rounded-lg p-1 -m-1
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
              src="/images/logo-optimized.jpg"
              alt="Armazém São Joaquim"
              width={logoSize}
              height={logoSize}
              className={`
                object-cover object-center rounded-lg
                transition-all duration-300 ease-out
                group-hover:scale-105
                ${isScrolled 
                  ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9' 
                  : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'
                }
                ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
              `}
              priority={priority}
              quality={90}
              sizes="(max-width: 640px) 32px, (max-width: 768px) 36px, 40px"
              onError={handleImageError}
              onLoad={handleImageLoad}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Cc5xmwBcDvvGgKOeT7/8AhLLdwxWfILvUP//Z"
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
                  ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9' 
                  : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'
                }
              `}
              priority={priority}
              quality={90}
              sizes="(max-width: 640px) 32px, (max-width: 768px) 36px, 40px"
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
                ? 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-xs sm:text-sm' 
                : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-sm sm:text-base'
              }
            `}>
              A
            </div>
          )}
        </div>
      </div>

      {/* Professional Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          {/* Restaurant Name */}
          <h1 className={`
            font-playfair font-bold text-gray-900 dark:text-white
            transition-all duration-200
            ${isScrolled 
              ? 'text-sm sm:text-base md:text-lg' 
              : 'text-base sm:text-lg md:text-xl'
            }
            group-hover:text-amber-700 dark:group-hover:text-amber-300
          `}>
            <span className="hidden sm:inline">Armazém São Joaquim</span>
            <span className="sm:hidden">Armazém</span>
          </h1>
          
          {/* Established Year */}
          <span className={`
            font-medium text-gray-600 dark:text-gray-400 tracking-wide
            transition-all duration-200
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