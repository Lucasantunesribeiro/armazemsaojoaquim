'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RefreshCw, Eye, EyeOff, AlertTriangle, CheckCircle, Cookie, Database } from 'lucide-react'

interface DebugInfo {
  hasSession: boolean
  userEmail: string | null
  isAdmin: boolean
  tokenExpiry: string | null
  localStorageData: boolean
  cookiesData: boolean
  apiTest: 'pending' | 'success' | 'error' | 'not-tested'
  apiError: string | null
  sessionDetails: any
  cookieDetails: any
}

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasSession: false,
    userEmail: null,
    isAdmin: false,
    tokenExpiry: null,
    localStorageData: false,
    cookiesData: false,
    apiTest: 'not-tested',
    apiError: null,
    sessionDetails: null,
    cookieDetails: null
  })
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const checkAuthStatus = async () => {
    setLoading(true)
    
    try {
      // Verificar sessão
      const { data: { session }, error } = await supabase.auth.getSession()
      
      const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
      const isAdmin = session ? adminEmails.includes(session.user.email || '') : false
      
      // Verificar localStorage
      let localStorageData = false
      if (typeof window !== 'undefined') {
        const authKey = 'armazem-sao-joaquim-auth'
        const stored = localStorage.getItem(authKey)
        localStorageData = !!stored
      }

      // Verificar cookies
      let cookiesData = false
      let cookieDetails = null
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => 
          cookie.trim().startsWith('armazem-sao-joaquim-auth=')
        )
        cookiesData = !!authCookie
        cookieDetails = {
          total: cookies.length,
          authCookie: authCookie ? 'presente' : 'ausente',
          allCookies: cookies.map(c => c.trim().split('=')[0])
        }
      }

      setDebugInfo({
        hasSession: !!session,
        userEmail: session?.user?.email || null,
        isAdmin,
        tokenExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
        localStorageData,
        cookiesData,
        apiTest: 'not-tested',
        apiError: null,
        sessionDetails: session ? {
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at,
          expires_at: session.expires_at,
          access_token_length: session.access_token?.length || 0,
          refresh_token_length: session.refresh_token?.length || 0
        } : null,
        cookieDetails
      })

    } catch (error) {
      console.error('Erro ao verificar status:', error)
    } finally {
      setLoading(false)
    }
  }

  const testApi = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, apiTest: 'pending' }))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setDebugInfo(prev => ({ 
          ...prev, 
          apiTest: 'error', 
          apiError: 'Sem sessão ativa' 
        }))
        return
      }

      // Testar sem Authorization header - confiar nos cookies
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setDebugInfo(prev => ({ ...prev, apiTest: 'success' }))
        console.log('✅ API test successful:', data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setDebugInfo(prev => ({ 
          ...prev, 
          apiTest: 'error', 
          apiError: errorData.error || `HTTP ${response.status}` 
        }))
      }

    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        apiTest: 'error', 
        apiError: error instanceof Error ? error.message : 'Erro desconhecido' 
      }))
    }
  }

  const testApiWithAuth = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, apiTest: 'pending' }))
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setDebugInfo(prev => ({ 
          ...prev, 
          apiTest: 'error', 
          apiError: 'Sem sessão ativa' 
        }))
        return
      }

      // Testar com Authorization header
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setDebugInfo(prev => ({ ...prev, apiTest: 'success' }))
        console.log('✅ API test with auth successful:', data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setDebugInfo(prev => ({ 
          ...prev, 
          apiTest: 'error', 
          apiError: errorData.error || `HTTP ${response.status}` 
        }))
      }

    } catch (error) {
      setDebugInfo(prev => ({ 
        ...prev, 
        apiTest: 'error', 
        apiError: error instanceof Error ? error.message : 'Erro desconhecido' 
      }))
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const getStatusColor = (condition: boolean) => {
    return condition ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Debug de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Verificando status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Debug de Autenticação
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="ml-auto"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDetails ? 'Ocultar' : 'Mostrar'} detalhes
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status básico */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sessão Ativa</span>
              <Badge className={getStatusColor(debugInfo.hasSession)}>
                {debugInfo.hasSession ? 'Sim' : 'Não'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">É Admin</span>
              <Badge className={getStatusColor(debugInfo.isAdmin)}>
                {debugInfo.isAdmin ? 'Sim' : 'Não'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">LocalStorage</span>
              <Badge className={getStatusColor(debugInfo.localStorageData)}>
                {debugInfo.localStorageData ? 'Presente' : 'Ausente'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cookies</span>
              <Badge className={getStatusColor(debugInfo.cookiesData)}>
                {debugInfo.cookiesData ? 'Presente' : 'Ausente'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Teste API</span>
              <Badge className={getApiStatusColor(debugInfo.apiTest)}>
                {debugInfo.apiTest === 'success' && 'Sucesso'}
                {debugInfo.apiTest === 'error' && 'Erro'}
                {debugInfo.apiTest === 'pending' && 'Testando...'}
                {debugInfo.apiTest === 'not-tested' && 'Não testado'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={testApi}
                size="sm"
                variant="outline"
                disabled={debugInfo.apiTest === 'pending'}
                className="flex-1"
              >
                <Cookie className="h-4 w-4 mr-2" />
                Testar (Cookies)
              </Button>
              
              <Button
                onClick={testApiWithAuth}
                size="sm"
                variant="outline"
                disabled={debugInfo.apiTest === 'pending'}
                className="flex-1"
              >
                <Database className="h-4 w-4 mr-2" />
                Testar (Auth)
              </Button>
            </div>
          </div>
        </div>

        {/* Detalhes expandidos */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="font-medium">Informações Detalhadas</h4>
              
              {debugInfo.userEmail && (
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {debugInfo.userEmail}
                </div>
              )}
              
              {debugInfo.tokenExpiry && (
                <div className="text-sm">
                  <span className="font-medium">Token expira:</span> {debugInfo.tokenExpiry}
                </div>
              )}
              
              {debugInfo.apiError && (
                <div className="text-sm text-red-600">
                  <span className="font-medium">Erro da API:</span> {debugInfo.apiError}
                </div>
              )}

              {debugInfo.sessionDetails && (
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">ID:</span> {debugInfo.sessionDetails.id}</div>
                  <div><span className="font-medium">Criado em:</span> {new Date(debugInfo.sessionDetails.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">Último login:</span> {new Date(debugInfo.sessionDetails.last_sign_in_at).toLocaleString()}</div>
                  <div><span className="font-medium">Token access:</span> {debugInfo.sessionDetails.access_token_length} chars</div>
                  <div><span className="font-medium">Token refresh:</span> {debugInfo.sessionDetails.refresh_token_length} chars</div>
                </div>
              )}

              {debugInfo.cookieDetails && (
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Total cookies:</span> {debugInfo.cookieDetails.total}</div>
                  <div><span className="font-medium">Auth cookie:</span> {debugInfo.cookieDetails.authCookie}</div>
                  <div><span className="font-medium">Cookies:</span> {debugInfo.cookieDetails.allCookies.join(', ')}</div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Ações</h4>
              <div className="flex gap-2">
                <Button
                  onClick={checkAuthStatus}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Status
                </Button>
                
                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.clear()
                      checkAuthStatus()
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  Limpar Cache
                </Button>

                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      document.cookie.split(";").forEach(function(c) { 
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                      });
                      checkAuthStatus()
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  Limpar Cookies
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Resumo */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            {debugInfo.hasSession && debugInfo.isAdmin ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <span className="text-sm">
              {debugInfo.hasSession && debugInfo.isAdmin 
                ? 'Autenticação OK - Usuário admin detectado'
                : 'Problema de autenticação detectado'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
