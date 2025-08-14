'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Toast } from '@/components/ui/Toast'

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  defaultDuration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastProvider({ 
  children, 
  maxToasts = 5, 
  defaultDuration = 5000,
  position = 'top-right' 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [hasError, setHasError] = useState(false)
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const errorCount = useRef(0)

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    try {
      // Reset error state if we can successfully add toasts
      if (hasError) {
        setHasError(false)
        errorCount.current = 0
      }

      const id = generateId()
      const newToast: Toast = { 
        ...toast, 
        id,
        duration: toast.duration ?? defaultDuration,
        dismissible: toast.dismissible ?? true
      }

      setToasts(prev => {
        // Remove oldest toast if we exceed maxToasts
        const updatedToasts = prev.length >= maxToasts ? prev.slice(1) : prev
        return [...updatedToasts, newToast]
      })

      // Auto-remove toast after duration (if duration > 0)
      if (newToast.duration && newToast.duration > 0) {
        const timeoutId = setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
        
        timeoutRefs.current.set(id, timeoutId)
      }

      return id
    } catch (error) {
      console.error('Error adding toast:', error)
      errorCount.current++
      
      // If we have too many errors, set error state
      if (errorCount.current > 3) {
        setHasError(true)
        // Fallback to console.log for critical messages
        console.warn(`Toast fallback: ${toast.title || toast.type}: ${toast.message}`)
      }
      
      return 'error-' + Date.now()
    }
  }, [defaultDuration, maxToasts, hasError])

  const removeToast = useCallback((id: string) => {
    try {
      // Clear timeout if exists
      const timeoutId = timeoutRefs.current.get(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutRefs.current.delete(id)
      }

      setToasts(prev => prev.filter(toast => toast.id !== id))
    } catch (error) {
      console.error('Error removing toast:', error)
      // Force clear all toasts if individual removal fails
      setToasts([])
      timeoutRefs.current.clear()
    }
  }, [])

  const clearToasts = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId))
    timeoutRefs.current.clear()
    
    setToasts([])
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    )
  }, [])

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId))
      timeoutRefs.current.clear()
    }
  }, [])

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    updateToast
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {hasError && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Sistema de notificações com problemas. Verifique o console para mensagens importantes.
            </p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}


export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hooks for different toast types
export function useToastHelpers() {
  const { addToast } = useToast()

  const showSuccess = useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    })
  }, [addToast])

  const showError = useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 6000, // Longer duration for errors
      ...options
    })
  }, [addToast])

  const showWarning = useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    })
  }, [addToast])

  const showInfo = useCallback((message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    })
  }, [addToast])

  // Generic showToast function for backward compatibility
  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, options?: Partial<Toast>) => {
    return addToast({
      type,
      title,
      message,
      ...options
    })
  }, [addToast])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast
  }
}

export default ToastContext