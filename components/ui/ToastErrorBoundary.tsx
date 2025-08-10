'use client'

import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { AlertTriangle } from 'lucide-react'

interface ToastErrorFallbackProps {
  error?: Error
  retry: () => void
}

function ToastErrorFallback({ error, retry }: ToastErrorFallbackProps) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
              Erro no sistema de notificações
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              As notificações não estão funcionando corretamente.
            </p>
            <button
              onClick={retry}
              className="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            >
              Recarregar sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastErrorBoundaryProps {
  children: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export default function ToastErrorBoundary({ children, onError }: ToastErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log toast system errors specifically
    console.error('Toast system error:', error, errorInfo)
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }
    
    // Fallback to console.warn for user feedback
    console.warn('Notificações temporariamente indisponíveis. Usando fallback.')
  }

  return (
    <ErrorBoundary
      fallback={ToastErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}