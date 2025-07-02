import { useEffect, useCallback } from 'react'
import { useSupabase } from '../../components/providers/SupabaseProvider'

// Tipos para eventos de analytics
interface ReservationEvent {
  action: 'reservation_started' | 'reservation_completed' | 'reservation_cancelled' | 'reservation_confirmed'
  reservationId?: string
  date?: string
  time?: string
  guests?: number
  duration?: number
}

interface PageViewEvent {
  page: string
  title: string
  referrer?: string
  duration?: number
}

interface UserInteractionEvent {
  action: 'button_click' | 'form_submit' | 'menu_view' | 'blog_read' | 'contact_form'
  element: string
  category: string
  value?: number
}

interface BusinessEvent {
  action: 'menu_item_viewed' | 'availability_checked' | 'newsletter_signup' | 'contact_submitted'
  details?: any
}

// Types já declarados em types/global.d.ts

export function useAnalytics() {
  const { user } = useSupabase()

  // Generate session ID
  const generateSessionId = useCallback(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }, [])

  // Função auxiliar para tracking customizado
  const trackCustomEvent = useCallback(async (eventType: string, data: any) => {
    try {
      // Enviar para endpoint interno de analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          timestamp: new Date().toISOString(),
          sessionId: typeof window !== 'undefined' ? (sessionStorage.getItem('session_id') || generateSessionId()) : 'server',
          userId: user?.id,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          properties: {
            ...data,
            user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
            page_url: typeof window !== 'undefined' ? window.location.href : ''
          }
        })
      })
    } catch (error) {
      console.error('Erro ao enviar evento de analytics:', error)
    }
  }, [generateSessionId, user?.id])

  // Configurar Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Configurar user ID se disponível
      if (user?.id && process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          user_id: user.id,
          custom_map: {
            custom_1: 'user_type'
          }
        })
      }
    }
  }, [user])

  // Track page views
  const trackPageView = useCallback((path: string, title?: string) => {
    if (typeof window === 'undefined') return
    
    trackCustomEvent('page_view', {
      page_path: path,
      page_title: title || document.title,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      session_id: sessionStorage.getItem('session_id') || generateSessionId()
    })
  }, [trackCustomEvent, generateSessionId])

  // Track reservation events
  const trackReservation = useCallback((event: ReservationEvent) => {
    const eventData = {
      event_category: 'Reservations',
      event_label: event.action,
      value: event.guests || 1,
      custom_parameter_1: event.date,
      custom_parameter_2: event.time,
      user_id: user?.id
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, eventData)
    }

    // Eventos específicos de negócio
    switch (event.action) {
      case 'reservation_started':
        trackCustomEvent('reservation_flow_started', {
          date: event.date,
          time: event.time,
          guests: event.guests,
          user_id: user?.id
        })
        break
      
      case 'reservation_completed':
        trackCustomEvent('reservation_completed', {
          reservation_id: event.reservationId,
          date: event.date,
          time: event.time,
          guests: event.guests,
          duration: event.duration,
          user_id: user?.id
        })
        break
      
      case 'reservation_confirmed':
        trackCustomEvent('reservation_confirmed', {
          reservation_id: event.reservationId,
          user_id: user?.id
        })
        break
    }
  }, [user?.id, trackCustomEvent])

  // Track user interactions
  const trackInteraction = useCallback((event: UserInteractionEvent) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.element,
        value: event.value,
        user_id: user?.id
      })
    }

    trackCustomEvent('user_interaction', {
      action: event.action,
      element: event.element,
      category: event.category,
      value: event.value,
      user_id: user?.id
    })
  }, [user?.id, trackCustomEvent])

  // Track business events
  const trackBusinessEvent = useCallback((event: BusinessEvent) => {
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: 'Business',
        user_id: user?.id,
        ...event.details
      })
    }

    trackCustomEvent('business_event', {
      action: event.action,
      details: event.details,
      user_id: user?.id
    })
  }, [user?.id, trackCustomEvent])

  // Track conversion events
  const trackConversion = useCallback((type: string, value?: number, currency?: string) => {
    trackCustomEvent('conversion', {
      conversion_type: type,
      value,
      currency: currency || 'BRL',
      timestamp: Date.now(),
      session_id: typeof window !== 'undefined' ? (sessionStorage.getItem('session_id') || generateSessionId()) : 'server'
    })
  }, [trackCustomEvent, generateSessionId])

  // Track errors
  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    trackCustomEvent('error', { error, ...context })
  }, [trackCustomEvent])

  // Track performance metrics
  const trackPerformance = useCallback((metric: string, value: number, context?: Record<string, any>) => {
    trackCustomEvent('performance', { metric, value, ...context })
  }, [trackCustomEvent])

  // Track session start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionId = sessionStorage.getItem('session_id') || generateSessionId()
      
      trackCustomEvent('session_start', {
        session_id: sessionId,
        user_id: user?.id,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      })
    }
  }, [user?.id, generateSessionId, trackCustomEvent])

  // Utility functions for common tracking scenarios
  const trackMenuView = useCallback((category: string, itemName?: string) => {
    trackInteraction({
      action: 'menu_view',
      element: itemName || 'category',
      category: 'Menu',
      value: category === 'all' ? 0 : 1
    })
  }, [trackInteraction])

  const trackBlogRead = useCallback((slug: string, title: string, readTime?: number) => {
    trackInteraction({
      action: 'blog_read',
      element: slug,
      category: 'Blog',
      value: readTime
    })
  }, [trackInteraction])

  const trackContactForm = useCallback((formType: string) => {
    trackInteraction({
      action: 'contact_form',
      element: formType,
      category: 'Contact'
    })
  }, [trackInteraction])

  const trackAvailabilityCheck = useCallback((date: string, time: string, available: boolean) => {
    trackBusinessEvent({
      action: 'availability_checked',
      details: {
        date,
        time,
        available,
        check_timestamp: new Date().toISOString()
      }
    })
  }, [trackBusinessEvent])

  const trackUserAction = useCallback((action: string, details?: Record<string, any>) => {
    trackCustomEvent('user_action', { action, ...details })
  }, [trackCustomEvent])

  const trackEngagement = useCallback((type: string, duration?: number, context?: Record<string, any>) => {
    trackCustomEvent('engagement', { type, duration, ...context })
  }, [trackCustomEvent])

  const trackBusinessMetric = useCallback((metric: string, value: number, context?: Record<string, any>) => {
    trackCustomEvent('business_metric', { metric, value, ...context })
  }, [trackCustomEvent])

  const startSession = useCallback(() => {
    const sessionId = generateSessionId()
    trackCustomEvent('session_start', { sessionId })
    return sessionId
  }, [generateSessionId, trackCustomEvent])

  return {
    // Core tracking functions
    trackPageView,
    trackReservation,
    trackInteraction,
    trackBusinessEvent,
    trackConversion,
    trackError,
    trackPerformance,
    
    // Utility functions
    trackMenuView,
    trackBlogRead,
    trackContactForm,
    trackAvailabilityCheck,
    
    // Custom tracking
    trackCustomEvent,
    trackUserAction,
    trackEngagement,
    trackBusinessMetric,
    startSession
  }
} 