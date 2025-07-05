'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { supabase } from '@/lib/supabase'

export default function AuthDebugPage() {
  const { user, loading, userRole, isAdmin } = useSupabase()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testing, setTesting] = useState(false)

  const runDebugTest = async () => {
    setTesting(true)
    const results: any = {}

    try {
      // 1. Check current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      results.session = {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        userEmail: sessionData.session?.user?.email,
        error: sessionError
      }

      // 2. Check user in users table
      if (sessionData.session?.user?.id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()

        results.userInUsersTable = {
          found: !!userData,
          data: userData,
          error: userError
        }

        // 3. Check user role specifically
        const { data: roleData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single()

        results.roleCheck = {
          role: roleData?.role,
          isAdmin: roleData?.role === 'admin',
          error: roleError
        }

        // 4. Check if admin user exists by email
        const { data: adminCheck, error: adminError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'armazemsaojoaquimoficial@gmail.com')
          .single()

        results.adminUserExists = {
          found: !!adminCheck,
          data: adminCheck,
          error: adminError
        }
      }

      // 5. Test middleware endpoint
      try {
        const response = await fetch('/api/test-auth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const testData = await response.json()
        results.middlewareTest = {
          status: response.status,
          data: testData
        }
      } catch (error: any) {
        results.middlewareTest = {
          error: error.message
        }
      }

      // 6. Provider state
      results.providerState = {
        user: !!user,
        userEmail: user?.email,
        userRole,
        isAdmin,
        loading
      }

    } catch (error: any) {
      results.error = error.message
    }

    setDebugInfo(results)
    setTesting(false)
  }

  useEffect(() => {
    if (!loading) {
      runDebugTest()
    }
  }, [loading])

  const simulateAdminLogin = async () => {
    try {
      console.log('🔄 Simulando login admin...')
      
      // Simular o fluxo exato do login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: 'armazemsaojoaquimoficial@gmail.com',
        password: 'sua_senha_aqui' // VOCÊ PRECISA INSERIR A SENHA CORRETA
      })

      if (error) {
        console.error('❌ Erro no login:', error)
        alert(`Erro no login: ${error.message}`)
        return
      }

      console.log('✅ Login realizado, aguardando propagação...')
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('🔍 Verificando role...')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      console.log('📊 Dados do usuário:', userData, 'Erro:', userError)

      if (!userError && userData?.role === 'admin') {
        console.log('🔐 Admin confirmado, redirecionando...')
        window.location.href = '/admin'
      } else {
        console.log('❌ Não é admin ou erro:', { userData, userError })
        alert(`Usuário não é admin. Role: ${userData?.role || 'undefined'}`)
      }

    } catch (error: any) {
      console.error('❌ Erro inesperado:', error)
      alert(`Erro inesperado: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔍 Debug de Autenticação Admin
        </h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Estado Atual
              </h2>
              <button
                onClick={runDebugTest}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? 'Testando...' : 'Executar Teste'}
              </button>
            </div>

            {Object.keys(debugInfo).length > 0 && (
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🧪 Teste Manual
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Clique para simular o login admin e ver onde falha:
            </p>
            <button
              onClick={simulateAdminLogin}
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔐 Simular Login Admin
            </button>
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Você precisa inserir a senha correta no código acima
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📋 Checklist de Debug
            </h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <div>✅ Usuário admin existe no banco: armazemsaojoaquimoficial@gmail.com</div>
              <div>❓ Sessão é válida após login</div>
              <div>❓ Usuário está na tabela 'users' com role 'admin'</div>
              <div>❓ Middleware detecta sessão corretamente</div>
              <div>❓ requireAdmin() valida role corretamente</div>
              <div>❓ Redirecionamento funciona</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🔗 Links Rápidos
            </h2>
            <div className="space-x-4">
              <a href="/auth" className="text-blue-600 hover:underline">Login</a>
              <a href="/admin" className="text-red-600 hover:underline">Admin (deve falhar)</a>
              <a href="/" className="text-green-600 hover:underline">Home</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}