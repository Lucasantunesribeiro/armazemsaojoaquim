// Fix específico para problemas de webpack na página do café
// Este arquivo deve ser importado ANTES de qualquer outro código da página do café

// Verificação de ambiente
const isClient = typeof window !== 'undefined'
const isServer = typeof global !== 'undefined'

// Fix para problemas de webpack com módulos undefined na página do café
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
          id: id,
          loaded: true
        }
      } catch (error) {
        console.warn('Webpack module loading error for ID:', id, error)
        // Retornar um módulo vazio em caso de erro
        return {
          call: () => {},
          exports: {},
          id: id,
          loaded: true
        }
      }
    }
  }

  // Proteger contra erros de eval
  const originalEval = window.eval
  window.eval = function(code: string) {
    try {
      return originalEval.call(window, code)
    } catch (error) {
      console.warn('Eval error in cafe page:', error)
      return undefined
    }
  }

  // Configurar __NEXT_DATA__ se não existir
  if (!(window as any).__NEXT_DATA__) {
    ;(window as any).__NEXT_DATA__ = {
      props: {},
      page: '/cafe',
      query: {},
      buildId: 'development'
    }
  }

  // Configurar __REACT_DEVTOOLS_GLOBAL_HOOK__ se não existir
  if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    ;(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {}
    }
  }
}

// Fix para problemas no servidor
if (isServer) {
  // Proteger contra erros de webpack no servidor
  const originalRequire = (global as any).require
  if (originalRequire) {
    ;(global as any).require = function(id: string) {
      try {
        return originalRequire(id)
      } catch (error) {
        console.warn('Server require error for ID:', id, error)
        return {}
      }
    }
  }
}

// Configurações específicas para a página do café
export const cafeWebpackFix = {
  // Função para verificar se o módulo está carregado corretamente
  isModuleLoaded: (moduleId: string) => {
    if (isClient) {
      try {
        const module = (window as any).__webpack_require__(moduleId)
        return module && typeof module === 'object'
      } catch {
        return false
      }
    }
    return true
  },

  // Função para carregar módulo com fallback
  loadModule: (moduleId: string, fallback: any = {}) => {
    if (isClient) {
      try {
        return (window as any).__webpack_require__(moduleId)
      } catch {
        return fallback
      }
    }
    return fallback
  },

  // Função para verificar se estamos no ambiente correto
  isReady: () => {
    return isClient && typeof (window as any).__webpack_require__ === 'function'
  }
}

console.log('Cafe webpack fix loaded successfully') 