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
  <div className="w-full min-h-[200px] md:min-h-[400px] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-amber-600 mx-auto"></div>
      <p className="text-amber-800 text-sm md:text-base font-inter">Carregando seção...</p>
    </div>
  </div>
)

// Separador visual entre seções
const SectionSeparator = () => (
  <div className="w-full h-px bg-gradient-to-r from-transparent via-cinza-claro/20 to-transparent" />
)

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Tela cheia */}
      <Suspense fallback={<SectionFallback />}>
        <ClientHeroSection />
      </Suspense>
      
      <SectionSeparator />
      
      {/* About Section */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16">
          <ClientAboutSection />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Menu Preview */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16 bg-gradient-to-br from-amber-50/30 to-orange-50/30">
          <ClientMenuPreview />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Blog Preview */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16">
          <ClientBlogPreview />
        </div>
      </Suspense>
      
      <SectionSeparator />
      
      {/* Contact Section */}
      <Suspense fallback={<SectionFallback />}>
        <div className="py-8 md:py-16 bg-gradient-to-br from-amber-50/20 to-orange-50/20">
          <ClientContactSection />
        </div>
      </Suspense>
    </main>
  )
}