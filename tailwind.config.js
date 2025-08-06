/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    // Enhanced responsive breakpoints with orientation and device-specific breakpoints
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      // Mobile specific breakpoints
      'mobile': {'max': '639px'},
      'tablet': {'min': '640px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
      // Orientation breakpoints
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      // High-resolution displays
      'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
      // Touch capability
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      // Height-based breakpoints for mobile optimization
      'h-sm': {'raw': '(max-height: 667px)'},
      'h-md': {'raw': '(min-height: 668px) and (max-height: 812px)'},
      'h-lg': {'raw': '(min-height: 813px)'},
      // Device specific breakpoints
      'iphone-se': {'raw': '(max-width: 375px) and (max-height: 667px)'},
      'iphone': {'raw': '(min-width: 375px) and (max-width: 414px)'},
      'ipad': {'raw': '(min-width: 768px) and (max-width: 1024px)'},
      'fold': {'raw': '(max-width: 280px)'},
    },
    extend: {
      colors: {
        // Custom brand colors
        'amarelo-armazem': '#F4C430',
        'madeira-escura': '#2D1810',
        'vermelho-portas': '#B22222',
        'cinza-claro': '#F8F9FA',
        'cinza-medio': '#4A5568',
        'cinza-escuro': '#2D3748',
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
        // Enhanced responsive typography with clamp for better fluid scaling
        'responsive-xs': ['clamp(0.7rem, 1.2vw + 0.5rem, 0.75rem)', { lineHeight: '1.2' }],
        'responsive-sm': ['clamp(0.8rem, 1.5vw + 0.6rem, 0.875rem)', { lineHeight: '1.3' }],
        'responsive-base': ['clamp(0.9rem, 2vw + 0.7rem, 1rem)', { lineHeight: '1.5' }],
        'responsive-lg': ['clamp(1rem, 2.5vw + 0.8rem, 1.125rem)', { lineHeight: '1.6' }],
        'responsive-xl': ['clamp(1.125rem, 3vw + 0.9rem, 1.25rem)', { lineHeight: '1.7' }],
        'responsive-2xl': ['clamp(1.25rem, 3.5vw + 1rem, 1.5rem)', { lineHeight: '1.4' }],
        'responsive-3xl': ['clamp(1.5rem, 4vw + 1.2rem, 1.875rem)', { lineHeight: '1.3' }],
        'responsive-4xl': ['clamp(1.875rem, 5vw + 1.5rem, 2.25rem)', { lineHeight: '1.2' }],
        'responsive-5xl': ['clamp(2.25rem, 6vw + 1.8rem, 3rem)', { lineHeight: '1.1' }],
        'responsive-6xl': ['clamp(2.75rem, 7vw + 2.2rem, 3.75rem)', { lineHeight: '1.05' }],
        'responsive-7xl': ['clamp(3.25rem, 8vw + 2.8rem, 4.5rem)', { lineHeight: '1' }],
        // Mobile specific optimized sizes
        'mobile-xs': ['0.7rem', { lineHeight: '1.1' }],
        'mobile-sm': ['0.8rem', { lineHeight: '1.2' }],
        'mobile-base': ['0.9rem', { lineHeight: '1.4' }],
        'mobile-lg': ['1rem', { lineHeight: '1.5' }],
        'mobile-xl': ['1.1rem', { lineHeight: '1.6' }],
        'mobile-2xl': ['1.3rem', { lineHeight: '1.4' }],
        'mobile-3xl': ['1.6rem', { lineHeight: '1.3' }],
        // Fluid typography with optimized viewport scaling
        'fluid-xs': ['clamp(0.7rem, 1vw + 0.5rem, 0.75rem)', { lineHeight: '1.2' }],
        'fluid-sm': ['clamp(0.8rem, 1.5vw + 0.6rem, 0.875rem)', { lineHeight: '1.3' }],
        'fluid-base': ['clamp(0.9rem, 2vw + 0.7rem, 1rem)', { lineHeight: '1.5' }],
        'fluid-lg': ['clamp(1rem, 2.5vw + 0.8rem, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-xl': ['clamp(1.1rem, 3vw + 0.9rem, 1.25rem)', { lineHeight: '1.7' }],
        'fluid-2xl': ['clamp(1.3rem, 4vw + 1rem, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-3xl': ['clamp(1.6rem, 5vw + 1.2rem, 1.875rem)', { lineHeight: '1.3' }],
        'fluid-4xl': ['clamp(2rem, 6vw + 1.5rem, 2.25rem)', { lineHeight: '1.2' }],
        'fluid-5xl': ['clamp(2.5rem, 7vw + 1.8rem, 3rem)', { lineHeight: '1.1' }],
        'fluid-6xl': ['clamp(3rem, 8vw + 2.2rem, 3.75rem)', { lineHeight: '1.05' }],
        'fluid-7xl': ['clamp(3.5rem, 9vw + 2.5rem, 4.5rem)', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Safe area spacing for mobile devices with notches/dynamic islands
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // Enhanced mobile friendly spacing with fluid scaling
        'mobile-xs': '0.375rem',  // 6px
        'mobile-sm': '0.625rem',  // 10px
        'mobile-md': '0.875rem',  // 14px
        'mobile-lg': '1.125rem',  // 18px
        'mobile-xl': '1.375rem',  // 22px
        'mobile-2xl': '2.25rem',  // 36px
        'mobile-3xl': '3.5rem',   // 56px
        // Fluid spacing with viewport awareness
        'fluid-xs': 'clamp(0.25rem, 1vw + 0.125rem, 0.5rem)',
        'fluid-sm': 'clamp(0.5rem, 2vw + 0.25rem, 0.75rem)',
        'fluid-md': 'clamp(0.75rem, 2.5vw + 0.375rem, 1rem)',
        'fluid-lg': 'clamp(1rem, 3vw + 0.5rem, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 4vw + 0.75rem, 2rem)',
        'fluid-2xl': 'clamp(2rem, 5vw + 1rem, 3rem)',
        'fluid-3xl': 'clamp(3rem, 6vw + 1.5rem, 4rem)',
        'fluid-4xl': 'clamp(4rem, 8vw + 2rem, 6rem)',
        // Touch targets optimized for different device types
        'touch-sm': '2.75rem',    // 44px - minimum recommended
        'touch-md': '3rem',       // 48px - comfortable
        'touch-lg': '3.5rem',     // 56px - large
        'touch-xl': '4rem',       // 64px - extra large
        // Section spacing responsive
        'section-xs': 'clamp(2rem, 8vw, 4rem)',
        'section-sm': 'clamp(3rem, 10vw, 6rem)',
        'section-md': 'clamp(4rem, 12vw, 8rem)',
        'section-lg': 'clamp(6rem, 15vw, 12rem)',
      },
      minHeight: {
        '44': '2.75rem', // 44px - minimum touch target
        '48': '3rem',    // 48px - recommended touch target
        '56': '3.5rem',  // 56px - comfortable touch target
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'mobile-screen': 'calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'hero-mobile': 'calc(100vh - 70px)', // considering mobile header
        'hero-desktop': 'calc(100vh - 80px)', // considering desktop header
        'hero-responsive': 'clamp(500px, 100vh, 900px)', // fluid hero height
      },
      minWidth: {
        '44': '2.75rem',
        '48': '3rem',
        '56': '3.5rem',
        'touch': '2.75rem', // minimum touch target
        'mobile-button': '120px', // minimum mobile button width
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        // Enhanced container responsive sizes with viewport units
        'container-xs': 'min(90vw, 480px)',
        'container-sm': 'min(92vw, 640px)',
        'container-md': 'min(94vw, 768px)',
        'container-lg': 'min(95vw, 1024px)',
        'container-xl': 'min(96vw, 1280px)',
        'container-2xl': 'min(98vw, 1536px)',
        'container-3xl': 'min(98vw, 1600px)',
        // Mobile specific max widths
        'mobile-full': '100%',
        'mobile-container': '100vw',
        'mobile-readable': '65ch', // optimal reading width
        // Content specific widths
        'prose-narrow': '60ch',
        'prose-wide': '75ch',
        'prose-responsive': 'clamp(45ch, 75vw, 75ch)',
      },
      aspectRatio: {
        'video': '16 / 9',
        'square': '1 / 1',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '5/4': '5 / 4',
        '3/4': '3 / 4',
        '9/16': '9 / 16',
        '21/9': '21 / 9',
        // Mobile-friendly ratios
        'mobile-card': '4 / 3',
        'mobile-hero': '16 / 10',
        'mobile-banner': '3 / 1',
        'mobile-portrait': '3 / 4',
        'hero-responsive': '16 / 9',
        'hero-mobile': '4 / 3',
        'card-mobile': '5 / 4',
        'banner-desktop': '21 / 9',
        'banner-mobile': '16 / 9',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        // Mobile-optimized animations
        'mobile-slide-up': 'mobileSlideUp 0.4s ease-out',
        'mobile-fade-in': 'mobileFadeIn 0.3s ease-in-out',
        'mobile-scale': 'mobileScale 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Mobile-specific animations
        mobileSlideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        mobileFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        mobileScale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'mobile': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'mobile-xl': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 20px rgba(244, 196, 48, 0.4)',
        'glow-lg': '0 0 40px rgba(244, 196, 48, 0.3)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(244, 196, 48, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'ease-in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
        'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      // Container queries support (when available)
      containers: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    // Enhanced responsive utilities plugin
    function({ addUtilities, theme, addComponents }) {
      // Touch-friendly utilities
      addUtilities({
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-none': {
          'touch-action': 'none',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        '.touch-pinch-zoom': {
          'touch-action': 'pinch-zoom',
        },
      })

      // Safe area utilities
      addUtilities({
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-all': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
      })

      // Mobile-specific utilities
      addUtilities({
        '.mobile-scroll': {
          '-webkit-overflow-scrolling': 'touch',
          'overscroll-behavior': 'contain',
        },
        '.mobile-tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.mobile-user-select-none': {
          '-webkit-user-select': 'none',
          '-moz-user-select': 'none',
          'user-select': 'none',
        },
        '.mobile-font-smooth': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
      })

      // Responsive text utilities using clamp
      const responsiveTextUtilities = {
        '.text-responsive-xs': { 'font-size': 'clamp(0.7rem, 1.2vw + 0.5rem, 0.75rem)' },
        '.text-responsive-sm': { 'font-size': 'clamp(0.8rem, 1.5vw + 0.6rem, 0.875rem)' },
        '.text-responsive-base': { 'font-size': 'clamp(0.9rem, 2vw + 0.7rem, 1rem)' },
        '.text-responsive-lg': { 'font-size': 'clamp(1rem, 2.5vw + 0.8rem, 1.125rem)' },
        '.text-responsive-xl': { 'font-size': 'clamp(1.125rem, 3vw + 0.9rem, 1.25rem)' },
        '.text-responsive-2xl': { 'font-size': 'clamp(1.25rem, 3.5vw + 1rem, 1.5rem)' },
        '.text-responsive-3xl': { 'font-size': 'clamp(1.5rem, 4vw + 1.2rem, 1.875rem)' },
        '.text-responsive-4xl': { 'font-size': 'clamp(1.875rem, 5vw + 1.5rem, 2.25rem)' },
        '.text-responsive-5xl': { 'font-size': 'clamp(2.25rem, 6vw + 1.8rem, 3rem)' },
        '.text-responsive-6xl': { 'font-size': 'clamp(2.75rem, 7vw + 2.2rem, 3.75rem)' },
        '.text-responsive-7xl': { 'font-size': 'clamp(3.25rem, 8vw + 2.8rem, 4.5rem)' },
      }
      addUtilities(responsiveTextUtilities)

      // Enhanced focus ring for accessibility
      addUtilities({
        '.focus-ring': {
          '&:focus': {
            'outline': '2px solid #F4C430',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 3px rgba(244, 196, 48, 0.1)',
          },
          '&:focus:not(:focus-visible)': {
            'outline': 'none',
            'box-shadow': 'none',
          },
        },
      })

      // GPU acceleration utilities
      addUtilities({
        '.gpu': {
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          'perspective': '1000px',
        },
        '.gpu-hover': {
          'will-change': 'transform',
          '&:hover': {
            'transform': 'translateZ(0)',
          },
        },
      })

      // Image optimization utilities
      addUtilities({
        '.img-crisp': {
          'image-rendering': 'crisp-edges',
          'image-rendering': '-webkit-optimize-contrast',
        },
        '.img-smooth': {
          'image-rendering': 'auto',
          'image-rendering': 'smooth',
        },
      })

      // Enhanced container components
      addComponents({
        '.container-responsive': {
          'width': '100%',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'max-width': '640px',
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@screen md': {
            'max-width': '768px',
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
          '@screen lg': {
            'max-width': '1024px',
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
          '@screen xl': {
            'max-width': '1280px',
            'padding-left': '2.5rem',
            'padding-right': '2.5rem',
          },
          '@screen 2xl': {
            'max-width': '1536px',
            'padding-left': '3rem',
            'padding-right': '3rem',
          },
        },
      })
    },
  ],
}
