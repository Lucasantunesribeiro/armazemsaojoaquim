/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Netlify
  output: 'export',
  
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://armazemsaojoaquim.netlify.app',
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  // Image optimization for production
  images: {
    domains: [
      'localhost',
      'armazemsaojoaquim.netlify.app',
      'armazemsaojoaquim.com.br',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    unoptimized: true, // Required for static export
  },

  // Trailing slash for static export
  trailingSlash: true,
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during builds for faster performance
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript check optimization
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Headers para performance e segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
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
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig