'use client'

import Link from 'next/link'
import { memo } from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  isActive?: boolean
  isScrolled?: boolean
  requireAuth?: boolean
  hasAuth?: boolean
  onClick?: (e: React.MouseEvent) => void
  className?: string
  isMobile?: boolean
  external?: boolean
  target?: string
}

const NavLink = memo(({ 
  href, 
  children, 
  isActive = false, 
  isScrolled = false, 
  requireAuth = false, 
  hasAuth = true, 
  onClick, 
  className = '',
  isMobile = false,
  external = false,
  target
}: NavLinkProps) => {
  const baseClasses = isMobile 
    ? `block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 font-inter`
    : `relative px-3 py-2 text-sm font-medium transition-all duration-200 font-inter hover:scale-105`

  const activeClasses = isMobile
    ? 'text-amarelo-armazem dark:text-amarelo-armazem bg-amarelo-armazem/10 dark:bg-amarelo-armazem/20'
    : isScrolled 
      ? 'text-amarelo-armazem dark:text-amarelo-armazem' 
      : 'text-white dark:text-amarelo-armazem'

  const inactiveClasses = isMobile
    ? 'text-madeira-escura dark:text-cinza-claro hover:text-amarelo-armazem dark:hover:text-amarelo-armazem hover:bg-cinza-claro dark:hover:bg-slate-800/50'
    : isScrolled 
      ? 'text-madeira-escura dark:text-cinza-claro hover:text-amarelo-armazem dark:hover:text-amarelo-armazem' 
      : 'text-white/90 dark:text-cinza-claro hover:text-white dark:hover:text-amarelo-armazem'

  const underlineClasses = !isMobile && isActive 
    ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-current after:rounded-full' 
    : ''

  const authClasses = requireAuth && !hasAuth ? 'opacity-60' : ''

  if (external) {
    return (
      <a
        href={href}
        target={target || '_blank'}
        rel="noopener noreferrer"
        onClick={onClick}
        className={`
          ${baseClasses}
          ${isActive ? activeClasses : inactiveClasses}
          ${underlineClasses}
          ${authClasses}
          ${className}
        `}
      >
        <span className={isMobile ? "flex items-center space-x-2" : ""}>
          <span>{children}</span>
          {requireAuth && !hasAuth && (
            <span className="text-xs" aria-label="Requer autenticação">🔒</span>
          )}
        </span>
      </a>
    )
  }

  return (
    <Link prefetch={true}
      href={href}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${isActive ? activeClasses : inactiveClasses}
        ${underlineClasses}
        ${authClasses}
        ${className}
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={isMobile ? "flex items-center space-x-2" : ""}>
        <span>{children}</span>
        {requireAuth && !hasAuth && (
          <span className="text-xs" aria-label="Requer autenticação">🔒</span>
        )}
      </span>
    </Link>
  )
})

NavLink.displayName = 'NavLink'

export default NavLink 