// Carregar polyfills ANTES de qualquer coisa
require('./lib/polyfills-minimal.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações básicas de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Otimizações de imagem
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400, // 1 dia
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.netlify.app',
      },
    ],
  },

  // Configurações de build
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Headers de segurança essenciais
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ]
  },

  // Webpack simplificado
  webpack: (config, { dev, isServer }) => {
    // Fix para problemas de SSR
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Configurar SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Configurações de runtime
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // Configurações de TypeScript e ESLint (mais permissivas para build)
  typescript: {
    ignoreBuildErrors: process.env.CI === 'true',
  },

  eslint: {
    ignoreDuringBuilds: process.env.CI === 'true',
  },

  // Configurações de output
  trailingSlash: false,
}

module.exports = nextConfig