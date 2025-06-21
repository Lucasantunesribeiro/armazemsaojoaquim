'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo, useState } from 'react'

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
        group flex items-center gap-3
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
        `}>
          <Image
            src={imageError ? "/images/placeholder.svg" : "/images/logo.jpg"}
            alt="Armazém São Joaquim"
            width={logoSize}
            height={logoSize}
            className={`
              object-cover object-center rounded-lg
              transition-all duration-300 ease-out
              ${isScrolled ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-9 h-9 sm:w-10 sm:h-10'}
              group-hover:scale-105
            `}
            priority={priority}
            quality={90}
            sizes="(max-width: 640px) 36px, 44px"
            onError={() => setImageError(true)}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Cc5xmwBcDvvGgKOeT7/8AhLLdwxWfILvUP//Z"
          />
        </div>
      </div>

      {/* Professional Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          {/* Restaurant Name */}
          <h1 className={`
            font-playfair font-bold text-gray-900
            transition-all duration-200
            ${isScrolled 
              ? 'text-lg sm:text-xl' 
              : 'text-xl sm:text-2xl'
            }
            group-hover:text-amber-700
          `}>
            Armazém São Joaquim
          </h1>
          
          {/* Established Year */}
          <span className={`
            text-xs font-medium text-gray-600 tracking-wide
            transition-all duration-200
            group-hover:text-amber-600
            ${isScrolled ? 'text-xs' : 'text-sm'}
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