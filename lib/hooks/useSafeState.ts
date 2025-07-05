import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Hook para gerenciar estado de forma segura, evitando updates em componentes desmontados
 * Previne o erro "Can't perform a React state update on an unmounted component"
 */
export function useSafeState<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const setSafeState = useCallback((value: T | ((prevState: T) => T)) => {
    if (mountedRef.current) {
      setState(value)
    }
  }, [])

  return [state, setSafeState] as const
}

/**
 * Hook para executar callbacks de forma segura apenas se o componente estiver montado
 */
export function useSafeCallback<T extends (...args: any[]) => any>(callback: T): T {
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const safeCallback = useCallback((...args: Parameters<T>) => {
    if (mountedRef.current) {
      return callback(...args)
    }
  }, [callback]) as T

  return safeCallback
}

/**
 * Hook para verificar se o componente está montado
 */
export function useIsMounted() {
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return useCallback(() => mountedRef.current, [])
} 