'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { toast } from 'react-hot-toast'

interface DiagnosticResult {
  check: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

export default function SupabaseDiagnosticPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [loading, setLoading] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: DiagnosticResult[] = []

    try {
      // 1. Verificar conexão com Supabase
      try {
        const { data, error } = await supabase.auth.getSession()
        diagnostics.push({
          check: 'Conexão Supabase',
          status: error ? 'error' : 'success',
          message: error ? `Erro: ${error.message}` : 'Conectado com sucesso',
          details: { session: !!data.session }
        })
      } catch (error: any) {
        diagnostics.push({
          check: 'Conexão Supabase',
          status: 'error',
          message: `Falha na conexão: ${error.message}`,
          details: error
        })
      }

      // 2. Verificar configurações de URL
      const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      const redirectUrl = `${siteUrl}/auth/callback?type=recovery`
      
      diagnostics.push({
        check: 'URLs de Redirecionamento',
        status: 'success',
        message: 'URLs configuradas',
        details: {
          siteUrl,
          redirectUrl,
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'unknown'
        }
      })

      // 3. Verificar configurações de autenticação
      try {
        const { data: user } = await supabase.auth.getUser()
        diagnostics.push({
          check: 'Estado do Usuário',
          status: user.user ? 'success' : 'warning',
          message: user.user ? 'Usuário autenticado' : 'Nenhum usuário autenticado',
          details: {
            userId: user.user?.id,
            email: user.user?.email,
            emailConfirmed: user.user?.email_confirmed_at
          }
        })
      } catch (error: any) {
        diagnostics.push({
          check: 'Estado do Usuário',
          status: 'error',
          message: `Erro ao verificar usuário: ${error.message}`,
          details: error
        })
      }

      // 4. Verificar configurações de ambiente
      const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'
      }

      diagnostics.push({
        check: 'Variáveis de Ambiente',
        status: Object.values(envVars).every(v => v === 'Configurado') ? 'success' : 'error',
        message: 'Verificação de variáveis de ambiente',
        details: envVars
      })

    } catch (error: any) {
      diagnostics.push({
        check: 'Diagnóstico Geral',
        status: 'error',
        message: `Erro durante diagnóstico: ${error.message}`,
        details: error
      })
    }

    setResults(diagnostics)
    setLoading(false)
  }

  const testPasswordReset = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste')
      return
    }

    setLoading(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback?type=recovery`
      console.log('🔗 Testando reset com redirect:', redirectTo)
      
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo
      })

      if (error) {
        toast.error(`Erro no teste: ${error.message}`)
        setResults(prev => [...prev, {
          check: 'Teste de Reset',
          status: 'error',
          message: `Falha: ${error.message}`,
          details: { email: testEmail, redirectTo, error }
        }])
      } else {
        toast.success('Email de teste enviado com sucesso!')
        setResults(prev => [...prev, {
          check: 'Teste de Reset',
          status: 'success',
          message: 'Email de reset enviado com sucesso',
          details: { email: testEmail, redirectTo }
        }])
      }
    } catch (error: any) {
      toast.error(`Erro inesperado: ${error.message}`)
      setResults(prev => [...prev, {
        check: 'Teste de Reset',
        status: 'error',
        message: `Erro inesperado: ${error.message}`,
        details: error
      }])
    }
    setLoading(false)
  }

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-700 bg-green-50 border-green-200'
      case 'error': return 'text-red-700 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold text-amber-900">🔍 Diagnóstico Supabase</h1>
            <p className="text-amber-700">Verificação de configurações e teste de reset de senha</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Email para teste de reset:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <Button 
                onClick={testPasswordReset}
                disabled={loading || !testEmail}
                className="bg-amber-600 hover:bg-amber-700"
              >
                🧪 Testar Reset
              </Button>
            </div>
            
            <Button 
              onClick={runDiagnostics}
              disabled={loading}
              variant="outline"
              className="w-full border-amber-200 hover:bg-amber-50"
            >
              {loading ? '🔄 Executando...' : '🔍 Executar Diagnósticos'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index} className={`border-2 ${getStatusColor(result.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <h3 className="font-semibold">{result.check}</h3>
                    </div>
                    <p className="text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium mb-1">Ver detalhes</summary>
                        <pre className="bg-black/5 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-amber-700">Clique em "Executar Diagnósticos" para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 