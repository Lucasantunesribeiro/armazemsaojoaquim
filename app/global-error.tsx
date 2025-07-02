'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('Global error:', error)
    
    // Aqui você pode integrar com serviços de monitoramento como Sentry
    // Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
            {/* Ícone de erro */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-madeira-escura font-playfair">
                Ops! Algo deu errado
              </h1>
              <p className="text-cinza-medio font-inter">
                Ocorreu um erro inesperado em nossa aplicação. Nossa equipe foi notificada.
              </p>
            </div>

            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  Detalhes do erro (desenvolvimento):
                </h3>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full bg-amarelo-armazem hover:bg-amarelo-armazem/90 text-madeira-escura font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>

              <Link
                href="/"
                className="w-full bg-white hover:bg-gray-50 text-madeira-escura font-semibold py-3 px-6 rounded-xl border-2 border-cinza-claro transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Voltar ao início
              </Link>
            </div>

            {/* Informações de contato */}
            <div className="pt-4 border-t border-cinza-claro">
              <p className="text-sm text-cinza-medio">
                Se o problema persistir, entre em contato:
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm font-medium text-madeira-escura">
                  📞 (21) 2221-1398
                </p>
                <p className="text-sm font-medium text-madeira-escura">
                  📧 contato@armazemsaojoaquim.com.br
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 