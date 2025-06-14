// Polyfills temporariamente desabilitados para debug
// require('./lib/polyfills-minimal.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração mínima para desenvolvimento
  reactStrictMode: false,
  
  // Não usar static export em desenvolvimento
  // output: 'export', // Comentado para permitir APIs
  
  // ESLint e TypeScript menos rigorosos
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração de imagens
  images: {
    unoptimized: true,
  },

  // Headers CORS para APIs
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // Configuração experimental
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // Webpack config para polyfills
  webpack: (config, { isServer }) => {
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
}

module.exports = nextConfig