'use client'

import dynamic from 'next/dynamic'

// Loading component simples
const SimpleLoading = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
)

// Importações dinâmicas dos componentes de seção
export const ClientHeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>
  ),
  ssr: false
})

export const ClientAboutSection = dynamic(() => import('./sections/AboutSection'), {
  loading: () => <SimpleLoading />,
  ssr: false
})

export const ClientMenuPreview = dynamic(() => import('./sections/MenuPreview'), {
  loading: () => <SimpleLoading />,
  ssr: false
})

export const ClientBlogPreview = dynamic(() => import('./sections/BlogPreview'), {
  loading: () => <SimpleLoading />,
  ssr: false
})

export const ClientContactSection = dynamic(() => import('./sections/ContactSection'), {
  loading: () => <SimpleLoading />,
  ssr: false
})

export const ClientFooter = dynamic(() => import('./sections/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
      </div>
    </footer>
  ),
  ssr: false
}) 