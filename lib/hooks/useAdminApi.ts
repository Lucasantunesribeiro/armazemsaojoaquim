'use client'

import { useCallback } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { createClient } from '@/utils/supabase/client'

export function useAdminApi() {
  const { isAdmin, hasProfile, loading: adminLoading } = useAdmin()

  // Função para aguardar o loading terminar com timeout
  const waitForAdminStatus = useCallback(async (): Promise<void> => {
    if (!adminLoading) return
    
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        // Timeout silencioso - apenas prossegue
        resolve() 
      }, 3000) // Reduzido para 3 segundos
      
      const checkLoading = () => {
        if (!adminLoading) {
          clearTimeout(timeout)
          resolve()
        } else {
          setTimeout(checkLoading, 50) // Check mais frequente
        }
      }
      
      checkLoading()
    })
  }, [adminLoading])

  const makeRequest = useCallback(async (
    endpoint: string, 
    options: RequestInit = {},
    retryConfig?: {
      maxRetries?: number
      baseDelay?: number
      timeoutMs?: number
      onWarning?: (message: string) => void
      onRetry?: (attempt: number, maxRetries: number, delay: number) => void
    }
  ) => {
    // Default retry configuration - optimized for performance
    const config = {
      maxRetries: 1, // Single retry only
      baseDelay: 300, // Faster retry
      timeoutMs: 5000, // Reduced to 5s
      onWarning: (msg: string) => {}, // Silenciar warnings
      onRetry: (attempt: number, max: number, delay: number) => {}, // Silenciar logs de retry
      ...retryConfig
    }

    // Aguardar confirmação do status admin
    await waitForAdminStatus()

    if (!isAdmin || !hasProfile) {
      throw new Error('Admin access required')
    }

    // Retry logic with exponential backoff and jitter
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      // Declare timeout ID for each attempt
      let timeoutId: NodeJS.Timeout | null = null

      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('No active session')
        }
        
        // Add timeout and retry logic to API requests
        const controller = new AbortController()
        
        // Timeout warnings removidos para melhor UX
        
        timeoutId = setTimeout(() => {
          controller.abort()
        }, config.timeoutMs)

        // Handle endpoint URL - remove /api/admin prefix if already present
        const cleanEndpoint = endpoint.startsWith('/api/admin') 
          ? endpoint 
          : `/api/admin${endpoint}`

        console.log(`📡 [useAdminApi] Making request to: ${cleanEndpoint} (attempt ${attempt + 1}/${config.maxRetries + 1})`)

        const response = await fetch(cleanEndpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            ...options.headers,
          },
          signal: controller.signal,
        })
        
        // Clear timeout on successful response
        if (timeoutId) clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
          console.error('❌ [useAdminApi] Request failed:', errorMessage)
          
          // Don't retry on client errors (4xx), only server errors (5xx) and timeouts
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorMessage)
          }
          
          // For server errors, throw to trigger retry
          throw new Error(`Server error: ${errorMessage}`)
        }

        const data = await response.json()
        console.log('✅ [useAdminApi] Request successful')
        return data
        
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId)
        
        // Check if this is the last attempt
        const isLastAttempt = attempt === config.maxRetries
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('⏰ [useAdminApi] Request timeout')
          
          if (isLastAttempt) {
            throw new Error('Request timeout - check your network connection')
          }
          
          // Continue to retry logic for timeout errors
        } else if (error instanceof Error && error.message.includes('Admin access required')) {
          // Don't retry auth errors
          throw error
        } else if (error instanceof Error && error.message.includes('No active session')) {
          // Don't retry session errors
          throw error
        } else if (error instanceof Error && !error.message.includes('Server error')) {
          // Don't retry client errors
          if (isLastAttempt) {
            console.error('💥 [useAdminApi] Error:', error)
            throw error
          }
        }
        
        // If this is the last attempt, throw the error
        if (isLastAttempt) {
          console.error('💥 [useAdminApi] Max retries reached. Final error:', error)
          throw error
        }
        
        // Calculate delay with exponential backoff and jitter
        const jitter = Math.random() * 0.3 + 0.85 // 85-115% of base delay
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt) * jitter,
          10000 // Max 10 seconds between retries
        )
        
        config.onRetry(attempt + 1, config.maxRetries, Math.round(delay))
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected error in retry logic')
  }, [isAdmin, hasProfile, waitForAdminStatus])

  // Alias for backward compatibility
  const adminFetch = makeRequest

  return {
    makeRequest,
    adminFetch,
    isAuthorized: isAdmin && hasProfile && !adminLoading,
    isLoading: adminLoading
  }
}