'use client'

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Analytics from '@/components/Analytics'
import './globals.css'
import Header from '../components/layout/Header'
import Footer from '../components/sections/Footer'
import { Toaster } from 'react-hot-toast'
import { SupabaseProvider } from '../components/providers/SupabaseProvider'
import Script from 'next/script'
import { useEffect } from 'react'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif']
})

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  fallback: ['serif']
})

export const metadata: Metadata = {
  title: 'Armazém São Joaquim - "En esta casa tenemos memoria"',
  description: 'Restaurante histórico em Santa Teresa, Rio de Janeiro. 170 anos de história, drinks excepcionais e gastronomia única no coração de Santa Teresa.',
  keywords: [
    'restaurante santa teresa',
    'bar rio de janeiro', 
    'drinks artesanais',
    'pousada santa teresa',
    'armazém são joaquim',
    'história rio de janeiro',
    'bondinho santa teresa',
    'gastronomia carioca'
  ].join(', '),
  authors: [{ name: 'Armazém São Joaquim' }],
  creator: 'Armazém São Joaquim',
  publisher: 'Armazém São Joaquim',
  metadataBase: new URL('https://armazemsaojoaquim.netlify.app'),
  alternates: {
    canonical: '/',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://armazemsaojoaquim.netlify.app',
    title: 'Armazém São Joaquim - Santa Teresa',
    description: 'Restaurante histórico em Santa Teresa com 170 anos de história. Drinks excepcionais e gastronomia única.',
    siteName: 'Armazém São Joaquim',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Armazém São Joaquim - Restaurante em Santa Teresa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Armazém São Joaquim - Santa Teresa',
    description: 'Restaurante histórico em Santa Teresa com 170 anos de história.',
    images: ['/og-image.jpg'],
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
    google: 'google-site-verification-code-here',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Running in development mode')
    }
  }, [])

  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Critical CSS inline to prevent FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html { font-size: 16px; }
            body { 
              font-family: 'Inter', -apple-system, sans-serif; 
              line-height: 1.6; 
              color: #2D1810; 
              background: #FFFFFF;
              overflow-x: hidden;
              min-height: 100vh;
            }
            .header-skeleton { 
              width: 100%; 
              height: 80px; 
              background: #FFFFFF; 
              position: fixed; 
              top: 0; 
              z-index: 50; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .hero-skeleton { 
              width: 100%; 
              height: 100vh; 
              min-height: 600px; 
              background: linear-gradient(135deg, #F4C430 0%, #B22222 100%); 
              display: flex; 
              align-items: center; 
              justify-content: center;
            }
          `
        }} />
        
        <meta name="theme-color" content="#F4C430" />
        <meta name="theme-color" content="#1A1A1A" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Armazém São Joaquim" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources */}
        <link 
          rel="preload" 
          href="/images/hero-1.jpg" 
          as="image" 
          type="image/jpeg"
          media="(min-width: 768px)"
        />
        <link 
          rel="preload" 
          href="/images/armazem-logo.webp" 
          as="image" 
          type="image/webp"
        />
        
        {/* Critical font preload */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          />
        </noscript>
        
        {/* CSP for security */}
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-src 'none';"
        />
      </head>
      <body className="font-inter antialiased bg-background text-text-primary">
        {/* Prevent layout shift with skeleton */}
        <div className="header-skeleton" aria-hidden="true"></div>
        
        <SupabaseProvider>
          <Header />
          <main className="min-h-screen" role="main">
            {children}
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2D1810',
                color: '#ffffff',
              },
            }}
            aria-live="polite"
          />
        </SupabaseProvider>
        
        <Analytics />
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registration successful');
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed');
                  });
              });
            }
          `}
        </Script>

        {/* Performance monitoring - Critical Web Vitals */}
        <Script id="web-vitals" strategy="afterInteractive">
          {`
            function getCLS(onReport) {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!entry.hadRecentInput) {
                    onReport(entry);
                  }
                }
              });
              observer.observe({type: 'layout-shift', buffered: true});
            }
            
            function getLCP(onReport) {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                onReport(lastEntry);
              });
              observer.observe({type: 'largest-contentful-paint', buffered: true});
            }
            
            function getFID(onReport) {
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  onReport(entry);
                }
              });
              observer.observe({type: 'first-input', buffered: true});
            }
            
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              getCLS(entry => console.log('CLS:', entry.value));
              getLCP(entry => console.log('LCP:', entry.startTime));
              getFID(entry => console.log('FID:', entry.processingStart - entry.startTime));
            }
          `}
        </Script>

        {/* Error tracking */}
        <Script id="error-tracking" strategy="afterInteractive">
          {`
            window.addEventListener('error', function(e) {
              console.error('Global error:', e.error);
            });
            
            window.addEventListener('unhandledrejection', function(e) {
              console.error('Unhandled promise rejection:', e.reason);
            });
          `}
        </Script>
      </body>
    </html>
  )
}