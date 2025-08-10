'use client'

import React from 'react'
import { useTheme, themeVariables } from '@/contexts/ThemeContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// Toast variants with proper contrast and accessibility
const toastVariants = cva(
  "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      type: {
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50",
        error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-50",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-50"
      }
    },
    defaultVariants: {
      type: "info"
    }
  }
)

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  persistent?: boolean
  progress?: {
    current: number
    total: number
    label?: string
  }
  expandable?: {
    summary: string
    details: string
  }
  copyable?: {
    text: string
    label?: string
  }
}

interface ToastComponentProps extends VariantProps<typeof toastVariants> {
  toast: Toast
  onDismiss?: (id: string) => void
  isPaused?: boolean
}

const ToastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const ToastIconColors = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400", 
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400"
}

export function ToastComponent({ toast, onDismiss, isPaused: externalIsPaused }: ToastComponentProps) {
  const Icon = ToastIcons[toast.type]
  const { resolvedTheme } = useTheme()
  const [internalIsPaused, setInternalIsPaused] = React.useState(false)
  const isPaused = externalIsPaused || internalIsPaused
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isAnnounced, setIsAnnounced] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [copySuccess, setCopySuccess] = React.useState(false)
  const toastRef = React.useRef<HTMLDivElement>(null)
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(toast.id)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && toast.dismissible !== false) {
      handleDismiss()
    }
    
    // Space or Enter to dismiss (when focused)
    if ((event.key === ' ' || event.key === 'Enter') && toast.dismissible !== false) {
      event.preventDefault()
      handleDismiss()
    }
  }

  // Announce toast to screen readers after a short delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnnounced(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Handle copy functionality
  const handleCopy = async () => {
    if (!toast.copyable) return
    
    try {
      await navigator.clipboard.writeText(toast.copyable.text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleMouseEnter = () => {
    setInternalIsPaused(true)
  }

  const handleMouseLeave = () => {
    setInternalIsPaused(false)
  }

  // Touch gesture handlers with improved logic
  const [touchStartX, setTouchStartX] = React.useState(0)
  
  const handleTouchStart = (event: React.TouchEvent) => {
    if (toast.dismissible === false) return
    setIsDragging(true)
    setInternalIsPaused(true)
    setTouchStartX(event.touches[0].clientX)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || toast.dismissible === false) return
    
    const touch = event.touches[0]
    const currentX = touch.clientX
    const offset = currentX - touchStartX
    
    // Only allow horizontal swipe
    setSwipeOffset(offset)
  }

  const handleTouchEnd = () => {
    if (!isDragging || toast.dismissible === false) return
    
    setIsDragging(false)
    setInternalIsPaused(false)
    
    // If swiped more than 100px, dismiss
    if (Math.abs(swipeOffset) > 100) {
      handleDismiss()
    } else {
      setSwipeOffset(0)
    }
  }

  const cssVarsByType: Record<NonNullable<Toast['type']>, React.CSSProperties> = {
    success: {
      ['--toast-bg' as any]: themeVariables[resolvedTheme]['--toast-success-bg'],
      ['--toast-border' as any]: themeVariables[resolvedTheme]['--toast-success-border'],
      ['--toast-text' as any]: themeVariables[resolvedTheme]['--toast-success-text']
    },
    error: {
      ['--toast-bg' as any]: themeVariables[resolvedTheme]['--toast-error-bg'],
      ['--toast-border' as any]: themeVariables[resolvedTheme]['--toast-error-border'],
      ['--toast-text' as any]: themeVariables[resolvedTheme]['--toast-error-text']
    },
    warning: {
      ['--toast-bg' as any]: themeVariables[resolvedTheme]['--toast-warning-bg'],
      ['--toast-border' as any]: themeVariables[resolvedTheme]['--toast-warning-border'],
      ['--toast-text' as any]: themeVariables[resolvedTheme]['--toast-warning-text']
    },
    info: {
      ['--toast-bg' as any]: themeVariables[resolvedTheme]['--toast-info-bg'],
      ['--toast-border' as any]: themeVariables[resolvedTheme]['--toast-info-border'],
      ['--toast-text' as any]: themeVariables[resolvedTheme]['--toast-info-text']
    }
  }

  return (
    <div
      ref={toastRef}
      className={cn(
        toastVariants({ type: toast.type }), 
        "toast-container toast-swipeable",
        isDragging && "cursor-grabbing",
        `toast-${toast.type}`
      )}
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-label={`${toast.type} notification: ${toast.title || toast.message}`}
      tabIndex={toast.dismissible !== false ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        opacity: Math.max(0.3, 1 - Math.abs(swipeOffset) / 300),
        backgroundColor: `var(--toast-bg)`,
        borderColor: `var(--toast-border)`,
        color: `var(--toast-text)`,
        ...cssVarsByType[toast.type]
      }}
    >
      {/* Icon and Content */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon 
            className={cn("w-5 h-5", ToastIconColors[toast.type])} 
            aria-hidden="true" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="toast-title text-sm font-semibold mb-1 leading-tight">
              {toast.title}
            </h4>
          )}
          <p className="toast-message text-sm leading-relaxed opacity-90">
            {toast.message}
          </p>
          
          {/* Progress Bar */}
          {toast.progress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>{toast.progress.label || 'Progress'}</span>
                <span>{toast.progress.current}/{toast.progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    toast.type === 'success' && "bg-green-500",
                    toast.type === 'error' && "bg-red-500",
                    toast.type === 'warning' && "bg-yellow-500",
                    toast.type === 'info' && "bg-blue-500"
                  )}
                  style={{ width: `${(toast.progress.current / toast.progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Expandable Content */}
          {toast.expandable && (
            <div className="mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
                aria-expanded={isExpanded}
              >
                {isExpanded ? '▼' : '▶'} {toast.expandable.summary}
              </button>
              {isExpanded && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                  {toast.expandable.details}
                </div>
              )}
            </div>
          )}

          {/* Copy Button */}
          {toast.copyable && (
            <button
              onClick={handleCopy}
              className={cn(
                "mt-2 text-sm font-medium px-2 py-1 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                copySuccess 
                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600",
                toast.type === 'success' && "focus:ring-green-500",
                toast.type === 'error' && "focus:ring-red-500",
                toast.type === 'warning' && "focus:ring-yellow-500",
                toast.type === 'info' && "focus:ring-blue-500"
              )}
            >
              {copySuccess ? '✓ Copiado!' : (toast.copyable.label || 'Copiar')}
            </button>
          )}

          {/* Action Buttons */}
          {(toast.action || toast.secondaryAction) && (
            <div className="mt-3 flex gap-2">
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    toast.type === 'success' && "bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500",
                    toast.type === 'error' && "bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500",
                    toast.type === 'warning' && "bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                    toast.type === 'info' && "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                  )}
                >
                  {toast.action.label}
                </button>
              )}
              
              {toast.secondaryAction && (
                <button
                  onClick={toast.secondaryAction.onClick}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600",
                    toast.type === 'success' && "focus:ring-green-500",
                    toast.type === 'error' && "focus:ring-red-500",
                    toast.type === 'warning' && "focus:ring-yellow-500",
                    toast.type === 'info' && "focus:ring-blue-500"
                  )}
                >
                  {toast.secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dismiss Button */}
      {toast.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
            "min-w-[44px] min-h-[44px] flex items-center justify-center", // Touch target size
            toast.type === 'success' && "text-green-500 hover:text-green-700 focus:ring-green-500 dark:text-green-400 dark:hover:text-green-300",
            toast.type === 'error' && "text-red-500 hover:text-red-700 focus:ring-red-500 dark:text-red-400 dark:hover:text-red-300",
            toast.type === 'warning' && "text-yellow-500 hover:text-yellow-700 focus:ring-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300",
            toast.type === 'info' && "text-blue-500 hover:text-blue-700 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          )}
          aria-label={`Fechar notificação ${toast.type}: ${toast.title || toast.message}`}
          title="Pressione Escape ou clique para fechar"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Screen reader announcement */}
      {isAnnounced && (
        <div className="sr-only" aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
          {toast.type} notification: {toast.title ? `${toast.title}. ${toast.message}` : toast.message}
        </div>
      )}

      {/* Progress Bar for Auto-Dismiss */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full toast-progress-bar",
              toast.type === 'success' && "bg-green-500",
              toast.type === 'error' && "bg-red-500",
              toast.type === 'warning' && "bg-yellow-500",
              toast.type === 'info' && "bg-blue-500"
            )}
            style={{
              animationDuration: `${toast.duration}ms`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ToastComponent