'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface OAuthDebugInfo {
  url: string
  searchParams: Record<string, string>
  hasError: boolean
  errorDetails: any
  hasCode: boolean
  timestamp: string
}

export default function OAuthDebugger() {
  const [debugInfo, setDebugInfo] = useState<OAuthDebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV !== 'development') return

    const url = window.location.href
    const searchParams = new URLSearchParams(window.location.search)
    
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const hasError = !!params.error
    const hasCode = !!params.code

    const info: OAuthDebugInfo = {
      url,
      searchParams: params,
      hasError,
      errorDetails: hasError ? {
        error: params.error,
        errorCode: params.error_code,
        errorDescription: params.error_description
      } : null,
      hasCode,
      timestamp: new Date().toISOString()
    }

    setDebugInfo(info)
    
    // Mostrar automaticamente se há erro ou código
    if (hasError || hasCode) {
      setIsVisible(true)
    }
  }, [])

  const testOAuthConnection = async () => {
    try {
      const supabase = createClient()
      
      console.log('🧪 Testando conexão OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('❌ Erro no teste OAuth:', error)
        alert(`Erro OAuth: ${error.message}`)
      } else {
        console.log('✅ Teste OAuth iniciado:', data)
        alert('Teste OAuth iniciado - verifique o redirecionamento')
      }
    } catch (err) {
      console.error('💥 Erro no teste:', err)
      alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`)
    }
  }

  if (!debugInfo || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md z-50 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-red-800">🐛 OAuth Debugger</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>URL:</strong> {debugInfo.url}
        </div>
        
        <div>
          <strong>Parâmetros:</strong>
          <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto">
            {JSON.stringify(debugInfo.searchParams, null, 2)}
          </pre>
        </div>
        
        {debugInfo.hasError && (
          <div className="text-red-600">
            <strong>❌ Erro detectado:</strong>
            <pre className="bg-red-100 p-2 rounded text-xs mt-1">
              {JSON.stringify(debugInfo.errorDetails, null, 2)}
            </pre>
          </div>
        )}
        
        {debugInfo.hasCode && (
          <div className="text-green-600">
            <strong>✅ Código OAuth detectado</strong>
          </div>
        )}
        
        <div className="text-gray-600">
          <strong>Timestamp:</strong> {debugInfo.timestamp}
        </div>
      </div>
      
      <div className="mt-3 space-x-2">
        <button
          onClick={testOAuthConnection}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          Testar OAuth
        </button>
        
        <button
          onClick={() => {
            console.log('🔍 Debug Info:', debugInfo)
            alert('Informações de debug logadas no console')
          }}
          className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
        >
          Log Console
        </button>
      </div>
    </div>
  )
} 