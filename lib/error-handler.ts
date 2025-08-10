// Comprehensive error handling utilities for admin panel

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: number
  endpoint?: string
  retryable: boolean
}

export class ErrorHandler {
  private static errorLog: AppError[] = []
  private static maxLogSize = 100

  static createError(
    type: ErrorType,
    message: string,
    options: {
      code?: string
      details?: any
      endpoint?: string
      retryable?: boolean
    } = {}
  ): AppError {
    const error: AppError = {
      type,
      message,
      code: options.code,
      details: options.details,
      timestamp: Date.now(),
      endpoint: options.endpoint,
      retryable: options.retryable ?? this.isRetryableError(type)
    }

    this.logError(error)
    return error
  }

  static fromHttpError(
    error: any,
    endpoint?: string
  ): AppError {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          return this.createError(
            ErrorType.AUTHENTICATION,
            'Sessão expirada. Faça login novamente.',
            { code: 'AUTH_EXPIRED', endpoint, retryable: false }
          )

        case 403:
          return this.createError(
            ErrorType.AUTHORIZATION,
            'Você não tem permissão para acessar este recurso.',
            { code: 'ACCESS_DENIED', endpoint, retryable: false }
          )

        case 404:
          return this.createError(
            ErrorType.CLIENT,
            'Recurso não encontrado.',
            { code: 'NOT_FOUND', endpoint, retryable: false }
          )

        case 422:
          return this.createError(
            ErrorType.VALIDATION,
            data?.message || 'Dados inválidos fornecidos.',
            { code: 'VALIDATION_ERROR', details: data?.errors, endpoint, retryable: false }
          )

        case 429:
          return this.createError(
            ErrorType.CLIENT,
            'Muitas tentativas. Tente novamente em alguns minutos.',
            { code: 'RATE_LIMITED', endpoint, retryable: true }
          )

        case 500:
        case 502:
        case 503:
        case 504:
          return this.createError(
            ErrorType.SERVER,
            'Erro interno do servidor. Tente novamente mais tarde.',
            { code: `HTTP_${status}`, endpoint, retryable: true }
          )

        default:
          return this.createError(
            ErrorType.SERVER,
            data?.message || `Erro HTTP ${status}`,
            { code: `HTTP_${status}`, endpoint, retryable: status >= 500 }
          )
      }
    }

    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return this.createError(
        ErrorType.NETWORK,
        'Erro de conexão. Verifique sua internet e tente novamente.',
        { code: 'NETWORK_ERROR', endpoint, retryable: true }
      )
    }

    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return this.createError(
        ErrorType.TIMEOUT,
        'Tempo limite excedido. Tente novamente.',
        { code: 'TIMEOUT', endpoint, retryable: true }
      )
    }

    return this.createError(
      ErrorType.UNKNOWN,
      error.message || 'Erro desconhecido. Tente novamente.',
      { code: 'UNKNOWN', details: error, endpoint, retryable: true }
    )
  }

  private static isRetryableError(type: ErrorType): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.SERVER,
      ErrorType.TIMEOUT
    ].includes(type)
  }

  private static logError(error: AppError): void {
    // Add to error log
    this.errorLog.unshift(error)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 [ErrorHandler]', error)
    }

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production' && error.type === ErrorType.SERVER) {
      // Example: Send to error tracking service
      // errorTrackingService.captureError(error)
    }
  }

  static getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  static clearErrorLog(): void {
    this.errorLog = []
  }

  static getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<ErrorType, number>,
      recent: this.errorLog.filter(e => Date.now() - e.timestamp < 60000).length // Last minute
    }

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })

    return stats
  }
}

// Retry utility with exponential backoff
export class RetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      backoffFactor?: number
      shouldRetry?: (error: any) => boolean
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      shouldRetry = (error) => {
        const appError = ErrorHandler.fromHttpError(error)
        return appError.retryable
      }
    } = options

    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        // Don't retry on last attempt or if error is not retryable
        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        )

        console.log(`🔄 [RetryManager] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms...`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}

// Circuit breaker pattern for failing services
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw ErrorHandler.createError(
          ErrorType.SERVER,
          'Serviço temporariamente indisponível. Tente novamente mais tarde.',
          { code: 'CIRCUIT_BREAKER_OPEN', retryable: true }
        )
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// Global error boundary for React components
export function handleComponentError(error: Error, errorInfo: any) {
  const appError = ErrorHandler.createError(
    ErrorType.CLIENT,
    `Erro no componente: ${error.message}`,
    {
      code: 'COMPONENT_ERROR',
      details: { error: error.stack, errorInfo },
      retryable: false
    }
  )

  console.error('🚨 [Component Error]', appError)
  
  // In production, send to error tracking
  if (process.env.NODE_ENV === 'production') {
    // errorTrackingService.captureError(appError)
  }
}

// Higher-order function for API route error handling
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      const appError = ErrorHandler.fromHttpError(error)
      console.error('🚨 [API Error]', appError)
      throw error
    }
  }
}

// Utility functions for throwing specific errors
export function throwAuthenticationError(message?: string): never {
  throw ErrorHandler.createError(
    ErrorType.AUTHENTICATION,
    message || 'Authentication required',
    { code: 'AUTH_REQUIRED', retryable: false }
  )
}

export function throwAuthorizationError(message?: string): never {
  throw ErrorHandler.createError(
    ErrorType.AUTHORIZATION,
    message || 'Access denied',
    { code: 'ACCESS_DENIED', retryable: false }
  )
}