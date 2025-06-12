// Polyfills para compatibilidade com Supabase no Next.js
// DEVE ser importado ANTES de qualquer outro código

// Função para detectar ambiente de forma segura
function getEnvironment() {
  try {
    if (typeof window !== 'undefined') return 'browser'
    if (typeof global !== 'undefined') return 'server'
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

const environment = getEnvironment()
const isServer = environment === 'server'

// Fix para 'globalThis is not defined'
try {
  if (typeof globalThis === 'undefined') {
    if (typeof global !== 'undefined') {
      ;(global as any).globalThis = global
    } else if (typeof window !== 'undefined') {
      ;(window as any).globalThis = window
    }
  }
} catch (error) {
  // Ignorar erro silenciosamente
}

// Fix para 'self is not defined' - CRÍTICO para Supabase
// Só aplicar no servidor de forma segura
if (isServer) {
  try {
    if (typeof self === 'undefined' && typeof global !== 'undefined') {
      // Criar um objeto self mínimo apenas no servidor
      const mockSelf = {
        location: { href: '', hostname: 'localhost', pathname: '/', search: '' },
        navigator: { userAgent: 'Node.js' },
        document: { title: '' },
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
        setTimeout: (global as any).setTimeout || setTimeout,
        clearTimeout: (global as any).clearTimeout || clearTimeout,
        setInterval: (global as any).setInterval || setInterval,
        clearInterval: (global as any).clearInterval || clearInterval
      }
      ;(global as any).self = mockSelf
    }
  } catch (error) {
    // Ignorar erro silenciosamente durante o build
  }
}

// Fix para 'global is not defined' no browser
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  ;(window as any).global = window
}

// Fix para 'window is not defined' no servidor
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  ;(global as any).window = {
    location: { href: '', hostname: 'localhost', pathname: '/', search: '' },
    navigator: { userAgent: 'Node.js' },
    document: { title: '', referrer: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    setTimeout: (global as any).setTimeout || (() => {}),
    clearTimeout: (global as any).clearTimeout || (() => {}),
    setInterval: (global as any).setInterval || (() => {}),
    clearInterval: (global as any).clearInterval || (() => {}),
    innerWidth: 1920,
    innerHeight: 1080,
    gtag: () => {}
  }
}

// Fix para 'document is not defined' no servidor
if (typeof document === 'undefined' && typeof global !== 'undefined') {
  ;(global as any).document = {
    title: '',
    referrer: '',
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  }
}

// Fix para 'navigator is not defined' no servidor
if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
  ;(global as any).navigator = {
    userAgent: 'Node.js',
    language: 'pt-BR',
    languages: ['pt-BR', 'en-US']
  }
}

// Fix para 'location is not defined' no servidor
if (typeof location === 'undefined' && typeof global !== 'undefined') {
  ;(global as any).location = {
    href: '',
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3000'
  }
}

// Fix para localStorage/sessionStorage no servidor
if (typeof localStorage === 'undefined' && typeof global !== 'undefined') {
  const storage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  }
  ;(global as any).localStorage = storage
  ;(global as any).sessionStorage = storage
}

// Garantir que o polyfill foi aplicado (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  try {
    console.log('Polyfills aplicados:', {
      environment,
      globalThis: typeof globalThis !== 'undefined',
      self: typeof self !== 'undefined',
      global: typeof global !== 'undefined',
      window: typeof window !== 'undefined'
    })
  } catch {
    // Ignorar erro silenciosamente
  }
}

export {} 