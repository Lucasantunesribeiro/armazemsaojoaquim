'use client'

import React from 'react'

// Core Web Vitals monitoring
interface PerformanceMetrics {
  fcp?: number  // First Contentful Paint
  lcp?: number  // Largest Contentful Paint
  fid?: number  // First Input Delay
  cls?: number  // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    // Monitor FCP and LCP
    this.observePaintMetrics()
    
    // Monitor FID
    this.observeInputDelay()
    
    // Monitor CLS
    this.observeLayoutShift()
    
    // Monitor TTFB
    this.observeNavigationTiming()
  }

  private observePaintMetrics() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
          }
          if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.lcp = entry.startTime
          }
        }
      })
      
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Paint metrics observation not supported:', error)
    }
  }

  private observeInputDelay() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Type assertion for first-input entries which have processingStart
          const firstInputEntry = entry as any
          if (firstInputEntry.processingStart && entry.startTime) {
            this.metrics.fid = firstInputEntry.processingStart - entry.startTime
          }
        }
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Input delay observation not supported:', error)
    }
  }

  private observeLayoutShift() {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.metrics.cls = clsValue
          }
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Layout shift observation not supported:', error)
    }
  }

  private observeNavigationTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('Navigation timing observation not supported:', error)
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics')
      console.log('FCP (First Contentful Paint):', this.metrics.fcp?.toFixed(2), 'ms')
      console.log('LCP (Largest Contentful Paint):', this.metrics.lcp?.toFixed(2), 'ms')
      console.log('FID (First Input Delay):', this.metrics.fid?.toFixed(2), 'ms')
      console.log('CLS (Cumulative Layout Shift):', this.metrics.cls?.toFixed(4))
      console.log('TTFB (Time to First Byte):', this.metrics.ttfb?.toFixed(2), 'ms')
      console.groupEnd()
    }
  }

  public sendMetrics() {
    // In a real app, you would send these to your analytics service
    // For now, we'll just log them in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        this.logMetrics()
      }, 5000) // Wait 5 seconds for metrics to be collected
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

// Hook for React components
export const usePerformanceMonitor = () => {
  const monitor = getPerformanceMonitor()
  
  React.useEffect(() => {
    monitor.sendMetrics()
    
    return () => {
      monitor.disconnect()
    }
  }, [monitor])
  
  return {
    getMetrics: () => monitor.getMetrics(),
    logMetrics: () => monitor.logMetrics()
  }
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  getPerformanceMonitor()
}