interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  url?: string
  userAgent?: string
  timestamp?: number
  additionalData?: Record<string, any>
}

interface ErrorReport {
  message: string
  stack?: string
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'javascript' | 'api' | 'database' | 'network' | 'validation' | 'auth'
}

class ErrorTracker {
  private static instance: ErrorTracker
  private errors: ErrorReport[] = []
  private maxErrors = 100 // Manter apenas os últimos 100 erros

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  private constructor() {
    // Configurar listeners globais de erro apenas no cliente
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
    }
  }

  private setupGlobalErrorHandlers() {
    // Capturar erros JavaScript
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        context: {
          component: 'Global',
          action: 'JavaScript Error',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        },
        severity: 'high',
        type: 'javascript'
      })
    })

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        context: {
          component: 'Global',
          action: 'Promise Rejection',
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          additionalData: {
            reason: event.reason?.toString()
          }
        },
        severity: 'high',
        type: 'javascript'
      })
    })
  }

  trackError(error: ErrorReport) {
    // Adicionar timestamp se não fornecido
    if (!error.context.timestamp) {
      error.context.timestamp = Date.now()
    }

    // Adicionar URL atual se não fornecida
    if (!error.context.url && typeof window !== 'undefined') {
      error.context.url = window.location.href
    }

    // Adicionar à lista de erros
    this.errors.unshift(error)

    // Manter apenas os últimos erros
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 [${error.severity.toUpperCase()}] ${error.type} Error`)
      console.error('Message:', error.message)
      console.error('Context:', error.context)
      if (error.stack) {
        console.error('Stack:', error.stack)
      }
      console.groupEnd()
    }

    // Enviar para analytics se disponível
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: error.severity === 'critical',
        error_type: error.type,
        error_component: error.context.component,
        error_action: error.context.action
      })
    }

    // Enviar para serviço de monitoramento (implementar conforme necessário)
    this.sendToMonitoringService(error)
  }

  private async sendToMonitoringService(error: ErrorReport) {
    // Implementar envio para serviço de monitoramento externo
    // Por exemplo: Sentry, LogRocket, etc.
    try {
      // Placeholder para integração futura
      if (process.env.NODE_ENV === 'production') {
        // await fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(error)
        // })
      }
    } catch (sendError) {
      console.warn('Failed to send error to monitoring service:', sendError)
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  getErrorsByType(type: ErrorReport['type']): ErrorReport[] {
    return this.errors.filter(error => error.type === type)
  }

  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity)
  }

  clearErrors() {
    this.errors = []
  }

  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: this.errors.filter(error => 
        error.context.timestamp && 
        Date.now() - error.context.timestamp < 5 * 60 * 1000 // Últimos 5 minutos
      ).length
    }

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }
}

// Funções de conveniência para uso em componentes
export const errorTracker = ErrorTracker.getInstance()

export function trackApiError(error: any, context: Partial<ErrorContext> = {}) {
  errorTracker.trackError({
    message: error?.message || 'API Error',
    stack: error?.stack,
    context: {
      ...context,
      action: context.action || 'API Call'
    },
    severity: 'medium',
    type: 'api'
  })
}

export function trackDatabaseError(error: any, context: Partial<ErrorContext> = {}) {
  errorTracker.trackError({
    message: error?.message || 'Database Error',
    stack: error?.stack,
    context: {
      ...context,
      action: context.action || 'Database Query'
    },
    severity: 'high',
    type: 'database'
  })
}

export function trackValidationError(message: string, context: Partial<ErrorContext> = {}) {
  errorTracker.trackError({
    message,
    context: {
      ...context,
      action: context.action || 'Validation'
    },
    severity: 'low',
    type: 'validation'
  })
}

export function trackNetworkError(error: any, context: Partial<ErrorContext> = {}) {
  errorTracker.trackError({
    message: error?.message || 'Network Error',
    stack: error?.stack,
    context: {
      ...context,
      action: context.action || 'Network Request'
    },
    severity: 'medium',
    type: 'network'
  })
}

export function trackAuthError(error: any, context: Partial<ErrorContext> = {}) {
  errorTracker.trackError({
    message: error?.message || 'Authentication Error',
    stack: error?.stack,
    context: {
      ...context,
      action: context.action || 'Authentication'
    },
    severity: 'high',
    type: 'auth'
  })
}

export default errorTracker 