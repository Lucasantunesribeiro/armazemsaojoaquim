'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export const useHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Definir estado inicial do scroll
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isClient])

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevenir scroll quando menu mobile estiver aberto
  useEffect(() => {
    if (!isClient || typeof document === 'undefined') return

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen, isClient])

  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return {
    isMenuOpen,
    isScrolled,
    toggleMenu,
    closeMenu,
    isActive,
    isClient
  }
} 