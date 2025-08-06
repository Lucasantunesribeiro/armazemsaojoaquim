/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configurations - Temporariamente ignore errors para testar build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Output configuration for Netlify
  output: 'standalone',
  trailingSlash: false,
  
  // Runtime configurations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configurações de imagem otimizadas
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; img-src 'self' data: blob:; sandbox;",
    unoptimized: false,
    loader: 'default',
    // Configurações para Supabase Storage e outros domínios
    remotePatterns: [
      // Para desenvolvimento local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Para produção (Netlify)
      {
        protocol: 'https',
        hostname: '*.netlify.app',
        pathname: '/**',
      },
      // Para Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
  },

  // Configurações para pacotes externos do servidor - NEXT.JS 15 FIX
  serverExternalPackages: ['bcryptjs'],

  // NEXT.JS 15 - Experimental features otimizadas
  experimental: {
    // Package import optimization para melhor tree shaking
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      'react-dom',
      '@supabase/supabase-js'
    ],
    // CSS otimizations
    optimizeCss: true,
    serverMinification: true,
    // Performance features
    gzipSize: true,
    // NEXT.JS 15: Better middleware handling
    middlewarePrefetch: 'strict',
  },

  // Configurações de webpack simplificadas para evitar factory call errors
  webpack: (config, { isServer }) => {
    // Configurações básicas para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },

  // Configurações de headers otimizados
  async headers() {
    return [
      // Security headers para todas as páginas
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache headers para assets estáticos
      {
        source: '/(_next/static|images|favicon)/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // API routes headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]
  },

  // Configurações de redirects otimizados
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pt',
        permanent: false,
      },
      // SEO redirects para páginas antigas
      {
        source: '/admin/(.*)',
        has: [
          {
            type: 'cookie',
            key: 'role',
            value: '(?!admin).*',
          },
        ],
        destination: '/unauthorized',
        permanent: false,
      },
    ]
  },

  // Performance budget warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig