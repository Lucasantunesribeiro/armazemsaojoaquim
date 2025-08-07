'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * Error Boundary para capturar erros de factory/call e renderização
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`❌ ErrorBoundary capturou erro em ${this.props.componentName || 'componente desconhecido'}:`, error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log estruturado para debugging
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Erro Detalhado - ${this.props.componentName}`)
      console.error('Erro:', error.name, error.message)
      console.error('Stack:', error.stack)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback de desenvolvimento com detalhes
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
            <h2 className="text-red-800 text-xl font-bold mb-4 flex items-center">
              🚨 Erro no Componente
            </h2>
            
            <div className="space-y-3">
              <div>
                <strong className="text-red-700">Componente:</strong>
                <span className="ml-2 font-mono text-sm bg-red-100 px-2 py-1 rounded">
                  {this.props.componentName || 'Não identificado'}
                </span>
              </div>
              
              {this.state.error && (
                <div>
                  <strong className="text-red-700">Erro:</strong>
                  <pre className="mt-2 bg-red-100 p-3 rounded text-sm overflow-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        )
      }

      // Fallback de produção - simples e elegante
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 text-4xl mb-3">⚠️</div>
          <h3 className="text-gray-700 font-medium mb-2">
            Oops! Algo deu errado
          </h3>
          <p className="text-gray-500 text-sm">
            Estamos trabalhando para resolver este problema.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook para Error Boundary funcional (React 18+)
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={Component.displayName || Component.name}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary