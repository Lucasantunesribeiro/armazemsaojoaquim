'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

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
      
      // If it's a general error but user email is admin, try to continue
      if (session?.user?.email === 'armazemsaojoaquimoficial@gmail.com') {
        console.log('⚠️ AdminLayout: Erro geral mas email é admin - tentando continuar')
        setUser(session.user)
        setIsAdmin(true)
      } else {
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

  // Renderizar layout admin com navegação
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminNavbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

// Navbar do Admin
function AdminNavbar({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth?message=Logout+realizado+com+sucesso')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin - Armazém São Joaquim
            </h1>
            
            <div className="hidden md:flex space-x-4">
              <NavLink href="/admin" label="Dashboard" />
              <NavLink href="/admin/reservas" label="Reservas" />
              <NavLink href="/admin/usuarios" label="Usuários" />
              <NavLink href="/admin/menu" label="Menu" />
              <NavLink href="/admin/blog" label="Blog" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Link de navegação
function NavLink({ href, label }: { href: string; label: string }) {
  const router = useRouter()
  
  return (
    <button
      onClick={() => router.push(href)}
      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {label}
    </button>
  )
}