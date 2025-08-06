'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Calendar, User, LogOut, Lock, Moon, Sun, FileText, Shield, Phone } from 'lucide-react'
import { FaInstagram, FaWhatsapp, FaTiktok } from 'react-icons/fa'
import { useSupabase } from '../providers/SupabaseProvider'
import { useTheme } from 'next-themes'
import LogoSimple from '../atoms/LogoSimple'
import { forceLogout } from '../../lib/supabase'
import { useMobileMenu } from '../providers/MobileMenuProvider'
import { useAdmin } from '@/hooks/useAdmin'
import LanguageSwitcher from '../ui/LanguageSwitcher'
import { useTranslations } from '@/hooks/useTranslations'

// TODO: Reativar sistema de reservas
const RESERVATIONS_ENABLED = false

// Navigation links are translated dynamically in the component

export default function Header() {
  const pathname = usePathname()
  const { user, supabase } = useSupabase()
  const { theme, setTheme } = useTheme()
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu } = useMobileMenu()
  const { isAdmin } = useAdmin()
  const { t, isReady } = useTranslations()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Scroll handler
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 50
    setIsScrolled(scrolled)
  }, [])

  // Effects - MOVED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    setIsMounted(true)
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
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
        closeMobileMenu()
        setIsUserMenuOpen(false)
        document.body.style.overflow = 'unset'
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeMobileMenu])

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

  // Get current locale from pathname
  const getCurrentLocale = () => {
    if (pathname.startsWith('/en')) return 'en'
    if (pathname.startsWith('/pt')) return 'pt'
    return 'pt' // default
  }

  const currentLocale = getCurrentLocale()

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

  // Check if link is active - considering locale
  const isActiveLink = (href: string) => {
    if (href === `/${currentLocale}`) {
      return pathname === `/${currentLocale}` || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Wait for translations to be ready
  if (!isReady) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-18 sm:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex-shrink-0">
              <LogoSimple 
                isScrolled={false}
                showText={true}
                className="transition-all duration-300"
              />
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              {/* Placeholder for navigation */}
            </div>
            <div className="flex items-center space-x-2">
              {/* Placeholder for actions */}
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Render loading state until hydrated
  if (!isMounted || !isHydrated) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-18 sm:h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex-shrink-0">
              <LogoSimple 
                isScrolled={false}
                showText={true}
                className="transition-all duration-300"
              />
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              {/* Placeholder for navigation */}
            </div>
            <div className="flex items-center space-x-2">
              {/* Placeholder for actions */}
            </div>
          </div>
        </div>
      </header>
    )
  }

  // Dynamic navigation links with translations - preserving current locale
  const navLinks = [
    { name: t('nav.home'), href: `/${currentLocale}`, requiresAuth: false },
    { name: t('nav.restaurant'), href: `/${currentLocale}/menu`, requiresAuth: false },
    { name: t('nav.cafe'), href: `/${currentLocale}/cafe`, requiresAuth: false },
    { name: t('nav.hotel'), href: `/${currentLocale}/pousada`, requiresAuth: false },
    { name: t('nav.gallery'), href: `/${currentLocale}/galeria`, requiresAuth: false },
    { name: t('nav.blog'), href: `/${currentLocale}/blog`, requiresAuth: false },
  ]

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
                    href={link.href}
                    prefetch={true}
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
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Social Media Links */}
              <div className="flex items-center space-x-1 mr-2">
                <a
                  href="https://instagram.com/armazemsaojoaquim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                    ${isScrolled 
                      ? 'text-slate-600 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20' 
                      : 'text-slate-700 hover:text-pink-600 dark:text-slate-300 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    }
                  `}
                  aria-label="Instagram @armazemsaojoaquim"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/5521985658443"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                    ${isScrolled 
                      ? 'text-slate-600 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                      : 'text-slate-700 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }
                  `}
                  aria-label="WhatsApp (21) 98565-8443"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a
                  href="https://tiktok.com/@armazemsaojoaquim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                    ${isScrolled 
                      ? 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800' 
                      : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }
                  `}
                  aria-label="TikTok @armazemsaojoaquim"
                >
                  <FaTiktok className="w-4 h-4" />
                </a>
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`
                  relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                  ${isScrolled 
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' 
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }
                `}
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`
                      relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                      ${isScrolled 
                        ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' 
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }
                      ${isUserMenuOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}
                    `}
                    aria-label="Menu do usuário"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {user.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isAdmin ? 'Administrador' : 'Usuário'}
                        </p>
                      </div>
                      
                      {isAdmin && (
                        <Link prefetch={true}
                          href={`/${currentLocale}/admin`}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {t('header.adminPanel')}
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('header.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link prefetch={true}
                  href={`/${currentLocale}/login`}
                  className={`
                    relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105
                    ${isScrolled 
                      ? 'text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-lg' 
                      : 'text-[15px] bg-amber-600 hover:bg-amber-700 text-white shadow-xl'
                    }
                  `}
                >
                  {t('header.login')}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className={`
                lg:hidden relative p-2 rounded-xl transition-all duration-300 hover:scale-105
                ${isScrolled 
                  ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }
              `}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ marginTop: isScrolled ? '3.5rem' : '4.5rem' }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu} />
          <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Menu
                </h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 mb-6">
                {navLinks.map((link) => {
                  const isActive = isActiveLink(link.href)
                  const requiresAuth = link.requiresAuth && !user
                  return (
                    <Link prefetch={true}
                      key={link.name}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`
                        flex items-center px-4 py-3 rounded-xl transition-all duration-300
                        ${isActive
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' 
                          : requiresAuth
                            ? 'text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      {requiresAuth && <Lock className="w-4 h-4 mr-3 opacity-70" />}
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                {/* Social Media Links Mobile */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <a
                    href="https://instagram.com/armazemsaojoaquim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/40 text-pink-600 dark:text-pink-400 transition-all duration-300"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://wa.me/5521985658443"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition-all duration-300"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                  <a
                    href="https://tiktok.com/@armazemsaojoaquim"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-300"
                  >
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Idioma
                  </span>
                  <LanguageSwitcher />
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <span className="text-sm font-medium">Tema</span>
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>

                {/* User Actions */}
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'Administrador' : 'Usuário'}
                      </p>
                    </div>
                    
                    {isAdmin && (
                      <Link prefetch={true}
                        href={`/${currentLocale}/admin`}
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        {t('header.adminPanel')}
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      {t('header.logout')}
                    </button>
                  </div>
                ) : (
                  <Link prefetch={true}
                    href={`/${currentLocale}/login`}
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    {t('header.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}