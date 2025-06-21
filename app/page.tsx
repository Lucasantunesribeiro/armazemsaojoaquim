import { Suspense } from 'react'
import {
  ClientHeroSection,
  ClientAboutSection,
  ClientMenuPreview,
  ClientBlogPreview,
  ClientContactSection,
} from '@/components/ClientComponents'

// Loading fallback melhorado para mobile
const SectionFallback = () => (
  <div className="w-full min-h-[200px] md:min-h-[400px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-800 dark:to-slate-700">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-600 dark:border-amber-400 mx-auto"></div>
      <p className="text-amber-800 dark:text-amber-200 text-sm md:text-base font-inter">Carregando seção...</p>
    </div>
  </div>
)

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
        <div className="py-8 md:py-16 bg-white dark:bg-slate-900">
          <ClientAboutSection />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Menu Preview */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16 bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-slate-800/50 dark:to-amber-950/30">
          <ClientMenuPreview />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Blog Preview */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16 bg-white dark:bg-slate-900">
          <ClientBlogPreview />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Contact Section */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16 bg-gradient-to-br from-amber-50/20 to-orange-50/20 dark:from-slate-900/80 dark:to-slate-800/60">
          <ClientContactSection />
        </div>
      </Suspense>
    </main>
  )
}