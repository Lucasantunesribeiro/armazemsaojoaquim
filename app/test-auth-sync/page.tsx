'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Session } from '@supabase/supabase-js'

export default function TestAuthSyncPage() {
  const { user, session, loading, isAdmin, supabase } = useSupabase()
  const [serverSession, setServerSession] = useState<Session | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)

  // Test server APIs
  const testServerApis = async () => {
    setTesting(true)
    try {
      // Test all admin APIs
      const apis = [
        { name: 'test-auth', url: '/api/test-auth' },
        { name: 'admin-users', url: '/api/admin/users' },
        { name: 'admin-reservas', url: '/api/admin/reservas' }
      ]

      const results: any = {}

      for (const api of apis) {
        try {
          const response = await fetch(api.url, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          results[api.name] = {
            status: response.status,
            ok: response.ok,
            data: response.ok ? await response.json() : await response.text()
          }
        } catch (error: any) {
          results[api.name] = {
            error: error.message
          }
        }
      }

      setTestResults(results)
    } catch (error: any) {
      console.error('Erro ao testar APIs:', error)
    } finally {
      setTesting(false)
    }
  }

  // Check current browser session
  useEffect(() => {
    if (!loading && supabase) {
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        setServerSession(session)
      })
    }
  }, [loading, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-2xl font-bold mb-4">⏳ Carregando...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔄 Teste de Sincronização Auth</h1>
      
      {/* Client State */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📱 Estado do Cliente (SupabaseProvider)</h2>
        <div className="space-y-2">
          <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
          <p><strong>Tem usuário:</strong> {user ? 'Sim' : 'Não'}</p>
          {user && (
            <>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
            </>
          )}
          <p><strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}</p>
          <p><strong>Tem Session:</strong> {session ? 'Sim' : 'Não'}</p>
        </div>
      </div>

      {/* Direct Browser Session */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🌐 Sessão Direta do Browser</h2>
        <div className="space-y-2">
          <p><strong>Tem Session:</strong> {serverSession ? 'Sim' : 'Não'}</p>
          {serverSession && (
            <>
              <p><strong>Email:</strong> {serverSession.user?.email}</p>
              <p><strong>User ID:</strong> {serverSession.user?.id}</p>
            </>
          )}
        </div>
      </div>

      {/* Cookies */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🍪 Cookies do Browser</h2>
        <div className="text-sm">
          <p><strong>Document Cookies:</strong></p>
          <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto text-xs">
            {typeof document !== 'undefined' ? document.cookie : 'N/A'}
          </pre>
        </div>
      </div>

      {/* API Tests */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔧 Testes de API</h2>
        <button
          onClick={testServerApis}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {testing ? 'Testando...' : 'Testar APIs'}
        </button>

        {testResults && (
          <div className="space-y-4">
            {Object.entries(testResults).map(([apiName, result]: [string, any]) => (
              <div key={apiName} className="border-l-4 border-gray-400 pl-4">
                <h3 className="font-semibold">{apiName}</h3>
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>OK:</strong> {result.ok ? 'Sim' : 'Não'}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Response:</summary>
                    <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto text-xs">
                      {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                {result.error && (
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-x-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Ir para Admin
        </a>
        <a
          href="/auth"
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Ir para Auth
        </a>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  )
} 