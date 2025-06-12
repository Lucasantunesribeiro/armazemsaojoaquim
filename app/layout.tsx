import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import ClientHeader from '../components/layout/ClientHeader'
import { ClientFooter } from '../components/ClientComponents'
import SupabaseProvider from '../components/providers/SupabaseProvider'
import { ThemeProvider } from '../components/providers/ThemeProvider'
import SystemHealth from '../components/ui/SystemHealth'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDF6E3' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' }
  ],
  colorScheme: 'light dark'
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app'),
  title: {
    default: 'Armazém São Joaquim - Tradição Gastronômica desde 1854 | Santa Teresa - Rio de Janeiro',
    template: '%s | Armazém São Joaquim'
  },
  description: 'Descubra o Armazém São Joaquim, um patrimônio histórico de 1854 no coração de Santa Teresa. Culinária tradicional brasileira, drinks artesanais e 170 anos de história no Rio de Janeiro.',
  keywords: [
    'Armazém São Joaquim',
    'Santa Teresa',
    'Rio de Janeiro',
    'Restaurante Histórico',
    'Culinária Tradicional',
    '1854',
    'Patrimônio Histórico',
    'Drinks Artesanais',
    'Gastronomia Brasileira',
    'Reservas',
    'Bondinho Santa Teresa'
  ],
  authors: [{ name: 'Armazém São Joaquim' }],
  creator: 'Armazém São Joaquim',
  publisher: 'Armazém São Joaquim',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Armazém São Joaquim',
    title: 'Armazém São Joaquim - Tradição Gastronômica desde 1854',
    description: 'Patrimônio histórico de Santa Teresa com 170 anos de tradição. Culinária brasileira autêntica e drinks artesanais no Rio de Janeiro.',
    images: [
      {
        url: '/images/armazem-fachada-historica.jpg',
        width: 1200,
        height: 630,
        alt: 'Fachada histórica do Armazém São Joaquim - Construção de 1854 em Santa Teresa',
        type: 'image/jpeg',
      },
      {
        url: '/images/armazem-interior-aconchegante.jpg',
        width: 1200,
        height: 630,
        alt: 'Interior aconchegante do Armazém São Joaquim',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armazém São Joaquim - Tradição desde 1854',
    description: '170 anos de história gastronômica em Santa Teresa, Rio de Janeiro.',
    images: ['/images/armazem-fachada-historica.jpg'],
    creator: '@armazemsaojoaquim',
    site: '@armazemsaojoaquim'
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
    other: {
      me: ['mailto:armazemsaojoaquimoficial@gmail.com']
    }
  },
  category: 'Restaurant',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  generator: 'Next.js',
  applicationName: 'Armazém São Joaquim',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Armazém São Joaquim',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Armazém São Joaquim',
    'application-name': 'Armazém São Joaquim',
    'msapplication-TileColor': '#D4AF37',
    'msapplication-TileImage': '/icons/mstile-144x144.png',
    'theme-color': '#FDF6E3'
  }
}

// Structured Data para SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Armazém São Joaquim',
  description: 'Restaurante histórico em Santa Teresa funcionando desde 1854, oferecendo culinária tradicional brasileira e drinks artesanais.',
  image: [
    'https://armazemsaojoaquim.netlify.app/images/armazem-fachada-historica.jpg',
    'https://armazemsaojoaquim.netlify.app/images/armazem-interior-aconchegante.jpg'
  ],
  '@id': 'https://armazemsaojoaquim.netlify.app',
  url: 'https://armazemsaojoaquim.netlify.app',
  telephone: '+55-21-XXXX-XXXX',
  priceRange: '$$',
  servesCuisine: ['Brazilian', 'Traditional'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Áurea, 26',
    addressLocality: 'Santa Teresa',
    addressRegion: 'RJ',
    postalCode: '20241-220',
    addressCountry: 'BR'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -22.9168,
    longitude: -43.1890
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '12:00',
      closes: '22:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '12:00',
      closes: '23:00'
    }
  ],
  menu: 'https://armazemsaojoaquim.netlify.app/menu',
  acceptsReservations: true,
  foundingDate: '1854',
  awards: ['Patrimônio Histórico de Santa Teresa'],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1000',
    bestRating: '5',
    worstRating: '1'
  },
  sameAs: [
    'https://www.instagram.com/armazemsaojoaquim',
    'https://www.facebook.com/armazemsaojoaquim',
    'https://www.tripadvisor.com.br/Restaurant_Review-g303506'
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="pt-BR" 
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical Resources */}
        <link
          rel="preload"
          href="/images/armazem-fachada-historica.jpg"
          as="image"
          type="image/jpeg"
        />
        <link
          rel="preload"
          href="/images/logo.jpg"
          as="image"
          type="image/jpeg"
        />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" href="/images/favicon.ico" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Performance Hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* Security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <SupabaseProvider>
            <div className="relative flex min-h-screen flex-col">
              {/* Skip to main content for accessibility */}
              <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-amber-600 text-white px-4 py-2 rounded-md z-50"
              >
                Pular para o conteúdo principal
              </a>
              
              <ClientHeader />
              
              <main id="main-content" className="flex-1">
                {children}
              </main>
              
              <ClientFooter />
            </div>
            
            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '16px',
                  maxWidth: '400px'
                },
                success: {
                  style: {
                    borderLeft: '4px solid var(--dourado-colonial)',
                    background: 'var(--surface)',
                  },
                  iconTheme: {
                    primary: 'var(--dourado-colonial)',
                    secondary: 'var(--surface)',
                  },
                },
                error: {
                  style: {
                    borderLeft: '4px solid #EF4444',
                    background: 'var(--surface)',
                  },
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: 'var(--surface)',
                  },
                },
                loading: {
                  style: {
                    borderLeft: '4px solid var(--terracota-santa-teresa)',
                  },
                  iconTheme: {
                    primary: 'var(--terracota-santa-teresa)',
                    secondary: 'var(--surface)',
                  },
                },
              }}
            />
            
            {/* System Health Monitor */}
            <SystemHealth />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}