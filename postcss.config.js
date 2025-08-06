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
          cssDeclarationSorter: false,
        }]
      } 
    } : {}),
  },
}