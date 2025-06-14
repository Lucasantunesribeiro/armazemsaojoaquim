// Carregar polyfills ANTES de qualquer coisa (corrigidos)
require('./lib/polyfills-minimal.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração básica
  reactStrictMode: false, // Desabilitar em produção para evitar double-render
  
  // IMPORTANTE: Para Netlify, precisamos de static export
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // ESLint menos rigoroso
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript menos rigoroso  
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração de imagens para static export
  images: {
    unoptimized: true, // CRUCIAL para static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'fonts.googleapis.com',
      }
    ]
  },

  // Configuração mínima do webpack
  webpack: (config, { isServer }) => {
    // Configuração para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Resolver problema "self is not defined" durante build
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

  // Variables de ambiente públicas
  env: {
    CUSTOM_KEY: 'netlify-production',
  },

  // Experimental features (mínimo necessário)
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig