'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '../ui/Loading'

// Importação dinâmica do Header para evitar problemas de hidratação
const Header = dynamic(() => import('./Header'), {
  loading: () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
          </div>
        </div>
      </div>
    </header>
  ),
  ssr: false
})

export default function ClientHeader() {
  return <Header />
} 