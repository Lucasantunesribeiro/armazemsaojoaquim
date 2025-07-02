'use client'

import dynamic from 'next/dynamic'

// Loading component simples
const SimpleLoading = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
  </div>
)

// Hero Loading com tamanho específico
const HeroLoading = () => (
  <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
  </div>
)

// Footer Loading
const FooterLoading = () => (
  <footer className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400 mx-auto"></div>
      <p className="text-slate-300 mt-4 font-inter">Carregando...</p>
    </div>
  </footer>
)

// Importações dinâmicas dos componentes de seção
export const ClientHeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => <HeroLoading />
})

export const ClientAboutSection = dynamic(() => import('./sections/AboutSection'), {
  loading: () => <SimpleLoading />
})

export const ClientMenuPreview = dynamic(() => import('./sections/MenuPreview'), {
  loading: () => <SimpleLoading />
})

export const ClientBlogPreview = dynamic(() => import('./sections/BlogPreview'), {
  loading: () => <SimpleLoading />
})

export const ClientContactSection = dynamic(() => import('./sections/ContactSection'), {
  loading: () => <SimpleLoading />
})

export const ClientFooter = dynamic(() => import('./layout/Footer'), {
  loading: () => <FooterLoading />
}) 