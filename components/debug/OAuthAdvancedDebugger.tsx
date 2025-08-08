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
  networkInfo: any
  browserInfo: any
}

export default function OAuthAdvancedDebugger() {
  const [debugInfo, setDebugInfo] = useState<OAuthDebugInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

    // Coletar informações do navegador
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform
    }

    // Coletar informações de rede
    const networkInfo = {
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null,
      timing: performance.timing ? {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd
      } : null
    }

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
      timestamp: new Date().toISOString(),
      networkInfo,
      browserInfo
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

  const copyDebugInfo = () => {
    if (debugInfo) {
      const debugString = JSON.stringify(debugInfo, null, 2)
      navigator.clipboard.writeText(debugString)
      alert('Informações de debug copiadas para a área de transferência')
    }
  }

  const analyzeError = () => {
    if (!debugInfo) return

    console.log('🔍 Análise detalhada do erro OAuth:')
    console.log('1. URL completa:', debugInfo.url)
    console.log('2. Parâmetros:', debugInfo.searchParams)
    console.log('3. Informações do navegador:', debugInfo.browserInfo)
    console.log('4. Informações de rede:', debugInfo.networkInfo)
    
    // Análise específica
    if (debugInfo.hasError && !debugInfo.errorDetails?.error) {
      console.log('⚠️ Erro vazio detectado - possíveis causas:')
      console.log('   - Problema de CORS')
      console.log('   - URL de redirecionamento incorreta')
      console.log('   - Provider OAuth não configurado')
      console.log('   - Token expirado')
    }
  }

  if (!debugInfo || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg z-50 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-red-800">🐛 OAuth Advanced Debugger</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>URL:</strong> {debugInfo.url}
        </div>
        
        <div>
          <strong>Parâmetros:</strong>
          <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto max-h-20">
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
        
        {isExpanded && (
          <div className="space-y-2">
            <div>
              <strong>Navegador:</strong>
              <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto max-h-16">
                {JSON.stringify(debugInfo.browserInfo, null, 2)}
              </pre>
            </div>
            
            <div>
              <strong>Rede:</strong>
              <pre className="bg-white p-2 rounded text-xs mt-1 overflow-auto max-h-16">
                {JSON.stringify(debugInfo.networkInfo, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-x-2">
        <button
          onClick={testOAuthConnection}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          Testar OAuth
        </button>
        
        <button
          onClick={analyzeError}
          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
        >
          Analisar
        </button>
        
        <button
          onClick={copyDebugInfo}
          className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
        >
          Copiar
        </button>
      </div>
    </div>
  )
} 