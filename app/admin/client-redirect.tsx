'use client'

import { useEffect } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'

export default function ClientRedirect() {
  const { user, loading, isAdmin } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    console.log('🔍 ClientRedirect: Verificando estado:', {
      loading,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isAdmin
    })

    if (loading) {
      console.log('⏳ ClientRedirect: Ainda carregando...')
      return
    }

    if (!user) {
      console.log('❌ ClientRedirect: Sem usuário, redirecionando para /auth')
      router.push('/auth?error=client_no_session&message=Login necessário')
      return
    }

    if (!isAdmin) {
      console.log('❌ ClientRedirect: Usuário não é admin, redirecionando para /unauthorized')
      router.push('/unauthorized?error=client_not_admin&message=Acesso negado')
      return
    }

    console.log('✅ ClientRedirect: Usuário admin confirmado, permanecendo na página')
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-red-600">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return null
}