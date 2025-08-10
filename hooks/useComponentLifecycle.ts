'use client'

import { useEffect, useRef } from 'react'

/**
 * Debug hook para monitorar lifecycle de componentes
 * Útil para identificar padrões de unmounting problemáticos
 */
export const useComponentLifecycle = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now())
  const renderCountRef = useRef<number>(0)

  useEffect(() => {
    const mountTime = mountTimeRef.current
    renderCountRef.current += 1

    console.log(`🟢 [${componentName}] Mounted (render #${renderCountRef.current})`, {
      mountTime: new Date(mountTime).toISOString(),
      timeSinceMount: Date.now() - mountTime
    })

    return () => {
      const lifetimeMs = Date.now() - mountTime
      console.log(`🔴 [${componentName}] Unmounted (render #${renderCountRef.current})`, {
        lifetimeMs,
        lifetimeSecs: (lifetimeMs / 1000).toFixed(2),
        wasShortLived: lifetimeMs < 1000
      })
    }
  }, [componentName])

  return {
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current
  }
}

/**
 * Hook para detectar re-renders excessivos
 */
export const useRenderCounter = (componentName: string, threshold: number = 5) => {
  const renderCountRef = useRef<number>(0)
  const lastLogRef = useRef<number>(Date.now())

  renderCountRef.current += 1

  // Log a cada threshold renders ou a cada 2 segundos
  const now = Date.now()
  if (renderCountRef.current >= threshold || (now - lastLogRef.current) > 2000) {
    console.log(`🔄 [${componentName}] Render count: ${renderCountRef.current}`, {
      renders: renderCountRef.current,
      timeSinceLastLog: now - lastLogRef.current
    })
    lastLogRef.current = now
  }

  return renderCountRef.current
}

/**
 * Hook para detectar re-renders causados por props/state changes
 */
export const useWhyDidYouUpdate = (componentName: string, props: Record<string, any>) => {
  const previousPropsRef = useRef<Record<string, any>>()

  useEffect(() => {
    if (previousPropsRef.current) {
      const changedProps: Record<string, { from: any; to: any }> = {}
      
      // Check what changed
      Object.keys(props).forEach(key => {
        if (props[key] !== previousPropsRef.current![key]) {
          changedProps[key] = {
            from: previousPropsRef.current![key],
            to: props[key]
          }
        }
      })

      if (Object.keys(changedProps).length > 0) {
        console.log(`🔍 [${componentName}] Props changed:`, changedProps)
      }
    }

    previousPropsRef.current = props
  })
}