'use client'

import { createClient } from '@/lib/supabase'
import { useCallback } from 'react'

export function useAdminApi() {
  const supabase = createClient()

  const adminFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }

    console.log('🔐 useAdminApi: Making authenticated request to:', url)
    console.log('🔑 useAdminApi: Using token:', session.access_token.substring(0, 20) + '...')
    console.log('🍪 useAdminApi: Document cookies:', document.cookie)

    // Preparar headers (não definir Content-Type para FormData)
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.access_token}`,
      ...(options.headers as Record<string, string>),
    }

    // Só adicionar Content-Type se não for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ useAdminApi: Request failed:', response.status, errorData)
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ useAdminApi: Request successful')
    return data
  }, [supabase])

  return { adminFetch }
} 