/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to allow API routes
  // output: 'export', // Commented out to enable API routes
  
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
    // unoptimized: true, // Only needed for static export
  },

  // Remove trailing slash as it's only needed for static export
  // trailingSlash: true,
  
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

  // Webpack configuration to handle Supabase dependencies
  webpack: (config, { isServer }) => {
    // Handle Supabase dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Mark problematic packages as external for server builds
    if (isServer) {
      config.externals = [...(config.externals || []), 'resend']
    }

    return config
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
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