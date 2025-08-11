// Otimizado para produção - Correção erro 500 Netlify
'use client'

export const suppressGrammarlyWarnings = () => {
  // Apenas em desenvolvimento e no browser
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return
  }
  
  const suppressedPatterns = [
    'data-new-gr-c-s-check-loaded',
    'data-gr-ext-installed',
    'Extra attributes from the server'
  ]
  
  try {
    const originalWarn = console.warn
    console.warn = (...args) => {
      const message = args.join(' ')
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.includes(pattern)
      )
      
      if (!shouldSuppress) {
        originalWarn.apply(console, args)
      }
    }
  } catch {
    // Silenciar erros em produção
  }
}

// Auto-executar apenas em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  suppressGrammarlyWarnings()
}

export { suppressGrammarlyWarnings as default } 