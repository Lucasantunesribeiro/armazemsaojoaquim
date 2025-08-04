import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNavigation from '@/components/ui/BottomNavigation'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers/Providers'
import { LanguageProvider } from '@/contexts/LanguageContext'
import '../globals.css'
import { Suspense } from 'react'
import Loading from '@/components/ui/Loading'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Armazém São Joaquim - Restaurante, Café e Pousada',
  description: 'Armazém São Joaquim - Experimente nossa culinária tradicional brasileira, café artesanal e hospedagem aconchegante.',
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params
  return (
    <LanguageProvider>
      <Providers>
        <Header />
        <main className="min-h-screen main-content-mobile">
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
        <Footer />
        <BottomNavigation />
        <Toaster />
      </Providers>
    </LanguageProvider>
  )
}

// Generate static params for supported locales
export function generateStaticParams() {
  return [
    { locale: 'pt' },
    { locale: 'en' }
  ]
}