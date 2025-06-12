import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Header from '@/components/layout/Header'
import Analytics from '@/components/Analytics'
import { Suspense } from 'react'

// Otimizar fonte com display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-inter'
})

// Configurações de viewport otimizadas
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8B4513' },
    { media: '(prefers-color-scheme: dark)', color: '#8B4513' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover'
}

// Metadata otimizada para SEO e PWA
export const metadata: Metadata = {
  title: {
    default: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
    template: '%s | Armazém São Joaquim'
  },
  description: 'Restaurante histórico em Santa Teresa com culinária tradicional brasileira, vista panorâmica do Rio de Janeiro e ambiente aconchegante. Reserve sua mesa!',
  keywords: [
    'restaurante santa teresa',
    'culinária brasileira',
    'vista panorâmica rio',
    'restaurante histórico',
    'gastronomia carioca',
    'reserva mesa',
    'armazém são joaquim'
  ],
  authors: [{ name: 'Armazém São Joaquim' }],
  creator: 'Armazém São Joaquim',
  publisher: 'Armazém São Joaquim',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Armazém São Joaquim',
    title: 'Armazém São Joaquim - Restaurante Histórico em Santa Teresa',
    description: 'Restaurante histórico em Santa Teresa com culinária tradicional brasileira e vista panorâmica do Rio de Janeiro',
    images: [
      {
        url: '/images/armazem-fachada-historica.jpg',
        width: 1200,
        height: 630,
        alt: 'Fachada histórica do Armazém São Joaquim em Santa Teresa',
        type: 'image/jpeg',
      },
      {
        url: '/images/santa-teresa-vista-panoramica.jpg',
        width: 1200,
        height: 630,
        alt: 'Vista panorâmica de Santa Teresa a partir do Armazém',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armazém São Joaquim - Restaurante Histórico',
    description: 'Culinária tradicional brasileira com vista panorâmica em Santa Teresa',
    images: ['/images/armazem-fachada-historica.jpg'],
    creator: '@armazemsaojoaquim',
    site: '@armazemsaojoaquim',
  },
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
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  category: 'restaurant',
  classification: 'business',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  applicationName: 'Armazém São Joaquim',
  appleWebApp: {
    capable: true,
    title: 'Armazém São Joaquim',
    statusBarStyle: 'default',
    startupImage: [
      {
        url: '/apple-startup-640x1136.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-startup-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/apple-startup-1242x2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon.ico',
      },
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#8B4513',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Armazém SJ',
    'application-name': 'Armazém São Joaquim',
    'msapplication-TileColor': '#8B4513',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#8B4513',
  },
}

// Componente de preload crítico
function CriticalResourcePreloader() {
  return (
    <>
      {/* Preload de recursos críticos */}
      <link
        rel="preload"
        href="/images/armazem-fachada-historica.jpg"
        as="image"
        type="image/jpeg"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/images/santa-teresa-vista-panoramica.jpg"
        as="image"
        type="image/jpeg"
        fetchPriority="high"
      />
      
      {/* DNS prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//supabase.co" />
      <link rel="dns-prefetch" href="//netlify.app" />
      
      {/* Preconnect para recursos críticos */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
      
      {/* Service Worker registration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js', { scope: '/' })
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />
    </>
  )
}

// Componente de fallback para loading
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-amber-800 font-medium">Carregando Armazém São Joaquim...</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <CriticalResourcePreloader />
        
        {/* Meta tags adicionais para performance */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* Structured Data para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Armazém São Joaquim",
              "description": "Restaurante histórico em Santa Teresa com culinária tradicional brasileira",
              "url": process.env.NEXT_PUBLIC_SITE_URL,
              "telephone": "+55-21-XXXX-XXXX",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Santa Teresa",
                "addressLocality": "Rio de Janeiro",
                "addressRegion": "RJ",
                "addressCountry": "BR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-22.9068",
                "longitude": "-43.1729"
              },
              "openingHours": [
                "Tu-Su 12:00-22:00"
              ],
              "servesCuisine": "Brazilian",
              "priceRange": "$$",
              "image": [
                `${process.env.NEXT_PUBLIC_SITE_URL}/images/armazem-fachada-historica.jpg`,
                `${process.env.NEXT_PUBLIC_SITE_URL}/images/santa-teresa-vista-panoramica.jpg`
              ],
              "sameAs": [
                "https://www.instagram.com/armazemsaojoaquim",
                "https://www.facebook.com/armazemsaojoaquim"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Suspense fallback={<LoadingFallback />}>
          <ThemeProvider>
            <SupabaseProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            </SupabaseProvider>
          </ThemeProvider>
        </Suspense>
        
        {/* Script de otimização de performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Otimizações de performance
              if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                  // Preload de rotas importantes
                  if ('IntersectionObserver' in window) {
                    const links = document.querySelectorAll('a[href^="/"]');
                    const linkObserver = new IntersectionObserver((entries) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                          const link = entry.target;
                          const href = link.getAttribute('href');
                          if (href && !link.dataset.preloaded) {
                            const linkEl = document.createElement('link');
                            linkEl.rel = 'prefetch';
                            linkEl.href = href;
                            document.head.appendChild(linkEl);
                            link.dataset.preloaded = 'true';
                          }
                        }
                      });
                    });
                    links.forEach(link => linkObserver.observe(link));
                  }
                });
              }
              
              // Lazy loading para imagens
              if ('loading' in HTMLImageElement.prototype) {
                const images = document.querySelectorAll('img[data-src]');
                images.forEach(img => {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-src');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}