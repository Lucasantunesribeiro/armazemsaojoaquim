'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, Database, UserX, Shield } from 'lucide-react'

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  const getErrorInfo = () => {
    switch (error) {
      case 'database_error':
        return {
          icon: Database,
          title: 'Erro de Sistema',
          description: 'Ocorreu um erro ao verificar suas permissões. Tente novamente em alguns instantes.'
        }
      case 'user_not_found':
        return {
          icon: UserX,
          title: 'Usuário Não Encontrado',
          description: 'Sua conta não foi encontrada no sistema. Entre em contato com o administrador.'
        }
      case 'insufficient_permissions':
        return {
          icon: Shield,
          title: 'Privilégios Insuficientes',
          description: 'Você não possui privilégios de administrador para acessar esta área.'
        }
      default:
        return {
          icon: AlertTriangle,
          title: 'Acesso Negado',
          description: 'Você não tem permissão para acessar esta página.'
        }
    }
  }

  const errorInfo = getErrorInfo()
  const Icon = errorInfo.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full">
            <Icon className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {errorInfo.title}
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          {message ? decodeURIComponent(message) : errorInfo.description}
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 dark:text-red-400">
              Código do erro: <code className="font-mono">{error}</code>
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
          >
            Voltar ao Início
          </Link>
          
          <Link
            href="/auth"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  )
}