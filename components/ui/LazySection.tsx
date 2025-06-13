'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
  delay?: number
}

const LazySection = ({ 
  children, 
  className = '', 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = null,
  delay = 0
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          if (delay > 0) {
            setTimeout(() => {
              setShouldRender(true)
            }, delay)
          } else {
            setShouldRender(true)
          }
          
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, delay])

  return (
    <div 
      ref={ref} 
      className={`transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {shouldRender ? children : fallback}
    </div>
  )
}

export default LazySection 