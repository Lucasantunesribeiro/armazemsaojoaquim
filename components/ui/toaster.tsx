'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToasterProps {
  toasts?: Toast[]
}

const toasts: Toast[] = []

export const Toaster = ({ toasts: externalToasts = [] }: ToasterProps) => {
  const [internalToasts, setInternalToasts] = useState<Toast[]>([])

  useEffect(() => {
    if (externalToasts.length > 0) {
      setInternalToasts(externalToasts)
    }
  }, [externalToasts])

  const removeToast = (id: string) => {
    setInternalToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const allToasts = [...toasts, ...internalToasts]

  if (allToasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {allToasts.map((toast) => (
        <div
          key={toast.id}
          className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full ${
            toast.variant === 'destructive'
              ? 'destructive border-destructive bg-destructive text-destructive-foreground'
              : toast.variant === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border bg-background text-foreground'
          }`}
        >
          <div className="grid gap-1">
            {toast.title && (
              <div className="text-sm font-semibold [&+div]:text-xs">
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">
                {toast.description}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

// Hook para usar toast
export const useToast = () => {
  const toast = ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, title, description, variant, duration }
    
    toasts.push(newToast)
    
    if (duration > 0) {
      setTimeout(() => {
        const index = toasts.findIndex(t => t.id === id)
        if (index > -1) {
          toasts.splice(index, 1)
        }
      }, duration)
    }
    
    return { id }
  }

  return { toast }
} 