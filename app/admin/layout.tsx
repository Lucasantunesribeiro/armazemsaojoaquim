'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Menu, X } from 'lucide-react'
import AdminNotificationCenter from '@/components/ui/AdminNotificationCenter'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 AdminLayout: Verificando autenticação...')
      
      // Verificar sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ AdminLayout: Erro na sessão:', sessionError)
        router.push('/auth?message=Erro+na+sessão')
        return
      }

      if (!session || !session.user) {
        console.log('❌ AdminLayout: Sem sessão ativa')
        router.push('/auth?message=Faça+login+para+acessar+o+painel+administrativo')
        return
      }

      console.log('✅ AdminLayout: Sessão encontrada:', session.user.email)
      setUser(session.user)

      // Verificar se é admin através da API
      try {
        console.log('🔍 AdminLayout: Fazendo requisição para check-role...')
        
        const response = await fetch('/api/admin/check-role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          console.error('❌ AdminLayout: API check-role falhou:', {
            status: response.status,
            statusText: response.statusText
          })
          
          // Try to get error details
          try {
            const errorData = await response.json()
            console.error('❌ AdminLayout: Detalhes do erro:', errorData)
          } catch (e) {
            console.error('❌ AdminLayout: Não foi possível ler detalhes do erro')
          }
          
          router.push('/auth?message=Erro+ao+verificar+permissões')
          return
        }

        const roleData = await response.json()
        console.log('🔍 AdminLayout: Role verificada:', roleData)

        if (!roleData.isAdmin) {
          console.log('❌ AdminLayout: Usuário não é admin:', {
            email: session.user.email,
            roleData
          })
          router.push('/auth?message=Acesso+negado+ao+painel+administrativo')
          return
        }

        console.log('✅ AdminLayout: Usuário admin confirmado:', {
          email: session.user.email,
          source: roleData.source
        })
        setIsAdmin(true)

      } catch (apiError: any) {
        console.error('❌ AdminLayout: Erro na API:', apiError)
        
        // Fallback: check admin by email directly if API fails
        if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('✅ AdminLayout: Admin confirmado por fallback de email')
          setIsAdmin(true)
          return
        }
        
        router.push('/auth?message=Erro+ao+verificar+permissões')
        return
      }

    } catch (error: any) {
      console.error('❌ AdminLayout: Erro geral:', error)
      
      // Get session again for error handling
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        // If it's a general error but user email is admin, try to continue
        if (currentSession?.user?.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('⚠️ AdminLayout: Erro geral mas email é admin - tentando continuar')
          setUser(currentSession.user)
          setIsAdmin(true)
        } else {
          setError('Erro na autenticação: ' + error.message)
        }
      } catch {
        setError('Erro na autenticação: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    checkAuth()

    // Listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 AdminLayout: Auth state changed:', event)
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setIsAdmin(false)
          router.push('/auth?message=Sessão+expirada')
        } else if (event === 'SIGNED_IN' && session) {
          setLoading(true)
          await checkAuth()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkAuth, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro de Autenticação</p>
            <p>{error}</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Fazer Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Renderizar layout admin com navegação responsiva
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar user={user} />
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {children}
      </main>
    </div>
  )
}

// Navbar do Admin Responsiva
function AdminNavbar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth?message=Logout+realizado+com+sucesso')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              <span className="hidden sm:inline">Admin - Armazém São Joaquim</span>
              <span className="sm:hidden">Admin - Armazém</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <NavLink href="/admin" label="Dashboard" />
            <NavLink href="/admin/reservas" label="Reservas" />
            <NavLink href="/admin/usuarios" label="Usuários" />
            <NavLink href="/admin/menu" label="Menu" />
            <NavLink href="/admin/blog" label="Blog" />
          </div>

          {/* Desktop User Info & Logout */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <AdminNotificationCenter />
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate max-w-32 lg:max-w-none">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded text-xs sm:text-sm transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Tablet Navigation (between md and lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-1">
            <NavLink href="/admin" label="Dashboard" compact />
            <NavLink href="/admin/reservas" label="Reservas" compact />
            <NavLink href="/admin/usuarios" label="Usuários" compact />
            <NavLink href="/admin/menu" label="Menu" compact />
            <NavLink href="/admin/blog" label="Blog" compact />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
            <div className="flex flex-col space-y-1">
              <MobileNavLink href="/admin" label="Dashboard" onClick={closeMenu} />
              <MobileNavLink href="/admin/reservas" label="Reservas" onClick={closeMenu} />
              <MobileNavLink href="/admin/usuarios" label="Usuários" onClick={closeMenu} />
              <MobileNavLink href="/admin/menu" label="Menu" onClick={closeMenu} />
              <MobileNavLink href="/admin/blog" label="Blog" onClick={closeMenu} />
              
              {/* Mobile User Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Logado como:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

// Link de navegação desktop/tablet
function NavLink({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) {
  const router = useRouter()
  
  return (
    <button
      onClick={() => router.push(href)}
      className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors ${
        compact ? 'px-2 py-2 text-xs' : 'px-3 py-2 text-sm'
      } font-medium`}
    >
      {compact && label.length > 8 ? label.substring(0, 8) + '...' : label}
    </button>
  )
}

// Link de navegação mobile
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const router = useRouter()
  
  const handleClick = () => {
    router.push(href)
    onClick()
  }
  
  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      {label}
    </button>
  )
}