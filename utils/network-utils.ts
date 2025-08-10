/**
 * Network utility functions for handling fetch errors and retries
 */

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  timeoutMs?: number
  backoff?: 'linear' | 'exponential'
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeoutMs: 10000,
  backoff: 'exponential'
}

/**
 * Enhanced fetch with retry logic and timeout
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs)

      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      // If response is ok, return it
      if (response.ok) {
        return response
      }

      // If it's a client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // For server errors (5xx), retry
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      console.warn(`🔄 Fetch attempt ${attempt}/${config.maxRetries} failed:`, lastError.message)

      // Don't retry on AbortError (timeout) for the last attempt
      if (lastError.name === 'AbortError') {
        throw new Error('Request timeout - check your network connection')
      }

      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        break
      }

      // Calculate delay for next retry
      const delay = config.backoff === 'exponential' 
        ? config.retryDelay * Math.pow(2, attempt - 1)
        : config.retryDelay * attempt

      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Check if error is recoverable (should retry)
 */
export function isRecoverableError(error: Error): boolean {
  // Don't retry on client errors
  if (error.message.includes('HTTP 4')) {
    return false
  }

  // Don't retry on auth errors
  if (error.message.toLowerCase().includes('unauthorized') || 
      error.message.toLowerCase().includes('forbidden')) {
    return false
  }

  // Retry on network errors, timeouts, and server errors
  return true
}

/**
 * Network status checker
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/**
 * Wait for network to be available
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve()
      return
    }

    const timeout = setTimeout(() => {
      window.removeEventListener('online', onOnline)
      reject(new Error('Network timeout'))
    }, timeoutMs)

    const onOnline = () => {
      clearTimeout(timeout)
      window.removeEventListener('online', onOnline)
      resolve()
    }

    window.addEventListener('online', onOnline)
  })
}