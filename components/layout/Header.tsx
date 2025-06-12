'use client'

import { memo, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useSupabase } from '../providers/SupabaseProvider'
import { useHeader } from '../../lib/hooks/useHeader'
import ThemeToggle from '../ui/ThemeToggle'
import Logo from '../atoms/Logo'
import HamburgerIcon from '../atoms/HamburgerIcon'
import Navigation from '../molecules/Navigation'
import UserMenu from '../molecules/UserMenu'
import AuthButtons from '../molecules/AuthButtons'
import MobileMenu from '../molecules/MobileMenu'
import type { NavigationItems } from '../../types/navigation'

// Configuração de navegação
const NAVIGATION_ITEMS: NavigationItems = [
  { name: 'Início', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'Reservas', href: '/reservas', requireAuth: true },
  { name: 'Blog', href: '/blog' },
] as const

const Header = memo(() => {
  const router = useRouter()
  const { user, loading, supabase } = useSupabase()
  const { isMenuOpen, isScrolled, toggleMenu, closeMenu, isActive } = useHeader()

  // Memoizar handlers para evitar re-renders desnecessários
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast.error('Erro ao fazer logout')
    }
  }, [supabase.auth, router])

  const handleReservationClick = useCallback(() => {
    if (!user) {
      toast.error('Faça login para acessar as reservas')
      router.push('/auth')
      return
    }
    router.push('/reservas')
  }, [user, router])

  const handleMobileMenuToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    toggleMenu()
  }, [toggleMenu])

  // Memoizar classes CSS para performance
  const headerClasses = useMemo(() => `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${isScrolled 
      ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg' 
      : 'bg-transparent'
    }
  `, [isScrolled])

  const mobileButtonClasses = useMemo(() => `
    p-2 rounded-lg transition-colors duration-200 focus-ring
    ${isScrolled 
      ? 'text-madeira-escura dark:text-cinza-claro hover:bg-cinza-claro/20 dark:hover:bg-slate-800' 
      : 'text-white dark:text-cinza-claro hover:bg-white/10 dark:hover:bg-slate-800/50'
    }
  `, [isScrolled])

  // Loading state
  if (loading) {
    return (
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo isScrolled={isScrolled} />
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className={headerClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Logo 
              isScrolled={isScrolled} 
              onClick={closeMenu}
              className="flex-shrink-0"
            />

            {/* Desktop Navigation */}
            <Navigation
              items={NAVIGATION_ITEMS}
              isScrolled={isScrolled}
              isActive={isActive}
              user={user}
              className="header-nav"
            />

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              
              {user ? (
                <UserMenu
                  user={user}
                  isScrolled={isScrolled}
                  onSignOut={handleSignOut}
                  onReservationClick={handleReservationClick}
                />
              ) : (
                <AuthButtons
                  isScrolled={isScrolled}
                  onReservationClick={handleReservationClick}
                />
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                type="button"
                className={mobileButtonClasses}
                aria-controls="mobile-menu"
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                onClick={handleMobileMenuToggle}
              >
                <span className="sr-only">
                  {isMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
                </span>
                <HamburgerIcon isOpen={isMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={isMenuOpen}
          items={NAVIGATION_ITEMS}
          isActive={isActive}
          user={user}
          onSignOut={handleSignOut}
          onReservationClick={handleReservationClick}
          onClose={closeMenu}
        />
      </header>

      {/* Overlay para acessibilidade */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  )
})

Header.displayName = 'Header'

export default Header