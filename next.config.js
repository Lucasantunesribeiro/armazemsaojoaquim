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

  // Configure serverless functions for better Edge Runtime compatibility
  serverExternalPackages: ['@supabase/supabase-js'],

  // Configure output for Netlify deployment
  output: 'standalone',

  // Configurações experimentais para performance e Edge Runtime
  experimental: {
    // Re-enable CSS optimization now that build is stable
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
      'date-fns'
    ],
  },

  // Configurações de compiler para performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de webpack para otimização
  webpack: (config, { isServer, dev }) => {
    // Basic alias configuration
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/components': './components',
      '@/lib': './lib',
      '@/types': './types',
      '@/hooks': './hooks',
      '@/app': './app'
    }

    // Basic fallback configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Suppress warnings
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
      /A Node\.js API is used \(process\.version at line: \d+\) which is not supported in the Edge Runtime/,
      /process\.version/,
      /self is not defined/,
      /window is not defined/,
      /document is not defined/
    ]

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)