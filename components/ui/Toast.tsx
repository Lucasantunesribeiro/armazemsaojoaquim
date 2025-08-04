'use client'

import React, { useEffect, useState } from 'react'
import { useNotifications, type Notification } from '@/components/providers/NotificationProvider'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ToastProps {
  notification: Notification
}

const Toast: React.FC<ToastProps> = ({ notification }) => {
  const { removeNotification } = useNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeNotification(notification.id)
    }, 300)
  }

  const handleAction = () => {
    if (notification.action?.onClick) {
      notification.action.onClick()
    }
    if (!notification.persistent) {
      handleClose()
    }
  }

  // Auto-remove after duration
  useEffect(() => {
    if (!notification.persistent && notification.duration) {
      const timer = setTimeout(handleClose, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.persistent])

  // Toast styles by type
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          gradient: 'bg-gradient-to-r from-green-500 to-emerald-600',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          icon: CheckCircle,
          progress: 'bg-green-300'
        }
      case 'error':
        return {
          gradient: 'bg-gradient-to-r from-red-500 to-rose-600',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: AlertCircle,
          progress: 'bg-red-300'
        }
      case 'warning':
        return {
          gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
          progress: 'bg-amber-300'
        }
      case 'info':
      default:
        return {
          gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          icon: Info,
          progress: 'bg-blue-300'
        }
    }
  }

  const typeStyles = getTypeStyles()
  const IconComponent = typeStyles.icon

  // Position classes
  const getPositionClasses = () => {
    switch (notification.position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2'
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'top-right':
      default:
        return 'top-4 right-4'
    }
  }

  return (
    <div 
      className={`
        fixed z-50 max-w-sm w-full pointer-events-auto
        ${getPositionClasses()}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'opacity-100 transform translate-x-0 scale-100' : 'opacity-0 transform translate-x-full scale-95'}
        ${isExiting ? 'opacity-0 transform translate-x-full scale-95' : ''}
      `}
    >
      {/* Toast Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Gradient Top Bar */}
        <div className={`h-1 ${typeStyles.gradient}`} />
        
        {/* Main Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 p-1.5 rounded-full ${typeStyles.iconBg}`}>
              {notification.icon ? (
                <div className={`h-5 w-5 ${typeStyles.iconColor} flex items-center justify-center`}>
                  {notification.icon}
                </div>
              ) : (
                <IconComponent className={`h-5 w-5 ${typeStyles.iconColor}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 pr-8">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {notification.message}
              </p>

              {/* Action Button */}
              {notification.action && (
                <div className="mt-3">
                  {notification.action.href ? (
                    <Link prefetch={true}
                      href={notification.action.href}
                      className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      onClick={handleAction}
                    >
                      {notification.action.label}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  ) : (
                    <button
                      onClick={handleAction}
                      className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!notification.persistent && notification.duration && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full ${typeStyles.progress} animate-toast-progress`}
              style={{ 
                animationDuration: `${notification.duration}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards'
              }}
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="px-4 pb-3">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(notification.timestamp).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const { notifications } = useNotifications()

  return (
    <>
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </>
  )
}

export default Toast 