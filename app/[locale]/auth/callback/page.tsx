'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { LoadingPage } from '@/components/ui/Loading'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')
        const type = searchParams.get('type')

        console.log('🔍 Callback params:', { code, error, errorCode, errorDescription, type })

        // Se houver erro no OAuth
        if (error) {
          console.error('❌ OAuth Error:', { error, errorCode, errorDescription })
          
          // Log adicional para debug quando o erro está vazio
          if (!error && !errorCode && !errorDescription) {
            console.error('🔍 OAuth Error vazio detectado - verificando parâmetros da URL:', {
              searchParams: Object.fromEntries(searchParams.entries()),
              url: window.location.href,
              timestamp: new Date().toISOString()
            })
            
            // Verificar se há outros parâmetros que podem indicar erro
            const allParams = Object.fromEntries(searchParams.entries())
            console.log('🔍 Todos os parâmetros da URL:', allParams)
            
            // Se não há código nem erro específico, pode ser um problema de configuração
            if (!code) {
              console.error('⚠️ Nenhum código OAuth encontrado - possível problema de configuração')
              router.push('/auth?error=oauth_configuration&message=Problema na configuração do OAuth. Tente novamente.')
              return
            }
          }
          
          // Tratamento específico para erro de violação de chave primária
          if (error === 'server_error' && errorDescription?.includes('profiles_pkey')) {
            console.log('🔧 Erro de duplicação de perfil detectado - tentando recuperar sessão...')
            
            try {
              // Tentar obter a sessão atual
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
              
              if (sessionData.session) {
                console.log('✅ Sessão recuperada após erro de duplicação')
                
                // Verificar se é admin e redirecionar adequadamente
                try {
                  const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', sessionData.session.user.id)
                    .single()
                  
                  if (!userError && userData?.role === 'admin') {
                    console.log('🔐 Usuário admin detectado, redirecionando para /admin')
                    window.location.href = '/admin'
                    return
                  } else {
                    console.log('🏠 Redirecionando para página principal...')
                    router.push('/')
                    return
                  }
                } catch (userCheckError) {
                  console.error('Erro ao verificar role do usuário:', userCheckError)
                  router.push('/')
                  return
                }
              } else {
                console.log('❌ Não foi possível recuperar a sessão')
                router.push('/auth?error=profile_duplication&message=Erro ao processar login. Tente novamente.')
                return
              }
            } catch (recoveryError) {
              console.error('Erro ao tentar recuperar sessão:', recoveryError)
              router.push('/auth?error=profile_duplication&message=Erro ao processar login. Tente novamente.')
              return
            }
          }
          
          // Tratamento específico para erros de OTP expirado
          if (error === 'access_denied' && (errorCode === 'otp_expired' || errorDescription?.includes('expired'))) {
            console.log('🔗 Link expirado detectado, redirecionando para nova solicitação')
            router.push('/auth?error=link_expired&message=O link de redefinição expirou. Solicite um novo link abaixo.')
            return
          }
          
          // Outros erros de acesso negado
          if (error === 'access_denied') {
            router.push('/auth?error=access_denied&message=Acesso negado. Tente fazer uma nova solicitação.')
            return
          }
          
          router.push(`/auth?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        if (code) {
          console.log('🔑 Processando código de autenticação...')
          
          // Primeira tentativa
          let { error: authError, data } = await supabase.auth.exchangeCodeForSession(code)
          
          // Se for erro de PKCE, tentar múltiplas abordagens
          if (authError && authError.message?.includes('code_verifier')) {
            console.log('🔧 Erro PKCE detectado, tentando múltiplas soluções...')
            
            let retrySuccess = false
            
            // Tentativa 1: Limpar storage e tentar novamente
            try {
              console.log('🔄 Tentativa 1: Limpar storage...')
              
              // Limpar storage relacionado ao auth
              const keysToRemove = [
                'armazem-sao-joaquim-auth',
                'supabase.auth.token',
                'supabase.auth.refreshToken',
                'supabase.auth.expiresAt',
                'supabase.auth.expiresIn',
                'supabase.auth.tokenType',
                'supabase.auth.provider',
                'supabase.auth.providerToken',
                'supabase.auth.providerRefreshToken',
                'supabase.auth.providerExpiresAt',
                'supabase.auth.providerExpiresIn',
                'supabase.auth.providerTokenType',
                'supabase.auth.providerScope',
                'supabase.auth.providerId',
                'supabase.auth.providerEmail',
                'supabase.auth.providerName',
                'supabase.auth.providerAvatar',
                'supabase.auth.providerPicture',
                'supabase.auth.providerLocale',
                'supabase.auth.providerTimezone',
                'supabase.auth.providerEmailVerified',
                'supabase.auth.providerPhoneNumber',
                'supabase.auth.providerPhoneNumberVerified',
                'supabase.auth.providerSub',
                'supabase.auth.providerIat',
                'supabase.auth.providerExp',
                'supabase.auth.providerJti',
                'supabase.auth.providerIss',
                'supabase.auth.providerAud',
                'supabase.auth.providerAzp',
                'supabase.auth.providerNonce',
                'supabase.auth.providerAcr',
                'supabase.auth.providerAmr',
                'supabase.auth.providerAtHash',
                'supabase.auth.providerCHash'
              ]
              
              keysToRemove.forEach(key => {
                try {
                  localStorage.removeItem(key)
                } catch (e) {
                  // Ignore errors
                }
              })
              
              console.log('✅ Storage limpo, tentando novamente...')
              
              // Segunda tentativa após limpeza
              const retryResult = await supabase.auth.exchangeCodeForSession(code)
              if (retryResult.error) {
                console.error('❌ Segunda tentativa falhou:', retryResult.error.message)
              } else {
                data = retryResult.data
                authError = null
                retrySuccess = true
                console.log('✅ Segunda tentativa bem-sucedida!')
              }
            } catch (cleanupError) {
              console.error('❌ Erro ao limpar storage:', cleanupError)
            }
            
            // Tentativa 2: Se ainda falhou, tentar com configuração alternativa
            if (!retrySuccess) {
              try {
                console.log('🔄 Tentativa 2: Configuração alternativa...')
                
                // Tentar com configuração diferente
                const tempResult = await supabase.auth.exchangeCodeForSession(code)
                if (tempResult.error) {
                  console.error('❌ Tentativa alternativa falhou:', tempResult.error.message)
                } else {
                  data = tempResult.data
                  authError = null
                  retrySuccess = true
                  console.log('✅ Tentativa alternativa bem-sucedida!')
                }
              } catch (altError) {
                console.error('❌ Erro na tentativa alternativa:', altError)
              }
            }
            
            // Se todas as tentativas falharam, manter o erro original
            if (!retrySuccess) {
              console.error('❌ Todas as tentativas falharam, mantendo erro original')
            }
          }
          
          if (authError) {
            console.error('❌ Auth Exchange Error:', authError)
            
            // Tratamento específico para tokens expirados
            if (authError.message?.includes('expired') || authError.message?.includes('invalid')) {
              router.push('/auth?error=link_expired&message=O link de redefinição expirou. Solicite um novo link.')
              return
            }
            
            // Tratamento específico para erro PKCE
            if (authError.message?.includes('code_verifier')) {
              console.error('🔧 Erro PKCE persistente - redirecionando para nova tentativa')
              router.push('/auth?error=pkce_error&message=Erro de autenticação. Tente fazer login novamente.')
              return
            }
            
            const errorMessage = typeof authError === 'object' && authError && 'message' in authError 
              ? (authError as any).message 
              : 'Authentication failed'
            router.push(`/auth?error=${encodeURIComponent(errorMessage)}`)
            return
          }

          console.log('✅ Autenticação bem-sucedida:', { type, session: !!data.session })

          // O trigger handle_new_user() já cria o profile automaticamente
          // Não precisamos chamar upsertProfile() aqui para evitar race conditions
          if (data.user) {
            console.log('👤 Profile será criado automaticamente pelo trigger')
          }

          // Verificar se é recovery (redefinição de senha)
          if (type === 'recovery') {
            console.log('🔐 Redirecionando para reset de senha...')
            router.push('/auth/reset-password')
            return
          }

          // Aguardar um pouco para garantir que a sessão seja propagada para o servidor
          console.log('⏳ Aguardando propagação da sessão após OAuth...')
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Sucesso - verificar se é admin e redirecionar adequadamente
          try {
            // Verificar se é admin por email primeiro (mais confiável)
            if (data.user.email === 'armazemsaojoaquimoficial@gmail.com') {
              console.log('🔐 Usuário admin detectado por email, redirecionando para /admin')
              window.location.href = '/admin'
              return
            }
            
            // Fallback: verificar na tabela profiles
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()
            
            if (!userError && userData?.role === 'admin') {
              console.log('🔐 Usuário admin detectado por role, redirecionando para /admin')
              window.location.href = '/admin'
              return
            } else {
              console.log('🏠 Redirecionando para página principal...')
              router.push('/')
            }
          } catch (error) {
            console.error('Erro ao verificar role do usuário:', error)
            // Fallback para página inicial em caso de erro
            console.log('🏠 Redirecionando para página principal (fallback)...')
            router.push('/')
          }
          return
        }

        // Se não há código nem erro, redireciona para auth
        console.log('⚠️ Nenhum código ou erro encontrado, redirecionando para auth')
        router.push('/auth')
      } catch (error) {
        console.error('💥 Unexpected error during auth callback:', error)
        router.push('/auth?error=auth_callback_error&message=Erro inesperado durante autenticação')
      }
    }

    handleCallback()
  }, [searchParams, supabase, router])

  return (
    <LoadingPage 
      title="Processando autenticação..." 
      subtitle="Aguarde enquanto finalizamos seu login"
    />
  )
} 