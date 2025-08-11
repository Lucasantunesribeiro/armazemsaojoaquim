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
  
  // Configurações de imagem - Otimizadas para performance
  images: {
    unoptimized: false, // Enable Next.js image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
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
      '@hookform/resolvers',
      'date-fns',
      'recharts'
    ],

  },

  // Configure serverless functions for better Edge Runtime compatibility
  serverExternalPackages: ['@supabase/supabase-js'],

  // Configure output for Netlify deployment
  output: 'standalone',

  // Configurações de compiler para performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de webpack para otimização
  webpack: (config, { isServer, dev }) => {
    // Recharts + victory-vendor/d3-shape compatibility fix
    config.resolve.alias = {
      ...config.resolve.alias,
      'victory-vendor/d3-shape': 'd3-shape',
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/types': './types',
      '@/hooks': './hooks',
      '@/app': './app'
    }

    // Otimizações de produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
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
    }

    // Edge Runtime compatibility for Supabase
    config.resolve.fallback = {
      ...config.resolve.fallback,
      process: false,
    }

    // Melhorar resolução de módulos
    config.resolve.modules = ['node_modules', '.']
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx']
    
    // Suppress specific warnings including Supabase Edge Runtime warnings
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve 'victory-vendor\/d3-shape'/,
      /Attempted import error:.*is not exported from 'victory-vendor\/d3-shape'/,
      /A Node\.js API is used \(process\.version at line: \d+\) which is not supported in the Edge Runtime/,
      /process\.version/,
      /Cannot find module 'critters'/
    ]

    // Ensure critters is available for CSS optimization
    if (!isServer) {
      config.externals = config.externals || []
      config.externals.push('critters')
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)