'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">⚠️</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Algo deu errado
          </h2>
          <p className="text-gray-600 mb-8">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mr-4"
          >
            🔄 Tentar Novamente
          </button>
          
          <Link
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Voltar ao Início
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Armazém São Joaquim</p>
          <p>"En esta casa tenemos memoria"</p>
        </div>
      </div>
    </div>
  )
} 