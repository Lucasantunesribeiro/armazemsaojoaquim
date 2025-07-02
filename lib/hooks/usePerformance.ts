'use client'

import { useEffect, useCallback, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number
}

interface ResourceTiming {
  name: string
  duration: number
  size: number
  type: string
}

interface UserInteraction {
  type: string
  element: string
  timestamp: number
  duration?: number
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})
  const [resources, setResources] = useState<ResourceTiming[]>([])
  const [interactions, setInteractions] = useState<UserInteraction[]>([])
  const [connectionInfo, setConnectionInfo] = useState<any>(null)

  // Coletar métricas de performance
  const collectMetrics = useCallback(() => {
    if (typeof window === 'undefined') return

    // Performance Observer para Web Vitals
    const observeWebVitals = () => {
      try {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({
                ...prev,
                firstContentfulPaint: entry.startTime
              }))
            }
          }
        }).observe({ entryTypes: ['paint'] })

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            setMetrics(prev => ({
              ...prev,
              largestContentfulPaint: lastEntry.startTime
            }))
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          for (const entry of entries) {
            setMetrics(prev => ({
              ...prev,
              firstInputDelay: (entry as any).processingStart - entry.startTime
            }))
          }
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
              setMetrics(prev => ({
                ...prev,
                cumulativeLayoutShift: clsValue
              }))
            }
          }
        }).observe({ entryTypes: ['layout-shift'] })

      } catch (error) {
        console.warn('[Performance] Observer not supported:', error)
      }
    }

    // Navigation Timing
    const collectNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const timeToInteractive = navigation.domInteractive - navigation.fetchStart

        setMetrics(prev => ({
          ...prev,
          loadTime,
          timeToInteractive
        }))
      }
    }

    // Resource Timing
    const collectResourceTiming = () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const resourceData = resourceEntries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: (entry as any).transferSize || 0,
        type: getResourceType(entry.name)
      }))

      setResources(resourceData)
    }

    // Connection Information
    const collectConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }
    }

    observeWebVitals()
    collectNavigationTiming()
    collectResourceTiming()
    collectConnectionInfo()

    // Coletar métricas adicionais após load completo
    window.addEventListener('load', () => {
      setTimeout(() => {
        collectNavigationTiming()
        collectResourceTiming()
      }, 1000)
    })

  }, [])

  // Rastrear interações do usuário
  const trackInteraction = useCallback((type: string, element: string) => {
    const interaction: UserInteraction = {
      type,
      element,
      timestamp: Date.now()
    }

    setInteractions(prev => [...prev.slice(-99), interaction]) // Manter últimas 100 interações
  }, [])

  // Rastrear cliques
  const trackClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement
    const element = target.tagName.toLowerCase() + 
                   (target.id ? `#${target.id}` : '') +
                   (target.className ? `.${target.className.split(' ').join('.')}` : '')
    
    trackInteraction('click', element)
  }, [trackInteraction])

  // Rastrear tempo em página
  const trackPageView = useCallback((path: string) => {
    const startTime = Date.now()
    
    return () => {
      const duration = Date.now() - startTime
      trackInteraction('pageview', path)
      
      // Enviar dados de analytics se configurado
      sendAnalytics({
        type: 'pageview',
        path,
        duration,
        metrics: metrics,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight
        } : { width: 0, height: 0 },
        connection: connectionInfo
      })
    }
  }, [trackInteraction, metrics, connectionInfo])

  // Detectar slow pages
  const detectSlowPages = useCallback(() => {
    if (metrics.loadTime && metrics.loadTime > 3000) {
      console.warn('[Performance] Slow page detected:', {
        loadTime: metrics.loadTime,
        path: window.location.pathname
      })
      
      // Reportar página lenta
      sendAnalytics({
        type: 'slow_page',
        loadTime: metrics.loadTime,
        path: window.location.pathname,
        metrics
      })
    }
  }, [metrics])

  // Monitorar erros JavaScript
  const trackErrors = useCallback(() => {
    window.addEventListener('error', (event) => {
      sendAnalytics({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      sendAnalytics({
        type: 'promise_rejection',
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      })
    })
  }, [])

  // Monitorar mudanças de conexão
  const trackConnectionChanges = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      connection.addEventListener('change', () => {
        const newConnectionInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
        
        setConnectionInfo(newConnectionInfo)
        
        sendAnalytics({
          type: 'connection_change',
          connection: newConnectionInfo
        })
      })
    }
  }, [])

  // Inicializar monitoramento
  useEffect(() => {
    collectMetrics()
    trackErrors()
    trackConnectionChanges()

    // Adicionar listeners para interações
    document.addEventListener('click', trackClick)

    // Limpar listeners
    return () => {
      document.removeEventListener('click', trackClick)
    }
  }, [collectMetrics, trackClick, trackErrors, trackConnectionChanges])

  // Detectar páginas lentas
  useEffect(() => {
    if (metrics.loadTime) {
      detectSlowPages()
    }
  }, [metrics.loadTime, detectSlowPages])

  return {
    metrics,
    resources,
    interactions,
    connectionInfo,
    trackInteraction,
    trackPageView,
    // Utilitários para componentes
    measureComponent: (name: string) => {
      const startTime = performance.now()
      return () => {
        const duration = performance.now() - startTime
        console.log(`[Performance] Component ${name} render time: ${duration.toFixed(2)}ms`)
      }
    }
  }
}

// Utilitários
function getResourceType(url: string): string {
  if (url.includes('.css')) return 'stylesheet'
  if (url.includes('.js')) return 'script'
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image'
  if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
  if (url.includes('/api/')) return 'api'
  return 'other'
}

// Enviar dados de analytics (implementar integração real)
async function sendAnalytics(data: any) {
  try {
    // Desenvolvimento: apenas log
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', data)
      return
    }

    // Produção: enviar para serviço de analytics
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })

  } catch (error) {
    console.error('[Analytics] Failed to send data:', error)
  }
}

// Hook para performance de componentes individuais
export function useComponentPerformance(componentName: string) {
  const [renderTime, setRenderTime] = useState<number>(0)

  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      setRenderTime(duration)
      
      if (duration > 100) { // Componente lento
        console.warn(`[Performance] Slow component ${componentName}: ${duration.toFixed(2)}ms`)
      }
    }
  })

  return { renderTime }
}

// Hook para lazy loading otimizado
export function useLazyLoading(threshold = 0.1) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold }
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [ref, threshold])

  return [setRef, isIntersecting] as const
} 