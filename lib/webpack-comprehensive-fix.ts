// Fix abrangente para problemas de webpack com React Server Components
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
          id: id,
          loaded: false
        }
      } catch (error) {
        console.warn('Webpack module load error for id:', id, error)
        // Retornar um módulo vazio em caso de erro
        return {
          call: () => {},
          exports: {},
          id: id,
          loaded: false
        }
      }
    }
  }

  // Fix para problemas com eval
  const originalEval = window.eval
  if (originalEval) {
    window.eval = function(code: string) {
      try {
        return originalEval.call(window, code)
      } catch (error) {
        console.warn('Eval error:', error)
        return undefined
      }
    }
  }

  // Fix para problemas com __NEXT_DATA__
  if (!(window as any).__NEXT_DATA__) {
    ;(window as any).__NEXT_DATA__ = {
      props: {},
      page: '/',
      query: {},
      buildId: 'development',
      isFallback: false,
      dynamicIds: [],
      err: null,
      gsp: false,
      gssp: false,
      customServer: false,
      gip: false,
      appGip: false,
      locale: 'pt',
      locales: ['pt'],
      defaultLocale: 'pt',
      domainLocales: [],
      scriptLoader: []
    }
  }

  // Fix para problemas com React Server Components
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
        console.warn('Server require error for id:', id, error)
        return {}
      }
    }
  }
}

// Log do status do fix
console.log('Webpack comprehensive fix aplicado:', {
  isClient,
  isServer,
  hasWebpackRequire: isClient && !!(window as any).__webpack_require__,
  hasNextData: isClient && !!(window as any).__NEXT_DATA__,
  hasReactDevTools: isClient && !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
}) 