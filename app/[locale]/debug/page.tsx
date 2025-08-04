'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        // Verificar variáveis de ambiente públicas
        const envData = {
          NODE_ENV: process.env.NODE_ENV,
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'Não configurado',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado',
          window: typeof window !== 'undefined' ? 'Disponível' : 'Não disponível',
          document: typeof document !== 'undefined' ? 'Disponível' : 'Não disponível',
          location: typeof window !== 'undefined' ? window.location.href : 'Não disponível',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Não disponível'
        }

        setEnvInfo(envData)
      } catch (error) {
        console.error('Erro ao verificar ambiente:', error)
        setEnvInfo({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    checkEnvironment()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          🔍 Debug - Configuração do Ambiente
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Informações do Ambiente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(envInfo).map(([key, value]) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {key}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">
                  {String(value)}
                </dd>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Teste de Funcionalidade
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-green-600">✅</span>
              <span className="text-gray-700 dark:text-gray-300">
                Página carregada com sucesso
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-green-600">✅</span>
              <span className="text-gray-700 dark:text-gray-300">
                React funcionando
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-green-600">✅</span>
              <span className="text-gray-700 dark:text-gray-300">
                Tailwind CSS funcionando
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <a
            href="/"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🏠 Voltar ao Início
          </a>
          
          <a
            href="/pt"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🔄 Testar Rota PT
          </a>
        </div>
      </div>
    </div>
  )
} 