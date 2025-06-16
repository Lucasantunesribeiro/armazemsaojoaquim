import { Suspense } from 'react'
import {
  ClientHeroSection,
  ClientAboutSection,
  ClientMenuPreview,
  ClientBlogPreview,
  ClientContactSection,
} from '@/components/ClientComponents'

// Loading fallback simples
const SectionFallback = () => (
  <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
  </div>
)

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<SectionFallback />}>
        <ClientHeroSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ClientAboutSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ClientMenuPreview />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ClientBlogPreview />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ClientContactSection />
      </Suspense>
    </>
  )
}