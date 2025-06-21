import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNavigation from '@/components/ui/BottomNavigation'
import { Toaster } from '@/components/ui/toaster'

// Importar utilitário para suprimir warnings do Grammarly
import '@/lib/suppress-warnings'

// Fontes otimizadas com display swap
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
  fallback: ['Georgia', 'serif']
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f59e0b', // Amber theme color
  colorScheme: 'light dark',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://armazemsaojoaquim.netlify.app'),
  title: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
  description: 'Desde 1854 preservando a tradição gastronômica de Santa Teresa. Desfrute de pratos únicos em um ambiente histórico no coração do Rio de Janeiro.',
  keywords: 'restaurante, Santa Teresa, Rio de Janeiro, gastronomia, história, armazém',
  authors: [{ name: 'Armazém São Joaquim' }],
  creator: 'Armazém São Joaquim',
  publisher: 'Armazém São Joaquim',
  robots: 'index, follow',
  openGraph: {
    title: 'Armazém São Joaquim - Restaurante Histórico',
    description: 'Desde 1854 preservando a tradição gastronômica de Santa Teresa',
    url: 'https://armazemsaojoaquim.netlify.app',
    siteName: 'Armazém São Joaquim',
    images: [
      {
        url: '/images/hero/armazem-fachada.jpg',
        width: 1200,
        height: 630,
        alt: 'Fachada histórica do Armazém São Joaquim'
      }
    ],
    locale: 'pt_BR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armazém São Joaquim - Restaurante Histórico',
    description: 'Desde 1854 preservando a tradição gastronômica de Santa Teresa',
    images: ['/images/hero/armazem-fachada.jpg']
  },
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="pt-BR" 
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen main-content-mobile">
            {children}
          </main>
          <Footer />
          <BottomNavigation />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}