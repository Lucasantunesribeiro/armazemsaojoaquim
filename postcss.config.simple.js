// Configuração PostCSS Simplificada para Deploy
// Use este arquivo se houver problemas com plugins
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { 
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          normalizeUrl: false,
          mergeLonghand: false,
          mergeRules: false,
          minifySelectors: false,
          discardDuplicates: true,
          discardEmpty: true,
        }]
      } 
    } : {}),
  },
} 