'use client'

import { useEffect, useCallback, useRef, useState } from 'react'

// Performance optimization hook
export function useOptimization() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef<HTMLElement | null>(null)

  // Intersection Observer for lazy loading
  const observeIntersection = useCallback((callback: () => void) => {
    if (typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Preload critical images
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }, [])

  // Preload multiple images
  const preloadImages = useCallback(async (images: string[]) => {
    try {
      await Promise.all(images.map(preloadImage))
      setIsLoaded(true)
    } catch (error) {
      console.warn('Image preload failed:', error)
      setIsLoaded(true) // Continue even if some images fail
    }
  }, [preloadImage])

  // Lazy load component
  const lazyLoad = useCallback((callback: () => void) => {
    observeIntersection(() => {
      setIsVisible(true)
      callback()
    })
  }, [observeIntersection])

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let timeoutId: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }) as T
  }, [])

  // Throttle function for scroll events
  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let isThrottled = false
    return ((...args: any[]) => {
      if (!isThrottled) {
        func(...args)
        isThrottled = true
        setTimeout(() => {
          isThrottled = false
        }, delay)
      }
    }) as T
  }, [])

  // Optimize font loading
  const optimizeFontLoading = useCallback(() => {
    if (typeof document === 'undefined') return

    // Create font face observer for better font loading
    const fontFaces = [
      new FontFace('Inter', 'url(/fonts/inter-variable.woff2)', {
        display: 'swap',
        weight: '300 700',
      }),
      new FontFace('Playfair Display', 'url(/fonts/playfair-display-variable.woff2)', {
        display: 'swap',
        weight: '400 700',
      }),
    ]

    Promise.all(
      fontFaces.map(font => font.load())
    ).then(loadedFonts => {
      loadedFonts.forEach(font => {
        document.fonts.add(font)
      })
    }).catch(error => {
      console.warn('Font loading failed:', error)
    })
  }, [])

  // Memory optimization
  const optimizeMemory = useCallback(() => {
    // Clean up unused images
    const cleanupImages = () => {
      const images = document.querySelectorAll('img[data-cleanup="true"]')
      images.forEach(img => {
        if (img instanceof HTMLImageElement) {
          img.src = ''
        }
      })
    }

    // Run cleanup on page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cleanupImages()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Critical resource hints
  const addResourceHints = useCallback((resources: { href: string; as: string; type?: string }[]) => {
    if (typeof document === 'undefined') return

    resources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      if (resource.type) {
        link.type = resource.type
      }
      document.head.appendChild(link)
    })
  }, [])

  return {
    elementRef,
    isVisible,
    isLoaded,
    preloadImages,
    lazyLoad,
    debounce,
    throttle,
    optimizeFontLoading,
    optimizeMemory,
    addResourceHints,
  }
}

// Image optimization utilities
export function getOptimizedImageSrc(
  src: string,
  width?: number,
  quality?: number
): string {
  if (!src) return ''
  
  // For external CDN optimization (can be adapted for different services)
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (quality) params.set('q', quality.toString())
  
  // Auto format selection
  params.set('f', 'auto')
  
  return `${src}?${params.toString()}`
}

// WebP support detection
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5
}

// Critical CSS injection
export function injectCriticalCSS(css: string): void {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = css
  style.id = 'critical-css'
  document.head.appendChild(style)
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void): void {
  if (typeof performance === 'undefined') return
  
  const startTime = performance.now()
  fn()
  const endTime = performance.now()
  
  console.log(`${name} took ${endTime - startTime} milliseconds`)
} 