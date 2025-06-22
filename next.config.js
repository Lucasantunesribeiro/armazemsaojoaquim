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
    unoptimized: process.env.NODE_ENV === 'development',
    loader: 'default',
    domains: [],
    // Configurações mais específicas para evitar erro 400
    remotePatterns: [
      // Para desenvolvimento local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Para Netlify e outros domínios confiáveis
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