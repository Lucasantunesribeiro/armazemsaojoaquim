'use client'

import { useState, useEffect, useCallback } from 'react'

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Intersection Observer hook with better performance
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [elementRef, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Optimized scroll position hook
export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollY(window.scrollY)
    }, 16) // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

// Image loading optimization
export function useImageLoader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages(prev => new Set(prev).add(src))
  }, [])

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src)
  }, [loadedImages])

  return { handleImageLoad, isImageLoaded }
}

// Performance metrics tracking
export function trackPerformance() {
  if (typeof window === 'undefined') return

  // Track FCP, LCP, CLS, FID
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime)
      }
      if (entry.entryType === 'first-input') {
        console.log('FID:', (entry as any).processingStart - entry.startTime)
      }
      if (entry.entryType === 'layout-shift') {
        if (!(entry as any).hadRecentInput) {
          console.log('CLS:', (entry as any).value)
        }
      }
    }
  })

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

  // Track paint timing
  const paintEntries = performance.getEntriesByType('paint')
  paintEntries.forEach((entry) => {
    console.log(`${entry.name}:`, entry.startTime)
  })
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    const chunks = document.querySelectorAll('script[src*="/_next/static/chunks/"]')
    console.log(`Total JavaScript chunks: ${chunks.length}`)
    
    chunks.forEach((chunk) => {
      const src = (chunk as HTMLScriptElement).src
      console.log('Chunk:', src.split('/').pop())
    })
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    console.log('Memory usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    })
  }
}

// Optimize animations for low-end devices
export function shouldReduceMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Battery API optimization
export function isBatteryLow() {
  if (typeof window === 'undefined' || !('getBattery' in navigator)) return false
  
  return (navigator as any).getBattery().then((battery: any) => {
    return battery.level < 0.2 && !battery.charging
  }).catch(() => false)
}

// Network optimization
export function getNetworkSpeed() {
  if (typeof window === 'undefined' || !('connection' in navigator)) return 'unknown'
  
  const connection = (navigator as any).connection
  return connection.effectiveType || 'unknown'
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalImages = [
    '/images/armazem-fachada-historica.webp',
    '/images/logo-armazem.webp'
  ]

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}