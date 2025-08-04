'use client'

import React, { useState } from 'react'
import { useAdminNotifications } from '@/components/providers/NotificationProvider'
import { Bell, X, Calendar, ChefHat, Users, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react'
import Link from 'next/link'

export const AdminNotificationCenter: React.FC = () => {
  const { notifications, clear } = useAdminNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'reservation' | 'user' | 'menu' | 'blog' | 'system'>('all')

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.category === filter
  )

  const unreadCount = notifications.length

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reservation': return Calendar
      case 'user': return Users
      case 'menu': return ChefHat
      case 'blog': return Settings
      case 'system': return AlertTriangle
      default: return Bell
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reservation': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'user': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'menu': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'blog': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
      case 'system': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
      case 'warning':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10'
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Centro de notificações"
      >
        <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Notificações
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount} novas
                  </span>
                  <button
                    onClick={() => clear()}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Limpar todas
                  </button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex space-x-1 overflow-x-auto">
                {[
                  { key: 'all', label: 'Todas', icon: Bell },
                  { key: 'reservation', label: 'Reservas', icon: Calendar },
                  { key: 'user', label: 'Usuários', icon: Users },
                  { key: 'menu', label: 'Menu', icon: ChefHat },
                  { key: 'system', label: 'Sistema', icon: AlertTriangle }
                ].map((categoryOption) => {
                  const IconComponent = categoryOption.icon
                  return (
                    <button
                      key={categoryOption.key}
                      onClick={() => setFilter(categoryOption.key as any)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === categoryOption.key
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="h-3 w-3" />
                      <span className="whitespace-nowrap">{categoryOption.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {filter === 'all' ? 'Nenhuma notificação' : `Nenhuma notificação de ${filter}`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const CategoryIcon = getCategoryIcon(notification.category)
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${getTypeStyles(notification.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Category Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-full ${getCategoryColor(notification.category)}`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {notification.actions.map((action, index) => (
                                <div key={index}>
                                  {action.href ? (
                                    <Link prefetch={true}
                                      href={action.href}
                                      onClick={() => setIsOpen(false)}
                                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        action.variant === 'primary'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : action.variant === 'danger'
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      {action.label}
                                    </Link>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        action.onClick?.()
                                        setIsOpen(false)
                                      }}
                                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        action.variant === 'primary'
                                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                                          : action.variant === 'danger'
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      {action.label}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={() => {
                    clear()
                    setIsOpen(false)
                  }}
                  className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Limpar todas as notificações
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminNotificationCenter 