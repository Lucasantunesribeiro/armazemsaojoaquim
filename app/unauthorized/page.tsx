'use client'

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-red-50 p-8 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Acesso Negado
        </h1>
        <p className="text-gray-700 mb-6">
          Você não tem permissão para acessar esta área. 
          Apenas administradores podem acessar o painel administrativo.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/auth"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fazer Login
          </Link>
          
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Voltar para Início
          </Link>
          
          <Link
            href="/test-auth-sync"
            className="block w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Teste de Autenticação
          </Link>
        </div>
      </div>
    </div>
  )
}