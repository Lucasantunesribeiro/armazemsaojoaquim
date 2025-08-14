'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useAuthenticatedFetch() {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const updateToken = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setAccessToken(session?.access_token || null)
      } catch (error) {
        console.warn('⚠️ [useAuthenticatedFetch] Erro ao obter token:', error)
        setAccessToken(null)
      }
    }

    updateToken()

    // Escutar mudanças de autenticação
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        setAccessToken(session?.access_token || null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!accessToken) {
      throw new Error('No access token available')
    }

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  }

  return { authenticatedFetch, hasToken: !!accessToken }
}