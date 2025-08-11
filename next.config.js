/** @type {import('next').NextConfig} */

// Disable bundle analyzer for now to avoid potential issues
let withBundleAnalyzer = (config) => config

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
    // Temporarily disable optimizeCss to fix build issues
    // optimizeCss: true,
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
      'date-fns'
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

    // Add global polyfills to prevent 'self is not defined' errors
    const webpack = require('webpack')
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.DefinePlugin({
        'self': 'undefined',
        'typeof self': JSON.stringify('undefined'),
        'typeof window': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof document': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
      })
    )

    // Provide polyfills for server-side rendering
    if (isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          'self': 'undefined',
        })
      )
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

    // Remove the critters external configuration as it's causing issues
    // Critters should be handled by Next.js internally

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)