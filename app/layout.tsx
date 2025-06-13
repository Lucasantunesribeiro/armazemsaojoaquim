import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Otimização de fontes
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: {
    default: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
    template: '%s | Armazém São Joaquim'
  },
  description: 'Restaurante histórico no coração de Santa Teresa. Desde 1854 oferecendo culinária mineira autêntica em um ambiente acolhedor e cheio de história.',
  keywords: ['restaurante', 'Santa Teresa', 'culinária mineira', 'histórico', 'Rio de Janeiro'],
  authors: [{ name: 'Armazém São Joaquim' }],
  creator: 'Armazém São Joaquim',
  publisher: 'Armazém São Joaquim',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://armazemsaojoaquim.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
    description: 'Restaurante histórico no coração de Santa Teresa. Desde 1854 oferecendo culinária mineira autêntica.',
    url: 'https://armazemsaojoaquim.com.br',
    siteName: 'Armazém São Joaquim',
    images: [
      {
        url: '/images/armazem-fachada-historica.jpg',
        width: 1200,
        height: 630,
        alt: 'Fachada histórica do Armazém São Joaquim',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armazém São Joaquim - Restaurante Histórico',
    description: 'Culinária mineira autêntica no coração de Santa Teresa desde 1854.',
    images: ['/images/armazem-fachada-historica.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Preload crítico */}
        <link
          rel="preload"
          href="/images/armazem-fachada-historica.jpg"
          as="image"
          type="image/jpeg"
        />
        <link
          rel="preload"
          href="/images/armazem-interior-aconchegante.jpg"
          as="image"
          type="image/jpeg"
        />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Viewport otimizado */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#8B4513" />
        <meta name="msapplication-TileColor" content="#8B4513" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons otimizados */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background font-inter antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 main-content">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}