/** @type {import('next').NextConfig} */

// Configuração condicional do bundle analyzer
let withBundleAnalyzer = (config) => config

try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
} catch (error) {
  console.log('Bundle analyzer não disponível, usando configuração padrão')
}

const nextConfig = {
  // Configurações básicas
  reactStrictMode: true,
  
  // Configurações de imagem - Otimizadas para Netlify
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.netlify.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'enolssforaepnrpfrima.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },

  // Configurações experimentais para performance
  experimental: {
    optimizeCss: true,
    middlewarePrefetch: 'strict',
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-switch',
      'react-hook-form',
      '@hookform/resolvers'
    ],
  },

  // Configurações de compiler para performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de webpack para otimização
  webpack: (config, { isServer, dev }) => {
    // Otimizações de produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
      }
    }

    // Configurações básicas para o cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }

      // Otimizações de bundle size
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '.',
      }
    }

    // Melhorar resolução de módulos
    config.resolve.modules = ['node_modules', '.']
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx']

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)