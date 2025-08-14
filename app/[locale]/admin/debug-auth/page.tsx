'use client'

import { useAdmin } from '@/hooks/useAdmin'
import { useAdminApi } from '@/lib/hooks/useAdminApi'
import { useState } from 'react'

export default function DebugAuthPage() {
  const adminState = useAdmin()
  const { isAuthorized, isLoading: adminApiLoading, adminFetch } = useAdminApi()
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  const testMenuAPI = async () => {
    try {
      setTestLoading(true)
      setTestResult(null)
      
      console.log('🧪 [TEST] Testando API do menu...')
      const result = await adminFetch('/api/admin/menu')
      setTestResult({ success: true, data: result, length: Array.isArray(result) ? result.length : 'N/A' })
      console.log('✅ [TEST] API funcionou:', result)
      
    } catch (error) {
      console.error('❌ [TEST] API falhou:', error)
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Debug Admin Auth</h1>
      
      {/* useAdmin Hook State */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">useAdmin Hook State</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Loading:</strong> {String(adminState.loading)}
          </div>
          <div>
            <strong>IsAdmin:</strong> {String(adminState.isAdmin)}
          </div>
          <div>
            <strong>HasProfile:</strong> {String(adminState.hasProfile)}
          </div>
          <div>
            <strong>Verification Method:</strong> {adminState.verificationMethod || 'None'}
          </div>
          <div>
            <strong>User Email:</strong> {adminState.user?.email || 'None'}
          </div>
          <div>
            <strong>Error:</strong> {adminState.error || 'None'}
          </div>
        </div>
      </div>

      {/* useAdminApi Hook State */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">useAdminApi Hook State</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>IsAuthorized:</strong> {String(isAuthorized)}
          </div>
          <div>
            <strong>AdminApiLoading:</strong> {String(adminApiLoading)}
          </div>
        </div>
      </div>

      {/* API Test */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">API Test</h2>
        <button
          onClick={testMenuAPI}
          disabled={testLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {testLoading ? 'Testando...' : 'Testar API Menu'}
        </button>
        
        {testResult && (
          <div className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-700">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Raw Data */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Raw State Data</h2>
        <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-700 p-3 rounded">
          {JSON.stringify({ adminState, isAuthorized, adminApiLoading }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
