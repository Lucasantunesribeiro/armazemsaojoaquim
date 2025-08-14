'use client'

import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { use } from 'react'
import { createClient } from '@/lib/supabase'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { 
  Menu, 
  X, 
  Clock, 
  AlertTriangle,
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  Utensils,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
// Lazy load heavy admin components
const AdminNotificationCenter = lazy(() => import('@/components/ui/AdminNotificationCenter'))
const AdminProfileSetup = lazy(() => import('@/components/admin/AdminProfileSetup'))
import { initializeSessionTimeout, useSessionTimeout, formatRemainingTime } from '@/lib/session-timeout'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function AdminLayout({
  children,
  params
}: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Debug info removed to prevent interference with child components
  const [locale, setLocale] = useState<string>('pt')
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [sessionManager, setSessionManager] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

  const supabase = createClient()

  // Desempacotar params usando React.use()
  const resolvedParams = use(params)
  
  // Definir locale diretamente dos params
  useEffect(() => {
    setLocale(resolvedParams.locale || 'pt')
  }, [resolvedParams.locale])

  const checkAuth = useCallback(async () => {
    console.log('🔍 AdminLayout: === INICIANDO VERIFICAÇÃO DE AUTENTICAÇÃO ===')
    
    try {
      setError('')
      
      // Step 1: Verificar sessão atual
      console.log('🔍 AdminLayout: [STEP 1] Verificando sessão...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ AdminLayout: [STEP 1] Erro na sessão:', sessionError)
        setError(`Erro na sessão: ${sessionError.message}`)
        router.push(`/${locale}/auth?message=Erro+na+sessão`)
        return
      }

      if (!session || !session.user) {
        console.log('❌ AdminLayout: [STEP 1] Sem sessão ativa')
        setError('Nenhuma sessão ativa encontrada')
        router.push(`/${locale}/auth?message=Faça+login+para+acessar+o+painel+administrativo`)
        return
      }

      console.log('✅ AdminLayout: [STEP 1] Sessão encontrada:', {
        email: session.user.email,
        id: session.user.id,
        created_at: session.user.created_at
      })
      setUser(session.user)

      // Step 2: Verificação direta por email (fallback primário)
      console.log('🔍 AdminLayout: [STEP 2] Verificação direta por email...')
      if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('✅ AdminLayout: [STEP 2] ADMIN CONFIRMADO POR EMAIL DIRETO!')
        // Admin confirmed by email
        setIsAdmin(true)
        
        // Start session timeout monitoring for admin
        if (sessionManager) {
          sessionManager.start()
        }
        
        return
      }
      
      // Email is not admin, trying APIs

      // Step 3: Verificar através da API
      console.log('🔍 AdminLayout: [STEP 3] Tentando API /api/admin/check-role...')
      try {
        const response = await fetch('/api/admin/check-role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        })

        console.log('🔍 AdminLayout: [STEP 3] Response status:', response.status)

        if (!response.ok) {
          console.error('❌ AdminLayout: [STEP 3] API retornou erro:', {
            status: response.status,
            statusText: response.statusText
          })
          
          // Tentar ler detalhes do erro
          try {
            const errorData = await response.json()
            console.error('❌ AdminLayout: [STEP 3] Detalhes do erro:', errorData)
            
            // Se API falhou mas email é admin, continuar
            if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
              console.log('⚠️ AdminLayout: [STEP 3] API falhou mas email é admin - PERMITINDO ACESSO')
              setIsAdmin(true)
              return
            }
          } catch (parseError) {
            console.error('❌ AdminLayout: [STEP 3] Não foi possível ler erro da API:', parseError)
          }
          
          setError(`API error (${response.status}): ${response.statusText}`)
          router.push(`/${locale}/auth?message=Erro+ao+verificar+permissões`)
          return
        }

        const roleData = await response.json()
        console.log('✅ AdminLayout: [STEP 3] API Response:', roleData)

        if (roleData.isAdmin) {
          console.log('✅ AdminLayout: [STEP 3] ADMIN CONFIRMADO VIA API!')
          setIsAdmin(true)
          return
        } else {
          console.log('❌ AdminLayout: [STEP 3] API indicou não-admin:', {
            email: session.user.email,
            isAdmin: roleData.isAdmin,
            error: roleData.error,
            debug: roleData.debug
          })
          
          // Fallback final: se email é admin mas API disse não, forçar sim
          if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
            console.log('⚠️ AdminLayout: [STEP 3] OVERRIDE: Email é admin, ignorando API - PERMITINDO ACESSO')
            setIsAdmin(true)
            return
          }
        }

      } catch (apiError: any) {
        console.error('❌ AdminLayout: [STEP 3] Erro ao chamar API:', apiError)
        
        // Fallback: se erro na API mas email é admin, permitir
        if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('✅ AdminLayout: [STEP 3] Erro na API mas email é admin - PERMITINDO ACESSO')
          setIsAdmin(true)
          return
        }
        
        setError(`Erro na API: ${apiError.message}`)
        router.push(`/${locale}/auth?message=Erro+ao+verificar+permissões`)
        return
      }

      // Step 4: Tentativa alternativa com /api/auth/check-role
      console.log('🔍 AdminLayout: [STEP 4] Tentando API alternativa /api/auth/check-role...')
      try {
        const response = await fetch('/api/auth/check-role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const roleData = await response.json()
          console.log('✅ AdminLayout: [STEP 4] API alternativa response:', roleData)
          
          if (roleData.isAdmin) {
            console.log('✅ AdminLayout: [STEP 4] ADMIN CONFIRMADO VIA API ALTERNATIVA!')
            setIsAdmin(true)
            return
          }
        }
      } catch (altApiError) {
        console.log('⚠️ AdminLayout: [STEP 4] API alternativa também falhou:', altApiError)
      }

      // Se chegou até aqui, verificar se é o email admin que precisa de setup
      if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('⚠️ AdminLayout: Email é admin mas sem perfil - PRECISA DE SETUP')
        setUser(session.user)
        setNeedsProfileSetup(true)
        setLoading(false)
        return
      }

      // Se não é admin, negar acesso
      console.log('❌ AdminLayout: ACESSO NEGADO - Nenhuma verificação passou')
      setError('Acesso negado - usuário não é administrador')
      router.push(`/${locale}/auth?message=Acesso+negado+ao+painel+administrativo`)

    } catch (error: any) {
      console.error('❌ AdminLayout: [ERRO GERAL]:', error)
      
      // Última tentativa: verificar sessão novamente
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession?.user?.email === 'armazemsaojoaquimoficial@gmail.com') {
          console.log('⚠️ AdminLayout: [ERRO GERAL] Email é admin - PERMITINDO ACESSO FINAL')
          setUser(currentSession.user)
          setIsAdmin(true)
          return
        }
      } catch (finalError) {
        console.error('❌ AdminLayout: [ERRO GERAL] Erro na verificação final:', finalError)
      }
      
      setError('Erro crítico na autenticação: ' + error.message)
    } finally {
      console.log('🏁 AdminLayout: === VERIFICAÇÃO FINALIZADA ===')
      setLoading(false)
    }
  }, [router, supabase, locale])

  useEffect(() => {
    checkAuth()

    // Initialize session timeout for admin users
    const manager = initializeSessionTimeout({
      onWarning: () => {
        console.log('⚠️ AdminLayout: Session expiring soon')
        setShowSessionWarning(true)
      },
      onTimeout: () => {
        console.log('⏰ AdminLayout: Session expired')
        setUser(null)
        setIsAdmin(false)
        setShowSessionWarning(false)
        router.push(`/${locale}/auth?message=Sua+sessão+expirou.+Faça+login+novamente.&timeout=true`)
      }
    })
    
    setSessionManager(manager)

    // Listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 AdminLayout: Auth state changed:', event)
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setIsAdmin(false)
          setShowSessionWarning(false)
          manager.stop()
          router.push(`/${locale}/auth?message=Sessão+expirada`)
        } else if (event === 'SIGNED_IN' && session) {
          setLoading(true)
          manager.start()
          await checkAuth()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      manager.stop()
    }
  }, [checkAuth, router, supabase, locale])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push(`/${locale}/auth?message=Logout+realizado+com+sucesso`)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verificando Autenticação
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Validando suas credenciais de administrador...
          </p>
          {/* Debug info removed to prevent interference */}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Erro de Autenticação</h2>
            <p className="text-sm mb-4">{error}</p>
            {user && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded text-sm">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Usuário logado:</strong> {user.email}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoading(true)
                setError('')
                checkAuth()
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => router.push(`/${locale}/auth`)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Fazer Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Recarregar Página
            </button>
          </div>
          
          {/* Debug details removed to prevent interference */}
        </div>
      </div>
    )
  }

  if (needsProfileSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AdminProfileSetup 
            onComplete={() => {
              setNeedsProfileSetup(false)
              checkAuth()
            }} 
          />
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

  // Navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      current: pathname === `/${locale}/admin`
    },
    {
      name: 'Menu',
      href: `/${locale}/admin/menu`,
      icon: Utensils,
      current: pathname.startsWith(`/${locale}/admin/menu`)
    },
    {
      name: 'Pousadas',
      href: `/${locale}/admin/pousadas`,
      icon: Building2,
      current: pathname.startsWith(`/${locale}/admin/pousadas`)
    },
    {
      name: 'Blog',
      href: `/${locale}/admin/blog`,
      icon: FileText,
      current: pathname.startsWith(`/${locale}/admin/blog`)
    },
    {
      name: 'Usuários',
      href: `/${locale}/admin/usuarios`,
      icon: Users,
      current: pathname.startsWith(`/${locale}/admin/usuarios`)
    },
    {
      name: 'Configurações',
      href: `/${locale}/admin/configuracoes`,
      icon: Settings,
      current: pathname.startsWith(`/${locale}/admin/configuracoes`)
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Session Warning Banner */}
      {showSessionWarning && (
        <SessionWarningBanner 
          onExtend={() => {
            if (sessionManager) {
              sessionManager.extendSession()
              setShowSessionWarning(false)
            }
          }}
          onLogout={() => {
            if (sessionManager) {
              sessionManager.stop()
            }
            supabase.auth.signOut()
          }}
        />
      )}

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        <AdminSidebar 
          navigationItems={navigationItems}
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminSidebar 
          navigationItems={navigationItems}
          user={user}
          collapsed={false}
          onToggleCollapse={() => {}}
          onLogout={handleLogout}
          mobile
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title - will be updated by individual pages */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                Painel Administrativo
              </h1>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              <Suspense fallback={<div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />}>
                <AdminNotificationCenter />
              </Suspense>
              
              {/* User info - desktop only */}
              <div className="hidden sm:flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-32">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

// Sidebar Component
interface AdminSidebarProps {
  navigationItems: Array<{
    name: string
    href: string
    icon: any
    current: boolean
  }>
  user: User
  collapsed: boolean
  onToggleCollapse: () => void
  onLogout: () => void
  mobile?: boolean
  onClose?: () => void
}

function AdminSidebar({ 
  navigationItems, 
  user, 
  collapsed, 
  onToggleCollapse, 
  onLogout,
  mobile = false,
  onClose
}: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {(!collapsed || mobile) && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Armazém São Joaquim
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Admin Panel
              </span>
            </div>
          </div>
        )}
        
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        {!mobile && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.current
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={collapsed && !mobile ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 ${collapsed && !mobile ? '' : 'mr-3'}`} />
              {(!collapsed || mobile) && item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {(!collapsed || mobile) && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.email?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Administrador
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
            collapsed && !mobile ? 'justify-center' : ''
          }`}
          title={collapsed && !mobile ? 'Logout' : undefined}
        >
          <LogOut className={`h-5 w-5 ${collapsed && !mobile ? '' : 'mr-3'}`} />
          {(!collapsed || mobile) && 'Logout'}
        </button>
      </div>
    </div>
  )
}

// Session Warning Banner Component
function SessionWarningBanner({ onExtend, onLogout }: { 
  onExtend: () => void
  onLogout: () => void 
}) {
  const { remainingTime, formatTime } = useSessionTimeout()
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Sua sessão expirará em breve
              </span>
              <span className="text-xs text-yellow-700 dark:text-yellow-300 sm:ml-2">
                <Clock className="h-3 w-3 inline mr-1" />
                {formatTime(remainingTime)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onExtend}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Estender Sessão
            </button>
            <button
              onClick={onLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}