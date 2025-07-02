'use client'

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const IconComponent = icons[type]

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50)

    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out',
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        'mb-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border',
        colors[type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={cn('h-5 w-5', iconColors[type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            {description && (
              <p className="mt-1 text-sm opacity-90">{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={cn(
                'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:opacity-75 transition-opacity',
                iconColors[type]
              )}
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Manager
class ToastManager {
  private toasts: ToastProps[] = []
  private listeners: Array<(toasts: ToastProps[]) => void> = []

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  public subscribe(listener: (toasts: ToastProps[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  public addToast(toast: Omit<ToastProps, 'id' | 'onClose'>) {
    const id = this.generateId()
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: this.removeToast.bind(this),
    }

    this.toasts.push(newToast)
    this.notify()

    return id
  }

  public removeToast = (id: string) => {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  public removeAllToasts() {
    this.toasts = []
    this.notify()
  }
}

export const toastManager = new ToastManager()

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null
  }

  return ReactDOM.createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>,
    document.body
  )
}

// Helper functions for easy toast usage
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    return toastManager.addToast({ type: 'success', title, description, duration })
  },
  
  error: (title: string, description?: string, duration?: number) => {
    return toastManager.addToast({ type: 'error', title, description, duration })
  },
  
  warning: (title: string, description?: string, duration?: number) => {
    return toastManager.addToast({ type: 'warning', title, description, duration })
  },
  
  info: (title: string, description?: string, duration?: number) => {
    return toastManager.addToast({ type: 'info', title, description, duration })
  },
  
  remove: (id: string) => {
    toastManager.removeToast(id)
  },
  
  removeAll: () => {
    toastManager.removeAllToasts()
  },
}

export default Toast 