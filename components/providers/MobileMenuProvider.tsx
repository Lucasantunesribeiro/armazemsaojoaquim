import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface MobileMenuContextProps {
  isMobileMenuOpen: boolean
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
}

const MobileMenuContext = createContext<MobileMenuContextProps | undefined>(undefined)

export function useMobileMenu() {
  const ctx = useContext(MobileMenuContext)
  if (!ctx) throw new Error('useMobileMenu deve ser usado dentro de MobileMenuProvider')
  return ctx
}

export function MobileMenuProvider({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((v) => !v), [])

  return (
    <MobileMenuContext.Provider value={{ isMobileMenuOpen, openMobileMenu, closeMobileMenu, toggleMobileMenu }}>
      {children}
    </MobileMenuContext.Provider>
  )
} 