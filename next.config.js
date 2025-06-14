// Carregar polyfills ANTES de qualquer coisa (corrigidos)
require('./lib/polyfills-minimal.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração básica
  reactStrictMode: true,
  
  // IMPORTANTE: Para Netlify, precisamos de static export
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Configurações experimentais básicas
  experimental: {
    optimizeCss: false, // Manter desabilitado por enquanto
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },

  // Configuração mínima do webpack
  webpack: (config, { isServer }) => {
    // Configuração para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Resolver problema "self is not defined" do Supabase apenas no servidor
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },

  // Configuração de imagens para Netlify - DESABILITAR otimização automática
  images: {
    unoptimized: true, // CRUCIAL para Netlify
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },

  // Headers básicos de segurança
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
          }
        ]
      }
    ]
  },

  poweredByHeader: false,
  compress: true,
  
  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false
  },

  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false
  },

  // IMPORTANTE: Para static export, precisamos desabilitar certas features
  async rewrites() {
    return []
  },

  async redirects() {
    return []
  }
}

module.exports = nextConfig