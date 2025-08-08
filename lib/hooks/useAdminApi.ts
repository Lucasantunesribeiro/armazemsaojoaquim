'use client'

import { createClient } from '@/lib/supabase'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface AdminApiState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface RetryConfig {
  attempts: number
  maxAttempts: number
  backoffMs: number
}

export function useAdminApi() {
  const supabase = createClient()
  const router = useRouter()
  const [state, setState] = useState<AdminApiState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  
  // Ref para evitar múltiplas verificações simultâneas
  const authCheckRef = useRef<Promise<void> | null>(null)
  const retryConfigRef = useRef<RetryConfig>({
    attempts: 0,
    maxAttempts: 3,
    backoffMs: 1000
  })

  // Função de delay para exponential backoff
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Função de exponential backoff
  const getBackoffDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000)

  // Verificar autenticação com retry robusto
  const checkAuthWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    console.log(`🔍 [AUTH-CHECK] Tentativa ${attempt + 1}/${retryConfigRef.current.maxAttempts}`)
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      // Tentar obter sessão
      let { data: { session }, error } = await supabase.auth.getSession()
      
      // Se erro na primeira tentativa, tentar refresh
      if (error || !session) {
        console.log('⚠️ [AUTH-CHECK] Sessão não encontrada, tentando refresh...')
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (!refreshError && refreshData.session) {
          console.log('✅ [AUTH-CHECK] Sessão renovada com sucesso')
          session = refreshData.session
          error = null
        } else {
          console.log('❌ [AUTH-CHECK] Falha no refresh da sessão')
        }
      }
      
      if (error) {
        console.error('❌ [AUTH-CHECK] Erro ao verificar sessão:', error)
        throw new Error(`Session error: ${error.message}`)
      }

      if (!session) {
        console.log('❌ [AUTH-CHECK] Nenhuma sessão ativa encontrada')
        throw new Error('No active session')
      }

      // Verificar se é admin
      const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
      const isAdmin = adminEmails.includes(session.user.email || '')
      
      if (!isAdmin) {
        console.log('❌ [AUTH-CHECK] Usuário não é admin:', session.user.email)
        throw new Error('Access denied - admin only')
      }

      // Verificar se token não está expirado
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      
      if (expiresAt <= now) {
        console.log('⚠️ [AUTH-CHECK] Token expirado, forçando refresh...')
        throw new Error('Token expired')
      }

      console.log('✅ [AUTH-CHECK] Autenticação admin válida confirmada')
      retryConfigRef.current.attempts = 0 // Reset retry counter
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error(`❌ [AUTH-CHECK] Erro na tentativa ${attempt + 1}:`, error)
      
      // Se ainda há tentativas disponíveis, retry com backoff
      if (attempt < retryConfigRef.current.maxAttempts - 1) {
        const backoffDelay = getBackoffDelay(attempt)
        console.log(`🔄 [AUTH-CHECK] Tentando novamente em ${backoffDelay}ms...`)
        
        await delay(backoffDelay)
        return checkAuthWithRetry(attempt + 1)
      }
      
      // Todas as tentativas falharam
      console.error('💥 [AUTH-CHECK] Todas as tentativas de autenticação falharam')
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro de autenticação'
      })
    }
  }, [supabase])

  // Verificar autenticação inicial
  useEffect(() => {
    const initAuth = async () => {
      // Evitar múltiplas verificações simultâneas
      if (authCheckRef.current) {
        await authCheckRef.current
        return
      }
      
      authCheckRef.current = checkAuthWithRetry()
      await authCheckRef.current
      authCheckRef.current = null
    }

    initAuth()

    // Monitorar mudanças na autenticação com tratamento robusto
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log(`🔄 [AUTH-STATE] Evento: ${event}, Email: ${session?.user?.email}`)
        
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
          console.log('🔄 [AUTH-STATE] Revalidando autenticação...')
          // Revalidar ao invés de assumir estado
          await checkAuthWithRetry()
        } else if (event === 'SIGNED_IN' && session) {
          console.log('✅ [AUTH-STATE] Usuário autenticado, verificando admin...')
          const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
          const isAdmin = adminEmails.includes(session.user.email || '')
          
          setState({
            isAuthenticated: isAdmin,
            isLoading: false,
            error: isAdmin ? null : 'Access denied - admin only'
          })
        }
      }
    )

    return () => {
      console.log('🧹 [AUTH-HOOK] Limpando subscription')
      subscription.unsubscribe()
    }
  }, [supabase, checkAuthWithRetry])

  // AdminFetch com retry robusto e tratamento completo de erros
  const adminFetch = useCallback(async (url: string, options: RequestInit = {}, retryAttempt: number = 0): Promise<any> => {
    console.log(`📡 [ADMIN-FETCH] ${url} - Tentativa ${retryAttempt + 1}`)
    
    try {
      // ETAPA 1: Verificar sessão atual
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // ETAPA 2: Se sem sessão, tentar refresh automático
      if (sessionError || !session) {
        console.log('⚠️ [ADMIN-FETCH] Sessão não encontrada, tentando refresh...')
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (!refreshError && refreshData.session) {
          console.log('✅ [ADMIN-FETCH] Sessão renovada automaticamente')
          session = refreshData.session
          sessionError = null
        } else {
          console.error('❌ [ADMIN-FETCH] Falha no refresh automático')
          throw new Error('No active session')
        }
      }
      
      if (sessionError || !session) {
        throw new Error(`Session error: ${sessionError?.message || 'No session'}`)
      }

      // ETAPA 3: Verificar admin
      const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
      const isAdmin = adminEmails.includes(session.user.email || '')
      
      if (!isAdmin) {
        console.error('❌ [ADMIN-FETCH] Usuário não é admin:', session.user.email)
        throw new Error('Access denied - admin only')
      }

      // ETAPA 4: Verificar se token está válido
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      
      if (expiresAt <= now + 60) { // Renovar se expira em menos de 1 minuto
        console.log('🔄 [ADMIN-FETCH] Token próximo de expirar, renovando...')
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && refreshData.session) {
          session = refreshData.session
        }
      }

      // ETAPA 5: Preparar requisição
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      }

      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }

      // IMPORTANTE: Incluir Authorization header para que o server possa validar
      if (session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('🔑 [ADMIN-FETCH] Authorization header incluído')
      }

      console.log(`📤 [ADMIN-FETCH] Executando requisição: ${url}`)
      
      // ETAPA 6: Executar requisição
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        cache: 'no-cache' // Evitar cache problemático
      })

      // ETAPA 7: Processar resposta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        
        console.error(`❌ [ADMIN-FETCH] Erro ${response.status} em ${url}:`, errorMessage)
        
        // ETAPA 8: Retry lógico para erros de auth
        if ((response.status === 401 || response.status === 403) && retryAttempt < 2) {
          console.log(`🔄 [ADMIN-FETCH] Tentando retry após erro ${response.status}...`)
          
          // Forçar refresh da sessão
          await supabase.auth.refreshSession()
          
          // Delay antes de retry
          await delay(getBackoffDelay(retryAttempt))
          
          return adminFetch(url, options, retryAttempt + 1)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`✅ [ADMIN-FETCH] Sucesso: ${url}`)
      
      // ETAPA 9: Atualizar estado se necessário
      if (!state.isAuthenticated) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      }
      
      return data
      
    } catch (error) {
      console.error(`💥 [ADMIN-FETCH] Erro final em ${url}:`, error)
      
      // Atualizar estado em caso de erro de auth
      if (error instanceof Error && (
        error.message.includes('session') || 
        error.message.includes('auth') ||
        error.message.includes('Access denied')
      )) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Erro de autenticação'
        }))
        
        // Redirecionar para login se estiver no browser
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const locale = currentPath.split('/')[1] || 'pt'
          const message = encodeURIComponent(`Erro de autenticação: ${error.message}`)
          router.push(`/${locale}/auth?message=${message}&redirect=${encodeURIComponent(currentPath)}`)
        }
      }
      
      throw error
    }
  }, [supabase, state.isAuthenticated, router, delay, getBackoffDelay])

  // Função para forçar renovação de sessão
  const refreshSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        throw new Error('Não foi possível renovar a sessão')
      }

      const adminEmails = ['armazemsaojoaquimoficial@gmail.com']
      const isAdmin = adminEmails.includes(session.user.email || '')
      
      if (!isAdmin) {
        throw new Error('Acesso negado')
      }

      setState({
        isAuthenticated: true,
        isLoading: false,
        error: null
      })

      return true
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error)
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      return false
    }
  }, [supabase])

  return { 
    adminFetch, 
    refreshSession,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error
  }
} 