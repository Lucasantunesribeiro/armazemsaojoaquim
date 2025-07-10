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

    // Don't do anything while loading
    if (loading) {
      console.log('⏳ ClientRedirect: Ainda carregando, aguardando...')
      return
    }

    // Give more time for auth state to settle, especially on page refresh
    const timer = setTimeout(() => {
      // Check again after timeout to make sure state is stable
      console.log('🔍 ClientRedirect: Estado após timeout:', {
        hasUser: !!user,
        userEmail: user?.email,
        isAdmin
      })

      if (!user) {
        console.log('❌ ClientRedirect: Sem usuário após timeout, redirecionando para /auth')
        router.push('/auth?error=client_no_session&message=Login necessário')
        return
      }

      if (!isAdmin) {
        console.log('❌ ClientRedirect: Usuário não é admin após timeout, redirecionando para /unauthorized')
        router.push('/unauthorized?error=client_not_admin&message=Acesso negado - apenas administradores')
        return
      }

      console.log('✅ ClientRedirect: Usuário admin confirmado, permanecendo na página')
    }, 3000) // Increased to 3 seconds for better stability

    return () => clearTimeout(timer)
  }, [user, loading, isAdmin, router])

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permissões de administrador...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Aguarde um momento...</p>
        </div>
      </div>
    )
  }

  // Show checking state while user/admin state is being determined
  if (!user || !isAdmin) {
    return (
      <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-yellow-600">Verificando acesso administrativo...</p>
          <p className="text-sm text-gray-500">Você será redirecionado em breve se necessário</p>
        </div>
      </div>
    )
  }

  // If we get here, user is logged in and is admin - don't render anything
  return null
}