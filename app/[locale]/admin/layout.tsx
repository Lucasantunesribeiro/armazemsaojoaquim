'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { createClient } from '@/lib/supabase'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Menu, X } from 'lucide-react'
import AdminNotificationCenter from '@/components/ui/AdminNotificationCenter'

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function AdminLayout({
  children,
  params
}: AdminLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [locale, setLocale] = useState<string>('pt')

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
      setDebugInfo(prev => [...prev, `✅ Sessão: ${session.user.email}`])

      // Step 2: Verificação direta por email (fallback primário)
      console.log('🔍 AdminLayout: [STEP 2] Verificação direta por email...')
      if (session.user.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('✅ AdminLayout: [STEP 2] ADMIN CONFIRMADO POR EMAIL DIRETO!')
        setDebugInfo(prev => [...prev, '✅ Admin confirmado por email direto'])
        setIsAdmin(true)
        return
      }
      
      setDebugInfo(prev => [...prev, '❌ Email não é admin, tentando APIs...'])

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

      // Se chegou até aqui, negar acesso
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

    // Listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 AdminLayout: Auth state changed:', event)
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setIsAdmin(false)
          router.push(`/${locale}/auth?message=Sessão+expirada`)
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
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verificando Autenticação
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Validando suas credenciais de administrador...
          </p>
          {debugInfo.length > 0 && (
            <div className="text-left bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Debug Info:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="text-gray-600 dark:text-gray-400">{info}</p>
              ))}
            </div>
          )}
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
          
          {debugInfo.length > 0 && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Mostrar informações técnicas
              </summary>
              <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-xs font-mono">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-700 dark:text-gray-300 py-1">{info}</div>
                ))}
              </div>
            </details>
          )}
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
      <AdminNavbar user={user} locale={locale} />
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {children}
      </main>
    </div>
  )
}

// Navbar do Admin Responsiva
function AdminNavbar({ user, locale }: { user: User; locale: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push(`/${locale}/auth?message=Logout+realizado+com+sucesso`)
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
            <NavLink href={`/${locale}/admin`} label="Dashboard" />
            <NavLink href={`/${locale}/admin/reservas`} label="Reservas" />
            <NavLink href={`/${locale}/admin/usuarios`} label="Usuários" />
            <NavLink href={`/${locale}/admin/menu`} label="Menu" />
            <NavLink href={`/${locale}/admin/pousada`} label="Pousada" />
            <NavLink href={`/${locale}/admin/cafe`} label="Café" />
            <NavLink href={`/${locale}/admin/blog`} label="Blog" />
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
            <NavLink href={`/${locale}/admin`} label="Dashboard" compact />
            <NavLink href={`/${locale}/admin/reservas`} label="Reservas" compact />
            <NavLink href={`/${locale}/admin/usuarios`} label="Usuários" compact />
            <NavLink href={`/${locale}/admin/menu`} label="Menu" compact />
            <NavLink href={`/${locale}/admin/pousada`} label="Pousada" compact />
            <NavLink href={`/${locale}/admin/cafe`} label="Café" compact />
            <NavLink href={`/${locale}/admin/blog`} label="Blog" compact />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
            <div className="flex flex-col space-y-1">
              <MobileNavLink href={`/${locale}/admin`} label="Dashboard" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/reservas`} label="Reservas" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/usuarios`} label="Usuários" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/menu`} label="Menu" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/pousada`} label="Pousada" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/cafe`} label="Café" onClick={closeMenu} />
              <MobileNavLink href={`/${locale}/admin/blog`} label="Blog" onClick={closeMenu} />
              
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