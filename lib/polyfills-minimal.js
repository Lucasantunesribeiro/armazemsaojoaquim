// Polyfill mínimo para resolver 'self is not defined' no Netlify/Next.js

// Aplicar apenas no ambiente servidor (Node.js)
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Fix para 'self is not defined'
  if (typeof self === 'undefined') {
    global.self = global
  }
  
  // Fix para 'globalThis is not defined'
  if (typeof globalThis === 'undefined') {
    global.globalThis = global
  }
  
  // Fix básico para APIs do browser que podem ser chamadas no servidor
  if (typeof document === 'undefined') {
    global.document = {
      addEventListener: () => {},
      removeEventListener: () => {},
      createElement: () => ({}),
      getElementById: () => null
    }
  }
  
  if (typeof navigator === 'undefined') {
    global.navigator = {
      userAgent: 'Node.js'
    }
  }
  
  if (typeof location === 'undefined') {
    global.location = {
      href: '',
      hostname: 'localhost',
      pathname: '/',
      search: ''
    }
  }
}

module.exports = {} 