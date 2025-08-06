'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ClientHeroSection } from '@/components/ClientComponents'

// Lazy load non-critical sections
const LazyAboutSection = dynamic(() => import('@/components/sections/AboutSection'), {
  loading: () => <SectionFallback />
})

const LazyMenuPreview = dynamic(() => import('@/components/sections/MenuPreview'), {
  loading: () => <SectionFallback />
})

const LazyBlogPreview = dynamic(() => import('@/components/sections/BlogPreview'), {
  loading: () => <SectionFallback />
})

const LazyContactSection = dynamic(() => import('@/components/sections/ContactSection'), {
  loading: () => <SectionFallback />
})

// Loading fallback simples sem dependências de hooks
const SectionFallback = () => {
  return (
    <div className="w-full min-h-[200px] md:min-h-[400px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-700">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-600 dark:border-amber-400 mx-auto"></div>
        <p className="text-amber-800 dark:text-amber-200 text-sm md:text-base font-inter">Carregando...</p>
      </div>
    </div>
  )
}

// Separador visual entre seções
const SectionSeparator = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-cinza-claro/20 dark:via-slate-600/30 to-transparent" />
)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section - Tela cheia */}
      <Suspense fallback={<SectionFallback />}>
        <ClientHeroSection />
      </Suspense>
      
      <SectionSeparator />
      
      {/* About Section */}
      <Suspense fallback={<SectionFallback />}>
        <LazyAboutSection />
      </Suspense>
      
      <SectionSeparator />
      
      {/* Menu Preview */}
      <Suspense fallback={<SectionFallback />}>
        <LazyMenuPreview />
      </Suspense>
      
      <SectionSeparator />
      
      {/* Blog Preview */}
      <Suspense fallback={<SectionFallback />}>
        <LazyBlogPreview />
      </Suspense>
      
      <SectionSeparator />
      
      {/* Contact Section */}
      <Suspense fallback={<SectionFallback />}>
        <LazyContactSection />
      </Suspense>
    </main>
  )
}