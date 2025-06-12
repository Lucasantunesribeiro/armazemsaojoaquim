/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        'amarelo-armazem': '#F4C430',
        'madeira-escura': '#2D1810',
        'vermelho-portas': '#B22222',
        'cinza-claro': '#F8F9FA',
        'cinza-medio': '#4A5568',
        'pedra-natural': '#8B7355',
        'verde-natura': '#2F7D32',
        'rosa-suave': '#C2185B',
        'preto-suave': '#1A1A1A',
        'creme-suave': '#FDF6E3',
        
        // Semantic colors
        'background': 'var(--background)',
        'surface': 'var(--surface)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border': 'var(--border)',
      },
      fontFamily: {
        'playfair': ['var(--font-playfair)', 'Playfair Display', 'serif'],
        'inter': ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      minHeight: {
        '44': '2.75rem', // 44px - minimum touch target
        '48': '3rem',    // 48px - recommended touch target
      },
      minWidth: {
        '44': '2.75rem',
        '48': '3rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      aspectRatio: {
        'video': '16 / 9',
        'square': '1 / 1',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      content: {
        'empty': '""',
      },
    },
  },
  plugins: [
    // Custom utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: `linear-gradient(135deg, ${theme('colors.amarelo-armazem')} 0%, ${theme('colors.vermelho-portas')} 100%)`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.gpu-accelerated': {
          transform: 'translateZ(0)',
          'will-change': 'transform',
        },
        '.content-visibility-auto': {
          'content-visibility': 'auto',
        },
        '.touch-target': {
          'min-height': theme('minHeight.44'),
          'min-width': theme('minWidth.44'),
        },
        '.touch-target-lg': {
          'min-height': theme('minHeight.48'),
          'min-width': theme('minWidth.48'),
        },
        '.scroll-smooth': {
          'scroll-behavior': 'smooth',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.focus-ring': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.amarelo-armazem')}`,
            'outline-offset': '2px',
            'border-radius': theme('borderRadius.DEFAULT'),
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'focus'])
    },
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
}
