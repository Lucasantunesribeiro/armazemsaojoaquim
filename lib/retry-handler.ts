// Sistema de retry automático para operações que podem falhar temporariamente

interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
  retryCondition?: (error: any) => boolean
  onRetry?: (error: any, attempt: number) => void
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry para erros de rede, timeout, e erros temporários do servidor
    if (error?.status >= 500 && error?.status <= 599) return true
    if (error?.code === 'ECONNRESET') return true
    if (error?.code === 'ETIMEDOUT') return true
    if (error?.code === 'ENOTFOUND') return true
    if (error?.message?.includes('timeout')) return true
    if (error?.message?.includes('connection')) return true
    if (error?.message?.includes('network')) return true
    return false
  }
}

export class RetryHandler {
  private static instance: RetryHandler

  private constructor() {}

  static getInstance(): RetryHandler {
    if (!RetryHandler.instance) {
      RetryHandler.instance = new RetryHandler()
    }
    return RetryHandler.instance
  }

  /**
   * Executa uma operação com retry automático
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const config = { ...defaultRetryOptions, ...options }
    let lastError: any

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        // Verificar se deve fazer retry
        if (attempt === config.maxRetries || !config.retryCondition!(error)) {
          throw error
        }

        // Calcular delay para próxima tentativa
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt),
          config.maxDelay
        )

        // Callback opcional de retry
        if (config.onRetry) {
          config.onRetry(error, attempt + 1)
        }

        console.warn(`Operação falhou (tentativa ${attempt + 1}/${config.maxRetries + 1}), tentando novamente em ${delay}ms:`, error)

        // Aguardar antes da próxima tentativa
        await this.sleep(delay)
      }
    }

    throw lastError
  }

  /**
   * Wrapper para operações de API com retry automático
   */
  async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
        ;(error as any).status = response.status
        ;(error as any).response = response
        throw error
      }

      // Tentar fazer parse do JSON
      const data = await response.json()
      return data
    }, {
      ...retryOptions,
      retryCondition: (error) => {
        // Condições específicas para requests HTTP
        if (error?.status >= 500 && error?.status <= 599) return true
        if (error?.status === 429) return true // Rate limiting
        if (error?.status === 408) return true // Request timeout
        if (error?.status === 503) return true // Service unavailable
        if (error?.status === 502) return true // Bad gateway
        if (error?.status === 504) return true // Gateway timeout
        
        // Usar condição padrão para outros tipos de erro
        return retryOptions.retryCondition?.(error) ?? defaultRetryOptions.retryCondition!(error)
      }
    })
  }

  /**
   * Wrapper para operações do Supabase com retry
   */
  async supabaseWithRetry<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    retryOptions: Partial<RetryOptions> = {}
  ): Promise<T> {
    return this.executeWithRetry(async () => {
      const { data, error } = await operation()
      
      if (error) {
        // Mapear códigos de erro do Supabase para decidir sobre retry
        const shouldRetry = this.shouldRetrySupabaseError(error)
        if (shouldRetry) {
          const retryError = new Error(error.message || 'Supabase error')
          ;(retryError as any).supabaseError = error
          ;(retryError as any).shouldRetry = true
          throw retryError
        } else {
          // Não fazer retry para erros de validação, permissão, etc.
          const nonRetryError = new Error(error.message || 'Supabase error')
          ;(nonRetryError as any).supabaseError = error
          ;(nonRetryError as any).shouldRetry = false
          throw nonRetryError
        }
      }

      if (data === null && !error) {
        throw new Error('Nenhum dado retornado')
      }

      return data as T
    }, {
      ...retryOptions,
      retryCondition: (error) => {
        if (error?.shouldRetry === false) return false
        if (error?.shouldRetry === true) return true
        return retryOptions.retryCondition?.(error) ?? defaultRetryOptions.retryCondition!(error)
      }
    })
  }

  private shouldRetrySupabaseError(error: any): boolean {
    // Códigos de erro do Supabase que indicam problemas temporários
    const retryableErrors = [
      'PGRST301', // Connection timeout
      'PGRST302', // Connection error
      '08000',    // Connection exception
      '08003',    // Connection does not exist
      '08006',    // Connection failure
      '53300',    // Too many connections
      '57P01',    // Admin shutdown
      '57P02',    // Crash shutdown
      '57P03',    // Cannot connect now
    ]

    if (error?.code && retryableErrors.includes(error.code)) {
      return true
    }

    // Mensagens que indicam problemas temporários
    const retryableMessages = [
      'connection',
      'timeout',
      'server',
      'network',
      'temporary',
      'retry'
    ]

    const message = (error?.message || '').toLowerCase()
    return retryableMessages.some(keyword => message.includes(keyword))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Instância singleton
export const retryHandler = RetryHandler.getInstance()

// Funções utilitárias
export function withRetry<T>(
  operation: () => Promise<T>,
  options?: Partial<RetryOptions>
): Promise<T> {
  return retryHandler.executeWithRetry(operation, options)
}

export function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retryOptions?: Partial<RetryOptions>
): Promise<T> {
  return retryHandler.fetchWithRetry<T>(url, options, retryOptions)
}

export function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  retryOptions?: Partial<RetryOptions>
): Promise<T> {
  return retryHandler.supabaseWithRetry(operation, retryOptions)
}

// Hook para React components
export function useRetry() {
  const executeWithRetry = async <T>(
    operation: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<T> => {
    return retryHandler.executeWithRetry(operation, options)
  }

  const fetchWithRetry = async <T>(
    url: string,
    options?: RequestInit,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> => {
    return retryHandler.fetchWithRetry<T>(url, options, retryOptions)
  }

  return {
    executeWithRetry,
    fetchWithRetry
  }
}