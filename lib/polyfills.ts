// Polyfills para compatibilidade com Supabase no Next.js

// Fix para 'self is not defined'
if (typeof self === 'undefined') {
  ;(global as any).self = global
}

// Fix para 'global is not defined' no browser
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  ;(window as any).global = window
}

export {} 