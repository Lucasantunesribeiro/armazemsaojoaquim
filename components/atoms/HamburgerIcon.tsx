'use client'

import { memo } from 'react'

interface HamburgerIconProps {
  isOpen: boolean
  className?: string
}

const HamburgerIcon = memo(({ isOpen, className = '' }: HamburgerIconProps) => {
  return (
    <div className={`w-6 h-6 flex flex-col justify-center items-center ${className}`}>
      <span className={`
        block w-5 h-0.5 bg-current transition-all duration-300
        ${isOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'}
      `} />
      <span className={`
        block w-5 h-0.5 bg-current transition-all duration-300 mt-1
        ${isOpen ? 'opacity-0' : 'opacity-100'}
      `} />
      <span className={`
        block w-5 h-0.5 bg-current transition-all duration-300 mt-1
        ${isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'}
      `} />
    </div>
  )
})

HamburgerIcon.displayName = 'HamburgerIcon'

export default HamburgerIcon 