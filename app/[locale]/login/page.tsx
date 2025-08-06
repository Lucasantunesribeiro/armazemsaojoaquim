'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface LoginPageProps {
  params: Promise<{ locale: string }>
}

export default function LoginPage({ params }: LoginPageProps) {
  const router = useRouter()
  
  // Desempacotar params usando React.use()
  const resolvedParams = use(params)

  useEffect(() => {
    const redirectToAuth = () => {
      const locale = resolvedParams.locale || 'pt'
      
      // Preserve any query parameters from the original URL
      const searchParams = new URLSearchParams(window.location.search)
      const queryString = searchParams.toString()
      
      const authUrl = `/${locale}/auth${queryString ? `?${queryString}` : ''}`
      
      // Use replace to avoid creating a history entry for /login
      router.replace(authUrl)
    }

    redirectToAuth()
  }, [resolvedParams.locale, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-amber-700">Redirecionando para login...</p>
      </div>
    </div>
  )
}