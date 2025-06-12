/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Otimizações de imagem
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
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
  
  // Headers de segurança e performance
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
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
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
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
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
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/:path*\\.(ico|png|jpg|jpeg|gif|webp|avif|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      }
    ]
  },

  // Webpack otimizações
  webpack: (config, { dev, isServer }) => {
    // Fix para Supabase no build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Fix para 'self is not defined' no Supabase
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }

    // Adicionar polyfill para self
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@supabase/supabase-js': '@supabase/supabase-js'
      })
    }

    // Otimizações de produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
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

    // Configurar SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Resolver problemas com módulos CSS inexistentes
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'swiper/css': false,
      'swiper/components/core/core.min.css': false,
    }

    // Otimizar bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }

    // Configuração para resolver problemas de SSR
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'self': false,
        'window': false,
        'document': false,
        'navigator': false,
        'location': false,
        'localStorage': false,
        'sessionStorage': false,
        'swiper/css': false,
        'swiper/components/core/core.min.css': false,
      }
    }

    // Garantir que polyfills sejam carregados primeiro
    const originalEntry = config.entry
    config.entry = async () => {
      const entries = await originalEntry()
      
      if (entries['main.js'] && !entries['main.js'].includes('./lib/polyfills.ts')) {
        entries['main.js'].unshift('./lib/polyfills.ts')
      }
      
      return entries
    }

    // Definir self globalmente para resolver o erro
    config.plugins = config.plugins || []
    
    if (isServer) {
      // Adicionar plugin para definir self no servidor
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'global',
          'window': 'global',
          'document': '{}',
          'navigator': '{ userAgent: "Node.js" }',
          'location': '{ href: "", hostname: "localhost" }'
        })
      )
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'self': false,
        'window': false,
        'document': false,
        'navigator': false,
        'location': false,
        'localStorage': false,
        'sessionStorage': false,
        'swiper/css': false,
        'swiper/components/core/core.min.css': false,
      }
    }

    // Adicionar alias para resolver imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }

    return config
  },

  // Validação de variáveis de ambiente
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Configurações de runtime
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Configurações de redirect
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configurações de output
  trailingSlash: false,
  
  // Configurações de bundle analyzer (apenas em desenvolvimento)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      ...nextConfig.experimental,
      bundlePagesRouterDependencies: true,
    },
  }),
}

// Validar variáveis de ambiente obrigatórias (apenas em produção)
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Missing environment variable: ${envVar}`)
    }
  }
}

module.exports = nextConfig