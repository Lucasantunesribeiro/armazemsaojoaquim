// Otimizado para produção - Correção erro 500 Netlify
'use client'

interface PerformanceMetrics {
  fcp?: number
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    // Apenas inicializar no browser e em desenvolvimento
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    try {
      // Versão simplificada apenas para desenvolvimento
      if ('PerformanceObserver' in window) {
        this.observePaintMetrics()
      }
    } catch (error) {
      // Silenciar erros em produção
    }
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch {
      // Silenciar erros
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public logMetrics() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🚀 FCP:', this.metrics.fcp?.toFixed(2), 'ms')
    }
  }

  public sendMetrics() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      setTimeout(() => this.logMetrics(), 2000)
    }
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

export const usePerformanceMonitor = () => {
  const monitor = getPerformanceMonitor()
  
  if (typeof window !== 'undefined') {
    monitor.sendMetrics()
  }
  
  return {
    getMetrics: () => monitor.getMetrics(),
    logMetrics: () => monitor.logMetrics()
  }
}

// Não auto-inicializar em produção
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  getPerformanceMonitor()
}