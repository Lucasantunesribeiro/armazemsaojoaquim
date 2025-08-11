'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  onGoHome?: () => void
  showRetry?: boolean
  showGoHome?: boolean
  className?: string
}

export function ErrorState({
  message,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = false,
  className = ''
}: ErrorStateProps) {
  const getErrorType = (message: string) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      return 'network'
    }
    if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized') || lowerMessage.includes('session')) {
      return 'auth'
    }
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden')) {
      return 'permission'
    }
    return 'generic'
  }

  const getErrorInfo = (type: string) => {
    switch (type) {
      case 'network':
        return {
          title: 'Problema de Conexão',
          description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
          actionText: 'Tentar Novamente'
        }
      case 'auth':
        return {
          title: 'Sessão Expirada',
          description: 'Sua sessão expirou. Faça login novamente para continuar.',
          actionText: 'Fazer Login'
        }
      case 'permission':
        return {
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar este recurso.',
          actionText: 'Voltar'
        }
      default:
        return {
          title: 'Erro Inesperado',
          description: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
          actionText: 'Tentar Novamente'
        }
    }
  }

  const errorType = getErrorType(message)
  const errorInfo = getErrorInfo(errorType)

  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {errorInfo.title}
          </h3>
          <p className="text-gray-600 max-w-md">
            {errorInfo.description}
          </p>
          <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">
            {message}
          </p>
        </div>

        <div className="flex space-x-3">
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>{errorInfo.actionText}</span>
            </Button>
          )}
          
          {showGoHome && onGoHome && (
            <Button onClick={onGoHome} variant="outline" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}