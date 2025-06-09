'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Button from '../components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cinza-claro px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="font-playfair text-3xl font-bold text-madeira-escura mb-4">
          Oops! Algo deu errado
        </h1>
        
        <p className="text-cinza-medio mb-6">
          Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={reset} 
            className="w-full bg-amarelo-armazem text-madeira-escura px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </button>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar para o início
            </Button>
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-cinza-medio">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
} 