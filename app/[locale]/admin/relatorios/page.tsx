'use client'

import { useState } from 'react'
import { BarChart3, FileText, Download, TrendingUp } from 'lucide-react'

export default function RelatoriosPage() {
  const [isLoading] = useState(false)

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualize dados e gere relatórios do sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Relatório de Reservas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Reservas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Relatório de reservas da pousada</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório</span>
            </button>
          </div>
        </div>

        {/* Relatório de Blog */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Posts do Blog</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Estatísticas dos posts publicados</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled={isLoading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório</span>
            </button>
          </div>
        </div>

        {/* Relatório de Café */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Vendas do Café</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Relatório de produtos e pedidos</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              disabled={isLoading}
              className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Gerar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Funcionalidade em Desenvolvimento
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              A geração de relatórios será implementada em breve. Por enquanto, você pode acessar os dados 
              diretamente nas seções correspondentes do painel admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}