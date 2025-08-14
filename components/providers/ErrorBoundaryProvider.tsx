'use client'

import React, { ReactNode } from 'react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { useDiagnostics } from '@/lib/component-diagnostics'

interface ErrorBoundaryProviderProps {
  children: ReactNode
}

/**
 * Provider global para Error Boundaries
 * Envolve toda a aplicação com tratamento de erros
 */
function CustomErrorFallback({ retry }: { error?: Error; retry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Armazém São Joaquim
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Sistema em Manutenção
          </h2>
          <p className="text-gray-600 mb-4">
            Estamos trabalhando para resolver um problema técnico. 
            Tente recarregar a página em alguns instantes.
          </p>
          <button
            onClick={retry}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            🔄 Recarregar Página
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          "En esta casa tenemos memoria"
        </p>
      </div>
    </div>
  )
}

export function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  // Executar diagnósticos automaticamente no desenvolvimento
  useDiagnostics()

  return (
    <ErrorBoundary
      fallback={CustomErrorFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundaryProvider