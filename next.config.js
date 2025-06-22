/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configurações de imagem otimizadas
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configurações para desenvolvimento local e produção
    unoptimized: false,
    // Configurações para Supabase Storage e outros domínios
    remotePatterns: [
      // Para desenvolvimento local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Para Netlify
      {
        protocol: 'https',
        hostname: '**.netlify.app',
        pathname: '/**',
      },
      // Para Vercel (caso necessário)
      {
        protocol: 'https',
        hostname: '**.vercel.app',
        pathname: '/**',
      },
      // Para Supabase Storage - IMPORTANTE!
      {
        protocol: 'https',
        hostname: 'enolssforaepnrpfrima.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Para Supabase Storage - Render API (transformações)
      {
        protocol: 'https',
        hostname: 'enolssforaepnrpfrima.supabase.co',
        pathname: '/storage/v1/render/image/public/**',
      },
      // Para outros subdomínios do Supabase (caso necessário)
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Configurações experimentais
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },

  // Configurações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Configurações de webpack
  webpack: (config, { dev, isServer }) => {
    // Configuração para SVGs
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Configurações de build
  reactStrictMode: true,
  swcMinify: true,

  // Configurações para Netlify
  trailingSlash: false,
}

module.exports = nextConfig