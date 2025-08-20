'use client'

import Link from 'next/link'

export default function LocaleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-800 dark:text-amber-400 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-200"
          >
            🏠 Voltar ao Início
          </Link>
          
          <Link
            href="/menu"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors duration-200"
          >
            🍽️ Ver Menu
          </Link>
          
          <Link
            href="/pousada"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 transition-colors duration-200"
          >
            🏨 Conhecer Pousada
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Armazém São Joaquim</p>
          <p>"En esta casa tenemos memoria"</p>
        </div>
      </div>
    </div>
  )
} 