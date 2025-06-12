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
        const errorDescription = searchParams.get('error_description')

        // Se houver erro no OAuth
        if (error) {
          console.error('OAuth Error:', error, errorDescription)
          router.push(`/auth?error=${encodeURIComponent(errorDescription || error)}`)
          return
        }

        if (code) {
          const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (authError) {
            console.error('Auth Exchange Error:', authError)
            const errorMessage = typeof authError === 'object' && authError && 'message' in authError 
              ? (authError as any).message 
              : 'Authentication failed'
            router.push(`/auth?error=${encodeURIComponent(errorMessage)}`)
            return
          }

          // Sucesso - redireciona para a página principal
          router.push('/')
          return
        }

        // Se não há código nem erro, redireciona para auth
        router.push('/auth')
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        router.push('/auth?error=auth_callback_error')
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