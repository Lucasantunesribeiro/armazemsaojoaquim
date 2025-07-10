'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function AuthDebugPage() {
  const { user, loading, isAdmin, supabase } = useSupabase()
  const [apiTests, setApiTests] = useState<any>({})
  const [testingApis, setTestingApis] = useState(false)

  const testAPIs = async () => {
    setTestingApis(true)
    const tests: any = {}

    try {
      // Test test-auth API
      const testAuthResponse = await fetch('/api/test-auth', {
        credentials: 'include'
      })
      tests.testAuth = {
        status: testAuthResponse.status,
        ok: testAuthResponse.ok,
        data: testAuthResponse.ok ? await testAuthResponse.json() : await testAuthResponse.text()
      }
    } catch (error) {
      tests.testAuth = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    try {
      // Test admin users API
      const usersResponse = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      tests.adminUsers = {
        status: usersResponse.status,
        ok: usersResponse.ok,
        data: usersResponse.ok ? await usersResponse.json() : await usersResponse.text()
      }
    } catch (error) {
      tests.adminUsers = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    try {
      // Test admin reservas API
      const reservasResponse = await fetch('/api/admin/reservas', {
        credentials: 'include'
      })
      tests.adminReservas = {
        status: reservasResponse.status,
        ok: reservasResponse.ok,
        data: reservasResponse.ok ? await reservasResponse.json() : await reservasResponse.text()
      }
    } catch (error) {
      tests.adminReservas = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    setApiTests(tests)
    setTestingApis(false)
  }

  useEffect(() => {
    if (!loading && user) {
      testAPIs()
    }
  }, [loading, user])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Debug de Autenticação</h1>
        
        {/* Provider State */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Estado do SupabaseProvider</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Tem usuário:</strong> {user ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </div>
            <div>
              <strong>É Admin:</strong> {isAdmin ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>User ID:</strong> {user?.id || 'N/A'}
            </div>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cookies do Browser</h2>
          <div className="text-sm">
            <strong>Document Cookies:</strong>
            <pre className="mt-2 p-3 bg-gray-100 rounded overflow-x-auto">
              {typeof document !== 'undefined' ? document.cookie : 'Server-side render'}
            </pre>
          </div>
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Testes de API</h2>
            <button
              onClick={testAPIs}
              disabled={testingApis}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testingApis ? 'Testando...' : 'Testar APIs'}
            </button>
          </div>

          {Object.keys(apiTests).length > 0 && (
            <div className="space-y-4">
              {Object.entries(apiTests).map(([apiName, result]: [string, any]) => (
                <div key={apiName} className="border rounded p-4">
                  <h3 className="font-medium mb-2">{apiName}</h3>
                  <div className="text-sm">
                    <div><strong>Status:</strong> {result.status}</div>
                    <div><strong>OK:</strong> {result.ok ? 'Sim' : 'Não'}</div>
                    <div><strong>Response:</strong></div>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ir para Admin
            </button>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Ir para Auth
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 