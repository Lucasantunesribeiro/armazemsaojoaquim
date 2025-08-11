'use client'

import { useAdmin } from '@/hooks/useAdmin'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNavigation() {
  const { loading, isAdmin, hasProfile, user } = useAdmin()
  const pathname = usePathname()

  // Mostrar loading durante verificação
  if (loading) {
    return (
      <div className="admin-nav-loading">
        <span className="text-sm text-gray-500">Verificando permissões...</span>
      </div>
    )
  }

  // Só mostrar se usuário é admin verificado
  if (!isAdmin || !hasProfile) {
    return null
  }

  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <div className="admin-nav-container bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-800">
            🛠️ Painel Administrativo
          </h3>
          <p className="text-xs text-blue-600 mt-1">
            Logado como: {user?.email}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isAdminRoute && (
            <Link 
              href="/pt/admin" 
              className="admin-panel-link bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Ir para Admin
            </Link>
          )}
          
          {isAdminRoute && (
            <nav className="flex gap-2 text-sm">
              <Link 
                href="/pt/admin" 
                className={`px-2 py-1 rounded ${pathname === '/pt/admin' ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/pt/admin/blog" 
                className={`px-2 py-1 rounded ${pathname.startsWith('/pt/admin/blog') ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-100'}`}
              >
                Blog
              </Link>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}