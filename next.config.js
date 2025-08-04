/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurações de imagem otimizadas
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; img-src 'self' data: blob:; sandbox;",
    // Configurações para desenvolvimento local e produção
    unoptimized: false,
    // Desabilitar lazy loading padrão
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
      // Para outros domínios que possam ser necessários
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },

  // Configurações para pacotes externos do servidor
  serverExternalPackages: ['@supabase/supabase-js'],

  // Configurações de experimental features
  experimental: {
    // Habilitar apenas features estáveis
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      'react-dom'
    ],
    optimizeCss: true,
    serverMinification: true,
  },

  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Configurações específicas para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // Configurações de headers
  async headers() {
    return [
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
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configurações de redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/pt',
        permanent: false,
      },
    ]
  },

  // Configurações de rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig