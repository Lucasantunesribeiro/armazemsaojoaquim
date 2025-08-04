'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Home, ArrowLeft, Coffee, MapPin, Clock, Phone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Voltar ao Início
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              📋 Ver Cardápio
            </Link>
            <Link
              href="/reservas"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              📅 Fazer Reserva
            </Link>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Armazém São Joaquim</p>
          <p>"En esta casa tenemos memoria"</p>
        </div>
      </div>
    </div>
  )
} 