'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '../../../components/providers/SupabaseProvider'
import { LoadingPage } from '../../../components/ui/Loading'

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
          const { error: authError, data } = await supabase.auth.exchangeCodeForSession(code)
          
          if (authError) {
            console.error('❌ Auth Exchange Error:', authError)
            
            // Tratamento específico para tokens expirados
            if (authError.message?.includes('expired') || authError.message?.includes('invalid')) {
              router.push('/auth?error=link_expired&message=O link de redefinição expirou. Solicite um novo link.')
              return
            }
            
            const errorMessage = typeof authError === 'object' && authError && 'message' in authError 
              ? (authError as any).message 
              : 'Authentication failed'
            router.push(`/auth?error=${encodeURIComponent(errorMessage)}`)
            return
          }

          console.log('✅ Autenticação bem-sucedida:', { type, session: !!data.session })

          // Verificar se é recovery (redefinição de senha)
          if (type === 'recovery') {
            console.log('🔐 Redirecionando para reset de senha...')
            router.push('/auth/reset-password')
            return
          }

          // Sucesso - verificar se é admin e redirecionar adequadamente
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('id', data.user.id)
              .single()
            
            if (!userError && userData?.role === 'admin') {
              console.log('🔐 Usuário admin detectado, redirecionando para /admin')
              router.push('/admin')
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