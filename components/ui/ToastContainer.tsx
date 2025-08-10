'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '@/contexts/ToastContext'
import { ToastComponent } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import './toast-animations.css'

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  className?: string
}

const positionClasses = {
  'top-right': 'top-4 right-4 sm:top-4 sm:right-4',
  'top-left': 'top-4 left-4 sm:top-4 sm:left-4',
  'bottom-right': 'bottom-4 right-4 sm:bottom-4 sm:right-4',
  'bottom-left': 'bottom-4 left-4 sm:bottom-4 sm:left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2 sm:top-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-4'
}

const getAnimationClass = (position: string, toastType?: string) => {
  const isTop = position.includes('top')
  const isLeft = position.includes('left')
  const isCenter = position.includes('center')
  
  // Enhanced animations for different toast types
  if (toastType === 'error') {
    return 'toast-error-special'
  }
  
  if (toastType === 'success') {
    return 'toast-success-special'
  }
  
  if (toastType === 'warning') {
    return 'toast-warning-special'
  }
  
  if (toastType === 'info') {
    return 'animate-zoom-in-bounce'
  }
  
  // Default position-based animations
  if (isCenter) {
    return isTop ? 'animate-slide-in-top' : 'animate-slide-in-bottom'
  }
  
  if (isLeft) {
    return 'animate-slide-in-left'
  }
  
  return 'animate-slide-in-right'
}

const getStaggerClass = (index: number) => {
  const staggerIndex = Math.min(index + 1, 8) // Increased to support more toasts
  return `toast-stagger-${staggerIndex} toast-cascade`
}

export function ToastContainer({ 
  position = 'top-right', 
  className 
}: ToastContainerProps) {
  const { toasts, removeToast, clearToasts } = useToast()
  const [mounted, setMounted] = useState(false)
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set())
  const [animationError, setAnimationError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [touchDevice, setTouchDevice] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Detect mobile device and touch capability
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 640 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setIsMobile(isMobileDevice)
      setTouchDevice(isTouchDevice)
    }
    
    checkMobile()
    
    // Listen for resize events to update mobile detection
    const handleResize = () => {
      checkMobile()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Global keyboard support for dismissing toasts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toasts.length > 0) {
        // Dismiss the most recent toast
        const latestToast = toasts[toasts.length - 1]
        if (latestToast && latestToast.dismissible !== false) {
          handleRemoveToast(latestToast.id)
        }
      }
      
      // Ctrl/Cmd + Shift + X to clear all toasts
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'X') {
        clearToasts()
      }
    }

    if (mounted && toasts.length > 0) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mounted, toasts, clearToasts])

  // No need to define animationClass here since we'll calculate it per toast

  const handleRemoveToast = (id: string) => {
    try {
      if (animationError) {
        // Skip animations if there's an error
        removeToast(id)
        return
      }

      // Add exit animation
      setExitingToasts(prev => new Set(prev).add(id))
      
      // Remove after animation completes
      setTimeout(() => {
        removeToast(id)
        setExitingToasts(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 300)
    } catch (error) {
      console.error('Error in toast removal animation:', error)
      setAnimationError(true)
      // Fallback: remove immediately
      removeToast(id)
    }
  }

  if (!mounted) {
    return null
  }

  const toastContainer = (
    <div
      className={cn(
        'fixed z-50 flex max-h-screen w-full flex-col space-y-2 pointer-events-none',
        // Desktop styles
        !isMobile && 'sm:max-w-sm',
        !isMobile && positionClasses[position],
        // Mobile-specific styles
        isMobile && 'toast-container-mobile',
        isMobile && 'left-3 right-3 max-w-none',
        isMobile && position.includes('top') ? 'top-safe pt-2' : 'bottom-safe pb-2',
        // Enhanced mobile responsive adjustments
        'max-sm:left-3 max-sm:right-3 max-sm:max-w-none',
        position.includes('top') ? 'max-sm:top-safe max-sm:pt-2' : 'max-sm:bottom-safe max-sm:pb-2',
        // Safe area support for mobile devices
        'supports-[padding:max(0px)]:max-sm:pt-[max(0.75rem,env(safe-area-inset-top))]',
        'supports-[padding:max(0px)]:max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        // Touch device optimizations
        touchDevice && 'touch-device',
        className
      )}
      aria-live="polite"
      aria-label="Notificações"
      data-mobile={isMobile}
      data-touch={touchDevice}
    >
      {/* Dismiss All Button (only show when there are multiple toasts) */}
      {toasts.length > 1 && (
        <div className="pointer-events-auto mb-2">
          <button
            onClick={clearToasts}
            className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-1 px-2 rounded bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar todas as notificações"
          >
            Fechar todas ({toasts.length})
          </button>
        </div>
      )}

      {toasts.map((toast, index) => {
        const animationClass = animationError ? '' : getAnimationClass(position, toast.type)
        const staggerClass = animationError ? '' : getStaggerClass(index)
        
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto w-full',
              animationError ? 'toast-animation-fallback' : 'transition-all duration-300 ease-out',
              !animationError && !exitingToasts.has(toast.id) && animationClass,
              !animationError && !exitingToasts.has(toast.id) && staggerClass,
              !animationError && exitingToasts.has(toast.id) && 'animate-slide-out opacity-0 scale-95',
              animationError && exitingToasts.has(toast.id) && 'toast-exiting'
            )}
            style={{
              zIndex: 1000 + index
            }}
            onAnimationEnd={() => {
              // Animation completed successfully
            }}
          >
            <ToastComponent
              toast={toast}
              onDismiss={handleRemoveToast}
            />
          </div>
        )
      })}
    </div>
  )

  // Use portal to render toasts at the body level
  return createPortal(toastContainer, document.body)
}

export default ToastContainer