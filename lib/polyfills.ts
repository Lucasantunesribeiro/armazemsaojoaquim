// Polyfills para compatibilidade com Supabase no Next.js
// DEVE ser importado ANTES de qualquer outro código

// Fix para 'globalThis is not defined'
if (typeof globalThis === 'undefined') {
  if (typeof global !== 'undefined') {
    ;(global as any).globalThis = global
  } else if (typeof window !== 'undefined') {
    ;(window as any).globalThis = window
  } else if (typeof self !== 'undefined') {
    ;(self as any).globalThis = self
  } else {
    // Fallback para ambientes muito restritivos
    ;(this as any).globalThis = this
  }
}

// Fix para 'self is not defined' - CRÍTICO para Supabase
if (typeof self === 'undefined') {
  if (typeof global !== 'undefined') {
    ;(global as any).self = global
  } else if (typeof window !== 'undefined') {
    ;(global as any).self = window
  } else {
    // Criar um objeto self mínimo
    ;(global as any).self = {
      location: { href: '' },
      navigator: { userAgent: 'Node.js' },
      document: { title: '' },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      setTimeout: (global as any).setTimeout || (() => {}),
      clearTimeout: (global as any).clearTimeout || (() => {}),
      setInterval: (global as any).setInterval || (() => {}),
      clearInterval: (global as any).clearInterval || (() => {})
    }
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

// Garantir que o polyfill foi aplicado
console.log('Polyfills aplicados:', {
  globalThis: typeof globalThis !== 'undefined',
  self: typeof self !== 'undefined',
  global: typeof global !== 'undefined',
  window: typeof window !== 'undefined'
})

export {} 