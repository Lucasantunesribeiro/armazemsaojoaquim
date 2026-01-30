'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import {
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: any
  current: boolean
}

interface AdminSidebarProps {
  navigationItems: NavigationItem[]
  user: User | null
  collapsed: boolean
  onToggleCollapse: () => void
  onLogout: () => void
  mobile?: boolean
  onClose?: () => void
}

export function AdminSidebar({
  navigationItems,
  user,
  collapsed,
  onToggleCollapse,
  onLogout,
  mobile = false,
  onClose
}: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
        {(!collapsed || mobile) && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-8 h-8 min-w-[32px] bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                São Joaquim
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                Admin
              </span>
            </div>
          </div>
        )}

        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {!mobile && (
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? "Expandir" : "Recolher"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${item.current
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              title={collapsed && !mobile ? item.name : undefined}
            >
              <Icon
                className={`flex-shrink-0 w-5 h-5 transition-colors ${item.current
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  } ${collapsed && !mobile ? 'mx-auto' : 'mr-3'}`}
              />

              {(!collapsed || mobile) && (
                <span className="truncate">{item.name}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && !mobile && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        {(!collapsed || mobile) && user && (
          <div className="flex items-center space-x-3 mb-4 px-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">
                {user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group ${collapsed && !mobile ? 'justify-center' : ''
            }`}
          title={collapsed && !mobile ? 'Sair' : undefined}
        >
          <LogOut className={`w-5 h-5 transition-colors group-hover:text-red-700 dark:group-hover:text-red-300 ${collapsed && !mobile ? '' : 'mr-3'}`} />
          {(!collapsed || mobile) && 'Sair do Sistema'}
        </button>
      </div>
    </div>
  )
}
