'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Calendar, Home } from 'lucide-react'
import Link from 'next/link'

export default function ReservasError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro específico de reservas
    console.error('Reservas page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-creme-suave via-white to-creme-suave flex items-center justify-center p-4 pt-24">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Ícone de erro */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-madeira-escura font-playfair">
            Erro no Sistema de Reservas
          </h1>
          <p className="text-cinza-medio font-inter">
            Ocorreu um problema ao processar sua reserva. Tente novamente ou entre em contato conosco.
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

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/reservas"
              className="bg-white hover:bg-gray-50 text-madeira-escura font-semibold py-3 px-4 rounded-xl border-2 border-cinza-claro transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Recarregar
            </Link>

            <Link
              href="/"
              className="bg-white hover:bg-gray-50 text-madeira-escura font-semibold py-3 px-4 rounded-xl border-2 border-cinza-claro transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Início
            </Link>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="pt-4 border-t border-cinza-claro">
          <p className="text-sm text-cinza-medio mb-3">
            Para fazer sua reserva por telefone:
          </p>
          <div className="bg-amarelo-armazem/10 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-madeira-escura">
              📞 (21) 2221-1398
            </p>
            <p className="text-xs text-cinza-medio">
              Terça a Domingo • 18h às 23h
            </p>
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-sm text-blue-800 mb-2">
            💡 Dicas para evitar problemas:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Verifique sua conexão com a internet</li>
            <li>• Certifique-se de estar logado em sua conta</li>
            <li>• Tente usar um navegador diferente</li>
            <li>• Limpe o cache do navegador</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 