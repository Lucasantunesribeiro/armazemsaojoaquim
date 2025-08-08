'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
}

interface PerformanceContextType {
  metrics: PerformanceMetrics
  isLoading: boolean
  reportVitals: (metric: any) => void
  prefetchRoute: (href: string) => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

interface PerformanceProviderProps {
  children: React.ReactNode
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isLoading, setIsLoading] = useState(false)
  const [prefetchedRoutes] = useState(new Set<string>())

  useEffect(() => {
    // Configurar observer para Core Web Vitals
    if (typeof window !== 'undefined') {
      // Observar LCP (Largest Contentful Paint)
      observeLCP((lcp) => {
        setMetrics(prev => ({ ...prev, lcp }))
      })

      // Observar FID (First Input Delay)
      observeFID((fid) => {
        setMetrics(prev => ({ ...prev, fid }))
      })

      // Observar CLS (Cumulative Layout Shift)
      observeCLS((cls) => {
        setMetrics(prev => ({ ...prev, cls }))
      })

      // Observar FCP (First Contentful Paint)
      observeFCP((fcp) => {
        setMetrics(prev => ({ ...prev, fcp }))
      })

      // Observar TTFB (Time to First Byte)
      observeTTFB((ttfb) => {
        setMetrics(prev => ({ ...prev, ttfb }))
      })

      // Preload recursos críticos
      preloadCriticalResources()
    }
  }, [])

  const reportVitals = (metric: any) => {
    console.log('Web Vital:', metric)
    
    // Enviar métricas para analytics (exemplo)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }
  }

  const prefetchRoute = (href: string) => {
    if (prefetchedRoutes.has(href)) return
    
    prefetchedRoutes.add(href)
    
    // Prefetch usando Next.js router
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    }
  }

  return (
    <PerformanceContext.Provider
      value={{
        metrics,
        isLoading,
        reportVitals,
        prefetchRoute
      }}
    >
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Funções utilitárias para observar Web Vitals
function observeLCP(callback: (lcp: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        callback(lastEntry.startTime)
      }
    })
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      console.warn('LCP observation not supported')
    }
  }
}

function observeFID(callback: (fid: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          callback(entry.processingStart - entry.startTime)
        }
      })
    })
    
    try {
      observer.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      console.warn('FID observation not supported')
    }
  }
}

function observeCLS(callback: (cls: number) => void) {
  if ('PerformanceObserver' in window) {
    let clsValue = 0
    
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      callback(clsValue)
    })
    
    try {
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      console.warn('CLS observation not supported')
    }
  }
}

function observeFCP(callback: (fcp: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          callback(entry.startTime)
        }
      })
    })
    
    try {
      observer.observe({ entryTypes: ['paint'] })
    } catch (e) {
      console.warn('FCP observation not supported')
    }
  }
}

function observeTTFB(callback: (ttfb: number) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry: any) => {
        if (entry.responseStart && entry.requestStart) {
          callback(entry.responseStart - entry.requestStart)
        }
      })
    })
    
    try {
      observer.observe({ entryTypes: ['navigation'] })
    } catch (e) {
      console.warn('TTFB observation not supported')
    }
  }
}

function preloadCriticalResources() {
  // Preload fontes críticas
  const criticalFonts = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-latin.woff2'
  ]

  criticalFonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = font
    document.head.appendChild(link)
  })

  // Preload imagens críticas
  const criticalImages = [
    '/images/hero-bg.webp',
    '/images/logo.webp'
  ]

  criticalImages.forEach(image => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = image
    document.head.appendChild(link)
  })
}

// Hook para lazy loading de componentes
export function useLazyComponent<T>(
  importFunc: () => Promise<{ default: T }>,
  deps: any[] = []
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    
    setLoading(true)
    setError(null)

    importFunc()
      .then((module) => {
        if (isMounted) {
          setComponent(module.default)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err)
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, deps)

  return { Component, loading, error }
}

// Hook para intersection observer
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(callback, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      })
      setObserver(obs)

      return () => {
        obs.disconnect()
      }
    }
  }, [callback, options])

  const observe = (element: Element) => {
    if (observer) {
      observer.observe(element)
    }
  }

  const unobserve = (element: Element) => {
    if (observer) {
      observer.unobserve(element)
    }
  }

  const disconnect = () => {
    if (observer) {
      observer.disconnect()
    }
  }

  return { observe, unobserve, disconnect }
}