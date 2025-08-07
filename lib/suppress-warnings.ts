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

if (typeof window !== 'undefined') {
  // Salvar referências originais
  const originalWarn = console.warn
  const originalError = console.error
  const originalLog = console.log

  // Lista de avisos específicos para filtrar
  const suppressWarnings = [
    // Grammarly warnings
    'Warning: Extra attributes from the server:',
    'data-new-gr-c-s-check-loaded',
    'data-gr-ext-installed',
    'data-gramm',
    'grammarly',
    
    // Next.js hydration warnings conhecidos
    'Warning: Text content did not match',
    'Warning: Expected server HTML to contain',
    'Warning: Did not expect server HTML to contain',
    
    // Avisos de desenvolvimento específicos que são seguros ignorar
    'Download the React DevTools',
    'Warning: ReactDOM.render is no longer supported',
    
    // Avisos de autofill dos navegadores
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://',
    
    // Avisos específicos de extensões
    'content script',
    'Content Security Policy',
    
    // Avisos de preload que não são críticos
    'was preloaded using link preload but not used within a few seconds',
    
    // Outros avisos comuns de produção
    'Warning: componentWillMount',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillUpdate'
  ]

  // Lista de avisos importantes que DEVEM ser mostrados
  const importantWarnings = [
    // Erros de acessibilidade
    'aria-',
    'role',
    'accessibility',
    
    // Problemas de performance críticos
    'memory leak',
    'performance',
    'blocking',
    
    // Erros de rede críticos
    'failed to fetch',
    'network error',
    'cors',
    
    // Problemas de segurança
    'security',
    'unsafe',
    'vulnerability'
  ]

  const shouldSuppressWarning = (message: string): boolean => {
    const messageStr = String(message).toLowerCase()
    
    // Verificar se é um aviso importante que deve ser mostrado
    const isImportant = importantWarnings.some(warning => 
      messageStr.includes(warning.toLowerCase())
    )
    
    if (isImportant) {
      return false // Não suprimir avisos importantes
    }
    
    // Verificar se deve ser suprimido
    return suppressWarnings.some(warning => 
      messageStr.includes(warning.toLowerCase())
    )
  }

  // Filtrar console.warn
  console.warn = (...args) => {
    const message = args.join(' ')
    
    if (!shouldSuppressWarning(message)) {
      originalWarn.apply(console, args)
    }
  }

  // Filtrar console.error apenas para avisos específicos, não erros reais
  console.error = (...args) => {
    const message = args.join(' ')
    
    // Apenas suprimir "erros" que na verdade são avisos
    if (message.includes('Warning:') && shouldSuppressWarning(message)) {
      return
    }
    
    // Manter todos os erros reais
    originalError.apply(console, args)
  }

  // Manter console.log inalterado para desenvolvimento
  console.log = originalLog

  // Adicionar handler para Promise rejections não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason)
    if (shouldSuppressWarning(message)) {
      event.preventDefault()
    }
  })

  // Adicionar listener para erros globais
  window.addEventListener('error', (event) => {
    const message = String(event.message || event.error)
    if (shouldSuppressWarning(message)) {
      event.preventDefault()
    }
  })
}

// Enhanced warning suppression system for the Armazém São Joaquim website
// This system filters out non-critical warnings while preserving important error information

interface WarningFilter {
  pattern: RegExp;
  description: string;
  shouldSuppress: boolean;
}

// Comprehensive warning filters
const warningFilters: WarningFilter[] = [
  // Grammarly extension warnings
  {
    pattern: /Grammarly/i,
    description: 'Grammarly extension warnings',
    shouldSuppress: true
  },
  // Image optimization warnings (already handled by Next.js)
  {
    pattern: /Image with src .* has.*fill.*but is missing.*sizes.*prop/i,
    description: 'Image sizes prop warnings - handled by specific image optimizations',
    shouldSuppress: true
  },
  // WebP image loading errors - provide fallback handling
  {
    pattern: /The requested resource isn't a valid image for .*\.webp/i,
    description: 'WebP image format errors - fallback to JPG handled',
    shouldSuppress: true
  },
  // Preload warnings for optimized images
  {
    pattern: /The resource.*was preloaded using link preload but not used/i,
    description: 'Image preload optimization warnings',
    shouldSuppress: true
  },
  // Fast Refresh warnings (development only)
  {
    pattern: /Fast Refresh had to perform a full reload/i,
    description: 'Development Fast Refresh warnings',
    shouldSuppress: true
  },
  // EmailJS client-side warnings
  {
    pattern: /EmailJS só pode ser inicializado no lado do cliente/i,
    description: 'EmailJS client-side initialization - expected behavior',
    shouldSuppress: true
  },
  // Supabase realtime dependency warnings (library-specific)
  {
    pattern: /Critical dependency.*realtime.*request of a dependency is an expression/i,
    description: 'Supabase realtime library warnings - library internal behavior',
    shouldSuppress: true
  },
  // Extension and third-party warnings
  {
    pattern: /(chrome-extension|moz-extension|extension\/)/i,
    description: 'Browser extension related warnings',
    shouldSuppress: true
  },
  // CORS preflight for fonts and resources
  {
    pattern: /Access to.*font.*from origin.*has been blocked by CORS/i,
    description: 'Font loading CORS warnings - fallbacks available',
    shouldSuppress: true
  }
]

// Important warnings that should NEVER be suppressed
const criticalPatterns = [
  /security|vulnerable|xss|csrf/i,
  /memory leak|performance|slow/i,
  /accessibility|a11y|aria/i,
  /hydration|mismatch/i,
  /404|500|error/i
]

// Enhanced filtering function
function shouldSuppressWarning(message: string): boolean {
  // Never suppress critical warnings
  if (criticalPatterns.some(pattern => pattern.test(message))) {
    return false
  }

  // Check against warning filters
  return warningFilters.some(filter => 
    filter.shouldSuppress && filter.pattern.test(message)
  )
}

// Enhanced console override for warnings
function createConsoleOverride() {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args: any[]) => {
    const message = args.join(' ')
    if (!shouldSuppressWarning(message)) {
      originalWarn.apply(console, args)
    }
  }

  console.error = (...args: any[]) => {
    const message = args.join(' ')
    
    // Não suprimir erros de OAuth vazios - podem indicar problemas de configuração
    if (message.includes('OAuth Error') && message.includes('{}')) {
      originalError.apply(console, args)
      return
    }
    
    // Não suprimir erros de autenticação importantes
    if (message.includes('Auth Error') || message.includes('Authentication failed')) {
      originalError.apply(console, args)
      return
    }
    
    // Be more selective with error suppression
    if (!shouldSuppressWarning(message) || message.includes('Network') || message.includes('Failed')) {
      originalError.apply(console, args)
    }
  }
}

// Enhanced error boundary for unhandled errors
function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason)
    
    // Suppress known non-critical rejections
    if (shouldSuppressWarning(message)) {
      event.preventDefault()
      return
    }

    // Log important rejections
    console.error('Unhandled promise rejection:', event.reason)
  })

  // Handle general errors
  window.addEventListener('error', (event) => {
    const message = event.message || ''
    
    // Suppress known non-critical errors
    if (shouldSuppressWarning(message)) {
      event.preventDefault()
      return
    }

    // Log important errors
    console.error('Global error:', event.error)
  })
}

// Initialize enhanced warning suppression
if (typeof window !== 'undefined') {
  createConsoleOverride()
  setupGlobalErrorHandling()
  
  // Development mode logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Enhanced warning suppression active for Armazém São Joaquim')
    console.log('📋 Filtering non-critical warnings while preserving important errors')
  }
}

export { shouldSuppressWarning, warningFilters } 