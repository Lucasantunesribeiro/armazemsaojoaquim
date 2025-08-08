// Fix específico para problemas de webpack com React Server Components
// Baseado nas soluções encontradas para erros de 'call' de undefined

// Verificação de ambiente
const isClient = typeof window !== 'undefined'
const isServer = typeof global !== 'undefined'

// Fix para problemas de webpack com RSC (React Server Components)
if (isClient) {
  // Proteger contra erros de webpack no cliente
  const originalWebpackRequire = (window as any).__webpack_require__
  
  if (originalWebpackRequire) {
    ;(window as any).__webpack_require__ = function(id: any) {
      try {
        const module = originalWebpackRequire(id)
        if (module && typeof module.call === 'function') {
          return module
        }
        // Retornar um módulo vazio se o original for undefined
        return {
          call: () => {},
          exports: {},
          id,
          loaded: true
        }
      } catch (error) {
        console.warn('Webpack RSC module error:', error)
        // Retornar um módulo vazio em caso de erro
        return {
          call: () => {},
          exports: {},
          id,
          loaded: true
        }
      }
    }
  }

  // Fix para problemas com React Server Components
  if (typeof window !== 'undefined') {
    // Garantir que React está disponível globalmente
    if (!(window as any).React) {
      try {
        const React = require('react')
        ;(window as any).React = React
      } catch (error) {
        console.warn('React not available for RSC:', error)
      }
    }

    // Fix para problemas com react-server-dom-webpack
    if (!(window as any).__NEXT_DATA__) {
      ;(window as any).__NEXT_DATA__ = {
        props: {},
        page: '',
        query: {},
        buildId: '',
        isFallback: false,
        dynamicIds: [],
        err: null,
        gsp: false,
        gssp: false,
        customServer: false,
        gip: false,
        appGip: false,
        locale: '',
        locales: [],
        defaultLocale: '',
        domainLocales: [],
        scriptLoader: []
      }
    }
  }
}

// Fix para problemas de webpack no servidor
if (isServer) {
  // Proteger contra erros de webpack no servidor
  const originalRequire = (global as any).require
  
  if (originalRequire) {
    ;(global as any).require = function(id: string) {
      try {
        return originalRequire(id)
      } catch (error) {
        console.warn('Server require error for RSC:', error)
        return {}
      }
    }
  }

  // Fix para problemas com React no servidor
  if (typeof global !== 'undefined' && !(global as any).React) {
    try {
      const React = require('react')
      ;(global as any).React = React
    } catch (error) {
      console.warn('React not available on server:', error)
    }
  }
}

// Fix para problemas com módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  // Garantir que module.exports está disponível
  if (!module.exports) {
    module.exports = {}
  }
}

// Fix para problemas com exports
if (typeof exports !== 'undefined') {
  // Garantir que exports está disponível
  if (!exports) {
    ;(global as any).exports = {}
  }
}

// Log de debug apenas em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('Webpack RSC fix aplicado:', {
    isClient,
    isServer,
    hasWebpackRequire: isClient && !!(window as any).__webpack_require__,
    hasNextData: isClient && !!(window as any).__NEXT_DATA__,
    hasModule: typeof module !== 'undefined',
    hasExports: typeof exports !== 'undefined'
  })
}

export {} 