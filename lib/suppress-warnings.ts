// Utilitário para suprimir warnings específicos do Grammarly e outras extensões
'use client'

export const suppressGrammarlyWarnings = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Lista de warnings para suprimir (específicos do Grammarly)
    const suppressedPatterns = [
      'Warning: Extra attributes from the server: data-new-gr-c-s-check-loaded,data-gr-ext-installed',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-gr-c-s-loaded',
      'Extra attributes from the server',
      'Grammarly',
    ]
    
    // Interceptar console.warn para filtrar warnings do Grammarly
    const originalWarn = console.warn
    console.warn = (...args) => {
      const message = args.join(' ')
      
      // Verificar se o warning deve ser suprimido
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.includes(pattern)
      )
      
      // Só mostrar o warning se não estiver na lista de supressão
      if (!shouldSuppress) {
        originalWarn.apply(console, args)
      }
    }

    // Interceptar console.error para filtrar erros do Grammarly
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      
      // Verificar se o erro deve ser suprimido
      const shouldSuppress = suppressedPatterns.some(pattern => 
        message.includes(pattern)
      )
      
      // Só mostrar o erro se não estiver na lista de supressão
      if (!shouldSuppress) {
        originalError.apply(console, args)
      }
    }

    console.info('🛡️ Console warnings suppressão ativa para extensões de navegador')
  }
}

// Função para restaurar console.warn original
export const restoreConsoleWarn = () => {
  if (typeof window !== 'undefined') {
    // Esta função pode ser chamada se necessário restaurar o comportamento original
    // Por enquanto, deixamos vazia pois o console.warn será restaurado automaticamente
    // quando a página for recarregada
  }
}

// Auto-executar em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  suppressGrammarlyWarnings()
} 