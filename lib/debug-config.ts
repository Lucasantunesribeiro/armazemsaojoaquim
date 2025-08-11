import React, { useRef, useEffect, useMemo, useCallback, DependencyList } from 'react'

/**
 * Configurações de debug para desenvolvimento
 * Ajuda a identificar problemas como o erro React #310
 */

export const DEBUG_CONFIG = {
  // Habilitar logs detalhados em desenvolvimento
  VERBOSE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Habilitar React StrictMode para detectar problemas
  REACT_STRICT_MODE: process.env.NODE_ENV === 'development',
  
  // Detectar problemas de performance
  PERFORMANCE_MONITORING: process.env.NODE_ENV === 'development',
  
  // Log de hooks problemáticos
  HOOK_DEBUGGING: process.env.NODE_ENV === 'development'
}

/**
 * Logger condicional para desenvolvimento
 */
export const debugLog = {
  error: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.VERBOSE_LOGGING) {
      console.error('🚨 [DEBUG] ' + message, ...args)
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.VERBOSE_LOGGING) {
      console.warn('⚠️ [DEBUG] ' + message, ...args)
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.VERBOSE_LOGGING) {
      console.log('ℹ️ [DEBUG] ' + message, ...args)
    }
  },
  
  hook: (hookName: string, dependencies: readonly any[], message?: string) => {
    if (DEBUG_CONFIG.HOOK_DEBUGGING) {
      console.log('🪝 [' + hookName + '] ' + (message || 'Dependencies:'), dependencies)
    }
  },
  
  performance: (operation: string, duration: number) => {
    if (DEBUG_CONFIG.PERFORMANCE_MONITORING) {
      const color = duration > 100 ? '🔴' : duration > 50 ? '🟡' : '🟢'
      console.log(color + ' [PERF] ' + operation + ': ' + duration + 'ms')
    }
  }
}

/**
 * Hook de debug para monitorar re-renders
 */
export function useDebugRender(componentName: string, props?: Record<string, any>) {
  const renderCount = useRef(0)
  const previousProps = useRef<Record<string, any>>()
  
  renderCount.current += 1
  
  useEffect(() => {
    if (!DEBUG_CONFIG.VERBOSE_LOGGING) return
    
    console.log('🔄 [' + componentName + '] Render #' + renderCount.current)
    
    if (props && previousProps.current) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== previousProps.current![key]
      )
      
      if (changedProps.length > 0) {
        console.log('   Props changed: ' + changedProps.join(', '))
      }
    }
    
    previousProps.current = props
  })
}

/**
 * Wrapper para hooks que podem causar problemas
 */
export function safeUseMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debugName?: string
): T {
  if (DEBUG_CONFIG.HOOK_DEBUGGING && debugName) {
    debugLog.hook('useMemo', deps, debugName)
  }
  
  return useMemo(factory, deps)
}

export function safeUseCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  debugName?: string
): T {
  if (DEBUG_CONFIG.HOOK_DEBUGGING && debugName) {
    debugLog.hook('useCallback', deps, debugName)
  }
  
  return useCallback(callback, deps)
}
