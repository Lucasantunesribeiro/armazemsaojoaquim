'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

export class AdminErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [AdminErrorBoundary] Error caught:', error)
    console.error('🚨 [AdminErrorBoundary] Error info:', errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Auto-retry for network errors (max 3 times)
    if (this.isNetworkError(error) && this.state.retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000) // Exponential backoff
      
      console.log(`🔄 [AdminErrorBoundary] Auto-retry in ${delay}ms (attempt ${this.state.retryCount + 1}/3)`)
      
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry()
      }, delay)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  private isNetworkError(error: Error): boolean {
    const networkErrorMessages = [
      'fetch',
      'network',
      'timeout',
      'connection',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT'
    ]
    
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    )
  }

  private getErrorType(error: Error): 'network' | 'auth' | 'permission' | 'validation' | 'unknown' {
    const message = error.message.toLowerCase()
    
    if (this.isNetworkError(error)) return 'network'
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('session')) return 'auth'
    if (message.includes('permission') || message.includes('forbidden') || message.includes('access')) return 'permission'
    if (message.includes('validation') || message.includes('invalid')) return 'validation'
    
    return 'unknown'
  }

  private getErrorMessage(error: Error): { title: string; description: string; actionable: string } {
    const errorType = this.getErrorType(error)
    
    switch (errorType) {
      case 'network':
        return {
          title: 'Problema de Conexão',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
          actionable: 'Tente novamente em alguns segundos ou verifique sua conexão.'
        }
      
      case 'auth':
        return {
          title: 'Sessão Expirada',
          description: 'Sua sessão expirou ou você não tem permissão para acessar esta área.',
          actionable: 'Faça login novamente para continuar.'
        }
      
      case 'permission':
        return {
          title: 'Acesso Negado',
          description: 'Você não tem permissão para realizar esta ação.',
          actionable: 'Entre em contato com o administrador se precisar de acesso.'
        }
      
      case 'validation':
        return {
          title: 'Dados Inválidos',
          description: 'Os dados fornecidos não são válidos ou estão incompletos.',
          actionable: 'Verifique os dados e tente novamente.'
        }
      
      default:
        return {
          title: 'Erro Inesperado',
          description: 'Ocorreu um erro inesperado na aplicação.',
          actionable: 'Tente recarregar a página ou entre em contato com o suporte.'
        }
    }
  }

  private handleRetry = () => {
    console.log('🔄 [AdminErrorBoundary] Retrying...')
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  private handleReset = () => {
    console.log('🔄 [AdminErrorBoundary] Resetting...')
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  private handleGoHome = () => {
    window.location.href = '/admin'
  }

  private handleReportError = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.log('🐛 [AdminErrorBoundary] Error report:', errorReport)
    
    // Here you could send the error to a logging service
    // For now, we'll copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Relatório de erro copiado para a área de transferência!')
      })
      .catch(() => {
        alert('Não foi possível copiar o relatório de erro.')
      })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error } = this.state
      const errorInfo = this.getErrorMessage(error!)
      const errorType = this.getErrorType(error!)
      const canRetry = errorType === 'network' || errorType === 'unknown'

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {errorInfo.description}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {errorInfo.actionable}
              </p>
            </div>

            <div className="space-y-3">
              {canRetry && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  disabled={this.state.retryCount >= 3}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {this.state.retryCount >= 3 ? 'Máximo de tentativas atingido' : 'Tentar Novamente'}
                </Button>
              )}
              
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recarregar Componente
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
              
              <Button 
                onClick={this.handleReportError}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                <Bug className="h-3 w-3 mr-1" />
                Reportar Erro
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Detalhes do Erro (Desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`🚨 [useErrorHandler] ${context || 'Error'}:`, error)
    
    // You could integrate with error reporting service here
    // For now, we'll just log it
  }, [])

  return { handleError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AdminErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdminErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}