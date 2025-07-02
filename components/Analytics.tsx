'use client'

import { useEffect, useRef } from 'react'
import { ENV } from '../lib/config'

interface WebVitalMetric {
  name: string
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Analytics configuration
const ANALYTICS_ID = ENV.GA_ID
const DEBUG_MODE = ENV.IS_DEVELOPMENT

// Track Web Vitals
function sendToAnalytics(metric: WebVitalMetric) {
  // Log in development
  if (DEBUG_MODE) {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`)
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      rating: metric.rating,
      non_interaction: true,
    })
  }
}

// Observe performance metrics - versão simplificada
function observePerformance() {
  // Custom performance measurements usando PerformanceObserver
  if (typeof window !== 'undefined' && 'performance' in window && 'PerformanceObserver' in window) {
    // Time to Interactive (TTI) approximation
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name === 'custom-tti') {
          sendToAnalytics({
            name: 'TTI',
            value: entry.duration,
            id: `tti-${Date.now()}`,
            rating: entry.duration < 3800 ? 'good' : entry.duration < 7300 ? 'needs-improvement' : 'poor'
          })
        }
      }
    })
    
    try {
      observer.observe({ entryTypes: ['measure'] })
    } catch (e) {
      console.warn('PerformanceObserver não suportado:', e)
    }

    // Mark TTI when page becomes interactive
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          performance.mark('custom-tti-start')
          performance.mark('custom-tti-end')
          performance.measure('custom-tti', 'custom-tti-start', 'custom-tti-end')
        } catch (e) {
          console.warn('Performance API não suportada:', e)
        }
      }, 0)
    })
  }
}

// Track user interactions
export function trackInteraction(element: string, action: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      event_label: element,
      value: value,
    })
  }
}

// Track errors
export function trackError(error: Error, errorInfo?: any) {
  console.error('Application error:', error, errorInfo)
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      error_component: errorInfo?.componentStack || 'unknown',
    })
  }

  // Send to error tracking service (disabled for now)
  // if (typeof window !== 'undefined') {
  //   fetch('/api/errors', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       message: error.message,
  //       stack: error.stack,
  //       errorInfo,
  //       url: window.location.href,
  //       userAgent: navigator.userAgent,
  //       timestamp: Date.now(),
  //     }),
  //   }).catch(console.error)
  // }
}

export default function Analytics() {
  useEffect(() => {
    // Initialize performance monitoring
    observePerformance()

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view_visibility', {
          event_category: 'User Engagement',
          visibility_state: document.visibilityState,
        })
      }
    }

    // Track scroll depth
    let maxScrollDepth = 0
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      )
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90].includes(scrollDepth)) {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'scroll', {
              event_category: 'User Engagement',
              value: scrollDepth,
            })
          }
        }
      }
    }

    // Error tracking
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error('Unhandled Promise Rejection'), {
        reason: event.reason,
      })
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Only render Google Analytics script in production
  if (!ANALYTICS_ID || DEBUG_MODE) {
    return null
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${ANALYTICS_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          `,
        }}
      />
    </>
  )
} 