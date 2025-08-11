'use client'

import { useState, useEffect, ReactNode } from 'react'

interface HydrationProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente para prevenir problemas de hidratação SSR/CSR
 * Garante que o conteúdo só seja renderizado após a hidratação
 */
export function HydrationProvider({ children, fallback }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Marca como hidratado após o primeiro render no cliente
    setIsHydrated(true)
  }, [])

  // Durante SSR ou antes da hidratação, mostra o fallback
  if (!isHydrated) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      )
    )
  }

  // Após hidratação, renderiza o conteúdo normal
  return <>{children}</>
}

/**
 * Hook para verificar se o componente está hidratado
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
