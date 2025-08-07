'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoSimpleProps {
  className?: string
  isScrolled?: boolean
  onClick?: () => void
  showText?: boolean
}

const LogoSimple = ({ 
  className = "", 
  isScrolled = false,
  onClick,
  showText = true
}: LogoSimpleProps) => {
  // Use fixed size for Next/Image and let Tailwind CSS control visual sizing
  const logoSize = 40 // balanced size for good visibility

  return (
    <Link prefetch={true} 
      href="/" 
      className={`group flex items-center gap-2 sm:gap-3 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg p-1 -m-1 ${className}`}
      aria-label="Armazém São Joaquim - Página inicial"
      onClick={onClick}
    >
      {/* Logo Image Container */}
      <div className="relative flex-shrink-0">
        <Image
          src="/images/logo-optimized.jpg"
          alt="Armazém São Joaquim"
          width={logoSize}
          height={logoSize}
          className={`object-cover object-center rounded-lg transition-all duration-300 ease-out group-hover:scale-105 ${isScrolled 
            ? '!w-7 !h-7 sm:!w-8 sm:!h-8 md:!w-9 md:!h-9 lg:!w-10 lg:!h-10' 
            : '!w-8 !h-8 sm:!w-9 sm:!h-9 md:!w-10 md:!h-10 lg:!w-11 lg:!h-11 xl:!w-12 xl:!h-12'
          }`}
          priority={true}
          quality={90}
          sizes="(max-width: 640px) 32px, (max-width: 768px) 36px, (max-width: 1024px) 40px, (max-width: 1280px) 44px, 48px"
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <h1 className={`font-playfair font-bold text-gray-900 dark:text-white transition-all duration-200 group-hover:text-amber-700 dark:group-hover:text-amber-300 ${isScrolled 
            ? 'text-sm sm:text-base md:text-lg' 
            : 'text-base sm:text-lg md:text-xl'
          }`}>
            <span className="hidden sm:inline">Armazém São Joaquim</span>
            <span className="sm:hidden">Armazém</span>
          </h1>
          
          <span className={`font-medium text-gray-600 dark:text-gray-400 tracking-wide transition-all duration-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 ${isScrolled ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Desde 1854
          </span>
        </div>
      )}
    </Link>
  )
}

export default LogoSimple 