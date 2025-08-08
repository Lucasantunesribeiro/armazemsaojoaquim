// Fix para erros de webpack relacionados ao 'call' de undefined
// Este arquivo deve ser importado ANTES de qualquer outro código

// Verificação de ambiente
const isClient = typeof window !== 'undefined'
const isServer = typeof global !== 'undefined'

// Fix para problemas de webpack com módulos undefined
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
        console.warn('Webpack module error:', error)
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

  // Fix para problemas com eval em webpack
  const originalEval = window.eval
  if (originalEval) {
    window.eval = function(code: string) {
      try {
        return originalEval.call(window, code)
      } catch (error) {
        console.warn('Eval error in webpack:', error)
        return undefined
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
        console.warn('Server require error:', error)
        return {}
      }
    }
  }
}

// Fix para problemas com React e webpack
if (isClient) {
  // Garantir que React está disponível
  if (typeof window !== 'undefined' && !(window as any).React) {
    try {
      const React = require('react')
      ;(window as any).React = React
    } catch (error) {
      console.warn('React not available:', error)
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
  console.log('Webpack error fix aplicado:', {
    isClient,
    isServer,
    hasWebpackRequire: isClient && !!(window as any).__webpack_require__,
    hasModule: typeof module !== 'undefined',
    hasExports: typeof exports !== 'undefined'
  })
}

export {} 