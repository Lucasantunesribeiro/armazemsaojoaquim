'use client'

import React, { Component, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class ErrorBoundaryGlobal extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging
    console.error('🚨 ErrorBoundary capturou um erro:', error)
    console.error('📊 Informações do erro:', errorInfo)
    
    // Detectar se é o erro React #310
    if (error.message.includes('Minified React error #310')) {
      console.error('🔍 Erro React #310 detectado - possível problema com useMemo/useCallback')
      console.error('💡 Stack trace:', errorInfo.componentStack)
      console.error('🔧 Dica: Verifique hooks com dependências inválidas')
    }

    this.setState({
      error,
      errorInfo
    })

    // Callback customizado para logging (se fornecido)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de fallback padrão
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Ops! Algo deu errado
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ocorreu um erro inesperado. Nossa equipe foi notificada.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left bg-gray-100 dark:bg-gray-700 rounded p-4 mb-4">
                  <summary className="cursor-pointer font-medium text-red-600 dark:text-red-400 mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-auto">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-200"
                  >
                    🏠 Voltar ao Início
                  </Link>
                  
                  <Link
                    href="/pt"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors duration-200"
                  >
                    🔄 Tentar Novamente
                  </Link>
                </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
