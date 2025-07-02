'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Calendar, User, LogOut, Lock, Moon, Sun } from 'lucide-react'
import { useSupabase } from '../providers/SupabaseProvider'
import { useTheme } from 'next-themes'
import LogoSimple from '../atoms/LogoSimple'
import { forceLogout } from '../../lib/supabase'
<<<<<<< HEAD
import { useMobileMenu } from '../providers/MobileMenuProvider'
=======
>>>>>>> db71da20d421fb713050462e83c63369986edb18

const navLinks = [
  { name: 'Início', href: '/' },
  { name: 'Menu', href: '/menu' },
  { name: 'Reservas', href: '/reservas', requiresAuth: true },
<<<<<<< HEAD
  { name: 'Blog', href: '/blog' },
  { name: 'Contato', href: '/#contato' }
=======
  { name: 'Blog', href: '/blog' }
>>>>>>> db71da20d421fb713050462e83c63369986edb18
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
<<<<<<< HEAD
=======
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
>>>>>>> db71da20d421fb713050462e83c63369986edb18
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user, supabase } = useSupabase()
  const { theme, setTheme } = useTheme()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
<<<<<<< HEAD
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu } = useMobileMenu()
=======
>>>>>>> db71da20d421fb713050462e83c63369986edb18

  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50
    setIsScrolled(scrolled)
  }, [])

<<<<<<< HEAD
=======
  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
    document.body.style.overflow = 'unset'
  }, [])

>>>>>>> db71da20d421fb713050462e83c63369986edb18
  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🔄 Iniciando logout...')
      
      // Tentar logout normal primeiro
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) {
        console.warn('⚠️ Erro no logout normal, usando logout forçado:', error)
        await forceLogout()
      }
      
      console.log('✅ Logout concluído')
      setIsUserMenuOpen(false)
      
      // Opcional: recarregar a página para garantir limpeza completa
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    } catch (error) {
      console.error('❌ Erro no logout:', error)
      
      // Fallback: usar logout forçado
      await forceLogout()
      setIsUserMenuOpen(false)
      
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Effects
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('button[aria-label="Abrir menu"]')) {
        closeMobileMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeMobileMenu])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
<<<<<<< HEAD
        closeMobileMenu()
=======
        setIsMobileMenuOpen(false)
>>>>>>> db71da20d421fb713050462e83c63369986edb18
        setIsUserMenuOpen(false)
        document.body.style.overflow = 'unset'
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out
        ${isScrolled 
          ? 'h-14 sm:h-16 bg-white/99 dark:bg-slate-900/99 backdrop-blur-3xl shadow-2xl border-b border-slate-300/80 dark:border-slate-600/80' 
          : 'h-18 sm:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Only */}
            <div className="flex-shrink-0">
              <LogoSimple 
                isScrolled={isScrolled}
                showText={true}
                className="transition-all duration-300"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className={`hidden lg:flex items-center transition-all duration-300 ${isScrolled ? 'space-x-1' : 'space-x-2'}`}>
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.href)
                const requiresAuth = link.requiresAuth && !user
                
                return (
                  <Link
                    key={link.name}
                    href={requiresAuth ? '/auth' : link.href}
                    className={`
                      relative transition-all duration-300 rounded-xl font-inter tracking-wide hover:scale-105
                      ${isScrolled 
                        ? 'px-3 py-2 text-sm font-bold' 
                        : 'px-4 py-2.5 text-[15px] font-semibold'
                      }
                      ${isActive
                        ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 shadow-lg' 
                        : requiresAuth
                          ? 'text-orange-700 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                          : 'text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }
                    `}
                  >
                    <span className="flex items-center space-x-1">
                      {requiresAuth && (
                        <Lock className={`opacity-70 transition-all duration-300 ${isScrolled ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                      )}
                      <span>{link.name}</span>
                    </span>
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-1 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className={`hidden lg:flex items-center transition-all duration-300 ${isScrolled ? 'space-x-2' : 'space-x-4'}`}>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`
                  rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 
                  hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-110
                  ${isScrolled ? 'p-2' : 'p-2.5'}
                `}
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <Sun className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                ) : (
                  <Moon className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                )}
              </button>

              {/* User Menu or Login */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`
                      flex items-center rounded-xl text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 
                      hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105 
                      border border-slate-300 dark:border-slate-600
                      ${isScrolled ? 'space-x-1.5 px-3 py-2' : 'space-x-2 px-4 py-2.5'}
                    `}
                  >
                    <div className={`
                      bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center 
                      text-white font-bold transition-all duration-300
                      ${isScrolled ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'}
                    `}>
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`font-bold font-inter transition-all duration-300 ${isScrolled ? 'text-xs' : 'text-sm'}`}>
                      {user.email?.split('@')[0] || 'Usuário'}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 backdrop-blur-xl">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-inter">
                          {user.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-inter font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className={`
                    flex items-center rounded-xl border border-slate-400 dark:border-slate-500 text-slate-800 dark:text-slate-200 
                    hover:border-amber-600 dark:hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 
                    font-bold transition-all duration-300 hover:scale-105 font-inter
                    ${isScrolled ? 'space-x-1.5 px-3 py-2 text-sm' : 'space-x-2 px-4 py-2.5 text-[15px]'}
                  `}
                >
                  <User className={`transition-all duration-300 ${isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                  <span>Entrar</span>
                </Link>
              )}

              {/* Reservar Button */}
              <Link
                href={user ? '/reservas' : '/auth'}
                className={`
                  group relative inline-flex items-center rounded-xl font-bold font-inter tracking-wide 
                  transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl 
                  bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white
                  ${isScrolled ? 'space-x-1.5 px-4 py-2 text-sm' : 'space-x-2 px-6 py-2.5 text-[15px]'}
                `}
              >
                <Calendar className={`transition-all duration-300 ${isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                <span>Reservar</span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
<<<<<<< HEAD
              onClick={() => toggleMobileMenu()}
=======
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>>>>>>> db71da20d421fb713050462e83c63369986edb18
              className="lg:hidden p-2.5 rounded-xl text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
<<<<<<< HEAD
        <div className="fixed inset-0 z-50 lg:hidden">
=======
        <div className="fixed inset-0 z-40 lg:hidden">
>>>>>>> db71da20d421fb713050462e83c63369986edb18
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeMobileMenu} />
          
          <div 
            ref={mobileMenuRef}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center space-x-3">
<<<<<<< HEAD
                <LogoSimple 
                  isScrolled={isScrolled}
                  showText={true}
                  className="transition-all duration-300"
                />
=======
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-playfair leading-tight">
                    Armazém São Joaquim
                  </h2>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Desde 1854
                  </p>
                </div>
>>>>>>> db71da20d421fb713050462e83c63369986edb18
              </div>
              <div className="flex items-center space-x-1">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-110"
                  aria-label="Alternar tema"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={closeMobileMenu}
                  className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:scale-110"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex flex-col h-[calc(100%-theme(spacing.20))] overflow-y-auto">
              {/* Navigation Links */}
<<<<<<< HEAD
=======
              <nav className="flex-1 p-4 sm:p-6">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = isActiveLink(link.href)
                    const requiresAuth = link.requiresAuth && !user
                    
                    return (
                      <Link
                        key={link.name}
                        href={requiresAuth ? '/auth' : link.href}
                        onClick={closeMobileMenu}
                        className={`
                          group flex items-center justify-between px-4 py-4 rounded-2xl text-base font-semibold transition-all duration-300 font-inter
                          ${isActive
                            ? 'text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 shadow-lg border border-amber-200 dark:border-amber-800' 
                            : requiresAuth
                              ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 hover:shadow-md'
                              : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gradient-to-r hover:from-slate-50 hover:to-amber-50 dark:hover:from-slate-800/50 dark:hover:to-amber-900/20 hover:shadow-md'
                          }
                        `}
                      >
                        <span className="flex items-center space-x-3">
                          {requiresAuth && (
                            <Lock className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                          )}
                          <span className="text-base sm:text-lg">{link.name}</span>
                        </span>
                        {isActive && (
                          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg" />
                        )}
                      </Link>
                    )
                  })}
                  
                  {/* Mobile Reservar Button */}
                  <div className="pt-4">
                    <Link
                      href={user ? '/reservas' : '/auth'}
                      onClick={closeMobileMenu}
                      className="group flex items-center justify-center space-x-3 w-full px-6 py-4 rounded-2xl font-bold text-base sm:text-lg font-inter transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Reservar Mesa</span>
                    </Link>
                  </div>
                </div>
              </nav>

>>>>>>> db71da20d421fb713050462e83c63369986edb18
              {/* Mobile User Section */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-800/50">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-inter truncate">
                          {user.email?.split('@')[0] || 'Usuário'}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="flex items-center justify-center space-x-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 font-inter font-semibold border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sair da conta</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center space-x-3 w-full border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 px-6 py-4 rounded-2xl font-bold transition-all duration-300 font-inter bg-white dark:bg-slate-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-base">Entrar na conta</span>
                  </Link>
                )}
              </div>
<<<<<<< HEAD
              <nav className="flex-1 p-4 sm:p-6">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = isActiveLink(link.href)
                    const requiresAuth = link.requiresAuth && !user
                    
                    return (
                      <Link
                        key={link.name}
                        href={requiresAuth ? '/auth' : link.href}
                        onClick={closeMobileMenu}
                        className={`
                          group flex items-center justify-between px-4 py-4 rounded-2xl text-base font-semibold transition-all duration-300 font-inter
                          ${isActive
                            ? 'text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 shadow-lg border border-amber-200 dark:border-amber-800' 
                            : requiresAuth
                              ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 hover:shadow-md'
                              : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gradient-to-r hover:from-slate-50 hover:to-amber-50 dark:hover:from-slate-800/50 dark:hover:to-amber-900/20 hover:shadow-md'
                          }
                        `}
                      >
                        <span className="flex items-center space-x-3">
                          {requiresAuth && (
                            <Lock className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                          )}
                          <span className="text-base sm:text-lg">
                            {link.name}
                            {link.requiresAuth && user && (
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                Disponível
                              </span>
                            )}
                          </span>
                        </span>
                        {isActive && (
                          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-lg" />
                        )}
                      </Link>
                    )
                  })}
                  
                  {/* Mobile Reservar Button */}
                  <div className="pt-4">
                    <Link
                      href={user ? '/reservas' : '/auth'}
                      onClick={closeMobileMenu}
                      className="group flex items-center justify-center space-x-3 w-full px-6 py-4 rounded-2xl font-bold text-base sm:text-lg font-inter transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Reservar Mesa</span>
                    </Link>
                  </div>
                  
                </div>
              </nav>

              
=======
>>>>>>> db71da20d421fb713050462e83c63369986edb18
            </div>
          </div>
        </div>
      )}
    </>
  )
}