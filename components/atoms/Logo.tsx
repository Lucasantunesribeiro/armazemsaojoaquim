'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

interface LogoProps {
  className?: string
  priority?: boolean
  width?: number
  height?: number
}

const Logo = memo(({ 
  className = "h-12 w-auto", 
  priority = false,
  width = 120,
  height = 48
}: LogoProps) => {
  return (
    <Link 
      href="/" 
      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      aria-label="Armazém São Joaquim - Página inicial"
    >
      <Image
        src="/images/logo.jpg"
        alt="Armazém São Joaquim - Logo"
        width={width}
        height={height}
        className={className}
        priority={priority}
        sizes="(max-width: 768px) 100px, 120px"
        style={{
          objectFit: 'contain',
        }}
      />
    </Link>
  )
})

Logo.displayName = 'Logo'

export default Logo 