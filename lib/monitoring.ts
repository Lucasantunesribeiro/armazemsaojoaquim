'use client'

import { ENV } from './config'

// Tipos para métricas
interface BusinessMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface ErrorMetric {
  message: string
  stack?: string
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  userId?: string
  sessionId?: string
}

// Classe principal de monitoramento
class MonitoringService {
  private businessMetrics: BusinessMetric[] = []
  private performanceMetrics: PerformanceMetric[] = []
  private errorMetrics: ErrorMetric[] = []
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeMonitoring()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return

    // Monitorar Core Web Vitals
    this.observeWebVitals()
    
    // Monitorar erros globais
    this.setupErrorTracking()
    
    // Monitorar performance de navegação
    this.trackNavigationTiming()
    
    // Monitorar interações do usuário
    this.trackUserInteractions()
    
    // Enviar métricas periodicamente
    this.startPeriodicReporting()
  }

  // Observar Core Web Vitals
  private observeWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry as any
          this.trackPerformanceMetric({
            name: 'LCP',
            value: lcp.startTime,
            rating: lcp.startTime <= 2500 ? 'good' : lcp.startTime <= 4000 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry as any
          this.trackPerformanceMetric({
            name: 'FID',
            value: fid.processingStart - fid.startTime,
            rating: fid.processingStart - fid.startTime <= 100 ? 'good' : 
                   fid.processingStart - fid.startTime <= 300 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })
        }
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const cls = entry as any
          if (!cls.hadRecentInput) {
            clsValue += cls.value
            this.trackPerformanceMetric({
              name: 'CLS',
              value: clsValue,
              rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
              timestamp: Date.now()
            })
          }
        }
      }).observe({ entryTypes: ['layout-shift'] })

    } catch (error) {
      console.warn('Web Vitals monitoring not supported:', error)
    }
  }

  // Configurar rastreamento de erros
  private setupErrorTracking() {
    if (typeof window === 'undefined') return

    // Erros JavaScript
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        component: 'Global',
        severity: 'high',
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      })
    })

    // Promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        component: 'Global',
        severity: 'high',
        timestamp: Date.now(),
        userId: this.userId,
        sessionId: this.sessionId
      })
    })
  }

  // Rastrear timing de navegação
  private trackNavigationTiming() {
    if (typeof window === 'undefined' || !('performance' in window)) return

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          // Time to First Byte
          const ttfb = navigation.responseStart - navigation.fetchStart
          this.trackPerformanceMetric({
            name: 'TTFB',
            value: ttfb,
            rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })

          // DOM Content Loaded
          const dcl = navigation.domContentLoadedEventEnd - navigation.fetchStart
          this.trackPerformanceMetric({
            name: 'DCL',
            value: dcl,
            rating: dcl <= 1600 ? 'good' : dcl <= 2400 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })

          // Load Complete
          const loadComplete = navigation.loadEventEnd - navigation.fetchStart
          this.trackPerformanceMetric({
            name: 'Load',
            value: loadComplete,
            rating: loadComplete <= 2500 ? 'good' : loadComplete <= 4000 ? 'needs-improvement' : 'poor',
            timestamp: Date.now()
          })
        }
      }, 0)
    })
  }

  // Rastrear interações do usuário
  private trackUserInteractions() {
    if (typeof window === 'undefined') return

    // Cliques em elementos importantes
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      
      // Rastrear cliques em botões de reserva
      if (target.closest('[data-track="reservation-button"]')) {
        this.trackBusinessMetric({
          name: 'reservation_button_click',
          value: 1,
          timestamp: Date.now(),
          metadata: {
            buttonText: target.textContent,
            page: window.location.pathname
          }
        })
      }

      // Rastrear cliques em menu
      if (target.closest('[data-track="menu-item"]')) {
        this.trackBusinessMetric({
          name: 'menu_item_click',
          value: 1,
          timestamp: Date.now(),
          metadata: {
            itemName: target.textContent,
            page: window.location.pathname
          }
        })
      }
    })

    // Rastrear scroll depth
    let maxScrollDepth = 0
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      )
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Marcos importantes
        if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
          this.trackBusinessMetric({
            name: 'scroll_depth',
            value: scrollDepth,
            timestamp: Date.now(),
            metadata: {
              page: window.location.pathname
            }
          })
        }
      }
    }

    window.addEventListener('scroll', trackScrollDepth, { passive: true })
  }

  // Relatórios periódicos
  private startPeriodicReporting() {
    if (typeof window === 'undefined') return

    // Enviar métricas a cada 30 segundos
    setInterval(() => {
      this.sendMetricsToServer()
    }, 30000)

    // Enviar métricas antes de sair da página
    window.addEventListener('beforeunload', () => {
      this.sendMetricsToServer(true)
    })

    // Enviar métricas quando a página fica oculta
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendMetricsToServer(true)
      }
    })
  }

  // Métodos públicos para rastreamento
  public trackBusinessMetric(metric: BusinessMetric) {
    this.businessMetrics.push(metric)
    
    if (ENV.IS_DEVELOPMENT) {
      console.log('📊 Business Metric:', metric)
    }
  }

  public trackPerformanceMetric(metric: PerformanceMetric) {
    this.performanceMetrics.push(metric)
    
    if (ENV.IS_DEVELOPMENT) {
      console.log('⚡ Performance Metric:', metric)
    }
  }

  public trackError(error: ErrorMetric) {
    this.errorMetrics.push(error)
    
    if (ENV.IS_DEVELOPMENT) {
      console.error('🚨 Error Metric:', error)
    }
  }

  public setUserId(userId: string) {
    this.userId = userId
  }

  // Rastrear eventos específicos do negócio
  public trackReservationAttempt(data: { date: string; time: string; guests: number }) {
    this.trackBusinessMetric({
      name: 'reservation_attempt',
      value: 1,
      timestamp: Date.now(),
      metadata: data
    })
  }

  public trackReservationSuccess(data: { reservationId: string; date: string; time: string; guests: number }) {
    this.trackBusinessMetric({
      name: 'reservation_success',
      value: 1,
      timestamp: Date.now(),
      metadata: data
    })
  }

  public trackReservationError(error: string, data: any) {
    this.trackError({
      message: `Reservation Error: ${error}`,
      component: 'ReservationForm',
      severity: 'medium',
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    })
  }

  public trackMenuView(category?: string) {
    this.trackBusinessMetric({
      name: 'menu_view',
      value: 1,
      timestamp: Date.now(),
      metadata: { category }
    })
  }

  public trackContactFormSubmission() {
    this.trackBusinessMetric({
      name: 'contact_form_submission',
      value: 1,
      timestamp: Date.now()
    })
  }

  // Enviar métricas para o servidor
  private async sendMetricsToServer(isBeacon = false) {
    if (this.businessMetrics.length === 0 && 
        this.performanceMetrics.length === 0 && 
        this.errorMetrics.length === 0) {
      return
    }

    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      businessMetrics: [...this.businessMetrics],
      performanceMetrics: [...this.performanceMetrics],
      errorMetrics: [...this.errorMetrics]
    }

    try {
      if (isBeacon && 'sendBeacon' in navigator) {
        // Usar sendBeacon para envios críticos (beforeunload)
        navigator.sendBeacon('/api/analytics', JSON.stringify(payload))
      } else {
        // Envio normal
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }

      // Limpar métricas enviadas
      this.businessMetrics = []
      this.performanceMetrics = []
      this.errorMetrics = []

    } catch (error) {
      console.warn('Failed to send metrics:', error)
    }
  }

  // Obter estatísticas atuais
  public getStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      businessMetrics: this.businessMetrics.length,
      performanceMetrics: this.performanceMetrics.length,
      errorMetrics: this.errorMetrics.length
    }
  }
}

// Instância singleton
let monitoringService: MonitoringService | null = null

export function getMonitoringService(): MonitoringService {
  if (!monitoringService) {
    monitoringService = new MonitoringService()
  }
  return monitoringService
}

// Hooks para uso em componentes React
export function useMonitoring() {
  const monitoring = getMonitoringService()
  
  return {
    trackBusinessMetric: monitoring.trackBusinessMetric.bind(monitoring),
    trackPerformanceMetric: monitoring.trackPerformanceMetric.bind(monitoring),
    trackError: monitoring.trackError.bind(monitoring),
    trackReservationAttempt: monitoring.trackReservationAttempt.bind(monitoring),
    trackReservationSuccess: monitoring.trackReservationSuccess.bind(monitoring),
    trackReservationError: monitoring.trackReservationError.bind(monitoring),
    trackMenuView: monitoring.trackMenuView.bind(monitoring),
    trackContactFormSubmission: monitoring.trackContactFormSubmission.bind(monitoring),
    setUserId: monitoring.setUserId.bind(monitoring),
    getStats: monitoring.getStats.bind(monitoring)
  }
}

// Funções utilitárias para rastreamento rápido
export const track = {
  reservationAttempt: (data: { date: string; time: string; guests: number }) => 
    getMonitoringService().trackReservationAttempt(data),
  
  reservationSuccess: (data: { reservationId: string; date: string; time: string; guests: number }) => 
    getMonitoringService().trackReservationSuccess(data),
  
  reservationError: (error: string, data: any) => 
    getMonitoringService().trackReservationError(error, data),
  
  menuView: (category?: string) => 
    getMonitoringService().trackMenuView(category),
  
  contactForm: () => 
    getMonitoringService().trackContactFormSubmission(),
  
  error: (message: string, component: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') =>
    getMonitoringService().trackError({
      message,
      component,
      severity,
      timestamp: Date.now(),
      sessionId: getMonitoringService().getStats().sessionId
    })
}

export default getMonitoringService 