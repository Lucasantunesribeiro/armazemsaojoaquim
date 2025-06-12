'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from './ui/Loading'

// Loading component para as seções
const SectionLoading = () => (
  <div className="w-full h-96 flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
)

// Importações dinâmicas dos componentes de seção
export const ClientHeroSection = dynamic(() => import('./sections/HeroSection'), {
  loading: () => (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <LoadingSpinner size="lg" />
    </div>
  ),
  ssr: false
})

export const ClientAboutSection = dynamic(() => import('./sections/AboutSection'), {
  loading: () => <SectionLoading />,
  ssr: false
})

export const ClientMenuPreview = dynamic(() => import('./sections/MenuPreview'), {
  loading: () => <SectionLoading />,
  ssr: false
})

export const ClientBlogPreview = dynamic(() => import('./sections/BlogPreview'), {
  loading: () => <SectionLoading />,
  ssr: false
})

export const ClientContactSection = dynamic(() => import('./sections/ContactSection'), {
  loading: () => <SectionLoading />,
  ssr: false
})

export const ClientFooter = dynamic(() => import('./sections/Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => (
    <footer className="bg-slate-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <LoadingSpinner size="sm" />
      </div>
    </footer>
  ),
  ssr: false
}) 